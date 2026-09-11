import { env } from 'cloudflare:workers';

const STATE_COOKIE = 'slotly_google_state';
const VERIFIER_COOKIE = 'slotly_google_verifier';

function base64Url(bytes: Uint8Array) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function oauthCookie(name: string, value: string, secure: boolean) {
  return [
    `${name}=${value}`,
    'Path=/api/auth/google',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=600',
    secure ? 'Secure' : '',
  ].filter(Boolean).join('; ');
}

export async function GET(request: Request) {
  const clientId = (env as unknown as { GOOGLE_CLIENT_ID?: string }).GOOGLE_CLIENT_ID;
  const current = new URL(request.url);
  if (!clientId)
    return Response.redirect(new URL('/signin?error=google_not_configured', current), 302);

  const secure = current.protocol === 'https:';
  const state = base64Url(crypto.getRandomValues(new Uint8Array(24)));
  const verifier = base64Url(crypto.getRandomValues(new Uint8Array(48)));
  const challenge = base64Url(
    new Uint8Array(
      await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)),
    ),
  );
  const callback = new URL('/api/auth/google/callback', current.origin);
  const google = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  google.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callback.toString(),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    prompt: 'select_account',
  }).toString();

  const response = Response.redirect(google, 302);
  response.headers.append('Set-Cookie', oauthCookie(STATE_COOKIE, state, secure));
  response.headers.append('Set-Cookie', oauthCookie(VERIFIER_COOKIE, verifier, secure));
  return response;
}
