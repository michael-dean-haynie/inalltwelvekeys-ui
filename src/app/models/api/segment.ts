/**
 * A segment of midi messages stored in the db
 */
export interface Segment {
  segStartId: number,
  segStartTimestamp: number,
  segEndId: number,
  segEndTimestamp: number,
  segDuration: number,
  keystrokes: number,
}
