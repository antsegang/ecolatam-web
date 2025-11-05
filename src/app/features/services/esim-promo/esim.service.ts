import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface ClientLead { name: string; email: string }

@Injectable()
export class EsimService {
  private http = inject(HttpClient);
  // Ajusta según tu environment:
  private base = '/api/v1';

  createClientLead(payload: ClientLead) {
    // API v1 envelope estándar; el BE responde 201 con mensaje
    // POST /clients  { name, email }  → 201
    return this.http.post<{ error: boolean; status: number; body: any }>(
      `${this.base}/clients`,
      payload
    ).toPromise();
  }
}
