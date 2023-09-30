import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RawMidiComponent } from "./raw-midi/raw-midi.component";
import { PianoComponent } from "./piano/piano.component";
import { NotFoundComponent } from "./not-found/not-found.component";

const routes: Routes = [
  { path: 'raw', component: RawMidiComponent },
  { path: 'piano', component: PianoComponent },
  { path: '', redirectTo: 'piano', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
