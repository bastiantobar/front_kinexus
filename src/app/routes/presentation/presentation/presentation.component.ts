import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewChildren, QueryList, NgZone } from '@angular/core';
import { ThemeService } from '../../../core/service/theme.service';
import { PresentationContentService, KinexusService } from '../../../core/service/presentation-content.service';
import { ContactService } from '../../../core/service/contact.service';

declare var intlTelInput: any;

@Component({
  selector: 'app-presentation',
  templateUrl: './presentation.component.html',
  styleUrls: ['./presentation.component.scss']
})
export class PresentationComponent implements OnInit, AfterViewInit, OnDestroy {
  currentYear = new Date().getFullYear();
  iti: any;

  // Data from Service
  heroVideos: string[] = [];
  galleryImages: { src: string; cls: string }[] = [];
  services: KinexusService[] = [];
  whatsAppConfig: { number: string; message: string } = { number: '', message: '' };

  infiniteGalleryImages: any[] = [];
  currentHero = 0;
  isMenuOpen = false;
  selectedService: KinexusService | null = null;
  contactActive = false;
  contactStatus: { state: 'idle' | 'pending' | 'success' | 'error'; message?: string } = { state: 'idle' };

  // Gallery Drag/Scroll state
  isDraggingGallery = false;
  startXGallery = 0;
  scrollLeftGallery = 0;
  isHovered = false;
  private autoScrollId: number | null = null;

  @ViewChild('contactoRef') contactSection!: ElementRef;
  @ViewChild('galleryScroll') galleryScroll!: ElementRef;
  @ViewChildren('heroVideo') heroVideoElements!: QueryList<ElementRef<HTMLVideoElement>>;

  constructor(
    private themeService: ThemeService,
    private contentService: PresentationContentService,
    private contactService: ContactService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.heroVideos = this.contentService.getHeroVideos();
    this.galleryImages = this.contentService.getGalleryImages();
    this.services = this.contentService.getServices();
    this.whatsAppConfig = this.contentService.getWhatsAppConfig();

    // Infinite loop gallery initialization
    for (let i = 0; i < 8; i++) {
      this.infiniteGalleryImages.push(...this.galleryImages);
    }
  }

  get whatsAppUrl(): string {
    const { number, message } = this.whatsAppConfig;
    return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.playCurrentVideo(), 100);

    setTimeout(() => {
      if (this.galleryScroll) {
        const el = this.galleryScroll.nativeElement;
        el.scrollLeft = el.scrollWidth / 2;
        this.startAutoScroll();
      }
    }, 600);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.contactActive) {
          this.contactActive = true;
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    if (this.contactSection) {
      observer.observe(this.contactSection.nativeElement);
    }

    // Initialize phone input
    setTimeout(() => {
      const phoneInput = document.querySelector("#phone_input");
      if (phoneInput && typeof intlTelInput !== 'undefined') {
        this.iti = intlTelInput(phoneInput, {
          initialCountry: "cl",
          separateDialCode: true,
          utilsScript: "node_modules/intl-tel-input/build/js/utils.js"
        });
      }
    }, 100);
  }

  ngOnDestroy(): void {
    this.stopAutoScroll();
  }

  scrollTo(id: string) {
    this.closeMenu();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  toggleTheme() { this.themeService.toggle(); }
  isDarkTheme(): boolean { return this.themeService.isDark(); }
  toggleMenu() { this.isMenuOpen = !this.isMenuOpen; }
  closeMenu() { this.isMenuOpen = false; }

  openServiceDetails(service: KinexusService) {
    this.selectedService = service;
    document.body.style.overflow = 'hidden';
  }

  closeServiceDetails() {
    this.selectedService = null;
    document.body.style.overflow = '';
  }

  cotizarService(serviceTitle: string) {
    this.closeServiceDetails();
    this.scrollTo('cotizacion');
    setTimeout(() => {
      const select = document.querySelector('select[name="service"]') as HTMLSelectElement;
      if (select) select.value = serviceTitle;
    }, 500);
  }

  submitContact(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    if (!form) return;
    const fd = new FormData(form);
    
    if (this.iti) {
      const fullNumber = this.iti.getNumber();
      if (fullNumber) fd.set('phone', fullNumber);
    }

    this.contactStatus = { state: 'pending', message: 'Enviando...' };

    this.contactService.sendContact(fd).subscribe({
      next: (res) => {
        if (res && res.success) {
          this.contactStatus = { state: 'success', message: res.message || 'Gracias — tu consulta ha sido enviada.' };
          form.reset();
        } else {
          this.contactStatus = { state: 'error', message: res.message || 'Error al enviar la consulta.' };
        }
      },
      error: (err) => {
        console.error('Error enviando contacto', err);
        this.contactStatus = { state: 'error', message: 'No se pudo enviar la consulta. Intenta nuevamente.' };
      }
    });
  }

  handleImageError(event: any) {
    event.target.src = 'https://ui-avatars.com/api/?name=Kinexus&background=648C34&color=fff';
  }

  // Gallery Helpers
  private playCurrentVideo() {
    if (this.heroVideoElements) {
      const videos = this.heroVideoElements.toArray();
      videos.forEach((vidRef, index) => {
        const vid = vidRef.nativeElement;
        if (index === this.currentHero) {
          vid.currentTime = 0;
          vid.play().catch(e => console.warn('Autoplay blocked:', e));
        } else { vid.pause(); }
      });
    }
  }

  private nextSlide() {
    this.currentHero = (this.currentHero + 1) % this.heroVideos.length;
    this.playCurrentVideo();
  }

  goToSlide(i: number) { this.currentHero = i % this.heroVideos.length; this.playCurrentVideo(); }
  onVideoEnded(index: number) { if (index === this.currentHero) this.nextSlide(); }

  startAutoScroll() {
    this.stopAutoScroll();
    this.ngZone.runOutsideAngular(() => {
      const scroll = () => {
        if (!this.isDraggingGallery && !this.isHovered && this.galleryScroll) {
          this.galleryScroll.nativeElement.scrollLeft += 0.6;
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
    if (this.galleryScroll) this.galleryScroll.nativeElement.classList.remove('active');
  }

  onMouseUpGallery() {
    this.isDraggingGallery = false;
    if (this.galleryScroll) this.galleryScroll.nativeElement.classList.remove('active');
  }

  onMouseMoveGallery(e: MouseEvent) {
    if (!this.isDraggingGallery) return;
    e.preventDefault();
    if (this.galleryScroll) {
      const el = this.galleryScroll.nativeElement;
      const x = e.pageX - el.offsetLeft;
      const walk = (x - this.startXGallery) * 1.5;
      el.scrollLeft = this.scrollLeftGallery - walk;
    }
  }

  onGalleryScroll() {
    if (!this.galleryScroll) return;
    const el = this.galleryScroll.nativeElement;
    const blockWidth = el.scrollWidth / 20;
    if (el.scrollLeft < blockWidth) el.scrollLeft += blockWidth * 10;
    else if (el.scrollLeft > el.scrollWidth - blockWidth * 2) el.scrollLeft -= blockWidth * 10;
  }
}
