import {Component, OnDestroy, OnInit} from '@angular/core';
import {MidiMessageService} from "../../services/midi-message.service";
import {Subscription} from "rxjs";
import { Piano } from '@tonejs/piano'

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


  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    for (let subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  enableAudio(): void {
    // audio context won't load before user gesture? https://developer.chrome.com/blog/autoplay/#webaudio
    this.helloWorld();
  }

  private helloWorld(): void {
    // create the piano and load 5 velocity steps
    const piano = new Piano({
      // velocities: 5
    });

    // connect it to the speaker output
    piano.toDestination();

    piano.load().then(() => {
      console.log('loaded!');

      this.subscriptions.push(this.midiMessageService.midiMessageSubject.subscribe(message => {
        console.log(message);
        const midiNoteNumber = message.data[1].toString();
        const midiNoteVelocity = Number((message.data[2] / 127).toFixed(3)); // convert to value between 0-1 rounded to 3 decimal places
        if (message.type === 'noteon') {
          // this.handleNoteOnMidiEvent(midiNoteNumber);
          piano.keyDown({ note: midiNoteNumber, velocity: midiNoteVelocity });
        }
        if (message.type === 'noteoff') {
          // this.handleNoteOffMidiEvent(midiNoteNumber);
          piano.keyUp({ note: midiNoteNumber, velocity: midiNoteVelocity });
        }
        if (message.type === 'controlchange') {

          const channel = message.data[0];
          const controlNumber = message.data[1];
          const valueNumber = message.data[2];

          if (controlNumber === 64 && channel === 176) { // damper pedal on/off (sustain)
            if (valueNumber <= 63) {
              piano.pedalUp();
            }
            else if (valueNumber >= 64) {
              piano.pedalDown();
            }
          }
        }
      }));
    });
  }

}
