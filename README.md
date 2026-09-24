# AI Voice Agent — Customer Support

A phone-based AI support agent. Callers dial a real phone number, talk naturally,
and Claude handles the conversation — answering FAQs, staying on policy, and
handing off to a human when needed.

**Stack:** Twilio Voice (phone number + speech-to-text + text-to-speech, built in)
+ Claude (Anthropic API) for understanding and replying + Node.js/Express server.

No extra speech APIs (Deepgram, ElevenLabs, etc.) are required — Twilio's
`<Gather input="speech">` and `<Say>` handle transcription and voice output.

## 1. Prerequisites

- A [Twilio](https://www.twilio.com/try-twilio) account with a phone number
  that supports voice (the trial account works for testing).
- An [Anthropic API key](https://console.anthropic.com/settings/keys).
- Node.js 18+.

## 2. Setup

```bash
cd voice-agent
npm install
cp .env.example .env
# edit .env and paste in your ANTHROPIC_API_KEY
```

## 3. Customize the agent

Edit `config/businessConfig.js`:
- `businessName`, `greeting`, `hours`
- `faqs` — add as many Q&A pairs as you want the agent to know
- `escalationPhoneNumber` — set a real number to transfer tricky calls to a
  human live; leave blank to just have the agent say a human will follow up
- `escalationTriggers` — describe (in plain English) the situations that
  should trigger a handoff

No other code changes are needed for basic customization.

## 4. Run locally and expose it

```bash
node server.js
```

In a separate terminal, expose your local server to the internet (Twilio
needs a public URL to send webhooks to):

```bash
npx ngrok http 3000
```

Copy the `https://...ngrok...` URL it gives you.

## 5. Connect Twilio to your server

1. In the [Twilio Console](https://console.twilio.com), go to
   **Phone Numbers → Manage → Active Numbers** and click your number.
2. Under **Voice Configuration**, set "A call comes in" to:
   - **Webhook**, method **HTTP POST**
   - URL: `https://<your-ngrok-url>/voice`
3. (Optional) Set "Call status changes" webhook to `https://<your-ngrok-url>/status`
   so finished calls clean up properly.
4. Save.

Call your Twilio number — the agent should answer.

## 6. Outbound calling (agent calls someone)

By default the agent only *answers* calls. To have it *place* calls too:

1. In `.env`, fill in `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` and
   `TWILIO_PHONE_NUMBER` (all found on your [Twilio Console](https://console.twilio.com)
   dashboard), plus `BASE_URL` — your server's public URL (the ngrok URL while
   testing, or your real domain once deployed).
2. Make sure `server.js` is running and reachable at that `BASE_URL`.
3. Trigger a call:

   ```bash
   node call-now.js +923001234567
   ```

   or call the endpoint directly:

   ```bash
   curl -X POST http://localhost:3000/make-call \
     -H "Content-Type: application/json" \
     -d '{"to": "+923001234567"}'
   ```

The recipient's phone will ring; once they answer, Twilio fetches `/voice`
from your server and the same Claude-powered conversation flow kicks in —
identical to an inbound call, just initiated by you instead of the caller.

**Note:** On a Twilio trial account, outbound calls only work to phone
numbers you've verified in the Twilio Console (Phone Numbers → Verified
Caller IDs). Upgrade your Twilio account to call any number.

## 7. Deploying for real (beyond testing)

Ngrok URLs are temporary. For production, deploy `server.js` to any Node
host (Render, Railway, Fly.io, an EC2/VPS box, etc.), set the `ANTHROPIC_API_KEY`
environment variable there, and point Twilio's webhook at that permanent URL
instead of ngrok.

For higher call volume, replace the in-memory `conversations` Map in
`server.js` with Redis or a database, since an in-memory Map won't survive
a server restart or work across multiple instances.

## How it works

- `POST /voice` — fires when a call comes in. Greets the caller and starts
  listening.
- `POST /process` — fires every time Twilio finishes transcribing what the
  caller said. Sends the growing conversation to Claude, speaks the reply,
  and either keeps listening, transfers the call, or hangs up.
- The system prompt (built from `businessConfig.js`) tells Claude to keep
  replies short and phone-appropriate, answer from your FAQs, and emit
  `[ESCALATE]` or `[END_CALL]` tokens when it's time to transfer or hang up —
  the server strips these tokens before speaking and acts on them.

## Costs to expect

- Twilio: per-minute call cost + phone number rental (see Twilio's pricing page)
- Anthropic: per-token cost for each Claude API call (a few cents per call for typical support conversations)
