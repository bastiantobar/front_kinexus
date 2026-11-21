import { Component, OnDestroy } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { KinexusService, PresentationContentService } from '../../../core/service/presentation-content.service';

@Component({
  selector: 'app-servicio',
  templateUrl: './servicio.component.html',
})
export class ServicioComponent implements OnDestroy {
  s?: KinexusService;
  otros: KinexusService[] = [];
  private sub: Subscription;

  constructor(content: PresentationContentService, route: ActivatedRoute, router: Router, title: Title, meta: Meta) {
    // paramMap: el componente se reutiliza al navegar entre servicios.
    this.sub = route.paramMap.subscribe(p => {
      this.s = content.getService(p.get('slug') || '');
      if (!this.s) {
        router.navigate(['/servicios']);
        return;
      }
      this.otros = content.getServices(this.s.audiencia).filter(o => o !== this.s);
      title.setTitle(this.s.seoTitle);
      meta.updateTag({ property: 'og:title', content: this.s.seoTitle });
      meta.updateTag({ name: 'description', content: this.s.description });
      meta.updateTag({ property: 'og:description', content: this.s.description });
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
