import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {context} from "tone";
import {MessageDto} from "../../models/api/message-dto";
import {TimestampRange} from "../../models/timestamp-range";
import {MessageClientService} from "../../services/clients/message-client.service";
import {Subscription} from "rxjs";
import {Message} from "webmidi3";

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

  public canvasWidth = 600;

  public canvasHeight = 100;

  public msgDtos: MessageDto[] = [];

  private ctx!: CanvasRenderingContext2D;

  private subscriptions: Subscription[] = [];

  // number of bars to display (width wise) on the wave form
  private noOfBars = 100;

  constructor(private messageClient: MessageClientService) {
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (this.timestampRange) {
      this.subscriptions.push(
        this.messageClient.getSegment(this.timestampRange.start, this.timestampRange.end)
          .subscribe(msgDtos => {
            this.msgDtos = msgDtos;
            this.buildWaveForm();
          }));
    }
  }

  public ngAfterViewInit(): void {
    const contextResult = this.canvas.nativeElement.getContext('2d');
    if (!contextResult) {
      throw new Error('unable to get canvas context');
    }
    this.ctx = contextResult;

    // this.ctx.fillStyle = "rgb(200, 0, 0)";
    // this.ctx.fillRect(10, 10, 50, 50);
    //
    // this.ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
    // this.ctx.fillRect(30, 30, 50, 50);
  }

  public ngOnDestroy(): void {
    for (let subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  private buildWaveForm(): void {
    if (!this.timestampRange) {
      throw new Error('timestampRange is falsy');
    }

    const duration = this.timestampRange.end - this.timestampRange.start;
    const barMsWidth = duration / this.noOfBars;
    const barMagnitudes = new Array(100).fill(0);
    for (let msgDto of this.msgDtos) {
      const wmMsg = new Message(new Uint8Array([msgDto.byte1, msgDto.byte2, msgDto.byte3]));
      if (wmMsg.type === 'noteon'){
        const msFromStart = msgDto.timestamp - this.timestampRange.start;
        const barIndex = Math.floor((msFromStart / duration) * 100);
        barMagnitudes[barIndex]++;
      }
    }

    const barPxWidth = this.canvasWidth / this.noOfBars;
    for (const [index, barMagnitude] of barMagnitudes.entries()) {
      this.ctx.fillStyle = "rgb(200, 0, 0)";
      this.ctx.fillRect(index * barPxWidth, 0, barPxWidth, barMagnitude * 10);
    }

  }

}