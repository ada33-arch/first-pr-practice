// Pinterest API v5 from the command line: the OAuth dance once, then the
// handful of calls you need to pin something.
//
// Usage:
//   npm run pinterest -- auth-url                  # open this, approve, copy ?code= from the redirect
//   npm run pinterest -- token <code>              # prints access + refresh token; paste into .env
//   npm run pinterest -- refresh                   # new access token from PINTEREST_REFRESH_TOKEN
//   npm run pinterest -- me                        # sanity check: who the token belongs to
//   npm run pinterest -- boards                    # board IDs to pin to
//   npm run pinterest -- pin <board_id> <image_url> <title> [link] [description]
//
// Setup: create an app at https://developers.pinterest.com/apps/, add the
// exact PINTEREST_REDIRECT_URI to its redirect URIs, then fill in .env.
//
// Trial-access apps can only write to the sandbox: set
// PINTEREST_API_BASE=https://api-sandbox.pinterest.com/v5 and use a sandbox
// token, or `pin` returns 403 even though `me` and `boards` work.

import { pathToFileURL } from "node:url";

try {
  process.loadEnvFile();
} catch {
  // no .env — fall back to whatever is already in the environment
}

export const API = process.env.PINTEREST_API_BASE ?? "https://api.pinterest.com/v5";
const SCOPES = "boards:read,pins:read,pins:write,user_accounts:read";

function env(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`${name} is not set — see .env.example`);
    process.exit(2);
  }
  return value;
}

// Pinterest reports failures as a non-2xx status with {code, message}; print
// both and stop rather than carrying on with a half-parsed body.
export async function call(path: string, init: RequestInit = {}): Promise<unknown> {
  const res = await fetch(`${API}${path}`, init);
  const body = await res.text();
  if (!res.ok) {
    console.error(`${init.method ?? "GET"} ${path} -> ${res.status}: ${body}`);
    process.exit(1);
  }
  return body ? JSON.parse(body) : {};
}

export function bearer(): Record<string, string> {
  return { Authorization: `Bearer ${env("PINTEREST_ACCESS_TOKEN")}` };
}

// The token endpoint authenticates the app, not the user: Basic client_id:client_secret.
function tokenRequest(form: Record<string, string>): Promise<unknown> {
  const basic = Buffer.from(`${env("PINTEREST_APP_ID")}:${env("PINTEREST_APP_SECRET")}`).toString("base64");
  return call("/oauth/token", {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(form),
  });
}

const usage = "usage: npm run pinterest -- auth-url | token <code> | refresh | me | boards | pin <board_id> <image_url> <title> [link] [description]";

async function main(): Promise<void> {
  const [cmd, ...args] = process.argv.slice(2);

  switch (cmd) {
    case "auth-url": {
      const params = new URLSearchParams({
        client_id: env("PINTEREST_APP_ID"),
        redirect_uri: env("PINTEREST_REDIRECT_URI"),
        response_type: "code",
        scope: SCOPES,
        state: crypto.randomUUID(),
      });
      console.log(`https://www.pinterest.com/oauth/?${params}`);
      return;
    }
    case "token": {
      const [code] = args;
      if (!code) break;
      // redirect_uri must match the one used in auth-url byte for byte.
      console.log(JSON.stringify(await tokenRequest({
        grant_type: "authorization_code",
        code,
        redirect_uri: env("PINTEREST_REDIRECT_URI"),
        continuous_refresh: "true",
      }), null, 2));
      return;
    }
    case "refresh":
      console.log(JSON.stringify(await tokenRequest({
        grant_type: "refresh_token",
        refresh_token: env("PINTEREST_REFRESH_TOKEN"),
      }), null, 2));
      return;
    case "me":
      console.log(JSON.stringify(await call("/user_account", { headers: bearer() }), null, 2));
      return;
    case "boards": {
      const page = (await call("/boards?page_size=100", { headers: bearer() })) as {
        items?: { id: string; name: string; privacy: string }[];
      };
      for (const b of page.items ?? []) console.log(`${b.id}\t${b.privacy}\t${b.name}`);
      return;
    }
    case "pin": {
      const [boardId, imageUrl, title, link, description] = args;
      if (!boardId || !imageUrl || !title) break;
      const pin = (await call("/pins", {
        method: "POST",
        headers: { ...bearer(), "Content-Type": "application/json" },
        body: JSON.stringify({
          board_id: boardId,
          title,
          ...(description ? { description } : {}),
          ...(link ? { link } : {}),
          media_source: { source_type: "image_url", url: imageUrl },
        }),
      })) as { id: string };
      console.log(`created pin ${pin.id} on board ${boardId}`);
      return;
    }
  }

  console.error(usage);
  process.exit(2);
}

// Run as a CLI only when invoked directly; rentstore-pins.ts imports call/bearer.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
