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
  private meta = inject(Meta);
  private doc = inject(DOCUMENT);

  private ldItemList?: HTMLScriptElement;
  private ldFaq?: HTMLScriptElement;
  private canonical?: HTMLLinkElement;

  ngOnInit(): void {
    this.title.setTitle('Soluciones IPFS, MRV y Tokenización | EcoLATAM');
    this.meta.updateTag({
      name: 'description',
      content:
        'Infraestructura IPFS administrada, pipeline MRV, tokenización de activos sostenibles y dashboards con reportes automáticos para transparencia climática.',
    });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ property: 'og:title', content: 'Soluciones IPFS, MRV y Tokenización | EcoLATAM' });
    this.meta.updateTag({
      property: 'og:description',
      content:
        'Activamos trazabilidad e inmutabilidad con IPFS, MRV automatizado, pinning gestionado y tokenización de activos sostenibles para empresas en Latinoamérica.',
    });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://ecolatam.com/solutions' });
    this.meta.updateTag({ property: 'og:image', content: 'https://ecolatam.com/og-image.jpg' });

    this.canonical = this.doc.createElement('link');
    this.canonical.setAttribute('rel', 'canonical');
    this.canonical.setAttribute('href', 'https://ecolatam.com/solutions');
    this.doc.head.appendChild(this.canonical);

    this.ldItemList = this.doc.createElement('script');
    this.ldItemList.type = 'application/ld+json';
    this.ldItemList.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'ItemList',
          name: 'Soluciones EcoLATAM',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Infraestructura IPFS administrada', url: 'https://ecolatam.com/solutions#ipfs-gestionado' },
            { '@type': 'ListItem', position: 2, name: 'Pipeline MRV y datos climáticos', url: 'https://ecolatam.com/solutions#pipeline-mrv' },
            { '@type': 'ListItem', position: 3, name: 'Tokenización de activos sostenibles', url: 'https://ecolatam.com/solutions#tokenizacion' },
            { '@type': 'ListItem', position: 4, name: 'Dashboards y reportes automatizados', url: 'https://ecolatam.com/solutions#dashboards' }
          ]
        },
        {
          '@type': 'Service',
          name: 'Infraestructura IPFS administrada',
          areaServed: 'Latin America',
          url: 'https://ecolatam.com/solutions#ipfs-gestionado',
          description: 'Nodo y gateway IPFS con pinning gestionado, versionado y despliegue de nodos dedicados para clientes.'
        },
        {
          '@type': 'Service',
          name: 'Pipeline MRV y datos climáticos',
          areaServed: 'Latin America',
          url: 'https://ecolatam.com/solutions#pipeline-mrv',
          description: 'Automatización de captura, validación y reporte de datos ambientales con MRV y trazabilidad.'
        },
        {
          '@type': 'Service',
          name: 'Tokenización de activos sostenibles',
          areaServed: 'Latin America',
          url: 'https://ecolatam.com/solutions#tokenizacion',
          description: 'Estructuración de gemelos digitales y emisión de tokens respaldados por datos verificables.'
        },
        {
          '@type': 'Service',
          name: 'Dashboards y reportes automatizados',
          areaServed: 'Latin America',
          url: 'https://ecolatam.com/solutions#dashboards',
          description: 'Paneles web para carga manual, ingestión automática y reportes exportables para auditoría.'
        }
      ]
    });
    this.doc.head.appendChild(this.ldItemList);

    this.ldFaq = this.doc.createElement('script');
    this.ldFaq.type = 'application/ld+json';
    this.ldFaq.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: '¿Ya cuentan con un nodo IPFS funcionando?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sí, operamos un nodo y gateway IPFS en Costa Rica que utilizamos para proyectos propios y de clientes.'
          }
        },
        {
          '@type': 'Question',
          name: '¿Pueden desplegar nodos dedicados o híbridos?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Ofrecemos despliegues administrados on-premise o en la nube del cliente con monitoreo, pinning y planes de soporte.'
          }
        },
        {
          '@type': 'Question',
          name: '¿Cómo se asegura la verificación de datos tokenizados?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Los tokens se respaldan en MRV documentado por CID, con reglas de validación, bitácoras y reportes descargables para auditores.'
          }
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
