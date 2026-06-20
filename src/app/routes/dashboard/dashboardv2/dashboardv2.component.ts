import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { ColorsService } from "../../../shared/colors/colors.service";
import { EmpresaService } from "../../../../app/core/service/empresa.service"; // ¡Ajusta esta ruta según tu estructura!
//import { Empresa } from "../empresa.model"; // ¡Ajusta esta ruta según tu estructura!

@Component({
  selector: "app-dashboardv2",
  templateUrl: "./dashboardv2.component.html",
  styleUrls: ["./dashboardv2.component.scss"],
})
export class Dashboardv2Component implements OnInit {
  // Propiedad para almacenar la lista de empresas obtenida del servicio
  empresas: any[] = [];

  // Availability Admin State
  availabilityData: any = {};
  calendarDate = new Date();
  selectedAdminDate: Date | null = null;
  adminCalendarDays: any[] = [];
  minDate = new Date();
  maxDate = new Date(new Date().getFullYear(), new Date().getMonth() + 12, 0);
  availableTimeSlots: string[] = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00'
  ];
  selectedSlotsForSelectedDate: string[] = [];
  saveStatus: { state: 'idle' | 'pending' | 'success' | 'error'; message?: string } = { state: 'idle' };

  sparkOptions1 = {
    barColor: this.colors.byName("info"),
    height: 60,
    barWidth: 10,
    barSpacing: 6,
    chartRangeMin: 0,
  };

  sparkOptions2 = {
    type: "line",
    height: 60,
    width: "80%",
    lineWidth: 2,
    lineColor: this.colors.byName("purple"),
    chartRangeMin: 0,
    spotColor: "#888",
    minSpotColor: this.colors.byName("purple"),
    maxSpotColor: this.colors.byName("purple"),
    fillColor: "",
    highlightLineColor: "#fff",
    spotRadius: 3,
    resize: true,
  };

  barStackedData: any;
  barStackedOptions = {
    series: {
      stack: true,
      bars: {
        align: "center",
        lineWidth: 0,
        show: true,
        barWidth: 0.6,
        fill: 0.9,
      },
    },
    grid: {
      borderColor: "#eee",
      borderWidth: 1,
      hoverable: true,
      backgroundColor: "#fcfcfc",
    },
    tooltip: true,
    tooltipOpts: {
      content: (label, x, y) => {
        return x + " : " + y;
      },
    },
    xaxis: {
      tickColor: "#fcfcfc",
      mode: "categories",
    },
    yaxis: {
      min: 0,
      max: 200, // optional: use it for a clear represetation
      // position: ($rootScope.app.layout.isRTL ? 'right' : 'left'),
      tickColor: "#eee",
    },
    shadowSize: 0,
  };

  splineData: any;
  splineOptions = {
    series: {
      lines: {
        show: false,
      },
      points: {
        show: true,
        radius: 4,
      },
      splines: {
        show: true,
        tension: 0.4,
        lineWidth: 1,
        fill: 0.5,
      },
    },
    grid: {
      borderColor: "#eee",
      borderWidth: 1,
      hoverable: true,
      backgroundColor: "#fcfcfc",
    },
    tooltip: true,
    tooltipOpts: {
      content: (label, x, y) => {
        return x + " : " + y;
      },
    },
    xaxis: {
      tickColor: "#fcfcfc",
      mode: "categories",
    },
    yaxis: {
      min: 0,
      max: 150, // optional: use it for a clear represetation
      tickColor: "#eee",
      // position: ($rootScope.app.layout.isRTL ? 'right' : 'left'),
      tickFormatter: (v) => {
        return v /* + ' visitors'*/;
      },
    },
    shadowSize: 0,
  };

  easyPiePercent1 = 60;
  easyPiePercent2 = 30;
  easyPiePercent3 = 50;
  easyPiePercent4 = 75;

  pieOptions1 = {
    animate: {
      duration: 800,
      enabled: true,
    },
    barColor: this.colors.byName("info"),
    trackColor: "#edf2f6",
    scaleColor: false,
    lineWidth: 2,
    lineCap: "round",
    size: 130,
  };
  pieOptions2 = {
    animate: {
      duration: 800,
      enabled: true,
    },
    barColor: this.colors.byName("pink"),
    trackColor: "#edf2f6",
    scaleColor: false,
    lineWidth: 2,
    lineCap: "round",
    size: 130,
  };
  pieOptions3 = {
    animate: {
      duration: 800,
      enabled: true,
    },
    barColor: this.colors.byName("purple"),
    trackColor: "#edf2f6",
    scaleColor: false,
    lineWidth: 2,
    lineCap: "round",
    size: 130,
  };
  pieOptions4 = {
    animate: {
      duration: 800,
      enabled: true,
    },
    barColor: this.colors.byName("warning"),
    trackColor: "#edf2f6",
    scaleColor: false,
    lineWidth: 2,
    lineCap: "round",
    size: 130,
  };

  constructor(
    public colors: ColorsService,
    public http: HttpClient,
    private router: Router,
    // Inyectamos el servicio
    private empresaService: EmpresaService
  ) {
    http
      .get("assets/server/chart/barstackedv2.json")
      .subscribe((data) => (this.barStackedData = data));
    http
      .get("assets/server/chart/splinev2.json")
      .subscribe((data) => (this.splineData = data));
  }

  ngOnInit() {
    // Llamamos al método de carga al inicializar el componente
    this.cargarEmpresas();
    this.cargarDisponibilidad();
  }

  /**
   * Carga la lista de empresas usando el servicio y maneja la suscripción.
   */
  private cargarEmpresas() {
    this.empresaService.getEmpresas().subscribe({
      next: (data) => {
        this.empresas = data;
        console.log("¡Empresas cargadas exitosamente!", this.empresas);
      },
      error: (err) => {
        console.error("Error al obtener las empresas:", err);
        // Aquí podrías agregar lógica para mostrar un mensaje de error en la UI
      },
    });
  }

  cargarDisponibilidad() {
    this.http.get('availability.php').subscribe({
      next: (data: any) => {
        this.availabilityData = data || {};
        // Seleccionar hoy por defecto
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        this.selectedAdminDate = today;
        const key = this.formatDateKey(today);
        this.selectedSlotsForSelectedDate = this.availabilityData[key] ? [...this.availabilityData[key]] : [];
        this.generateAdminCalendar();
      },
      error: (err) => {
        console.warn('Error loading from availability.php, trying assets fallback:', err);
        this.http.get('assets/availability.json').subscribe({
          next: (data: any) => {
            this.availabilityData = data || {};
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            this.selectedAdminDate = today;
            const key = this.formatDateKey(today);
            this.selectedSlotsForSelectedDate = this.availabilityData[key] ? [...this.availabilityData[key]] : [];
            this.generateAdminCalendar();
          }
        });
      }
    });
  }

  formatDateKey(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  generateAdminCalendar() {
    const year = this.calendarDate.getFullYear();
    const month = this.calendarDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    let adjustedFirstDay = firstDayIndex - 1;
    if (adjustedFirstDay < 0) adjustedFirstDay = 6;

    const totalDays = new Date(year, month + 1, 0).getDate();
    const days: any[] = [];

    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push({ date: null, dayNum: '', isSelectable: false, hasSlots: false });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month, d);
      date.setHours(0, 0, 0, 0);

      const dateKey = this.formatDateKey(date);
      const slots = this.availabilityData[dateKey] || [];
      const hasSlots = slots.length > 0;

      const isSelectable = date >= today && date <= this.maxDate;
      const isToday = date.getTime() === today.getTime();
      const isSelected = this.selectedAdminDate ? date.getTime() === this.selectedAdminDate.getTime() : false;

      days.push({
        date,
        dayNum: d,
        isSelectable,
        isToday,
        isSelected,
        hasSlots
      });
    }

    this.adminCalendarDays = days;
  }

  prevAdminCalendarMonth() {
    const currentMonth = new Date(this.calendarDate.getFullYear(), this.calendarDate.getMonth(), 1);
    const minMonth = new Date(this.minDate.getFullYear(), this.minDate.getMonth(), 1);
    if (currentMonth > minMonth) {
      this.calendarDate = new Date(this.calendarDate.getFullYear(), this.calendarDate.getMonth() - 1, 1);
      this.generateAdminCalendar();
    }
  }

  nextAdminCalendarMonth() {
    const currentMonth = new Date(this.calendarDate.getFullYear(), this.calendarDate.getMonth(), 1);
    const maxMonth = new Date(this.maxDate.getFullYear(), this.maxDate.getMonth(), 1);
    if (currentMonth < maxMonth) {
      this.calendarDate = new Date(this.calendarDate.getFullYear(), this.calendarDate.getMonth() + 1, 1);
      this.generateAdminCalendar();
    }
  }

  isPrevAdminMonthDisabled(): boolean {
    const currentMonth = new Date(this.calendarDate.getFullYear(), this.calendarDate.getMonth(), 1);
    const minMonth = new Date(this.minDate.getFullYear(), this.minDate.getMonth(), 1);
    return currentMonth <= minMonth;
  }

  isNextAdminMonthDisabled(): boolean {
    const currentMonth = new Date(this.calendarDate.getFullYear(), this.calendarDate.getMonth(), 1);
    const maxMonth = new Date(this.maxDate.getFullYear(), this.maxDate.getMonth(), 1);
    return currentMonth >= maxMonth;
  }

  selectAdminCalendarDate(day: any) {
    if (day.isSelectable && day.date) {
      this.selectedAdminDate = day.date;
      const key = this.formatDateKey(day.date);
      this.selectedSlotsForSelectedDate = this.availabilityData[key] ? [...this.availabilityData[key]] : [];
      this.generateAdminCalendar();
      this.saveStatus = { state: 'idle' };
    }
  }

  toggleTimeSlot(slot: string) {
    const index = this.selectedSlotsForSelectedDate.indexOf(slot);
    if (index > -1) {
      this.selectedSlotsForSelectedDate.splice(index, 1);
    } else {
      this.selectedSlotsForSelectedDate.push(slot);
    }
    this.saveStatus = { state: 'idle' };
  }

  isSlotSelected(slot: string): boolean {
    return this.selectedSlotsForSelectedDate.includes(slot);
  }

  saveAvailability() {
    if (!this.selectedAdminDate) return;
    
    const key = this.formatDateKey(this.selectedAdminDate);
    
    if (this.selectedSlotsForSelectedDate.length === 0) {
      delete this.availabilityData[key];
    } else {
      this.availabilityData[key] = [...this.selectedSlotsForSelectedDate].sort();
    }

    this.saveStatus = { state: 'pending', message: 'Guardando disponibilidad...' };

    this.http.post('availability.php', this.availabilityData).subscribe({
      next: (res: any) => {
        if (res && res.success) {
          this.saveStatus = { state: 'success', message: 'Disponibilidad guardada correctamente.' };
          this.generateAdminCalendar(); // Regenerar para actualizar los puntos en el calendario
        } else {
          this.saveStatus = { state: 'error', message: res.message || 'Error al guardar.' };
        }
      },
      error: (err) => {
        console.error('Error al guardar disponibilidad:', err);
        this.saveStatus = { state: 'error', message: 'No se pudo conectar con el servidor para guardar.' };
      }
    });
  }

  get adminCalendarMonthName(): string {
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${monthNames[this.calendarDate.getMonth()]} ${this.calendarDate.getFullYear()}`;
  }

  goToPlan() {
    // Utiliza el método navigate() del router para redirigir
    // Se usa un array para la URL por si se necesitan pasar parámetros
    this.router.navigate(["/dashboard/v1"]);
  }
}
