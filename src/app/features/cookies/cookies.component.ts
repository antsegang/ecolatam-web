import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-cookies',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cookies.component.html',
  styleUrls: ['./cookies.component.scss'],
})
export class CookiesComponent implements OnInit, OnDestroy {
  private title = inject(Title);
  private meta  = inject(Meta);
  private doc   = inject(DOCUMENT);

  private ldWeb?: HTMLScriptElement;
  private ldBreadcrumb?: HTMLScriptElement;
  private canonical?: HTMLLinkElement;

  ngOnInit(): void {
    // SEO
    this.title.setTitle('Política de Cookies – EcoLATAM');
    this.meta.updateTag({
      name: 'description',
      content:
        'Política de Cookies de EcoLATAM: qué son, tipos que usamos (necesarias, funcionales, analítica, marketing), cómo cambiar tus preferencias y cuánto tiempo se conservan.',
    });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ property: 'og:title', content: 'Política de Cookies – EcoLATAM' });
    this.meta.updateTag({
      property: 'og:description',
      content:
        'Conoce cómo usamos cookies y tecnologías similares, y cómo gestionar tu consentimiento.',
    });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://ecolatam.com/cookies' });

    // Canonical
    this.canonical = this.doc.createElement('link');
    this.canonical.setAttribute('rel', 'canonical');
    this.canonical.setAttribute('href', 'https://ecolatam.com/cookies');
    this.doc.head.appendChild(this.canonical);

    // JSON-LD WebPage
    this.ldWeb = this.doc.createElement('script');
    this.ldWeb.type = 'application/ld+json';
    this.ldWeb.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Política de Cookies – EcoLATAM',
      url: 'https://ecolatam.com/cookies',
      description:
        'Documento que explica el uso de cookies y tecnologías similares en EcoLATAM y cómo gestionarlas.',
      inLanguage: 'es',
      genre: 'cookies',
      isPartOf: { '@type': 'WebSite', name: 'EcoLATAM', url: 'https://ecolatam.com' },
    });
    this.doc.head.appendChild(this.ldWeb);

    // JSON-LD Breadcrumb
    this.ldBreadcrumb = this.doc.createElement('script');
    this.ldBreadcrumb.type = 'application/ld+json';
    this.ldBreadcrumb.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://ecolatam.com/' },
        { '@type': 'ListItem', position: 2, name: 'Cookies', item: 'https://ecolatam.com/cookies' }
      ]
    });
    this.doc.head.appendChild(this.ldBreadcrumb);
  }

  ngOnDestroy(): void {
    this.ldWeb?.remove();
    this.ldBreadcrumb?.remove();
    this.canonical?.remove();
  }

  openPreferences(): void {
    // Enganche genérico a tu gestor de consentimiento
    try {
      // Ejemplos comunes de API; ajusta al CMP que uses
      (window as any).CookieConsentManager?.open?.();
      (window as any).cookieConsent?.showPreferences?.();
      (window as any).__cmp?.('showConsentTool');
      // Evento de respaldo por si tienes un listener propio
      window.dispatchEvent(new CustomEvent('cookies:open-preferences'));
    } catch (e) {
      console.warn('No se pudo abrir el gestor de cookies:', e);
    }
  }
}
