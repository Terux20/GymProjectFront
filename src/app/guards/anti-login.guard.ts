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

  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (token && refreshToken) {
    authService.refreshToken().subscribe({
      next: () => {
        router.navigate(['/todayentries']);
        return false;
      },
      error: () => {
        return true;
      }
    });
    return false;
  }
  
  return true;
};