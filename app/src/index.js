/* The Worker: static pages, an API, and the one rule that has to hold —
 * a package is only ever assembled by the server, for a signed-in person who
 * is entitled to it.
 */

import {
  googleStart, googleCallback, appleStart, appleCallback,
  magicRequest, magicCallback, magicVerifyCode, signOut,
  readCookie, publicUser, json,
} from './auth.js';
import {
  userForSession, saveBrief, getBrief, listBriefs, approveBrief,
  countDownloads, alreadyDownloaded, recordDownload, entitlementFor, audit, now,
} from './db.js';
import { buildPage, packageFiles, makeZip, packageName, normalise, isReady } from '../../design-system/lib/package.js';
import { STYLESHEET } from './styles.js';

/* How many packages a new account may take before paying. Payment is not built
 * yet, so PAYWALL is off and this ceiling is recorded but not enforced — every
 * download is still counted, which is the part that cannot be added later. */
const FREE_DOWNLOADS = 2;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;

    try {
      if (pathname.startsWith('/auth/') || pathname.startsWith('/api/')) {
        const res = await route(request, env, url, pathname);
        if (res) return withSecurityHeaders(res, { api: true });
      }
      return withSecurityHeaders(await serveStatic(request, env, url));
    } catch (err) {
      console.error('unhandled', err?.stack || err);
      // Never leak an internal message to the caller.
      return withSecurityHeaders(json({ error: 'Something went wrong on our side.' }, 500));
    }
  },
};

async function route(request, env, url, pathname) {
  const method = request.method;
  const post = method === 'POST';

  /* ---- Sign in ------------------------------------------------------------ */
  if (pathname === '/auth/google' && method === 'GET') return googleStart(request, env, url);
  if (pathname === '/auth/google/callback' && method === 'GET') return googleCallback(request, env, url);
  if (pathname === '/auth/apple' && method === 'GET') return appleStart(request, env, url);
  // Apple posts its result back as a form, so this one callback is a POST.
  if (pathname === '/auth/apple/callback' && post) return appleCallback(request, env, url);
  if (pathname === '/auth/magic' && post) return requireSameOrigin(request, url) || magicRequest(request, env, url);
  if (pathname === '/auth/magic/callback' && method === 'GET') return magicCallback(request, env, url);
  if (pathname === '/auth/code' && post) return requireSameOrigin(request, url) || magicVerifyCode(request, env, url);
  if (pathname === '/auth/signout' && post) return requireSameOrigin(request, url) || signOut(request, env, url);

  /* ---- Everything below needs an account ---------------------------------- */
  const user = await userForSession(env.DB, readCookie(request));

  if (pathname === '/api/me') {
    return json(user
      ? { signedIn: true, user: publicUser(user), usage: await usageFor(env, user) }
      : { signedIn: false, providers: availableProviders(env) });
  }

  if (!pathname.startsWith('/api/')) return null;
  if (!user) return json({ error: 'Please sign in first.' }, 401);
  // Any state-changing call must have come from our own pages.
  if (post) { const bad = requireSameOrigin(request, url); if (bad) return bad; }

  if (pathname === '/api/briefs' && method === 'GET') {
    const { results } = await listBriefs(env.DB, user.id);
    // Through publicBrief like every other brief response, so callers see one
    // field naming everywhere rather than raw column names from this route.
    return json({ briefs: (results || []).map(publicBrief) });
  }

  if (pathname === '/api/briefs' && post) {
    const body = await request.json().catch(() => ({}));
    const answers = normalise(body.answers || {});
    if (!isReady(answers)) return json({ error: 'Choose what you need and a look first.' }, 400);

    const brief = await saveBrief(env.DB, {
      id: body.id, userId: user.id, title: body.title || null,
      kind: answers.kind, palId: answers.palId, answers,
    });
    return json({ brief: publicBrief(brief) });
  }

  const briefMatch = pathname.match(/^\/api\/briefs\/([\w-]+)(\/[a-z]+)?$/);
  if (briefMatch) {
    const [, id, action] = briefMatch;
    const brief = await getBrief(env.DB, id, user.id);
    if (!brief) return json({ error: 'No such project.' }, 404);

    if (!action && method === 'GET') return json({ brief: publicBrief(brief), answers: JSON.parse(brief.answers) });
    if (action === '/approve' && post) {
      await approveBrief(env.DB, id, user.id);
      return json({ brief: publicBrief(await getBrief(env.DB, id, user.id)) });
    }
    if (action === '/preview' && method === 'GET') {
      const html = buildPage(JSON.parse(brief.answers), STYLESHEET);
      /* Served from a sandboxed iframe with its own headers: this HTML is
       * customer-authored, so it must not run with the site's own origin. */
      return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
    if (action === '/download' && post) return download(request, env, user, brief);
  }

  return json({ error: 'Not found.' }, 404);
}

/* ---- The gate -------------------------------------------------------------
   The single place that decides whether a person may have a package, and the
   only place one is assembled. It is a POST so no browser can be tricked into
   walking a link and burning an allowance. -------------------------------- */
async function download(request, env, user, brief) {
  const paywall = env.PAYWALL === 'on';

  // A second copy of something already taken never costs twice.
  const repeat = await alreadyDownloaded(env.DB, user.id, brief.id);
  const entitlement = repeat ? null : await entitlementFor(env.DB, user.id, brief.id);
  const used = await countDownloads(env.DB, user.id);
  const withinFree = used < FREE_DOWNLOADS;

  let basis = 'free';
  if (repeat) basis = 'repeat';
  else if (entitlement) basis = entitlement.basis;
  else if (paywall && !withinFree) {
    await audit(env.DB, { userId: user.id, action: 'download.refused', detail: { brief: brief.id, used } });
    return json({
      error: 'payment_required',
      message: `Your ${FREE_DOWNLOADS} free downloads are used up. Choose a plan to carry on.`,
      used, free: FREE_DOWNLOADS,
    }, 402);
  }

  /* Releasing is a human decision — we say a job needs no further work from
   * us before the files go out. Off by default so today's downloads are
   * immediate; turning it on costs a config change, not a rewrite. */
  if (env.REVIEW_BEFORE_RELEASE === 'on' && brief.status !== 'released') {
    return json({
      error: 'awaiting_review',
      message: "We're checking your files over. You'll get an email the moment they're ready.",
    }, 409);
  }

  const answers = JSON.parse(brief.answers);
  const page = buildPage(answers, STYLESHEET);
  const files = packageFiles(answers, page, { contact: env.SUPPORT_EMAIL || 'hello@example.com' });
  const zip = await makeZip(files);

  if (!repeat) {
    await recordDownload(env.DB, { userId: user.id, briefId: brief.id, bytes: zip.length, basis });
  }
  await audit(env.DB, { userId: user.id, action: 'download', detail: { brief: brief.id, basis, bytes: zip.length } });

  return new Response(zip, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${packageName(answers)}"`,
      'Content-Length': String(zip.length),
      'Cache-Control': 'no-store',
    },
  });
}

async function usageFor(env, user) {
  const used = await countDownloads(env.DB, user.id);
  const sub = await entitlementFor(env.DB, user.id, null);
  return {
    used,
    free: FREE_DOWNLOADS,
    remaining: Math.max(0, FREE_DOWNLOADS - used),
    paywall: env.PAYWALL === 'on',
    plan: sub ? sub.basis : null,
  };
}

const availableProviders = env => ({
  google: Boolean(env.GOOGLE_CLIENT_ID),
  apple: Boolean(env.APPLE_CLIENT_ID),
  email: true,
});

const publicBrief = b => b && ({
  id: b.id, title: b.title, kind: b.kind, palId: b.pal_id, status: b.status,
  createdAt: b.created_at, updatedAt: b.updated_at,
  approvedAt: b.approved_at, releasedAt: b.released_at,
});

/* ---- Guards ---------------------------------------------------------------
   SameSite=Lax already blocks the cross-site form post; this is the second
   lock, because a cookie policy is one browser default away from not being
   there. Checked on Origin, which a page cannot forge. -------------------- */
function requireSameOrigin(request, url) {
  const origin = request.headers.get('Origin');
  if (!origin) return null;                 // same-origin GETs and some clients omit it
  if (origin === url.origin) return null;
  return json({ error: 'Request rejected.' }, 403);
}

function withSecurityHeaders(res, { api = false } = {}) {
  const headers = new Headers(res.headers);
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('X-Frame-Options', 'SAMEORIGIN');
  if (api) headers.set('Cache-Control', headers.get('Cache-Control') || 'no-store');
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

/* ---- Static --------------------------------------------------------------- */

async function serveStatic(request, env, url) {
  if (!env.ASSETS) return new Response('Not found', { status: 404 });

  /* The assets layer already strips .html and canonicalises, so /brief and
   * /signin resolve on their own. This only covers the friendlier alias we
   * hand out in links, and it redirects rather than rewriting so the address
   * bar ends up showing the one canonical URL. */
  if (url.pathname === '/start') {
    return new Response(null, { status: 302, headers: { Location: '/brief' } });
  }
  return env.ASSETS.fetch(request);
}
