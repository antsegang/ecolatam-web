import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AdminCategoriesApi, BusinessCategory } from '@features/admin/data/admin-categories.api';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-categories.component.html',
  styleUrls: ['./admin-categories.component.scss']
})
export class AdminCategoriesComponent {
  private fb = inject(FormBuilder);
  private api = inject(AdminCategoriesApi);

  // Estado
  loading = signal(false);
  error = signal('');
  items = signal<BusinessCategory[]>([]);
  display = signal<BusinessCategory[]>([]);
  total = signal<number>(0);
  limit = signal<number>(25);
  offset = signal<number>(0);
  hasMore = signal<boolean>(false);

  // Modal
  modalOpen = signal(false);
  isEdit = signal(false);

  form = this.fb.nonNullable.group({
    id: [undefined as number | undefined],
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
  });

  constructor(){ this.load(); }

  private paginate(){
    const off = this.offset();
    const lim = this.limit();
    const all = this.items();
    const slice = all.slice(off, off + lim);
    this.display.set(slice);
    this.total.set(all.length);
    this.hasMore.set(off + slice.length < all.length);
  }

  load(){
    this.loading.set(true); this.error.set('');
    this.api.listAll(2000).subscribe({
      next: (list) => { this.items.set(list); this.offset.set(0); this.paginate(); this.loading.set(false); },
      error: () => { this.loading.set(false); this.error.set('No se pudo cargar'); }
    });
  }

  prev(){ const off = this.offset(); const lim = this.limit(); if (off>0){ this.offset.set(Math.max(0, off-lim)); this.paginate(); } }
  next(){ if (this.hasMore()){ const off=this.offset(); const lim=this.limit(); this.offset.set(off+lim); this.paginate(); } }

  openNew(){ this.isEdit.set(false); this.form.reset(); this.modalOpen.set(true); }
  openEdit(it: BusinessCategory){ this.isEdit.set(true); this.form.reset(); this.form.patchValue({ id: it.id, name: it.name, description: it.description || '' }); this.modalOpen.set(true); }
  closeModal(){ this.modalOpen.set(false); }

  save(){
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    const body: any = { name: raw.name };
    if (raw.description) body.description = raw.description;
    this.loading.set(true); this.error.set('');
    const req = raw.id ? this.api.update({ id: raw.id!, ...body }) : this.api.create(body);
    req.subscribe({ next: () => { this.loading.set(false); this.modalOpen.set(false); this.load(); }, error: () => { this.loading.set(false); this.error.set('No se pudo guardar'); } });
  }

  del(it: BusinessCategory){ if (!confirm('¿Eliminar categoría?')) return; this.loading.set(true); this.api.delete(it.id).subscribe({ next:()=>{ this.loading.set(false); this.load(); }, error:()=>{ this.loading.set(false); this.error.set('No se pudo eliminar'); } }); }
}

