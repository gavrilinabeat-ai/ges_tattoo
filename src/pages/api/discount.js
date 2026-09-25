export const prerender = false;

export async function POST({ request }) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return new Response(JSON.stringify({ ok: false, error: 'Telegram is not configured on the server.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid request body.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const email = String(data.email ?? '').trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid email.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const lang = data.lang === 'en' ? 'en' : 'ua';
  const sourcePage = String(data.source_page ?? '').trim();
  const utm = data.utm && typeof data.utm === 'object' ? data.utm : {};
  const utmLine = Object.keys(utm).length ? Object.entries(utm).map(([k, v]) => `${k}=${v}`).join(', ') : '—';

  const text = (lang === 'en'
    ? [
        '🎁 New -10% discount lead — Sacred Ink Academy (🇬🇧 EN site)',
        `Email: ${email}`,
        `Page: ${sourcePage}`,
        `UTM: ${utmLine}`,
      ]
    : [
        '🎁 Нова заявка на знижку -10% — Sacred Ink Academy',
        `Email: ${email}`,
        `Сторінка: ${sourcePage}`,
        `UTM: ${utmLine}`,
      ]
  ).join('\n');

  const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });

  if (!tgRes.ok) {
    return new Response(JSON.stringify({ ok: false, error: 'Failed to deliver the message to Telegram.' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
