import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { errorMessage } from '../../core/api';
import { AuthService } from '../../core/auth.service';
import { Product, Publication, PublicationType } from '../../core/models';
import { ProductService } from '../../core/product.service';
import { PublicationService } from '../../core/publication.service';
import { PublicationCard } from '../../shared/publication-card/publication-card';

@Component({
  selector: 'app-publicaciones',
  imports: [RouterLink, PublicationCard],
  templateUrl: './publicaciones.html',
})
export class PublicacionesPage {
  private readonly pubSvc = inject(PublicationService);
  private readonly productSvc = inject(ProductService);
  protected readonly auth = inject(AuthService);

  protected readonly publications = signal<Publication[]>([]);
  /** idProducto -> producto (precio, stock, imágenes), que GET /publications no trae */
  protected readonly products = signal<Map<number, Product>>(new Map());
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly warning = signal<string | null>(null);
  protected readonly username = signal('');
  protected readonly typeFilter = signal<'' | PublicationType>('');

  constructor() {
    // Los productos se piden una sola vez; las publicaciones en cada búsqueda
    this.productSvc.mapById().subscribe({
      next: m => this.products.set(m),
      error: err => this.warning.set('No se pudieron cargar precio e imágenes: ' + errorMessage(err)),
    });
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);

    const user = this.username().trim();
    const type = this.typeFilter();

    // Prioridad: usuario (search) -> tipo (by-type) -> todas
    const request$ = user
      ? this.pubSvc.searchByUsername(user)
      : type
        ? this.pubSvc.searchByType(type)
        : this.pubSvc.list();

    request$.subscribe({
      next: list => {
        const active = list.filter(p => p.status);
        this.publications.set(user && type ? active.filter(p => p.type === type) : active);
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
}