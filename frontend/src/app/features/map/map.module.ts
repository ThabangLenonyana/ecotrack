import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { MapRoutingModule } from './map-routing.module';
import { HeaderNavComponent } from '../../shared/components/header-nav/header-nav.component';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MapRoutingModule,
    GoogleMapsModule,
    HeaderNavComponent
  ]
})
export class MapModule { }
