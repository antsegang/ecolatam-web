import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SharedUxModule } from '../../shared/shared-ux.module';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-solutions',
  standalone: true,
  imports: [CommonModule, RouterLink, SharedUxModule],
  templateUrl: './solutions.component.html',
  styleUrls: ['./solutions.component.scss'],
})
export class SolutionsComponent implements OnInit, OnDestroy {
  private title = inject(Title);
  private meta  = inject(Meta);
  private doc   = inject(DOCUMENT);

  private ldItemList?: HTMLScriptElement;
  private ldFaq?: HTMLScriptElement;
  private canonical?: HTMLLinkElement;

  ngOnInit(): void {
    // SEO
    this.title.setTitle('Soluciones – EcoGuía, Plataforma Social y Nodo IPFS | EcoLATAM');
    this.meta.updateTag({
      name: 'description',
      content:
        'EcoGuía (directorio y guías), Plataforma Social (perfiles, retos, eventos) y Nodo/Gateway IPFS (CIDs, versionado, MRV) para proyectos con impacto.',
    });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ property: 'og:title', content: 'Soluciones – EcoGuía, Plataforma Social y Nodo IPFS | EcoLATAM' });
    this.meta.updateTag({
      property: 'og:description',
      content: 'Publica por CIDs, conecta perfiles/empresas y habilita MRV con trazabilidad en Latinoamérica.',
    });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://ecolatam.com/solutions' });
    this.meta.updateTag({ property: 'og:image', content: 'https://ecolatam.com/og-image.jpg' });

    // Canonical
    this.canonical = this.doc.createElement('link');
    this.canonical.setAttribute('rel', 'canonical');
    this.canonical.setAttribute('href', 'https://ecolatam.com/solutions');
    this.doc.head.appendChild(this.canonical);

    // JSON-LD ItemList + Services
    this.ldItemList = this.doc.createElement('script');
    this.ldItemList.type = 'application/ld+json';
    this.ldItemList.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'ItemList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'EcoGuía', url: 'https://ecolatam.com/solutions#ecoguia' },
            { '@type': 'ListItem', position: 2, name: 'Plataforma Social', url: 'https://ecolatam.com/solutions#social' },
            { '@type': 'ListItem', position: 3, name: 'Nodo/Gateway IPFS', url: 'https://ecolatam.com/solutions#ipfs' }
          ]
        },
        {
          '@type': 'Service',
          name: 'EcoGuía',
          areaServed: 'Latin America',
          url: 'https://ecolatam.com/solutions#ecoguia'
        },
        {
          '@type': 'Service',
          name: 'Plataforma Social',
          areaServed: 'Latin America',
          url: 'https://ecolatam.com/solutions#social'
        },
        {
          '@type': 'Service',
          name: 'Nodo/Gateway IPFS',
          areaServed: 'Latin America',
          url: 'https://ecolatam.com/solutions#ipfs'
        }
      ]
    });
    this.doc.head.appendChild(this.ldItemList);

    // JSON-LD FAQ
    this.ldFaq = this.doc.createElement('script');
    this.ldFaq.type = 'application/ld+json';
    this.ldFaq.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: '¿Puedo empezar por una sola parte?',
          acceptedAnswer: { '@type': 'Answer', text: 'Sí, puedes arrancar con EcoGuía, Social o IPFS y escalar después.' }
        },
        {
          '@type': 'Question',
          name: '¿Usan IPFS para todo?',
          acceptedAnswer: { '@type': 'Answer', text: 'No. Lo usamos cuando aporta direccionamiento por CID y trazabilidad; para datos sensibles recomendamos cifrado del lado del cliente.' }
        },
        {
          '@type': 'Question',
          name: '¿Costos?',
          acceptedAnswer: { '@type': 'Answer', text: 'Dependen del alcance (volumen de datos, funcionalidades y soporte). Agendemos una conversación para estimar.' }
        }
      ]
    });
    this.doc.head.appendChild(this.ldFaq);
  }

  ngOnDestroy(): void {
    this.ldItemList?.remove();
    this.ldFaq?.remove();
    this.canonical?.remove();
  }
}
