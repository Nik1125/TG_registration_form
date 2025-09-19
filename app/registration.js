export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const webhookUrl = process.env.N8N_WEBHOOK_URL; // секрет в Vercel env
    const webhookToken = process.env.N8N_WEBHOOK_TOKEN; // опционально

    if (!webhookUrl) {
      return res.status(500).json({ error: 'Webhook URL not configured' });
    }

    const headers = { 'Content-Type': 'application/json' };
    if (webhookToken) headers['X-Webhook-Token'] = webhookToken;

    const upstream = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(req.body),
    });

    const text = await upstream.text(); // n8n может вернуть что угодно
    if (!upstream.ok) {
      return res.status(upstream.status).send(text || 'Upstream error');
    }
    return res.status(200).send(text || 'ok');
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Proxy error' });
  }
}
