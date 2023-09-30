export interface MidiMessage {
  type: string;
  time: number;
  note: number;
  velocity: number;
  channel: number;
}
