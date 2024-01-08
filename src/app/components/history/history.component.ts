import {AfterViewInit, Component, OnDestroy, ViewChild} from '@angular/core';
import {MessageClientService} from "../../services/clients/message-client.service";
import {Subscription} from "rxjs";
import {DatePickerComponent} from "ng2-date-picker";
import * as dayjs from 'dayjs'
import {Segment} from "../../models/api/segment";

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnDestroy, AfterViewInit {
  @ViewChild('dayPicker') datePicker!: DatePickerComponent;

  private subscriptions: Subscription[] = [];

  public segments: Segment[] = [];

  constructor(private messageClient: MessageClientService) {}

  ngAfterViewInit(): void {
    const today = dayjs(Date.now()).startOf('day')
    this.datePicker.writeValue(today);
  }

  ngOnDestroy(): void {
    for (let subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

  dpChange(event: any): void {
    const date = event['$d'] as Date;
    const start = date.toISOString();

    const endDate = new Date(start);
    endDate.setDate(new Date(start).getDate() + 1);
    const end = endDate.toISOString();

    console.log('start', start);
    console.log('end', end);

    this.subscriptions.push(this.messageClient.getSegments(start, end).subscribe(sgmts  => {
      console.log('segments', sgmts);
      this.segments = sgmts;
    }));
  }

  playSegment(segment: Segment) {
    this.subscriptions.push(
      this.messageClient.getSegment(segment.segStartTimestamp, segment.segEndTimestamp)
        .subscribe(msgs  => {
          console.log('messages', msgs);
    }));
  }

  displayTime(timestamp: number): string {
    return dayjs(timestamp).format('HH:mm:ss');
  }

  displayDuration(duration: number) {
    const seconds = Math.floor((duration / 1000) % 60);
    const minutes = Math.floor((duration / (1000 * 60)) % 60);
    const hours = Math.floor(duration / (1000 * 60 * 60));

    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }

}
