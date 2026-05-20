const { exchangeCode, parseCookies, cookie } = require('./_whoop');

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  const cookies = parseCookies(event.headers.cookie || event.headers.Cookie);
  if (!params.code) return { statusCode: 400, body: 'Missing code' };
  if (!params.state || params.state !== cookies['whoop_state']) {
    return { statusCode: 400, body: 'State mismatch' };
  }
  try {
    const tokens = await exchangeCode(params.code);
    const setCookies = [
      cookie('whoop_at', tokens.access_token, tokens.expires_in || 3600),
      cookie('whoop_rt', tokens.refresh_token || '', 60 * 60 * 24 * 60),
      cookie('whoop_state', '', 0),
    ];
    return {
      statusCode: 302,
      headers: { Location: '/' },
      multiValueHeaders: { 'Set-Cookie': setCookies },
      body: '',
    };
  } catch (e) {
    return { statusCode: 500, body: 'OAuth exchange failed: ' + e.message };
  }
};
