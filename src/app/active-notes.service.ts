import {Injectable, OnDestroy} from '@angular/core';
import {Subject, Subscription} from "rxjs";
import {WebsocketService} from "./websocket.service";
import {WebmidiService} from "./webmidi.service";

@Injectable({
  providedIn: 'root'
})
export class ActiveNotesService implements OnDestroy {
  readonly activeNotesSubject: Subject<number[]> = new Subject<number[]>();
  private activeNotes: number[] = [];
  private subscriptions: Subscription[] = [];

  constructor(
    private websocketService: WebsocketService,
    private webmidiService: WebmidiService,
  ) {
    // subscribe to midi events from the websocket
    this.subscriptions.push(this.websocketService.midiMessageSubject.subscribe(midiMessage => {
      if (midiMessage.type === 'note_on'){
        this.handleNoteOnMidiEvent(midiMessage.note);
      }
      if (midiMessage.type === 'note_off'){
        this.handleNoteOffMidiEvent(midiMessage.note);
      }
    }));

    // subscribe to midi events from the browser
    this.subscriptions.push(this.webmidiService.noteMessageEventSubject.subscribe(noteMessageEvent => {
      if (noteMessageEvent.type === 'noteon') {
        this.handleNoteOnMidiEvent(noteMessageEvent.note.number);
      }
      if (noteMessageEvent.type === 'noteoff') {
        this.handleNoteOffMidiEvent(noteMessageEvent.note.number);
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
