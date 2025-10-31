import { AfterViewInit, Component, HostListener, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-presentation',
  templateUrl: './presentation.component.html',
  styleUrls: ['./presentation.component.scss']
})
export class PresentationComponent implements OnInit, AfterViewInit, OnDestroy {
  currentYear = new Date().getFullYear();
  menuOpen = false;

  // WhatsApp configuration (replace number as needed)
  whatsAppNumber = '56912345678';
  whatsAppMessage = 'Hola, me gustaría agendar una evaluación inicial con Kinexus.';

  constructor() {}

  ngOnInit(): void {}

  // Hero carousel state
  heroImages: string[] = [
    'assets/kinexus/hero/hero-1.webp',
    'assets/kinexus/hero/hero-2.webp',
    'assets/kinexus/hero/hero-3.webp'
  ];
  // Service images
  serviceImgEmpresas = 'assets/kinexus/services/empresas.webp';
  serviceImgPersonas = 'assets/kinexus/services/personas.webp';

  // Gallery images (6 suggested)
  galleryImages: string[] = [
    'assets/kinexus/gallery/gal-1.webp',
    'assets/kinexus/gallery/gal-2.webp',
    'assets/kinexus/gallery/gal-3.webp',
    'assets/kinexus/gallery/gal-4.webp',
    'assets/kinexus/gallery/gal-5.webp',
    'assets/kinexus/gallery/gal-6.webp',
  ];
  currentHero = 0;
  private slideTimer: any;

  ngAfterViewInit(): void {
    // Start auto-rotation if we have more than one image
    if (this.heroImages.length > 1) {
      this.slideTimer = setInterval(() => {
        this.nextSlide();
      }, 6000);
    }
  }

  ngOnDestroy(): void {
    if (this.slideTimer) clearInterval(this.slideTimer);
  }

  get whatsAppUrl(): string {
    return `https://wa.me/${this.whatsAppNumber}?text=${encodeURIComponent(this.whatsAppMessage)}`;
  }

  scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }

  @HostListener('document:keydown.escape', ['$event'])
  onEsc(_e: KeyboardEvent) {
    this.closeMenu();
  }

  private nextSlide() {
    this.currentHero = (this.currentHero + 1) % this.heroImages.length;
  }

  goToSlide(i: number) {
    this.currentHero = i % this.heroImages.length;
    // Optional: reset timer to give user a full interval after manual change
    if (this.slideTimer) {
      clearInterval(this.slideTimer);
      this.slideTimer = setInterval(() => this.nextSlide(), 6000);
    }
  }

}
