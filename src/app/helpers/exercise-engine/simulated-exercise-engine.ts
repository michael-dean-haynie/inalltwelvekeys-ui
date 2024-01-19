import {ExerciseEngine} from "./exercise-engine";
import {Exercise} from "../../models/api/exercise";
import {MessageDto} from "../../models/api/message-dto";
import {ExerciseEvent} from "../../models/api/exercise-event";

export class SimulatedExerciseEngine extends ExerciseEngine {

  constructor(exercise: Exercise, keySequence: string[]) {
    super(exercise, keySequence);
  }

  public simulate(messageDtos: MessageDto[], exerciseEvents: ExerciseEvent[]): void {
    let mi = 0; // messageDtos index
    let ei = 0; // exerciseEvents index

    // iterate as long as either array still has elements to iterate through
    while (mi < messageDtos.length || ei < exerciseEvents.length) {
      const nextMessage = mi < messageDtos.length ? messageDtos[mi] : null;
      const nextEvent = ei < exerciseEvents.length ? exerciseEvents[ei] : null;

      // if both arrays still have elements - pick the earliest one
      if (nextMessage && nextEvent) {
        if (nextMessage.timestamp < nextEvent.timestamp) {
          this.simulateMessage(nextMessage);
          mi++;
        } else {
          this.simulateEvent(nextEvent)
          ei++;
        }
      }

      // else if there are just messages left, pick the message
      else if (nextMessage) {
        this.simulateMessage(nextMessage);
        mi++;
      }

      // else if there are just events left, pick the event
      else if (nextEvent) {
        this.simulateEvent(nextEvent)
        ei++;
      }
    }
  }

  private simulateMessage(messageDto: MessageDto): void {
    console.log('simulating', {messageDto});
  }

  private simulateEvent(exerciseEvent: ExerciseEvent): void {
    console.log('simulating', {exerciseEvent});
  }
}
