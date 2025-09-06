import { Component, HostListener, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

type MenuItem = {
  label: string;
  path?: string;        // rutas internas
  external?: string;    // enlaces externos
  exact?: boolean;      // match exacto para Home
};

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnDestroy {
  private router = inject(Router);
  private sub?: Subscription;

  logoAlt = 'EcoLATAM™';

  // Menú principal (solo exponer; la protección la hace el guard en rutas)
  menu: MenuItem[] = [
    { label: 'Inicio',      path: '/',           exact: true },
    { label: 'Soluciones',  path: '/solutions' },
    { label: 'EcoGuía',     path: '/ecoguia'   },   // protegida por guard en rutas
    { label: 'Social',      path: '/social'    },   // protegida por guard en rutas
    { label: 'Blog',        path: '/blog'      },
    { label: 'Nosotros',    path: '/about'     },
    { label: 'Contacto',    path: '/contact'   },
    { label: 'Gateway IPFS', external: 'https://ipfs.ecolatam.com' }
  ];

  mobileOpen = false;

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
  }

  toggleMobile() { this.mobileOpen = !this.mobileOpen; }
  closeMobile()  { this.mobileOpen = false; }

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
