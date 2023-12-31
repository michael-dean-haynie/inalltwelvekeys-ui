import {Injectable, OnDestroy} from '@angular/core';
import {filter, map, Observable, Subject, Subscription, tap} from "rxjs";
import { webSocket} from "rxjs/webSocket";
import {environment} from "../../environments/environment";
import {MidiMessage} from "../models/api/midi-message";
import {ToastService} from "./toast.service";

@Injectable({
  providedIn: 'root'
})
export class WebsocketService implements OnDestroy{
  public readonly midiMessageSubject: Subject<MidiMessage> = new Subject<MidiMessage>();

  private messageEventSubject?: Subject<any>;
  private subscriptions: Subscription[] = [];

  constructor(
    private toastService: ToastService
  ){
    this.reConnect();

    // reconnect whenever document becomes visible again
    document.onvisibilitychange = () => {
      if (document.visibilityState === 'visible') {
        toastService.createToast({ heading: 'Welcome Back', message: 'Reconnecting ...'})
        this.reConnect();
      }
    };
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  reConnect(): void {
    if (this.messageEventSubject) {
      this.unsubscribe();
    }

    this.messageEventSubject = webSocket({
      url: (environment as any).websocketUrl,
      deserializer: (messageEvent) => messageEvent
    });

    // pipe the midi messages out to their own subscribable subject for service consumers
    const midiMessageObservable: Observable<MidiMessage> = this.messageEventSubject.pipe(
      filter(messageEvent => messageEvent.data !== undefined), // TODO: better check?
      map(messageEvent => JSON.parse(messageEvent.data) as MidiMessage)
    );
    this.subscriptions.push(midiMessageObservable.subscribe(midiMessage => {
      this.midiMessageSubject.next(midiMessage);
    }));
  }

  send(message: object): void {
    if (!this.messageEventSubject) {
      throw new Error('Could not send websocket message. Websocket connection does not exist.');
    }
    this.messageEventSubject.next(message);
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
