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

  // Los 3 conceptos SEO. Cada pilar enlaza al servicio que lo resuelve.
  pilares = [
    {
      color: 'blue', icono: 'fa-user-md', titulo: 'Kinesiología laboral', slug: 'vitality-pausas-activas',
      texto: 'Intervenciones dirigidas por kinesiólogos para prevenir lesiones y reducir el desgaste físico de tus equipos.'
    },
    {
      color: 'orange', icono: 'fa-running', titulo: 'Pausas activas para empresas', slug: 'vitality-pausas-activas',
      texto: 'Ciclos presenciales de 5 a 8 semanas, guiados en el lugar de trabajo y con resultados medidos.'
    },
    {
      color: 'green', icono: 'fa-chair', titulo: 'Ergonomía laboral', slug: 'check-up-biomecanico',
      texto: 'Evaluación biomecánica en el puesto real para detectar riesgos ergonómicos y corregirlos a tiempo.'
    },
  ];

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
