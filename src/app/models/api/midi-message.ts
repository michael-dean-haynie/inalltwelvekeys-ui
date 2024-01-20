export interface MidiMessage {
  bytes?: number[];
  type?: string;
  timestamp?: number;
  note?: number;
  velocity?: number;
  channel?: number;
}
