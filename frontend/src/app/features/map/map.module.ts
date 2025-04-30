import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { MapRoutingModule } from './map-routing.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MapRoutingModule,
    GoogleMapsModule
  ]
})
export class MapModule { }
