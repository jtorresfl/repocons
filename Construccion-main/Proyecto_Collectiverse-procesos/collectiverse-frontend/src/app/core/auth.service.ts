import { Injectable, computed, signal } from '@angular/core';

/**
 * Sin Spring Security el backend no autentica: solo recibe el nombre de usuario
 * en el body (username / createdBy). Aquí guardamos únicamente ese nombre en
 * sessionStorage para rellenar los formularios. No hay contraseña ni token.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly KEY = 'collectiverse.username';

  private readonly _username = signal<string | null>(this.restore());
  readonly username = computed(() => this._username());
  readonly isLoggedIn = computed(() => this._username() !== null);

  login(username: string): void {
    const name = username.trim();
    try { sessionStorage.setItem(this.KEY, name); } catch { /* sin storage: solo en memoria */ }
    this._username.set(name);
  }

  logout(): void {
    try { sessionStorage.removeItem(this.KEY); } catch { /* ignorar */ }
    this._username.set(null);
  }

  private restore(): string | null {
    try { return sessionStorage.getItem(this.KEY); } catch { return null; }
  }
}
