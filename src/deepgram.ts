import dotenv from "dotenv-flow";
import EventEmitter from "events";
import {
  LiveClient,
  LiveTranscriptionEvents,
  type LiveTranscriptionEvent,
  createClient,
  UtteranceEndEvent,
} from "@deepgram/sdk";

dotenv.config();

const emitter = new EventEmitter() as TypedEmitter<{
  speechStarted: () => void;
  draftTranscript: (text: string) => void;
  finalTranscript: (text: string, fullText: string[]) => void;
}>;
interface TypedEmitter<T extends { [K in keyof T]: (...args: any[]) => any }> {
  on<K extends keyof T>(event: K, listener: T[K]): void;
  emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>): boolean;
}

let liveClient: LiveClient | null = null;

let transcriptChunks: LiveTranscriptionEvent[] = [];
let transcripts: string[] = [];

const connectToDeepgram = async () => {
  if (liveClient)
    throw Error(
      `There is already a Deepgram connection established but this demo is limited to \
      a single Deepgram connection because Deepgram's trial API only allows one connection.`
    );

  transcriptChunks = [];
  transcripts = [];

  const deepgram = createClient(process.env.DEEPGRAM_API_KEY, {});

  liveClient = deepgram.listen.live({
    language: "en",

    encoding: "mulaw",
    interim_results: true,
    model: "nova-2",
    punctuate: true,

    sample_rate: 8000,
    utterance_end_ms: 1000,

    vad_events: true, // Voice Activity Detection enables alternate event types, such as SpeechStarted
    smart_format: true,
    endpointing: 1000,
  });

  liveClient.on(LiveTranscriptionEvents.Transcript, onTranscript);
  liveClient.on(LiveTranscriptionEvents.UtteranceEnd, onUtteranceEnd);

  liveClient.on(LiveTranscriptionEvents.Open, () => {
    liveClient?.keepAlive();
  });

  liveClient.on(LiveTranscriptionEvents.Close, () => {
    liveClient = null; // allow re-initialization after closing
  });
};

function onTranscript(transcript: LiveTranscriptionEvent) {
  if (!transcript.channel.alternatives[0].words.length) return;
  if (!transcriptChunks.length) emitter.emit("speechStarted");

  transcriptChunks.push(transcript);
  emitter.emit(
    "draftTranscript",
    transcript.channel.alternatives[0].transcript
  );
}

function onUtteranceEnd(event: UtteranceEndEvent) {
  let text = "";
  for (const transcript of [...transcriptChunks]) {
    if (transcript.start > event.last_word_end) break;

    if (transcript.is_final)
      text += transcript.channel.alternatives[0].transcript + " ";

    transcriptChunks.shift();
  }

  transcripts.push(text);
  if (text) emitter.emit("finalTranscript", text, transcripts);
}

/**
 * Send the payload to Deepgram
 * @param {String} audio A base64 MULAW/8000 audio stream, see https://www.twilio.com/docs/voice/media-streams/websocket-messages
 */
const sendAudio = (audio: string) => {
  if (liveClient && liveClient.getReadyState() === 1) {
    liveClient.send(Buffer.from(audio, "base64"));
  }
};

const speechToText = {
  connectToDeepgram,
  sendAudio,
  on: emitter.on.bind(emitter),
};

export default speechToText;
