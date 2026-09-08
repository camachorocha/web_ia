const ALLOWED_ORIGIN = 'https://camachorocha.github.io';

function applyCors(request, response) {
  const origin = request.headers.origin;
  if (origin === ALLOWED_ORIGIN) response.setHeader('Access-Control-Allow-Origin', origin);
  response.setHeader('Vary', 'Origin');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function getResponseText(result) {
  if (typeof result.output_text === 'string' && result.output_text.trim()) return result.output_text.trim();
  return result.output?.flatMap((item) => item.content || []).filter((item) => item.type === 'output_text').map((item) => item.text).join('').trim();
}

module.exports = async function handler(request, response) {
  applyCors(request, response);
  if (request.method === 'OPTIONS') return response.status(204).end();
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' });
  const message = typeof request.body?.message === 'string' ? request.body.message.trim() : '';
  if (!message) return response.status(400).json({ error: 'Message is required' });
  if (!process.env.OPENAI_API_KEY) return response.status(500).json({ error: 'Service unavailable' });

  try {
    const openaiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-5.6-luna',
        instructions: 'Eres M1 IA, la asesora premium de M1 Garrage. Responde siempre en español, de forma amable, concisa y útil. No inventes vehículos disponibles ni afirmes que los autos de demostración están a la venta. Para disponibilidad, indica que debe confirmarse con M1 Garrage.',
        input: message
      })
    });
    if (!openaiResponse.ok) throw new Error('OpenAI request failed');
    const result = await openaiResponse.json();
    const reply = getResponseText(result);
    if (!reply) throw new Error('Empty OpenAI response');
    return response.status(200).json({ reply });
  } catch {
    return response.status(502).json({ error: 'Unable to process request' });
  }
};
