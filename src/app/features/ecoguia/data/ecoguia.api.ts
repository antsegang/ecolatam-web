import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { ApiService } from '@core/services/api.service';
import { AuthService } from '@core/services/auth.service';
import { ApiEnvelope, BusinessDTO, BusinessListApiBody, ProductDTO, ServiceDTO, CreateBusinessPayloadDTO, BusinessKycPayloadDTO } from './ecoguia.dto';
import { BusinessDetail, BusinessListItem, Page, ProductItem, ServiceItem } from './ecoguia.models';
import { mapBusinessDtoToDetail, mapBusinessDtoToListItem, mapProductDto, mapServiceDto, normalizeList } from './ecoguia.mappers';

// Ajusta los endpoints según el backend real
const EP = {
  business: '/business',               // GET list, GET by id, POST/PUT/DELETE
  products: '/product',              // list all / or by businessId with query param
  services: '/service',              // list all / or by businessId with query param
};

@Injectable({ providedIn: 'root' })
export class EcoguiaApi {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  listBusinesses(params: { limit?: number; offset: number }): Observable<Page<BusinessListItem>> {
    const limit  = params.limit ?? 12;
    const offset = params.offset ?? 0;
    return this.api
      .get<ApiEnvelope<BusinessListApiBody>>(EP.business, { limit, offset })
      .pipe(map(env => normalizeList(env.body, limit, offset, mapBusinessDtoToListItem)));
  }

  /** Lista negocios por id de usuario (si el backend lo soporta con query user) */
  listBusinessesByUser(userId: number, params: { limit?: number; offset?: number } = {}): Observable<Page<BusinessListItem>> {
    const limit  = params.limit ?? 6;
    const offset = params.offset ?? 0;
    return this.api
      .get<ApiEnvelope<BusinessListApiBody>>(EP.business, { user: userId, limit, offset })
      .pipe(map(env => normalizeList(env.body, limit, offset, mapBusinessDtoToListItem)));
  }

  getBusiness(id: number): Observable<BusinessDetail | null> {
    return this.api
      .get<ApiEnvelope<BusinessDTO | BusinessDTO[]>>(`${EP.business}/${id}`)
      .pipe(map(env => {
        const raw = Array.isArray(env.body) ? env.body[0] : env.body;
        return raw ? mapBusinessDtoToDetail(raw) : null;
      }));
  }

  productsByBusiness(businessId: number, params: { limit?: number; offset?: number } = {}): Observable<Page<ProductItem>> {
    const limit  = params.limit ?? 12;
    const offset = params.offset ?? 0;
    return this.api
      .get<ApiEnvelope<ProductDTO[] | { items: ProductDTO[]; total: number }>>(EP.products, { business: businessId, limit, offset })
      .pipe(map(env => normalizeList(env.body as any, limit, offset, mapProductDto)));
  }

  servicesByBusiness(businessId: number, params: { limit?: number; offset?: number } = {}): Observable<Page<ServiceItem>> {
    const limit  = params.limit ?? 12;
    const offset = params.offset ?? 0;
    return this.api
      .get<ApiEnvelope<ServiceDTO[] | { items: ServiceDTO[]; total: number }>>(EP.services, { business: businessId, limit, offset })
      .pipe(map(env => normalizeList(env.body as any, limit, offset, mapServiceDto)));
  }

  listProducts(params: { limit?: number; offset: number }): Observable<Page<ProductItem>> {
    const limit  = params.limit ?? 12;
    const offset = params.offset ?? 0;
    return this.api
      .get<ApiEnvelope<ProductDTO[] | { items: ProductDTO[]; total: number }>>(EP.products, { limit, offset })
      .pipe(map(env => normalizeList(env.body as any, limit, offset, mapProductDto)));
  }

  listServices(params: { limit?: number; offset: number }): Observable<Page<ServiceItem>> {
    const limit  = params.limit ?? 12;
    const offset = params.offset ?? 0;
    return this.api
      .get<ApiEnvelope<ServiceDTO[] | { items: ServiceDTO[]; total: number }>>(EP.services, { limit, offset })
      .pipe(map(env => normalizeList(env.body as any, limit, offset, mapServiceDto)));
  }

  getProduct(id: number) {
    return this.api
      .get<ApiEnvelope<ProductDTO | ProductDTO[]>>(`${EP.products}/${id}`)
      .pipe(map(env => {
        const raw = Array.isArray(env.body) ? env.body[0] : env.body;
        return raw ? mapProductDto(raw) : null;
      }));
  }

  getService(id: number) {
    return this.api
      .get<ApiEnvelope<ServiceDTO | ServiceDTO[]>>(`${EP.services}/${id}`)
      .pipe(map(env => {
        const raw = Array.isArray(env.body) ? env.body[0] : env.body;
        return raw ? mapServiceDto(raw) : null;
      }));
  }

  // Crear negocio (paso básico)
  createBusiness(payload: CreateBusinessPayloadDTO) {
    const id_user = this.auth.getUserId();
    // Filtrar solo campos esperados por el backend (según especificación)
    const base: any = {
      name: payload.name,
      location: payload.location ?? null,
      id_pais: payload.id_pais ?? null,
      id_provincia: payload.id_provincia ?? null,
      id_canton: payload.id_canton ?? null,
      id_distrito: payload.id_distrito ?? null,
      zip: payload.zip ?? null,
      id_bcategory: payload.id_bcategory ?? null,
      phone: payload.phone ?? null,
    };
    const body = id_user ? { ...base, id_user } : base;
    return this.api.post<ApiEnvelope<{ id: number }>>(`${EP.business}`, body).pipe(
      map(env => {
        const id = (env.body as any)?.id;
        if (typeof id !== 'number') throw env;
        return { id } as { id: number };
      })
    );
  }

  // Enviar KYC del negocio (puede ser opcional/pospuesto)
  submitBusinessKyc(businessId: number, payload: BusinessKycPayloadDTO) {
    // Si tu API usa otra ruta (p.ej. /business/:id/kyc) ajústalo aquí
    return this.api.post<ApiEnvelope<string>>(`${EP.business}/${businessId}/kyc`, payload).pipe(
      map(env => String(env.body))
    );
  }
}
