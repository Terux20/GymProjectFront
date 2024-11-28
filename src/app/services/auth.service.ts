import { Injectable } from '@angular/core';
import { BaseApiService } from './baseApiService';
import { HttpClient } from '@angular/common/http';
import { LoginModel } from '../models/loginModel';
import { TokenModel } from '../models/tokenModel';
import { SingleResponseModel } from '../models/singleResponseModel';
import { Observable } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UserModel } from '../models/userModel';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends BaseApiService {
  private jwtHelper: JwtHelperService = new JwtHelperService();

  constructor(private httpClient: HttpClient) {
    super();
  }

  login(loginModel: LoginModel): Observable<SingleResponseModel<TokenModel>> {
    return this.httpClient
      .post<SingleResponseModel<TokenModel>>(
        this.apiUrl + 'auth/login',
        loginModel
      )
      .pipe(
        tap((response) => {
          if (response.data && response.data.token) {
            this.setToken(response.data.token);
          }
        })
      );
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token ? !this.jwtHelper.isTokenExpired(token) : false;
  }

  getUser(): UserModel | null {
    const token = this.getToken();
    if (token) {
      const decodedToken = this.jwtHelper.decodeToken(token);
      return new UserModel(decodedToken);
    }
    return null;
  }

  hasRole(role: string | string[]): boolean {
    const user = this.getUser();
    if (user && user.role) {
      if (Array.isArray(role)) {
        // If role is an array, check if the user has any of the roles
        return role.some(r => this.hasRole(r));
      }
      // If user.role is an array
      if (Array.isArray(user.role)) {
        return user.role.includes(role);
      }
      // If user.role is a string
      return user.role === role;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem('token');
  }
}