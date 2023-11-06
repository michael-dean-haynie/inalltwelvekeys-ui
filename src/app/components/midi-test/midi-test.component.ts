import {Component, OnDestroy} from '@angular/core';
import {MidiMessageService} from "../../services/midi-message.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-midi-test',
  templateUrl: './midi-test.component.html',
  styleUrls: ['./midi-test.component.scss']
})
export class MidiTestComponent implements OnDestroy {
  private subscriptions: Subscription[] = [];

  constructor(
    private midiMessageService: MidiMessageService
  ) {
    this.subscriptions.push(midiMessageService.midiMessageSubject.subscribe(message => {
      console.log(message);
    }));
  }

  ngOnDestroy(): void {
    for (let subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }

}
