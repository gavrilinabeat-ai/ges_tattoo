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

  const name = String(data.name ?? '').trim();
  const telegram = String(data.telegram ?? '').trim();
  const instagram = String(data.instagram ?? '').trim();
  const experience = String(data.experience ?? '').trim();

  if (!name || !telegram || !instagram || !experience) {
    return new Response(JSON.stringify({ ok: false, error: 'Missing required fields.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const text = [
    '📩 Нова заявка на навчання — Sacred Ink Academy',
    `Ім'я та прізвище: ${name}`,
    `Telegram: ${telegram}`,
    `Instagram: ${instagram}`,
    `Досвід у тату: ${experience}`,
  ].join('\n');

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
