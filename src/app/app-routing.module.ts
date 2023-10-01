import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RawMidiComponent } from "./raw-midi/raw-midi.component";
import { PianoComponent } from "./piano/piano.component";
import { NotFoundComponent } from "./not-found/not-found.component";
import { StaveComponent } from "./stave/stave.component";

const routes: Routes = [
  { path: 'raw', component: RawMidiComponent },
  { path: 'piano', component: PianoComponent },
  { path: 'stave', component: StaveComponent },
  { path: 'staff', redirectTo: 'stave', pathMatch: 'full' },
  { path: '', redirectTo: 'piano', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
