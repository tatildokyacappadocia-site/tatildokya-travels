import type { APIRoute } from 'astro';

export const prerender = false;

// --- Config -----------------------------------------------------------
// All secrets below are read from environment variables. RESEND_API_KEY,
// CALLMEBOT_PHONE and CALLMEBOT_APIKEY are optional: if they aren't set yet,
// the reservation still saves correctly and this route simply skips that
// specific notification (logged, not thrown) rather than failing the whole
// request. This lets the reservation pipeline go live immediately and the
// email/WhatsApp pieces switch on the moment those env vars are added in
// Vercel, with no further code changes needed.
const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
const RESEND_FROM = import.meta.env.RESEND_FROM_EMAIL || 'Tatildokya Travels <info@tatildokya.com>';
const BUSINESS_EMAIL = 'info@tatildokya.com';
const CALLMEBOT_PHONE = import.meta.env.CALLMEBOT_PHONE;
const CALLMEBOT_APIKEY = import.meta.env.CALLMEBOT_APIKEY;

type ReservationPayload = {
  name?: string;
  phone?: string;
  email?: string;
  date?: string;
  people?: number | string;
  note?: string;
  tourName?: string;
  tourSlug?: string;
  lang?: string;
  unitPrice?: number | string;
  totalPrice?: number | string;
};

const LABELS: Record<string, Record<string, string>> = {
  en: {
    subjectCustomer: 'Your reservation request has been received',
    subjectBusiness: 'New website reservation',
    greeting: 'Hi',
    body1: 'Thank you for your reservation request with Tatildokya Travels. Our team will contact you shortly to confirm the details.',
    pnrLabel: 'Your reservation code',
    tour: 'Tour', date: 'Date', people: 'Number of people', phone: 'Phone', note: 'Message',
    footer: 'If you have any questions, reply to this email or message us on WhatsApp at +90 533 392 54 50.',
  },
  tr: {
    subjectCustomer: 'Rezervasyon talebiniz alındı',
    subjectBusiness: 'Yeni site rezervasyonu',
    greeting: 'Merhaba',
    body1: 'Tatildokya Travels ile rezervasyon talebiniz için teşekkür ederiz. Ekibimiz detayları teyit etmek için sizinle en kısa sürede iletişime geçecek.',
    pnrLabel: 'Rezervasyon kodunuz',
    tour: 'Tur', date: 'Tarih', people: 'Kişi sayısı', phone: 'Telefon', note: 'Mesaj',
    footer: 'Herhangi bir sorunuz varsa bu e-postayı yanıtlayabilir ya da +90 533 392 54 50 numaralı WhatsApp hattımızdan bize ulaşabilirsiniz.',
  },
  es: {
    subjectCustomer: 'Hemos recibido tu solicitud de reserva',
    subjectBusiness: 'Nueva reserva desde la web',
    greeting: 'Hola',
    body1: 'Gracias por tu solicitud de reserva con Tatildokya Travels. Nuestro equipo se pondrá en contacto contigo en breve para confirmar los detalles.',
    pnrLabel: 'Tu código de reserva',
    tour: 'Tour', date: 'Fecha', people: 'Número de personas', phone: 'Teléfono', note: 'Mensaje',
    footer: 'Si tienes alguna pregunta, responde a este correo o escríbenos por WhatsApp al +90 533 392 54 50.',
  },
};

function esc(value: string) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

// The site's date pickers display dates as "DD.MM.YYYY" (dot-separated),
// but Postgres's `date` column needs ISO "YYYY-MM-DD" to parse reliably.
// Converts "21.08.2026" -> "2026-08-21"; passes already-ISO strings through
// unchanged; falls back to the original string if the format is unexpected
// (so a parsing surprise never silently swaps in the wrong date).
function toIsoDate(value: string): string {
  const v = String(value || '').trim();
  const dotMatch = v.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (dotMatch) {
    const [, dd, mm, yyyy] = dotMatch;
    return `${yyyy}-${mm}-${dd}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  return v;
}

// Generates a friendly PNR code in the same format the Postgres trigger
// would ("TBC-XXXXXX", no 0/O/1/I to avoid ambiguity). Doing this here
// instead of relying on Postgres's trigger + `Prefer: return=representation`
// means the anon role never needs SELECT privilege on the table at all —
// it only ever needs to INSERT, blind, which keeps every other customer's
// reservation completely unreadable to the public website. The trigger in
// supabase/customer-reservations.sql still exists as a harmless fallback
// (it only fills in a code if one wasn't already provided), which also
// means admin-created reservations — which don't call this API — still get
// a PNR automatically.
function generatePnrCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'TBC-';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function sendResendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) return { skipped: true };
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: RESEND_FROM, to, subject, html }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Resend error ${res.status}: ${text}`);
  }
  return { skipped: false };
}

async function notifyOwnerWhatsApp(text: string) {
  if (!CALLMEBOT_PHONE || !CALLMEBOT_APIKEY) return { skipped: true };
  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(CALLMEBOT_PHONE)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(CALLMEBOT_APIKEY)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`CallMeBot error ${res.status}: ${t}`);
  }
  return { skipped: false };
}

export const POST: APIRoute = async ({ request }) => {
  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return new Response(JSON.stringify({ success: false, error: 'Server not configured' }), { status: 500 });
    }

    const body = (await request.json()) as ReservationPayload;
    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();
    const email = String(body.email || '').trim();
    const date = String(body.date || '').trim();
    const people = Number(body.people) || 0;
    const note = String(body.note || '').trim();
    const tourName = String(body.tourName || '').trim();
    const tourSlug = String(body.tourSlug || '').trim();
    const lang = ['tr', 'es'].includes(String(body.lang)) ? String(body.lang) : 'en';

    if (!name || !phone || !date || !people || !tourName) {
      return new Response(JSON.stringify({ success: false, error: 'Missing required fields' }), { status: 400 });
    }

    const isoDate = toIsoDate(date);

    // 1) Save the reservation. We generate the PNR code ourselves (see
    // generatePnrCode above) and send it explicitly — this means we never
    // need `Prefer: return=representation` (which would require anon to
    // have SELECT privilege on the table, opening a real privacy hole: any
    // visitor could then query every other customer's reservation). anon
    // only ever needs blind INSERT.
    let insertOk = false;
    let insertErrorText = '';
    let pnr = generatePnrCode();

    for (let attempt = 0; attempt < 2 && !insertOk; attempt++) {
      if (attempt > 0) pnr = generatePnrCode(); // retry once with a fresh code on collision

      const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/reservations`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservation_date: isoDate,
          tour_name: tourName,
          tour_slug: tourSlug || null,
          customer_name: name,
          customer_count: people,
          phone,
          email: email || null,
          note: note || null,
          language: lang,
          source: 'website',
          pnr_code: pnr,
        }),
      });

      if (insertRes.ok) {
        insertOk = true;
        break;
      }

      insertErrorText = await insertRes.text().catch(() => '');
      // 23505 = unique_violation. Only worth retrying with a new code if
      // the collision was specifically on pnr_code — otherwise retrying
      // would just fail the same way again.
      const isPnrCollision = insertErrorText.includes('23505') && insertErrorText.includes('pnr_code');
      if (!isPnrCollision) break;
    }

    if (!insertOk) {
      console.error('Reservation insert failed:', insertErrorText);
      return new Response(JSON.stringify({ success: false, error: 'Could not save reservation' }), { status: 500 });
    }

    const t = LABELS[lang] || LABELS.en;

    // 2) Best-effort notifications. None of these should fail the request —
    // the reservation is already safely saved at this point regardless of
    // whether email/WhatsApp succeed.
    const notifications: Promise<unknown>[] = [];

    if (email) {
      const customerHtml = `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#1a2a4a;">
          <h2 style="color:#071f4e;">${esc(t.greeting)} ${esc(name)},</h2>
          <p>${esc(t.body1)}</p>
          <p style="font-size:20px;font-weight:bold;background:#f5f7fb;padding:12px 16px;border-radius:8px;display:inline-block;">
            ${esc(t.pnrLabel)}: <span style="color:#c9971d;">${esc(pnr || '—')}</span>
          </p>
          <table style="margin-top:16px;font-size:14px;">
            <tr><td style="padding:4px 8px 4px 0;color:#5b6b8c;">${esc(t.tour)}</td><td>${esc(tourName)}</td></tr>
            <tr><td style="padding:4px 8px 4px 0;color:#5b6b8c;">${esc(t.date)}</td><td>${esc(date)}</td></tr>
            <tr><td style="padding:4px 8px 4px 0;color:#5b6b8c;">${esc(t.people)}</td><td>${esc(String(people))}</td></tr>
            <tr><td style="padding:4px 8px 4px 0;color:#5b6b8c;">${esc(t.phone)}</td><td>${esc(phone)}</td></tr>
            ${note ? `<tr><td style="padding:4px 8px 4px 0;color:#5b6b8c;">${esc(t.note)}</td><td>${esc(note)}</td></tr>` : ''}
          </table>
          <p style="margin-top:20px;font-size:13px;color:#5b6b8c;">${esc(t.footer)}</p>
        </div>`;
      notifications.push(sendResendEmail(email, t.subjectCustomer, customerHtml));
    }

    const businessHtml = `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#1a2a4a;">
        <h2 style="color:#071f4e;">New website reservation — ${esc(pnr || '—')}</h2>
        <table style="font-size:14px;">
          <tr><td style="padding:4px 8px 4px 0;color:#5b6b8c;">Name</td><td>${esc(name)}</td></tr>
          <tr><td style="padding:4px 8px 4px 0;color:#5b6b8c;">Tour</td><td>${esc(tourName)}</td></tr>
          <tr><td style="padding:4px 8px 4px 0;color:#5b6b8c;">Date</td><td>${esc(date)}</td></tr>
          <tr><td style="padding:4px 8px 4px 0;color:#5b6b8c;">People</td><td>${esc(String(people))}</td></tr>
          <tr><td style="padding:4px 8px 4px 0;color:#5b6b8c;">Phone</td><td>${esc(phone)}</td></tr>
          <tr><td style="padding:4px 8px 4px 0;color:#5b6b8c;">Email</td><td>${esc(email || '—')}</td></tr>
          <tr><td style="padding:4px 8px 4px 0;color:#5b6b8c;">Language</td><td>${esc(lang)}</td></tr>
          ${note ? `<tr><td style="padding:4px 8px 4px 0;color:#5b6b8c;">Note</td><td>${esc(note)}</td></tr>` : ''}
        </table>
      </div>`;
    notifications.push(sendResendEmail(BUSINESS_EMAIL, t.subjectBusiness, businessHtml));

    const waText = `🎈 New reservation!\nPNR: ${pnr || '-'}\n${tourName}\n${name} | ${phone}\n${date} | ${people} pax`;
    notifications.push(notifyOwnerWhatsApp(waText));

    const results = await Promise.allSettled(notifications);
    results.forEach((r, i) => {
      if (r.status === 'rejected') console.error('Reservation notification failed:', i, r.reason);
    });

    return new Response(JSON.stringify({ success: true, pnr }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('create-reservation error:', err);
    return new Response(JSON.stringify({ success: false, error: 'Unexpected server error' }), { status: 500 });
  }
};
