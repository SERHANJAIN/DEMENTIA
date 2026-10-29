const jsonHeaders = { 'Content-Type': 'application/json; charset=utf-8' };

function corsFor(origin, allowedOrigins) {
  const allowed = String(allowedOrigins || '').split(',').map(x => x.trim()).filter(Boolean);
  if (!origin || !allowed.includes(origin)) return null;
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}
function jsonError(message, status, cors = {}) {
  return new Response(JSON.stringify({ error: message }), { status, headers: { ...jsonHeaders, ...cors, 'Cache-Control': 'no-store' } });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = corsFor(origin, env.CAREY_ALLOWED_ORIGINS);
    if (!cors) return jsonError('This app origin is not allowed. Configure CAREY_ALLOWED_ORIGINS for your hosted app and Capacitor origins.', 403);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'POST') return jsonError('Use POST for speech generation.', 405, cors);

    let payload;
    try { payload = await request.json(); } catch { return jsonError('The request body must be JSON.', 400, cors); }
    const text = String(payload.text || '').trim();
    const gender = payload.gender === 'man' ? 'man' : 'woman';
    if (!text) return jsonError('Please provide text to speak.', 400, cors);
    if (text.length > 1800) return jsonError('Please keep each spoken message under 1,800 characters.', 413, cors);
    if (!env.ELEVENLABS_API_KEY) return jsonError('The server-side voice key is not configured.', 503, cors);
    const voiceId = gender === 'man' ? env.CAREY_VOICE_ID_MAN : env.CAREY_VOICE_ID_WOMAN;
    if (!voiceId) return jsonError(`The ${gender} voice ID has not been configured.`, 503, cors);

    const modelId = String(env.CAREY_TTS_MODEL || 'eleven_multilingual_v2');
    let upstream;
    try {
      upstream = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`, {
        method: 'POST',
        headers: { 'xi-api-key': env.ELEVENLABS_API_KEY, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: { stability: 0.56, similarity_boost: 0.78, style: 0.18, use_speaker_boost: true, speed: 0.94 }
        })
      });
    } catch { return jsonError('The voice service could not be reached. Please try again.', 502, cors); }
    if (!upstream.ok) {
      const providerStatus = upstream.status;
      return jsonError(providerStatus === 401 || providerStatus === 403 ? 'The voice provider credentials need checking.' : 'Speech could not be generated right now. Please try again.', 502, cors);
    }
    return new Response(upstream.body, { status: 200, headers: { ...cors, 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
  }
};
