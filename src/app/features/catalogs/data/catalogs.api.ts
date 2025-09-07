import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { map, shareReplay } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ApiEnvelope, PaisDTO, ProvinciaDTO, CantonDTO, DistritoDTO } from './catalogs.dto';
import { Option } from './catalogs.models';

/**
 * Endpoints: AJUSTA si tu API usa otros paths:
 * - Si son en inglés: '/countries', '/provinces', '/cantons', '/districts'
 * - Aquí asumimos plural en español para empatar con tus tablas.
 */
const EP = {
  paises: '/pais',
  provincias: '/provincia',
  cantones: '/canton',
  distritos: '/distrito',
};

@Injectable({ providedIn: 'root' })
export class CatalogsApi {
  private api = inject(ApiService);

  private _paises$?: Observable<Option[]>; // cache simple en memoria

  paises(): Observable<Option[]> {
    if (!this._paises$) {
      this._paises$ = this.api.get<ApiEnvelope<PaisDTO[]>>(EP.paises).pipe(
        map(env => (env.body || []).map(p => ({ id: p.id, label: p.name }))),
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }
    return this._paises$;
  }

  provinciasByPais(id_pais: number): Observable<Option[]> {
    return this.api.get<ApiEnvelope<ProvinciaDTO[]>>(EP.provincias, { pais: id_pais }).pipe(
      map(env => (env.body || []).map(p => ({ id: p.id, label: p.name })))
    );
  }

  cantonesByProvincia(id_provincia: number): Observable<Option[]> {
    return this.api.get<ApiEnvelope<CantonDTO[]>>(EP.cantones, { provincia: id_provincia }).pipe(
      map(env => (env.body || []).map(c => ({ id: c.id, label: c.name })))
    );
  }

  distritosByCanton(id_canton: number): Observable<Option[]> {
    return this.api.get<ApiEnvelope<DistritoDTO[]>>(EP.distritos, { canton: id_canton }).pipe(
      map(env => (env.body || []).map(d => ({ id: d.id, label: d.name })))
    );
  }
}
