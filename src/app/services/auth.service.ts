// services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { TokenResponse } from '../models/refreshToken';
import { UserModel } from '../models/userModel';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BaseApiService } from './baseApiService';
import { LoginModel } from '../models/loginModel';
import { UserDevice } from '../models/userDevice';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends BaseApiService {
  private refreshTokenTimeout: any;
  private jwtHelper: JwtHelperService = new JwtHelperService();
  private currentUserSubject: BehaviorSubject<UserModel | null>;
  public currentUser: Observable<UserModel | null>;
  private refreshTokenInProgress = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private deviceInfo: string;
  
  constructor(private httpClient: HttpClient,private router:Router) {
    super();
    this.currentUserSubject = new BehaviorSubject<UserModel | null>(null);
    this.currentUser = this.currentUserSubject.asObservable();
    this.deviceInfo = this.getDeviceInfo();
    this.initializeFromStorage();
  }

  private getDeviceInfo(): string {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const screenResolution = `${window.screen.width}x${window.screen.height}`;
    const browserInfo = {
      userAgent,
      platform,
      screenResolution,
      timestamp: new Date().toISOString()
    };
    return JSON.stringify(browserInfo);
  }

  private initializeFromStorage() {
    const accessToken = localStorage.getItem('token');
    if (accessToken) {
      try {
        const decodedToken = this.jwtHelper.decodeToken(accessToken);
        this.currentUserSubject.next(new UserModel(decodedToken));
        this.startRefreshTokenTimer();
      } catch (error) {
        console.error('Token decode error:', error);
        this.logout();
      }
    }
  }

  login(loginModel: LoginModel): Observable<TokenResponse> {
    const loginRequest = {
      loginDto: loginModel,
      deviceInfo: this.deviceInfo
    };
  
    return this.httpClient
      .post<TokenResponse>(this.apiUrl + 'auth/login', loginRequest)
      .pipe(
        map((response) => {
          if (response.success && response.data) {
            const decodedToken = this.jwtHelper.decodeToken(response.data.token);
            this.currentUserSubject.next(new UserModel(decodedToken));
            this.setSession(response.data);
            this.startRefreshTokenTimer();
          }
          return response;
        }),
        catchError((error) => {
          if (error.error && typeof error.error === 'object') {
            return throwError(() => error.error);
          }
          return throwError(() => ({
            success: false,
            message: 'Bir hata oluştu'
          }));
        })
      );
  }

  refreshToken(): Observable<TokenResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return throwError(() => 'No refresh token found');
    }

    if (this.refreshTokenInProgress) {
      return new Observable(observer => {
        this.refreshTokenSubject.subscribe({
          next: token => {
            if (token) {
              observer.next(token);
              observer.complete();
            }
          },
          error: error => observer.error(error)
        });
      });
    }

    this.refreshTokenInProgress = true;

    return this.httpClient
      .post<TokenResponse>(
        this.apiUrl + 'auth/refresh-token',
        {
          refreshToken: refreshToken,
          deviceInfo: this.deviceInfo
        }
      )
      .pipe(
        map((response) => {
          this.refreshTokenInProgress = false;
          if (response.success && response.data) {
            this.setSession(response.data);
            this.refreshTokenSubject.next(response);
          } else {
            this.handleFailedRefresh(refreshToken);
          }
          return response;
        }),
        catchError((error) => {
          this.refreshTokenInProgress = false;
          this.refreshTokenSubject.error(error);
          this.handleFailedRefresh(refreshToken);
          return throwError(() => error);
        })
      );
  }

  private handleFailedRefresh(refreshToken: string) {
    this.httpClient
      .post(this.apiUrl + 'auth/revoke-token', { refreshToken })
      .subscribe({
        next: () => {
          this.clearSession();
          window.location.href = '/login';
        },
        error: () => {
          this.clearSession();
          window.location.href = '/login';
        }
      });
  }

  logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
        const headers = new HttpHeaders().set('X-Refresh-Token', refreshToken);
        // Önce session'ı temizle ve yönlendirmeyi yap, sonra token'ı revoke et
        this.clearSession();
        this.router.navigate(['/login']).then(() => {
            this.httpClient
                .post(
                    this.apiUrl + 'auth/logout',
                    {},
                    { headers: headers }
                )
                .subscribe({
                    error: (error) => console.error('Logout error:', error)
                });
        });
    } else {
        this.clearSession();
        this.router.navigate(['/login']);
    }
  }

  clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    this.currentUserSubject.next(null);
    this.stopRefreshTokenTimer();
  }

  getUserDevices(): Observable<UserDevice[]> {
    return this.httpClient.get<any>(this.apiUrl + 'auth/devices')
      .pipe(
        map(response => {
          if (response.success) {
            return response.data;
          }
          throw new Error(response.message);
        })
      );
  }

  revokeDevice(deviceId: number): Observable<any> {
    return this.httpClient.post(this.apiUrl + 'auth/revoke-device', { deviceId });
  }

  revokeAllDevices(): Observable<any> {
    return this.httpClient.post(this.apiUrl + 'auth/revoke-all-devices', {});
  }

  private setSession(tokenData: any) {
    if (tokenData && tokenData.token) {
      localStorage.setItem('token', tokenData.token);
      localStorage.setItem('refreshToken', tokenData.refreshToken);

      const decodedToken = this.jwtHelper.decodeToken(tokenData.token);
      this.currentUserSubject.next(new UserModel(decodedToken));
      this.startRefreshTokenTimer();
    }
  }

  private startRefreshTokenTimer() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const decodedToken = this.jwtHelper.decodeToken(token);
      const expires = new Date(decodedToken.exp * 1000);
      const timeout = expires.getTime() - Date.now() - (60 * 1000); // 1 dakika önce yenile
      
      this.stopRefreshTokenTimer();
      
      this.refreshTokenTimeout = setTimeout(() => {
        this.refreshToken().subscribe();
      }, Math.max(0, timeout));
    } catch (error) {
      console.error('Timer setup error:', error);
      this.logout();
    }
  }

  private stopRefreshTokenTimer() {
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
    }
  }

  public get currentUserValue(): UserModel | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      return !this.jwtHelper.isTokenExpired(token);
    } catch (error) {
      return false;
    }
  }

  hasRole(role: string | string[]): boolean {
    const user = this.currentUserValue;
    if (user && user.role) {
      if (Array.isArray(role)) {
        return role.some((r) => this.hasRole(r));
      }
      if (Array.isArray(user.role)) {
        return user.role.includes(role);
      }
      return user.role === role;
    }
    return false;
  }
}