import {Injectable, OnDestroy} from '@angular/core';
import {Message} from "webmidi3";
import {Subject, Subscription} from "rxjs";
import {WebsocketService} from "./websocket.service";
import {TimestampedMessage} from "../models/timestamped-message";

@Injectable({
  providedIn: 'root'
})
export class WebmidiService implements OnDestroy{
  readonly messageSubject: Subject<TimestampedMessage> = new Subject<TimestampedMessage>();
  private _midiAccess?: MIDIAccess;
  private subscriptions: Subscription[] = [];

  constructor(private websocketService: WebsocketService) {
    // start listening for MIDI
    if (window.navigator.requestMIDIAccess) {
      window.navigator.requestMIDIAccess().then(
        (midiAccess) => this.accessGrantedHandler(midiAccess),
        console.log // on reject
      );
    } else {
      console.log('Web MIDI API is not available on your browser.')
    }

    // pipe MIDI through to server through websocket
    this.subscriptions.push(this.messageSubject.subscribe(tsMsg => {
      const payload = {
        timestamp: tsMsg.timestamp,
        bytes: [...tsMsg.message.rawData]
      };
      websocketService.send(payload);
    }));
  }

  private get midiAccess(): MIDIAccess {
    if (!this._midiAccess) {
      throw new Error();
    }
    return this._midiAccess;
  }

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
          const timestamp = Date.now();
          const midiMessageEvent = event as MIDIMessageEvent;
          const message = new Message(midiMessageEvent.data);
          messageSubject.next({ message, timestamp });
        };

      }(this.messageSubject)); // inject subject into IIFE
    }

  }

  ngOnDestroy(): void {
    for (let subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

}
