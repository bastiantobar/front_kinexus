import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { ContactService } from '../../../core/service/contact.service';
import { KinexusService, PresentationContentService } from '../../../core/service/presentation-content.service';

declare var intlTelInput: any;

// Migrado desde la antigua landing (routes/presentation). Mismos endpoints:
// contact.php, availability.php (+ assets/availability.json) y /book-reservation.php.
@Component({
  selector: 'app-contacto',
  templateUrl: './contacto.component.html',
})
export class ContactoComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('phoneInput') phoneInput?: ElementRef<HTMLInputElement>;
  iti: any;

  regiones = [
    ['Arica y Parinacota', 'Arica y Parinacota'], ['Tarapacá', 'Tarapacá'], ['Antofagasta', 'Antofagasta'],
    ['Atacama', 'Atacama'], ['Coquimbo', 'Coquimbo'], ['Valparaíso', 'Valparaíso'],
    ['Metropolitana', 'Metropolitana de Santiago'], ["O'Higgins", "Libertador General Bernardo O'Higgins"],
    ['Maule', 'Maule'], ['Ñuble', 'Ñuble'], ['Biobío', 'Biobío'], ['La Araucanía', 'La Araucanía'],
    ['Los Ríos', 'Los Ríos'], ['Los Lagos', 'Los Lagos'], ['Aysén', 'Aysén del Gral. Carlos Ibáñez del Campo'],
    ['Magallanes', 'Magallanes y de la Antártica Chilena'],
  ];

  services: KinexusService[] = this.content.getServices();
  servicioElegido = '';
  selectedForm: 'email' | 'presencial' = 'email';
  whatsAppUrl = this.content.getWhatsAppUrl();
  whatsAppNumber = this.content.getWhatsAppConfig().number;
  contactStatus: { state: 'idle' | 'pending' | 'success' | 'error'; message?: string } = { state: 'idle' };

  // Reserva
  reservationAddress = '';
  calendarDate = new Date();
  selectedReservationDate: Date | null = null;
  calendarDays: any[] = [];
  minDate = new Date();
  maxDate = new Date(new Date().getFullYear(), new Date().getMonth() + 12, 0);
  reservationStatus: { state: 'idle' | 'pending' | 'success' | 'error'; message?: string } = { state: 'idle' };
  showReservationModal = false;
  availabilityData: any = {};
  selectedDateSlots: string[] = [];

  private sub?: Subscription;

  constructor(
    private content: PresentationContentService,
    private contactService: ContactService,
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    // ?form=diagnostico o un servicio para personas abren la reserva a domicilio;
    // ?servicio=<slug> de empresas abre la cotización con ese servicio.
    this.sub = this.route.queryParamMap.subscribe(q => {
      const s = this.content.getService(q.get('servicio') || '');
      const personas = q.get('form') === 'diagnostico' || (!!s && s.audiencia === 'personas');
      this.selectedForm = personas ? 'presencial' : 'email';
      this.servicioElegido = s && s.audiencia === 'empresas' ? s.title : '';
    });

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
    this.generateCalendar();
  }

  ngAfterViewInit(): void {
    if (this.phoneInput && typeof intlTelInput !== 'undefined') {
      this.iti = intlTelInput(this.phoneInput.nativeElement, { initialCountry: 'cl', separateDialCode: true });
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.iti?.destroy();
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
          this.servicioElegido = '';
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

  getMapUrl(): SafeResourceUrl {
    const url = 'https://maps.google.com/maps?q=' + encodeURIComponent(this.reservationAddress) + '&t=&z=15&ie=UTF8&iwloc=&output=embed';
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
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

    let adjustedFirstDay = new Date(year, month, 1).getDay() - 1;
    if (adjustedFirstDay < 0) adjustedFirstDay = 6; // Lunes primero

    const totalDays = new Date(year, month + 1, 0).getDate();
    const days: any[] = [];
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push({ date: null, dayNum: '', isSelectable: false });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month, d);
      const slots = this.availabilityData[this.formatDateKey(date)] || [];
      days.push({
        date,
        dayNum: d,
        // Seleccionable solo si tiene horas configuradas
        isSelectable: date >= today && date <= this.maxDate && slots.length > 0,
        isToday: date.getTime() === today.getTime(),
        isSelected: this.selectedReservationDate ? date.getTime() === this.selectedReservationDate.getTime() : false,
      });
    }
    this.calendarDays = days;
  }

  private monthStart(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }

  isPrevMonthDisabled(): boolean { return this.monthStart(this.calendarDate) <= this.monthStart(this.minDate); }
  isNextMonthDisabled(): boolean { return this.monthStart(this.calendarDate) >= this.monthStart(this.maxDate); }

  prevCalendarMonth() {
    if (this.isPrevMonthDisabled()) return;
    this.calendarDate = new Date(this.calendarDate.getFullYear(), this.calendarDate.getMonth() - 1, 1);
    this.generateCalendar();
  }

  nextCalendarMonth() {
    if (this.isNextMonthDisabled()) return;
    this.calendarDate = new Date(this.calendarDate.getFullYear(), this.calendarDate.getMonth() + 1, 1);
    this.generateCalendar();
  }

  selectedTime = '';

  selectCalendarDate(day: any) {
    if (!day.isSelectable || !day.date) return;
    this.selectedReservationDate = day.date;
    this.selectedDateSlots = this.availabilityData[this.formatDateKey(day.date)] || [];
    this.selectedTime = '';
    this.generateCalendar();
  }

  get calendarMonthName(): string {
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${monthNames[this.calendarDate.getMonth()]} ${this.calendarDate.getFullYear()}`;
  }

  closeReservationModal() {
    this.showReservationModal = false;
    this.reservationStatus = { state: 'idle' };
  }

  submitReservation(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    if (!form) return;

    if (!this.selectedReservationDate) {
      this.reservationStatus = { state: 'error', message: 'Por favor selecciona una fecha en el calendario.' };
      return;
    }
    if (!this.selectedTime) {
      this.reservationStatus = { state: 'error', message: 'Por favor selecciona una hora disponible.' };
      return;
    }

    const fd = new FormData(form);
    fd.set('date', this.formatDateKey(this.selectedReservationDate));
    fd.set('time', this.selectedTime);

    this.reservationStatus = { state: 'pending', message: 'Enviando reserva...' };
    const dateKey = this.formatDateKey(this.selectedReservationDate);
    const selectedTime = this.selectedTime;

    this.http.post<any>('/book-reservation.php', fd).subscribe({
      next: (res) => {
        if (res && res.success) {
          if (this.availabilityData[dateKey]) {
            this.availabilityData[dateKey] = this.availabilityData[dateKey].filter((s: string) => s !== selectedTime);
            if (this.availabilityData[dateKey].length === 0) delete this.availabilityData[dateKey];
          }
          this.reservationStatus = { state: 'success', message: res.message || 'Tu reserva fue confirmada. Revisa tu correo.' };
          this.showReservationModal = true;
          form.reset();
          this.selectedReservationDate = null;
          this.selectedDateSlots = [];
          this.selectedTime = '';
          this.reservationAddress = '';
          this.generateCalendar();
        } else {
          this.reservationStatus = { state: 'error', message: res.message || 'Error al enviar la reserva.' };
        }
      },
      error: (err) => {
        console.error('Error enviando reserva', err);
        this.reservationStatus = { state: 'error', message: 'No se pudo enviar la reserva. Intenta nuevamente.' };
      }
    });
  }
}
