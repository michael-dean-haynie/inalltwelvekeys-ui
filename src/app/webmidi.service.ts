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

    window.navigator.requestMIDIAccess().then(
      (access) => {
        document.body.innerHTML += `<div>we got midi access</div>`
      },
      (reason) => {
        document.body.innerHTML += `<div>we did not got midi access</div>`
        document.body.innerHTML += `<div>${reason}</div>`
        document.body.innerHTML += `<div>${JSON.stringify(reason)}</div>`
      }
    );

    window.navigator.permissions.query({name: "midi"} as unknown as PermissionDescriptor).then((result) => {
      if (result.state === "granted") {
        // Access granted.
      } else if (result.state === "prompt") {
        // Using API will prompt for permission
      }
      // Permission was denied by user prompt or permission policy
    });


    if (!!window.navigator.requestMIDIAccess) {
      document.body.innerHTML += `<div>requestMIDIAccess is a thing</div>`
    } else {
      document.body.innerHTML += `<div>requestMIDIAccess is not a thing</div>`
    }



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
