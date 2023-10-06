import {Component, OnDestroy, OnInit} from '@angular/core';
import { Instrument } from "piano-chart";
import {PianoChartAdapter} from "../models/piano-chart/piano-chart-adapter";
import {Subscription} from "rxjs";
import {ActiveNotesService} from "../active-notes.service";

@Component({
  selector: 'app-piano',
  templateUrl: './piano.component.html',
  styleUrls: ['./piano.component.scss']
})
export class PianoComponent implements OnInit, OnDestroy {
  private _pianoChartAdapter: PianoChartAdapter | undefined;
  private subscriptions: Subscription[] = [];

  constructor(private activeNotesService: ActiveNotesService) {}

  ngOnInit(): void {
    this.initializePiano();
    this.initializeActiveNotesSubscription();
  }

  ngOnDestroy(): void {
    for (let subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  get pianoChartAdapter() : PianoChartAdapter {
    if (!this._pianoChartAdapter) {
      throw new Error();
    }
    return this._pianoChartAdapter;
  }

  private initializePiano(): void {
    const pianoContainer = document.getElementById('pianoContainer');
    if (pianoContainer) {
      const instrument = new Instrument(pianoContainer, {
        startOctave: 0,
        startNote: "A",
        endOctave: 8,
        endNote: "C",
        showNoteNames: "never",
        keyPressStyle: "vivid"
      });
      instrument.create();
      this._pianoChartAdapter = new PianoChartAdapter(instrument);
    }
    else {
      throw new Error('could not find piano container element')
    }
  }

  private initializeActiveNotesSubscription(): void {
    this.subscriptions.push(this.activeNotesService.activeNotesSubject.subscribe((activeNotes) => {
      this.pianoChartAdapter.updateActiveNotes(activeNotes);
    }));
  }


}
