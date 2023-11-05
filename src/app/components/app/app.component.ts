import { Component } from '@angular/core';
import { environment } from "../../../environments/environment";
import {WebsocketService} from "../../services/websocket.service";
import {Accidental, Accidentals, NoteLetter, NoteLetters} from "../../models/notation";
import {WebmidiService} from "../../services/webmidi.service";
import {ToastService} from "../../services/toast.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = `inalltwelvekeys-ui (${(environment as any).name})`;

  constructor() {}
}
