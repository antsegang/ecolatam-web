import { inject, Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, shareReplay, catchError } from 'rxjs/operators';
import { EcoguiaApi } from '@features/ecoguia/data/ecoguia.api';
import { BusinessListItem, ProductItem, ServiceItem } from '@features/ecoguia/data/ecoguia.models';
import { UsersApi } from '@features/users/data/users.api';
import { UserListItem } from '@features/users/data/users.models';

export type SearchResult = {
  type: 'negocio' | 'producto' | 'servicio' | 'usuario';
  title: string;
  subtitle?: string;
  route: any[] | string;
};

@Injectable({ providedIn: 'root' })
export class SearchService {
  private api = inject(EcoguiaApi);
  private usersApi = inject(UsersApi);

  // Cache simple de las primeras páginas para búsqueda local
  private _biz$?: Observable<BusinessListItem[]>;
  private _prod$?: Observable<ProductItem[]>;
  private _serv$?: Observable<ServiceItem[]>;
  private _users$?: Observable<UserListItem[]>;

  private businesses(): Observable<BusinessListItem[]> {
    if (!this._biz$) {
      this._biz$ = this.api.listBusinesses({ limit: 100, offset: 0 })
        .pipe(
          map(p => p.items),
          shareReplay({ bufferSize: 1, refCount: false })
        );
    }
    return this._biz$;
  }

  private products(): Observable<ProductItem[]> {
    if (!this._prod$) {
      this._prod$ = this.api.listProducts({ limit: 100, offset: 0 })
        .pipe(
          map(p => p.items),
          catchError(() => of([] as ProductItem[])),
          shareReplay({ bufferSize: 1, refCount: false })
        );
    }
    return this._prod$;
  }

  private services(): Observable<ServiceItem[]> {
    if (!this._serv$) {
      this._serv$ = this.api.listServices({ limit: 100, offset: 0 })
        .pipe(
          map(p => p.items),
          catchError(() => of([] as ServiceItem[])),
          shareReplay({ bufferSize: 1, refCount: false })
        );
    }
    return this._serv$;
  }

  private users(): Observable<UserListItem[]> {
    if (!this._users$) {
      this._users$ = this.usersApi
        .list({ limit: 100, offset: 0 })
        .pipe(
          map(p => p.items),
          catchError(() => of([] as UserListItem[])),
          shareReplay({ bufferSize: 1, refCount: false })
        );
    }
    return this._users$;
  }

  search(term: string): Observable<SearchResult[]> {
    const q = term.trim().toLowerCase();
    if (!q) return of([]);

    return forkJoin([this.businesses(), this.products(), this.services(), this.users()]).pipe(
      map(([biz, prod, serv, users]) => {
        const res: SearchResult[] = [];
        const include = (s?: string) => !!s && s.toLowerCase().includes(q);

        for (const b of biz) {
          if (include(b.name) || include(b.short) || include(b.categoryLabel) || include(b.locationLabel)) {
            res.push({ type: 'negocio', title: b.name, subtitle: b.locationLabel || b.categoryLabel, route: ['/ecoguia', b.id] });
          }
        }
        for (const p of prod) {
          if (include(p.name) || include(p.short)) {
            res.push({ type: 'producto', title: p.name, subtitle: p.short, route: ['/ecoguia/product', p.id] });
          }
        }
        for (const s of serv) {
          if (include(s.name) || include(s.short)) {
            res.push({ type: 'servicio', title: s.name, subtitle: s.short, route: ['/ecoguia/service', s.id] });
          }
        }

        for (const u of users) {
          if (include(u.name) || include(u.lastname) || include(u.username) || include(u.email)) {
            res.push({ type: 'usuario', title: `${u.name} ${u.lastname}`.trim(), subtitle: u.username ? `@${u.username}` : u.email, route: ['/users', u.id] });
          }
        }

        return res.slice(0, 10);
      })
    );
  }
}
