import {Component, OnDestroy, OnInit} from '@angular/core';
import {MidiMessageService} from "../../services/midi-message.service";
import {Subscription} from "rxjs";
import MidiWriter from 'midi-writer-js';

@Component({
  selector: 'app-midi-test',
  templateUrl: './midi-test.component.html',
  styleUrls: ['./midi-test.component.scss']
})
export class MidiTestComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  constructor(
    private midiMessageService: MidiMessageService
  ) {
    this.subscriptions.push(midiMessageService.midiMessageSubject.subscribe(message => {
      console.log(message);
    }));

  }

  ngOnInit(): void {
    this.helloWorld();
  }

  ngOnDestroy(): void {
    for (let subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  private helloWorld(): void {

    // Start with a new track
    const track = new MidiWriter.Track();

    // Define an instrument (optional):
    track.addEvent(new MidiWriter.ProgramChangeEvent({instrument: 1}));

    // Add some notes:
    const note = new MidiWriter.NoteEvent({pitch: ['C4', 'E4', 'G4'], duration: '4'});
    track.addEvent(note);

    // Generate a data URI
    const write = new MidiWriter.Writer(track);
    console.log(write.dataUri());
  }

}
