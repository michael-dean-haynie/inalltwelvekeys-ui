import {Injectable, OnDestroy} from '@angular/core';
import {filter, map, Observable, Subject, Subscription} from "rxjs";
import { webSocket} from "rxjs/webSocket";
import {environment} from "../environments/environment";
import {PianoKey} from "./models/piano-key";
import {MidiMessage} from "./models/api/midi-message";
import {MidiNote} from "./models/midi-note";

@Injectable({
  providedIn: 'root'
})
export class WebsocketService implements OnDestroy{
  private readonly _messageEventSubject: Subject<MessageEvent>;
  private readonly _midiMessageSubject: Subject<MidiMessage>;
  private pianoKeys: PianoKey[] = [];
  readonly pianoKeysChangesSubject: Subject<PianoKey[]> = new Subject<PianoKey[]>();
  private subscriptions: Subscription[] = [];

  constructor(){
    this._messageEventSubject = webSocket<MessageEvent>({
      url: (environment as any).websocketUrl,
      deserializer: (messageEvent) => messageEvent
    });

    const inter = this.messageEventSubject.pipe(
      map(messageEvent => JSON.parse(messageEvent.data)),
      filter(data => data['type'] === 'note_on' || data['type'] === 'note_off'),
      map<any, MidiMessage>(data => data as MidiMessage),
      map<MidiMessage, PianoKey[]>(midiMsg => {
        if (midiMsg.type === 'note_on') {
          if (!this.pianoKeys.find(pk => pk.midiNote.number === midiMsg.note)) {
            this.pianoKeys.push(new PianoKey(new MidiNote(midiMsg.note)))
          }
        } else if (midiMsg.type === 'note_off') {
          this.pianoKeys = this.pianoKeys.filter(pk => pk.midiNote.number !== midiMsg.note)
        }

        // sort piano keys by ascending midi value
        this.pianoKeys.sort((a, b) => {
          return a.midiNote.number - b.midiNote.number;
        });
        return JSON.parse(JSON.stringify(this.pianoKeys)) as PianoKey[];
      })
    );

    inter.subscribe(val => this.pianoKeysChangesSubject.next(val));

    // pipe the midi messages out to their own subscribable subject for service consumers
    this._midiMessageSubject = new Subject<MidiMessage>();
    const midiMessageObservable: Observable<MidiMessage> = this.messageEventSubject.pipe(
      filter(messageEvent => messageEvent.data !== undefined), // TODO: better check?
      map(messageEvent => JSON.parse(messageEvent.data) as MidiMessage)
    );
    this.subscriptions.push(midiMessageObservable.subscribe(midiMessage => {
      this.midiMessageSubject.next(midiMessage);
    }));
  }

  get messageEventSubject(): Subject<MessageEvent> {
    if (!this._messageEventSubject){
      throw new Error();
    }
    return this._messageEventSubject;
  }

  get midiMessageSubject(): Subject<MidiMessage> {
    if (!this._midiMessageSubject){
      throw new Error();
    }
    return this._midiMessageSubject;
  }

  ngOnDestroy(): void {
    for (let subscription of this.subscriptions) {
     subscription.unsubscribe();
    }
  }
}
