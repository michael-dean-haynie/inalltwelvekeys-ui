import {Injectable, OnDestroy} from '@angular/core';
import {Piano} from "@tonejs/piano";
import {MessageDto} from "../models/api/message-dto";
import {Message} from "webmidi3";
import {first, from, map, Observable, of, Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PlaybackService implements OnDestroy {

  private piano: Piano = new Piano({
    // velocities: 5
  });
  private scheduledMessageTimeouts: number[] = [];
  private _playing = false;

  private progressUpdatesInterval: number = 0;

  constructor() { }

  ngOnDestroy(): void {
    this.clearScheduledMessageTimeouts();
  }

  public get pianoLoaded(): boolean {
    return this.piano.loaded;
  }

  public get playing(): boolean {
    return this._playing;
  }

  public playMessages(totalMessages: MessageDto[], startFromProgressPoint: number = 0): Observable<number> {
    return new Observable<number>((subscriber) => {
      this.loadPiano().then(() => {
        this.stopPlayingMessages();


        const firstTimestamp = totalMessages[0].timestamp;
        const lastTimestamp = totalMessages[totalMessages.length - 1].timestamp
        const totalDuration = lastTimestamp - firstTimestamp;

        const msToStartPlayingFrom = (totalDuration * startFromProgressPoint);
        let indexOfFirstMessageToPlay = 0;
        for (let i = 0; i < totalMessages.length; i++) {
          const msAfterFirst = totalMessages[i].timestamp - firstTimestamp;
          if (msAfterFirst >= msToStartPlayingFrom) {
            indexOfFirstMessageToPlay = i;
            break;
          }
        }

        const messagesToPlay = totalMessages.slice(indexOfFirstMessageToPlay)
        const firstTsToPlay = messagesToPlay[0].timestamp;

        let finalTimeoutDelay = firstTsToPlay;
        for (let message of messagesToPlay) {
          const timeoutDelay = message.timestamp - firstTsToPlay;
          finalTimeoutDelay = timeoutDelay;
          this.scheduledMessageTimeouts.push(window.setTimeout(() => {
            this.playMessage(message)
          }, timeoutDelay))
        }

        const playStart = Date.now();
        this._playing = true;

        this.progressUpdatesInterval = window.setInterval(() => {
          const progress = (Date.now() - (playStart - msToStartPlayingFrom)) / totalDuration;
          if (progress < 1) {
            subscriber.next(progress);
          }
          else {
            subscriber.next(1); // complete
            subscriber.next(0); // reset
            this.stopPlayingMessages();
          }
        }, 100)

      });

      const thiz = this;
      return function unsubscribe() {
        thiz.stopPlayingMessages();
      };
    });
  }

  public stopPlayingMessages(): void {
    if (this._playing) {
      this.clearScheduledMessageTimeouts();
      window.clearInterval(this.progressUpdatesInterval);

      this.piano.stopAll();
      this._playing = false;
    }
  }

  private playMessage(msgDto: MessageDto): void {
    const wmMsg = new Message(new Uint8Array([msgDto.byte1, msgDto.byte2, msgDto.byte3]));
    const midiNoteNumber = wmMsg.data[1].toString();
    const midiNoteVelocity = Number((wmMsg.data[2] / 127).toFixed(3)); // convert to value between 0-1 rounded to 3 decimal places
    if (wmMsg.type === 'noteon') {
      this.piano.keyDown({ note: midiNoteNumber, velocity: midiNoteVelocity});
    }
    if (wmMsg.type === 'noteoff') {
      this.piano.keyUp({ note: midiNoteNumber, velocity: midiNoteVelocity});
    }
    if (wmMsg.type === 'controlchange') {

      const channel = wmMsg.data[0];
      const controlNumber = wmMsg.data[1];
      const valueNumber = wmMsg.data[2];

      if (controlNumber === 64 && channel === 176) { // damper pedal on/off (sustain)
        if (valueNumber <= 63) {
          this.piano.pedalUp();
        }
        else if (valueNumber >= 64) {
          this.piano.pedalDown();
        }
      }
    }
  }

  private async loadPiano(): Promise<void> {
    if (!this.pianoLoaded) {
      console.log('loading piano...');
      await this.piano.load()
      this.piano.toDestination();
      console.log('piano loaded');
    }
  }

  private clearScheduledMessageTimeouts(): void {
    for (let id of this.scheduledMessageTimeouts) {
      clearTimeout(id);
    }
  }
}
