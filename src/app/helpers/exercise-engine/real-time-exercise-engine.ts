import {ExerciseEngine} from "./exercise-engine";
import {Exercise} from "../../models/api/exercise";
import {TimestampedMessage} from "../../models/timestamped-message";
import {ExerciseEvent, ExerciseEventType} from "../../models/api/exercise-event";

export class RealTimeExerciseEngine extends ExerciseEngine {

  // a timestamp marking the start of the exercise
  private readonly startOfExercise: number;

  constructor(exercise: Exercise, keySequence: string[]) {
    super(exercise, keySequence);

    this.startOfExercise = Date.now();
  }

  public onMessage(tsMessage: TimestampedMessage) {
    const { message, timestamp } = tsMessage;
    this.processMessage(message, timestamp - this.startOfExercise);
  }

  public onEvent(eventType: ExerciseEventType){
    this.processEvent(eventType, Date.now() - this.startOfExercise);
  }
}
