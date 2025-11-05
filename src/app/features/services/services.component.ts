import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SharedUxModule } from '../../shared/shared-ux.module';
import { Meta, Title } from '@angular/platform-browser';
import { EsimPromoComponent } from './esim-promo/esim-promo.component';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterLink, SharedUxModule, EsimPromoComponent],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss'],
})
export class ServicesComponent implements OnInit, OnDestroy {
  private title = inject(Title);
  private meta = inject(Meta);
  private doc = inject(DOCUMENT);

  private ldCatalog?: HTMLScriptElement;
  private ldFaq?: HTMLScriptElement;
  private canonical?: HTMLLinkElement;

  ngOnInit(): void {
    this.title.setTitle('Servicios gestionados IPFS, MRV y datos sostenibles | EcoLATAM');
    this.meta.updateTag({
      name: 'description',
      content:
        'Planes gestionados de nodos IPFS, pipelines MRV, tokenización de activos sostenibles, dashboards y beneficios VIP para organizaciones en Latinoamérica.',
    });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ property: 'og:title', content: 'Servicios gestionados IPFS, MRV y datos sostenibles | EcoLATAM' });
    this.meta.updateTag({
      property: 'og:description',
      content:
        'Desplegamos nodos IPFS, automatizamos MRV, tokenizamos activos y brindamos dashboards con reportes automáticos y soporte VIP.',
    });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://ecolatam.com/services' });
    this.meta.updateTag({ property: 'og:image', content: 'https://ecolatam.com/og-image.jpg' });

    this.canonical = this.doc.createElement('link');
    this.canonical.setAttribute('rel', 'canonical');
    this.canonical.setAttribute('href', 'https://ecolatam.com/services');
    this.doc.head.appendChild(this.canonical);

    this.ldCatalog = this.doc.createElement('script');
    this.ldCatalog.type = 'application/ld+json';
    this.ldCatalog.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'OfferCatalog',
          name: 'Servicios gestionados EcoLATAM',
          itemListElement: [
            {
              '@type': 'Offer',
              name: 'Plan Gestionado',
              availability: 'https://schema.org/InStock',
              itemOffered: {
                '@type': 'Service',
                name: 'Plan Gestionado',
                description: 'Pinning compartido, dashboards base y soporte en horario comercial.'
              }
            },
            {
              '@type': 'Offer',
              name: 'Plan Dedicado',
              availability: 'https://schema.org/InStock',
              itemOffered: {
                '@type': 'Service',
                name: 'Plan Dedicado',
                description: 'Nodo exclusivo, integraciones MRV, soporte 24/7 y tokenización básica.'
              }
            },
            {
              '@type': 'Offer',
              name: 'Plan Enterprise',
              availability: 'https://schema.org/InStock',
              itemOffered: {
                '@type': 'Service',
                name: 'Plan Enterprise',
                description: 'Multi-nodo, cumplimiento multi-país, automatizaciones avanzadas y beneficios VIP.'
              }
            }
          ]
        }
      ]
    });
    this.doc.head.appendChild(this.ldCatalog);

    this.ldFaq = this.doc.createElement('script');
    this.ldFaq.type = 'application/ld+json';
    this.ldFaq.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: '¿Qué incluye el acompañamiento gestionado?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Incluye pinning, dashboards, configuración MRV inicial, capacitación al equipo y soporte en horario comercial.'
          }
        },
        {
          '@type': 'Question',
          name: '¿Ofrecen soporte para tokenización de activos?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sí, diseñamos modelos de activos, gobernanza y reglas de verificación basadas en MRV y CIDs.'
          }
        },
        {
          '@type': 'Question',
          name: '¿Cómo funciona el programa VIP?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Brinda soporte prioritario 24/7, account manager dedicado, acceso anticipado a nuevas automatizaciones y sesiones estratégicas trimestrales.'
          }
        }
      ]
    });
    this.doc.head.appendChild(this.ldFaq);
  }

  ngOnDestroy(): void {
    this.ldCatalog?.remove();
    this.ldFaq?.remove();
    this.canonical?.remove();
  }
}
