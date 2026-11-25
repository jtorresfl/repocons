# Collectiverse – Frontend (Angular)

Frontend que consume el backend Spring Boot (`../collectiverse`), el cual accede a PostgreSQL (Neon).

## Cómo ejecutarlo

1. **Backend** (puerto 8080):
   ```bash
   cd ../collectiverse
   ./gradlew bootRun
   ```
2. **Frontend** (puerto 4200):
   ```bash
   cd collectiverse-frontend
   npm install
   npm start        # = ng serve, 
   ```
3. Abrir http://localhost:4200

**Conexión con el backend:** el frontend llama directamente a la URL del backend definida en
`src/environments/environment.development.ts` (`apiUrl`). El backend acepta ese origen gracias a
`collectiverse/.../security/CorsConfig.java` (mismo enfoque que `integracionangular`).

> En Codespaces: copia la URL del puerto **8080** (pestaña *Ports*), pégala en `apiUrl` y deja
> la visibilidad del puerto 8080 en **Public**. Si tu Codespace cambia, actualiza `apiUrl`.

## Vistas implementadas

| Vista | Ruta | Endpoints del backend | Acceso |
|---|---|---|---|
| Catálogo de productos (listar, buscar, registrar) | `/productos` | `GET /api/products`, `GET /api/products/search`, `POST /api/products` | Pública; formulario requiere login |
| Publicaciones (listar, filtrar, registrar venta/intercambio) | `/publicaciones` | `GET /api/publications`, `/search`, `/by-type`, `POST /api/publications` | Pública; formulario requiere login |
| Categorías y colecciones | `/categorias` | `GET/POST /api/category`, `GET/POST /api/collection` | Requiere login |
| Login / registro (apoyo) | `/login` | `POST /api/auth/register`, `GET /api/me` | Pública |

## Estructura

```
src/app/
├── core/                 # capa de acceso al backend
│   ├── api.ts            # URL base + manejo de mensajes de error
│   ├── models.ts         # interfaces = Request/Response del backend
│   ├── *.service.ts      # ProductService, PublicationService, CatalogService, AuthService
│   ├── auth.interceptor.ts   # agrega Authorization: Basic a cada petición
│   └── auth.guard.ts     # protege /categorias
└── pages/                # una carpeta por vista
```

## Notas
- El backend usa **HTTP Basic**: el login guarda `usuario:clave` en base64 en `sessionStorage` (se borra al cerrar la pestaña).
- Las validaciones del formulario replican las del backend (`@NotBlank`, `@Min`, `@Size`...) y los errores del servidor (400/404/409) se muestran al usuario.
- Para producción cambia `apiUrl` en `src/environments/environment.ts` (y restringe `allowedOriginPatterns` en `CorsConfig`).
