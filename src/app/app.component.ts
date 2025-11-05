import { Component, AfterViewInit, OnDestroy, Inject, PLATFORM_ID, HostListener, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { SmartLoaderComponent } from './shared/smart-loader/smart-loader.component';
import { SmartLoaderService } from './shared/smart-loader/smart-loader.service';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, SmartLoaderComponent],
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html',
})
export class AppComponent implements AfterViewInit, OnDestroy {
  private smoother: any | null = null;

  scrollPct = 0;
  private isBrowser = false;
  loader = inject(SmartLoaderService);
  active = this.loader.active;   // signal<boolean>
  message = this.loader.message; // signal<string>

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (!this.isBrowser) return;
    // primer cálculo
    this.updateProgress();
    // recalcular después de cargar imágenes/contenido
    window.addEventListener('load', this.updateProgress, { passive: true, once: true });
    // fallback por si el contenido se expande (fuentes, imágenes tardías)
    setTimeout(this.updateProgress, 400);
    setTimeout(this.updateProgress, 1200);
  }

  // Scroll y Resize
  @HostListener('window:scroll', ['$event'])
  onScroll() { if (this.isBrowser) this.updateProgress(); }

  @HostListener('window:resize', ['$event'])
  onResize() { if (this.isBrowser) this.updateProgress(); }

  // Cálculo del % leído
  updateProgress = () => {
    const doc = document.documentElement;
    const body = document.body;

    const scrollTop = window.pageYOffset || doc.scrollTop || body.scrollTop || 0;

    // altura total scrolleable (contenido - viewport)
    const docHeight = Math.max(
      body.scrollHeight, doc.scrollHeight,
      body.offsetHeight, doc.offsetHeight,
      body.clientHeight, doc.clientHeight
    );

    const winH = window.innerHeight || doc.clientHeight;
    const scrollable = Math.max(1, docHeight - winH); // evita div/0

    const pct = Math.min(100, Math.max(0, (scrollTop / scrollable) * 100));
    this.scrollPct = Math.round(pct);
  };

  async ngAfterViewInit() {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    try {
      // Cargas dinámicas para no romper si no está el plugin
      const gsapMod = await import('gsap');
      const stMod = await import('gsap/ScrollTrigger');
      const smMod = await import('gsap/ScrollSmoother');

      const GSAP = (gsapMod as any).gsap || (gsapMod as any).default || gsapMod;
      const ScrollTrigger = (stMod as any).ScrollTrigger;
      const ScrollSmoother = (smMod as any).ScrollSmoother;

      if (!GSAP || !ScrollTrigger || !ScrollSmoother) return;
      GSAP.registerPlugin(ScrollTrigger, ScrollSmoother);

      // 💡 Aumenta smooth y activa smoothTouch para notar el efecto
      this.smoother = ScrollSmoother.create({
        wrapper: '#smooth-wrapper',
        content: '#smooth-content',
        smooth: 1.45,         // sube el “feeling” (1.3–1.8 recomendado)
        smoothTouch: 0.18,    // suaviza un poco en móviles/touch (0 desactiva)
        normalizeScroll: true,
        ignoreMobileResize: true,
        effects: true,        // habilita data-speed / data-lag
      });

      // Inyecta efectos visibles sin tocar templates
      this.addSmootherEffects();

      // Tras montar todo, refresca triggers
      requestAnimationFrame(() => ScrollTrigger.refresh());
    } catch {
      // sin plugin -> continúa sin smoother
    }
  }

  ngOnDestroy(): void {
    this.smoother?.kill?.();
  }

  // Añade data-speed/data-lag a elementos ya existentes (solo si están)
  private addSmootherEffects() {
    const speed = (sel: string, v: string) =>
      document.querySelectorAll<HTMLElement>(sel).forEach(el => el.setAttribute('data-speed', v));

    const lag = (sel: string, v: string) =>
      document.querySelectorAll<HTMLElement>(sel).forEach(el => el.setAttribute('data-lag', v));

    // Parallax sutil
    speed('.hero-art img, .chapter .media img, .feature-img', '0.9');     // 0.9 = se mueve un poco más lento
    speed('.roles-track', '1.05');                                        // 1.05 = un pelín más rápido

    // Micro inercia en tarjetas/bloques
    lag('.card, .step, .role-card, .kpi-tiles .tile', '0.12');

    // Si en algún bloque no te gusta, pon data-lag="0" directo en el HTML de ese bloque.
  }
}
