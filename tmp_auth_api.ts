import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

import {
  ApiEnvelope,
  LoginPayloadDTO, LoginResponseDTO, LoginBodyDTO,
  MeResponseDTO,
  RefreshResponseDTO, RegisterBodyDTO, RegisterPayloadDTO, RegisterResponseDTO
} from './auth.dto';

/**
 * Servicio de acceso al API de Auth (feature-first).
 * Nota: no usamos HttpContext(SKIP_AUTH) porque el interceptor solo
 * agrega Authorization si hay token; en login normalmente no hay.
 * Si algún día necesitas forzar "no token", lo agregamos sin tocar UI.
 */
@Injectable({ providedIn: 'root' })
export class AuthApi {
  private api = inject(ApiService);

  /**
   * Login estricto (username + password).
   * Devuelve un objeto plano { token, user } listo para guardar en AuthService.
   */
  login(username: string, password: string): Observable<{ token: string; user: any; id: number }> {
    const payload: LoginPayloadDTO = { username, password };
    return this.api.post<LoginResponseDTO>('/auth/login', payload).pipe(
      map((env: ApiEnvelope<LoginBodyDTO>) => {
        if (env.error || !env.body?.token) {
          throw { message: 'Login inválido', env };
        }
        return { token: env.body.token, user: env.body.data, id: env.body.id };
      })
    );
  }

  /**
   * Login flexible (correo o usuario en el mismo campo).
   * Si el user ingresa email, lo mandamos igual como "username" (backend decide).
   */
  loginFlexible(identity: string, password: string) {
    return this.login(identity, password);
  }

  /**
   * Devuelve el usuario autenticado (según token enviado por interceptor).
   */
  me(): Observable<any> {
    return this.api.get<MeResponseDTO>('/auth/me').pipe(
      map((env) => {
        if (env.error) { throw env; }
        return env.body;
      })
    );
  }

  /**
   * (Opcional) Refresh token si tu backend lo soporta.
   */
  refresh(): Observable<string> {
    return this.api.post<RefreshResponseDTO>('/auth/refresh', {}).pipe(
      map((env) => {
        if (env.error || !env.body?.token) { throw env; }
        return env.body.token;
      })
    );
  }

  register(payload: RegisterPayloadDTO): Observable<{ token?: string; user: any; id: number }> {
    return this.api.post<RegisterResponseDTO>('/users', payload).pipe(
      map((env) => {
        if (env.error || !env.body?.data || typeof env.body.id !== 'number') {
          throw { message: 'Registro inválido', env };
        }
        const { token, data, id } = env.body as RegisterBodyDTO;
        return { token, user: data, id };
      })
    );
  }
}
