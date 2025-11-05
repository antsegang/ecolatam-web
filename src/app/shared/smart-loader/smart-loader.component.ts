import { Component, Input, AfterViewInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';

@Component({
  selector: 'app-smart-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './smart-loader.component.html',
  styleUrls: ['./smart-loader.component.scss']
})
export class SmartLoaderComponent implements AfterViewInit, OnDestroy {

  /** Activa/desactiva el loader manualmente */
  @Input() active = false;

  /** Mensaje opcional bajo el loader */
  @Input() message = '';

  /** Si true, observa cambios de rutas y se muestra mientras cargan */
  @Input() watchRouter = false;

  /** Tiempo (ms) para la animación de “split reveal” al cerrar */
  @Input() closeDuration = 650;

  /** Flag interno para correr la anim de cierre */
  isClosing = false;

  /** Si se proyectó un loader personalizado */
  hasProjectedLoader = false;

  private router = inject(Router, { optional: true });
  private sub: any;
  private closeTimer: any;

  ngAfterViewInit(): void {
    if (this.watchRouter && this.router) {
      this.sub = this.router.events.subscribe(evt => {
        if (evt instanceof NavigationStart) {
          this.show();
        } else if (
          evt instanceof NavigationEnd ||
          evt instanceof NavigationCancel ||
          evt instanceof NavigationError
        ) {
          this.hide();
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
    if (this.closeTimer) clearTimeout(this.closeTimer);
  }

  /** Métodos públicos para controlarlo desde afuera si lo necesitas */
  show(message?: string){
    if (message) this.message = message;
    this.isClosing = false;
    this.active = true;
  }

  hide(){
    // Dispara animación de paneles, luego apaga
    if (!this.active) return;
    this.isClosing = true;
    if (this.closeTimer) clearTimeout(this.closeTimer);
    this.closeTimer = setTimeout(() => {
      this.active = false;
      this.isClosing = false;
    }, this.closeDuration);
  }
}
