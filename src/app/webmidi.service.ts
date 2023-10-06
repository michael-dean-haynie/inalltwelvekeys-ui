import { Injectable } from '@angular/core';
import {Message} from "webmidi";
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class WebmidiService {
  readonly messageSubject: Subject<Message> = new Subject<Message>();
  private _midiAccess?: MIDIAccess;
  // private _midiInputs?: MIDIInputMap;
  // private _midiOutputs?: MIDIOutputMap;


  constructor() {
    if (window.navigator.requestMIDIAccess) {
      window.navigator.requestMIDIAccess().then(
        (midiAccess) => this.accessGrantedHandler(midiAccess),
        console.log // on reject
      );
    } else {
      console.log('Web MIDI API is not available on your browser.')
    }
  }

  private get midiAccess(): MIDIAccess {
    if (!this._midiAccess) {
      throw new Error();
    }
    return this._midiAccess;
  }

  // private get midiInputs(): MIDIInputMap {
  //   if (!this._midiInputs) {
  //     throw new Error();
  //   }
  //   return this._midiInputs;
  // }
  //
  // private get midiOutputs(): MIDIOutputMap {
  //   if (!this._midiOutputs) {
  //     throw new Error();
  //   }
  //   return this._midiOutputs;
  // }

  private accessGrantedHandler(midiAccess: MIDIAccess): void {
    this._midiAccess = midiAccess;

    this.midiAccess.addEventListener('statechange', (event) => {
      const midiConnectionEvent = event as MIDIConnectionEvent;
      // console.log(`Port: ${midiConnectionEvent.port.name}, statechange`, midiConnectionEvent);
      this.setupEventHandler();
    });

    this.setupEventHandler();
  }

  private setupEventHandler(): void {
    const inputs: MIDIInput[] = [];
    this.midiAccess.inputs.forEach(input => {
      inputs.push(input);
    });

    for (let port = 0; port < inputs.length; port++) {
      const str = "input port:" + port + ", name: " + inputs[port].name;

      // leaving IIFE as-is for now
      (function (messageSubject) {
        const _port = port; // copy (do not share ref)
        inputs[_port].onmidimessage = function (event) {
          const midiMessageEvent = event as MIDIMessageEvent;
          const message = new Message(midiMessageEvent.data);
          messageSubject.next(message);

        };

      }(this.messageSubject)); // inject subject into IIFE
    }

  }

}
