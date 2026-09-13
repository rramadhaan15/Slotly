import { env } from 'cloudflare:workers';
import { createSession, sessionCookie } from '@/lib/auth';
import { database } from '@/lib/db';

type GoogleProfile = {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
};

function cookieValue(request: Request, name: string) {
  for (const item of (request.headers.get('cookie') ?? '').split(';')) {
    const [key, ...value] = item.trim().split('=');
    if (key === name) return value.join('=');
  }
  return null;
}

function clearOauthCookie(name: string, secure: boolean) {
  return `${name}=; Path=/api/auth/google; HttpOnly; SameSite=Lax; Max-Age=0${secure ? '; Secure' : ''}`;
}

function signInError(origin: string, code: string, secure = false) {
  const response = Response.redirect(
    new URL(`/signin?error=${code}`, origin),
    302,
  );
  response.headers.append(
    'Set-Cookie',
    clearOauthCookie('slotly_google_state', secure),
  );
  response.headers.append(
    'Set-Cookie',
    clearOauthCookie('slotly_google_verifier', secure),
  );
  return response;
}

export async function GET(request: Request) {
  const current = new URL(request.url);
  const secure = current.protocol === 'https:';
  const origin = current.origin;
  const state = current.searchParams.get('state');
  const code = current.searchParams.get('code');
  const expectedState = cookieValue(request, 'slotly_google_state');
  const verifier = cookieValue(request, 'slotly_google_verifier');
  if (!code || !state || !expectedState || state !== expectedState || !verifier)
    return signInError(origin, 'google_cancelled', secure);

  const config = env as unknown as {
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
  };
  if (!config.GOOGLE_CLIENT_ID || !config.GOOGLE_CLIENT_SECRET)
    return signInError(origin, 'google_not_configured', secure);

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: config.GOOGLE_CLIENT_ID,
        client_secret: config.GOOGLE_CLIENT_SECRET,
        redirect_uri: new URL('/api/auth/google/callback', origin).toString(),
        grant_type: 'authorization_code',
        code_verifier: verifier,
      }),
    });
    if (!tokenResponse.ok) throw new Error('Token exchange failed');
    const token = (await tokenResponse.json()) as { access_token?: string };
    if (!token.access_token) throw new Error('Missing access token');

    const profileResponse = await fetch(
      'https://openidconnect.googleapis.com/v1/userinfo',
      {
        headers: { Authorization: `Bearer ${token.access_token}` },
      },
    );
    if (!profileResponse.ok) throw new Error('Profile request failed');
    const profile = (await profileResponse.json()) as GoogleProfile;
    if (!profile.sub || !profile.email || !profile.email_verified)
      throw new Error('Unverified Google account');

    const email = profile.email.toLowerCase();
    const db = database();
    const linked = await db
      .prepare(
        "SELECT oauth_accounts.user_id FROM oauth_accounts JOIN users ON users.id=oauth_accounts.user_id WHERE oauth_accounts.provider='google' AND oauth_accounts.provider_user_id=?",
      )
      .bind(profile.sub)
      .first<{ user_id: string }>();
    let userId = linked?.user_id;

    if (!userId) {
      const existing = await db
        .prepare('SELECT id FROM users WHERE email=?')
        .bind(email)
        .first<{ id: string }>();
      userId = existing?.id;
      if (!userId)
        return signInError(origin, 'google_account_not_found', secure);
      await db
        .prepare(
          "INSERT OR IGNORE INTO oauth_accounts(provider,provider_user_id,user_id,created_at) VALUES('google',?,?,?)",
        )
        .bind(profile.sub, userId, Math.floor(Date.now() / 1000))
        .run();
    }

    const session = await createSession(db, userId);
    const response = Response.redirect(new URL('/dashboard', origin), 302);
    response.headers.append('Set-Cookie', sessionCookie(session, secure));
    response.headers.append(
      'Set-Cookie',
      clearOauthCookie('slotly_google_state', secure),
    );
    response.headers.append(
      'Set-Cookie',
      clearOauthCookie('slotly_google_verifier', secure),
    );
    return response;
  } catch (error) {
    console.error(
      'Google sign-in failed',
      error instanceof Error ? error.message : 'Unknown error',
    );
    return signInError(origin, 'google_failed', secure);
  }
}
