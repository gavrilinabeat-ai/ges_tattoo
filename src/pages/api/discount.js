export const prerender = false;

async function addToSendPulse(email, lang, sourcePage) {
  const apiKey = process.env.SENDPULSE_API_KEY;
  const listId = process.env.SENDPULSE_LIST_ID;
  if (!apiKey || !listId) return { ok: false, error: 'SendPulse is not configured on the server.' };

  const res = await fetch(`https://api.sendpulse.com/addressbooks/${listId}/emails`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      emails: [{ email, variables: { lang, source: sourcePage } }],
    }),
  });

  if (!res.ok) return { ok: false, error: `SendPulse request failed (${res.status}).` };
  return { ok: true };
}

export async function POST({ request }) {
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

  const listResult = await addToSendPulse(email, lang, sourcePage);
  if (!listResult.ok) {
    return new Response(JSON.stringify({ ok: false, error: listResult.error }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Best-effort Telegram ping for Kateryna — the subscriber is already
  // saved in SendPulse either way, so a Telegram hiccup shouldn't fail this.
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (token && chatId) {
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

    fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    }).catch(() => {});
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
