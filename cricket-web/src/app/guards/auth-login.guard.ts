import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApiServiceService } from '../services/api-service.service';

export const authLoginGuard: CanActivateFn = (route, state) => {
  const authService = inject(ApiServiceService);
  const router = inject(Router);
  
  if (authService.isLoggedIn()) {
    return true;
  } else {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
};
