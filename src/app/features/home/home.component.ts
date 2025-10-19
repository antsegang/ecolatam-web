import { Component, HostListener, OnInit, inject, AfterViewInit, OnDestroy, ElementRef, ViewChild, Inject, PLATFORM_ID, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SharedUxModule } from '../../shared/shared-ux.module';
import { Meta, Title } from '@angular/platform-browser';
import { FluentIconComponent } from '@shared/ui/fluent-icon';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { Application } from '@splinetool/runtime';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, SharedUxModule, FluentIconComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  private title = inject(Title);
  private meta = inject(Meta);
  private doc = inject(DOCUMENT);
  private router = inject(Router);
  private readonly isBrowser: boolean;
  @ViewChild('coin3d', { static: true }) coin3d!: ElementRef<HTMLElement>;

  private defaultOrbit?: {theta: number; phi: number; radius: number;};
  private defaultTarget?: {x: number; y: number; z: number;};

  auth = inject(AuthService);
  
  year = new Date().getFullYear();
  scrollProgress = 0;

  @ViewChild('canvas3d', { static: false }) private canvasRef!: ElementRef<HTMLCanvasElement>;
  private splineApp?: Application;
  private ro?: ResizeObserver; // para DPI/resize nítido

  activeRole: 'user'|'business'|'inspector'|'volunteer'|'guide'|'vip' = 'user';
  private rolesST: ScrollTrigger | null = null;
  private headerH = 84;

  private roleIds: Array<{ id: HomeComponent['activeRole']; el?: HTMLElement | null }> = [
    { id: 'user' }, { id: 'business' }, { id: 'inspector' },
    { id: 'volunteer' }, { id: 'guide' }, { id: 'vip' },
  ];

  private readonly sceneUrl = 'https://prod.spline.design/t8zl2y0f4hMgPYfR/scene.splinecode';

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.title.setTitle('EcoLATAM – Plataforma Social + EcoGuía sobre IPFS para LATAM');
    this.meta.updateTag({
      name: 'description',
      content:
        'Perfiles de usuario y empresa (KYC opcional), EcoGuía de negocios, publicación por CIDs en IPFS, MRV ambiental y roles comunitarios (inspectores, voluntarios, guías).',
    });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ property: 'og:title', content: 'EcoLATAM – Plataforma Social + EcoGuía sobre IPFS' });
    this.meta.updateTag({
      property: 'og:description',
      content:
        'Conecta tu perfil, crea tu empresa y publica por CIDs en IPFS. MRV ambiental y comunidad para innovación sostenible.',
    });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://ecolatam.com/' });
    this.meta.updateTag({ property: 'og:image', content: 'https://ecolatam.com/og-image.jpg' });

    const existing = this.doc.querySelector("link[rel='canonical']");
    if (!existing) {
      const link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', 'https://ecolatam.com/');
      this.doc.head.appendChild(link);
    }

    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    this.onScroll();
  }

  @HostListener('window:scroll', [])
  onScroll() {
    const doc = document.documentElement;
    const body = document.body;
    const scrollTop = (doc && doc.scrollTop) || body.scrollTop || 0;
    const scrollHeight = (doc && doc.scrollHeight) || body.scrollHeight || 1;
    const clientHeight = doc.clientHeight || window.innerHeight || 1;
    const total = scrollHeight - clientHeight;
    this.scrollProgress = total > 0 ? Math.min(100, Math.max(0, (scrollTop / total) * 100)) : 0;

    // ScrollSpy de roles
    let maxVisible = 0;
    let current: HomeComponent['activeRole'] | null = null;
    for (const r of this.roleIds) {
      const el = r.el || (r.el = document.getElementById('role-' + r.id));
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const topOffset = this.headerH + 12;
      const visible = Math.max(0, Math.min(rect.bottom, vh - topOffset) - Math.max(rect.top, topOffset));
      if (visible > maxVisible) { maxVisible = visible; current = r.id; }
    }
    if (current && current !== this.activeRole) this.activeRole = current;
  }

  @HostListener('window:resize')
  onResize() {
    this.computeRolesVars();
    ScrollTrigger.refresh();
  }

  async ngAfterViewInit(): Promise<void> {
    const mv = this.coin3d.nativeElement as any;

    mv.addEventListener('load', () => {
      this.defaultOrbit = mv.getCameraOrbit();
      this.defaultTarget = mv.getCameraTarget();
    });

    const resetPose = () => {
      if (!this.defaultOrbit || !this.defaultTarget) return;
      const { theta, phi, radius } = this.defaultOrbit;
      const { x, y, z } = this.defaultTarget;

      mv.cameraOrbit = `${theta}rad ${phi}rad ${radius}m`;
      mv.cameraTarget = `${x}m ${y}m ${z}m`;

      mv.autoRotate = false;
      mv.autoRotate = true;
    };

    if (this.isBrowser && this.canvasRef?.nativeElement) {
      const canvas = this.canvasRef.nativeElement;

      // Ajuste de resolución (DPR) y escucha de cambios de tamaño
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const resize = () => {
        const r = canvas.getBoundingClientRect();
        canvas.width = Math.max(1, Math.round(r.width * dpr));
        canvas.height = Math.max(1, Math.round(r.height * dpr));
      };
      resize();
      this.ro = new ResizeObserver(resize);
      this.ro.observe(canvas);

      // Instancia Spline
      this.splineApp = new Application(canvas);
      try {
        await this.splineApp.load(this.sceneUrl);
      } catch (err) {
        console.error('Error cargando Spline:', err);
      }
    }
    // medir header real y setear variables CSS compartidas
    const header = this.doc.querySelector<HTMLElement>('app-site-header');
    if (header) {
      this.headerH = Math.max(56, Math.min(120, header.getBoundingClientRect().height || 84));
    }
    document.documentElement.style.setProperty('--header-h', `${this.headerH}px`);
    this.computeRolesVars();

    setTimeout(() => {
      this.onScroll();
      this.initGsapAnimations();
      this.initRolesHorizontal();
      this.initSvgAnimations();
      this.initMicroInteractions();
    });

    mv.addEventListener('pointerup', resetPose);
    mv.addEventListener('mouseleave', resetPose);
    mv.addEventListener('touchend', resetPose, { passive: true });
  }

  ngOnDestroy(): void {
    this.rolesST?.kill(true);
    ScrollTrigger.getAll().forEach(st => st.kill());
  }

  private computeRolesVars() {
    const vh = window.innerHeight || 800;
    const margin = 16; // respiro inferior
    const rolesTop = this.headerH; // mismo offset para pin y sticky
    const rolesH = Math.max(420, Math.round(vh - this.headerH - margin)); // altura visible del panel
    document.documentElement.style.setProperty('--roles-top', `${rolesTop}px`);
    document.documentElement.style.setProperty('--roles-h', `${rolesH}px`);
  }

  scrollToRole(id: HomeComponent['activeRole']) {
    const ids = this.roleIds.map(r => r.id);
    const index = ids.indexOf(id);
    if (this.rolesST && index >= 0) {
      const progress = ids.length > 1 ? index / (ids.length - 1) : 0;
      const start = this.rolesST.start || 0;
      const end = this.rolesST.end || 0;
      const target = start + progress * (end - start);
      gsap.to(window, { duration: 0.6, ease: 'power2.out', scrollTo: { y: target, offsetY: this.headerH } });
      this.activeRole = id;
      return;
    }
    const el = document.getElementById('role-' + id);
    if (el) {
      const top = window.scrollY + el.getBoundingClientRect().top - this.headerH - 8;
      gsap.to(window, { duration: 0.6, ease: 'power2.out', scrollTo: top });
      this.activeRole = id;
    }
  }

  // ---------- Animaciones generales ----------
  private initGsapAnimations() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const heroArt = document.querySelector('.hero-art img');
    if (heroArt) {
      gsap.to(heroArt, {
        yPercent: 8, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });
    }

    gsap.utils.toArray<HTMLElement>([
      '.card.feature', '.neon-grid .card-neo', '.kpi-tiles .tile',
      '.split-panel .card', '.roles .role-card',
      '.section .card:not(.feature):not(.role-card)'
    ]).forEach((el) => {
      gsap.from(el, {
        opacity: 0, y: 20, duration: 0.6, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none reverse' }
      });
    });

    const rail = document.querySelector('.steps .rail') as HTMLElement | null;
    if (rail) {
      const line = this.doc.createElement('div');
      line.className = 'rail-progress';
      rail.appendChild(line);
      gsap.fromTo(line, { scaleY: 0 }, {
        scaleY: 1, transformOrigin: 'center top', ease: 'none',
        scrollTrigger: { trigger: '.steps', start: 'top 70%', end: 'bottom 30%', scrub: true }
      });
    }
  }

  // ---------- Roles horizontal sin rebote ----------
  private initRolesHorizontal() {
    const section = this.doc.getElementById('roles-section');
    const panel   = section?.querySelector<HTMLElement>('.roles-panel');
    const track   = section?.querySelector<HTMLElement>('.roles-track');
    const cards   = Array.from(section?.querySelectorAll<HTMLElement>('.role-card') ?? []);
    if (!section || !panel || !track || cards.length === 0) return;

    this.rolesST?.kill(true);

    const computeDistance = () => Math.max(0, track.scrollWidth - panel.clientWidth);

    const tween = gsap.to(track, {
      x: () => -computeDistance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: () => `top+=${this.headerH} top`, // al ras del header
        end:   () => `+=${computeDistance()}`,
        pin: section,                 // pin solo al panel
        pinSpacing: true,
        pinType: 'transform',
        scrub: true,               // sin snap -> sin rebote
        anticipatePin: 0,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const total = cards.length - 1;
          const idx = total > 0 ? Math.round(self.progress * total) : 0;
          const idAttr = cards[idx]?.id?.replace('role-', '') as HomeComponent['activeRole'];
          if (idAttr && idAttr !== this.activeRole) this.activeRole = idAttr;
        },
      },
    });

    this.rolesST = (tween.scrollTrigger as ScrollTrigger) ?? null;

    ScrollTrigger.addEventListener('refreshInit', () => { gsap.set(track, { x: 0 }); });
    ScrollTrigger.refresh();
  }

  // ---------- SVG 2D básico ----------
  private async initSvgAnimations() {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const cid = this.doc.getElementById('cid-diagram') as SVGSVGElement | null;
    if (cid) {
      const paths = cid.querySelectorAll<SVGPathElement>('path, line, polyline, polygon, circle, rect');
      paths.forEach((el) => {
        const length = (el as any).getTotalLength?.() ?? 300;
        el.style.strokeDasharray = `${length}`;
        el.style.strokeDashoffset = `${length}`;
      });
      gsap.to(paths, {
        strokeDashoffset: 0, duration: 1.1, ease: 'power2.out', stagger: 0.08,
        scrollTrigger: { trigger: cid, start: 'top 80%' }
      });
      const hub = cid.querySelector('#cid-hub');
      if (hub) {
        gsap.fromTo(hub, { scale: 0.86 }, {
          scale: 1, transformOrigin: '50% 50%', repeat: -1, yoyo: true, duration: 1.4, ease: 'sine.inOut'
        });
      }
    }
  }

  // ---------- Micro interacciones ----------
  private initMicroInteractions() {
    gsap.utils.toArray<HTMLElement>('.card.feature').forEach((card) => {
      let rx = gsap.quickTo(card, 'rotationX', { duration: 0.3, ease: 'power2.out' });
      let ry = gsap.quickTo(card, 'rotationY', { duration: 0.3, ease: 'power2.out' });
      let z  = gsap.quickTo(card, 'z',          { duration: 0.3, ease: 'power2.out' });

      const onMove = (e: MouseEvent) => {
        const r = card.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = (e.clientX - cx) / r.width;
        const dy = (e.clientY - cy) / r.height;
        ry( dx * 6);
        rx(-dy * 6);
        z(8);
      };
      const onLeave = () => { rx(0); ry(0); z(0); };
      card.addEventListener('mousemove', onMove);
      card.addEventListener('mouseleave', onLeave);
    });

    gsap.utils.toArray<HTMLElement>('.chapter .media img, .feature-img, .hero-art img').forEach(img => {
      gsap.to(img, {
        y: 12, ease: 'none',
        scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  }

  goRoleCta(role: HomeComponent['activeRole']) {
    const uid = this.auth.getUserId();
    if (uid) { this.router.navigate(['/users', uid]); return; }
    this.router.navigate(['/register'], { queryParams: { from: 'home_roles', role } });
  }
}
