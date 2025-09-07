import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink, ScrollRevealDirective],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit, OnDestroy {
  private title = inject(Title);
  private meta = inject(Meta);
  private doc = inject(DOCUMENT);

  private ldOrg?: HTMLScriptElement;
  private ldPersons?: HTMLScriptElement;
  private ldBreadcrumb?: HTMLScriptElement;
  private canonical?: HTMLLinkElement;

  values = [
    { title: 'Impacto',       text: 'Tecnología al servicio de la sostenibilidad y las personas.' },
    { title: 'Transparencia', text: 'Datos verificables, trazabilidad y auditoría abierta.' },
    { title: 'Colaboración',  text: 'Alianzas con academia, gobierno y startups.' },
    { title: 'Accesibilidad', text: 'Diseño responsable, inclusivo y de bajo umbral.' },
  ];

  team = [
    { name: 'Anthony Segura A.', role: 'CEO & CTO', img: '/placeholder-image-broken-square.png', linkedin: 'https://www.linkedin.com/in/anthony-segura-angulo-112202142' },
    { name: 'Elías Cambronero S.', role: 'CMO',    img: '/placeholder-image-broken-square.png', linkedin: 'https://www.linkedin.com/in/gerardo-elías-cambronero-sibaja-34796a216' },
    { name: 'Por anunciar',       role: 'Ecosistema', img: '/placeholder-image-broken-square.png', linkedin: '#' },
  ];

  ngOnInit(): void {
    // META / SEO
    this.title.setTitle('Sobre EcoLATAM – Plataforma Social, EcoGuía e IPFS/MRV');
    this.meta.updateTag({
      name: 'description',
      content:
        'Conoce misión, visión, valores y equipo de EcoLATAM. Plataforma Social y EcoGuía sobre IPFS con procesos de MRV ambiental.',
    });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ property: 'og:title', content: 'Sobre EcoLATAM – Plataforma Social, EcoGuía e IPFS/MRV' });
    this.meta.updateTag({
      property: 'og:description',
      content: 'Ecosistema que conecta personas y empresas con publicación por CIDs, trazabilidad y auditorías abiertas.',
    });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://ecolatam.com/about' });
    this.meta.updateTag({ property: 'og:image', content: 'https://ecolatam.com/og-image.jpg' });

    // Canonical
    this.canonical = this.doc.createElement('link');
    this.canonical.setAttribute('rel', 'canonical');
    this.canonical.setAttribute('href', 'https://ecolatam.com/about');
    this.doc.head.appendChild(this.canonical);

    // JSON-LD Organization
    this.ldOrg = this.doc.createElement('script');
    this.ldOrg.type = 'application/ld+json';
    this.ldOrg.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'EcoLATAM',
      url: 'https://ecolatam.com',
      logo: 'https://ecolatam.com/assets/ecolatam-logo.png',
      contactPoint: [{
        '@type': 'ContactPoint',
        email: 'hola@ecolatam.com',
        contactType: 'customer support',
        availableLanguage: ['es']
      }],
      sameAs: [
        'https://www.linkedin.com/company/REEMPLAZAR',
        'https://x.com/REEMPLAZAR'
      ]
    });
    this.doc.head.appendChild(this.ldOrg);

    // JSON-LD Persons (equipo clave)
    this.ldPersons = this.doc.createElement('script');
    this.ldPersons.type = 'application/ld+json';
    this.ldPersons.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': this.team.slice(0, 2).map(m => ({
        '@type': 'Person',
        name: m.name,
        jobTitle: m.role,
        worksFor: { '@type': 'Organization', name: 'EcoLATAM' },
        sameAs: [m.linkedin]
      }))
    });
    this.doc.head.appendChild(this.ldPersons);

    // JSON-LD Breadcrumb
    this.ldBreadcrumb = this.doc.createElement('script');
    this.ldBreadcrumb.type = 'application/ld+json';
    this.ldBreadcrumb.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://ecolatam.com/' },
        { '@type': 'ListItem', position: 2, name: 'Sobre nosotros', item: 'https://ecolatam.com/about' }
      ]
    });
    this.doc.head.appendChild(this.ldBreadcrumb);
  }

  ngOnDestroy(): void {
    this.ldOrg?.remove();
    this.ldPersons?.remove();
    this.ldBreadcrumb?.remove();
    this.canonical?.remove();
  }
}
