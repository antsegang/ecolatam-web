import { Component, OnInit, inject, signal, DestroyRef, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { UsersApi } from '../data/users.api';
import { UserDetail } from '../data/users.models';

import { of, forkJoin } from 'rxjs';
import { map, filter, switchMap, tap, catchError, finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// Ajusta paths si tu estructura difiere
import { CatalogsApi } from '../../catalogs/data/catalogs.api';
import { Option } from '../../catalogs/data/catalogs.models';
import { AuthService } from '@core/services/auth.service';
import { KycApi, UserKycDTO } from '../data/kyc.api';
import { IpfsService } from '@core/services/ipfs.service';

type Tab = 'posts' | 'about' | 'activity';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, ReactiveFormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  private route    = inject(ActivatedRoute);
  private api      = inject(UsersApi);
  private catalogs = inject(CatalogsApi);
  private destroyRef = inject(DestroyRef);
  private auth     = inject(AuthService);
  private kycApi   = inject(KycApi);
  private ipfs     = inject(IpfsService);
  private fb       = inject(FormBuilder);

  loading = signal(true);
  user    = signal<UserDetail | null>(null);
  userKyc = signal<UserKycDTO | null>(null);

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

  // Propiedades derivadas
  readonlyRouteId = computed(() => Number(this.route.snapshot.paramMap.get('id')) || 0);
  isSelf = computed(() => {
    const me = this.auth.getUser();
    if (!me) return false;
    const meIdNum = Number(me.id);
    return meIdNum > 0 && meIdNum === this.readonlyRouteId();
  });
  myRoles = computed<string[]>(() => this.isSelf() ? this.auth.getRoles() : []);
  kycPassed = computed<boolean>(() => !!this.userKyc()?.approve && !!this.userKyc()?.approved_at)

  // Labels de catÃ¡logos
  private paisLabel      = signal<string | undefined>(undefined);
  private provinciaLabel = signal<string | undefined>(undefined);
  private cantonLabel    = signal<string | undefined>(undefined);
  private distritoLabel  = signal<string | undefined>(undefined);

  // Etiqueta compuesta (Provincia, CantÃ³n, Distrito)
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
      .subscribe(u => { this.user.set(u); if (u) { this.loadCatalogLabels(u); this.kycApi.getByUserId(u.id).pipe(catchError(() => of(null))).subscribe(dto => this.userKyc.set(dto)); } });
  }

  // â”€â”€â”€ CatÃ¡logos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€â”€ Tabs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  setTab(t: Tab) { this.tab.set(t); }
  isTab(t: Tab)  { return this.tab() === t; }

  // Exponer labels al template
  getPaisLabel()      { return this.paisLabel(); }
  getProvinciaLabel() { return this.provinciaLabel(); }
  getCantonLabel()    { return this.cantonLabel(); }
  getDistritoLabel()  { return this.distritoLabel(); }
  // --- Modal KYC ---
  kycOpen = signal(false);
  kycSubmitting = signal(false);
  kycError = signal('');
  kycForm = this.fb.nonNullable.group({
    id_idtype: [undefined as number | undefined, [Validators.required]],
    identity: ['', [Validators.required, Validators.minLength(3)]],
    pictures: [undefined as FileList | undefined, [Validators.required]],
  });

  openKycModal(){ this.kycError.set(''); this.kycForm.reset(); this.kycOpen.set(true); }
  closeKycModal(){ if (!this.kycSubmitting()) this.kycOpen.set(false); }

  async submitKycModal(){
    const u = this.user(); if (!u) return;
    this.kycError.set('');
    if (this.kycForm.invalid) { this.kycError.set('Completa todos los campos'); return; }
    const { id_idtype, identity } = this.kycForm.getRawValue();
    const files = this.kycForm.controls.pictures.value as FileList;
    const list: File[] = files ? Array.from(files) : [];
    if (!list.length) { this.kycError.set('Adjunta al menos una imagen'); return; }
    this.kycSubmitting.set(true);
    try{
      const uploaded = await this.ipfs.uploadEncrypted(list, u.id);
      const pictures = uploaded.map(x => ({ cid: x.cid, iv: x.iv }));
      await this.kycApi.submit({ id_user: u.id, id_idtype: id_idtype!, identity: identity!, pictures }).toPromise();
      this.kycSubmitting.set(false);
      this.kycOpen.set(false);
      this.kycApi.getByUserId(u.id).pipe(catchError(() => of(null))).subscribe(dto => this.userKyc.set(dto));
    } catch(e) {
      this.kycSubmitting.set(false);
      this.kycError.set('No se pudo enviar KYC');
    }
  }
}
