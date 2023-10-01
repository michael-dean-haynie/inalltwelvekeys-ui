import {Component, OnInit} from '@angular/core';
import { Instrument } from "piano-chart";
import { environment } from "../../environments/environment";
import { MidiMessage} from "../models/api/midi-message";
import {PianoChartAdapter} from "../models/piano-chart/piano-chart-adapter";
import {MidiNote} from "../models/midi-note";

@Component({
  selector: 'app-piano',
  templateUrl: './piano.component.html',
  styleUrls: ['./piano.component.scss']
})
export class PianoComponent implements OnInit {
  private pianoChartAdapter: PianoChartAdapter
  private webSocket: WebSocket | undefined

  ngOnInit(): void {
    this.initializePiano();
    this.initializeWebSocket();
  }

  private initializePiano(): void {
    const pianoContainer = document.getElementById('pianoContainer');
    if (pianoContainer) {
      const instrument = new Instrument(pianoContainer, {
        startOctave: 0,
        startNote: "A",
        endOctave: 8,
        endNote: "C",
        showNoteNames: "never"
      });
      this.pianoChartAdapter = new PianoChartAdapter(instrument);
      console.log(instrument);
    }
    else {
      throw new Error('could not find piano container element')
    }
  }

  private initializeWebSocket(): void {
    try {
      this.webSocket = new WebSocket((environment as any).websocketUrl);

      // Function to handle incoming messages
      this.webSocket.onmessage = (event) => {
        if (event.data) {
          const midiMessage: MidiMessage = JSON.parse(event.data);
          console.log(midiMessage)

          if (midiMessage.type === 'note_on') {
            this.pianoChartAdapter.keyDown(new MidiNote(midiMessage.note))
          }
          if (midiMessage.type === 'note_off') {
            this.pianoChartAdapter.keyUp(new MidiNote(midiMessage.note))
          }
        }
      };

      // Function to handle WebSocket connection opened
      this.webSocket.onopen = (event) => {
        console.log('Connected to WebSocket server');
      };

      // Function to handle WebSocket errors
      this.webSocket.onerror = (error) => {
        console.error(`WebSocket error: ${error}`);
      };

      // Function to handle WebSocket connection closure
      this.webSocket.onclose = function(event) {
        if (event.wasClean) {
          console.log(`WebSocket connection closed cleanly, code: ${event.code}, reason: ${event.reason}`);
        } else {
          console.error('WebSocket connection abruptly closed');
        }
      };

    }
    catch (e) {
      throw e;
    }
  }


}
