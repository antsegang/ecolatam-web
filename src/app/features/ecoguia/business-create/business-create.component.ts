import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { EcoguiaApi } from '../data/ecoguia.api';
import { CatalogsApi } from '../../catalogs/data/catalogs.api';
import { Option } from '../../catalogs/data/catalogs.models';
import { CreateBusinessPayloadDTO, BusinessKycPayloadDTO } from '../data/ecoguia.dto';
import { AdminCategoriesApi } from '@features/admin/data/admin-categories.api';
import { AuthService } from '@core/services/auth.service';
import { KycApi } from '@features/users/data/kyc.api';

class BusinessBuilder {
  private dto: Partial<CreateBusinessPayloadDTO> = {};
  setBasic(name: string) { this.dto.name = name; return this; }
  setPhone(phone: string){ this.dto.phone = phone; return this; }
  setCategory(id_bcategory: number){ this.dto.id_bcategory = id_bcategory; return this; }
  setAddressLine(location: string, zip: string){ this.dto.location = location; this.dto.zip = zip; return this; }
  setLocation(id_pais: number, id_provincia: number, id_canton: number, id_distrito: number) {
    this.dto.id_pais = id_pais; this.dto.id_provincia = id_provincia; this.dto.id_canton = id_canton; this.dto.id_distrito = id_distrito; return this;
  }
  build(): CreateBusinessPayloadDTO { return this.dto as CreateBusinessPayloadDTO; }
}

class KycBuilder {
  private dto: BusinessKycPayloadDTO = {};
  setLegal(legal_name?: string, tax_id?: string) { this.dto.legal_name = legal_name || null; this.dto.tax_id = tax_id || null; return this; }
  setRepresentative(name?: string, id?: string) { this.dto.representative_name = name || null; this.dto.representative_id = id || null; return this; }
  setAddress(address?: string) { this.dto.address = address || null; return this; }
  build(): BusinessKycPayloadDTO { return this.dto; }
}

@Component({
  selector: 'app-business-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './business-create.component.html',
  styleUrls: ['./business-create.component.scss']
})
export class BusinessCreateComponent {
  private fb = inject(FormBuilder);
  private api = inject(EcoguiaApi);
  private catalogs = inject(CatalogsApi);
  private adminCategories = inject(AdminCategoriesApi);
  private router = inject(Router);
  private auth = inject(AuthService);
  private kycApi = inject(KycApi);

  // Estado UI
  step = signal<1 | 2 | 3>(1);
  loading = signal(false);
  createdId = signal<number | null>(null);
  error = signal('');
  infoKycPostpuesto = signal(false);

  // CatÃ¡logos
  paises: Option[] = []; provincias: Option[] = []; cantones: Option[] = []; distritos: Option[] = [];
  categorias: Option[] = [];

  // Formulario (solo campos esperados por el backend)
  formBasic = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required]],
    idCategory: [undefined as number | undefined, [Validators.required]],
    location: ['', [Validators.required]],
    zip: ['', [Validators.required]],
    idPais: [undefined as number | undefined, [Validators.required]],
    idProvincia: [undefined as number | undefined, [Validators.required]],
    idCanton: [undefined as number | undefined, [Validators.required]],
    idDistrito: [undefined as number | undefined, [Validators.required]],
  });

  formKyc = this.fb.nonNullable.group({
    legal_name: [''],
    tax_id: [''],
    representative_name: [''],
    representative_id: [''],
    address: [''],
  });

  constructor() {
    // Gate KYC por tabla (superadmin puede pasar)
    const uid = this.auth.getUserId();
    const roles = this.auth.getRoles();
    const isSuperAdmin = roles.includes('superadmin');
    if (!isSuperAdmin && uid) {
      this.kycApi.getByUserId(uid).subscribe(dto => {
        const approved = !!dto?.approve && !!dto?.approved_at;
        if (!approved) {
          alert('Debes completar y tener aprobado el KYC de usuario antes de crear un negocio.');
          this.router.navigate(['/users', uid]);
          return;
        }
      });
    }

    // Cargar catÃ¡logos
    this.adminCategories.listAll(2000).subscribe(list => {
      this.categorias = (list || []).map(c => ({ id: c.id, label: c.name }));
    });
    this.catalogs.paises().subscribe(o => this.paises = o);
    this.formBasic.controls.idPais.valueChanges.subscribe(v => {
      this.provincias = []; this.cantones = []; this.distritos = [];
      this.formBasic.patchValue({ idProvincia: undefined, idCanton: undefined, idDistrito: undefined }, { emitEvent: false });
      if (v != null) this.catalogs.provinciasByPais(v).subscribe(o => this.provincias = o);
    });
    this.formBasic.controls.idProvincia.valueChanges.subscribe(v => {
      this.cantones = []; this.distritos = [];
      this.formBasic.patchValue({ idCanton: undefined, idDistrito: undefined }, { emitEvent: false });
      if (v != null) this.catalogs.cantonesByProvincia(v).subscribe(o => this.cantones = o);
    });
    this.formBasic.controls.idCanton.valueChanges.subscribe(v => {
      this.distritos = [];
      this.formBasic.patchValue({ idDistrito: undefined }, { emitEvent: false });
      if (v != null) this.catalogs.distritosByCanton(v).subscribe(o => this.distritos = o);
    });
  }

  nextFromBasic() {
    this.error.set('');
    if (this.formBasic.invalid) return;
    const b = new BusinessBuilder()
      .setBasic(this.formBasic.value.name!)
      .setPhone(this.formBasic.value.phone!)
      .setCategory(this.formBasic.value.idCategory!)
      .setAddressLine(this.formBasic.value.location!, this.formBasic.value.zip!)
      .setLocation(this.formBasic.value.idPais!, this.formBasic.value.idProvincia!, this.formBasic.value.idCanton!, this.formBasic.value.idDistrito!)
      .build();
    this.loading.set(true);
    this.api.createBusiness(b)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ id }) => { this.createdId.set(id); this.step.set(2); },
        error: (e) => this.error.set(e?.error?.message || 'No se pudo crear el negocio')
      });
  }

  submitKyc() {
    const id = this.createdId();
    if (!id) return;
    this.error.set('');
    const k = new KycBuilder()
      .setLegal(this.formKyc.value.legal_name!, this.formKyc.value.tax_id!)
      .setRepresentative(this.formKyc.value.representative_name!, this.formKyc.value.representative_id!)
      .setAddress(this.formKyc.value.address!)
      .build();
    this.loading.set(true);
    this.api.submitBusinessKyc(id, k)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => this.step.set(3),
        error: (e) => this.error.set(e?.error?.message || 'No se pudo enviar KYC')
      });
  }

  skipKyc() {
    this.infoKycPostpuesto.set(true);
    this.step.set(3);
  }
}

