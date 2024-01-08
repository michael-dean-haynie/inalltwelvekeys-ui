import {Component, OnDestroy} from '@angular/core';
import {MessageClientService} from "../../services/clients/message-client.service";
import {Subscription} from "rxjs";
import {Segment} from "../../models/api/segment";

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnDestroy{

  private subscriptions: Subscription[] = [];

  constructor(private messageClient: MessageClientService) {}

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
