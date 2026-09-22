/* Sending the sign-in email.
 *
 * Resend is the default because it works from a Worker over plain HTTP with
 * one key and no SDK. Swapping it means changing `deliver` and nothing else.
 *
 * With no key configured, sending is a no-op that reports failure honestly
 * rather than pretending — in development the route surfaces the link
 * directly, so nobody is left waiting for mail that was never sent.
 */

export async function sendMagicLink(env, { to, link, code }) {
  const from = env.MAIL_FROM || 'Design System <onboarding@resend.dev>';
  const brand = env.BRAND_NAME || 'Design System';

  const subject = `Your sign-in link for ${brand}`;
  const text = [
    `Sign in to ${brand}`,
    '',
    'Open this link and you are in:',
    link,
    '',
    `Or type this code in: ${code}`,
    '',
    'The link and the code both stop working in 15 minutes, and each can only',
    'be used once.',
    '',
    "If you didn't ask to sign in, ignore this — nobody can get in without",
    'this email.',
  ].join('\n');

  const html = `<!doctype html><html><body style="margin:0;padding:32px;background:#F7F8FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#14181F">
  <div style="max-width:480px;margin:0 auto;background:#fff;border-radius:16px;padding:32px">
    <h1 style="margin:0 0 8px;font-size:20px">Sign in to ${escapeHtml(brand)}</h1>
    <p style="margin:0 0 24px;color:#3A4761;font-size:15px;line-height:1.5">Open the button below and you're in.</p>
    <a href="${escapeAttr(link)}" style="display:inline-block;background:#7C4DFF;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600;font-size:15px">Sign me in</a>
    <p style="margin:24px 0 4px;color:#3A4761;font-size:14px">Or type this code in:</p>
    <p style="margin:0;font-size:28px;font-weight:700;letter-spacing:.12em;font-variant-numeric:tabular-nums">${escapeHtml(code)}</p>
    <p style="margin:24px 0 0;color:#8993A6;font-size:13px;line-height:1.5">
      Both stop working in 15 minutes and can only be used once.
      If you didn't ask to sign in, you can ignore this email.
    </p>
  </div>
</body></html>`;

  return deliver(env, { to, subject, text, html, from });
}

async function deliver(env, { to, subject, text, html, from }) {
  if (!env.RESEND_API_KEY) {
    return { ok: false, reason: 'no mail provider configured' };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [to], subject, text, html }),
    });
    if (!res.ok) {
      return { ok: false, reason: `provider returned ${res.status}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err.message };
  }
}

const escapeHtml = s => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/* A link goes into an href, so a quote or angle bracket would break out of the
 * attribute. Only http(s) URLs are ever emitted. */
const escapeAttr = url =>
  /^https?:\/\//.test(url) ? escapeHtml(url) : '#';
