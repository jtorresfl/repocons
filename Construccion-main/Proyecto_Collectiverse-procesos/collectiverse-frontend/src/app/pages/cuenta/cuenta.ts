import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { errorMessage } from '../../core/api';
import { AuthService } from '../../core/auth.service';
import { Product, Publication, User } from '../../core/models';
import { ProductService } from '../../core/product.service';
import { PublicationService } from '../../core/publication.service';
import { UserService } from '../../core/user.service';
import { PublicationCard } from '../../shared/publication-card/publication-card';

/**
 * Registro / Login / Perfil en una sola pantalla.
 * OJO: el "login" solo comprueba que el usuario exista (GET /api/users/{username}).
 * NO valida la contraseña, así que no es autenticación real.
 */
@Component({
  selector: 'app-cuenta',
  imports: [ReactiveFormsModule, RouterLink, PublicationCard],
  templateUrl: './cuenta.html',
})
export class CuentaPage {
  protected readonly auth = inject(AuthService);
  private readonly userSvc = inject(UserService);
  private readonly pubSvc = inject(PublicationService);
  private readonly productSvc = inject(ProductService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(NonNullableFormBuilder);

  // ---- Login / Registro ----
  protected readonly mode = signal<'login' | 'register'>('login');
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly loginForm = this.fb.group({
    username: ['', [Validators.required, Validators.maxLength(50)]],
  });

  protected readonly registerForm = this.fb.group({
    username: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[A-Za-z0-9._-]+$/)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
    phone: ['', Validators.pattern(/^\+?[0-9]{7,15}$/)],
  });

  // ---- Perfil ----
  protected readonly user = signal<User | null>(null);
  protected readonly myPublications = signal<Publication[]>([]);
  protected readonly products = signal<Map<number, Product>>(new Map());
  protected readonly profileLoading = signal(false);
  protected readonly profileError = signal<string | null>(null);

  constructor() {
    if (this.auth.isLoggedIn()) this.loadProfile();
  }

  protected setMode(m: 'login' | 'register'): void {
    this.mode.set(m);
    this.error.set(null);
  }

  // ---------- Login (solo front: verifica que el usuario exista) ----------
  protected login(): void {
    this.error.set(null);
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.busy.set(true);
    this.userSvc.get(this.loginForm.controls.username.value).subscribe({
      next: u => {
        if (u.enabled === false) {
          this.busy.set(false);
          this.error.set('La cuenta está deshabilitada');
          return;
        }
        this.startSession(u.username);
      },
      error: err => {
        this.busy.set(false);
        this.error.set(errorMessage(err));
      },
    });
  }

  // ---------- Registro ----------
  protected register(): void {
    this.error.set(null);
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    const v = this.registerForm.getRawValue();
    this.busy.set(true);
    this.userSvc
      .create({
        username: v.username.trim(),
        email: v.email.trim(),
        password: v.password,
        phone: v.phone.trim() || null, // el backend rechaza "" (solo acepta null o 7-15 dígitos)
      })
      .subscribe({
        next: u => this.startSession(u.username),
        error: err => {
          this.busy.set(false);
          this.error.set(errorMessage(err));
        },
      });
  }

  private startSession(username: string): void {
    this.auth.login(username);
    this.busy.set(false);
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl && returnUrl.startsWith('/')) {
      this.router.navigateByUrl(returnUrl);
      return;
    }
    this.loadProfile();
  }

  // ---------- Perfil ----------
  protected loadProfile(): void {
    const me = this.auth.username();
    if (!me) return;
    this.profileLoading.set(true);
    this.profileError.set(null);

    forkJoin({
      user: this.userSvc.get(me),
      pubs: this.pubSvc.searchByUsername(me),
      products: this.productSvc.mapById(),
    }).subscribe({
      next: ({ user, pubs, products }) => {
        this.user.set(user);
        this.myPublications.set(pubs.filter(p => p.status));
        this.products.set(products);
        this.profileLoading.set(false);
      },
      error: err => {
        this.profileError.set(errorMessage(err));
        this.profileLoading.set(false);
      },
    });
  }

  protected logout(): void {
    this.auth.logout();
    this.user.set(null);
    this.myPublications.set([]);
    this.loginForm.reset();
    this.registerForm.reset();
    this.mode.set('login');
  }

protected invalid(form: 'login' | 'register', name: string): boolean {
  const c =
    form === 'login'
      ? this.loginForm.get(name)
      : this.registerForm.get(name);
  return !!c && c.invalid && (c.touched || c.dirty);
}
}
