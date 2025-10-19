import {
  Component, AfterViewInit, OnDestroy, Inject, PLATFORM_ID, ViewChild, ElementRef, inject
} from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Application } from '@splinetool/runtime';

type OdsCard = {
  id: number;
  title: string;
  img: string;     // ruta a icono oficial ODS (assets/ods/sdg-<id>.png | .svg)
  relation: 'Directo' | 'Indirecto';
  text: string;    // explicación corta
  bullets?: string[];
};

@Component({
  selector: 'app-ods-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ods-page.component.html',
  styleUrls: ['./ods-page.component.scss'],
})
export class OdsPageComponent implements AfterViewInit, OnDestroy {
  @ViewChild('splineCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private readonly isBrowser: boolean;
  private spline?: Application;
  private io?: IntersectionObserver;
  private headerH = 84;
  private triggers: ScrollTrigger[] = [];

  private title = inject(Title);
  private meta  = inject(Meta);
  private doc   = inject(DOCUMENT);

  // ======== DATA ========
  main: OdsCard[] = [
    {
      id: 6, title: 'Agua limpia y saneamiento', img: '/ods/sdg-6.jpg', relation: 'Directo',
      text: 'Soportamos MRV hídrico y trazabilidad de datos de calidad de agua.',
      bullets: [
        'Pipelines IPFS + metadatos verificables',
        'Auditoría pública con CIDs y versionado',
        'Integración a tableros y alertas locales'
      ]
    },
    {
      id: 7, title: 'Energía asequible y no contaminante', img: '/ods/sdg-7.jpg', relation: 'Directo',
      text: 'Facilitamos evidencia de eficiencia energética y renovables.',
      bullets: [
        'Registro de mediciones y reportes por CID',
        'Sellos de tiempo / anclaje on-chain',
        'Visualizaciones abiertas para toma de decisiones'
      ]
    },
    {
      id: 11, title: 'Ciudades y comunidades sostenibles', img: '/ods/sdg-11.jpg', relation: 'Directo',
      text: 'Impulsamos datos abiertos y participación para resiliencia urbana.',
      bullets: [
        'Plataforma social para retos y co-creación',
        'EcoGuía con recursos y plantillas',
        'Trazabilidad de proyectos y evidencia pública'
      ]
    },
    {
      id: 13, title: 'Acción por el clima', img: '/ods/sdg-13.jpg', relation: 'Directo',
      text: 'Infraestructura para MRV ambiental, inventarios y transparencia.',
      bullets: [
        'Versionado, control de cambios y auditoría',
        'Convergencia de CSV/GeoJSON con esquema',
        'Alertas y seguimiento de metas climáticas'
      ]
    },
  ];

  xcut: OdsCard[] = [
    {
      id: 3, title: 'Salud y bienestar', img: '/ods/sdg-3.jpg', relation: 'Indirecto',
      text: 'Mejorando calidad ambiental (agua/aire) con datos trazables.'
    },
    {
      id: 4, title: 'Educación de calidad', img: '/ods/sdg-4.jpg', relation: 'Directo',
      text: 'EcoGuía y comunidad para capacitación y transferencia de conocimiento.'
    },
    {
      id: 5, title: 'Igualdad de género', img: '/ods/sdg-5.jpg', relation: 'Indirecto',
      text: 'Diseño inclusivo y participación diversa en la plataforma social.'
    },
    {
      id: 9, title: 'Industria, innovación e infraestructura', img: '/ods/sdg-9.jpg', relation: 'Directo',
      text: 'IPFS, identidad y trazabilidad como base para innovación abierta.'
    },
    {
      id: 12, title: 'Producción y consumo responsables', img: '/ods/sdg-12.jpg', relation: 'Directo',
      text: 'Rastreo de ciclos de vida y evidencias de sostenibilidad por CID.'
    },
    {
      id: 16, title: 'Paz, justicia e instituciones sólidas', img: '/ods/sdg-16.jpg', relation: 'Indirecto',
      text: 'Gobernanza de datos, moderación y rendición de cuentas transparentes.'
    },
    {
      id: 17, title: 'Alianzas para lograr los objetivos', img: '/ods/sdg-17.jpg', relation: 'Directo',
      text: 'Cocreación multiactor (academia, gobierno, startups) con datos abiertos.'
    },
  ];

  // Cambia esta escena si quieres un header 3D distinto
  private sceneUrl = 'https://prod.spline.design/t8zl2y0f4hMgPYfR/scene.splinecode';

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    // SEO
    this.title.setTitle('ODS priorizados – EcoLATAM');
    this.meta.updateTag({
      name: 'description',
      content: 'ODS priorizados por EcoLATAM: enfoque en 6, 7, 11, 13 y trabajo transversal en 3, 4, 5, 9, 12, 16, 17 con datos verificables e IPFS.'
    });

    // Header height para cálculos
    const header = this.doc.querySelector<HTMLElement>('app-site-header');
    if (header) this.headerH = Math.max(56, Math.min(120, header.getBoundingClientRect().height || 84));
    document.documentElement.style.setProperty('--header-h', `${this.headerH}px`);

    // GSAP
    gsap.registerPlugin(ScrollTrigger);
    this.initHorizontal('#ods-principales');
    this.initHorizontal('#ods-transversales');

    // Spline (lazy)
    if (this.isBrowser && this.canvasRef?.nativeElement) {
      const canvas = this.canvasRef.nativeElement;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const fit = () => {
        const r = canvas.getBoundingClientRect();
        canvas.width = Math.round(Math.max(1, r.width * dpr));
        canvas.height = Math.round(Math.max(1, r.height * dpr));
      };
      fit(); addEventListener('resize', fit);

      this.io = new IntersectionObserver(async (entries) => {
        if (entries.some(e => e.isIntersecting) && !this.spline) {
          try { this.spline = new Application(canvas); await this.spline.load(this.sceneUrl); }
          catch (e) { console.warn('Spline ODS header:', e); }
          finally { this.io?.disconnect(); }
        }
      }, { threshold: 0.2 });
      this.io.observe(canvas);
    }

    // Refresh on resize
    addEventListener('resize', () => ScrollTrigger.refresh());
    setTimeout(() => ScrollTrigger.refresh(), 0);
  }

  ngOnDestroy(): void {
    this.triggers.forEach(t => t.kill());
    ScrollTrigger.getAll().forEach(t => t.kill());
    this.io?.disconnect();
    this.spline = undefined;
  }

  private initHorizontal(sectionSelector: string) {
    const section = this.doc.querySelector<HTMLElement>(sectionSelector);
    if (!section) return;

    const panel = section.querySelector<HTMLElement>('.h-panel');
    const track = section.querySelector<HTMLElement>('.h-track');
    const cards = Array.from(track?.querySelectorAll<HTMLElement>('.h-card') ?? []);
    if (!panel || !track || cards.length === 0) return;

    const computeDistance = () => Math.max(0, track.scrollWidth - panel.clientWidth);

    const tween = gsap.to(track, {
      x: () => -computeDistance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: () => `top+=${this.headerH} top`,
        end:   () => `+=${computeDistance()}`,
        pin: section,
        pinSpacing: true,
        scrub: true,
        anticipatePin: 0,
        invalidateOnRefresh: true,
      }
    });

    this.triggers.push((tween.scrollTrigger as ScrollTrigger));
  }
}
