import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const antiLoginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    router.navigate(['/todayentries']); 
    return false;
  }

  // Token kontrolü yap
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (token && refreshToken) {
    // Token varsa ve auth service'de doğrulanırsa login'e erişimi engelle
    authService.refreshToken().subscribe({
      next: () => {
        router.navigate(['/todayentries']);
        return false;
      },
      error: () => {
        // Token yenileme başarısız olursa login'e izin ver
        return true;
      }
    });
    return false;
  }
  
  return true;
};