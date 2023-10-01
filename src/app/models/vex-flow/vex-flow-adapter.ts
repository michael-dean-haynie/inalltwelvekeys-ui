import {Factory, FactoryOptions, StaveConnector, Vex} from "vexflow";
import {MidiMessage} from "../api/midi-message";
import {MidiNote} from "../midi-note";
import {PianoKey} from "../piano-key";
import {PitchClass} from "../pitch-class";
import {INoteValue} from "piano-chart";

export class VexFlowAdapter {
  private readonly factoryOptions: FactoryOptions;
  private notes: MidiNote[] = []

  constructor(private containerId: string) {
    this.factoryOptions = {
      renderer: {
        elementId: this.containerId,
        width: 500,
        height: 300
      }
    };

    this.render()
  }

  update(midiMessage: MidiMessage): void {
    if (midiMessage.type === "note_on") {
      const midiNote = new MidiNote(midiMessage.note);
      if (!this.notes.some(note => note.number === midiNote.number)) {
        this.notes.push(midiNote);
      }
    }

    if (midiMessage.type === "note_off") {
      const midiNote = new MidiNote(midiMessage.note);
      this.notes = this.notes.filter(note => note.number !== midiNote.number);
    }

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

    system.addStave({
      voices: [
        score.voice(score.notes(this.trebleLine))
      ]
    }).addClef('treble');

    system.addStave({
      voices: [
        score.voice(score.notes(this.baseLine, {clef: 'bass'})),
      ]
    }).addClef('bass');

    system.addConnector();
    system.addConnector('singleRight');

    vf.draw();
  }

  private get trebleLine(): string {
    const noteNames =  this.notes
      .map(midiNote => new PianoKey(midiNote))
      .filter(pianoKey => pianoKey.octave >= 4 && pianoKey.pitchClass.integerNotation >= 0)
      .map(pianoKey => this.getNoteNameForPitchClass(pianoKey.pitchClass) + pianoKey.octave)
      .join(' ');
    return `(${noteNames})/w`;
  }

  private get baseLine(): string {
    const noteNames =  this.notes
      .map(midiNote => new PianoKey(midiNote))
      .filter(pianoKey => pianoKey.octave < 4)
      .map(pianoKey => this.getNoteNameForPitchClass(pianoKey.pitchClass) + pianoKey.octave)
      .join(' ');
    return `(${noteNames})/w`;
  }

  private getNoteNameForPitchClass(pitchClass: PitchClass) {
    const noteNameMap: string[] = [
      "C",
      "Db",
      "D",
      "Eb",
      "E",
      "F",
      "Gb",
      "G",
      "Ab",
      "A",
      "Bb",
      "B",
    ];
    return noteNameMap[pitchClass.integerNotation];
  }
}


