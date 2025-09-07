import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { AuthService } from '@core/services/auth.service';
import { map, expand, reduce } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

export interface BusinessCategory {
  id: number;
  name: string;
  description?: string | null;
  slug?: string | null;
}

// Endpoint principal (ajústalo si el documento usa otro nombre)
const EP = '/bcategory';

@Injectable({ providedIn: 'root' })
export class AdminCategoriesApi {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  private addedBy() { return this.auth.getUserId(); }

  list(params?: { limit?: number; offset?: number }) {
    return this.api.get<any>(EP, params as any).pipe(
      map(env => (env?.body ?? []))
    );
  }

  listAll(pageSize = 1000) {
    const parse = (resp: any) => (Array.isArray(resp?.body) ? resp.body : (Array.isArray(resp?.body?.items) ? resp.body.items : [])) as BusinessCategory[];
    let offset = 0;
    return this.api.get<any>(EP, { limit: pageSize, offset }).pipe(
      map(parse),
      expand((items: BusinessCategory[]) => {
        if (items.length < pageSize) return EMPTY;
        offset += pageSize;
        return this.api.get<any>(EP, { limit: pageSize, offset }).pipe(map(parse));
      }),
      reduce((acc: BusinessCategory[], curr: BusinessCategory[]) => acc.concat(curr), [] as BusinessCategory[])
    );
  }

  getById(id: number) {
    return this.api.get<any>(`${EP}/${id}`).pipe(
      map(env => Array.isArray(env?.body) ? env.body[0] : env?.body as BusinessCategory)
    );
  }

  create(payload: Partial<BusinessCategory>) {
    const added_by = this.addedBy();
    const body = added_by ? { ...payload, added_by } : payload;
    return this.api.post(EP, body);
  }

  update(payload: Partial<BusinessCategory> & { id: number }) {
    return this.api.put(EP, payload);
  }

  delete(id: number) {
    return this.api.delete(EP, { body: { id } });
  }
}

