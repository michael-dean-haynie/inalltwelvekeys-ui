import {WFPedal} from "./wf-pedal";

export interface WFStringOptions {
  /**
   * Number of seconds it takes for a full velocity note to decay into silence.
   */
  decayRate: number
}

export class WFString {
  /**
   * A value (0-1) indicating the current volume of the string.
   */
  public volume: number;

  private readonly pedal: WFPedal;

  private readonly options: WFStringOptions;

  private readonly decayPerMs: number;

  private keyIsPressed: boolean;

  constructor(pedal: WFPedal, options: Partial<WFStringOptions> = {}) {
    this.options = Object.assign(WFString.getDefaultOptions(), options);
    this.pedal = pedal;

    this.decayPerMs = 1 / (this.options.decayRate * 1000);
    this.volume = 0;
    this.keyIsPressed = false;
  }

  public static getDefaultOptions(): WFStringOptions {
    return {
      decayRate: 20
    }
  }

  public progressMs(ms: number): void {
    // only decay if the key is un-dampened
    if (!this.isDampened()) {
      this.volume -= (this.decayPerMs * ms);
      if (this.volume < 0) {
        this.volume = 0;
      }
    }
  }

  public noteOn(velocity: number): void {
    this.keyIsPressed = true;
    this.volume = velocity / 255;
  }

  public noteOff(velocity: number): void {
    this.keyIsPressed = false;
    if (this.isDampened()) {
      this.volume = 0;
    }
  }

  public pedalChanged(): void {
    if (this.isDampened()) {
      this.volume = 0;
    }
  }

  private isDampened(): boolean {
    // The key-press and the pedal-down both disengage the damper
    return !(this.keyIsPressed || this.pedal.isDown);
  }

}
