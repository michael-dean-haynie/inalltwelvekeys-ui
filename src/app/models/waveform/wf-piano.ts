import {WFString, WFStringOptions} from "./wf-string";
import {MessageDto} from "../api/message-dto";
import {Message} from "webmidi3";
import {WFPedal} from "./wf-pedal";

export type WFPianoOptions = WFStringOptions & {
  /**
   * The number of vertical bars showing volume to divide the waveform into.
   */
  barCount: number;

  multipleNoteVolumeBackoff: number;
} ;

export class WFPiano {

  private readonly pedal: WFPedal;

  private readonly stringMap: Map<number, WFString>;

  private readonly options: WFPianoOptions;

  private msgDtos: MessageDto[];

  private simTs: number;

  private startTs: number;

  private endTs: number;

  private duration: number;

  private barMs: number;

  private msgsCursor: number;

  constructor(options: Partial<WFPianoOptions> = {}) {
    this.options = Object.assign(WFPiano.getDefaultOptions(), options);

    this.pedal = { isDown: false };

    // initialize a map of 88 strings, keyed by their midi numbers (21 - 108)
    this.stringMap = new Map<number, WFString>();
    for (let i = 21; i <= 108; i++) {
      this.stringMap.set(i, new WFString(this.pedal, { decayRate: this.options.decayRate }));
    }

    this.msgDtos = [];
    this.simTs = 0;
    this.startTs = 0;
    this.endTs = 0;
    this.duration = 0;
    this.barMs = 0
    this.msgsCursor = 0;

  }

  public get configuration(): WFPianoOptions {
    return this.options;
  }

  public static getDefaultOptions(): WFPianoOptions {
    return {
      barCount: 100,
      multipleNoteVolumeBackoff: .55,
      ...WFString.getDefaultOptions()
    };
  }

  public simulateWaveForm(msgDtos: MessageDto[]): number[] {
    if (!msgDtos || !msgDtos.length) {
      return [];
    }
    this.msgDtos = msgDtos;

    this.reset();

    this.startTs = msgDtos[0].timestamp;
    this.endTs = this.msgDtos[this.msgDtos.length - 1].timestamp;
    this.duration = this.endTs - this.startTs;
    this.barMs = this.duration / this.options.barCount;

    const barMagnitudes = new Array(this.options.barCount).fill(0);

    this.simTs = this.startTs;
    for (let barIndex = 0; barIndex < this.options.barCount; barIndex++) {
      this.progressToTimestamp(this.getBarEndTs(barIndex));
      barMagnitudes[barIndex] = this.getMagnitude();
    }

    return barMagnitudes;
  }

  private getMagnitude() {
    const volumes = [...this.stringMap.values()]
      .map(wfString => wfString.volume);
    volumes.sort();
    volumes.reverse();

    // exponential backoff for successive notes adding volume
    return volumes.reduce((acc, curr, idx) => {
      const volumeReducer = this.options.multipleNoteVolumeBackoff ** idx;
      return acc + (curr * volumeReducer);
    }, 0);
  }

  private progressToTimestamp(timestamp: number): void {
    // progress through midi messages
    while(this.getNextMsg().timestamp <= timestamp) {
      const msg = this.getNextMsg();
      this.msgsCursor++;
      this.simulateMsg(msg);
    }

    // finally progress to the target timestamp
    const remainingMs = timestamp - this.simTs;
    for (const [midiNumber, wfString] of this.stringMap.entries()) {
      wfString.progressMs(remainingMs);
    }
    this.simTs = timestamp;
  }

  private simulateMsg(msgDto: MessageDto) {
    // update automatically decaying strings
    const msToSimulate = msgDto.timestamp - this.simTs;
    for (const [midiNumber, wfString] of this.stringMap.entries()) {
      wfString.progressMs(msToSimulate);
    }

    // apply msg (possibly overwriting decayed update)
    const wmMsg = this.getWebMidiMessage(msgDto);
    if (wmMsg.type === 'noteon'){
      const [midiNote, velocity] = wmMsg.dataBytes;
      const wfString = this.stringMap.get(midiNote);
      if (wfString) {
        wfString.noteOn(velocity);
      }
    }
    else if (wmMsg.type === 'noteoff') {
      const [midiNote, velocity] = wmMsg.dataBytes;
      const wfString = this.stringMap.get(midiNote);
      if (wfString) {
        wfString.noteOff(velocity);
      }
    }
    else if (wmMsg.type === 'controlchange') {

      const [channel, controlNumber, valueNumber] = wmMsg.data

      if (controlNumber === 64 && channel === 176) {
        // update pedal state
        let pedalChanged = false;
        if (valueNumber <= 63) {
          this.pedal.isDown = false;
          pedalChanged = true;
        }
        else if (valueNumber >= 64) {
          this.pedal.isDown = true;
          pedalChanged = true;
        }

        // trigger strings to react to pedal change
        if (pedalChanged){
          for (const [midiNumber, wfString] of this.stringMap.entries()) {
            wfString.pedalChanged();
          }
        }
      }
    }

    this.simTs = msgDto.timestamp;
  }

  private getNextMsg(): MessageDto {
    return this.msgDtos[this.msgsCursor + 1];
  }

  private getBarEndTs(barIndex: number): number {
    return this.startTs + (this.barMs * barIndex);
  }

  private getWebMidiMessage(msgDto: MessageDto): Message {
    return new Message(new Uint8Array([msgDto.byte1, msgDto.byte2, msgDto.byte3]));
  }

  private reset(): void {
    // TODO
  }
}
