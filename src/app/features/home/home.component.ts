import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ScrollRevealDirective],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  private title = inject(Title);
  private meta = inject(Meta);
  private doc = inject(DOCUMENT);

  year = new Date().getFullYear();

  ngOnInit(): void {
    // SEO por página
    this.title.setTitle('EcoLATAM – Plataforma Social + EcoGuía sobre IPFS para LATAM');
    this.meta.updateTag({
      name: 'description',
      content:
        'Perfiles de usuario y empresa (KYC opcional), EcoGuía de negocios, publicación por CIDs en IPFS, MRV ambiental y roles comunitarios (inspectores, voluntarios, guías).',
    });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ property: 'og:title', content: 'EcoLATAM – Plataforma Social + EcoGuía sobre IPFS' });
    this.meta.updateTag({
      property: 'og:description',
      content:
        'Conecta tu perfil, crea tu empresa y publica por CIDs en IPFS. MRV ambiental y comunidad para innovación sostenible.',
    });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://ecolatam.com/' });
    this.meta.updateTag({ property: 'og:image', content: 'https://ecolatam.com/og-image.jpg' });

    // Canonical (SPA)
    const existing = this.doc.querySelector("link[rel='canonical']");
    if (!existing) {
      const link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', 'https://ecolatam.com/');
      this.doc.head.appendChild(link);
    }
  }
}
