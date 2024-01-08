/**
 * Represents a MIDI message in api calls with the backend
 */
export interface MessageDto {
  id: number,
  byte1: number,
  byte2: number,
  byte3: number,
  timestamp: number
}
