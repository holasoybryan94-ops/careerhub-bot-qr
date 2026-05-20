const { withToken, api, json, attachRefreshedCookies } = require('./_whoop');

exports.handler = async (event) => {
  const { result, tokens } = await withToken(event, async (at) => {
    const page = await api('/activity/workout?limit=10', at);
    if (page.__unauthorized) return page;
    return (page.records || []).map(w => {
      const score = w.score || {};
      const start = new Date(w.start), end = new Date(w.end);
      const kj = score.kilojoule || 0;
      return {
        sport: w.sport_name || `Sport ${w.sport_id}` || 'Activity',
        durationMin: Math.round((end - start) / 60000),
        strain: +(score.strain ?? 0).toFixed(1),
        avgHr: Math.round(score.average_heart_rate ?? 0),
        maxHr: Math.round(score.max_heart_rate ?? 0),
        kcal: Math.round(kj / 4.184),
        date: w.start,
      };
    });
  });
  if (!result) return json(200, null);
  return attachRefreshedCookies(json(200, result), tokens);
};
