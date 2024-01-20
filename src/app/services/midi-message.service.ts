import {Injectable, OnDestroy} from '@angular/core';
import {WebsocketService} from "./websocket.service";
import {WebmidiService} from "./webmidi.service";
import {Message} from "webmidi3";
import {Subject, Subscription} from "rxjs";
import {TimestampedMessage} from "../models/timestamped-message";

@Injectable({
  providedIn: 'root'
})
export class MidiMessageService implements OnDestroy{
  readonly midiMessageSubject: Subject<TimestampedMessage> = new Subject<TimestampedMessage>();
  private subscriptions: Subscription[] = [];

  constructor(
    private websocketService: WebsocketService,
    private webmidiService: WebmidiService,
  ) {
    // subscribe to midi events from the websocket
    this.subscriptions.push(this.websocketService.midiMessageSubject.subscribe(midiMessage => {
      if (midiMessage.bytes && midiMessage.timestamp) {
        const tsMessage: TimestampedMessage = {
          timestamp: midiMessage.timestamp,
          message: new Message(new Uint8Array(midiMessage.bytes))
        };
        this.midiMessageSubject.next(tsMessage);
      }
    }));

    // subscribe to midi events from the browser
    this.subscriptions.push(this.webmidiService.messageSubject.subscribe(tsMsg => {
      this.midiMessageSubject.next(tsMsg);
    }));
  }

  ngOnDestroy(): void {
    for (let subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }
}
