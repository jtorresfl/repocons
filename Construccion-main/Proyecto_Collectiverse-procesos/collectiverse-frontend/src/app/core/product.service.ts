import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './api';
import { Product, ProductRequest } from './models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/products`;

  /** GET /api/products */
  list(): Observable<Product[]> {
    return this.http.get<Product[]>(this.url);
  }

  /** GET /api/products/{id} */
  get(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.url}/${id}`);
  }

  /** GET /api/products/search?categoryId=&term=  (el backend exige al menos un filtro) */
  search(categoryId: number | null, term: string): Observable<Product[]> {
    let params = new HttpParams();
    if (categoryId !== null) params = params.set('categoryId', categoryId);
    if (term.trim()) params = params.set('term', term.trim());
    return this.http.get<Product[]>(`${this.url}/search`, { params });
  }

  /** POST /api/products */
  create(body: ProductRequest): Observable<Product> {
    return this.http.post<Product>(this.url, body);
  }
}
