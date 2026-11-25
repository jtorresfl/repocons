import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { Product, Publication } from '../../core/models';

/** Publicación + el producto que contiene (cruzado por idProduct en la página que la usa). */
@Component({
  selector: 'app-publication-card',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './publication-card.html',
})
export class PublicationCard {
  readonly publication = input.required<Publication>();
  readonly product = input<Product | null>(null);

  protected readonly cover = computed(() => this.product()?.images[0]?.url ?? null);

  protected hideBrokenImage(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}