import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewChildren, QueryList, NgZone } from '@angular/core';
import { ThemeService } from '../../../core/service/theme.service';

declare var intlTelInput: any;

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

  constructor(private themeService: ThemeService, private ngZone: NgZone) {}

  iti: any;


  infiniteGalleryImages: any[] = [];

  ngOnInit(): void {
    // Create 8 copies of the gallery for an infinite loop effect (reduced from 20)
    for (let i = 0; i < 8; i++) {
        this.infiniteGalleryImages.push(...this.galleryImages);
    }
  }

  // Hero carousel state
  heroVideos: string[] = [
    'assets/kinexus/hero/video1_muted.mp4',
    'assets/kinexus/hero/video2_muted.mp4',
    'assets/kinexus/hero/video3_muted.mp4'
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

  @ViewChild('contactoRef') contactSection!: ElementRef;
  @ViewChild('galleryScroll') galleryScroll!: ElementRef;
  @ViewChildren('heroVideo') heroVideoElements!: QueryList<ElementRef<HTMLVideoElement>>;

  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  // Drag gallery state
  isDraggingGallery = false;
  startXGallery = 0;
  scrollLeftGallery = 0;
  isHovered = false;
  private autoScrollId: number | null = null;

  ngAfterViewInit(): void {
    // Start auto-rotation by playing the first video
    setTimeout(() => {
      this.playCurrentVideo();
    }, 100);

    // Set initial scroll to the middle of the infinite gallery
    setTimeout(() => {
      if (this.galleryScroll) {
        const el = this.galleryScroll.nativeElement;
        el.scrollLeft = el.scrollWidth / 2;
        this.startAutoScroll();
      }
    }, 600);

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

    // Initialize intl-tel-input
    setTimeout(() => {
      const phoneInput = document.querySelector("#phone_input");
      if (phoneInput && typeof intlTelInput !== 'undefined') {
        this.iti = intlTelInput(phoneInput, {
          initialCountry: "cl",
          separateDialCode: true,
          utilsScript: "node_modules/intl-tel-input/build/js/utils.js" // ensures formatting/validation works
        });
      }
    }, 100);
  }

  ngOnDestroy(): void {
    this.stopAutoScroll();
  }

  startAutoScroll() {
    this.stopAutoScroll();
    this.ngZone.runOutsideAngular(() => {
      const scroll = () => {
        if (!this.isDraggingGallery && !this.isHovered && this.galleryScroll) {
          this.galleryScroll.nativeElement.scrollLeft += 0.6; // Smaller increment for sub-pixel smoothness
        }
        this.autoScrollId = requestAnimationFrame(scroll);
      };
      this.autoScrollId = requestAnimationFrame(scroll);
    });
  }

  stopAutoScroll() {
    if (this.autoScrollId !== null) {
      cancelAnimationFrame(this.autoScrollId);
      this.autoScrollId = null;
    }
  }

  get whatsAppUrl(): string {
    return `https://wa.me/${this.whatsAppNumber}?text=${encodeURIComponent(this.whatsAppMessage)}`;
  }

  scrollTo(id: string) {
    this.closeMenu();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // side-menu removed for presentation-only page; no menu state required

  private nextSlide() {
    this.currentHero = (this.currentHero + 1) % this.heroVideos.length;
    this.playCurrentVideo();
  }

  goToSlide(i: number) {
    this.currentHero = i % this.heroVideos.length;
    this.playCurrentVideo();
  }

  onVideoEnded(index: number) {
    if (index === this.currentHero) {
      this.nextSlide();
    }
  }

  playCurrentVideo() {
    if (this.heroVideoElements) {
      const videos = this.heroVideoElements.toArray();
      videos.forEach((vidRef, index) => {
        const vid = vidRef.nativeElement;
        if (index === this.currentHero) {
          vid.currentTime = 0;
          vid.play().catch(e => console.warn('Autoplay blocked:', e));
        } else {
          vid.pause();
        }
      });
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

  // Gallery Drag Handlers
  onMouseDownGallery(e: MouseEvent) {
    this.isDraggingGallery = true;
    if (this.galleryScroll) {
      const el = this.galleryScroll.nativeElement;
      el.classList.add('active');
      this.startXGallery = e.pageX - el.offsetLeft;
      this.scrollLeftGallery = el.scrollLeft;
    }
  }

  onMouseLeaveGallery() {
    this.isDraggingGallery = false;
    this.isHovered = false;
    if (this.galleryScroll) {
      this.galleryScroll.nativeElement.classList.remove('active');
    }
  }

  onMouseUpGallery() {
    this.isDraggingGallery = false;
    if (this.galleryScroll) {
      this.galleryScroll.nativeElement.classList.remove('active');
    }
  }

  onMouseMoveGallery(e: MouseEvent) {
    if (!this.isDraggingGallery) return;
    e.preventDefault();
    if (this.galleryScroll) {
      const el = this.galleryScroll.nativeElement;
      const x = e.pageX - el.offsetLeft;
      const walk = (x - this.startXGallery) * 1.5; // Drag speed multiplier
      el.scrollLeft = this.scrollLeftGallery - walk;
    }
  }

  onGalleryScroll() {
    if (!this.galleryScroll) return;
    const el = this.galleryScroll.nativeElement;
    
    const blockWidth = el.scrollWidth / 20;
    
    // Infinite loop logic: jump backwards or forwards seamlessly when reaching borders
    if (el.scrollLeft < blockWidth) {
      el.scrollLeft += blockWidth * 10;
    } else if (el.scrollLeft > el.scrollWidth - blockWidth * 2) {
      el.scrollLeft -= blockWidth * 10;
    }
  }

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
    
    if (this.iti) {
      const fullNumber = this.iti.getNumber();
      if (fullNumber) {
        fd.set('phone', fullNumber);
        payload['phone'] = fullNumber;
      }
    }
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
