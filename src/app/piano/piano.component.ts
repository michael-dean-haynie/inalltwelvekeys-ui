import {Component, OnDestroy, OnInit} from '@angular/core';
import { Instrument } from "piano-chart";
import { environment } from "../../environments/environment";
import { MidiMessage} from "../models/api/midi-message";
import {PianoChartAdapter} from "../models/piano-chart/piano-chart-adapter";
import {MidiNote} from "../models/midi-note";
import {WebsocketService} from "../websocket.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-piano',
  templateUrl: './piano.component.html',
  styleUrls: ['./piano.component.scss']
})
export class PianoComponent implements OnInit, OnDestroy {
  private _pianoChartAdapter: PianoChartAdapter | undefined;
  private _websocketSubscription: Subscription | undefined;

  constructor(private websocketService: WebsocketService) {}

  ngOnInit(): void {
    this.initializePiano();
    this.initializeWebSocket();
  }

  ngOnDestroy(): void {
    if (this._websocketSubscription){
      this._websocketSubscription.unsubscribe();
    }
  }

  get pianoChartAdapter() : PianoChartAdapter {
    if (!this._pianoChartAdapter) {
      throw new Error();
    }
    return this._pianoChartAdapter;
  }

  private initializePiano(): void {
    const pianoContainer = document.getElementById('pianoContainer');
    if (pianoContainer) {
      const instrument = new Instrument(pianoContainer, {
        startOctave: 0,
        startNote: "A",
        endOctave: 8,
        endNote: "C",
        showNoteNames: "never",
        keyPressStyle: "vivid"
      });
      instrument.create();
      console.log(instrument);
      this._pianoChartAdapter = new PianoChartAdapter(instrument);
    }
    else {
      throw new Error('could not find piano container element')
    }
  }

  private initializeWebSocket(): void {
    this._websocketSubscription = this.websocketService.websocketSubject.subscribe((messageEvent) => {
      if (messageEvent.data) {
        const midiMessage: MidiMessage = JSON.parse(messageEvent.data);
        console.log(midiMessage)

        if (midiMessage.type === 'note_on') {
          this.pianoChartAdapter.keyDown(new MidiNote(midiMessage.note))
        }
        if (midiMessage.type === 'note_off') {
          this.pianoChartAdapter.keyUp(new MidiNote(midiMessage.note))
        }
      }
    });
  }


}
