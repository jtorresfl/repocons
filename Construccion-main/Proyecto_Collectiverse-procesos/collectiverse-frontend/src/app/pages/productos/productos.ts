import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { errorMessage } from '../../core/api';
import { AuthService } from '../../core/auth.service';
import { CatalogService } from '../../core/catalog.service';
import { Category, Collection, Product } from '../../core/models';
import { ProductService } from '../../core/product.service';
import { PublicationService } from '../../core/publication.service';

type ImageGroup = FormGroup<{ url: FormControl<string> }>;

@Component({
  selector: 'app-productos',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe],
  templateUrl: './productos.html',
})
export class ProductosPage {
  private readonly productSvc = inject(ProductService);
  private readonly catalogSvc = inject(CatalogService);
  private readonly pubSvc = inject(PublicationService);
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly auth = inject(AuthService);

  // ---- Listado / búsqueda ----
  protected readonly products = signal<Product[]>([]);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly term = signal('');
  protected readonly categoryFilter = signal<number | null>(null);
  /** idProducto -> cantidad de publicaciones activas (varios vendedores pueden publicar el mismo producto). */
  protected readonly offerCount = signal<Map<number, number>>(new Map());
  /** Categorías conocidas a partir del catálogo completo (no requiere login). */
  protected readonly knownCategories = signal<{ id: number; name: string }[]>([]);

  // ---- Formulario de registro ----
  protected readonly categories = signal<Category[]>([]);
  protected readonly collections = signal<Collection[]>([]);
  protected readonly saving = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly formOk = signal<string | null>(null);
  protected readonly showForm = signal(false);

  protected readonly form = this.fb.group({
    categoryId: new FormControl<number | null>(null, Validators.required),
    collectionId: new FormControl<number | null>(null),
    name: ['', [Validators.required, Validators.maxLength(100)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    price: [0, [Validators.required, Validators.min(0)]],
    images: this.fb.array<ImageGroup>([]),
  });

  private readonly selectedCategory = toSignal(this.form.controls.categoryId.valueChanges, { initialValue: null });
  protected readonly collectionsOfCategory = computed(() =>
    this.collections().filter(c => c.idCategory === this.selectedCategory()),
  );

  constructor() {
    this.load();
    this.loadOfferCounts();
    if (this.auth.isLoggedIn()) this.loadCatalogForForm();
  }

  protected get images(): FormArray<ImageGroup> {
    return this.form.controls.images;
  }

  // ---------- Consultas al backend ----------
  protected load(): void {
    this.loading.set(true);
    this.error.set(null);

    const hasFilters = this.term().trim() !== '' || this.categoryFilter() !== null;
    const request$ = hasFilters
      ? this.productSvc.search(this.categoryFilter(), this.term())
      : this.productSvc.list();

    request$.subscribe({
      next: list => {
        this.products.set(list);
        if (!hasFilters) this.rememberCategories(list);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(errorMessage(err));
        this.products.set([]);
        this.loading.set(false);
      },
    });
  }

  private loadOfferCounts(): void {
    this.pubSvc.list().subscribe({
      next: pubs => {
        const map = new Map<number, number>();
        pubs.filter(p => p.status).forEach(p => map.set(p.idProduct, (map.get(p.idProduct) ?? 0) + 1));
        this.offerCount.set(map);
      },
      error: () => this.offerCount.set(new Map()),
    });
  }

  protected onSearch(event: Event): void {
    event.preventDefault();
    this.load();
  }

  protected clearFilters(): void {
    this.term.set('');
    this.categoryFilter.set(null);
    this.load();
  }

  protected onCategoryChange(value: string): void {
    this.categoryFilter.set(value === '' ? null : Number(value));
    this.load();
  }

  private rememberCategories(list: Product[]): void {
    const map = new Map(this.knownCategories().map(c => [c.id, c.name]));
    list.forEach(p => map.set(p.categoryId, p.categoryName));
    this.knownCategories.set(
      [...map].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name)),
    );
  }

  // ---------- Registro ----------
  private loadCatalogForForm(): void {
    this.catalogSvc.listCategories().subscribe({
      next: c => this.categories.set(c.filter(x => x.status)),
      error: err => this.formError.set(errorMessage(err)),
    });
    this.catalogSvc.listCollections().subscribe({
      next: c => this.collections.set(c.filter(x => x.status)),
      error: err => this.formError.set(errorMessage(err)),
    });
  }

  protected toggleForm(): void {
    this.showForm.update(v => !v);
    this.formOk.set(null);
    this.formError.set(null);
  }

  protected addImage(): void {
    this.images.push(this.fb.group({ url: ['', [Validators.required, Validators.maxLength(255)]] }));
  }

  protected removeImage(i: number): void {
    this.images.removeAt(i);
  }

  protected onCategoryFormChange(): void {
    this.form.controls.collectionId.setValue(null); // la colección debe pertenecer a la categoría
  }

  protected submit(): void {
    this.formOk.set(null);
    this.formError.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.saving.set(true);

    this.productSvc
      .create({
        categoryId: v.categoryId!,
        collectionId: v.collectionId,
        name: v.name.trim(),
        stock: v.stock,
        price: v.price,
        createdBy: this.auth.username()!,
        images: v.images.map((img, i) => ({ url: img.url.trim(), order: i + 1 })),
      })
      .subscribe({
        next: created => {
          this.saving.set(false);
          this.formOk.set(`Producto "${created.name}" registrado con id ${created.id}`);
          this.form.reset({ name: '', stock: 0, price: 0, categoryId: null, collectionId: null });
          this.images.clear();
          this.load();
          this.loadOfferCounts();
        },
        error: err => {
          this.saving.set(false);
          this.formError.set(errorMessage(err));
        },
      });
  }

  protected invalid(name: 'categoryId' | 'name' | 'stock' | 'price'): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }

  protected hideBrokenImage(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
