const { cookie } = require('./_whoop');

exports.handler = async () => ({
  statusCode: 302,
  headers: { Location: '/' },
  multiValueHeaders: { 'Set-Cookie': [
    cookie('whoop_at', '', 0),
    cookie('whoop_rt', '', 0),
  ]},
  body: '',
});
