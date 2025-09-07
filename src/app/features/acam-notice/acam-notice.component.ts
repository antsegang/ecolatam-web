import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-acam-notice',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './acam-notice.component.html',
  styleUrls: ['./acam-notice.component.scss'],
})
export class AcamNoticeComponent implements OnInit, OnDestroy {
  private title = inject(Title);
  private meta  = inject(Meta);
  private doc   = inject(DOCUMENT);

  private ldWeb?: HTMLScriptElement;
  private ldBreadcrumb?: HTMLScriptElement;
  private canonical?: HTMLLinkElement;

  ngOnInit(): void {
    // SEO
    this.title.setTitle('Aviso de Licenciamiento Musical (ACAM) – EcoLATAM');
    this.meta.updateTag({
      name: 'description',
      content:
        'Cómo gestionamos el licenciamiento musical con ACAM para EcoLATAM Radio/TV, streams, VOD y contenidos de usuarios; cuándo necesitas licencia, reportes (cue sheets) y contacto.',
    });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ property: 'og:title', content: 'Aviso de Licenciamiento Musical (ACAM) – EcoLATAM' });
    this.meta.updateTag({
      property: 'og:description',
      content:
        'Guía práctica sobre ACAM: comunicación pública, puesta a disposición, reportes, responsabilidades y buenas prácticas.',
    });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://ecolatam.com/acam' });

    // Canonical
    this.canonical = this.doc.createElement('link');
    this.canonical.setAttribute('rel', 'canonical');
    this.canonical.setAttribute('href', 'https://ecolatam.com/acam');
    this.doc.head.appendChild(this.canonical);

    // JSON-LD WebPage
    this.ldWeb = this.doc.createElement('script');
    this.ldWeb.type = 'application/ld+json';
    this.ldWeb.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Aviso de Licenciamiento Musical (ACAM) – EcoLATAM',
      url: 'https://ecolatam.com/acam',
      description:
        'Aviso informativo sobre licenciamiento musical con ACAM para servicios de EcoLATAM: cuándo se requiere, qué cubre, reportes y contacto.',
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
        { '@type': 'ListItem', position: 2, name: 'Licenciamiento ACAM', item: 'https://ecolatam.com/acam' }
      ]
    });
    this.doc.head.appendChild(this.ldBreadcrumb);
  }

  ngOnDestroy(): void {
    this.ldWeb?.remove();
    this.ldBreadcrumb?.remove();
    this.canonical?.remove();
  }

  openMail(subject: string, body?: string) {
    const mail = 'hola@ecolatam.com';
    const href = `mailto:${mail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body || '')}`;
    window.location.href = href;
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

  get solicitudACAM(): string {
    return [
      'Asunto: Solicitud de licencia musical – ACAM / EcoLATAM',
      'Solicitante/Entidad: [Nombre legal]',
      'Responsable de contacto: [Nombre, correo, teléfono]',
      'Tipo de uso: [Radio online / TV online / VOD / Podcast / Evento / Otro]',
      'Plataformas: [ecolatam.com/radio | /tv | apps]',
      'Alcance: [territorio, horarios, audiencia estimada]',
      'Catálogo musical: [propio / bibliotecas / mixto]',
      'Fecha estimada de inicio: [dd/mm/aaaa]',
      'Observaciones: [si hay obra propia, CC, acuerdos con terceros, etc.]',
      'Declaro que la información es veraz y me comprometo a cumplir las condiciones y reportes que ACAM establezca.',
      'Firma: [Nombre y fecha]'
    ].join('\n');
  }

  get cueSheet(): string {
    return [
      'CUE SHEET – EcoLATAM',
      'Fecha: [dd/mm/aaaa]',
      'Programa/Emisión: [nombre del espacio]',
      'Plataforma: [Radio / TV / VOD / Podcast]',
      '---- DETALLE DE OBRAS ----',
      'Hora de inicio | Título de la obra | Autor/Compositor | ISWC (opcional) | Intérprete | ISRC (opcional) | Duración (mm:ss) | Tipo de uso (fondo/tema/clip) | Observaciones',
      '00:05:10 | [Título] | [Autor] | [ISWC] | [Intérprete] | [ISRC] | 00:00:25 | fondo | [nota]',
      '----------------------------------------',
      'Responsable que reporta: [Nombre y cargo]',
      'Correo de contacto: [email]',
      'Firma/fecha: [ ]'
    ].join('\n');
  }
}
