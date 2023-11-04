import { Component } from '@angular/core';
import { environment } from "../environments/environment";
import {WebsocketService} from "./websocket.service";
import {Accidental, Accidentals, NoteLetter, NoteLetters} from "./models/notation";
import {WebmidiService} from "./webmidi.service";
import {ToastService} from "./toast.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = `inalltwelvekeys-ui (${(environment as any).name})`;

  constructor(
    private toastService: ToastService,
    private websocketService: WebsocketService
  ) {
    document.onvisibilitychange = () => {
      if (document.visibilityState === 'visible') {
        toastService.createToast({ heading: 'Welcome Back', message: 'Reconnecting ...'})
        websocketService.reConnect();
      }
    };
  }
}
