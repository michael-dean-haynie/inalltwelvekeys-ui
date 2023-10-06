import { Injectable } from '@angular/core';
import {NoteMessageEvent, WebMidi} from "webmidi";
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class WebmidiService {
  readonly noteMessageEventSubject: Subject<NoteMessageEvent> = new Subject<NoteMessageEvent>();

  constructor() {
    this.initialize().then(_ => _);
  }

  private async initialize(): Promise<void> {

    // window.navigator.requestMIDIAccess().then(
    //   (access) => {
    //     document.body.innerHTML += `<div>we got midi access</div>`
    //   },
    //   (reason) => {
    //     document.body.innerHTML += `<div>we did not got midi access</div>`
    //     document.body.innerHTML += `<div>${reason}</div>`
    //     document.body.innerHTML += `<div>${JSON.stringify(reason)}</div>`
    //   }
    // );
    //
    // window.navigator.permissions.query({name: "midi"} as unknown as PermissionDescriptor).then((result) => {
    //   if (result.state === "granted") {
    //     document.body.innerHTML += `<div>access granted</div>`
    //     // Access granted.
    //   } else if (result.state === "prompt") {
    //     // Using API will prompt for permission
    //     document.body.innerHTML += `<div>api will prompt</div>`
    //   }
    //   // Permission was denied by user prompt or permission policy
    //   document.body.innerHTML += `<div>permission was denied</div>`
    // });
    //
    //
    // document.body.innerHTML += `<div>typeof requestMIDIAccess: ${typeof window.navigator.requestMIDIAccess}</div>`
    // if (!!window.navigator.requestMIDIAccess) {
    //   document.body.innerHTML += `<div>requestMIDIAccess is a thing</div>`
    //   document.body.innerHTML += `<div>typeof requestMIDIAccess: ${typeof window.navigator.requestMIDIAccess}</div>`
    // } else {
    //   document.body.innerHTML += `<div>requestMIDIAccess is not a thing</div>`
    // }
    var midiAccess = null;
    var midiInputs = null;
    var midiOutputs = null;

    function setup() {
      var messagelog = document.body;
      if (window.navigator.requestMIDIAccess) {
        window.navigator.requestMIDIAccess().then( success, function() { messagelog.innerHTML += "requestMIDIAccess() failed."; });
      } else {
        messagelog.innerHTML += "Web MIDI API is not available on your browser.\n";
      }

      function setupEventHandler() {
        var inputs = null;
        if (typeof midiAccess.inputs === "function") {
          inputs = midiAccess.inputs();
        } else {
          var iter = midiAccess.inputs.values();
          inputs = [];
          for (var o = iter.next(); !o.done; o = iter.next()) {
            inputs.push(o.value);
          }
        }
        for (var port = 0; port < inputs.length; port++) {
          var str = "input port:" + port + ", name: " + inputs[port].name;
          var messagelog = document.getElementById('messagelog');
          messagelog.innerHTML += str + "\n";

          (function () {
            var _port = port;
            inputs[_port].onmidimessage = function (event) {
              var str = "port:" + _port + " "; // + ", receivedTime:" + event.receivedTime.toFixed(2) + ", ";
              for (var i = 0; i < event.data.length; i++) {
                str += event.data[i].toString(16) + " ";
              }

              var messagelog = document.getElementById('messagelog');
              messagelog.innerHTML += str + "\n";
              messagelog.scrollTop = messagelog.scrollHeight;
            };

            inputs[_port].ondisconnect = function (event) {
              var str = "input port:" + _port + ", disconnected.";
              var messagelog = document.getElementById('messagelog');
              messagelog.innerHTML += str + "\n";
            };
          }());
        }

        var outputs = null;
        if (typeof midiAccess.outputs === "function") {
          outputs = midiAccess.outputs();
        } else {
          var iter = midiAccess.outputs.values();
          outputs = [];
          for (var o = iter.next(); !o.done; o = iter.next()) {
            outputs.push(o.value);
          }
        }
        for (var port = 0; port < outputs.length; port++) {
          (function () {
            var _port = port;
            outputs[_port].ondisconnect = function (event) {
              var str = "output port:" + _port + ", disconnected.";
              var messagelog = document.getElementById('messagelog');
              messagelog.innerHTML += str + "\n";
            };
          }());
        }

        midiInputs = inputs;
        midiOutputs = outputs;
      }

      function success(access) {
        midiAccess = access;

        midiAccess.onconnect = function (event) {
          var str = "port: " + event.port.name + ", connected.";
          var messagelog = document.getElementById('messagelog');
          messagelog.innerHTML += str + "\n";

          setupEventHandler();
        }

        setupEventHandler();
      }
    }

    function noteOn() {
      if (typeof midiAccess.outputs === "function") {
        var outputs = midiAccess.outputs();
        for (var i = 0; i < outputs.length; i++) {
          var output = outputs[i];
          output.send( [0x90, 60, 0x40] , window.performance.now() );
        }
      } else {
        var iter = midiAccess.outputs.values();
        for (var o = iter.next(); !o.done; o = iter.next()) {
          o.value.send( [0x90, 60, 0x40] , window.performance.now() );
        }
      }
    }

    function noteOff() {
      if (typeof midiAccess.outputs === "function") {
        var outputs = midiAccess.outputs();
        for (var i = 0; i < outputs.length; i++) {
          var output = outputs[i];
          output.send( [0x80, 60, 0x00] , window.performance.now() );
        }
      } else {
        var iter = midiAccess.outputs.values();
        for (var o = iter.next(); !o.done; o = iter.next()) {
          o.value.send( [0x80, 60, 0x00] , window.performance.now() );
        }
      }
    }

    function clearLog() {
      document.getElementById("messagelog").innerHTML = "";
    }

    setup();

    // await WebMidi.enable();
    // for (let input of WebMidi.inputs) {
    //   const noteOnListener = input.addListener("noteon", noteMessageEvent => {
    //     this.noteMessageEventSubject.next(noteMessageEvent);
    //   });
    //   const noteOffListener = input.addListener("noteoff", noteMessageEvent => {
    //     this.noteMessageEventSubject.next(noteMessageEvent);
    //   });
    // }
  }
}
