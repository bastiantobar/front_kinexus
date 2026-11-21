import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { SiteLayoutComponent } from './site-layout.component';
import { InicioComponent } from './inicio/inicio.component';
import { ServiciosComponent } from './servicios/servicios.component';
import { ServicioComponent } from './servicio/servicio.component';
import { NosotrosComponent } from './nosotros/nosotros.component';
import { ContactoComponent } from './contacto/contacto.component';

const SUFIJO = ' | Ki-Nexus';

// title/description de cada página: los aplica SiteLayoutComponent en cada navegación.
const routes: Routes = [
  {
    path: '',
    component: SiteLayoutComponent,
    children: [
      {
        path: '', component: InicioComponent, data: {
          title: 'Kinesiología laboral y pausas activas para empresas' + SUFIJO,
          description: 'Kinesiología laboral, pausas activas para empresas y ergonomía laboral en Chile. Programas preventivos con medición de resultados.'
        }
      },
      {
        path: 'servicios', component: ServiciosComponent, data: {
          title: 'Servicios: pausas activas, ergonomía laboral y kinesiología a domicilio' + SUFIJO,
          description: 'Pausas activas para empresas, check up biomecánico de ergonomía laboral, talleres de manejo del estrés y kinesiología a domicilio, con kinesiólogos.'
        }
      },
      // title/description de cada servicio los pone ServicioComponent.
      { path: 'servicios/:slug', component: ServicioComponent },
      {
        path: 'nosotros', component: NosotrosComponent, data: {
          title: 'Nosotros: consultora de kinesiología laboral' + SUFIJO,
          description: 'Somos una consultora de salud organizacional: kinesiología laboral, neurorrehabilitación y ergonomía aplicadas a equipos de trabajo.'
        }
      },
      {
        path: 'contacto', component: ContactoComponent, data: {
          title: 'Contacto: cotiza para tu empresa o agenda kinesiología a domicilio' + SUFIJO,
          description: 'Cotiza pausas activas y ergonomía laboral para tu empresa, o reserva una atención de kinesiología a domicilio con Ki-Nexus.'
        }
      },
    ]
  }
];

@NgModule({
  declarations: [
    SiteLayoutComponent,
    InicioComponent,
    ServiciosComponent,
    ServicioComponent,
    NosotrosComponent,
    ContactoComponent,
  ],
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes)]
})
export class SiteModule { }
