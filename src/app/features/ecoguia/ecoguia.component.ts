import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EcoguiaApi } from './data/ecoguia.api';
import { BusinessListItem, Page, ProductItem, ServiceItem } from './data/ecoguia.models';
import { CatalogsApi } from '../catalogs/data/catalogs.api';
import { Option } from '../catalogs/data/catalogs.models';

@Component({
  selector: 'app-ecoguia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './ecoguia.component.html',
  styleUrls: ['./ecoguia.component.scss']
})
export class EcoguiaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(EcoguiaApi);
  private catalogs = inject(CatalogsApi);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);

  loading = signal<boolean>(false);
  tab = signal<'business'|'products'|'services'>('business');

  pageBusinesses = signal<Page<BusinessListItem> | null>(null);
  pageProducts   = signal<Page<ProductItem> | null>(null);
  pageServices   = signal<Page<ServiceItem> | null>(null);

  // Filtros dashboard
  form = this.fb.nonNullable.group({
    q: [''],
    category: [''],
    idPais: [undefined as number|undefined],
    idProvincia: [undefined as number|undefined],
    idCanton: [undefined as number|undefined],
    idDistrito: [undefined as number|undefined],
  });

  // Opciones catálogos
  paises: Option[] = [];
  provincias: Option[] = [];
  cantones: Option[] = [];
  distritos: Option[] = [];

  readonly limit = 12;
  private offset = 0;

  ngOnInit(): void {
    this.loadCatalogs();
    const qpQ = (this.route.snapshot.queryParamMap.get('q') || '').trim();
    if (qpQ) this.form.patchValue({ q: qpQ }, { emitEvent: false });
    this.load();

    // Búsqueda q
    this.form.controls.q.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.load(0));

    // Cambios de filtros
    this.form.controls.idPais.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(v => {
        this.form.patchValue({ idProvincia: undefined, idCanton: undefined, idDistrito: undefined }, { emitEvent: false });
        this.provincias = []; this.cantones = []; this.distritos = [];
        if (v != null) this.catalogs.provinciasByPais(v).subscribe(opts => this.provincias = opts);
        this.load(0);
      });

    this.form.controls.idProvincia.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(v => {
        this.form.patchValue({ idCanton: undefined, idDistrito: undefined }, { emitEvent: false });
        this.cantones = []; this.distritos = [];
        if (v != null) this.catalogs.cantonesByProvincia(v).subscribe(opts => this.cantones = opts);
        this.load(0);
      });

    this.form.controls.idCanton.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(v => {
        this.form.patchValue({ idDistrito: undefined }, { emitEvent: false });
        this.distritos = [];
        if (v != null) this.catalogs.distritosByCanton(v).subscribe(opts => this.distritos = opts);
        this.load(0);
      });

    this.form.controls.idDistrito.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.load(0));

    this.form.controls.category.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.load(0));
  }

  private filterItems(items: BusinessListItem[], q?: string): BusinessListItem[] {
    if (!q?.trim()) return items;
    const term = q.trim().toLowerCase();
    return items.filter(b => [b.name, b.short, b.categoryLabel, b.locationLabel].some(v => v?.toLowerCase().includes(term)));
  }

  load(offset = 0): void {
    this.loading.set(true);
    this.offset = offset;
    const { q: qRaw, category: categoryRaw, idProvincia, idCanton, idDistrito } = this.form.getRawValue();
    const q = qRaw && qRaw.trim() ? qRaw.trim() : undefined;
    const category = categoryRaw && String(categoryRaw).trim() ? String(categoryRaw).trim() : undefined;

    if (this.tab() === 'business') {
      this.api.listBusinesses({ limit: this.limit, offset })
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (res) => {
            const filtered = this.filterItems(res.items, q);
            const page: Page<BusinessListItem> = {
              ...res,
              items: filtered,
              hasMore: q ? false : res.hasMore,
              total: q ? filtered.length : res.total,
            };
            this.pageBusinesses.set(page);
          },
          error: () => this.pageBusinesses.set({ items: [], limit: this.limit, offset, hasMore: false })
        });
    } else if (this.tab() === 'products') {
      this.api.listProducts({ limit: this.limit, offset })
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (res) => {
            const filtered = q ? res.items.filter(p => (p.name?.toLowerCase().includes(q) || p.short?.toLowerCase().includes(q))) : res.items;
            const page: Page<ProductItem> = {
              ...res,
              items: filtered,
              hasMore: q ? false : res.hasMore,
              total: q ? filtered.length : res.total,
            };
            this.pageProducts.set(page);
          },
          error: () => this.pageProducts.set({ items: [], limit: this.limit, offset, hasMore: false })
        });
    } else {
      this.api.listServices({ limit: this.limit, offset })
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: (res) => {
            const filtered = q ? res.items.filter(s => (s.name?.toLowerCase().includes(q) || s.short?.toLowerCase().includes(q))) : res.items;
            const page: Page<ServiceItem> = {
              ...res,
              items: filtered,
              hasMore: q ? false : res.hasMore,
              total: q ? filtered.length : res.total,
            };
            this.pageServices.set(page);
          },
          error: () => this.pageServices.set({ items: [], limit: this.limit, offset, hasMore: false })
        });
    }
  }

  onSubmit(): void { this.load(0); }
  prev(): void { if (this.offset > 0) this.load(Math.max(0, this.offset - this.limit)); }
  next(): void {
    const hasMore = this.tab() === 'business' ? this.pageBusinesses()?.hasMore
                    : this.tab() === 'products' ? this.pageProducts()?.hasMore
                    : this.pageServices()?.hasMore;
    if (hasMore) this.load(this.offset + this.limit);
  }
  trackById = (_: number, item: BusinessListItem) => item.id;

  setTab(t: 'business'|'products'|'services') { if (this.tab() !== t) { this.tab.set(t); this.load(0); } }

  private loadCatalogs() {
    this.catalogs.paises().subscribe(opts => this.paises = opts);
  }
}
