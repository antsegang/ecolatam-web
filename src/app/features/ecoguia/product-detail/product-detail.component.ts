import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EcoguiaApi } from '../data/ecoguia.api';
import { ProductItem } from '../data/ecoguia.models';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(EcoguiaApi);
  loading = signal<boolean>(false);
  data = signal<ProductItem | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;
    this.loading.set(true);
    this.api.getProduct(id).subscribe({ next: (d) => { this.data.set(d); this.loading.set(false); }, error: () => this.loading.set(false) });
  }
}

