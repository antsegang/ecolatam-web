import { Component, HostListener, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { SearchService, SearchResult } from '@core/services/search.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

type MenuItem = {
  label: string;
  path?: string;        // rutas internas
  external?: string;    // enlaces externos
  exact?: boolean;      // match exacto para Home
  children?: MenuItem[]; // submenú
};

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ReactiveFormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnDestroy {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private search = inject(SearchService);
  private sub?: Subscription;

  logoAlt = 'EcoLATAM™';

  // Menú principal (solo exponer; la protección la hace el guard en rutas)
  menu: MenuItem[] = [
    { label: 'Inicio',      path: '/', exact: true },
    {
      label: 'Explorar',
      children: [
        { label: 'EcoGuía', path: '/ecoguia' },
        { label: 'Social',  path: '/social'  },
        { label: 'Soluciones', path: '/solutions' },
      ]
    },
    {
      label: 'Sobre',
      children: [
        { label: 'Nosotros', path: '/about' },
        { label: 'Contacto', path: '/contact' },
        { label: 'Blog',     path: '/blog' },
      ]
    },
    { label: 'Gateway IPFS', external: 'https://ipfs.ecolatam.com' }
  ];

  mobileOpen = false;
  openGroups: Record<number, boolean> = {};

  // Buscar en header
  searchOpen = false;
  searchForm = this.fb.nonNullable.group({ q: [''] });
  results: SearchResult[] = [];

  // Scroll/HUD
  hidden = false;
  atTop  = true;
  private lastY = 0;
  private ticking = false;

  constructor() {
    // Cierra el menú al navegar
    this.sub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => (this.mobileOpen = false));

    // Buscar con debounce en header
    this.searchForm.controls.q.valueChanges
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap(q => {
          const term = (q || '').trim();
          if (term.length < 2) { this.results = []; return of([] as SearchResult[]); }
          return this.search.search(term);
        })
      )
      .subscribe(res => { this.results = res; this.searchOpen = !!res.length; });
  }

  toggleMobile() { this.mobileOpen = !this.mobileOpen; }
  closeMobile()  { this.mobileOpen = false; }
  toggleGroup(i: number) { this.openGroups[i] = !this.openGroups[i]; }

  openSearch() { this.searchOpen = true; }
  closeSearch() { this.searchOpen = false; }
  submitSearch() {
    const term = this.searchForm.getRawValue().q?.trim();
    if (!term) return;
    this.router.navigate(['/ecoguia'], { queryParams: { q: term }});
    this.closeSearch();
  }

  // Oculta al bajar, muestra al subir (umbral 12px)
  @HostListener('window:scroll', [])
  onScroll() {
    if (this.ticking) return;
    this.ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY || 0;
      const delta = y - this.lastY;
      this.atTop = y <= 4;

      if (!this.mobileOpen) {
        if (delta > 12 && y > 80) this.hidden = true;       // scroll down
        else if (delta < -12 || y <= 80) this.hidden = false; // scroll up o cerca del top
      }

      this.lastY = y;
      this.ticking = false;
    });
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }
}
