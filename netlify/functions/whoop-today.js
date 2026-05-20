const { withToken, api, json, attachRefreshedCookies } = require('./_whoop');

// Returns the most recent cycle + its recovery summary, shaped for the UI.
exports.handler = async (event) => {
  const { result, tokens } = await withToken(event, async (at) => {
    const cyclePage = await api('/cycle?limit=1', at);
    if (cyclePage.__unauthorized) return cyclePage;
    const cycle = (cyclePage.records || [])[0];
    if (!cycle) return null;
    const rec = await api(`/cycle/${cycle.id}/recovery`, at);
    if (rec.__unauthorized) return rec;
    const score = cycle.score || {};
    const recScore = (rec && rec.score) || {};
    const kj = score.kilojoule || 0;
    return {
      recovery: Math.round(recScore.recovery_score ?? 0),
      strain: +(score.strain ?? 0).toFixed(1),
      hrv: Math.round(recScore.hrv_rmssd_milli ?? 0),
      rhr: Math.round(recScore.resting_heart_rate ?? 0),
      spo2: +((recScore.spo2_percentage ?? 0)).toFixed(1),
      skinTempDelta: +((recScore.skin_temp_celsius ?? 0)).toFixed(2),
      kcal: Math.round(kj / 4.184),
      avgHr: Math.round(score.average_heart_rate ?? 0),
    };
  });
  if (!result) return json(200, null);
  return attachRefreshedCookies(json(200, result), tokens);
};
