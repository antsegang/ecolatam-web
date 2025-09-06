import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-takedown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './takedown.component.html',
  styleUrls: ['./takedown.component.scss'],
})
export class TakedownComponent implements OnInit, OnDestroy {
  private title = inject(Title);
  private meta  = inject(Meta);
  private doc   = inject(DOCUMENT);

  private ldWeb?: HTMLScriptElement;
  private ldBreadcrumb?: HTMLScriptElement;
  private canonical?: HTMLLinkElement;

  ngOnInit(): void {
    // SEO
    this.title.setTitle('Política de Takedown / Safe Harbor – EcoLATAM');
    this.meta.updateTag({
      name: 'description',
      content:
        'Procedimiento de aviso y retirada de contenido (takedown), contranotificación, reincidencia y consideraciones IPFS en EcoLATAM.',
    });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ property: 'og:title', content: 'Política de Takedown / Safe Harbor – EcoLATAM' });
    this.meta.updateTag({
      property: 'og:description',
      content:
        'Cómo reportar contenido, requisitos de un aviso válido, contranotificación y medidas en casos de reincidencia, incluyendo IPFS.',
    });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://ecolatam.com/takedown' });

    // Canonical
    this.canonical = this.doc.createElement('link');
    this.canonical.setAttribute('rel', 'canonical');
    this.canonical.setAttribute('href', 'https://ecolatam.com/takedown');
    this.doc.head.appendChild(this.canonical);

    // JSON-LD WebPage
    this.ldWeb = this.doc.createElement('script');
    this.ldWeb.type = 'application/ld+json';
    this.ldWeb.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Política de Takedown / Safe Harbor – EcoLATAM',
      url: 'https://ecolatam.com/takedown',
      description:
        'Política de aviso y retirada de contenido (takedown) de EcoLATAM con contranotificación y consideraciones IPFS.',
      inLanguage: 'es',
      genre: 'policy',
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
        { '@type': 'ListItem', position: 2, name: 'Takedown', item: 'https://ecolatam.com/takedown' }
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

  openMail(subject: string) {
    const mail = 'hola@ecolatam.com';
    const body = 'Describe tu solicitud de forma concreta y adjunta evidencia.\n\nEnlace/URL/CID:\nIdentificación del titular:\nPrueba de titularidad:\nDeclaración de buena fe:\nFirma:\n';
    const href = `mailto:${mail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
  }

  get avisoTemplate(): string {
    return [
      'Asunto: Aviso de infracción – EcoLATAM',
      'Titular o agente autorizado: [Nombre completo]',
      'Medio de contacto: [Correo y teléfono]',
      'Identificación del contenido infractor (URL y/o CID): [listar]',
      'Obra o derecho presuntamente infringido: [describir]',
      'Prueba de titularidad: [documentos/enlaces]',
      'Declaración de buena fe: Declaro que el uso del material no está autorizado por el titular, su agente o la ley.',
      'Declaración de veracidad: La información de este aviso es precisa.',
      'Firma (nombre completo y fecha): [firmar digitalmente si es posible]'
    ].join('\n');
  }

  get counterTemplate(): string {
    return [
      'Asunto: Contranotificación – EcoLATAM',
      'Titular de la cuenta: [Nombre completo]',
      'Contenido retirado o desindexado (URL y/o CID): [listar]',
      'Motivo de la contranotificación: [uso autorizado / licencia / fair use / error de identificación / otros]',
      'Declaración: Bajo pena de perjurio, acredito que el contenido fue retirado por error o identificación errónea.',
      'Consentimiento: Acepto la jurisdicción de los tribunales competentes del domicilio informado por EcoLATAM para resolver la disputa.',
      'Firma (nombre completo y fecha): [firmar digitalmente si es posible]'
    ].join('\n');
  }
}
