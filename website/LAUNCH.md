# Cloudflare deployment

The humza-sheikh Worker is deployed to Humza@automization.io's Account. Production domains: https://humzasheikh.com and https://www.humzasheikh.com. Preview: https://humza-sheikh.humza.workers.dev. The zone uses the Free plan; no paid upgrade was enabled.

## Domain migration (24 September 2026)

At the owner's request, Spaceship nameservers were switched immediately to magali.ns.cloudflare.com and tim.ns.cloudflare.com, accepting the temporary DNSSEC cache risk instead of waiting 24 hours. Cloudflare reports the zone active. The new Cloudflare DNSSEC DS record (key tag 2371, algorithm 13, digest type 2) is saved at Spaceship and appears in public DNS. Some resolvers may retain old DNS information until it expires.

The apex and www custom domains are attached to the Worker. Automatic Universal SSL is enabled; HTTPS certificate provisioning was still pending at the last check. Verify both production URLs before treating the launch as complete.

All five Spacemail MX, SPF, DKIM and autodiscovery records are preserved. The existing class subdomain is preserved. Resend's four verification records are saved, and its sending domain is verified. Incoming mailbox delivery remains with Spacemail.

## Owner access

Cloudflare Access protects /manage and /api/manage (including child paths) on both apex and www. Email one-time PIN is allowed only for humza@humzasheikh.com. Application ID: 035ae566-8c09-456d-8cee-31f8af622482. The correct ACCESS_AUD is configured in both source and the deployed Worker.

The server validates JWT signature, issuer, audience, expiry and owner email. Arbitrary identity headers do not grant access, including through workers.dev. The owner's successful sign-in has not yet been exercised.

## Email and data

RESEND_API_KEY is stored as a Worker secret. Sender and owner variables are in wrangler.jsonc. Resend verified all required DNS records on 24 September 2026. Actual notification delivery has not yet been tested.

Briefs save to D1 before alert delivery. Pending or failed alerts can be retried in /manage. Both schema migrations are applied to production; historical Sites records were not imported.

## Future releases

Run validation and build commands in README.md, then pnpm deploy. Authenticate Wrangler to the configured account first. Rotate secrets with pnpm exec wrangler secret put RESEND_API_KEY. GitHub automatic deployment is not configured.

