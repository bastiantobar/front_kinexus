import { Component } from '@angular/core';
import { PresentationContentService } from '../../../core/service/presentation-content.service';

@Component({
  selector: 'app-servicios',
  templateUrl: './servicios.component.html',
})
export class ServiciosComponent {
  grupos = [
    { titulo: 'Para empresas', services: this.content.getServices('empresas') },
    { titulo: 'Para personas', services: this.content.getServices('personas') },
  ];
  constructor(private content: PresentationContentService) { }
}
