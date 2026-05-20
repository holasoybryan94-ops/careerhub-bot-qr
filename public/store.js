// LocalStorage-backed store for meals, targets, and cached WHOOP responses.
const Store = (() => {
  const NS = 'pulsestack.v1';
  const k = (key) => `${NS}.${key}`;

  function get(key, fallback) {
    try {
      const raw = localStorage.getItem(k(key));
      return raw == null ? fallback : JSON.parse(raw);
    } catch { return fallback; }
  }
  function set(key, value) {
    try { localStorage.setItem(k(key), JSON.stringify(value)); } catch {}
  }
  function remove(key) { try { localStorage.removeItem(k(key)); } catch {} }

  function todayKey(d = new Date()) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // Meals: { 'YYYY-MM-DD': [ {id, name, type, grams, per100: {kcal,p,c,f}, ts} ] }
  function getMeals(date = todayKey()) {
    const all = get('meals', {});
    return all[date] || [];
  }
  function addMeal(meal, date = todayKey()) {
    const all = get('meals', {});
    if (!all[date]) all[date] = [];
    all[date].push({ id: crypto.randomUUID?.() || String(Date.now()), ts: Date.now(), ...meal });
    set('meals', all);
  }
  function removeMeal(id, date = todayKey()) {
    const all = get('meals', {});
    all[date] = (all[date] || []).filter(m => m.id !== id);
    set('meals', all);
  }

  function getTargets() {
    return get('targets', { kcal: 2400, p: 180, c: 240, f: 70 });
  }
  function setTargets(t) { set('targets', t); }

  return { get, set, remove, todayKey, getMeals, addMeal, removeMeal, getTargets, setTargets };
})();
