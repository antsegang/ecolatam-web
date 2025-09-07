import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { map, catchError } from 'rxjs/operators';
import { Observable, of, forkJoin } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private api = inject(ApiService);

  // Determina roles consultando cada tabla pública por tipo de rol y
  // verificando si existe un registro con id_user === userId.
  // Endpoints (según documento):
  // - /admin, /superadmin, /vip, /csagent, /volunteer, /inspector, /tour_guide
  getUserRoles(userId: number): Observable<string[]> {
    const defs: Array<{ role: string; paths: string[] }> = [
      { role: 'superadmin', paths: ['/superadmin'] },
      { role: 'admin',      paths: ['/admin'] },
      { role: 'vip',        paths: ['/vip'] },
      { role: 'csagent',    paths: ['/csagent'] },
      { role: 'volunteer',  paths: ['/volunteer'] },
      { role: 'inspector',  paths: ['/inspector'] },
      { role: 'tour_guide',  paths: ['/tour_guide', '/tour_guide'] },
    ];

    const checks = defs.map(def =>
      forkJoin(
        def.paths.map(p =>
          this.api.get<any>(p).pipe(
            map(env => {
              const body = (env as any)?.body ?? env;
              const arr = Array.isArray(body) ? body : Array.isArray(body?.items) ? body.items : [];
              // Busca coincidencia por id_user == userId
              const match = arr.some((row: any) => Number(row?.id_user) === Number(userId));
              return match;
            }),
            catchError(() => of(false))
          )
        )
      ).pipe(
        map(results => results.some(Boolean) ? def.role : null),
        catchError(() => of(null))
      )
    );

    return forkJoin(checks).pipe(
      map(list => list.filter((r): r is string => !!r))
    );
  }
}
