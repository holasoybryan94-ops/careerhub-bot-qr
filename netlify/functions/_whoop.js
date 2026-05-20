// Shared helpers for WHOOP API integration. Underscore prefix prevents Netlify
// from exposing this as its own HTTP function.

const WHOOP_AUTH = 'https://api.prod.whoop.com/oauth/oauth2/auth';
const WHOOP_TOKEN = 'https://api.prod.whoop.com/oauth/oauth2/token';
const WHOOP_API = 'https://api.prod.whoop.com/developer/v1';

const SCOPES = [
  'read:recovery',
  'read:cycles',
  'read:sleep',
  'read:workout',
  'read:profile',
  'read:body_measurement',
  'offline',
].join(' ');

function env() {
  const clientId = process.env.WHOOP_CLIENT_ID;
  const clientSecret = process.env.WHOOP_CLIENT_SECRET;
  const redirectUri = process.env.WHOOP_REDIRECT_URI;
  return { clientId, clientSecret, redirectUri };
}

function parseCookies(header) {
  const out = {};
  (header || '').split(/;\s*/).forEach(p => {
    const i = p.indexOf('=');
    if (i > 0) out[p.slice(0, i)] = decodeURIComponent(p.slice(i + 1));
  });
  return out;
}

function cookie(name, value, maxAgeSec) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
  ];
  if (maxAgeSec === 0) parts.push('Max-Age=0');
  else if (maxAgeSec) parts.push(`Max-Age=${maxAgeSec}`);
  return parts.join('; ');
}

async function exchangeCode(code) {
  const { clientId, clientSecret, redirectUri } = env();
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  });
  const res = await fetch(WHOOP_TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) throw new Error('token_exchange_failed: ' + (await res.text()));
  return res.json();
}

async function refreshAccessToken(refreshToken) {
  const { clientId, clientSecret } = env();
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    scope: SCOPES,
  });
  const res = await fetch(WHOOP_TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) throw new Error('refresh_failed');
  return res.json();
}

async function withToken(event, fn) {
  const cookies = parseCookies(event.headers.cookie || event.headers.Cookie);
  let access = cookies['whoop_at'];
  const refresh = cookies['whoop_rt'];
  if (!access && !refresh) return { error: 'not_connected' };

  let tokens = null;
  let result;
  try {
    result = await fn(access);
    if (result && result.__unauthorized && refresh) throw new Error('expired');
  } catch (e) {
    if (!refresh) return { error: 'not_connected' };
    tokens = await refreshAccessToken(refresh);
    result = await fn(tokens.access_token);
  }
  return { result, tokens };
}

async function api(path, accessToken) {
  const res = await fetch(`${WHOOP_API}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (res.status === 401) return { __unauthorized: true };
  if (!res.ok) throw new Error(`whoop_api_${res.status}: ${await res.text()}`);
  return res.json();
}

function json(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
    body: JSON.stringify(body),
  };
}

function attachRefreshedCookies(response, tokens) {
  if (!tokens) return response;
  const setCookies = [
    cookie('whoop_at', tokens.access_token, tokens.expires_in || 3600),
    tokens.refresh_token ? cookie('whoop_rt', tokens.refresh_token, 60 * 60 * 24 * 60) : null,
  ].filter(Boolean);
  return {
    ...response,
    multiValueHeaders: { ...(response.multiValueHeaders || {}), 'Set-Cookie': setCookies },
  };
}

module.exports = {
  WHOOP_AUTH, WHOOP_TOKEN, WHOOP_API, SCOPES,
  env, parseCookies, cookie,
  exchangeCode, refreshAccessToken,
  withToken, api, json, attachRefreshedCookies,
};
