import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AdminCatalogsApi, CatalogType, CatalogItem, IdTypeItem } from '@features/admin/data/admin-catalogs.api';
import { CatalogsApi } from '@features/catalogs/data/catalogs.api';
import { Option } from '../../catalogs/data/catalogs.models';
import { forkJoin, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-admin-catalogs',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-catalogs.component.html',
  styleUrls: ['./admin-catalogs.component.scss']
})
export class AdminCatalogsComponent {
  private fb = inject(FormBuilder);
  private api = inject(AdminCatalogsApi);
  private catalogs = inject(CatalogsApi);

  types: CatalogType[] = ['pais','provincia','canton','distrito','idtype'];
  current = signal<CatalogType>('pais');

  items = signal<Array<CatalogItem | IdTypeItem>>([]);
  displayItems = signal<any[]>([]);
  allItems = signal<Array<CatalogItem | IdTypeItem>>([]);
  allDisplayItems = signal<any[]>([]);
  // Paginación
  limit = signal<number>(25);
  offset = signal<number>(0);
  total = signal<number | undefined>(undefined);
  hasMore = signal<boolean>(false);
  loading = signal(false);
  error = signal('');

  // Modal
  modalOpen = signal(false);
  isEdit = signal(false);

  // Catálogos padres
  paises: Option[] = [];
  provincias: Option[] = [];
  cantones: Option[] = [];

  form = this.fb.nonNullable.group({
    id: [undefined as number | undefined],
    name: ['', [Validators.required, Validators.minLength(2)]],
    // jerarquías
    id_pais: [undefined as number | undefined],
    id_provincia: [undefined as number | undefined],
    id_canton: [undefined as number | undefined],
    // idtype extra
    description: ['']
  });

  constructor(){
    this.load();
    // cascadas
    this.form.controls.id_pais.valueChanges.subscribe(v => {
      this.provincias = []; this.cantones = [];
      this.form.patchValue({ id_provincia: undefined, id_canton: undefined }, { emitEvent:false });
      if (v != null) this.loadProvinciasAll(v);
    });
    this.form.controls.id_provincia.valueChanges.subscribe(v => {
      this.cantones = [];
      this.form.patchValue({ id_canton: undefined }, { emitEvent:false });
      if (v != null) this.loadCantonesAll(v);
    });
  }

  setType(t: CatalogType){
    this.current.set(t);
    this.offset.set(0);
    this.load();
  }

  load(){
    this.loading.set(true); this.error.set('');
    // Trae toda la data para poder enriquecer y paginar en cliente
    this.api.listAll(this.current())
      .subscribe({
        next: (list) => {
          this.allItems.set(list);
          this.enrichForDisplay(list, true);
          this.loading.set(false);
        },
        error: () => { this.loading.set(false); this.error.set('No se pudo cargar'); }
      });
    // precargar padres (traer todos por no soportar filtros/offset por FK)
    if (this.current() !== 'pais') this.loadPaisesAll();
  }

  private enrichForDisplay(list: Array<CatalogItem | IdTypeItem>, repaginate = false) {
    const type = this.current();
    if (type === 'pais' || type === 'idtype') {
      this.allDisplayItems.set(list);
      this.paginate();
      return;
    }

    const rows$ = list.map(it =>
      this.api.getById<any>(type, it.id).pipe(
        switchMap(det => {
          if (type === 'provincia') {
            const paisLabel = this.paises.find(p => p.id === det?.id_pais)?.label;
            return of({ ...it, paisLabel });
          }
          if (type === 'canton') {
            const provinciaId = det?.id_provincia;
            if (!provinciaId) return of({ ...it });
            return this.api.getById<any>('provincia', provinciaId).pipe(
              map(pr => {
                const paisLabel = this.paises.find(p => p.id === pr?.id_pais)?.label;
                return { ...it, provinciaLabel: pr?.name, paisLabel };
              })
            );
          }
          if (type === 'distrito') {
            const cantonId = det?.id_canton;
            if (!cantonId) return of({ ...it });
            return this.api.getById<any>('canton', cantonId).pipe(
              switchMap(ca => {
                const provinciaId = ca?.id_provincia;
                return this.api.getById<any>('provincia', provinciaId).pipe(
                  map(pr => {
                    const paisLabel = this.paises.find(p => p.id === pr?.id_pais)?.label;
                    return { ...it, cantonLabel: ca?.name, provinciaLabel: pr?.name, paisLabel };
                  })
                );
              })
            );
          }
          return of(it);
        }),
        catchError(() => of(it))
      )
    );

    forkJoin(rows$).subscribe(rows => { this.allDisplayItems.set(rows); this.paginate(); });
  }

  // Paginador
  prev(){
    const off = this.offset();
    const lim = this.limit();
    const nextOff = Math.max(0, off - lim);
    if (nextOff !== off) { this.offset.set(nextOff); this.load(); }
  }
  next(){
    if (!this.hasMore()) return;
    const off = this.offset();
    const lim = this.limit();
    this.offset.set(off + lim);
    this.load();
  }

  private paginate(){
    const off = this.offset();
    const lim = this.limit();
    const all = this.allDisplayItems();
    const slice = all.slice(off, off + lim);
    this.displayItems.set(slice);
    this.total.set(all.length);
    this.hasMore.set(off + slice.length < all.length);
  }

  openNew(){
    this.isEdit.set(false);
    this.form.reset();
    this.modalOpen.set(true);
  }

  openEdit(it: any){
    this.isEdit.set(true);
    this.form.reset();
    const type = this.current();
    // Cargar detalle desde API para prellenar jerarquías (asumiendo que el backend retorna ids de relación)
    this.api.getById<any>(type, it.id).subscribe(det => {
      const patch: any = { id: det?.id ?? it.id, name: det?.name ?? it.name };
      if (type === 'idtype') patch.description = det?.description || '';
      if (type === 'provincia') {
        // Pre-cargar países (todos)
        this.loadPaisesAll();
        patch.id_pais = det?.id_pais ?? undefined;
      }
      if (type === 'canton') {
        // Cargar países y provincias para el país detectado
        const id_pais = det?.id_pais; // si el backend lo incluye
        const id_provincia = det?.id_provincia;
        if (id_pais) { this.loadPaisesAll(); patch.id_pais = id_pais; this.loadProvinciasAll(id_pais); }
        patch.id_provincia = id_provincia ?? undefined;
      }
      if (type === 'distrito') {
        const id_pais = det?.id_pais;
        const id_provincia = det?.id_provincia;
        const id_canton = det?.id_canton;
        if (id_pais) { this.loadPaisesAll(); patch.id_pais = id_pais; this.loadProvinciasAll(id_pais); }
        if (id_provincia) { this.loadCantonesAll(id_provincia); patch.id_provincia = id_provincia; }
        patch.id_canton = id_canton ?? undefined;
      }
      this.form.patchValue(patch, { emitEvent:false });
      this.modalOpen.set(true);
    });
  }

  // =====================
  // Helpers de carga masiva
  // =====================
  private loadPaisesAll(){
    this.api.listAll('pais', 5000)
      .subscribe(list => { this.paises = list.map(p => ({ id: (p as any).id, label: (p as any).name })); });
  }
  private loadProvinciasAll(id_pais: number){
    this.api.listAll('provincia', 10000)
      .subscribe(list => {
        const filtered = list.filter(p => (p as any).id_pais === id_pais);
        this.provincias = filtered.map(p => ({ id: (p as any).id, label: (p as any).name }));
      });
  }
  private loadCantonesAll(id_provincia: number){
    this.api.listAll('canton', 20000)
      .subscribe(list => {
        const filtered = list.filter(c => (c as any).id_provincia === id_provincia);
        this.cantones = filtered.map(c => ({ id: (c as any).id, label: (c as any).name }));
      });
  }

  closeModal(){ this.modalOpen.set(false); }

  save(){
    if (this.form.invalid) return;
    const type = this.current();
    const raw = this.form.getRawValue();
    const base: any = { name: raw.name };
    if (type === 'provincia') base.id_pais = raw.id_pais;
    if (type === 'canton') base.id_provincia = raw.id_provincia;
    if (type === 'distrito') base.id_canton = raw.id_canton;
    if (type === 'idtype') base.description = raw.description || undefined;

    this.loading.set(true); this.error.set('');
    const req = raw.id ? this.api.update(type, { id: raw.id, ...base }) : this.api.create(type, base);
    req.subscribe({
      next: () => { this.loading.set(false); this.modalOpen.set(false); this.load(); },
      error: () => { this.loading.set(false); this.error.set('No se pudo guardar'); }
    });
  }

  del(it: CatalogItem){
    if (!confirm('¿Eliminar este registro?')) return;
    this.loading.set(true);
    this.api.delete(this.current(), it.id)
      .subscribe({ next: () => { this.loading.set(false); this.load(); }, error: () => { this.loading.set(false); this.error.set('No se pudo eliminar'); } });
  }
}
