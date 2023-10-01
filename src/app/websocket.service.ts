import { Injectable } from '@angular/core';
import { Subject } from "rxjs";
import { webSocket} from "rxjs/webSocket";
import {environment} from "../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private readonly _websocketSubject: Subject<MessageEvent>;

  constructor() {
    this._websocketSubject = webSocket<MessageEvent>({
      url: (environment as any).websocketUrl,
      deserializer: (messageEvent) => messageEvent
    });
  }

  get websocketSubject(): Subject<MessageEvent> {
    if (!this._websocketSubject){
      throw new Error();
    }
    return this._websocketSubject;
  }
}
