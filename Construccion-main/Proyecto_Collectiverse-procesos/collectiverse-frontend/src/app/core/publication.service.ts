import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './api';
import { Publication, PublicationRequest, PublicationType } from './models';

@Injectable({ providedIn: 'root' })
export class PublicationService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/publications`;

  /** GET /api/publications */
  list(): Observable<Publication[]> {
    return this.http.get<Publication[]>(this.url);
  }

  /** GET /api/publications/search?username= */
  searchByUsername(username: string): Observable<Publication[]> {
    return this.http.get<Publication[]>(`${this.url}/search`, {
      params: new HttpParams().set('username', username.trim()),
    });
  }

  /** GET /api/publications/by-type?type= */
  searchByType(type: PublicationType): Observable<Publication[]> {
    return this.http.get<Publication[]>(`${this.url}/by-type`, {
      params: new HttpParams().set('type', type),
    });
  }

  /** POST /api/publications */
  create(body: PublicationRequest): Observable<Publication> {
    return this.http.post<Publication>(this.url, body);
  }
}
