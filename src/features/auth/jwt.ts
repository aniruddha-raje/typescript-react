// Mock JWT minting for the demo login.
//
// There is no auth server here — the token is minted entirely in the browser.
// It is still a *structurally* valid JWT (three base64url segments:
// header.payload.signature) so that the shape matches what a real backend
// would hand back, and so the expiry claim can drive real session behaviour.
//
// The signature is a fixed placeholder and is never verified. Nothing about
// this is secure; it exists so the sign-in flow has something to carry.

function base64UrlEncode(input: string): string {
  // btoa() throws on raw multi-byte characters, so encode to bytes first.
  const bytes = new TextEncoder().encode(input)
  let binary = ''
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export type MockTokenClaims = {
  sub: string
  name: string
  iat: number
  exp: number
}

/** How long a minted session lasts. */
export const TOKEN_TTL_SECONDS = 60 * 60 * 8 // 8 hours

/** Mint a structurally valid (unsigned) JWT for the given subject. */
export function mintMockToken(subject: string): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const claims: MockTokenClaims = {
    sub: subject,
    name: 'Administrator',
    iat: now,
    exp: now + TOKEN_TTL_SECONDS,
  }

  return [
    base64UrlEncode(JSON.stringify(header)),
    base64UrlEncode(JSON.stringify(claims)),
    base64UrlEncode('mock-signature'),
  ].join('.')
}

/** Decode a JWT payload. No verification. Returns null if malformed. */
export function decodeToken(token: string): MockTokenClaims | null {
  try {
    const payload = token.split('.')[1]
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    // base64url drops the padding that atob() expects.
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    // atob() yields one char per byte, so decode the UTF-8 back — mirroring
    // the TextEncoder above. Without this, multi-byte characters come back
    // as mojibake.
    const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes)) as MockTokenClaims
  } catch {
    return null
  }
}

/** True if the token is missing, malformed, or past its `exp` claim. */
export function isTokenExpired(token: string): boolean {
  const claims = decodeToken(token)
  if (!claims) return true
  return claims.exp * 1000 <= Date.now()
}
