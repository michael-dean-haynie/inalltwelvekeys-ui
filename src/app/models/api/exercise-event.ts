export type ExerciseEventType = 'user selected previous key' | 'user selected next key';

export interface ExerciseEvent {
  timestamp: number,
  type: ExerciseEventType
}
