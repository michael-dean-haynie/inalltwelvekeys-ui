import { Injectable } from '@angular/core';
import {Enumerations, Input, Message, NoteMessageEvent, WebMidi} from "webmidi";
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class WebmidiService {
  readonly noteMessageEventSubject: Subject<NoteMessageEvent> = new Subject<NoteMessageEvent>();

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
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
