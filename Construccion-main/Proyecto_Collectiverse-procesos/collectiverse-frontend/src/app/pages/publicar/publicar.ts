import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { of, switchMap, tap } from 'rxjs';
import { errorMessage } from '../../core/api';
import { AuthService } from '../../core/auth.service';
import { CatalogService } from '../../core/catalog.service';
import { Category, Collection, Product, PublicationType } from '../../core/models';
import { ProductService } from '../../core/product.service';
import { PublicationService } from '../../core/publication.service';

type ImageGroup = FormGroup<{ url: FormControl<string> }>;
type ExchangeGroup = FormGroup<{
  requestedName: FormControl<string>;
  description: FormControl<string>;
  quantity: FormControl<number>;
}>;
type Field = 'categoryId' | 'name' | 'stock' | 'price' | 'title' | 'description';

@Component({
  selector: 'app-publicar',
  imports: [ReactiveFormsModule],
  templateUrl: './publicar.html',
})
export class PublicarPage {
  private readonly catalogSvc = inject(CatalogService);
  private readonly productSvc = inject(ProductService);
  private readonly pubSvc = inject(PublicationService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly auth = inject(AuthService);

  protected readonly categories = signal<Category[]>([]);
  protected readonly collections = signal<Collection[]>([]);
  protected readonly loadError = signal<string | null>(null);
  protected readonly saving = signal(false);
  protected readonly formError = signal<string | null>(null);

  /** Si el producto ya se creó pero la publicación falló, se reutiliza al reintentar (evita duplicados). */
  private createdProduct: Product | null = null;

  protected readonly form = this.fb.group({
    // Producto
    categoryId: new FormControl<number | null>(null, Validators.required),
    collectionId: new FormControl<number | null>(null),
    name: ['', [Validators.required, Validators.maxLength(100)]],
    stock: [1, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
    price: [0, [Validators.required, Validators.min(0)]],
    images: this.fb.array<ImageGroup>([]),
    // Publicación
    title: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', Validators.maxLength(255)],
    type: this.fb.control<PublicationType>('VENTA'),
    exchanges: this.fb.array<ExchangeGroup>([]),
  });

  private readonly selectedCategory = toSignal(this.form.controls.categoryId.valueChanges, { initialValue: null });
  protected readonly collectionsOfCategory = computed(() =>
    this.collections().filter(c => c.idCategory === this.selectedCategory()),
  );

  constructor() {
    this.catalogSvc.listCategories().subscribe({
      next: c => this.categories.set(c.filter(x => x.status)),
      error: err => this.loadError.set(errorMessage(err)),
    });
    this.catalogSvc.listCollections().subscribe({
      next: c => this.collections.set(c.filter(x => x.status)),
      error: err => this.loadError.set(errorMessage(err)),
    });
  }

  protected get images(): FormArray<ImageGroup> { return this.form.controls.images; }
  protected get exchanges(): FormArray<ExchangeGroup> { return this.form.controls.exchanges; }
  protected get isExchange(): boolean { return this.form.controls.type.value === 'INTERCAMBIO'; }

  // ---------- Formulario dinámico ----------
  protected onCategoryChange(): void {
    this.form.controls.collectionId.setValue(null); // la colección debe pertenecer a la categoría
  }

  protected addImage(): void {
    this.images.push(
      this.fb.group({
        url: ['', [Validators.required, Validators.maxLength(255), Validators.pattern(/^https?:\/\/.+/i)]],
      }),
    );
  }

  protected removeImage(i: number): void { this.images.removeAt(i); }

  protected onTypeChange(): void {
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

  protected removeExchange(i: number): void { this.exchanges.removeAt(i); }

  // ---------- Envío: 1) producto  2) publicación ----------
  protected submit(): void {
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

    const product$ = this.createdProduct
      ? of(this.createdProduct)
      : this.productSvc
          .create({
            categoryId: v.categoryId!,
            collectionId: v.collectionId,
            name: v.name.trim(),
            stock: v.stock,
            price: v.price,
            createdBy: me,
            images: v.images.map((img, i) => ({ url: img.url.trim(), order: i + 1 })),
          })
          .pipe(tap(p => (this.createdProduct = p)));

    product$
      .pipe(
        switchMap(product =>
          this.pubSvc.create({
            username: me,
            createdBy: me,
            productId: product.id,
            title: v.title.trim(),
            description: v.description.trim(),
            type: v.type,
            state: 'ACTIVA',
            exchanges:
              v.type === 'INTERCAMBIO'
                ? v.exchanges.map(x => ({
                    requestedName: x.requestedName.trim(),
                    description: x.description.trim(),
                    quantity: x.quantity,
                  }))
                : [],
          }),
        ),
      )
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.createdProduct = null;
          this.router.navigate(['/publicaciones']); // se cierra el ciclo: publicar -> ver
        },
        error: err => {
          this.saving.set(false);
          const msg = errorMessage(err);
          this.formError.set(
            this.createdProduct
              ? `El producto se registró (id ${this.createdProduct.id}) pero la publicación falló: ${msg}. Pulsa "Publicar" para reintentar.`
              : msg,
          );
        },
      });
  }

  protected invalid(name: Field): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }
}