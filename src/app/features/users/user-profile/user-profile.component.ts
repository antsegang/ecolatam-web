import { Component, OnInit, inject, signal, DestroyRef, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { UsersApi } from '../data/users.api';
import { UserDetail } from '../data/users.models';

import { of, forkJoin } from 'rxjs';
import { map, filter, switchMap, tap, catchError, finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Ajusta paths si tu estructura difiere
import { CatalogsApi } from '../../catalogs/data/catalogs.api';
import { Option } from '../../catalogs/data/catalogs.models';

type Tab = 'posts' | 'about' | 'activity';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  private route    = inject(ActivatedRoute);
  private api      = inject(UsersApi);
  private catalogs = inject(CatalogsApi);
  private destroyRef = inject(DestroyRef);

  loading = signal(true);
  user    = signal<UserDetail | null>(null);

  // UI state (tabs / posts)
  tab = signal<Tab>('posts');
  posts = signal<Array<{
    id: number;
    content: string;
    createdAt: string; // ISO
  }>>([]); // aprovisionado; luego lo cargas del API

  // Stats aprovisionados
  stats = computed(() => ({
    posts: this.posts().length,
    followers: 0,  // TODO: conectar cuando tengas API
    following: 0
  }));

  // Labels de catálogos
  private paisLabel      = signal<string | undefined>(undefined);
  private provinciaLabel = signal<string | undefined>(undefined);
  private cantonLabel    = signal<string | undefined>(undefined);
  private distritoLabel  = signal<string | undefined>(undefined);

  // Etiqueta compuesta (Provincia, Cantón, Distrito)
  locationLabel = computed(() => {
    const parts = [this.provinciaLabel(), this.cantonLabel(), this.distritoLabel()].filter(Boolean) as string[];
    return parts.length ? parts.join(', ') : undefined;
  });

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map(pm => Number(pm.get('id'))),
        tap(() => this.loading.set(true)),
        filter(id => Number.isFinite(id)),
        switchMap(id =>
          this.api.getById(id).pipe(
            catchError(() => of(null)),
            finalize(() => this.loading.set(false))
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(u => {
        this.user.set(u);
        if (u) this.loadCatalogLabels(u);
        // TODO: cuando tengas endpoint, carga publicaciones del usuario:
        // this.loadPosts(u.id);
      });
  }

  // ─── Catálogos ────────────────────────────────────────────────────────────────
  private findLabel(list: Option[], id?: number): string | undefined {
    if (id == null) return undefined;
    const item = list.find(o => o.id === id);
    return item?.label;
  }

  private loadCatalogLabels(u: UserDetail) {
    forkJoin({
      paises:     this.catalogs.paises().pipe(catchError(() => of<Option[]>([]))),
      provincias: u.idPais      ? this.catalogs.provinciasByPais(u.idPais).pipe(catchError(() => of<Option[]>([]))) : of<Option[]>([]),
      cantones:   u.idProvincia ? this.catalogs.cantonesByProvincia(u.idProvincia).pipe(catchError(() => of<Option[]>([]))) : of<Option[]>([]),
      distritos:  u.idCanton    ? this.catalogs.distritosByCanton(u.idCanton).pipe(catchError(() => of<Option[]>([]))) : of<Option[]>([]),
    })
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(({ paises, provincias, cantones, distritos }) => {
      this.paisLabel.set(this.findLabel(paises, this.user()?.idPais));
      this.provinciaLabel.set(this.findLabel(provincias, this.user()?.idProvincia));
      this.cantonLabel.set(this.findLabel(cantones, this.user()?.idCanton));
      this.distritoLabel.set(this.findLabel(distritos, this.user()?.idDistrito));
    });
  }

  // ─── Tabs ────────────────────────────────────────────────────────────────────
  setTab(t: Tab) { this.tab.set(t); }
  isTab(t: Tab)  { return this.tab() === t; }

  // Exponer labels al template
  getPaisLabel()      { return this.paisLabel(); }
  getProvinciaLabel() { return this.provinciaLabel(); }
  getCantonLabel()    { return this.cantonLabel(); }
  getDistritoLabel()  { return this.distritoLabel(); }
}
