export interface MidiMessage {
  bytes?: number[];
  type?: string;
  time?: number;
  note?: number;
  velocity?: number;
  channel?: number;
}
