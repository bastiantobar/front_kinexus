import { Component } from '@angular/core';
import { PresentationContentService } from '../../../core/service/presentation-content.service';

@Component({
  selector: 'app-servicios',
  templateUrl: './servicios.component.html',
})
export class ServiciosComponent {
  services = this.content.getServices();
  constructor(private content: PresentationContentService) { }
}
