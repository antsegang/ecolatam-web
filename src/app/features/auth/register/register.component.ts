import { Component, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

import { UsersApi } from '@features/users/data/users.api';
import type { CreateUserPayload } from '../../users/data/users.mappers';
import { CatalogsApi } from '@features/catalogs/data/catalogs.api';
import { Option } from '@features/catalogs/data/catalogs.models';
import { AuthApi } from '@features/auth/data/auth.api';
import { AuthService } from '@core/services/auth.service';

function match(other: () => AbstractControl) {
  return (ctrl: AbstractControl) => !ctrl.parent ? null : (ctrl.value === other().value ? null : { mismatch: true });
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private catalogs = inject(CatalogsApi);
  private users = inject(UsersApi);
  private authApi = inject(AuthApi);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = signal(false);
  error = signal<string | null>(null);
  submitted = signal(false);
  showPwd = signal(false);
  showCnf = signal(false);

  // opciones (signals)
  paises = signal<Option[]>([]);
  provincias = signal<Option[]>([]);
  cantones = signal<Option[]>([]);
  distritos = signal<Option[]>([]);

  form = this.fb.nonNullable.group({
    // perfil obligatorio
    name: ['', Validators.required],
    lastname: ['', Validators.required],
    birthdate: ['', Validators.required],
    location: ['', Validators.required],
    id_pais: [{ value: '', disabled: false }, Validators.required],
    id_provincia: [{ value: '', disabled: true }, Validators.required],
    id_canton: [{ value: '', disabled: true }, Validators.required],
    id_distrito: [{ value: '', disabled: true }, Validators.required],
    zip: ['', Validators.required],
    cellphone: ['', [Validators.required, Validators.pattern(/^\d{7,11}$/)]],
    phone: ['', [Validators.required, Validators.pattern(/^\d{7,11}$/)]],


    // credenciales
    username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9._-]+$/)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirm: ['', Validators.required],

    acceptTos: [false, Validators.requiredTrue],
  });

  constructor() {
    // validar confirmación
    const pwd = this.form.controls.password;
    this.form.controls.confirm.addValidators(match(() => pwd));

    // cargar países al entrar
    this.catalogs.paises().subscribe({
      next: list => this.paises.set(list),
      error: _ => this.paises.set([])
    });

    // cuando cambia país → limpiar y habilitar provincia, cargar provincias
    this.form.controls.id_pais.valueChanges.subscribe(val => {
      this.form.controls.id_provincia.reset('');
      this.form.controls.id_canton.reset('');
      this.form.controls.id_distrito.reset('');
      this.provincias.set([]); this.cantones.set([]); this.distritos.set([]);

      if (val) {
        this.form.controls.id_provincia.enable({ emitEvent: false });
        this.catalogs.provinciasByPais(Number(val)).subscribe({
          next: list => this.provincias.set(list),
          error: _ => this.provincias.set([])
        });
      } else {
        this.form.controls.id_provincia.disable({ emitEvent: false });
        this.form.controls.id_canton.disable({ emitEvent: false });
        this.form.controls.id_distrito.disable({ emitEvent: false });
      }
    });

    // cuando cambia provincia → limpiar y habilitar cantón, cargar cantones
    this.form.controls.id_provincia.valueChanges.subscribe(val => {
      this.form.controls.id_canton.reset('');
      this.form.controls.id_distrito.reset('');
      this.cantones.set([]); this.distritos.set([]);

      if (val) {
        this.form.controls.id_canton.enable({ emitEvent: false });
        this.catalogs.cantonesByProvincia(Number(val)).subscribe({
          next: list => this.cantones.set(list),
          error: _ => this.cantones.set([])
        });
      } else {
        this.form.controls.id_canton.disable({ emitEvent: false });
        this.form.controls.id_distrito.disable({ emitEvent: false });
      }
    });

    // cuando cambia cantón → limpiar y habilitar distrito, cargar distritos
    this.form.controls.id_canton.valueChanges.subscribe(val => {
      this.form.controls.id_distrito.reset('');
      this.distritos.set([]);

      if (val) {
        this.form.controls.id_distrito.enable({ emitEvent: false });
        this.catalogs.distritosByCanton(Number(val)).subscribe({
          next: list => this.distritos.set(list),
          error: _ => this.distritos.set([])
        });
      } else {
        this.form.controls.id_distrito.disable({ emitEvent: false });
      }
    });
  }

  private normalizePhoneValue(v: string): string {
    return (v || '').replace(/\D+/g, '').slice(0, 11); // solo dígitos, máx 11
  }

  onPhoneInput(ctrl: 'cellphone' | 'phone') {
    const c = this.form.controls[ctrl];
    const cleaned = this.normalizePhoneValue(c.value as string);
    if (c.value !== cleaned) c.setValue(cleaned, { emitEvent: false });
  }


  togglePwd() { this.showPwd.update(v => !v); }
  toggleCnf() { this.showCnf.update(v => !v); }

  submit() {
    this.submitted.set(true);
    this.error.set(null);
    if (this.form.invalid) return;

    this.loading.set(true);
    const raw = this.form.getRawValue();

    const payload: CreateUserPayload = {
      id: 0,
      name: raw.name,
      lastname: raw.lastname,
      birthdate: raw.birthdate,
      location: raw.location,
      id_pais: Number(raw.id_pais),
      id_provincia: Number(raw.id_provincia),
      id_canton: Number(raw.id_canton),
      id_distrito: Number(raw.id_distrito),
      zip: raw.zip,
      cellphone: this.normalizePhoneValue(raw.cellphone),
      phone: this.normalizePhoneValue(raw.phone),
      username: raw.username,
      email: raw.email,
      password: raw.password,
    };

    this.users.create(payload).subscribe({
      next: () => {
        // login automático
        this.authApi.login(raw.username, raw.password).subscribe({
          next: ({ token, user }) => {
            this.auth.setToken(token);
            this.auth.setUser(user);
            const redirect = this.route.snapshot.queryParamMap.get('redirectTo') || '/users';
            this.router.navigateByUrl(redirect);
          },
          error: _ => {
            this.router.navigate(['/login'], { queryParams: { username: raw.username } });
          }
        });
      },
      error: (e) => {
        const msg = e?.error?.body || e?.error?.message || e?.message || 'No se pudo completar el registro.';
        this.error.set(typeof msg === 'string' ? msg : 'Error en el registro');
        this.loading.set(false);
      }
    });
  }
}
