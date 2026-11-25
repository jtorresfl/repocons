import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from './api';
import { User, UserRequest } from './models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/users`;

  /** GET /api/users/{username} (404 si no existe) */
  get(username: string): Observable<User> {
    return this.http.get<User>(`${this.url}/${encodeURIComponent(username.trim())}`);
  }

  /** POST /api/users (409 si el usuario o el correo ya existen) */
  create(body: UserRequest): Observable<User> {
    return this.http.post<User>(this.url, body);
  }
}