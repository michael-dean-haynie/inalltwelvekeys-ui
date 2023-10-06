import { Injectable } from '@angular/core';
import {Message, Note, NoteMessageEvent, WebMidi} from "webmidi";
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class WebmidiService {
  readonly messageSubject: Subject<Message> = new Subject<Message>();
  private _midiAccess?: MIDIAccess;
  private _midiInputs?: MIDIInputMap;
  private _midiOutputs?: MIDIOutputMap;


  constructor() {
    if (window.navigator.requestMIDIAccess) {
      window.navigator.requestMIDIAccess().then(
        (midiAccess) => this.success(midiAccess)
        // () => { window.document.body.innerHTML += "requestMIDIAccess() failed." }
      );
    } else {
      // // window.document.body.innerHTML += "Web MIDI API is not available on your browser.\n";
    }
  }

  private get midiAccess(): MIDIAccess {
    if (!this._midiAccess) {
      throw new Error();
    }
    return this._midiAccess;
  }

  private get midiInputs(): MIDIInputMap {
    if (!this._midiInputs) {
      throw new Error();
    }
    return this._midiInputs;
  }

  private get midiOutputs(): MIDIOutputMap {
    if (!this._midiOutputs) {
      throw new Error();
    }
    return this._midiOutputs;
  }

  private success(midiAccess: MIDIAccess): void {
    this._midiAccess = midiAccess;

    this.midiAccess.addEventListener('statechange', (event) => {
      const midiConnectionEvent = event as MIDIConnectionEvent;
      const str = "port: " + midiConnectionEvent.port.name + ", connected.";
      // window.document.body.innerHTML += str + "\n";

      this.setupEventHandler();
    });
    // this._midiAccess.onconnect = (event) => {
    //   const str = "port: " + event.port.name + ", connected.";
    //   // window.document.body.innerHTML += str + "\n";
    //
    //   this.setupEventHandler();
    // }

    this.setupEventHandler();
  }

  private setupEventHandler(): void {
    // if (typeof this.midiAccess.inputs === "function") {
    //   inputs = this.midiAccess.inputs();
    // } else {
      const inputs: MIDIInput[] = [];
      this.midiAccess.inputs.forEach(input => {
        inputs.push(input);
      });
      // const iter = this.midiAccess.inputs.values();
      // inputs = [];
      // for (let o = iter.next(); !o.done; o = iter.next()) {
      //   inputs.push(o.value);
      // }
    // }

    for (let port = 0; port < inputs.length; port++) {
      const str = "input port:" + port + ", name: " + inputs[port].name;
      // window.document.body.innerHTML += str + "\n";

      // leaving IIFE as-is for now
      (function (messageSubject) {
        var _port = port;
        inputs[_port].onmidimessage = function (event) {
          const midiMessageEvent = event as MIDIMessageEvent;
          var str = "port:" + _port + " "; // + ", receivedTime:" + event.receivedTime.toFixed(2) + ", ";
          for (var i = 0; i < midiMessageEvent.data.length; i++) {
            str += midiMessageEvent.data[i].toString(16) + " ";
          }
          console.log('midiMessage: ', event);
          const message = new Message(midiMessageEvent.data);
          console.log('Message: ', message);
          messageSubject.next(message);

          // window.document.body.innerHTML += str + "\n";
        };

        // inputs[_port].ondisconnect = function (event) {
        //   var str = "input port:" + _port + ", disconnected.";
        //   // window.document.body.innerHTML += str + "\n";
        // };
      }(this.messageSubject));
    }

    // if (typeof this.midiAccess.outputs === "function") {
    //   outputs = this.midiAccess.outputs();
    // } else {
      const outputs: MIDIOutput[] = [];
      this.midiAccess.outputs.forEach(output => {
        outputs.push(output)
      });
      // const iter = this.midiAccess.outputs.values();
      // outputs = [];
      // for (let o = iter.next(); !o.done; o = iter.next()) {
      //   outputs.push(o.value);
      // }
    // }

    for (let port = 0; port < outputs.length; port++) {
      // leaving IIFE as-is for now
      (function () {
        var _port = port;
        // outputs[_port].ondisconnect = function (event) {
        //   var str = "output port:" + _port + ", disconnected.";
        //   // window.document.body.innerHTML += str + "\n";
        // };
      }());
    }

    // never used anyway?
    // this._midiInputs = inputs;
    // this._midiOutputs = outputs;

  }


}
