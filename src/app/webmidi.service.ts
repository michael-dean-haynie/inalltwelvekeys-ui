import { Injectable } from '@angular/core';
import {NoteMessageEvent, WebMidi} from "webmidi";
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class WebmidiService {
  readonly noteMessageEventSubject: Subject<NoteMessageEvent> = new Subject<NoteMessageEvent>();

  constructor() {
    this.initialize().then(_ => _);
  }

  private async initialize(): Promise<void> {

    window.navigator.requestMIDIAccess().then((access) => {
      document.body.innerHTML += `<div>we got midi access</div>`
    });



    await WebMidi.enable();
    for (let input of WebMidi.inputs) {
      const noteOnListener = input.addListener("noteon", noteMessageEvent => {
        this.noteMessageEventSubject.next(noteMessageEvent);
      });
      const noteOffListener = input.addListener("noteoff", noteMessageEvent => {
        this.noteMessageEventSubject.next(noteMessageEvent);
      });
    }
  }
}
