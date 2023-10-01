import {Component, OnInit} from '@angular/core';
import {environment} from "../../environments/environment";
import {MidiMessage} from "../models/api/midi-message";
import {VexFlowAdapter} from "../models/vex-flow/vex-flow-adapter";

@Component({
  selector: 'app-stave',
  templateUrl: './stave.component.html',
  styleUrls: ['./stave.component.scss']
})
export class StaveComponent implements OnInit{
  private _vexFlowAdapter: VexFlowAdapter | undefined;
  private _webSocket: WebSocket | undefined;

  ngOnInit(): void {
    this.initializeVexFlowAdapter();
    this.initializeWebSocket();
  }

  get vexFlowAdapter() : VexFlowAdapter {
    if (!this._vexFlowAdapter) {
      throw new Error();
    }
    return this._vexFlowAdapter;
  }

  get webSocket() : WebSocket {
    if (!this._webSocket) {
      throw new Error();
    }
    return this._webSocket;
  }

  private initializeVexFlowAdapter(): void {
    this._vexFlowAdapter = new VexFlowAdapter('vexFlowContainer');
  }

  private initializeWebSocket(): void {
    try {
      this._webSocket = new WebSocket((environment as any).websocketUrl);

      // Function to handle incoming messages
      this.webSocket.onmessage = (event) => {
        if (event.data) {
          const midiMessage: MidiMessage = JSON.parse(event.data);
          console.log(midiMessage)

          if (['note_on', 'note_off'].includes(midiMessage.type)) {
            this.vexFlowAdapter.update(midiMessage)
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
