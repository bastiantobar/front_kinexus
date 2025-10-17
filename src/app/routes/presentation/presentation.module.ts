import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { PresentationRoutingModule } from './presentation-routing.module';
import { PresentationComponent } from './presentation/presentation.component';

const routes: Routes = [
  { path: '', component: PresentationComponent }
];

@NgModule({
  declarations: [
    PresentationComponent
  ],
  imports: [
    CommonModule,
    PresentationRoutingModule,
    RouterModule.forChild(routes)
  ]
})
export class PresentationModule { }
