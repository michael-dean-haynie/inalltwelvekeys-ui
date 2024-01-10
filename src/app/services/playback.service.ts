import {Injectable, OnDestroy} from '@angular/core';
import {Piano} from "@tonejs/piano";
import {MessageDto} from "../models/api/message-dto";
import {Message} from "webmidi3";
import {Subject} from "rxjs";

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
  public progressUpdates: Subject<number>= new Subject<number>();

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

  public async playMessages(messages: MessageDto[]): Promise<void> {
    await this.loadPiano();

    const playStart = Date.now();
    const firstTimestamp = messages[0].timestamp;
    const lastTimestamp = messages[messages.length - 1].timestamp
    this._playing = true;

    let finalTimeoutDelay = firstTimestamp;
    for (let message of messages) {
      const timeoutDelay = message.timestamp - firstTimestamp;
      finalTimeoutDelay = timeoutDelay;
      this.scheduledMessageTimeouts.push(window.setTimeout(() => {
        this.playMessage(message)
      }, timeoutDelay))
    }

    const duration = lastTimestamp - firstTimestamp;
    this.progressUpdatesInterval = window.setInterval(() => {
      this.progressUpdates.next(((Date.now() - playStart) / duration) * 100);
    }, 100)

    this.scheduledMessageTimeouts.push(window.setTimeout(() => {
      this.stopPlayingMessages();
    }, finalTimeoutDelay))
  }

  public stopPlayingMessages(): void {
    if (this._playing) {
      this.clearScheduledMessageTimeouts();
      window.clearInterval(this.progressUpdatesInterval);
      this.progressUpdates.next(0);
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
