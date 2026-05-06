import { Injectable } from '@angular/core';

export interface KinexusService {
  id: string;
  title: string;
  image: string;
  images?: string[]; // Optional for carousel
  brief: string;
  description: string;
  fullInfo: string;
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

  private heroVideos = [
    'assets/kinexus/hero/video1_muted.mp4',
    'assets/kinexus/hero/video2_muted.mp4',
    'assets/kinexus/hero/video3_muted.mp4'
  ];

  private galleryImages = [
    { src: 'assets/kinexus/gallery/gal-1.jpg', cls: '' },
    { src: 'assets/kinexus/gallery/gal-2.jpg', cls: 'slower' },
    { src: 'assets/kinexus/gallery/gal-3.jpg', cls: 'faster' },
    { src: 'assets/kinexus/gallery/gal-4.jpg', cls: 'faster' },
    { src: 'assets/kinexus/gallery/gal-5.jpg', cls: 'slower slower-down' },
    { src: 'assets/kinexus/gallery/gal-6.jpg', cls: 'last' }
  ];

  private services: KinexusService[] = [
    {
      id: 'vitality',
      title: 'KI-NEXUS: VITALITY',
      image: 'assets/kinexus/services/vitality-2.png',
      images: [
        'assets/kinexus/services/vitality-1.png',
        'assets/kinexus/services/vitality-2.png'
      ],
      brief: 'Transforma la fatiga acumulada en energía disponible con nuestro ciclo intensivo de pausas activas. enfoque clínico / mediciones reales / bajo roce y alto impacto',
      description: 'Es nuestra intervención intensiva de 5-8 semanas diseñada para equipos que buscan un cambio real en su dinámica diaria. No se trata solo de pausas activas; es un programa transformador.',
      fullInfo: 'A través de sesiones presenciales estratégicas, transformamos la fatiga acumulada en energía disponible, midiendo el progreso desde el primer día hasta el cierre de resultados.',
      features: [
        'Sesión de Onboarding y Diagnóstico',
        'Ciclo de Entrenamiento Presencial',
        'Cápsulas de Continuidad',
        'Reunión de Entrega de Resultados (KPI Report)'
      ]
    },
    {
      id: 'cbe',
      title: 'KI-NEXUS: CHECK UP BIOMECÁNICO EXPRESS (CBE)',
      image: 'assets/kinexus/services/cbe.png',
      brief: 'Evaluación biomecánica individual en el puesto real para detectar riesgos ergonómicos al instante.',
      description: 'Asesoría ideal para eventos de bienestar, ferias de salud interna o eventos de captación. Es una jornada de evaluaciones individuales en donde el especialista realiza un reconocimiento postural completo.',
      fullInfo: 'Ideal para obtener un mapa de calor sobre la salud de tu equipo y activa soluciones de bienestar personalizadas.',
      whyChoose: [
        'Sesión de poco tiempo de interrupción de la jornada laboral',
        'Genera impacto inmediato en la experiencia del trabajador',
        'Disminuye los riesgos de lesiones'
      ]
    },
    {
      id: 'focus',
      title: 'KI-NEXUS: FOCUS TIME',
      image: 'assets/kinexus/services/focus.png',
      brief: 'Optimiza el rendimiento de tu equipo con nuestra jornada de capacitación teórico práctica orientada al desarrollo de herramientas sobre ergonomía cognitiva y manejo del estrés.',
      description: 'Vive una sesión de alto impacto para equipos de tecnología, equipos creativos, grupos de alta demanda laboral observando pantallas o gerencias con alta carga de estrés.',
      fullInfo: 'Un taller teórico-práctico de una sola sesión de alto impacto (2 horas) que le entregará herramientas prácticas a tu equipo.',
      content: [
        'Ciencia del estrés',
        'Técnicas de neuro-activación',
        'Higiene de columna y visión para trabajadores digitales'
      ]
    },
    {
      id: 'game',
      title: 'KI-NEXUS: WELLNESS LEAGUE',
      image: 'assets/kinexus/services/game.png',
      brief: 'Este es nuestro plan de bienestar organizacional que optimiza el ecosistema laboral generando impacto en áreas o sucursales.',
      description: 'Nuestro plan KI-NEXUS WELLNESS LEAGUE consta de una serie de intervenciones con un enfoque lúdico dirigidas por kinesiólogos especialistas en neurorehabilitación.',
      fullInfo: 'Implementamos nuestra metodología exclusiva de intervención híbrida diseñada para equipos que exigen el máximo rendimiento con la mínima interrupción operativa.',
      features: [
        'Optimizar la comunicación interdisciplinaria',
        'Impulsar mejores hábitos en tu organización',
        'Mejorar la experiencia de trabajo',
        'Obtener KPI sobre la salud y productividad de tu empresa'
      ]
    }
  ];

  getHeroVideos() { return [...this.heroVideos]; }
  getGalleryImages() { return [...this.galleryImages]; }
  getServices() { return [...this.services]; }
  getWhatsAppConfig() {
    return { number: this.whatsAppNumber, message: this.whatsAppMessage };
  }
}
