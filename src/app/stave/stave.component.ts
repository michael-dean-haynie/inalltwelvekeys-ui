import {Component, OnInit} from '@angular/core';
import {MidiMessage} from "../models/api/midi-message";
import {VexFlowAdapter} from "../models/vex-flow/vex-flow-adapter";
import {WebsocketService} from "../websocket.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-stave',
  templateUrl: './stave.component.html',
  styleUrls: ['./stave.component.scss']
})
export class StaveComponent implements OnInit{
  private _vexFlowAdapter: VexFlowAdapter | undefined;
  private _websocketSubscription: Subscription | undefined;

  constructor(private websocketService: WebsocketService) {}

  ngOnInit(): void {
    this.initializeVexFlowAdapter();
    this.initializeWebSocket();
  }

  ngOnDestroy(): void {
    if (this._websocketSubscription){
      this._websocketSubscription.unsubscribe();
    }
  }

  get vexFlowAdapter() : VexFlowAdapter {
    if (!this._vexFlowAdapter) {
      throw new Error();
    }
    return this._vexFlowAdapter;
  }

  private initializeVexFlowAdapter(): void {
    this._vexFlowAdapter = new VexFlowAdapter('vexFlowContainer');
  }

  private initializeWebSocket(): void {
    this._websocketSubscription = this.websocketService.websocketSubject.subscribe((messageEvent) => {
      if (messageEvent.data) {
        const midiMessage: MidiMessage = JSON.parse(messageEvent.data);

        if (['note_on', 'note_off'].includes(midiMessage.type)) {
          this.vexFlowAdapter.update(midiMessage)
        }
      }
    });
  }

}
