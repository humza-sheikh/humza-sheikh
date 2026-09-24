# Launch configuration

## Domain and access

The site is currently hosted at https://humza-connections.humzasheikh.chatgpt.site with its existing private audience. The custom domain humzasheikh.com was attached and awaiting DNS verification at the time of this export. Retrieve current DNS instructions from Site settings and preserve email DNS records. Once the custom domain is active, update `metadataBase` in `app/layout.tsx` and publish through Sites.

## Submission alerts

Set `RESEND_API_KEY` as a secret, `NOTIFICATION_FROM` to a verified sender, and `OWNER_EMAIL` to the owner’s authenticated account email in Site runtime settings. Republish after configuration. Never commit actual credentials.

Alerts are addressed to humza@humzasheikh.com. Briefs save before notification delivery. Pending and failed alerts can be retried in `/manage`. Email delivery requires the provider configuration; the site does not claim that an acknowledgement email has been sent to visitors.

## Brief management

The owner dashboard at `/manage` supports stages new, qualified, introduced, accepted, paid and closed. UTM source and campaign values support attribution. Interaction events use a temporary in-memory visit ID and respect Do Not Track / Global Privacy Control. No live database records are included in this repository.

## Deployment relationship

GitHub is the source handoff. No GitHub Actions deployment or automatic Sites sync has been configured. Use Sites to publish changes to the current deployment; changing hosting requires a separate migration.
