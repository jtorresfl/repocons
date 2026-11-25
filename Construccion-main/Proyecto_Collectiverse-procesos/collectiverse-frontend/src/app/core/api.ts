import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';

/**
 * Base de la API. Se toma de src/environments (apiUrl = URL del backend, sin /api).
 * El backend permite el origen del frontend mediante CorsConfig.java.
 */
export const API_URL = `${environment.apiUrl}/api`;

/**
 * El backend responde los errores de dos formas:
 *  - texto plano (GlobalExceptionHandler): "Producto no encontrado"
 *  - JSON {"error": "..."} (AuthController)
 * Esta función devuelve siempre un mensaje legible.
 */
export function errorMessage(err: unknown): string {
  if (!(err instanceof HttpErrorResponse)) return 'Ocurrió un error inesperado';
  if (err.status === 0) return 'No se pudo conectar con el servidor. ¿Está corriendo el backend en el puerto 8080?';
  if (typeof err.error === 'string' && err.error.trim()) return err.error;
  if (err.error?.error) return String(err.error.error);
  if (err.status === 401) return 'Credenciales inválidas o sesión expirada';
  if (err.status === 403) return 'No tienes permisos para realizar esta acción';
  return `Error ${err.status}`;
}
