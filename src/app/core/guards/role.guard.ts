import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Uso:
 *   { path: 'admin', canActivate: [ roleGuard(['admin']) ], loadComponent: ... }
 *   { path: 'review', canActivate: [ roleGuard(['inspector','moderator'], 'any') ], loadComponent: ... }
 */
export function roleGuard(required: string[] | string, mode: 'any' | 'all' = 'any'): CanActivateFn {
  return (_route, state) => {
    const router = inject(Router);
    const auth   = inject(AuthService);

    // sin token => a login con retorno
    if (!auth.getToken()) {
      return router.createUrlTree(['/login'], { queryParams: { redirectTo: state.url } });
    }

    const ok = auth.hasRole(required, mode);
    if (ok) return true;

    // con token pero sin rol => al inicio (o a /forbidden si lo creas)
    return router.createUrlTree(['/']);
  };
}
