import { Component } from '@angular/core';
import { environment } from "../environments/environment";
import {WebsocketService} from "./websocket.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = `inalltwelvekeys-ui (${(environment as any).name})`;

  constructor(private websocketService: WebsocketService) {
    websocketService.websocketSubject.subscribe({
      next(msgEvent) {
        console.log("Subscription A: ", msgEvent);
      }
    });
    websocketService.websocketSubject.subscribe({
      next(msgEvent) {
        console.log("Subscription B: ", msgEvent);
      }
    });
  }

}
