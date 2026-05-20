// WHOOP API client. In production, calls go through /api/whoop/* on Netlify
// (server-side proxy that attaches the OAuth token from an httpOnly cookie).
// If the proxy reports "not_connected", we fall back to demo data so the UI
// is always usable.
const Whoop = (() => {
  let mode = 'demo'; // 'demo' | 'live'

  async function fetchJson(path) {
    try {
      const res = await fetch(path, { credentials: 'include' });
      if (!res.ok) throw new Error(res.status + '');
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  async function status() {
    const s = await fetchJson('/api/whoop/status');
    mode = s && s.connected ? 'live' : 'demo';
    return mode;
  }

  function loginUrl() { return '/api/whoop/login'; }
  function logoutUrl() { return '/api/whoop/logout'; }

  // --- LIVE fetchers (will return null if not connected) ---
  async function liveToday() {
    const today = await fetchJson('/api/whoop/today');
    return today;
  }
  async function liveSleep() { return await fetchJson('/api/whoop/sleep'); }
  async function liveWorkouts() { return await fetchJson('/api/whoop/workouts'); }
  async function liveTrend() { return await fetchJson('/api/whoop/trend'); }

  // --- DEMO data generator ---
  function rnd(seed) { // simple deterministic-ish generator
    return () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  }

  function demoToday() {
    const r = rnd(new Date().getDate() * 13 + 7);
    const recovery = Math.round(45 + r() * 50);
    const strain   = +(8 + r() * 10).toFixed(1);
    return {
      recovery,
      strain,
      hrv: Math.round(40 + r() * 60),
      rhr: Math.round(48 + r() * 14),
      spo2: +(95 + r() * 3).toFixed(1),
      skinTempDelta: +((-0.5 + r() * 1.0)).toFixed(2),
      kcal: Math.round(2200 + r() * 900),
      avgHr: Math.round(70 + r() * 25),
    };
  }

  function demoSleep() {
    const r = rnd(101);
    const durMin = Math.round(360 + r() * 150);
    const light = Math.round(durMin * 0.5);
    const deep  = Math.round(durMin * 0.2);
    const rem   = Math.round(durMin * 0.25);
    const awake = durMin - light - deep - rem;
    return {
      durationHours: +(durMin / 60).toFixed(1),
      efficiency: Math.round(85 + r() * 12),
      performance: Math.round(70 + r() * 25),
      disturbances: Math.round(r() * 6),
      stages: { light, deep, rem, awake },
      need: +(7.5 + r() * 1.5).toFixed(1),
      debt: Math.round(r() * 90),
    };
  }

  function demoWorkouts() {
    const types = ['Running', 'Strength', 'Cycling', 'HIIT', 'Yoga', 'Swimming', 'Walking'];
    const out = [];
    const r = rnd(42);
    for (let i = 0; i < 5; i++) {
      const t = types[Math.floor(r() * types.length)];
      const min = Math.round(20 + r() * 70);
      const strain = +(4 + r() * 12).toFixed(1);
      const d = new Date(); d.setDate(d.getDate() - i);
      out.push({
        sport: t,
        durationMin: min,
        strain,
        avgHr: Math.round(110 + r() * 50),
        maxHr: Math.round(155 + r() * 30),
        kcal: Math.round(150 + r() * 600),
        date: d.toISOString(),
      });
    }
    return out;
  }

  function demoTrend() {
    const days = 7;
    const out = [];
    const r = rnd(7);
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      out.push({
        date: d.toISOString().slice(0, 10),
        recovery: Math.round(45 + r() * 50),
        strain: +(7 + r() * 11).toFixed(1),
        hrv: Math.round(40 + r() * 60),
        kcalIn: Math.round(1800 + r() * 1000),
      });
    }
    return out;
  }

  // --- Public API: try live first, fall back to demo ---
  async function today()    { return (mode === 'live' && await liveToday())    || demoToday();    }
  async function sleep()    { return (mode === 'live' && await liveSleep())    || demoSleep();    }
  async function workouts() { return (mode === 'live' && await liveWorkouts()) || demoWorkouts(); }
  async function trend()    { return (mode === 'live' && await liveTrend())    || demoTrend();    }

  return { status, today, sleep, workouts, trend, loginUrl, logoutUrl, get mode() { return mode; } };
})();
