# Optional natural voice for carey

carey can use a higher-quality generated voice rather than the phone's built-in speech voice. This integration keeps the provider API key on a server, not inside the public GitHub app.

## 1. Create the voice service

1. Create an ElevenLabs account and select two voices you are allowed to use: one for the woman companion and one for the man companion. Copy each voice ID from the provider's voice library.
2. Create a Cloudflare account, open Workers & Pages, and create a Worker named `carey-natural-voice`.
3. Paste `worker.js` into the Worker editor and deploy it once.
4. In the Worker settings, add these **Variables**:
   - `CAREY_ALLOWED_ORIGINS`: comma-separated exact origins, e.g. `https://YOUR-USERNAME.github.io,capacitor://localhost,http://localhost,https://localhost`. Replace the GitHub example with your site's origin. Origins do not include a repository path.
   - `CAREY_VOICE_ID_WOMAN`: the chosen woman voice ID.
   - `CAREY_VOICE_ID_MAN`: the chosen man voice ID.
   - `CAREY_TTS_MODEL`: `eleven_multilingual_v2` (or a model enabled for your account).
5. Add `ELEVENLABS_API_KEY` as a **Secret**, not a plain variable. Never put this key in the app code or in GitHub.
6. Deploy the Worker again. Copy its public HTTPS URL.

## 2. Connect carey to the service

Edit `www/voice-config.js` and set:

```js
window.CAREY_VOICE_ENDPOINT = 'https://YOUR-WORKER-URL.workers.dev';
```

Use the Worker URL only; do not put your API key in this file. Commit the change to GitHub Pages. For an Android APK, rebuild the APK in GitHub Actions after changing the file.

## Notes

- Generated speech is sent to the configured voice provider. Do not send private medical details or other sensitive text unless you are comfortable with the provider's data handling and terms.
- Text-to-speech usage may be billable under the provider's plan. Check current pricing and terms before enabling it.
- The local built-in voice is used as a fallback if the remote service is not configured or temporarily unavailable.
- Configure `CAREY_ALLOWED_ORIGINS` narrowly. CORS is an origin control, not a substitute for provider usage limits or abuse monitoring.
