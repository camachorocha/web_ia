const ALLOWED_ORIGIN = 'https://camachorocha.github.io';

module.exports = function handler(request, response) {
  const origin = request.headers.origin;
  if (origin === ALLOWED_ORIGIN) response.setHeader('Access-Control-Allow-Origin', origin);
  response.setHeader('Vary', 'Origin');
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed' });
  return response.status(200).json({ status: 'ok' });
};
