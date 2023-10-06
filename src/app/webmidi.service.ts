// @ts-nocheck
import { Injectable } from '@angular/core';
import {Message, Note, NoteMessageEvent, WebMidi} from "webmidi";
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class WebmidiService {
  readonly messageSubject: Subject<Message> = new Subject<Message>();
  private _midiAccess = null;
  private _midiInputs = null;
  private _midiOutputs = null;


  constructor() {
    // Possible I needed to .then() to get this to work.
    this.initialize().then(_ => _);
  }

  private async initialize(): Promise<void> {
    this.setup();

    // Previous implementation below
    // await WebMidi.enable();
    // for (let input of WebMidi.inputs) {
    //   const noteOnListener = input.addListener("noteon", noteMessageEvent => {
    //     this.messageSubject.next(noteMessageEvent);
    //   });
    //   const noteOffListener = input.addListener("noteoff", noteMessageEvent => {
    //     this.messageSubject.next(noteMessageEvent);
    //   });
    // }
  }

  private setup(): void {
    if (window.navigator.requestMIDIAccess) {
      window.navigator.requestMIDIAccess().then(
        this.success.bind(this),
        function() {
          // // window.document.body.innerHTML += "requestMIDIAccess() failed.";
        });
    } else {
      // // window.document.body.innerHTML += "Web MIDI API is not available on your browser.\n";
    }

  }

  private setupEventHandler(): void {
    let inputs = null;
    if (typeof this._midiAccess.inputs === "function") {
      inputs = this._midiAccess.inputs();
    } else {
      const iter = this._midiAccess.inputs.values();
      inputs = [];
      for (let o = iter.next(); !o.done; o = iter.next()) {
        inputs.push(o.value);
      }
    }

    for (let port = 0; port < inputs.length; port++) {
      const str = "input port:" + port + ", name: " + inputs[port].name;
      // window.document.body.innerHTML += str + "\n";

      // leaving IIFE as-is for now
      (function (messageSubject) {
        var _port = port;
        inputs[_port].onmidimessage = function (event) {
          var str = "port:" + _port + " "; // + ", receivedTime:" + event.receivedTime.toFixed(2) + ", ";
          for (var i = 0; i < event.data.length; i++) {
            str += event.data[i].toString(16) + " ";
          }
          console.log('midiMessage: ', event);
          const message = new Message(event.data);
          console.log('Message: ', message);
          messageSubject.next(message);

          // window.document.body.innerHTML += str + "\n";
        };

        inputs[_port].ondisconnect = function (event) {
          var str = "input port:" + _port + ", disconnected.";
          // window.document.body.innerHTML += str + "\n";
        };
      }(this.messageSubject));
    }

    let outputs = null;
    if (typeof this._midiAccess.outputs === "function") {
      outputs = this._midiAccess.outputs();
    } else {
      const iter = this._midiAccess.outputs.values();
      outputs = [];
      for (let o = iter.next(); !o.done; o = iter.next()) {
        outputs.push(o.value);
      }
    }

    for (let port = 0; port < outputs.length; port++) {
      // leaving IIFE as-is for now
      (function () {
        var _port = port;
        outputs[_port].ondisconnect = function (event) {
          var str = "output port:" + _port + ", disconnected.";
          // window.document.body.innerHTML += str + "\n";
        };
      }());
    }

    this._midiInputs = inputs;
    this._midiOutputs = outputs;

  }

  private success(access): void {
    this._midiAccess = access;

    this._midiAccess.onconnect = (event) => {
      const str = "port: " + event.port.name + ", connected.";
      // window.document.body.innerHTML += str + "\n";

      this.setupEventHandler();
    }

    this.setupEventHandler();
  }

}
