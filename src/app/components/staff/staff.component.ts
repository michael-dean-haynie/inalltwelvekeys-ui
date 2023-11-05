import {Component, OnInit} from '@angular/core';
import {VexFlowAdapter} from "../../helpers/vex-flow/vex-flow-adapter";
import {Subscription} from "rxjs";
import {ActiveNotesService} from "../../services/active-notes.service";

@Component({
  selector: 'app-staff',
  templateUrl: './staff.component.html',
  styleUrls: ['./staff.component.scss']
})
export class StaffComponent implements OnInit{
  private _vexFlowAdapter: VexFlowAdapter | undefined;
  private _websocketSubscription: Subscription | undefined;

  constructor(private activeNotesService: ActiveNotesService) {}

  ngOnInit(): void {
    this.initializeVexFlowAdapter();
    this.initializeActiveNotesSubscription();
  }

  ngOnDestroy(): void {
    if (this._websocketSubscription){
      this._websocketSubscription.unsubscribe();
    }
  }

  get vexFlowAdapter() : VexFlowAdapter {
    if (!this._vexFlowAdapter) {
      throw new Error();
    }
    return this._vexFlowAdapter;
  }

  private initializeVexFlowAdapter(): void {
    this._vexFlowAdapter = new VexFlowAdapter('vexFlowContainer');
  }

  private initializeActiveNotesSubscription(): void {
    this._websocketSubscription = this.activeNotesService.activeNotesSubject.subscribe(activeNotes => {
      this.vexFlowAdapter.update(activeNotes)
    });
  }

}
