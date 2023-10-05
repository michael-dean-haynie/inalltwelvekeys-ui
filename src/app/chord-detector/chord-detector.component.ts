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
  flats: string[] = [];
  sharps: string[] = [];
  flatsChords: string[] = [];
  sharpsChords: string[] = [];

  constructor(private websocketService: WebsocketService) {
  }

  ngOnInit(): void {
    this.subscriptions.push(this.websocketService.pianoKeysChangesSubject.subscribe(pianoKeys => {
      this.flats = pianoKeys.map(pk => Midi.midiToNoteName(pk.midiNote.number));
      this.sharps = pianoKeys.map(pk => Midi.midiToNoteName(pk.midiNote.number, { sharps: true }));
      this.flatsChords = Chord.detect(this.flats.map(note => Note.pitchClass(note)));
      this.sharpsChords = Chord.detect(this.sharps.map(note => Note.pitchClass(note)));
    }));
  }

  ngOnDestroy(): void {
    for (let subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }
}
