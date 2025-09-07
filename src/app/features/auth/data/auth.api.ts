import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import {
  LoginPayloadDTO,
  MeResponseDTO,
  RefreshResponseDTO,
  RegisterBodyDTO,
  RegisterPayloadDTO,
  RegisterResponseDTO,
} from './auth.dto';

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private api = inject(ApiService);

  // Login estricto (username + password)
  login(username: string, password: string): Observable<{ token: string; user: any; id: number }> {
    const payload: LoginPayloadDTO = { username, password };
    return this.api.post<any>('/auth/login', payload).pipe(
      map((resp: any) => {
        // Soporta respuesta plana { token, id, datos } o envelope { body: {...} }
        const body = resp && resp.body != null ? resp.body : resp;
        const token = body?.token;
        const id = Number(body?.id);
        const user = body?.datos ?? body?.data ?? body?.user ?? {};
        if (!token || !Number.isFinite(id)) {
          throw { message: 'Login invalido', resp };
        }
        return { token, user, id };
      })
    );
  }

  // Login flexible (correo o usuario)
  loginFlexible(identity: string, password: string) {
    return this.login(identity, password);
  }

  // Usuario autenticado (según token)
  me(): Observable<any> {
    return this.api.get<MeResponseDTO>('/auth/me').pipe(
      map((env) => {
        const e: any = env as any;
        if (e?.error) { throw env; }
        return e.body;
      })
    );
  }

  // Refresh token
  refresh(): Observable<string> {
    return this.api.post<RefreshResponseDTO>('/auth/refresh', {}).pipe(
      map((env) => {
        const e: any = env as any;
        if (e?.error || !e?.body?.token) { throw env; }
        return e.body.token as string;
      })
    );
  }

  // Registro
  register(payload: RegisterPayloadDTO): Observable<{ token?: string; user: any; id: number }> {
    return this.api.post<RegisterResponseDTO>('/users', payload).pipe(
      map((env) => {
        const e: any = env as any;
        if (e?.error || !e?.body?.data || typeof e?.body?.id !== 'number') {
          throw { message: 'Registro invalido', env };
        }
        const { token, data, id } = e.body as RegisterBodyDTO;
        return { token, user: data, id };
      })
    );
  }
}
