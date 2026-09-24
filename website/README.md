# Humza Sheikh — Business Introductions

Website for humzasheikh.com: US-focused business introductions, serving businesses worldwide. The company is based in London.

## Stack

React 19, TypeScript, Vinext/Vite, Tailwind CSS and Cloudflare Workers. Cloudflare D1 stores briefs and conversion events. Optional Resend integration sends submission alerts. The `/manage` dashboard uses Sites-managed ChatGPT authentication and an owner email allowlist.

## Local development

Use Node.js 22.13 or later and the pinned pnpm 11.25.0 version.

```sh
cd website
corepack enable
corepack prepare pnpm@11.25.0 --activate
pnpm install --frozen-lockfile
cp .env.example .env
pnpm build
```

Before testing the form, apply both migrations to your local database:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_handy_triathlon.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_cultured_pride.sql
pnpm dev
```

Open the local URL printed by the server. On Windows, copy `.env.example` to `.env` using Explorer or PowerShell instead of `cp`. Clean clones use the portable execution profile automatically. `install:ci` is a managed-Linux helper; use the standard pnpm install command above locally.

For local admin testing, set `OWNER_EMAIL=seedy@sites.test`, then visit `/signin-with-chatgpt?return_to=/manage` on the loopback development server. This development-only identity is not used in production.

## Project map

- `app/page.tsx`: landing page, animated connection diagram and two-step brief form.
- `app/globals.css`: visual system, motion and responsive styles.
- `app/layout.tsx`: metadata and social sharing.
- `app/api/requests`: validated submissions and durable storage.
- `app/api/events`: conversion event collection.
- `app/manage` and `app/api/manage`: owner-only brief dashboard and alert retries.
- `db` and `drizzle`: database queries, schema and migrations.
- `lib/notifications.ts`: optional Resend notification delivery.
- `public`: founder image, fonts, favicon and sharing image.

## Hosting

The current deployment is managed by ChatGPT Sites:
https://humza-connections.humzasheikh.chatgpt.site

This GitHub import is a source snapshot, not an automatic deployment connection. Pushing here does not republish the live Site. Preserve `.openai/hosting.json` when continuing work with Sites. See `LAUNCH.md` for remaining configuration.

The app is server-backed and cannot run fully on GitHub Pages. Hosting outside Sites requires a Cloudflare-compatible runtime, D1 bindings and migrations, runtime variables, and a replacement for Sites-managed authentication. Never trust incoming identity headers without a trusted authentication layer.

## Source provenance

Imported from the published Sites source revision `48c3d6a8361a3750fba8679b9a9ee2b342358560` on 24 September 2026. Credentials, local databases, build output and compiler caches are excluded. The root repository README remains the GitHub profile README.
