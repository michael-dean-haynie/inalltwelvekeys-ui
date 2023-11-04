import {Instrument} from "piano-chart";
import {Midi} from "tonal";

export class PianoChartAdapter {
  private activeNotes: number[] = [];

  constructor(private instrument: Instrument) {}

  updateActiveNotes(updatedActiveNotes: number[]){
    for (let activeNote of this.activeNotes) {
      this.instrument.keyUp(Midi.midiToNoteName(activeNote));
    }
    for (let activeNote of updatedActiveNotes) {
      this.instrument.keyDown(Midi.midiToNoteName(activeNote));
    }
    this.activeNotes = [...updatedActiveNotes];
  }
}
