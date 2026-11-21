import { Component } from '@angular/core';
import { PresentationContentService } from '../../../core/service/presentation-content.service';

@Component({
  selector: 'app-nosotros',
  templateUrl: './nosotros.component.html',
})
export class NosotrosComponent {
  galeria = this.content.getGalleryImages();
  constructor(private content: PresentationContentService) { }
}
