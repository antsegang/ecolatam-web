import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-disclaimers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './disclaimers.component.html',
  styleUrls: ['./disclaimers.component.scss'],
})
export class DisclaimersComponent implements OnInit, OnDestroy {
  private title = inject(Title);
  private meta  = inject(Meta);
  private doc   = inject(DOCUMENT);

  private ldWeb?: HTMLScriptElement;
  private ldBreadcrumb?: HTMLScriptElement;
  private canonical?: HTMLLinkElement;

  ngOnInit(): void {
    // SEO
    this.title.setTitle('Avisos y Disclaimers – EcoLATAM');
    this.meta.updateTag({
      name: 'description',
      content:
        'Avisos y disclaimers universales de EcoLATAM: informativo, no asesoría legal/financiera/médica, riesgos, terceros, prospectivo, IPFS/Web3, seguridad, jurisdicción y más.',
    });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ property: 'og:title', content: 'Avisos y Disclaimers – EcoLATAM' });
    this.meta.updateTag({
      property: 'og:description',
      content:
        'Marco general de avisos y limitaciones para contenidos, productos y servicios de EcoLATAM.',
    });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://ecolatam.com/disclaimers' });

    // Canonical
    this.canonical = this.doc.createElement('link');
    this.canonical.setAttribute('rel', 'canonical');
    this.canonical.setAttribute('href', 'https://ecolatam.com/disclaimers');
    this.doc.head.appendChild(this.canonical);

    // JSON-LD
    this.ldWeb = this.doc.createElement('script');
    this.ldWeb.type = 'application/ld+json';
    this.ldWeb.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Avisos y Disclaimers – EcoLATAM',
      url: 'https://ecolatam.com/disclaimers',
      description:
        'Disclaimers universales sobre límites de responsabilidad, naturaleza informativa, riesgos y terceros.',
      inLanguage: 'es',
      genre: 'disclaimer',
      isPartOf: { '@type': 'WebSite', name: 'EcoLATAM', url: 'https://ecolatam.com' },
    });
    this.doc.head.appendChild(this.ldWeb);

    // Breadcrumb
    this.ldBreadcrumb = this.doc.createElement('script');
    this.ldBreadcrumb.type = 'application/ld+json';
    this.ldBreadcrumb.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://ecolatam.com/' },
        { '@type': 'ListItem', position: 2, name: 'Disclaimers', item: 'https://ecolatam.com/disclaimers' }
      ]
    });
    this.doc.head.appendChild(this.ldBreadcrumb);
  }

  ngOnDestroy(): void {
    this.ldWeb?.remove();
    this.ldBreadcrumb?.remove();
    this.canonical?.remove();
  }

  copy(text: string) {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => this.fallbackCopy(text));
    } else {
      this.fallbackCopy(text);
    }
  }
  private fallbackCopy(text: string) {
    const ta = this.doc.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    this.doc.body.appendChild(ta);
    ta.select();
    try { this.doc.execCommand('copy'); } catch {}
    ta.remove();
  }

  printPage() {
    window.print();
  }

  // Plantillas breves (banner/newsletter/redes) para copiar/pegar
  get bannerShort(): string {
    return 'EcoLATAM: contenido informativo. No constituye asesoría legal, financiera, médica ni de inversión. ' +
           'Haz tu propia evaluación y consulta a profesionales. Sujeto a Términos y Privacidad.';
  }

  get newsletterShort(): string {
    return 'Aviso EcoLATAM: la información de este boletín es educativa e informativa. ' +
           'No es asesoría legal/financiera/médica ni una oferta de inversión. ' +
           'Riesgos pueden variar. Ver Términos y Política de Privacidad en ecolatam.com.';
  }

  get socialShort(): string {
    return 'Contenido informativo. No asesoría. Ver Términos/Privacidad en ecolatam.com.';
  }
}
