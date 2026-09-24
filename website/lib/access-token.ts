import { createRemoteJWKSet, jwtVerify } from "jose";

export type OwnerIdentity = { userId: string; email: string };
// Cache public verification keys, never user identities or request state.
const keySets = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

export async function verifyAccessToken(token: string | null, teamDomain: string | undefined, audience: string | undefined): Promise<OwnerIdentity | null> {
  if (!token || !audience || !teamDomain || !/^[a-z0-9-]+\.cloudflareaccess\.com$/.test(teamDomain)) return null;
  const issuer = `https://${teamDomain}`;
  try {
    let keys = keySets.get(issuer);
    if (!keys) {
      keys = createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`));
      keySets.set(issuer, keys);
    }
    const { payload } = await jwtVerify(token, keys, {
      issuer, audience, algorithms: ["RS256"], requiredClaims: ["exp", "sub", "email"],
    });
    if (typeof payload.email !== "string" || typeof payload.sub !== "string") return null;
    return { userId: payload.sub, email: payload.email };
  } catch {
    return null;
  }
}
