import {Exercise} from "../../models/api/exercise";

export abstract class ExerciseEngine {

  protected constructor(
    protected readonly exercise: Exercise,
    protected readonly keySequence: string[]
  ) {
  }
}

/**
 * What are the inputs and outputs for this?
 *
 * -------------------------------------------------------
 * INPUTS:
 * The real-time engine will be initialized with:
 *  - the exercise
 *  - the key sequence
 *
 *  ... and then in real time it will receive
 *  - midi inputs from the user
 *  - forward/backward commands from the user
 *
 *  The simulating engine will be initialized with:
 *  - the exercise
 *  - the key sequence
 *  - the recorded midi events from the user
 *  - the recorded forward/backward commands from the user
 *
 *
 * -------------------------------------------------------
 *  OUTPUTS:
 *  The real-time engine needs to drive the ui:
 *  - show progress for the beats sequence and the keys sequence
 *  - show the next prompt when needed
 *  - make available all the breakdown/analytics data
 *
 *  -------------------------------------------------
 *  Plan:
 *  I think I'll use inheritance for this.
 *  The realtime and simulated engines will extend the abstract engine.
 *  The abstract engine will do all the state-crunching in a temporally agnostic way
 *    - The realtime engine would feed the protected abstract methods realtime timestamps/offsets
 *    - The simulated engine would feed the same methods the recorded timestamps/offsets
 *
 *  The base class will be like a state machine that the derived classes can drive and interrogate however they need.
 */
