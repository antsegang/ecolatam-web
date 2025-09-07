import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './privacy.component.html',
  styleUrls: ['./privacy.component.scss'],
})
export class PrivacyComponent implements OnInit, OnDestroy {
  private title = inject(Title);
  private meta  = inject(Meta);
  private doc   = inject(DOCUMENT);

  private ldWeb?: HTMLScriptElement;
  private ldBreadcrumb?: HTMLScriptElement;
  private canonical?: HTMLLinkElement;

  ngOnInit(): void {
    // SEO
    this.title.setTitle('Política de Privacidad – EcoLATAM');
    this.meta.updateTag({
      name: 'description',
      content:
        'Política de Privacidad de EcoLATAM: qué datos tratamos, para qué los usamos, derechos ARCO, seguridad, cookies, IPFS/Web3, transferencias y contacto.',
    });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ property: 'og:title', content: 'Política de Privacidad – EcoLATAM' });
    this.meta.updateTag({
      property: 'og:description',
      content:
        'Conoce cómo EcoLATAM protege tu información, tus derechos y nuestras prácticas de seguridad y transparencia.',
    });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://ecolatam.com/privacy' });

    // Canonical
    this.canonical = this.doc.createElement('link');
    this.canonical.setAttribute('rel', 'canonical');
    this.canonical.setAttribute('href', 'https://ecolatam.com/privacy');
    this.doc.head.appendChild(this.canonical);

    // JSON-LD WebPage
    this.ldWeb = this.doc.createElement('script');
    this.ldWeb.type = 'application/ld+json';
    this.ldWeb.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Política de Privacidad – EcoLATAM',
      url: 'https://ecolatam.com/privacy',
      description:
        'Documento de privacidad de EcoLATAM que explica el tratamiento de datos personales, bases legales, derechos y medidas de seguridad.',
      inLanguage: 'es',
      genre: 'privacy',
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
        { '@type': 'ListItem', position: 2, name: 'Privacidad', item: 'https://ecolatam.com/privacy' },
      ],
    });
    this.doc.head.appendChild(this.ldBreadcrumb);
  }

  ngOnDestroy(): void {
    this.ldWeb?.remove();
    this.ldBreadcrumb?.remove();
    this.canonical?.remove();
  }
}
