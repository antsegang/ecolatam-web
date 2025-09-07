import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RolesService } from '../services/roles.service';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * Uso:
 *   { path: 'admin', canActivate: [ roleGuard(['admin']) ], loadComponent: ... }
 *   { path: 'review', canActivate: [ roleGuard(['inspector','moderator'], 'any') ], loadComponent: ... }
 */
export function roleGuard(required: string[] | string, mode: 'any' | 'all' = 'any'): CanActivateFn {
  return (_route, state) => {
    const router = inject(Router);
    const auth   = inject(AuthService);
    const rolesApi = inject(RolesService);

    // sin token => a login con retorno
    if (!auth.getToken()) {
      return router.createUrlTree(['/login'], { queryParams: { redirectTo: state.url } });
    }

    const reqArr = Array.isArray(required) ? required : [required];
    const current = auth.getUser();
    const userId = current && (current as any).id ? Number((current as any).id) : NaN;

    if (!isNaN(userId) && userId > 0) {
      return rolesApi.getUserRoles(userId).pipe(
        map((roles) => {
          const set = new Set((roles || []).map(r => String(r).toLowerCase()));
          const okDb = mode === 'all' ? reqArr.every(r => set.has(r.toLowerCase())) : reqArr.some(r => set.has(r.toLowerCase()));
          if (okDb) return true;
          return auth.hasRole(reqArr, mode) ? true : router.createUrlTree(['/']);
        }),
        catchError(() => of(auth.hasRole(reqArr, mode) ? true : router.createUrlTree(['/'])))
      );
    }

    return auth.hasRole(reqArr, mode) ? true : router.createUrlTree(['/']);
  };
}
