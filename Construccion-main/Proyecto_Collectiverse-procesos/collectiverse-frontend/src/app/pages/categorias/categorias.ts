import { Component, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { errorMessage } from '../../core/api';
import { AuthService } from '../../core/auth.service';
import { CatalogService } from '../../core/catalog.service';
import { Category, Collection } from '../../core/models';

@Component({
  selector: 'app-categorias',
  imports: [ReactiveFormsModule],
  templateUrl: './categorias.html',
})
export class CategoriasPage {
  private readonly svc = inject(CatalogService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly categories = signal<Category[]>([]);
  protected readonly collections = signal<Collection[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly catSaving = signal(false);
  protected readonly catError = signal<string | null>(null);
  protected readonly catOk = signal<string | null>(null);

  protected readonly colSaving = signal(false);
  protected readonly colError = signal<string | null>(null);
  protected readonly colOk = signal<string | null>(null);

  /** Colecciones agrupadas por categoría para mostrarlas dentro de cada tarjeta. */
  protected readonly collectionsByCategory = computed(() => {
    const map = new Map<number, Collection[]>();
    this.collections().forEach(c => map.set(c.idCategory, [...(map.get(c.idCategory) ?? []), c]));
    return map;
  });

  protected readonly categoryForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(50)]],
    description: ['', Validators.maxLength(255)],
  });

  protected readonly collectionForm = this.fb.group({
    idCategory: new FormControl<number | null>(null, Validators.required),
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', Validators.maxLength(255)],
  });

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.svc.listCategories().subscribe({
      next: c => {
        this.categories.set(c);
        this.loading.set(false);
      },
      error: err => {
        this.error.set(errorMessage(err));
        this.loading.set(false);
      },
    });
    this.svc.listCollections().subscribe({
      next: c => this.collections.set(c),
      error: err => this.error.set(errorMessage(err)),
    });
  }

  protected saveCategory(): void {
    this.catOk.set(null);
    this.catError.set(null);
    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }
    const v = this.categoryForm.getRawValue();
    this.catSaving.set(true);
    this.svc.createCategory({ name: v.name.trim(), description: v.description.trim(), createdBy: this.auth.username()! }).subscribe({
      next: c => {
        this.catSaving.set(false);
        this.catOk.set(`Categoría "${c.name}" creada`);
        this.categoryForm.reset();
        this.load();
      },
      error: err => {
        this.catSaving.set(false);
        this.catError.set(errorMessage(err));
      },
    });
  }

  protected saveCollection(): void {
    this.colOk.set(null);
    this.colError.set(null);
    if (this.collectionForm.invalid) {
      this.collectionForm.markAllAsTouched();
      return;
    }
    const v = this.collectionForm.getRawValue();
    this.colSaving.set(true);
    this.svc
      .createCollection({ idCategory: v.idCategory!, name: v.name.trim(), description: v.description.trim(), createdBy: this.auth.username()! })
      .subscribe({
        next: c => {
          this.colSaving.set(false);
          this.colOk.set(`Colección "${c.name}" creada`);
          this.collectionForm.reset({ idCategory: v.idCategory, name: '', description: '' });
          this.load();
        },
        error: err => {
          this.colSaving.set(false);
          this.colError.set(errorMessage(err));
        },
      });
  }

  protected invalid(form: 'category' | 'collection', name: string): boolean {
    const group: AbstractControl = form === 'category' ? this.categoryForm : this.collectionForm;
    const c = group.get(name)!;
    return c.invalid && (c.touched || c.dirty);
  }
}
