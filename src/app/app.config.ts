import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { errorInterceptor } from '@core/interceptors/error.interceptor';
import { API_URL } from '@core/tokens/api-url.token';
import { environment } from '@env';

// Calcula la base del API:
// - Si environment.apiBase es absoluta (http/https), se usa tal cual.
// - Si es relativa (ej. "/api/v1"), se concatena a window.location.origin.
function computeApiUrl(): string {
  const base = (environment.apiBase ?? '').replace(/\/+$/, '');
  if (!base) return '';
  if (/^https?:\/\//i.test(base)) return base;
  const origin = typeof window !== 'undefined' ? window.location.origin.replace(/\/+$/, '') : '';
  return `${origin}${base}`;
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })
    ),
    { provide: API_URL, useFactory: computeApiUrl },
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, errorInterceptor])
    ),
  ],
};
