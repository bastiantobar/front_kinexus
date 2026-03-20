import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ThemeService } from '../../../core/service/theme.service';

@Component({
  selector: 'app-presentation',
  templateUrl: './presentation.component.html',
  styleUrls: ['./presentation.component.scss']
})
export class PresentationComponent implements OnInit, AfterViewInit, OnDestroy {
  currentYear = new Date().getFullYear();
  // WhatsApp configuration (replace number as needed)
  whatsAppNumber = '56963691898';
  whatsAppMessage = 'Hola, me gustaría agendar una evaluación inicial con Kinexus.';

  constructor(private themeService: ThemeService) {}


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

  // Gallery images — cada una con su clase de velocidad parallax
  galleryImages = [
    { src: 'assets/kinexus/gallery/gal-1.webp', cls: '' },
    { src: 'assets/kinexus/gallery/gal-2.webp', cls: 'slower' },
    { src: 'assets/kinexus/gallery/gal-3.webp', cls: 'faster' },
    { src: 'assets/kinexus/gallery/gal-4.webp', cls: 'slower slower-down' },
    { src: 'assets/kinexus/gallery/gal-5.webp', cls: 'slower' },
    { src: 'assets/kinexus/gallery/gal-6.webp', cls: 'last' },
  ];
  currentHero = 0;
  private slideTimer: any;

  @ViewChild('contactoRef') contactSection!: ElementRef;

  ngAfterViewInit(): void {
    // Start auto-rotation if we have more than one image
    if (this.heroImages.length > 1) {
      this.slideTimer = setInterval(() => {
        this.nextSlide();
      }, 6000);
    }

    // Scroll-triggered contact card animation
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.contactActive) {
          this.contactActive = true;
          // After activating, we can stop observing if we only want it to trigger once
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1 // Trigger when 10% of the section is visible
    });

    if (this.contactSection) {
      observer.observe(this.contactSection.nativeElement);
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

  // side-menu removed for presentation-only page; no menu state required

  private nextSlide() {
    this.currentHero = (this.currentHero + 1) % this.heroImages.length;
  }

  goToSlide(i: number) {
    this.currentHero = i % this.heroImages.length;
    if (this.slideTimer) {
      clearInterval(this.slideTimer);
      this.slideTimer = setInterval(() => this.nextSlide(), 6000);
    }
  }

  toggleTheme() {
    this.themeService.toggle();
  }

  isDarkTheme(): boolean {
    return this.themeService.isDark();
  }

  // UI status for contact card animation
  contactActive = false;

  // UI status for contact submissions
  contactStatus: { state: 'idle' | 'pending' | 'success' | 'error'; message?: string } = { state: 'idle' };

  triggerContactAnimation() {
    this.contactActive = true;
    this.scrollTo('contacto');
  }

  handleImageError(event: any) {
    event.target.src = 'https://ui-avatars.com/api/?name=Kinexus&background=648C34&color=fff';
  }

  // Simple contact form handler: prevents default, logs the values and resets the form.
  submitContact(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    if (!form) return;
    const fd = new FormData(form);
    const payload: any = {};
    fd.forEach((v, k) => (payload[k] = v));
    // For now, just log the submission. Replace with API call as needed.
    // eslint-disable-next-line no-console
    // Show pending state
    this.contactStatus = { state: 'pending', message: 'Enviando...' };

    // Post to server-side script (deploy contact.php to your hosting root)
    fetch('/contact.php', {
      method: 'POST',
      body: fd,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Network response not ok');
        const json = await res.json();
        if (json && json.success) {
          this.contactStatus = { state: 'success', message: json.message || 'Gracias — tu consulta ha sido enviada.' };
          form.reset();
        } else {
          throw new Error((json && json.message) || 'Error al enviar');
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Error enviando contacto', err);
        this.contactStatus = { state: 'error', message: 'No se pudo enviar la consulta. Intenta nuevamente.' };
      });
  }

}
