const { WHOOP_AUTH, SCOPES, env, cookie } = require('./_whoop');

exports.handler = async (event) => {
  const { clientId, redirectUri } = env();
  if (!clientId || !redirectUri) {
    return { statusCode: 500, body: 'WHOOP_CLIENT_ID or WHOOP_REDIRECT_URI not configured.' };
  }
  const state = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: SCOPES,
    state,
  });
  return {
    statusCode: 302,
    headers: { Location: `${WHOOP_AUTH}?${params.toString()}` },
    multiValueHeaders: { 'Set-Cookie': [cookie('whoop_state', state, 600)] },
    body: '',
  };
};
