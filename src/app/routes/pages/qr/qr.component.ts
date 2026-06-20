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
    // Dynamically set noindex, nofollow to prevent search engine indexing
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
  }

  ngOnDestroy(): void {
    // Restore the default robots index settings when navigating away
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
  }

  get whatsAppUrl(): string {
    return `https://wa.me/${this.whatsAppNumber}?text=${encodeURIComponent(this.whatsAppMessage)}`;
  }

  handleImageError(event: any) {
    event.target.src = 'https://ui-avatars.com/api/?name=KI-NEXUS&background=648C34&color=fff';
  }
}
