import {Message} from "webmidi3";

export interface TimestampedMessage{
  timestamp: number
  message: Message
}
