import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-presentation',
  templateUrl: './presentation.component.html',
  styleUrls: ['./presentation.component.scss']
})
export class PresentationComponent implements OnInit {
  currentYear = new Date().getFullYear();
  menuOpen = false;

  // WhatsApp configuration (replace number as needed)
  whatsAppNumber = '56912345678';
  whatsAppMessage = 'Hola, me gustaría agendar una evaluación inicial con Kinexus.';

  constructor() {}

  ngOnInit(): void {}

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

}
