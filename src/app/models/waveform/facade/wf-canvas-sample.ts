import {FillStyle, PixelMeasurements} from "./wf-canvas-facade";

export type SamplePlayState = 'play' | 'pause'
export type SampleProgressState = 'unplayed' | 'playing' | 'played';
export type SampleHoverState = 'none' | 'on' | 'before' | 'after';

export class WFCanvasSample {

  private playState: SamplePlayState;

  private progressState: SampleProgressState;

  private hoverState: SampleHoverState;

  private progress: number;

  constructor(
    private readonly index: number,
    private readonly magnitude: number,
    private readonly magnitudes: number[],
    private readonly ctx: CanvasRenderingContext2D,
    private readonly pm: PixelMeasurements,
    private readonly sampleCount: number
  ) {
    this.playState = 'pause';
    this.progressState = 'unplayed';
    this.hoverState = 'none';
    this.progress = 0;

    this.paint();
  }

  public onPlayStateChange(playState: SamplePlayState): void {
    if (playState !== this.playState) {
      this.playState = playState;
      this.paint();
    }
  }

  public onProgressChange(progress: number): void {
    if (progress != this.progress) {
      this.progress = progress;
      const progressIndex = this.getSampleIndexByProgress(progress);

      let newProgressState = this.progressState;
      if (this.index > progressIndex) {
        newProgressState = 'unplayed';
      }
      else if (this.index === progressIndex) {
        newProgressState = 'playing';
      }
      else if (this.index < progressIndex) {
        newProgressState = 'played';
      }

      if (newProgressState !== this.progressState) {
        this.progressState = newProgressState;
        this.paint();
      }
      else if (this.progressState === 'playing') {
        this.paint();
      }
    }
  }

  public onHoverChange(mouseEvent: MouseEvent): void {
    let newHoverState = this.hoverState;
    if (mouseEvent.type === 'mouseenter') {
      newHoverState = 'on';
    }
    else if (mouseEvent.type === 'mouseleave') {
      newHoverState = 'none';
    }
    else if (mouseEvent.type === 'mousemove') {
      const rect = this.ctx.canvas.getBoundingClientRect()
      const x = mouseEvent.clientX - rect.left
      const y = mouseEvent.clientY - rect.top

      const isAboveAxis = y < this.pm.top;
      if (isAboveAxis) {
        const sampleIndex = Math.floor(x / this.pm.sample);
        // const sampleMagnitude = this.magnitudes[sampleIndex];
        // const isAboveMagnitude = y < (this.pm.top - Math.floor(sampleMagnitude * this.pm.top));
        // const isHovering = isAboveAxis && !isAboveMagnitude;
        const thisSampleIsBeforeHover = this.index <= sampleIndex;

        newHoverState = thisSampleIsBeforeHover ? 'before' : 'after';
      }
      else {
        newHoverState = 'on';
      }
    }

    if (newHoverState != this.hoverState) {
      this.hoverState = newHoverState;
      this.paint();
    }
  }

  private paint(): void {

    const play_unplayed_top = 'rgb(255, 255, 255)';
    const play_unplayed_bottom = 'rgb(229, 229, 229)';
    const play_played_topOfTop = 'rgb(255, 112, 0)';
    const play_played_bottomOfTop = 'rgb(255, 52, 0)';
    const play_played_bottom = 'rgb(255, 191, 153)';

    const play_unplayed_before = 'rgb(255, 169, 127)';
    const play_played_after_bottomOfTop = 'rgb(255, 154, 128)';
    const play_played_after_topOfTop = 'rgb(255, 181, 128)';

    const pause_unplayed_top = 'rgb(236, 237, 240)';
    const pause_unplayed_bottom = 'rgb(214, 216, 219)';
    const pause_played_topOfTop = 'rgb(236, 122, 50)';
    const pause_played_bottomOfTop = 'rgb(235, 85, 49)';
    const pause_played_bottom = 'rgb(235, 188, 163)';

    //////////////////////////

    // export type SamplePlayState = 'play' | 'pause'
    // export type SampleProgressState = 'unplayed' | 'playing' | 'played';
    // export type SampleHoverState = 'none' | 'before' | 'after';
    const map = new Map([
      [['top',    'play',  'unplayed', 'none'  ].join(' '), play_unplayed_top],
      [['top',    'play',  'unplayed', 'on'    ].join(' '), play_unplayed_top],
      [['top',    'play',  'unplayed', 'before'].join(' '), play_unplayed_before],
      [['top',    'play',  'unplayed', 'after' ].join(' '), play_unplayed_top],
      [['top',    'play',  'playing',  'none'  ].join(' '), 'dofunc'],
      [['top',    'play',  'playing',  'on'    ].join(' '), 'dofunc'],
      [['top',    'play',  'playing',  'before'].join(' '), 'dofunc'],
      [['top',    'play',  'playing',  'after' ].join(' '), 'dofunc'],
      [['top',    'play',  'played',   'none'  ].join(' '), play_played_topOfTop],
      [['top',    'play',  'played',   'on'    ].join(' '), play_played_topOfTop],
      [['top',    'play',  'played',   'before'].join(' '), play_played_topOfTop],
      [['top',    'play',  'played',   'after' ].join(' '), play_played_after_topOfTop],
      [['top',    'pause', 'unplayed', 'none'  ].join(' '), pause_unplayed_top],
      [['top',    'pause', 'unplayed', 'on'    ].join(' '), play_unplayed_top],
      [['top',    'pause', 'unplayed', 'before'].join(' '), play_unplayed_top],
      [['top',    'pause', 'unplayed', 'after' ].join(' '), play_unplayed_top],
      [['top',    'pause', 'playing',  'none'  ].join(' '), 'dofunc'],
      [['top',    'pause', 'playing',  'on'    ].join(' '), 'dofunc'],
      [['top',    'pause', 'playing',  'before'].join(' '), 'dofunc'],
      [['top',    'pause', 'playing',  'after' ].join(' '), 'dofunc'],
      [['top',    'pause', 'played',   'none'  ].join(' '), pause_played_topOfTop],
      [['top',    'pause', 'played',   'on'    ].join(' '), play_played_topOfTop],
      [['top',    'pause', 'played',   'before'].join(' '), play_played_topOfTop],
      [['top',    'pause', 'played',   'after' ].join(' '), play_played_topOfTop],
      [['bottom', 'play',  'unplayed', 'none'  ].join(' '), play_unplayed_bottom],
      [['bottom', 'play',  'unplayed', 'on'    ].join(' '), play_unplayed_bottom],
      [['bottom', 'play',  'unplayed', 'before'].join(' '), play_unplayed_bottom],
      [['bottom', 'play',  'unplayed', 'after' ].join(' '), play_unplayed_bottom],
      [['bottom', 'play',  'playing',  'none'  ].join(' '), play_played_bottom],
      [['bottom', 'play',  'playing',  'on'    ].join(' '), play_played_bottom],
      [['bottom', 'play',  'playing',  'before'].join(' '), play_played_bottom],
      [['bottom', 'play',  'playing',  'after' ].join(' '), play_played_bottom],
      [['bottom', 'play',  'played',   'none'  ].join(' '), play_played_bottom],
      [['bottom', 'play',  'played',   'on'    ].join(' '), play_played_bottom],
      [['bottom', 'play',  'played',   'before'].join(' '), play_played_bottom],
      [['bottom', 'play',  'played',   'after' ].join(' '), play_played_bottom],
      [['bottom', 'pause', 'unplayed', 'none'  ].join(' '), pause_unplayed_bottom],
      [['bottom', 'pause', 'unplayed', 'on'    ].join(' '), play_unplayed_bottom],
      [['bottom', 'pause', 'unplayed', 'before'].join(' '), play_unplayed_bottom],
      [['bottom', 'pause', 'unplayed', 'after' ].join(' '), play_unplayed_bottom],
      [['bottom', 'pause', 'playing',  'none'  ].join(' '), pause_played_bottom],
      [['bottom', 'pause', 'playing',  'on'    ].join(' '), play_played_bottom],
      [['bottom', 'pause', 'playing',  'before'].join(' '), play_played_bottom],
      [['bottom', 'pause', 'playing',  'after' ].join(' '), play_played_bottom],
      [['bottom', 'pause', 'played',   'none'  ].join(' '), pause_played_bottom],
      [['bottom', 'pause', 'played',   'on'    ].join(' '), play_played_bottom],
      [['bottom', 'pause', 'played',   'before'].join(' '), play_played_bottom],
      [['bottom', 'pause', 'played',   'after' ].join(' '), play_played_bottom],
    ]);

    //////////////////////////

    const topMapResult = map.get(['top', this.playState, this.progressState, this.hoverState].join(' '));
    const topStyle = topMapResult === 'dofunc'
      ? this.getPlayingColorByProgress(this.progress)
      : topMapResult;

    const bottomMapResult = map.get(['bottom', this.playState, this.progressState, this.hoverState].join(' '));
    const bottomStyle = bottomMapResult === 'dofunc'
      ? this.getPlayingColorByProgress(this.progress)
      : bottomMapResult;

    if (!topStyle || !bottomStyle) {
      throw new Error();
    }
    this.paintHalfBar(topStyle, 'top');
    this.paintHalfBar(bottomStyle, 'bottom');
  }

  private paintHalfBar(style: FillStyle, half: 'top' | 'bottom' = 'top'): void {
    this.ctx.fillStyle = style;

    // assuming bottom
    const xOffset = (this.pm.sample * this.index) + (this.pm.barGap / 2);
    let yOffset = this.pm.height - this.pm.bottom;
    const width = this.pm.bar;
    let height = Math.floor(this.magnitude * this.pm.bottom);

    // adjust if top
    if (half === 'top') {
      yOffset = this.pm.top;
      height = Math.floor(this.magnitude * this.pm.top) * -1;
    }

    this.ctx.fillRect(xOffset, yOffset, width, height);
  }

  private getSampleIndexByProgress(progress: number): number {
    return Math.floor(this.sampleCount * progress);
  }

  private getPlayingColorByProgress(progress: number): FillStyle {
    const sampleSize = 1 / this.sampleCount;
    const sampleProgress = (progress % sampleSize) / sampleSize;
    const oc = 'rgb(255, 191, 153)';
    const c = 'rgb(255, 84, 0)';
    const c1 = { r: 255, g: 191, b: 153 };
    const c2 = { r: 255, g: 84, b: 0 };

    const r = Math.round(c1.r + (c2.r - c1.r) * sampleProgress);
    const g = Math.round(c1.g + (c2.g - c1.g) * sampleProgress);
    const b = Math.round(c1.b + (c2.b - c1.b) * sampleProgress);
    return `rgb(${r}, ${g}, ${b})`;
  }

  private colors() {
  }

}
