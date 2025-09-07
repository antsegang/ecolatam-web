import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { AuthService } from '@core/services/auth.service';
import { map, expand, reduce } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

export type CatalogType = 'pais' | 'provincia' | 'canton' | 'distrito' | 'idtype';

export interface CatalogItem { id: number; name: string }
export interface IdTypeItem extends CatalogItem { description?: string | null }

const EP: Record<CatalogType, string> = {
  pais: '/pais',
  provincia: '/provincia',
  canton: '/canton',
  distrito: '/distrito',
  idtype: '/idtype',
};

@Injectable({ providedIn: 'root' })
export class AdminCatalogsApi {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  private addedBy() { return this.auth.getUserId(); }

  list<T extends CatalogItem | IdTypeItem>(type: CatalogType, params?: { limit?: number; offset?: number }) {
    return this.api.get<any>(EP[type], params as any).pipe(
      map(env => (env?.body ?? []))
    );
  }

  // Trae toda la data del catálogo paginando internamente (sin filtros por FK)
  listAll<T extends CatalogItem | IdTypeItem>(type: CatalogType, pageSize = 1000) {
    const parse = (resp: any) => (Array.isArray(resp?.body) ? resp.body : (Array.isArray(resp?.body?.items) ? resp.body.items : [])) as T[];

    let offset = 0;
    return this.api.get<any>(EP[type], { limit: pageSize, offset }).pipe(
      map(parse),
      expand((items: T[]) => {
        if (items.length < pageSize) return EMPTY;
        offset += pageSize;
        return this.api.get<any>(EP[type], { limit: pageSize, offset }).pipe(map(parse));
      }),
      reduce((acc: T[], curr: T[]) => acc.concat(curr), [] as T[])
    );
  }

  getById<T extends Record<string, any>>(type: CatalogType, id: number) {
    return this.api.get<any>(`${EP[type]}/${id}`).pipe(
      map(env => (Array.isArray(env?.body) ? env.body[0] : env?.body) as T)
    );
  }

  create(type: CatalogType, payload: any) {
    const added_by = this.addedBy();
    const body = added_by ? { ...payload, added_by } : payload;
    return this.api.post(EP[type], body);
  }

  update(type: CatalogType, payload: any) {
    return this.api.put(EP[type], payload);
  }

  delete(type: CatalogType, id: number) {
    return this.api.delete(EP[type], { body: { id } });
  }
}
