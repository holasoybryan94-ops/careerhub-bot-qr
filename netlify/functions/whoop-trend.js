const { withToken, api, json, attachRefreshedCookies } = require('./_whoop');

exports.handler = async (event) => {
  const { result, tokens } = await withToken(event, async (at) => {
    const cyclesPage = await api('/cycle?limit=7', at);
    if (cyclesPage.__unauthorized) return cyclesPage;
    const cycles = (cyclesPage.records || []).slice().reverse();
    const out = [];
    for (const c of cycles) {
      const rec = await api(`/cycle/${c.id}/recovery`, at).catch(() => null);
      const recScore = (rec && rec.score) || {};
      out.push({
        date: (c.start || '').slice(0, 10),
        recovery: Math.round(recScore.recovery_score ?? 0),
        strain: +((c.score?.strain) ?? 0).toFixed(1),
        hrv: Math.round(recScore.hrv_rmssd_milli ?? 0),
        kcalIn: 0,
      });
    }
    return out;
  });
  if (!result) return json(200, null);
  return attachRefreshedCookies(json(200, result), tokens);
};
