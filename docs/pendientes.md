# Pendientes del sitio público

## 1. Prerender / SSR (SEO)
El sitio es una SPA (Angular 12, sin SSR). Google renderiza JS, pero con menos fiabilidad y más lento que con HTML estático. Hoy cada ruta actualiza title, description, OG y canonical en el cliente (`routes/site/site-layout.component.ts`).

Opciones:
- **Recomendada:** actualizar Angular (12 → ≥17) y usar `@angular/ssr` con prerender de las rutas públicas (`/`, `/servicios`, `/servicios/:slug`, `/nosotros`, `/contacto`). El build genera HTML estático, compatible con el hosting cPanel actual.
- Angular Universal 12 (`@nguniversal/express-engine`) sin actualizar.

Hay que adaptar en cualquiera de los dos casos:
- Acceso directo a `window`, `document` y `localStorage`. Por ejemplo `core/service/theme.service.ts` y `intlTelInput` en `routes/site/contacto`.
- Scripts globales de jQuery de la plantilla Angle (`angular.json` → `scripts`).
- Deploy: subir los HTML prerenderizados y mantener el fallback de `.htaccess`.

## 2. Blog
- El header ya deja espacio para un 5.º ítem. Para activarlo, agrega `{ path: '/blog', label: 'Blog' }` al arreglo `nav` en `routes/site/site-layout.component.ts`.
- Crea la ruta `blog` (y `blog/:slug`) como hija en `routes/site/site.module.ts`, con `data: { title, description }`.
- Ojo: ya existe una ruta `blog` de la plantilla Angle (protegida, dentro del layout admin). Hay que eliminarla o renombrarla para que no choque.
- Temas sugeridos, alineados a las palabras clave: **kinesiología laboral**, **pausas activas para empresas** y **ergonomía laboral**.

## 3. SEO: mantenimiento
- Cada vez que agregues una página pública, súmala a `src/sitemap.xml` (y actualiza `lastmod`).
- Palabras clave objetivo: *kinesiología laboral*, *pausas activas para empresas* y *ergonomía laboral*.

## 4. Limpieza
- Los videos del carrusel de portada (`src/assets/kinexus/hero/*.mp4`, ~59 MB) conviene comprimirlos para web.
- Originales en alta resolución y archivos no versionados se apartaron en `../originales/` (fuera del build).
- `presentation-content.service.ts` mantiene su nombre por compatibilidad; ahora lo usa `routes/site`.
