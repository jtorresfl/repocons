import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './api';
import { Category, CategoryRequest, Collection, CollectionRequest } from './models';

/** Categorías y colecciones (el usuario viaja en createdBy). */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);

  listCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${API_URL}/category`);
  }
  createCategory(body: CategoryRequest): Observable<Category> {
    return this.http.post<Category>(`${API_URL}/category`, body);
  }

  listCollections(): Observable<Collection[]> {
    return this.http.get<Collection[]>(`${API_URL}/collection`);
  }
  createCollection(body: CollectionRequest): Observable<Collection> {
    return this.http.post<Collection>(`${API_URL}/collection`, body);
  }
}
