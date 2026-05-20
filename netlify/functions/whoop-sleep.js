const { withToken, api, json, attachRefreshedCookies } = require('./_whoop');

exports.handler = async (event) => {
  const { result, tokens } = await withToken(event, async (at) => {
    const page = await api('/activity/sleep?limit=1', at);
    if (page.__unauthorized) return page;
    const s = (page.records || [])[0];
    if (!s) return null;
    const score = s.score || {};
    const stages = score.stage_summary || {};
    const toMin = (ms) => Math.round((ms || 0) / 60000);
    const start = new Date(s.start), end = new Date(s.end);
    const durationHours = +(((end - start) / 3600000)).toFixed(1);
    return {
      durationHours,
      efficiency: Math.round(score.sleep_efficiency_percentage ?? 0),
      performance: Math.round(score.sleep_performance_percentage ?? 0),
      disturbances: stages.disturbance_count ?? 0,
      stages: {
        light: toMin(stages.total_light_sleep_time_milli),
        deep:  toMin(stages.total_slow_wave_sleep_time_milli),
        rem:   toMin(stages.total_rem_sleep_time_milli),
        awake: toMin(stages.total_awake_time_milli),
      },
      need: +(((score.sleep_needed?.baseline_milli ?? 0) / 3600000)).toFixed(1),
      debt: toMin(score.sleep_needed?.need_from_sleep_debt_milli),
    };
  });
  if (!result) return json(200, null);
  return attachRefreshedCookies(json(200, result), tokens);
};
