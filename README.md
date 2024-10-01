# Twilio Media Streams to Deepgram Real-Time Transcription

This repository demonstrates how to connect Twilio Media Streams to Deepgram to generate real-time transcripts of voice calls. These transcripts can be leveraged for various use cases, such as connecting voice calls to text-based LLMs, performing real-time analysis of calls, and empowering agents with live recommendations.

The app is built using TypeScript and creates an Express server to manage incoming Twilio Voice webhooks and a WebSocket endpoint that handles Twilio's media stream packets (audio). These audio packets are sent to Deepgram to be transcribed in real time.

# How it Works

- The `/incoming-call` endpoint responds to Twilio's incoming call webhook with the [TwiML noun `<Stream/>`](https://www.twilio.com/docs/voice/twiml/stream)
- Twilio establishes a websocket connection with the app and begins sending audio packets.
- Audio packets are forwarded to [Deepgram's Text-to-Speech Streaming](https://developers.deepgram.com/docs/tts-websocket) service.
- Deepgram processes the audio and emits the transcript back to the app asynchronously via events published back to the app.
- The real-time transcript can be used for a variety of purposes, such as feeding into LLMs, powering real-time analytics, or giving live feedback to agents.

# Prerequisites

- Node.js and npm (or yarn)
- [Twilio account](https://www.twilio.com/try-twilio) with a [phone number](https://help.twilio.com/articles/223135247-How-to-Search-for-and-Buy-a-Twilio-Phone-Number-from-Console)
- [Deepgram API Key](https://console.deepgram.com/signup)
- [nGrok installed globally](https://ngrok.com/docs/getting-started/), if you want to run it locally

# Get Started

### 1. Clone Repo

```bash
git clone https://github.com/your-username/twilio-deepgram-transcription
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Add Environment Variables

```bash
DEEPGRAM_API_KEY=your-deepgram-api-key
```

```bash
HOSTNAME=your-private-ngrok-domain

or

HOSTNAME=your-deployment-host
```

### 4. Run the App

- <b>Start the development server</b>: This command will start the Express server which handles incoming Twilio webhook requests and media streams.

```bash
npm run dev
```

- <b>Expose your local server using nGrok</b> (if using nGrok)

```bash
npm run grok
```

### 5. Configure Twilio Phone Number Webhooks

Go to your [Twilio Console](https://console.twilio.com/) and configure the Voice webhooks for your Twilio phone number:

- <b>Incoming Call Webhook</b>: Select `POST` and set url to: https://your-ngrok-domain.ngrok.io/incoming-call
- <b>Call Status Update Webhook</b>: Select `POST` and set url to: https://your-ngrok-domain.ngrok.io/call-status-update
