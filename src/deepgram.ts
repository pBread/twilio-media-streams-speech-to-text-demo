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

let liveClient: LiveClient | null = null;

const eventEmitter = new EventEmitter();
const on = <K extends keyof Events>(event: K, listener: Events[K]) => {
  eventEmitter.on(event, listener);
};
const emit = <K extends keyof Events>(
  event: K,
  ...args: Parameters<Events[K]>
) => eventEmitter.emit(event, ...args);

// Define event types
interface Events {
  speechStarted: () => void;
  partialTranscript: (text: string) => void;
  finalTranscript: (text: string) => void;
}

const connectToDeepgram = async () => {
  if (liveClient)
    throw Error(
      `There is already a Deepgram connection established but this demo is limited to \
      a single Deepgram connection because Deepgram's trial API only allows one connection.`
    );

  const deepgram = createClient(process.env.DEEPGRAM_API_KEY, {});

  liveClient = deepgram.listen.live({
    language: "en",
    encoding: "mulaw",
    interim_results: true,
    model: "nova-2",
    punctuate: true,
    sample_rate: 8000,
    utterance_end_ms: 1000,
    vad_events: true,
    smart_format: true,
    endpointing: 1000,
  });

  liveClient.on(LiveTranscriptionEvents.Transcript, onTranscript);
  liveClient.on(LiveTranscriptionEvents.UtteranceEnd, onUtteranceEnd);

  liveClient.on(LiveTranscriptionEvents.Open, () => {
    liveClient?.keepAlive();
  });

  liveClient.on(LiveTranscriptionEvents.Close, () => {
    liveClient = null; // Allow re-initialization after closing
  });
};

let transcripts: LiveTranscriptionEvent[] = [];
function onTranscript(transcript: LiveTranscriptionEvent) {
  if (!transcript.channel.alternatives[0].words.length) return;
  if (!transcripts.length) emit("speechStarted");

  transcripts.push(transcript);
  emit("partialTranscript", transcript.channel.alternatives[0].transcript);
}

function onUtteranceEnd(event: UtteranceEndEvent) {
  let text = "";
  for (const transcript of [...transcripts]) {
    if (transcript.start > event.last_word_end) break;

    if (transcript.is_final)
      text += transcript.channel.alternatives[0].transcript + " ";

    transcripts.shift(); // remove element
  }

  if (text) emit("finalTranscript", text);
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

const speechToText = { connectToDeepgram, sendAudio, on };
export default speechToText;
