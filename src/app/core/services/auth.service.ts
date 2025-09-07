import { Injectable } from '@angular/core';

type StoredUser = { id: number | string; name?: string; email?: string; roles?: string[] } | null;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'ecolatam_token';
  private userKey  = 'ecolatam_user';

  // --- Token ---
  getToken(): string | null { return localStorage.getItem(this.tokenKey); }
  setToken(t: string)       { localStorage.setItem(this.tokenKey, t); }
  clearToken()              { localStorage.removeItem(this.tokenKey); }

  // --- Usuario ---
  getUser(): StoredUser {
    const raw = localStorage.getItem(this.userKey);
    return raw ? JSON.parse(raw) : null;
  }
  setUser(u: StoredUser) {
    if (u) localStorage.setItem(this.userKey, JSON.stringify(u));
    else   localStorage.removeItem(this.userKey);
  }

  logout() { this.clearToken(); this.setUser(null); }

  // --- Roles ---
  private decodeJwtPayload(token: string): any | null {
    try {
      const payload = token.split('.')[1];
      if (!payload) return null;
      // base64url -> base64 con padding
      let b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const pad = b64.length % 4;
      if (pad) b64 += '='.repeat(4 - pad);
      const bin = atob(b64);
      // Decodificar como UTF-8 de forma segura
      const bytes = new Uint8Array([...bin].map(c => c.charCodeAt(0)));
      const text = new TextDecoder().decode(bytes);
      return JSON.parse(text);
    } catch { return null; }
  }

  getRoles(): string[] {
    // 1) Roles guardados en el user (preferente)
    const u = this.getUser();
    if (u?.roles?.length) return u.roles;

    // 2) O extraídos del JWT (claim "roles" o "role")
    const t = this.getToken();
    if (!t) return [];
    const p = this.decodeJwtPayload(t);
    const fromClaim = p?.roles ?? p?.role ?? [];
    return Array.isArray(fromClaim) ? fromClaim : (fromClaim ? [fromClaim] : []);
  }

  // --- Helpers públicos ---
  getUserId(): number | undefined {
    const u = this.getUser();
    const fromUser = u && (u as any).id != null ? Number((u as any).id) : undefined;
    if (fromUser && !Number.isNaN(fromUser)) return fromUser;
    const t = this.getToken();
    if (!t) return undefined;
    const p = this.decodeJwtPayload(t);
    const fromToken = p?.id != null ? Number(p.id) : undefined;
    return fromToken && !Number.isNaN(fromToken) ? fromToken : undefined;
  }

  hasRole(required: string | string[], mode: 'any' | 'all' = 'any'): boolean {
    const mine = new Set(this.getRoles());
    const req  = Array.isArray(required) ? required : [required];
    if (mode === 'all') return req.every(r => mine.has(r));
    return req.some(r => mine.has(r));
  }
}
