# Cloudflare deployment

The humza-sheikh Worker is deployed to Humza@automization.io's Account at https://humza-sheikh.humza.workers.dev. The humzasheikh.com zone uses the Free plan. No paid upgrade was requested or enabled.

## Domain migration status (24 September 2026)

The apex and www custom domains are attached to the Worker. Cloudflare DNS contains the Spacemail MX, SPF, DKIM and autodiscovery records, the existing class subdomain, and Resend verification records. The registrar remains Spaceship.

Nameserver activation is pending. DNSSEC was disabled at Spaceship with owner approval and the old DS record was absent from the registry at 19:06 Dubai on 24 September 2026. Allow its previous 24-hour TTL to expire: change nameservers no earlier than 19:10 Dubai on 25 September 2026, to magali.ns.cloudflare.com and tim.ns.cloudflare.com. Restore DNSSEC using Cloudflare's new DS record after activation. Do not switch while an old DS record may still be cached.

## Owner access

Protect /manage and /api/manage (including child paths) on both apex and www with Cloudflare Access, using email one-time PIN and an allow policy for humza@humzasheikh.com only. Set ACCESS_AUD in wrangler.jsonc to that application's audience and redeploy. ACCESS_TEAM_DOMAIN is humza-sheikh-admin.cloudflareaccess.com.

The server validates Access JWT signatures, issuer, audience, expiry and owner email. Until the audience is configured, all admin requests are denied. Arbitrary identity headers do not grant access. The workers.dev URL cannot bypass this validation.

## Email and data

The existing Spacemail mailbox receives humza@humzasheikh.com mail. Resend handles website alerts; keep its bounce MX on the send subdomain, never at the root. RESEND_API_KEY is stored as a Worker secret. NOTIFICATION_FROM and OWNER_EMAIL are in wrangler.jsonc. Resend verified the domain and all four required DNS records on 24 September 2026. Actual notification delivery has not yet been tested.

Briefs save to D1 before alert delivery. Pending or failed alerts can be retried in /manage. Both schema migrations are applied to production, but historical Sites records were not imported.

## Future releases

Run the validation and build commands in README.md, then pnpm deploy. Authenticate Wrangler to the configured account first. Rotate the secret with pnpm exec wrangler secret put RESEND_API_KEY. GitHub automatic deployment is not configured.


