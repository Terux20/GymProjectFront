import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRoles = route.data['expectedRole'];

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  if (Array.isArray(expectedRoles)) {
    // Eğer expectedRoles bir dizi ise, kullanıcının bu rollerden herhangi birine sahip olup olmadığını kontrol et
    if (!expectedRoles.some(role => authService.hasRole(role))) {
      router.navigate(['/unauthorized']);
      return false;
    }
  } else {
    // Eğer expectedRoles tek bir string ise, kullanıcının bu role sahip olup olmadığını kontrol et
    if (!authService.hasRole(expectedRoles)) {
      router.navigate(['/unauthorized']);
      return false;
    }
  }

  return true;
};