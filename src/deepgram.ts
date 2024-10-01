import EventEmitter from "events";
import dotenv from "dotenv-flow";
import { LiveClient } from "@deepgram/sdk";

dotenv.config();

export class SpeechToTextService extends EventEmitter {
  private live: LiveClient | undefined;

  constructor() {
    super();

    this.on("speechStarted", () => console.log("speechStarted"));
    this.on("transcript", (text) => console.log("transcript", text));
  }

  // connect method is used to block the incoming-call webhook to ensure Deepgram
  // connection is established before the media stream starts.
  // ** This also means this demo can only support one call at a time. **
  public connect = async () => {
    console.log("initializing speech-to-text");
    await new Promise((resolve) =>
      setTimeout(() => {
        resolve(null);
      }, 2000)
    );

    console.log("initialized speech-to-text");
  };

  public disconnect = async () => {
    if (!this.live) return;
    this.live.disconnect();
  };

  // typecast events
  emit = <K extends keyof Events>(event: K, ...args: Parameters<Events[K]>) =>
    super.emit(event, ...args);
  on = <K extends keyof Events>(event: K, listener: Events[K]): this =>
    super.on(event, listener);
}

interface Events {
  speechStarted: () => void;
  transcript: (text: string) => void;
}
