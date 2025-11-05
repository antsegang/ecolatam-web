import { Component, ViewChild, ElementRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { EsimService } from './esim.service';

@Component({
  selector: 'app-esim-promo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './esim-promo.component.html',
  styleUrls: ['./esim-promo.component.scss'],
  providers: [EsimService]
})
export class EsimPromoComponent {
  private fb = inject(FormBuilder);
  private esim = inject(EsimService);

  @ViewChild('planes', { static: false }) planesRef?: ElementRef<HTMLElement>;

  leadForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]]
  });

  sending = false;
  success = signal(false);
  error = signal(false);

  scrollToPlans() {
    this.planesRef?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async sendLead() {
    this.success.set(false);
    this.error.set(false);

    if (this.leadForm.invalid) return;
    this.sending = true;

    try {
      const { name, email } = this.leadForm.value;
      await this.esim.createClientLead({ name: String(name), email: String(email) });
      this.success.set(true);
      this.leadForm.reset();
    } catch {
      this.error.set(true);
    } finally {
      this.sending = false;
    }
  }
}
