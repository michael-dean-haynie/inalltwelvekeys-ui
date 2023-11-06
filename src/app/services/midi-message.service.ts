import {Injectable, OnDestroy} from '@angular/core';
import {WebsocketService} from "./websocket.service";
import {WebmidiService} from "./webmidi.service";
import {Message} from "webmidi";
import {Subject, Subscription} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class MidiMessageService implements OnDestroy{
  readonly midiMessageSubject: Subject<Message> = new Subject<Message>();
  private subscriptions: Subscription[] = [];

  constructor(
    private websocketService: WebsocketService,
    private webmidiService: WebmidiService,
  ) {
    // subscribe to midi events from the websocket
    this.subscriptions.push(this.websocketService.midiMessageSubject.subscribe(midiMessage => {
      if (midiMessage.bytes) {
        const message = new Message(new Uint8Array(midiMessage.bytes))
        this.midiMessageSubject.next(message);
      }
    }));

    // subscribe to midi events from the browser
    this.subscriptions.push(this.webmidiService.messageSubject.subscribe(message => {
      this.midiMessageSubject.next(message);
    }));
  }

  ngOnDestroy(): void {
    for (let subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }
}
