import {Component, OnDestroy, OnInit} from '@angular/core';
import {MidiMessageService} from "../../services/midi-message.service";
import {Subscription} from "rxjs";
import { Piano } from '@tonejs/piano'
import {Message} from "webmidi3";
import {start} from "tone";

interface TimestampedMessage {
  message: Message,
  timestamp: number
}

@Component({
  selector: 'app-midi-test',
  templateUrl: './midi-test.component.html',
  styleUrls: ['./midi-test.component.scss']
})
export class MidiTestComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  private timestampedMessages: TimestampedMessage[] = [];
  public piano: Piano = new Piano({
    // velocities: 5
  });
  public pianoLoaded = false;
  private scheduledMessageTimeouts: number[] = [];

  constructor(
    private midiMessageService: MidiMessageService
  ) {}

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    for (let subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
    this.clearScheduledMessageTimeouts();
  }

  initializeAudioContext(): void {
    // audio context won't load before user gesture? https://developer.chrome.com/blog/autoplay/#webaudio
    this.piano = new Piano({
      // velocities: 5
    });

    // connect it to the speaker output
    this.piano.toDestination();

    this.piano.load().then(() => {
      console.log('loaded!');
      this.pianoLoaded = true;
      // this.piano.context.on('tick', () => {
      //   this.ticks = this.piano.context.transport["_clock"].ticks;
      // })
      // this.piano.context.resume()

      // console.log('piano._strings', this.piano["_strings"]);
      // console.log('piano._strings._strings', this.piano["_strings"]["_strings"]);
      // const samplers = this.piano["_strings"]["_strings"].map((pianoString: any)  => pianoString.output);
      // console.log('samplers', samplers);
      // for (let sampler of samplers) {
      //   sampler.sync();
      // }

      this.subscriptions.push(this.midiMessageService.midiMessageSubject.subscribe(message => {
        this.timestampedMessages.push({ message, timestamp: Date.now()})
        console.log(this.timestampedMessages.at(-1));
        console.log(this.piano?.context.transport.state);

        this.scheduleMessageToPlay(message);
      }));
    });
  }

  startOld(): void {
    this.piano.context.transport.cancel();
    // this.piano.context.transport.stop();
    this.piano.context.transport.start()
    if (this.timestampedMessages.length) {
     const playStart = this.timestampedMessages[0].timestamp;
      for (let timestampedMessage of this.timestampedMessages) {
        const delayInSeconds = (timestampedMessage.timestamp - playStart) / 1000;
        this.scheduleMessageToPlay(timestampedMessage.message, delayInSeconds);
      }
    }
  }

  start(): void {
    if (this.timestampedMessages.length) {
      const playStart = this.timestampedMessages[0].timestamp;
      for (let timestampedMessage of this.timestampedMessages) {
        const delay = (timestampedMessage.timestamp - playStart)
        this.scheduledMessageTimeouts.push(window.setTimeout(() => {
          this.scheduleMessageToPlay(timestampedMessage.message)
        }, delay));
      }
    }
  }

  async pause(): Promise<void> {
    // await this.piano.context.rawContext['suspend'](Infinity);
    this.piano.context.transport.pause();
  }

  resume(): void {
    this.piano.context.transport.start();
  }

  stopOld(): void {
    this.piano.context.transport.cancel();
    // this.piano.context.transport.stop();
  }

  stop(): void {
    this.clearScheduledMessageTimeouts();
    this.piano.stopAll();
  }

  private scheduleMessageToPlay(message: Message, delayInSeconds = 0) {
    const time = this.getTime(delayInSeconds);
    const midiNoteNumber = message.data[1].toString();
    const midiNoteVelocity = Number((message.data[2] / 127).toFixed(3)); // convert to value between 0-1 rounded to 3 decimal places
    if (message.type === 'noteon') {
      this.piano.keyDown({ note: midiNoteNumber, velocity: midiNoteVelocity, time});
    }
    if (message.type === 'noteoff') {
      this.piano.keyUp({ note: midiNoteNumber, velocity: midiNoteVelocity, time});
    }
    if (message.type === 'controlchange') {

      const channel = message.data[0];
      const controlNumber = message.data[1];
      const valueNumber = message.data[2];

      if (controlNumber === 64 && channel === 176) { // damper pedal on/off (sustain)
        if (valueNumber <= 63) {
          this.piano.pedalUp({ time });
        }
        else if (valueNumber >= 64) {
          this.piano.pedalDown({ time });
        }
      }
    }
  }

  private getTime(delayInSeconds: number) {
    if (delayInSeconds === 0) {
      return this.piano.immediate();
    }
    else {
      console.log('delay was' + `+${delayInSeconds}`);
      return `+${delayInSeconds}`;
    }
  }

  private clearScheduledMessageTimeouts(): void {
    for (let id of this.scheduledMessageTimeouts) {
      clearTimeout(id);
    }
  }

}
