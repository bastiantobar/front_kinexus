import { Component, Inject, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { ThemeService } from '../../core/service/theme.service';
import { PresentationContentService } from '../../core/service/presentation-content.service';

const ORIGEN = 'https://ki-nexus.cl';

@Component({
  selector: 'app-site-layout',
  templateUrl: './site-layout.component.html',
})
export class SiteLayoutComponent implements OnDestroy {
  // Para sumar el blog: agregar { path: '/blog', label: 'Blog' }. El header ya tiene espacio.
  nav = [
    { path: '/', label: 'Inicio', exact: true },
    { path: '/servicios', label: 'Servicios', exact: false },
    { path: '/nosotros', label: 'Nosotros', exact: false },
    { path: '/contacto', label: 'Contacto', exact: false },
  ];
  menuAbierto = false;
  year = new Date().getFullYear();
  services = this.content.getServices();
  whatsAppUrl = this.content.getWhatsAppUrl();
  private sub: Subscription;

  constructor(
    public theme: ThemeService,
    private content: PresentationContentService,
    private router: Router,
    private route: ActivatedRoute,
    private title: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private doc: Document,
  ) {
    // El layout se crea antes del NavigationEnd inicial, así que esto cubre también la primera carga.
    this.sub = router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.menuAbierto = false;
      window.scrollTo(0, 0);
      this.aplicarSeo();
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private aplicarSeo(): void {
    let r = this.route;
    while (r.firstChild) r = r.firstChild;
    const { title, description } = r.snapshot.data;
    const url = ORIGEN + this.router.url.split(/[?#]/)[0];

    // Las rutas sin data (detalle de servicio) ponen su propio title/description.
    if (title) {
      this.title.setTitle(title);
      this.meta.updateTag({ property: 'og:title', content: title });
    }
    if (description) {
      this.meta.updateTag({ name: 'description', content: description });
      this.meta.updateTag({ property: 'og:description', content: description });
    }
    this.meta.updateTag({ property: 'og:url', content: url });

    let canonical = this.doc.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = this.doc.createElement('link');
      canonical.rel = 'canonical';
      this.doc.head.appendChild(canonical);
    }
    canonical.href = url;
  }
}
