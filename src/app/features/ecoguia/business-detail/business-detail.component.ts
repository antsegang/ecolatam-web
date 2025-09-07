import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, switchMap } from 'rxjs/operators';
import { EcoguiaApi } from '../data/ecoguia.api';
import { BusinessDetail, Page, ProductItem, ServiceItem } from '../data/ecoguia.models';

@Component({
  selector: 'app-business-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './business-detail.component.html',
  styleUrls: ['./business-detail.component.scss']
})
export class BusinessDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(EcoguiaApi);

  loading = signal<boolean>(false);
  detail = signal<BusinessDetail | null>(null);
  products = signal<Page<ProductItem> | null>(null);
  services = signal<Page<ServiceItem> | null>(null);

  // Exponer Math en template (para cálculos simples en paginación)
  Math = Math;

  readonly limit = 8;
  private id!: number;
  private prodOffset = 0;
  private servOffset = 0;

  ngOnInit(): void {
    this.route.paramMap
      .pipe(switchMap(pm => {
        this.id = Number(pm.get('id'));
        this.loading.set(true);
        return this.api.getBusiness(this.id);
      }))
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(d => {
        this.detail.set(d);
        if (this.id) {
          this.loadProducts(0);
          this.loadServices(0);
        }
      });
  }

  loadProducts(offset = 0): void {
    if (!this.id) return;
    this.prodOffset = offset;
    this.api.productsByBusiness(this.id, { limit: this.limit, offset })
      .subscribe(p => this.products.set(p));
  }

  loadServices(offset = 0): void {
    if (!this.id) return;
    this.servOffset = offset;
    this.api.servicesByBusiness(this.id, { limit: this.limit, offset })
      .subscribe(s => this.services.set(s));
  }
}
