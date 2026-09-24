import { env } from "cloudflare:workers";
import { headers } from "next/headers";
import { verifyAccessToken, type OwnerIdentity } from "./access-token";
export function isOwner(user: OwnerIdentity | null) { return !!user && !!env.OWNER_EMAIL && user.email.toLowerCase() === env.OWNER_EMAIL.toLowerCase(); }
export async function ownerSignedIn() {
  const requestHeaders = await headers();
  return isOwner(await verifyAccessToken(requestHeaders.get("cf-access-jwt-assertion"), env.ACCESS_TEAM_DOMAIN, env.ACCESS_AUD));
}
