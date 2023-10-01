import {Factory, FactoryOptions, StaveConnector, Vex, Voice} from "vexflow";
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

    let trebleVoices: Voice[] = []
    console.log('trebleKeys', this.trebleKeys);
    console.log('trebleLine', this.trebleLine);
    if (this.trebleKeys.length) {
      trebleVoices.push(score.voice(score.notes(this.bassLine)));
    }
    system.addStave({
      voices: trebleVoices
    }).addClef('treble');

    const bassVoices: Voice[] = []
    console.log('bassKeys', this.trebleKeys);
    console.log('bassLine', this.bassLine);
    if (this.trebleKeys.length) {
      bassVoices.push(score.voice(score.notes(this.bassLine, {clef: 'bass'})))
    }
    system.addStave({
      voices: bassVoices
    }).addClef('bass');

    system.addConnector();
    system.addConnector('singleRight');

    vf.draw();
  }


  private get trebleKeys(): PianoKey[] {
    return this.notes
      .map(midiNote => new PianoKey(midiNote))
      .filter(pianoKey => pianoKey.octave >= 4 && pianoKey.pitchClass.integerNotation >= 0);
  }

  private get bassKeys(): PianoKey[] {
    return this.notes
      .map(midiNote => new PianoKey(midiNote))
      .filter(pianoKey => pianoKey.octave < 4);
  }

  private get trebleLine(): string {
    const noteNames = this.trebleKeys
      .map(pianoKey => this.getNoteNameForPitchClass(pianoKey.pitchClass) + pianoKey.octave)
      .join(' ');
    return `(${noteNames})/w`;
  }

  private get bassLine(): string {
    const noteNames = this.bassKeys
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


