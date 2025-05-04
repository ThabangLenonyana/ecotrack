import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapComponent } from './map.component';
import { LookUpComponent } from './components/look-up/look-up.component';
const routes: Routes = [
    {
    path: '',
    component : MapComponent
  }, 
  { path: 'lookup', component: LookUpComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MapRoutingModule { }
