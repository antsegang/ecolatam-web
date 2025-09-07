import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { EcoguiaApi } from '../data/ecoguia.api';
import { ServiceItem } from '../data/ecoguia.models';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './service-detail.component.html',
  styleUrls: ['./service-detail.component.scss']
})
export class ServiceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(EcoguiaApi);
  loading = signal<boolean>(false);
  data = signal<ServiceItem | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;
    this.loading.set(true);
    this.api.getService(id).subscribe({ next: (d) => { this.data.set(d); this.loading.set(false); }, error: () => this.loading.set(false) });
  }
}

