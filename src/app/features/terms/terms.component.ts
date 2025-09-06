import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss'],
})
export class TermsComponent implements OnInit, OnDestroy {
  private title = inject(Title);
  private meta  = inject(Meta);
  private doc   = inject(DOCUMENT);

  private ldWeb?: HTMLScriptElement;
  private ldBreadcrumb?: HTMLScriptElement;
  private canonical?: HTMLLinkElement;

  ngOnInit(): void {
    // SEO
    this.title.setTitle('Políticas de Uso / Términos de Servicio – EcoLATAM');
    this.meta.updateTag({
      name: 'description',
      content:
        'Términos de EcoLATAM: uso aceptable, CGU, IPFS, APIs, e-commerce (compras, envíos, reembolsos), moderación/takedown, responsabilidad y jurisdicción.',
    });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ property: 'og:title', content: 'Políticas de Uso / Términos – EcoLATAM' });
    this.meta.updateTag({
      property: 'og:description',
      content:
        'Condiciones para usar ecolatam.com, la EcoGuía, la Plataforma Social, el nodo/gateway IPFS y las APIs.',
    });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://ecolatam.com/terms' });

    // Canonical
    this.canonical = this.doc.createElement('link');
    this.canonical.setAttribute('rel', 'canonical');
    this.canonical.setAttribute('href', 'https://ecolatam.com/terms');
    this.doc.head.appendChild(this.canonical);

    // JSON-LD WebPage
    this.ldWeb = this.doc.createElement('script');
    this.ldWeb.type = 'application/ld+json';
    this.ldWeb.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Políticas de Uso / Términos de Servicio – EcoLATAM',
      url: 'https://ecolatam.com/terms',
      description:
        'Documento de términos y condiciones de EcoLATAM: reglas de uso, e-commerce, IPFS, APIs, moderación y límites de responsabilidad.',
      inLanguage: 'es',
      genre: 'terms',
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
        { '@type': 'ListItem', position: 2, name: 'Términos', item: 'https://ecolatam.com/terms' }
      ]
    });
    this.doc.head.appendChild(this.ldBreadcrumb);
  }

  ngOnDestroy(): void {
    this.ldWeb?.remove();
    this.ldBreadcrumb?.remove();
    this.canonical?.remove();
  }
}
