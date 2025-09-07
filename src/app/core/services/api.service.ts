// @core/services/api.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { API_URL } from '@core/tokens/api-url.token';

type RequestOptions = {
  params?: Record<string, any>;
  headers?: Record<string, string> | HttpHeaders;
  body?: any;
};

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = inject(API_URL);

  // Helpers
  private toUrl(path: string) {
    return `${this.base}${path}`;
  }

  private toParams(obj?: Record<string, any>) {
    if (!obj) return undefined;
    let params = new HttpParams();
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val === undefined || val === null) continue;

      if (Array.isArray(val)) {
        for (const v of val) {
          if (v === undefined || v === null) continue;
          params = params.append(key, String(v));
        }
      } else {
        params = params.set(key, String(val));
      }
    }
    return params;
  }

  // Métodos básicos
  get<T>(path: string, params?: Record<string, any>) {
    return this.http
      .get<T>(this.toUrl(path), { params: this.toParams(params) })
      .pipe(catchError(err => throwError(() => err)));
  }

  post<T>(path: string, body: any, options: Omit<RequestOptions, 'body'> = {}) {
    return this.http
      .post<T>(this.toUrl(path), body, {
        params: this.toParams(options.params),
        headers: options.headers,
      })
      .pipe(catchError(err => throwError(() => err)));
  }

  put<T>(path: string, body: any, options: Omit<RequestOptions, 'body'> = {}) {
    return this.http
      .put<T>(this.toUrl(path), body, {
        params: this.toParams(options.params),
        headers: options.headers,
      })
      .pipe(catchError(err => throwError(() => err)));
  }

  patch<T>(path: string, body: any, options: Omit<RequestOptions, 'body'> = {}) {
    return this.http
      .patch<T>(this.toUrl(path), body, {
        params: this.toParams(options.params),
        headers: options.headers,
      })
      .pipe(catchError(err => throwError(() => err)));
  }

  // DELETE con body ✅
  delete<T>(path: string, options: RequestOptions = {}) {
    return this.http
      .delete<T>(this.toUrl(path), {
        body: options.body,
        params: this.toParams(options.params),
        headers: options.headers,
      })
      .pipe(catchError(err => throwError(() => err)));
  }

  // Genérico por si necesitas algo especial (headers/verb dinámico, etc.)
  request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    options: RequestOptions = {}
  ) {
    return this.http
      .request<T>(method, this.toUrl(path), {
        body: options.body,
        params: this.toParams(options.params),
        headers: options.headers,
      })
      .pipe(catchError(err => throwError(() => err)));
  }

  /** Útil cuando el backend responde HTML/texto en vez de JSON */
  rawPost(path: string, body: any) {
    return this.http
      .post(this.toUrl(path), body, {
        observe: 'response',
        responseType: 'text',
      })
      .pipe(catchError(err => throwError(() => err)));
  }
}
