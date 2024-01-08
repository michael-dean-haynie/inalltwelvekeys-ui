import {AfterViewInit, Component, OnDestroy, ViewChild} from '@angular/core';
import {MessageClientService} from "../../services/clients/message-client.service";
import {Subscription} from "rxjs";
import {DatePickerComponent} from "ng2-date-picker";
import * as dayjs from 'dayjs'

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnDestroy, AfterViewInit {
  @ViewChild('dayPicker') datePicker!: DatePickerComponent;

  private subscriptions: Subscription[] = [];

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
    }));
  }

}
