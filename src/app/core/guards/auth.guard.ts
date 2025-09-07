import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const auth   = inject(AuthService);

  if (auth.getToken()) return true;

  // Redirección real al Login con URL de retorno
  return router.createUrlTree(['/login'], {
    queryParams: { redirectTo: state.url }
  });
};
