import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly error = signal<string | null>(null);

  protected readonly form = this.fb.group({
    username: ['', [Validators.required, Validators.maxLength(50)]],
  });

  protected submit(): void {
    this.error.set(null);
    const name = this.form.controls.username.value.trim();
    if (this.form.invalid || !name) {
      this.form.markAllAsTouched();
      return;
    }
    this.auth.login(name);
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    // solo rutas internas
    this.router.navigateByUrl(returnUrl && returnUrl.startsWith('/') ? returnUrl : '/productos');
  }

  protected invalid(): boolean {
    const c = this.form.controls.username;
    return c.invalid && (c.touched || c.dirty);
  }
}
