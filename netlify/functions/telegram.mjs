
export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Nur POST erlaubt', { status: 405 });
  }

  let data;
  try {
    data = await req.json();
  } catch {
    return new Response('Ungültige Daten', { status: 400 });
  }

  // Spam-Schutz: unsichtbares Feld wurde ausgefüllt
  if (data.botcheck) return new Response('OK');

  // Eingaben kürzen, damit niemand riesige Nachrichten schickt
  const clean = (value, max = 300) => String(value ?? '').trim().slice(0, max);

  const name = clean(data.name, 100);
  const kontaktweg = clean(data.kontaktweg, 150);
  if (!name || !kontaktweg) {
    return new Response('Name und Kontakt fehlen', { status: 400 });
  }

  const text = [
    '🔔 Neue Anfrage über die Website',
    '',
    'Name: ' + name,
    'Betrieb: ' + (clean(data.betrieb, 150) || '–'),
    'Kontakt: ' + kontaktweg,
    'Thema: ' + (clean(data.thema, 50) || '–'),
    '',
    clean(data.msg, 1500) || '(keine Nachricht)'
  ].join('\n');

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return new Response('Telegram ist nicht eingerichtet', { status: 500 });
  }

  const res = await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: text })
  });

  if (!res.ok) {
    return new Response('Telegram-Fehler', { status: 502 });
  }
  return new Response('OK');
};
