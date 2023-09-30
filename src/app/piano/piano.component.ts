import {Component, OnInit} from '@angular/core';
import { Instrument } from "piano-chart";
import { environment } from "../../environments/environment";

@Component({
  selector: 'app-piano',
  templateUrl: './piano.component.html',
  styleUrls: ['./piano.component.scss']
})
export class PianoComponent implements OnInit {
  private piano: Instrument | undefined;
  private webSocket: WebSocket | undefined

  ngOnInit(): void {
    this.initializePiano();
    this.initializeWebSocket();
  }

  private initializePiano(): void {
    const pianoContainer = document.getElementById('pianoContainer');
    if (pianoContainer) {
      this.piano = new Instrument(pianoContainer);
      this.piano.create();

      // this.piano.keyDown("D4");
      // this.piano.keyDown("F#4");
      // this.piano.keyDown("A4");

    }
    else {
      throw new Error('could not find piano container element')
    }
  }

  private initializeWebSocket(): void {
    try {
      this.webSocket = new WebSocket((environment as any).websocketUrl);

      // Function to handle incoming messages
      this.webSocket.onmessage = function(event) {
        console.log(event)
      };

      // Function to handle WebSocket connection opened
      this.webSocket.onopen = function(event) {
        console.log('Connected to WebSocket server');
      };

      // Function to handle WebSocket errors
      this.webSocket.onerror = function(error) {
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
