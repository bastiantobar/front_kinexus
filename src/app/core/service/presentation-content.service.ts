import { Injectable } from '@angular/core';

export type Audiencia = 'empresas' | 'personas';

export interface KinexusService {
  id: string;
  audiencia: Audiencia; // define en qué grupo aparece y los textos de sus botones
  slug: string; // URL: /servicios/:slug
  name: string; // nombre corto para cards y nav
  seoTitle: string; // <title> de /servicios/:slug, con la palabra clave al inicio
  title: string;
  image: string;
  brief: string;
  description: string;
  fullInfo?: string;
  features?: string[];
  whyChoose?: string[];
  content?: string[];
  stats?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PresentationContentService {
  private whatsAppNumber = '56963691898';
  private whatsAppMessage = 'Hola, me gustaría agendar una evaluación inicial con Kinexus.';

  private heroVideos = [1, 2, 3].map(n => `assets/kinexus/hero/video${n}_muted.mp4`);

  private galleryImages = [1, 2, 3, 4, 5, 6].map(n => `assets/kinexus/nuestro-trabajo/nt${n}.jpg`);

  private services: KinexusService[] = [
    {
      id: 'vitality',
      audiencia: 'empresas',
      slug: 'vitality-pausas-activas',
      name: 'Vitality · Bienestar y movimiento',
      seoTitle: 'Pausas activas para empresas: programa Vitality | Ki-Nexus',
      title: 'KI-NEXUS: VITALITY',
      image: 'assets/kinexus/servicios/vitality.jpg',
      brief: 'Transforma la fatiga acumulada en energía disponible y mide los resultados.',
      description: 'Ki-Nexus Vitality es un programa que combina pausas activas, educación y seguimiento, con actividades adaptadas a las necesidades y objetivos de cada empresa.',
      fullInfo: 'Enfoque clínico, mediciones reales, bajo roce y alto impacto.',
      features: [
        'Sesión de Onboarding y Diagnóstico',
        'Ciclo de Entrenamiento Presencial',
        'Reunión de Entrega de Resultados (KPI Report)'
      ]
    },
    {
      id: 'focus',
      audiencia: 'empresas',
      slug: 'focus-time',
      name: 'Focus Time · Charlas y workshops',
      seoTitle: 'Charlas y workshops de ergonomía y manejo del estrés: Focus Time | Ki-Nexus',
      title: 'KI-NEXUS: FOCUS TIME',
      image: 'assets/kinexus/servicios/focus-time.jpg',
      brief: 'Vive una sesión de alto impacto mediante un taller teórico-práctico.',
      description: 'Educamos y entregamos herramientas a tu equipo para promover una mejor gestión del estrés, la inclusión y un mejor clima laboral.',
      content: [
        'Prevención de trastornos musculoesqueléticos',
        'Neuroergonomía',
        'Inclusión'
      ]
    },
    {
      id: 'cbe',
      audiencia: 'empresas',
      slug: 'check-up-biomecanico',
      name: 'Check Up Biomecánico Express (CBE)',
      seoTitle: 'Ergonomía laboral: Check Up Biomecánico Express | Ki-Nexus',
      title: 'KI-NEXUS: CHECK UP BIOMECÁNICO EXPRESS (CBE)',
      image: 'assets/kinexus/servicios/check-up-biomecanico.jpg',
      brief: 'Evita multas y cumple la normativa vigente desde la ergonomía.',
      description: 'Una jornada de evaluaciones individuales en la que el especialista evalúa cada puesto de trabajo. Así obtienes un mapa de calor de tu equipo y puedes activar soluciones a tiempo.',
      whyChoose: [
        'Genera un impacto inmediato en la experiencia del trabajador',
        'Disminuye los riesgos de lesiones',
        'Cumple con el rol preventivo exigido por el DS 44'
      ]
    },
    {
      id: 'domicilio',
      audiencia: 'personas',
      slug: 'kinesiologia-a-domicilio',
      name: 'Kinesiología a domicilio',
      seoTitle: 'Kinesiología a domicilio: rehabilitación en tu hogar | Ki-Nexus',
      title: 'KI-NEXUS: KINESIOLOGÍA A DOMICILIO',
      image: 'assets/kinexus/nuestro-trabajo/nt5.jpg',
      brief: 'Kinesiología y rehabilitación en tu hogar.',
      description: 'Atención profesional y personalizada para mejorar tu movilidad, recuperar tu funcionalidad y potenciar tu calidad de vida.',
      features: [
        'Rehabilitación neurológica',
        'Recuperación musculoesquelética',
        'Mejora de la funcionalidad',
        'Atención segura y en tu hogar'
      ]
    },
    // TODO: Reactivar el servicio KI-NEXUS WELLNESS LEAGUE cuando esté listo para su lanzamiento.
    // {
    //   id: 'game',
    //   title: 'KI-NEXUS: WELLNESS LEAGUE',
    //   image: '', // la imagen anterior (services/game.png) se eliminó; recuperable desde git
    //   brief: 'Este es nuestro plan de bienestar organizacional que optimiza el ecosistema laboral generando impacto en áreas o sucursales.',
    //   description: 'Nuestro plan KI-NEXUS WELLNESS LEAGUE consta de una serie de intervenciones con un enfoque lúdico dirigidas por kinesiólogos especialistas en neurorehabilitación.',
    //   fullInfo: 'Implementamos nuestra metodología exclusiva de intervención híbrida diseñada para equipos que exigen el máximo rendimiento con la mínima interrupción operativa.',
    //   features: [
    //     'Optimizar la comunicación interdisciplinaria',
    //     'Impulsar mejores hábitos en tu organización',
    //     'Mejorar la experiencia de trabajo',
    //     'Obtener KPI sobre la salud y productividad de tu empresa'
    //   ]
    // }
  ];

  getHeroVideos() { return [...this.heroVideos]; }
  getGalleryImages() { return [...this.galleryImages]; }
  getServices(audiencia?: Audiencia) {
    return this.services.filter(s => !audiencia || s.audiencia === audiencia);
  }
  getService(slug: string) { return this.services.find(s => s.slug === slug); }
  getWhatsAppUrl() {
    return `https://wa.me/${this.whatsAppNumber}?text=${encodeURIComponent(this.whatsAppMessage)}`;
  }
  getWhatsAppConfig() {
    return { number: this.whatsAppNumber, message: this.whatsAppMessage };
  }
}
