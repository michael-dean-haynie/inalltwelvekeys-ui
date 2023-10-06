import {Component, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {WebsocketService} from "../websocket.service";
import {MidiMessage} from "../models/api/midi-message";

@Component({
  selector: 'app-raw-midi',
  templateUrl: './raw-midi.component.html',
  styleUrls: ['./raw-midi.component.scss']
})
export class RawMidiComponent implements OnInit {
  private _websocketSubscription: Subscription | undefined;
  websocketMessages: string[] = []

  constructor(private websocketService: WebsocketService) {}

  ngOnInit(): void {
    this._websocketSubscription = this.websocketService.messageEventSubject.subscribe((messageEvent) => {
      if (messageEvent.data) {
       this.websocketMessages.unshift(messageEvent.data);
      }
    });
  }

  ngOnDestroy(): void {
    if (this._websocketSubscription){
      this._websocketSubscription.unsubscribe();
    }
  }

}
