export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) {
      return res.status(500).json({ error: 'Webhook URL not configured' });
    }

    const upstream = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const text = await upstream.text().catch(() => '');
    if (!upstream.ok) {
      return res.status(upstream.status).send(text || 'Upstream error');
    }
    return res.status(200).send(text || 'ok');
  } catch (e) {
    console.error('Proxy error:', e);
    return res.status(500).json({ error: e?.message || 'Proxy error' });
  }
}
