import {
  AfterViewInit, ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy, OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {context} from "tone";
import {MessageDto} from "../../models/api/message-dto";
import {TimestampRange} from "../../models/timestamp-range";
import {MessageClientService} from "../../services/clients/message-client.service";
import {Subscription} from "rxjs";
import {Message} from "webmidi3";
import {WFPiano} from "../../models/waveform/piano/wf-piano";
import {PlaybackService} from "../../services/playback.service";
import {cover, contain} from 'intrinsic-scale';
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

  public canvasHeight = 0;

  public canvasWidth = 0;

  private _ctx?: CanvasRenderingContext2D;

  private subscriptions: Subscription[] = [];

  private playing: boolean;

  private playbackProgressSubscription: Subscription;

  private _cvFacade?: WFCanvasFacade;

  constructor(
    private messageClient: MessageClientService,
    private playbackService: PlaybackService,
    private changeDetectorRef: ChangeDetectorRef

  ) {
    this.msgDtos = [];
    this.playing = false;
    this.playbackProgressSubscription = new Subscription(); // probably sloppy
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

  private buildWaveForm(): void {
    this._cvFacade = new WFCanvasFacade(this.ctx, this.msgDtos);

  }

  public canvasClicked(event: MouseEvent) {
    if (!this.playing){
      this.playbackProgressSubscription = this.playbackService.playMessages(this.msgDtos).subscribe({
        next: (progress) => {
          this.cvFacade.onProgressChange(progress);
        },
        complete: () => {
          console.log('complete handler called');
          this.playing = false;
          this.cvFacade.onPlayStateChange('pause');
        },
        error: () => {
          console.log('error handler called');
          this.playing = false;
          this.cvFacade.onPlayStateChange('pause');
        }

      });
      this.subscriptions.push(this.playbackProgressSubscription);
      this.playing = true;
      this.cvFacade.onPlayStateChange('play');
    }
    else if (this.playing) {
      this.playbackProgressSubscription.unsubscribe();
      this.playing = false;
      this.cvFacade.onPlayStateChange('pause');
    }
  }

  public mouseMoved(mouseEvent: MouseEvent) {
    this.cvFacade.onHoverChange(mouseEvent);
    // const rect = this.canvas.nativeElement.getBoundingClientRect()
    // const x = event.clientX - rect.left
    // const y = event.clientY - rect.top
    // console.log("x: " + x + " y: " + y)
  }

}
