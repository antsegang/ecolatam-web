import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ApiService } from '@core/services/api.service';

export interface UserKycDTO {
  id: number;
  id_user: number;
  id_idtype?: number | null;
  identity?: string | null;
  pictures?: any;
  sended_at?: string | null; // ISO date
  approved_by?: number | null;
  approved_at?: string | null; // ISO date
  approve?: boolean | null;
}

@Injectable({ providedIn: 'root' })
export class KycApi {
  private api = inject(ApiService);

  // Endpoint real: GET /ukyc/:id_user
  getByUserId(id_user: number): Observable<UserKycDTO | null> {
    return this.api.get<any>(`/ukyc/${id_user}`).pipe(
      map(env => {
        const body = env?.body;
        const dto: UserKycDTO | undefined = Array.isArray(body) ? body[0] : body;
        return dto || null;
      })
    );
  }

  submit(payload: { id?: number; id_user: number; id_idtype: number; identity: string; pictures: any }): Observable<string> {
    return this.api.post<any>('/ukyc', payload).pipe(map(env => String(env?.body ?? 'OK')));
  }
}
