const ALLOWED_ORIGIN = 'https://camachorocha.github.io';

function applyCors(request, response) {
  const origin = request.headers.origin;

  if (origin === ALLOWED_ORIGIN) {
    response.setHeader('Access-Control-Allow-Origin', origin);
  }

  response.setHeader('Vary', 'Origin');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async function handler(request, response) {
  applyCors(request, response);

  if (request.method === 'OPTIONS') {
    return response.status(204).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).json({
      error: 'Method not allowed'
    });
  }

  const message =
    typeof request.body?.message === 'string'
      ? request.body.message.trim()
      : '';

  if (!message) {
    return response.status(400).json({
      error: 'Message is required'
    });
  }

  if (!process.env.GEMINI_API_KEY) {
    return response.status(500).json({
      error: 'GEMINI_API_KEY is not configured'
    });
  }

  try {
    const geminiResponse = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/interactions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          model: 'gemini-3.6-flash',
          input: message,
          system_instruction:
            'Eres M1 IA, la asesora premium de M1 Garrage. Responde siempre en español, de forma amable, concisa y útil. No inventes vehículos disponibles ni afirmes que los autos de demostración están a la venta. Para disponibilidad, indica que debe confirmarse con M1 Garrage.'
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();

      console.error(
        'Gemini API error:',
        geminiResponse.status,
        errorText
      );

      return response.status(502).json({
        error: `Gemini API error ${geminiResponse.status}`
      });
    }

    const result = await geminiResponse.json();

    const reply =
      result.output
        ?.filter((item) => item.type === 'text')
        ?.map((item) => item.text || '')
        ?.join('')
        ?.trim() ||
      result.output_text?.trim();

    if (!reply) {
      console.error(
        'Gemini returned an empty response:',
        result
      );

      return response.status(502).json({
        error: 'Gemini returned an empty response'
      });
    }

    return response.status(200).json({
      reply
    });

  } catch (error) {
    console.error(
      'Gemini request failed:',
      error
    );

    return response.status(502).json({
      error: 'Unable to process request'
    });
  }
};
