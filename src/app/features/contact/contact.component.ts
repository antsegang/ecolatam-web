import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SharedUxModule } from '../../shared/shared-ux.module';
import { Title, Meta } from '@angular/platform-browser';
import { ApiService } from '../../core/services/api.service'; // ajusta la ruta si difiere
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, SharedUxModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent implements OnInit, OnDestroy {
  private title = inject(Title);
  private meta = inject(Meta);
  private doc  = inject(DOCUMENT);
  private fb   = inject(FormBuilder);
  private api  = inject(ApiService);

  submitting = false;
  sent = false;
  errorMsg = '';

  // Honeypot: si se rellena, no enviamos
  form = this.fb.group({
    name:        ['', [Validators.required, Validators.minLength(2)]],
    email:       ['', [Validators.required, Validators.email]],
    organization:[''],
    message:     ['', [Validators.required, Validators.minLength(10)]],
    website:     [''] // honeypot (oculta)
  });

  private ldContact?: HTMLScriptElement;
  private canonical?: HTMLLinkElement;

  ngOnInit(): void {
    // SEO
    this.title.setTitle('Contacto – EcoLATAM');
    this.meta.updateTag({
      name: 'description',
      content: 'Conversemos sobre infraestructura IPFS, MRV ambiental y Web3 sostenible. Escríbenos a hola@ecolatam.com o usa este formulario.',
    });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ property: 'og:title', content: 'Contacto – EcoLATAM' });
    this.meta.updateTag({
      property: 'og:description',
      content: 'Hablemos de innovación sostenible: proyectos, alianzas y comunidad en Latinoamérica.',
    });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://ecolatam.com/contact' });
    this.meta.updateTag({ property: 'og:image', content: 'https://ecolatam.com/og-image.jpg' });

    // Canonical
    this.canonical = this.doc.createElement('link');
    this.canonical.setAttribute('rel', 'canonical');
    this.canonical.setAttribute('href', 'https://ecolatam.com/contact');
    this.doc.head.appendChild(this.canonical);

    // JSON-LD ContactPage + Organization contactPoint
    this.ldContact = this.doc.createElement('script');
    this.ldContact.type = 'application/ld+json';
    this.ldContact.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      mainEntity: {
        '@type': 'Organization',
        name: 'EcoLATAM',
        url: 'https://ecolatam.com',
        contactPoint: [{
          '@type': 'ContactPoint',
          contactType: 'customer support',
          email: 'hola@ecolatam.com',
          areaServed: 'Latin America',
          availableLanguage: ['es','en']
        }]
      }
    });
    this.doc.head.appendChild(this.ldContact);
  }

  ngOnDestroy(): void {
    this.ldContact?.remove();
    this.canonical?.remove();
  }

  get f() { return this.form.controls; }

  submit() {
    return;
  }
}
