import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {Chord, Midi, Note} from "tonal";
import {ActiveNotesService} from "../active-notes.service";

@Component({
  selector: 'app-chord-detector',
  templateUrl: './chord-detector.component.html',
  styleUrls: ['./chord-detector.component.scss']
})
export class ChordDetectorComponent implements OnInit, OnDestroy {
  flats: string[] = [];
  sharps: string[] = [];
  flatsChords: string[] = [];
  sharpsChords: string[] = [];
  private subscriptions: Subscription[] = [];

  constructor(
    private activeNotesService: ActiveNotesService,
    private ref: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.subscriptions.push(this.activeNotesService.activeNotesSubject.subscribe(activeNotes => {
      this.flats = activeNotes.map(activeNote => Midi.midiToNoteName(activeNote));
      this.sharps = activeNotes.map(activeNote => Midi.midiToNoteName(activeNote, { sharps: true }));
      this.flatsChords = Chord.detect(this.flats.map(note => Note.pitchClass(note)));
      this.sharpsChords = Chord.detect(this.sharps.map(note => Note.pitchClass(note)));

      // for some reason change detection not firing :(
      this.ref.markForCheck()
      this.ref.detectChanges();
    }));
  }

  ngOnDestroy(): void {
    for (let subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }
}
