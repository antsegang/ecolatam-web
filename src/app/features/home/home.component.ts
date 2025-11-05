import { Component, HostListener, OnDestroy, OnInit, inject, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, DOCUMENT, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { SharedUxModule } from '../../shared/shared-ux.module';
import { HoverSoundDirective } from '../../shared/directives/hover-sound.directive';
import { AudioToggleDirective } from '../../shared/directives/audio-toggle.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [CommonModule, RouterLink, SharedUxModule, HoverSoundDirective, AudioToggleDirective, ReactiveFormsModule]
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly fb = inject(FormBuilder);
  private readonly doc = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  scrollProgress = 0;
  waitlistOpen = false;
  waitlistSubmitting = false;
  waitlistSubmitted = false;
  waitlistError = '';
  private bodyOverflowBackup = '';
  private waitlistTimer?: ReturnType<typeof setTimeout>;

  waitlistForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    organization: [''],
    role: [''],
    notes: ['']
  });

  ngOnInit(): void {
    this.title.setTitle('EcoLATAM | Historias que construyen confianza para la sostenibilidad');
    this.meta.updateTag({
      name: 'description',
      content:
        'En EcoLATAM tejemos una red de confianza: Plaza del Pueblo Digital, B\u00f3veda de la Memoria Local y EcoGu\u00eda, la gu\u00eda de lo verdadero para comunidades, gobiernos y empresas.'
    });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({
      property: 'og:title',
      content: 'EcoLATAM | Historias que construyen confianza para la sostenibilidad'
    });
    this.meta.updateTag({
      property: 'og:description',
      content:
        'Plaza del Pueblo Digital, B\u00f3veda de la Memoria Local y EcoGu\u00eda: innovaci\u00f3n sostenible para cuidar a las personas y al planeta con transparencia.'
    });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: 'https://ecolatam.com/' });
    this.meta.updateTag({ property: 'og:image', content: 'https://ecolatam.com/og-image.jpg' });

    const existing = this.doc.querySelector("link[rel='canonical']");
    if (!existing) {
      const link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      link.setAttribute('href', 'https://ecolatam.com/');
      this.doc.head.appendChild(link);
    }

    if (this.isBrowser) {
      this.onScroll();
    }
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (!this.isBrowser) {
      return;
    }
    const docEl = this.doc.documentElement;
    const body = this.doc.body;
    const scrollTop = docEl.scrollTop || body.scrollTop || 0;
    const scrollHeight = docEl.scrollHeight || body.scrollHeight || 1;
    const clientHeight = docEl.clientHeight || window.innerHeight || 1;
    const scrolled = (scrollTop / (scrollHeight - clientHeight)) * 100;
    this.scrollProgress = Math.max(0, Math.min(scrolled, 100));
  }

  get waitlistControls() {
    return this.waitlistForm.controls;
  }

  openWaitlist(): void {
    if (this.waitlistSubmitting) {
      return;
    }
    this.waitlistForm.reset({
      name: '',
      email: '',
      organization: '',
      role: '',
      notes: ''
    });
    this.waitlistError = '';
    this.waitlistSubmitted = false;
    this.waitlistOpen = true;
    this.bodyOverflowBackup = this.doc.body.style.overflow || '';
    this.doc.body.style.overflow = 'hidden';
  }

  closeWaitlist(): void {
    if (this.waitlistSubmitting) {
      return;
    }
    this.waitlistOpen = false;
    if (this.waitlistSubmitted) {
      this.waitlistSubmitted = false;
    }
    this.restoreBodyOverflow();
  }

  submitWaitlist(): void {
    if (this.waitlistSubmitting) {
      return;
    }
    if (this.waitlistForm.invalid) {
      this.waitlistForm.markAllAsTouched();
      return;
    }

    this.waitlistSubmitting = true;
    this.waitlistError = '';

    this.waitlistTimer = setTimeout(() => {
      this.waitlistSubmitting = false;
      this.waitlistSubmitted = true;
      this.waitlistForm.reset({
        name: '',
        email: '',
        organization: '',
        role: '',
        notes: ''
      });
      this.waitlistTimer = undefined;
    }, 800);
  }

  ngOnDestroy(): void {
    if (this.waitlistTimer) {
      clearTimeout(this.waitlistTimer);
    }
    this.restoreBodyOverflow();
  }

  private restoreBodyOverflow(): void {
    if (this.bodyOverflowBackup !== undefined) {
      this.doc.body.style.overflow = this.bodyOverflowBackup;
      this.bodyOverflowBackup = '';
    }
  }
}
