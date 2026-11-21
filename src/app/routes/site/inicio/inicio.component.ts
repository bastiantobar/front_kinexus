import { AfterViewInit, Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { PresentationContentService } from '../../../core/service/presentation-content.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
})
export class InicioComponent implements AfterViewInit {
  // Carrusel de videos de portada (misma lógica que la landing anterior): al terminar uno, pasa al siguiente.
  @ViewChildren('heroVideo') heroVideoEls!: QueryList<ElementRef<HTMLVideoElement>>;
  heroVideos = this.content.getHeroVideos();
  currentHero = 0;

  pasos = [
    { titulo: 'Diagnóstico', texto: 'Evaluamos a tu equipo y su puesto de trabajo.' },
    { titulo: 'Diseño', texto: 'Definimos un programa según riesgos y objetivos.' },
    { titulo: 'Ejecución', texto: 'Sesiones presenciales guiadas por kinesiólogos.' },
    { titulo: 'Medición', texto: 'Entregamos un informe con indicadores (KPI Report).' },
  ];

  services = this.content.getServices();
  whatsAppUrl = this.content.getWhatsAppUrl();

  constructor(private content: PresentationContentService) { }

  ngAfterViewInit(): void {
    this.playCurrentVideo();
  }

  goToSlide(i: number) {
    this.currentHero = i % this.heroVideos.length;
    this.playCurrentVideo();
  }

  onVideoEnded(i: number) {
    if (i === this.currentHero) this.goToSlide(i + 1);
  }

  private playCurrentVideo() {
    this.heroVideoEls.forEach((ref, i) => {
      const v = ref.nativeElement;
      if (i === this.currentHero) {
        v.currentTime = 0;
        v.play().catch(e => console.warn('Autoplay bloqueado:', e));
      } else {
        v.pause();
      }
    });
  }
}
