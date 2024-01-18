import {SamplePlayState, WFCanvasSample} from "./wf-canvas-sample";
import {WFPiano} from "../piano/wf-piano";
import {MessageDto} from "../../../models/api/message-dto";

export type FillStyle = string | CanvasGradient | CanvasPattern; // for ctx.fillStyle

export interface PixelMeasurements {
  // the width of a bar (no gap)
  bar: number;

  // the width of a bap between 2 bars, or twice the width of the margin on either side of a bar
  barGap: number;

  // the width of a bar + 1/2 gap on either side
  sample: number;

  // the number of left over pixels (horizontally) after optimizing sample/bar/barGap widths
  excess: number;

  // the height of the gap between the top half and the bottom half of the bars
  axis: number;

  // the height of the top half of the bars
  top: number;

  // the height of the bottom half of the bars
  bottom: number;

  // the width of the canvas
  width: number;

  // the height of the canvas
  height: number;
}

export class WFCanvasFacade {

  public readonly canvas: HTMLCanvasElement;

  public readonly dpr: number;

  // the value to paint and do math with
  private readonly width: number;

  // the value to paint and do math with
  private readonly height: number;

  private readonly samples: WFCanvasSample[];

  private readonly pm: PixelMeasurements;

  constructor(
    private readonly ctx: CanvasRenderingContext2D,
    private readonly msgDtos: MessageDto[]
  ) {
    this.canvas = ctx.canvas;
    this.dpr = window.devicePixelRatio;

    // Get the DPR and size of the canvas
    const rect = this.canvas.getBoundingClientRect();

    // Set the "actual" size of the canvas
    this.canvas.width = rect.width * this.dpr;
    this.canvas.height = rect.height * this.dpr;

    // Scale the context to ensure correct drawing operations
    this.ctx.scale(this.dpr, this.dpr);

    // Set the "drawn" size of the canvas
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;

    // Set the unscaled values the ctx will deal with (they will get scaled up by dpr)
    this.width = rect.width;
    this.height = rect.height;

    this.pm = this.getPixelMeasurements();

    const wfPiano = new WFPiano();
    const magnitudes = wfPiano.simulateWaveForm(this.msgDtos, this.sampleCount);

    this.paintBackground();

    this.samples = [];
    for (const [index, magnitude] of magnitudes.entries()) {
      this.samples[index] = new WFCanvasSample(
        index,
        magnitude,
        magnitudes,
        this.ctx,
        this.pm,
        this.sampleCount);
    }
  }

  get sampleCount() {
    return Math.floor(this.width / this.pm.sample);
  }

  public onPlayStateChange(playState: SamplePlayState): void {
    for (let sample of this.samples) {
      sample.onPlayStateChange(playState);
    }
  }

  public onProgressChange(progress: number): void {
    for (let sample of this.samples) {
      sample.onProgressChange(progress);
    }
  }

  public onHoverChange(mouseEvent: MouseEvent){
    for (let sample of this.samples) {
      sample.onHoverChange(mouseEvent);
    }
  }

  public getClickedSampleIndex(mouseEvent: MouseEvent): number {
    const rect = this.canvas.getBoundingClientRect()
    const x = mouseEvent.clientX - rect.left
    const y = mouseEvent.clientY - rect.top
    return Math.floor(x / this.pm.sample);
  }

  public getClickedProgress(mouseEvent: MouseEvent): number {
    const rect = this.canvas.getBoundingClientRect()
    const x = mouseEvent.clientX - rect.left
    const y = mouseEvent.clientY - rect.top
    return x / (this.pm.width - this.pm.excess)
  }

  public sampleWasClicked(mouseEvent: MouseEvent): boolean {
    const rect = this.canvas.getBoundingClientRect()
    const x = mouseEvent.clientX - rect.left
    const y = mouseEvent.clientY - rect.top
    const isAboveAxis = y < this.pm.top;
    const isOverExcessSpace = y > this.pm.width - this.pm.excess;
    return isAboveAxis && !isOverExcessSpace;
  }

  private getSampleIndexByProgress(progress: number): number {
    return Math.floor(this.sampleCount * progress);
  }

  private paintBackground(){

    // BL: 147, 128, 112, 1
    // TL: 160, 138, 116, 1 <--
    // TR: 117, 102,  89, 1
    // BR: 103,  92,  83, 1 <--

    // empty top bar: 255, 255, 255, 1
    // empty bottom bar: 228, 228, 228, 1
    // filled top bar: 255, 84, 0, 1
    // filled bottom bar: 255, 191, 153, 1

    const gradient = this.ctx.createLinearGradient(0, 0, this.width, this.height);
    // gradient.addColorStop(0, "rgb(160, 138, 116)");
    // gradient.addColorStop(1, "rgb(103, 92, 83)");
    gradient.addColorStop(0, 'rgb(163,167,177)');
    gradient.addColorStop(1, 'rgb(89,94,105)');
    this.ctx.fillStyle = gradient;

    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  private getPixelMeasurements(): PixelMeasurements {
    const bar = 2 // must be even so that barGap can be exactly 1/2 of it

    const barGap = bar / 2;

    const sample = bar + barGap;

    const excess = this.width % sample;

    const axis = barGap;

    const top = (this.height - axis) * (2/3);

    const bottom = (this.height - axis) * (1/3);

    const width = this.width;

    const height = this.height;

    return {
      bar,
      barGap,
      sample,
      excess,
      axis,
      top,
      bottom,
      width,
      height
    };
  }

}
