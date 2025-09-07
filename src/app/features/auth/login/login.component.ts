import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { AuthApi } from '@features/auth/data/auth.api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private fb    = inject(FormBuilder);
  private auth  = inject(AuthService);
  private api   = inject(AuthApi);
  private router= inject(Router);
  private route = inject(ActivatedRoute);

  loading = false;
  error   = '';
  submitted = false;
  showPwd = false;

  form = this.fb.nonNullable.group({
    identity: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  togglePwd() { this.showPwd = !this.showPwd; }

  submit() {
    this.submitted = true;
    this.error = '';
    if (this.form.invalid) return;

    this.loading = true;
    const { identity, password } = this.form.getRawValue();

    this.api.loginFlexible(identity, password).subscribe({
      next: ({ token, user, id }) => {
        this.auth.setToken(token);
        const withId = (user && typeof user === 'object') ? { ...(user as any), id } : { id } as any;
        this.auth.setUser(withId);
        const redirect = this.route.snapshot.queryParamMap.get('redirectTo') || '/users';
        this.router.navigateByUrl(redirect);
      },
      error: (e) => {
        this.error = e?.error?.message || 'Credenciales inválidas';
        this.loading = false;
      }
    });
  }
}
