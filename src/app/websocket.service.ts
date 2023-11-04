import {Injectable, OnDestroy} from '@angular/core';
import {filter, map, Observable, Subject, Subscription, tap} from "rxjs";
import { webSocket} from "rxjs/webSocket";
import {environment} from "../environments/environment";
import {MidiMessage} from "./models/api/midi-message";

@Injectable({
  providedIn: 'root'
})
export class WebsocketService implements OnDestroy{
  public readonly midiMessageSubject: Subject<MidiMessage> = new Subject<MidiMessage>();

  private messageEventSubject?: Subject<MessageEvent>;
  private subscriptions: Subscription[] = [];

  constructor(){
    this.reConnect();
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  reConnect(): void {
    if (this.messageEventSubject) {
      this.unsubscribe();
    }

    this.messageEventSubject = webSocket<MessageEvent>({
      url: (environment as any).websocketUrl,
      deserializer: (messageEvent) => messageEvent
    });

    console.log(this.messageEventSubject);
    this.subscriptions.push(this.messageEventSubject.subscribe(data => console.log(data)));

    // pipe the midi messages out to their own subscribable subject for service consumers
    const midiMessageObservable: Observable<MidiMessage> = this.messageEventSubject.pipe(
      filter(messageEvent => messageEvent.data !== undefined), // TODO: better check?
      map(messageEvent => JSON.parse(messageEvent.data) as MidiMessage)
    );
    this.subscriptions.push(midiMessageObservable.subscribe(midiMessage => {
      this.midiMessageSubject.next(midiMessage);
    }));
  }

  private unsubscribe(): void {
    for (let subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
    if (this.messageEventSubject) {
      this.messageEventSubject.unsubscribe();
      this.messageEventSubject = undefined;
    }
  }

}
