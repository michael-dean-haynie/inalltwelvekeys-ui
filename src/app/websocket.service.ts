import { Injectable } from '@angular/core';
import {filter, map, Subject} from "rxjs";
import { webSocket} from "rxjs/webSocket";
import {environment} from "../environments/environment";
import {PianoKey} from "./models/piano-key";
import {MidiMessage} from "./models/api/midi-message";
import {MidiNote} from "./models/midi-note";

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private readonly _websocketSubject: Subject<MessageEvent>;
  private pianoKeys: PianoKey[] = [];
  readonly pianoKeysChangesSubject: Subject<PianoKey[]> = new Subject<PianoKey[]>();

  constructor() {
    this._websocketSubject = webSocket<MessageEvent>({
      url: (environment as any).websocketUrl,
      deserializer: (messageEvent) => messageEvent
    });

    const inter = this.websocketSubject.pipe(
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
        return JSON.parse(JSON.stringify(this.pianoKeys)) as PianoKey[];
      })
    );

    inter.subscribe(val => this.pianoKeysChangesSubject.next(val))
  }

  get websocketSubject(): Subject<MessageEvent> {
    if (!this._websocketSubject){
      throw new Error();
    }
    return this._websocketSubject;
  }
}
