import { Component } from '@angular/core';
import { environment } from "../environments/environment";
import {WebsocketService} from "./websocket.service";
import {Accidental, Accidentals, NoteLetter, NoteLetters} from "./models/notation";
import {WebmidiService} from "./webmidi.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = `inalltwelvekeys-ui (${(environment as any).name})`;

  // force websocket to initialize
  // force webmidi to initialize
  constructor(
    private websocketService: WebsocketService,
    private webmidiService: WebmidiService
  ) {
  }

  private testTypes(param: Accidental) {
    console.log(param);
  }

}
