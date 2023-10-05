import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {WebsocketService} from "../websocket.service";
import {Midi} from "tonal";

@Component({
  selector: 'app-chord-detector',
  templateUrl: './chord-detector.component.html',
  styleUrls: ['./chord-detector.component.scss']
})
export class ChordDetectorComponent implements OnInit, OnDestroy{
  private subscriptions: Subscription[] = []

  constructor(private websocketService: WebsocketService) {
  }

  ngOnInit(): void {
    this.subscriptions.push(this.websocketService.pianoKeysChangesSubject.subscribe(pianoKeys => {
      console.log(pianoKeys.map(pk => Midi.midiToNoteName(pk.midiNote.number)))
    }));
  }

  ngOnDestroy(): void {
    for (let subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }
}
