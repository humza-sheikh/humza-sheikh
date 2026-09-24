import assert from 'node:assert/strict';
import { generateKeyPair, exportJWK, SignJWT } from 'jose';
import { verifyAccessToken } from '../lib/access-token.ts';

const { publicKey, privateKey } = await generateKeyPair('RS256');
const jwk = { ...await exportJWK(publicKey), kid: 'test-key', alg: 'RS256' };
const originalFetch = globalThis.fetch;
globalThis.fetch = async (url) => {
  assert.equal(String(url), 'https://test-owner.cloudflareaccess.com/cdn-cgi/access/certs');
  return Response.json({ keys: [jwk] });
};
const domain = 'test-owner.cloudflareaccess.com';
const audience = 'test-audience';
const sign = (overrides = {}) => new SignJWT({
  email: 'humza@humzasheikh.com', sub: 'owner-id',
  iss: `https://${domain}`, aud: audience,
  exp: Math.floor(Date.now() / 1000) + 60, ...overrides,
}).setProtectedHeader({ alg: 'RS256', kid: 'test-key' }).sign(privateKey);
try {
  assert.equal(await verifyAccessToken(null, domain, audience), null);
  assert.equal(await verifyAccessToken('forged', domain, audience), null);
  const valid = await sign();
  assert.deepEqual(await verifyAccessToken(valid, domain, audience), { userId: 'owner-id', email: 'humza@humzasheikh.com' });
  assert.equal(await verifyAccessToken(valid, domain, ''), null);
  assert.equal(await verifyAccessToken(valid, 'attacker.example', audience), null);
  for (const overrides of [{ aud: 'another-app' }, { iss: 'https://attacker.example' }, { exp: 1 }, { email: 123 }]) {
    assert.equal(await verifyAccessToken(await sign(overrides), domain, audience), null);
  }
  const segments = valid.split('.');
  segments[1] = Buffer.from(JSON.stringify({ email: 'attacker@example.com' })).toString('base64url');
  assert.equal(await verifyAccessToken(segments.join('.'), domain, audience), null);
  console.log('Access token validation: 9 checks passed.');
} finally {
  globalThis.fetch = originalFetch;
}
