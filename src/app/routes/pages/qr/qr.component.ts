import { Component, OnInit, OnDestroy } from '@angular/core';
import { Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-qr',
  templateUrl: './qr.component.html',
  styleUrls: ['./qr.component.scss']
})
export class QrComponent implements OnInit, OnDestroy {
  private whatsAppNumber = '56963691898';
  private whatsAppMessage = 'Hola, quiero agendar una evaluación kinesiológica con KI-NEXUS';

  constructor(private meta: Meta) {}

  ngOnInit(): void {
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    this.meta.updateTag({ name: 'viewport', content: 'width=device-width, initial-scale=1' });
  }

  ngOnDestroy(): void {
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1' });
  }

  get whatsAppUrl(): string {
    return `https://wa.me/${this.whatsAppNumber}?text=${encodeURIComponent(this.whatsAppMessage)}`;
  }

  handleImageError(event: any) {
    event.target.src = 'https://ui-avatars.com/api/?name=KI-NEXUS&background=648C34&color=fff';
  }
}
