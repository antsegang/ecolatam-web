import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { gsap } from 'gsap';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html',
})
export class AppComponent implements AfterViewInit, OnDestroy {
  private smoother: any | null = null;

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
