import {Injectable, OnDestroy} from '@angular/core';
import {Subject, Subscription} from "rxjs";
import {Message} from "webmidi3";
import {MidiMessageService} from "./midi-message.service";

@Injectable({
  providedIn: 'root'
})
export class ActiveNotesService implements OnDestroy {
  readonly activeNotesSubject: Subject<number[]> = new Subject<number[]>();
  private activeNotes: number[] = [];
  private subscriptions: Subscription[] = [];

  constructor(
    private midiMessageService: MidiMessageService,
  ) {
    this.subscriptions.push(this.midiMessageService.midiMessageSubject.subscribe(message => {
      const midiNoteNumber = message.data[1];
      if (message.type === 'noteon') {
        this.handleNoteOnMidiEvent(midiNoteNumber);
      }
      if (message.type === 'noteoff') {
        this.handleNoteOffMidiEvent(midiNoteNumber);
      }
    }));
  }

  handleNoteOnMidiEvent(midiNoteNumber: number): void {
    if (!this.activeNotes.includes(midiNoteNumber)) {
      this.activeNotes.push(midiNoteNumber);
      this.sortActiveNotes();
      // publish shallow copies so down-stream code cannot modify internal contents
      this.activeNotesSubject.next([...this.activeNotes]);
    }
  }

  handleNoteOffMidiEvent(midiNoteNumber: number): void {
    if (this.activeNotes.includes(midiNoteNumber)) {
      this.activeNotes = this.activeNotes.filter(num => num !== midiNoteNumber);
      // sort not needed because .filter() is guaranteed to preserve order
      // publish shallow copy so down-stream code cannot modify internal contents
      this.activeNotesSubject.next([...this.activeNotes]);
    }
  }

  private sortActiveNotes(): void {
    this.activeNotes.sort();// defaults to ascending
  }

  ngOnDestroy(): void {
    for (let subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }
}
