import {Component, OnInit} from '@angular/core';
import {environment} from "../../environments/environment";

@Component({
  selector: 'app-raw-midi',
  templateUrl: './raw-midi.component.html',
  styleUrls: ['./raw-midi.component.scss']
})
export class RawMidiComponent implements OnInit {
  ngOnInit(): void {
    const socket = new WebSocket((environment as any).websocketUrl);

    // Function to handle incoming messages
    socket.onmessage = function(event) {
      // const output = document.getElementById('output');
      // output.innerHTML = `<p>Received: ${event.data}</p>` + output.innerHTML;
      console.log(event)
    };

    // Function to handle WebSocket connection opened
    socket.onopen = function(event) {
      console.log('Connected to WebSocket server');
    };

    // Function to handle WebSocket errors
    socket.onerror = function(error) {
      console.error(`WebSocket error: ${error}`);
    };

    // Function to handle WebSocket connection closure
    socket.onclose = function(event) {
      if (event.wasClean) {
        console.log(`WebSocket connection closed cleanly, code: ${event.code}, reason: ${event.reason}`);
      } else {
        console.error('WebSocket connection abruptly closed');
      }
    };

    console.log(socket)
  }

}
