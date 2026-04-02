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
    { src: 'assets/kinexus/gallery/gal-1.webp', cls: '' },
    { src: 'assets/kinexus/gallery/gal-2.webp', cls: 'slower' },
    { src: 'assets/kinexus/services/vitality-1.png', cls: 'faster' }, // New Vitality image
    { src: 'assets/kinexus/gallery/gal-3.webp', cls: 'faster' },
    { src: 'assets/kinexus/gallery/gal-4.webp', cls: 'slower slower-down' },
    { src: 'assets/kinexus/services/vitality-2.png', cls: 'slower' }, // New Vitality image
    { src: 'assets/kinexus/gallery/gal-5.webp', cls: 'slower' },
    { src: 'assets/kinexus/gallery/gal-6.webp', cls: 'last' },
  ];

  private services: KinexusService[] = [
    {
      id: 'vitality',
      title: 'KI-NEXUS VITALITY',
      image: 'assets/kinexus/services/vitality-2.png', // Using the worker one which is more characteristic
      images: [
        'assets/kinexus/services/vitality-1.png',
        'assets/kinexus/services/vitality-2.png'
      ],
      brief: 'Transforma la fatiga acumulada en energía disponible con nuestro ciclo intensivo. Enfoque clínico | Mediciones reales | Bajo roce, alto impacto',
      description: 'Es nuestra intervención intensiva de 5-8 semanas diseñada para equipos que buscan un cambio real en su dinámica diaria. No se trata solo de pausas activas; es un programa de entrenamiento funcional y neuro-reajuste aplicado al puesto de trabajo, liderado por un especialista en kinesiología.',
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
      title: 'CBE (CHECK-OUT BIOMECÁNICO EXPRESS)',
      image: 'assets/kinexus/services/cbe.png',
      brief: 'Evaluación biomecánica individual en el puesto real para detectar riesgos ergonómicos al instante.',
      description: 'Asesoría ideal para eventos de bienestar, ferias de salud interna o eventos de captación. Es una jornada de evaluaciones individuales en donde el especialista realiza un recorrido de visitas de 10 a 15 minutos por colaborador para obtener un mapa de calor sobre la salud de tu equipo y activa soluciones de bienestar personalizadas.',
      fullInfo: 'Ideal para obtener un mapa de calor sobre la salud de tu equipo y activa soluciones de bienestar personalizadas.',
      whyChoose: [
        'Sesión de poco tiempo de interrupción de la jornada laboral',
        'Genera impacto inmediato en la experiencia del trabajador',
        'Disminuye los riesgos de lesiones'
      ]
    },
    {
      id: 'focus',
      title: 'Focus time',
      image: 'assets/kinexus/services/focus.png',
      brief: 'Optimiza el rendimiento cognitivo de tu equipo mediante técnicas de neuro-activación que eliminan la fatiga mental.',
      description: 'Vive una sesión de alto impacto para resetear el enfoque, ideal para equipos de tecnología, creativos, grupos de alta demanda laboral observando pantallas o gerencias con alta carga de estrés.',
      fullInfo: 'Un taller teórico-práctico de una sola sesión de alto impacto (2 horas).',
      content: [
        'Ciencia del estrés',
        'Técnicas de neuro-activación',
        'Higiene de columna y visión para trabajadores digitales'
      ]
    },
    {
      id: 'game',
      title: 'KI-NEXUS GAME: Wellness league',
      image: 'assets/kinexus/services/game.png',
      brief: 'Implementamos nuestra fórmula de ludificación para optimizar el ecosistema laboral generando impacto en áreas o sucursales.',
      description: 'Implementamos un reto en tu empresa que tendrá una duración de 30 días y tendrá como objetivo optimizar el clima laboral, disminuir el sedentarismo y mejorar los niveles de energía.',
      fullInfo: 'Implementamos nuestra metodología exclusiva de intervención híbrida diseñada para equipos que exigen el máximo rendimiento con la mínima interrupción operativa a través de un ecosistema de bienestar gamificado y un enfoque kinésico de vanguardia, convertimos la salud en un tablero de juego donde la ciencia del movimiento y la motivación se encuentran.',
      stats: 'Obtén métricas precisas sobre el estado de salud y la productividad de tu organización.'
    }
  ];

  getHeroVideos() { return [...this.heroVideos]; }
  getGalleryImages() { return [...this.galleryImages]; }
  getServices() { return [...this.services]; }
  getWhatsAppConfig() {
    return { number: this.whatsAppNumber, message: this.whatsAppMessage };
  }
}
