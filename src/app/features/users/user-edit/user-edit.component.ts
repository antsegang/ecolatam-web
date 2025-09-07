import { Component, OnInit, inject, signal, DestroyRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { finalize } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { UsersApi } from '../data/users.api';
import { UserDetail } from '../data/users.models';
import { CatalogsApi } from '../../catalogs/data/catalogs.api';
import { Option } from '../../catalogs/data/catalogs.models';
import { AuthService } from '@core/services/auth.service';
import { toCreateUserPayload, UserForm } from '../data/users.mappers';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss']
})
export class UserEditComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(UsersApi);
  private fb = inject(FormBuilder);
  private catalogs = inject(CatalogsApi);
  private auth = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  loading = signal<boolean>(false);
  saving = signal<boolean>(false);
  error = signal<string>('');
  ok = signal<boolean>(false);

  user = signal<UserDetail | null>(null);

  // opciones catálogos
  paises: Option[] = [];
  provincias: Option[] = [];
  cantones: Option[] = [];
  distritos: Option[] = [];

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    lastname: ['', [Validators.required, Validators.minLength(2)]],
    username: [''],
    email: ['', [Validators.email]],
    birthdate: [''],
    location: [''],
    idPais: [undefined as number | undefined],
    idProvincia: [undefined as number | undefined],
    idCanton: [undefined as number | undefined],
    idDistrito: [undefined as number | undefined],
    zip: [''],
    cellphone: [''],
    phone: [''],
  });

  routeId = computed(() => Number(this.route.snapshot.paramMap.get('id')) || 0);
  isSelf = computed(() => {
    const me = this.auth.getUser();
    if (!me) return false;
    const meId = Number(me.id);
    return meId > 0 && meId === this.routeId();
  });

  ngOnInit(): void {
    if (!this.isSelf()) {
      // si no es tu perfil, volvemos al perfil de lectura
      this.router.navigate(['/users', this.routeId()]);
      return;
    }

    this.loading.set(true);
    this.api.getById(this.routeId())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(u => {
        if (!u) { this.router.navigate(['/users']); return; }
        this.user.set(u);
        this.form.patchValue({
          name: u.name,
          lastname: u.lastname,
          username: u.username,
          email: u.email,
          birthdate: u.birthdate,
          location: u.location,
          idPais: u.idPais,
          idProvincia: u.idProvincia,
          idCanton: u.idCanton,
          idDistrito: u.idDistrito,
          zip: u.zip,
          cellphone: u.cellphone,
          phone: u.phone,
        }, { emitEvent: false });
        this.loadCatalogs(u);
      });

    // dependencias de catálogos
    this.form.controls.idPais.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(v => {
        this.provincias = []; this.cantones = []; this.distritos = [];
        this.form.patchValue({ idProvincia: undefined, idCanton: undefined, idDistrito: undefined }, { emitEvent: false });
        if (v != null) this.catalogs.provinciasByPais(v).subscribe(opts => this.provincias = opts);
      });
    this.form.controls.idProvincia.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(v => {
        this.cantones = []; this.distritos = [];
        this.form.patchValue({ idCanton: undefined, idDistrito: undefined }, { emitEvent: false });
        if (v != null) this.catalogs.cantonesByProvincia(v).subscribe(opts => this.cantones = opts);
      });
    this.form.controls.idCanton.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(v => {
        this.distritos = [];
        this.form.patchValue({ idDistrito: undefined }, { emitEvent: false });
        if (v != null) this.catalogs.distritosByCanton(v).subscribe(opts => this.distritos = opts);
      });
  }

  private loadCatalogs(u: UserDetail) {
    this.catalogs.paises().subscribe(opts => this.paises = opts);
    if (u.idPais) this.catalogs.provinciasByPais(u.idPais).subscribe(opts => this.provincias = opts);
    if (u.idProvincia) this.catalogs.cantonesByProvincia(u.idProvincia).subscribe(opts => this.cantones = opts);
    if (u.idCanton) this.catalogs.distritosByCanton(u.idCanton).subscribe(opts => this.distritos = opts);
  }

  save() {
    this.error.set(''); this.ok.set(false);
    if (this.form.invalid || !this.user()) return;
    this.saving.set(true);
    const raw = this.form.getRawValue() as UserForm;
    const payload = { id: this.user()!.id, ...toCreateUserPayload(raw) };
    this.api.update(payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => { this.ok.set(true); },
        error: (e) => { this.error.set(e?.error?.message || 'No se pudo guardar'); }
      });
  }
}

