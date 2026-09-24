# Humza Sheikh — Business Introductions

React 19, TypeScript, Vinext/Vite and Tailwind on Cloudflare Workers. Cloudflare D1 stores briefs and conversion events. Resend sends owner alerts; Spacemail hosts the existing mailbox. The private dashboard validates Cloudflare Access JWTs and an owner email allowlist.

## Development

Use Node.js 22.13+ and pnpm 11.25.0:

```sh
cd website
pnpm install --frozen-lockfile
pnpm exec wrangler d1 migrations apply DB --local
pnpm dev
```

Copy `.env.example` to `.dev.vars` only when local runtime overrides are needed. Production variables are in `wrangler.jsonc`; secrets must never be committed. Local admin access is denied without a valid Access token. Run `pnpm test:access` to exercise signature and identity validation.

```sh
pnpm exec tsc --noEmit
pnpm lint
pnpm test:access
pnpm build
pnpm deploy
```

Wrangler must be authenticated to the configured account to deploy. GitHub holds source; automatic deployment is not configured.

## Hosting

Cloudflare preview: https://humza-sheikh.humza.workers.dev

Target domain: https://humzasheikh.com

See `LAUNCH.md` for DNS migration and owner-login activation status. The Free zone, Worker, D1 database and secret are configured. The original Sites export metadata is retained for provenance but does not control deployment.

## Project map

- `app/page.tsx`: landing page and brief form.
- `app/api/requests`: validation, storage and alerts.
- `app/manage` and `app/api/manage`: private dashboard.
- `lib/access-token.ts` and `lib/owner.ts`: signed owner authentication.
- `db` and `drizzle`: database queries and migrations.
- `lib/notifications.ts`: Resend alert delivery.
- `wrangler.jsonc`: Cloudflare runtime configuration.

Imported from Sites revision `48c3d6a8361a3750fba8679b9a9ee2b342358560` on 24 September 2026. Historical database records are not included. The repository root README remains the GitHub profile README.
