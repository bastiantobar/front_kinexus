import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewChildren, QueryList, NgZone } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ThemeService } from '../../../core/service/theme.service';
import { PresentationContentService, KinexusService } from '../../../core/service/presentation-content.service';
import { ContactService } from '../../../core/service/contact.service';
import { HttpClient } from '@angular/common/http';

declare var intlTelInput: any;

@Component({
  selector: 'app-presentation',
  templateUrl: './presentation.component.html',
  styleUrls: ['./presentation.component.scss']
})
export class PresentationComponent implements OnInit, AfterViewInit, OnDestroy {
  currentYear = new Date().getFullYear();
  iti: any;

  // Form toggle and booking state
  selectedForm: 'email' | 'presencial' | null = null;
  reservationAddress: string = '';
  calendarDate = new Date();
  selectedReservationDate: Date | null = null;
  calendarDays: any[] = [];
  minDate = new Date();
  maxDate = new Date(new Date().getFullYear(), new Date().getMonth() + 12, 0);

  // Data from Service
  heroVideos: string[] = [];
  galleryImages: { src: string; cls: string }[] = [];
  services: KinexusService[] = [];
  whatsAppConfig: { number: string; message: string } = { number: '', message: '' };
  availabilityData: any = {};
  selectedDateSlots: string[] = [];

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

  // Drag state for Services
  isDraggingServices = false;
  startXServices = 0;
  scrollLeftServices = 0;

  // Modal Image Index
  currentModalImage = 0;

  @ViewChild('contactoRef') contactSection!: ElementRef;
  @ViewChild('galleryScroll') galleryScroll!: ElementRef;
  @ViewChild('servicesScroll') servicesScroll!: ElementRef;
  @ViewChildren('heroVideo') heroVideoElements!: QueryList<ElementRef<HTMLVideoElement>>;

  constructor(
    private themeService: ThemeService,
    private contentService: PresentationContentService,
    private contactService: ContactService,
    private ngZone: NgZone,
    private sanitizer: DomSanitizer,
    private http: HttpClient
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

    // Load dynamic availability data
    this.http.get('availability.php').subscribe({
      next: (data: any) => {
        this.availabilityData = data || {};
        this.generateCalendar();
      },
      error: (err) => {
        console.warn('Error loading from availability.php, falling back to assets:', err);
        this.http.get('assets/availability.json').subscribe({
          next: (data: any) => {
            this.availabilityData = data || {};
            this.generateCalendar();
          }
        });
      }
    });
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
    if (id === 'cotizacion' && !this.selectedForm) {
      this.selectedForm = 'email';
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  scrollToReservation() {
    this.selectedForm = 'presencial';
    this.generateCalendar();
    this.closeMenu();
    const el = document.getElementById('cotizacion');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  toggleTheme() { this.themeService.toggle(); }
  isDarkTheme(): boolean { return this.themeService.isDark(); }
  toggleMenu() { this.isMenuOpen = !this.isMenuOpen; }
  closeMenu() { this.isMenuOpen = false; }

  openServiceDetails(service: KinexusService) {
    this.selectedService = service;
    this.currentModalImage = 0;
    document.body.style.overflow = 'hidden';
  }

  closeServiceDetails() {
    this.selectedService = null;
    document.body.style.overflow = '';
  }

  nextModalImage() {
    if (this.selectedService?.images) {
      this.currentModalImage = (this.currentModalImage + 1) % this.selectedService.images.length;
    }
  }

  prevModalImage() {
    if (this.selectedService?.images) {
      this.currentModalImage = (this.currentModalImage - 1 + this.selectedService.images.length) % this.selectedService.images.length;
    }
  }

  cotizarService(serviceTitle: string) {
    this.selectedForm = 'email';
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

  // Services Drag Helpers
  onMouseDownServices(e: MouseEvent) {
    this.isDraggingServices = true;
    if (this.servicesScroll) {
      const el = this.servicesScroll.nativeElement;
      el.classList.add('active');
      this.startXServices = e.pageX - el.offsetLeft;
      this.scrollLeftServices = el.scrollLeft;
    }
  }

  onMouseLeaveServices() {
    this.isDraggingServices = false;
    if (this.servicesScroll) this.servicesScroll.nativeElement.classList.remove('active');
  }

  onMouseUpServices() {
    this.isDraggingServices = false;
    if (this.servicesScroll) this.servicesScroll.nativeElement.classList.remove('active');
  }

  onMouseMoveServices(e: MouseEvent) {
    if (!this.isDraggingServices) return;
    e.preventDefault();
    if (this.servicesScroll) {
      const el = this.servicesScroll.nativeElement;
      const x = e.pageX - el.offsetLeft;
      const walk = (x - this.startXServices) * 1.5;
      el.scrollLeft = this.scrollLeftServices - walk;
    }
  }

  // Horizontal scroll with mousewheel
  onWheelScroll(e: WheelEvent, type: 'gallery' | 'services') {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      const el = type === 'gallery' ? this.galleryScroll?.nativeElement : this.servicesScroll?.nativeElement;
      if (el) {
        el.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    }
  }

  selectForm(type: 'email' | 'presencial') {
    this.selectedForm = type;
    if (type === 'presencial') {
      this.generateCalendar();
    }
  }

  getMapUrl(): SafeResourceUrl {
    const baseUrl = 'https://maps.google.com/maps?q=';
    const addressEscaped = encodeURIComponent(this.reservationAddress);
    const suffix = '&t=&z=15&ie=UTF8&iwloc=&output=embed';
    return this.sanitizer.bypassSecurityTrustResourceUrl(baseUrl + addressEscaped + suffix);
  }

  formatDateKey(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  generateCalendar() {
    const year = this.calendarDate.getFullYear();
    const month = this.calendarDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday...
    let adjustedFirstDay = firstDayIndex - 1;
    if (adjustedFirstDay < 0) adjustedFirstDay = 6; // Make Monday the first day (0 = Monday, 6 = Sunday)

    const totalDays = new Date(year, month + 1, 0).getDate();

    const days: any[] = [];

    // Empty spaces for padding at the start of the week
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push({ date: null, dayNum: '', isSelectable: false });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month, d);
      date.setHours(0, 0, 0, 0);

      const dateKey = this.formatDateKey(date);
      const slots = this.availabilityData[dateKey] || [];
      const hasSlots = slots.length > 0;

      // Selectable only if it has configured available time slots
      const isSelectable = date >= today && date <= this.maxDate && hasSlots;
      const isToday = date.getTime() === today.getTime();
      const isSelected = this.selectedReservationDate ? date.getTime() === this.selectedReservationDate.getTime() : false;

      days.push({
        date,
        dayNum: d,
        isSelectable,
        isToday,
        isSelected
      });
    }

    this.calendarDays = days;
  }

  prevCalendarMonth() {
    const currentMonth = new Date(this.calendarDate.getFullYear(), this.calendarDate.getMonth(), 1);
    const minMonth = new Date(this.minDate.getFullYear(), this.minDate.getMonth(), 1);
    if (currentMonth > minMonth) {
      this.calendarDate = new Date(this.calendarDate.getFullYear(), this.calendarDate.getMonth() - 1, 1);
      this.generateCalendar();
    }
  }

  nextCalendarMonth() {
    const currentMonth = new Date(this.calendarDate.getFullYear(), this.calendarDate.getMonth(), 1);
    const maxMonth = new Date(this.maxDate.getFullYear(), this.maxDate.getMonth(), 1);
    if (currentMonth < maxMonth) {
      this.calendarDate = new Date(this.calendarDate.getFullYear(), this.calendarDate.getMonth() + 1, 1);
      this.generateCalendar();
    }
  }

  isPrevMonthDisabled(): boolean {
    const currentMonth = new Date(this.calendarDate.getFullYear(), this.calendarDate.getMonth(), 1);
    const minMonth = new Date(this.minDate.getFullYear(), this.minDate.getMonth(), 1);
    return currentMonth <= minMonth;
  }

  isNextMonthDisabled(): boolean {
    const currentMonth = new Date(this.calendarDate.getFullYear(), this.calendarDate.getMonth(), 1);
    const maxMonth = new Date(this.maxDate.getFullYear(), this.maxDate.getMonth(), 1);
    return currentMonth >= maxMonth;
  }

  selectCalendarDate(day: any) {
    if (day.isSelectable && day.date) {
      this.selectedReservationDate = day.date;
      const dateKey = this.formatDateKey(day.date);
      this.selectedDateSlots = this.availabilityData[dateKey] || [];
      
      // Reset the time selection box when a new date is selected
      setTimeout(() => {
        const timeSelect = document.querySelector('select[name="time"]') as HTMLSelectElement;
        if (timeSelect) {
          timeSelect.value = '';
        }
      }, 50);

      this.generateCalendar();
    }
  }

  get calendarMonthName(): string {
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${monthNames[this.calendarDate.getMonth()]} ${this.calendarDate.getFullYear()}`;
  }
}
