import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (typeof window !== 'undefined') {
        const snippet = typeof err.error === 'string' ? err.error.slice(0, 200) : err.error;
        console.error('[HTTP ERR]', req.method, req.url, { status: err.status, message: err.message, snippet });
      }
      if (err.status === 401) {
        const router = inject(Router);
        inject(AuthService).logout();
        const nextUrl = router.routerState.snapshot.url || '/';
        // evita loop si ya estás en /login
        const toLogin = nextUrl.startsWith('/login') ? '/login' : `/login?redirectTo=${encodeURIComponent(nextUrl)}`;
        router.navigateByUrl(toLogin);
      }
      if (err.status === 403) {
        // aquí podrías enviar a una página de "forbidden" si la creas
        // router.navigateByUrl('/forbidden');
      }
      return throwError(() => err);
    })
  );
