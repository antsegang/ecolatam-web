import { Component, HostListener, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '@core/services/auth.service';
import { FluentIconComponent } from '@shared/ui/fluent-icon';

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FluentIconComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnDestroy {
  private router = inject(Router);
  private auth   = inject(AuthService);
  private sub?: Subscription;

  logoAlt = 'EcoLATAM';

  // Drawer lateral
  drawerOpen = false;

  // Scroll/HUD
  hidden = false;
  atTop  = true;
  private lastY = 0;
  private ticking = false;

  constructor() {
    // Cierra el drawer al navegar y recalcula el HUD
    this.sub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        this.drawerOpen = false;
        setTimeout(() => this.onScroll());
      });
  }

  toggleDrawer() { this.drawerOpen = !this.drawerOpen; }
  closeDrawer()  { this.drawerOpen = false; }

  // Auth helpers
  me() { return this.auth.getUser(); }
  isLogged() { return !!this.auth.getToken(); }
  roles() { return this.auth.getRoles(); }
  isAdmin() { return this.auth.hasRole(['admin','superadmin']); }
  logout(){ this.auth.logout(); this.router.navigate(['/']); }

  // Oculta al bajar, muestra al subir (umbrales suavizados)
  @HostListener('window:scroll', [])
  onScroll() {
    if (this.ticking) return;
    this.ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY || 0;
      const delta = y - this.lastY;
      this.atTop = y <= 4;

      if (!this.drawerOpen) {
        if (delta > 8 && y > 60) this.hidden = true;       // scroll down
        else if (delta < -8 || y <= 60) this.hidden = false; // scroll up o cerca del top
      }

      this.lastY = y;
      this.ticking = false;
    });
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }
}
