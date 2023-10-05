import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {WebsocketService} from "../websocket.service";
import {Chord, Midi, Note} from "tonal";

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
      const asFlats = pianoKeys.map(pk => Midi.midiToNoteName(pk.midiNote.number));
      const asSharps = pianoKeys.map(pk => Midi.midiToNoteName(pk.midiNote.number, { sharps: true }));
      console.log('flats: ', asFlats);
      console.log('sharps: ', asSharps);
      console.log('flatsChords: ', Chord.detect(asFlats.map(note => Note.pitchClass(note))));
      console.log('sharpsChords: ', Chord.detect(asSharps.map(note => Note.pitchClass(note))));

    }));
  }

  ngOnDestroy(): void {
    for (let subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }
}
