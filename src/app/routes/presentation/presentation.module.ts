import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { PresentationRoutingModule } from './presentation-routing.module';
import { PresentationComponent } from './presentation/presentation.component';
import { SharedModule } from '../../shared/shared.module';

const routes: Routes = [
  { path: '', component: PresentationComponent }
];

@NgModule({
  declarations: [
    PresentationComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    PresentationRoutingModule,
    RouterModule.forChild(routes)
  ]
})
export class PresentationModule { }
