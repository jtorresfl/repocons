import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { errorMessage } from '../../core/api';
import { AuthService } from '../../core/auth.service';
import { Product, Publication } from '../../core/models';
import { ProductService } from '../../core/product.service';
import { PublicationService } from '../../core/publication.service';

/**
 * Ficha de un producto del catálogo + todas las publicaciones (ofertas) que
 * distintos usuarios hicieron de ese mismo producto.
 */
@Component({
  selector: 'app-producto-detalle',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './producto-detalle.html',
})
export class ProductoDetallePage {
  private readonly route = inject(ActivatedRoute);
  private readonly productSvc = inject(ProductService);
  private readonly pubSvc = inject(PublicationService);
  protected readonly auth = inject(AuthService);

  protected readonly product = signal<Product | null>(null);
  protected readonly offers = signal<Publication[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly typeFilter = signal<'' | 'VENTA' | 'INTERCAMBIO'>('');
  protected readonly selectedImage = signal(0);

  protected readonly visibleOffers = computed(() =>
    this.offers().filter(o => !this.typeFilter() || o.type === this.typeFilter()),
  );
  protected readonly ventas = computed(() => this.offers().filter(o => o.type === 'VENTA').length);
  protected readonly intercambios = computed(() => this.offers().filter(o => o.type === 'INTERCAMBIO').length);

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    // GET /api/products/{id} y GET /api/publications (se filtran las de este producto)
    forkJoin({ product: this.productSvc.get(id), pubs: this.pubSvc.list() }).subscribe({
      next: ({ product, pubs }) => {
        this.product.set(product);
        this.offers.set(
          pubs
            .filter(p => p.idProduct === id && p.status)
            .sort((a, b) => b.date.localeCompare(a.date)),
        );
        this.loading.set(false);
      },
      error: err => {
        this.error.set(errorMessage(err));
        this.loading.set(false);
      },
    });
  }

  protected setType(value: string): void {
    this.typeFilter.set(value as '' | 'VENTA' | 'INTERCAMBIO');
  }

  protected hideBrokenImage(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
