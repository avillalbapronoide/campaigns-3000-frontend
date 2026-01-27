import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const currentUser = authService.currentUser();

  if (currentUser && currentUser.role === 'ADMIN') {
    return true;
  }

  // Redirect to campaigns if not admin
  router.navigate(['/campaigns']);
  return false;
};
