import {
  AfterViewInit, ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {MessageDto} from "../../models/api/message-dto";
import {TimestampRange} from "../../models/timestamp-range";
import {MessageClientService} from "../../services/clients/message-client.service";
import {Subscription} from "rxjs";
import {PlaybackService} from "../../services/playback.service";
import {WFCanvasFacade} from "../../models/waveform/facade/wf-canvas-facade";

@Component({
  selector: 'app-waveform',
  standalone: true,
  imports: [],
  templateUrl: './waveform.component.html',
  styleUrl: './waveform.component.scss'
})
export class WaveformComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input()
  public timestampRange?: TimestampRange;

  @ViewChild('wfCanvas', { static: false })
  public canvas!: ElementRef<HTMLCanvasElement>;

  public msgDtos: MessageDto[];

  private _ctx?: CanvasRenderingContext2D;

  private _cvFacade?: WFCanvasFacade;

  private playing: boolean;

  private latestProgress: number;

  private subscriptions: Subscription[] = [];

  private playbackProgressSubscription: Subscription;

  constructor(
    private messageClient: MessageClientService,
    private playbackService: PlaybackService,
    private changeDetectorRef: ChangeDetectorRef

  ) {
    this.msgDtos = [];
    this.playing = false;
    this.playbackProgressSubscription = new Subscription(); // probably sloppy
    this.latestProgress = 0;
  }

  get cvFacade (): WFCanvasFacade {
    if (!this._cvFacade) {
      throw new Error('cvFacade has not been initialized yet');
    }
    return this._cvFacade;
  }

  get ctx (): CanvasRenderingContext2D {
    if (!this._ctx) {
      throw new Error('ctx has not been initialized yet');
    }
    return this._ctx;
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (this.timestampRange) {
      this.subscriptions.push(
        this.messageClient.getSegment(this.timestampRange.start, this.timestampRange.end)
          .subscribe(msgDtos => {
            this.msgDtos = msgDtos;
            if (this._ctx) {
              this.buildWaveForm();
            }
          }));
    }
  }

  public ngAfterViewInit(): void {
    const contextResult = this.canvas.nativeElement.getContext('2d');
    if (!contextResult) {
      throw new Error('unable to get canvas context');
    }
    this._ctx = contextResult;
    this.buildWaveForm()

    // for editing the dom after this lifecycle hook
    this.changeDetectorRef.detectChanges();
  }

  public ngOnDestroy(): void {
    for (let subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  public canvasClicked(mouseEvent: MouseEvent) {
    if (!this.playing) {
      this.play(this.latestProgress);
    }
    else {
      if (this.cvFacade.sampleWasClicked(mouseEvent)) {
        this.play(this.cvFacade.getClickedProgress(mouseEvent));
      }
      else {
        this.pause();
      }
    }

  }

  public mouseMoved(mouseEvent: MouseEvent) {
    this.cvFacade.onHoverChange(mouseEvent);
  }

  private buildWaveForm(): void {
    this._cvFacade = new WFCanvasFacade(this.ctx, this.msgDtos);
  }

  private play(fromProgress: number = 0): void {
    this.playing = true;

    this.playbackProgressSubscription = this.playbackService.playMessages(this.msgDtos, fromProgress).subscribe({
      next: (progress) => {
        this.cvFacade.onProgressChange(progress);
        this.latestProgress = progress;
      },
      complete: () => {
        console.log('complete handler called');
        this.pause()
      },
      error: () => {
        console.log('error handler called');
        this.pause()
      }

    });

    this.subscriptions.push(this.playbackProgressSubscription);
    this.cvFacade.onPlayStateChange('play');
  }

  private pause(): void {
    this.playbackProgressSubscription.unsubscribe();
    this.playing = false;
    this.cvFacade.onPlayStateChange('pause');
  }
}
