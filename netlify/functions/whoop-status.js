const { parseCookies, json } = require('./_whoop');

exports.handler = async (event) => {
  const cookies = parseCookies(event.headers.cookie || event.headers.Cookie);
  const connected = Boolean(cookies['whoop_at'] || cookies['whoop_rt']);
  return json(200, { connected });
};
