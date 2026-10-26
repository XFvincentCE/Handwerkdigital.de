// ----------------------------------------------------------
// Kurze Telegram-Benachrichtigung bei einer neuen Anfrage
//
// Aus Datenschutzgründen werden KEINE Kundendaten (Name, Kontakt,
// Nachricht) an Telegram geschickt – nur der Hinweis und das Thema.
// Die vollständige Anfrage kommt per E-Mail über Web3Forms.
//
// Benötigte Umgebungsvariablen (in Netlify eintragen, NICHT hier):
//   TELEGRAM_BOT_TOKEN  – Token vom @BotFather
//   TELEGRAM_CHAT_ID    – deine Chat-ID
// ----------------------------------------------------------

// Nur diese Themen werden übernommen (wie im Formular)
const THEMEN = ['Website', 'Social Media', 'Mehr Anfragen', 'Etwas anderes'];

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

  const thema = THEMEN.includes(data.thema) ? data.thema : 'Etwas anderes';

  const text = [
    '🔔 Neue Anfrage über die Website',
    'Thema: ' + thema,
    '',
    'Alle Details findest du in deinem E-Mail-Postfach.'
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
