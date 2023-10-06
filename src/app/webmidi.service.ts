import { Injectable } from '@angular/core';
import {WebMidi} from "webmidi";

@Injectable({
  providedIn: 'root'
})
export class WebmidiService {

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    await WebMidi.enable();
    for (let input of WebMidi.inputs) {
      console.log(input.manufacturer, input.name);
    }
  }
}
