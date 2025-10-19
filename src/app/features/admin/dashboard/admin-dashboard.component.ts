import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of, shareReplay } from 'rxjs';

import { UsersApi } from '@features/users/data/users.api';
import { EcoguiaApi } from '@features/ecoguia/data/ecoguia.api';
import { ApiService } from '@core/services/api.service';
import { UserListItem } from '@features/users/data/users.models';
import { BusinessListItem, ProductItem, ServiceItem } from '@features/ecoguia/data/ecoguia.models';
import { UserKycDTO } from '@features/users/data/kyc.api';

type PageLike<T> = {
  items: T[];
  total?: number;
};

type KycCollection<T> = PageLike<T> & {
  approved: number;
  pending: number;
};

interface OverviewMetrics {
  users: {
    total: number;
    kycApproved: number;
    kycPending: number;
    kycRate: number;
  };
  business: {
    total: number;
    kycApproved: number;
    kycPending: number;
    avgCatalogPerBusiness: number;
  };
  catalog: {
    products: number;
    services: number;
    totalItems: number;
  };
}

interface BusinessKycDTO {
  id: number;
  id_business: number;
  approve?: boolean | null;
  approved_at?: string | null;
  approved_by?: number | null;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent {
  private usersApi = inject(UsersApi);
  private ecoguiaApi = inject(EcoguiaApi);
  private api = inject(ApiService);

  readonly quickLinks = [
    { label: 'Catálogos', description: 'País, provincia, cantón, distrito, tipos de ID', link: '/admin/catalogs' },
    { label: 'Categorías', description: 'Gestiona categorías de negocio', link: '/admin/categories' },
    { label: 'Aprobación KYC', description: 'Revisa solicitudes de verificación', link: '/admin/kyc' },
    { label: 'Roles de usuario', description: 'Asigna roles especiales y staff', link: '/admin/roles' },
  ];

  private userKycs$ = this.fetchKycCollection<UserKycDTO>('/ukyc').pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private businessKycs$ = this.fetchKycCollection<BusinessKycDTO>('/bkyc').pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly overview$ = forkJoin({
    users: this.usersApi.list({ limit: 1, offset: 0 }).pipe(catchError(() => of(this.emptyPage<UserListItem>()))),
    businesses: this.ecoguiaApi.listBusinesses({ limit: 1, offset: 0 }).pipe(catchError(() => of(this.emptyPage<BusinessListItem>()))),
    products: this.ecoguiaApi.listProducts({ limit: 1, offset: 0 }).pipe(catchError(() => of(this.emptyPage<ProductItem>()))),
    services: this.ecoguiaApi.listServices({ limit: 1, offset: 0 }).pipe(catchError(() => of(this.emptyPage<ServiceItem>()))),
    userKycs: this.userKycs$,
    businessKycs: this.businessKycs$,
  }).pipe(
    map(({ users, businesses, products, services, userKycs, businessKycs }) => {
      const totalUsers = users.total ?? users.items.length;
      const totalBusinesses = businesses.total ?? businesses.items.length;
      const totalProducts = products.total ?? products.items.length;
      const totalServices = services.total ?? services.items.length;
      const totalCatalog = totalProducts + totalServices;

      const kycApproved = userKycs.approved;
      const kycPending = userKycs.pending;
      const kycRate = totalUsers ? Math.round((kycApproved / totalUsers) * 100) : 0;

      const businessKycApproved = businessKycs.approved;
      const businessKycPending = businessKycs.pending;
      const avgCatalogPerBusiness = totalBusinesses
        ? Math.round((totalCatalog / totalBusinesses) * 10) / 10
        : 0;

      return {
        users: {
          total: totalUsers,
          kycApproved,
          kycPending,
          kycRate,
        },
        business: {
          total: totalBusinesses,
          kycApproved: businessKycApproved,
          kycPending: businessKycPending,
          avgCatalogPerBusiness,
        },
        catalog: {
          products: totalProducts,
          services: totalServices,
          totalItems: totalCatalog,
        },
      } as OverviewMetrics;
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly latestUsers$ = this.usersApi
    .list({ limit: 6, offset: 0 })
    .pipe(
      map(page => page.items),
      catchError(() => of([] as UserListItem[])),
      shareReplay({ bufferSize: 1, refCount: true })
    );

  readonly latestBusinesses$ = this.ecoguiaApi
    .listBusinesses({ limit: 6, offset: 0 })
    .pipe(
      map(page => page.items),
      catchError(() => of([] as BusinessListItem[])),
      shareReplay({ bufferSize: 1, refCount: true })
    );

  readonly pendingUserKycs$ = this.userKycs$.pipe(
    map(collection => collection.items.filter(item => !item.approve).slice(0, 6)),
    catchError(() => of([] as UserKycDTO[]))
  );

  readonly pendingBusinessKycs$ = this.businessKycs$.pipe(
    map(collection => collection.items.filter(item => !item.approve).slice(0, 6)),
    catchError(() => of([] as BusinessKycDTO[]))
  );

  readonly catalogSnapshot$ = forkJoin({
    products: this.ecoguiaApi.listProducts({ limit: 5, offset: 0 }).pipe(catchError(() => of(this.emptyPage<ProductItem>()))),
    services: this.ecoguiaApi.listServices({ limit: 5, offset: 0 }).pipe(catchError(() => of(this.emptyPage<ServiceItem>()))),
  }).pipe(
    map(({ products, services }) => ({ products: products.items, services: services.items })),
    catchError(() => of({ products: [] as ProductItem[], services: [] as ServiceItem[] })),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private fetchKycCollection<T extends { approve?: boolean | null }>(path: string, limit = 500) {
    return this.api.get<any>(path, { limit, offset: 0 }).pipe(
      map(env => this.toKycCollection<T>(env?.body)),
      catchError(() => of(this.toKycCollection<T>([])))
    );
  }

  private toKycCollection<T extends { approve?: boolean | null }>(body: any): KycCollection<T> {
    const items: T[] = Array.isArray(body)
      ? body
      : Array.isArray(body?.items)
        ? body.items
        : [];
    const total = Array.isArray(body)
      ? items.length
      : typeof body?.total === 'number'
        ? body.total
        : items.length;

    const approved = items.filter(item => !!item?.approve).length;
    const pending = items.filter(item => !item?.approve).length;

    return { items, total, approved, pending };
  }

  private emptyPage<T>(): PageLike<T> & { limit?: number; offset?: number; hasMore?: boolean } {
    return { items: [], total: 0, limit: 0, offset: 0, hasMore: false };
  }
}




