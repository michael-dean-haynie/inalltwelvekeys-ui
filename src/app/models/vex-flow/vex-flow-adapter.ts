import {Factory, FactoryOptions, StaveConnector, Vex, Voice} from "vexflow";
import {MidiMessage} from "../api/midi-message";
import {MidiNote} from "../midi-note";
import {PianoKey} from "../piano-key";
import {PitchClass} from "../pitch-class";
import {INoteValue} from "piano-chart";
import {Midi, Note} from "tonal";

export class VexFlowAdapter {
  private readonly factoryOptions: FactoryOptions;
  private activeNotes: number[] = [];

  constructor(private containerId: string) {
    this.factoryOptions = {
      renderer: {
        elementId: this.containerId,
        width: 500,
        height: 600
      }
    };

    this.render()
  }

  update(activeNotes: number[]): void {
    this.activeNotes = [...activeNotes];
    this.render();
  }

  render(): void {
    const container = document.getElementById(this.containerId);
    if (container){
      container.innerHTML = '';
    }
    else {
      throw new Error();
    }

    const vf = new Vex.Flow.Factory(this.factoryOptions);
    const score = vf.EasyScore({

    });
    const system = vf.System({
      spaceBetweenStaves: 8,
      autoWidth: false,
      noJustification: true,
      width: 100,
    });

    let trebleVoices: Voice[] = []
    if (this.trebleNotes.length) {
      trebleVoices.push(score.voice(score.notes(this.trebleLine)));
    }
    system.addStave({
      voices: trebleVoices,
      options: {
        space_above_staff_ln: 20
      }
    }).addClef('treble');

    const bassVoices: Voice[] = []
    if (this.bassNotes.length) {
      bassVoices.push(score.voice(score.notes(this.bassLine, {clef: 'bass'})))
    }
    system.addStave({
      voices: bassVoices,
      options: {
        space_above_staff_ln: 20
      }
    }).addClef('bass');

    system.addConnector();
    system.addConnector('singleRight');

    vf.draw();
  }


  private get trebleNotes(): string[] {
    return this.activeNotes
      .map(activeNote => Note.get(Midi.midiToNoteName(activeNote)))
      .filter(note => (note.oct || 0) >= 4)
      .map(note => note.name);
  }

  private get bassNotes(): string[] {
    return this.activeNotes
      .map(activeNote => Note.get(Midi.midiToNoteName(activeNote)))
      .filter(note => (note.oct || 0) < 4)
      .map(note => note.name);
  }

  private get trebleLine(): string {
    if (this.trebleNotes.length === 1) {
      return `${this.trebleNotes.join(' ')}/w`
    }
    return `(${this.trebleNotes.join('')})/w`;
  }

  private get bassLine(): string {
    if (this.bassNotes.length === 1) {
      return `${this.bassNotes.join(' ')}/w`
    }
    return `(${this.bassNotes.join('')})/w`;
  }

}


