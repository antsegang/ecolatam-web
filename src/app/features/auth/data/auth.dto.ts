// Envelope estándar del API
export interface ApiEnvelope<T> {
  error: boolean;
  status: number;
  body: T;
}

// Payloads y respuestas del auth

export interface LoginPayloadDTO {
  // El API espera "username" (si envías email, pásalo en username igual)
  username: string;
  password: string;
}

export interface LoginBodyDTO {
  token: string;
  data: AuthUserDTO;  // usuario autenticado
  id: number;         // id del usuario
}
export type LoginResponseDTO = ApiEnvelope<LoginBodyDTO>;

// Usuario mínimo para sesión (coincide con lo que devuelve el login)
export interface AuthUserDTO {
  id: number;
  name: string;
  lastname: string;
  username?: string;
  email?: string;
  created_at?: string;
  // ... si tu backend agrega más campos, se suman aquí sin romper
}

// /auth/me
export type MeResponseDTO = ApiEnvelope<AuthUserDTO>;

// /auth/refresh
export interface RefreshBodyDTO { token: string; }
export type RefreshResponseDTO = ApiEnvelope<RefreshBodyDTO>;

// ...deja lo que ya tienes arriba

// ...
export interface RegisterPayloadDTO {
  // perfil obligatorio
  name: string;
  lastname: string;
  birthdate: string;        // 'YYYY-MM-DD'
  location: string;
  id_pais: number;
  id_provincia: number;
  id_canton: number;
  id_distrito: number;
  zip: string;
  cellphone: string;
  phone: string;

  // credenciales (opcional, si quieres auto-crear en el mismo POST)
  username?: string;
  email?: string;
  password?: string;
}


export interface RegisterBodyDTO {
  token?: string;      // algunos backends auto-loguean tras registrar
  data: AuthUserDTO;   // usuario creado
  id: number;          // id del usuario
}
export type RegisterResponseDTO = ApiEnvelope<RegisterBodyDTO>;

