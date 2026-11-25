import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { errorMessage } from '../../core/api';
import { AuthService } from '../../core/auth.service';
import { Product, Publication, PublicationType } from '../../core/models';
import { ProductService } from '../../core/product.service';
import { PublicationService } from '../../core/publication.service';

type ExchangeGroup = FormGroup<{
  requestedName: FormControl<string>;
  description: FormControl<string>;
  quantity: FormControl<number>;
}>;

@Component({
  selector: 'app-publicaciones',
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  templateUrl: './publicaciones.html',
})
export class PublicacionesPage {
  private readonly pubSvc = inject(PublicationService);
  private readonly productSvc = inject(ProductService);
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  // ---- Listado / filtros ----
  protected readonly publications = signal<Publication[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly username = signal('');
  protected readonly typeFilter = signal<'' | PublicationType>('');

  // ---- Formulario ----
  protected readonly products = signal<Product[]>([]);
  protected readonly showForm = signal(false);
  protected readonly saving = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly formOk = signal<string | null>(null);

  protected readonly form = this.fb.group({
    productId: new FormControl<number | null>(null, Validators.required),
    title: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', Validators.maxLength(255)],
    type: this.fb.control<PublicationType>('VENTA'),
    exchanges: this.fb.array<ExchangeGroup>([]),
  });

  constructor() {
    this.load();
    // /publicaciones?productId=5 -> abre el formulario con ese producto ya elegido
    const pre = Number(this.route.snapshot.queryParamMap.get('productId'));
    if (pre && this.auth.isLoggedIn()) {
      this.showForm.set(true);
      this.form.controls.productId.setValue(pre);
    }
    this.productSvc.list().subscribe({
      next: p => this.products.set(p.filter(x => x.status)),
      error: () => this.products.set([]),
    });
  }

  protected get exchanges(): FormArray<ExchangeGroup> {
    return this.form.controls.exchanges;
  }

  protected get isExchange(): boolean {
    return this.form.controls.type.value === 'INTERCAMBIO';
  }

  // ---------- Consultas ----------
  protected load(): void {
    this.loading.set(true);
    this.error.set(null);

    const user = this.username().trim();
    const type = this.typeFilter();

    // Prioridad: usuario (search) -> tipo (by-type) -> todas
    let request$ = user
      ? this.pubSvc.searchByUsername(user)
      : type
        ? this.pubSvc.searchByType(type)
        : this.pubSvc.list();

    request$.subscribe({
      next: list => {
        // si hay usuario y tipo a la vez, el tipo se filtra aquí
        this.publications.set(user && type ? list.filter(p => p.type === type) : list);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(errorMessage(err));
        this.publications.set([]);
        this.loading.set(false);
      },
    });
  }

  protected onSearch(event: Event): void {
    event.preventDefault();
    this.load();
  }

  protected clearFilters(): void {
    this.username.set('');
    this.typeFilter.set('');
    this.load();
  }

  protected onTypeFilter(value: string): void {
    this.typeFilter.set(value as '' | PublicationType);
    this.load();
  }

  // ---------- Registro ----------
  protected toggleForm(): void {
    this.showForm.update(v => !v);
    this.formOk.set(null);
    this.formError.set(null);
  }

  protected onTypeChange(): void {
    // Un INTERCAMBIO necesita al menos un artículo solicitado
    if (this.isExchange && this.exchanges.length === 0) this.addExchange();
    if (!this.isExchange) this.exchanges.clear();
  }

  protected addExchange(): void {
    this.exchanges.push(
      this.fb.group({
        requestedName: ['', [Validators.required, Validators.maxLength(100)]],
        description: ['', Validators.maxLength(255)],
        quantity: [1, [Validators.required, Validators.min(1)]],
      }),
    );
  }

  protected removeExchange(i: number): void {
    this.exchanges.removeAt(i);
  }

  protected submit(): void {
    this.formOk.set(null);
    this.formError.set(null);

    if (this.isExchange && this.exchanges.length === 0) {
      this.formError.set('Una publicación de INTERCAMBIO debe incluir al menos un artículo solicitado');
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const me = this.auth.username()!;
    this.saving.set(true);

    this.pubSvc
      .create({
        username: me,
        createdBy: me,
        productId: v.productId!,
        title: v.title.trim(),
        description: v.description.trim(),
        type: v.type,
        state: 'ACTIVA',
        exchanges: v.type === 'INTERCAMBIO' ? v.exchanges : [],
      })
      .subscribe({
        next: created => {
          this.saving.set(false);
          this.formOk.set(`Publicación "${created.title}" creada con id ${created.id}`);
          this.form.reset({ productId: null, title: '', description: '', type: 'VENTA' });
          this.exchanges.clear();
          this.load();
        },
        error: err => {
          this.saving.set(false);
          this.formError.set(errorMessage(err));
        },
      });
  }

  protected invalid(name: 'productId' | 'title' | 'description'): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }
}
