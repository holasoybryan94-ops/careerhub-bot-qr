// PulseStack — main app logic.
(async function () {
  // --- Tabs ---
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
      if (btn.dataset.tab === 'trends') renderTrends();
    });
  });

  // --- WHOOP status ---
  const modeBadge = document.getElementById('modeBadge');
  const connectBtn = document.getElementById('connectBtn');
  const mode = await Whoop.status();
  if (mode === 'live') {
    modeBadge.textContent = 'Live';
    modeBadge.classList.add('live');
    connectBtn.textContent = 'Disconnect';
    connectBtn.onclick = () => { window.location.href = Whoop.logoutUrl(); };
  } else {
    connectBtn.onclick = () => { window.location.href = Whoop.loginUrl(); };
  }

  // --- Today ---
  const today = await Whoop.today();
  setRing('recoveryRingFg', 'recoveryValue', today.recovery, 100, recoveryColor(today.recovery));
  setRing('strainRingFg', 'strainValue', today.strain, 21, '#4aa8ff');
  document.getElementById('hrvValue').textContent  = today.hrv;
  document.getElementById('rhrValue').textContent  = today.rhr;
  document.getElementById('spo2Value').textContent = today.spo2;
  document.getElementById('tempValue').textContent = (today.skinTempDelta >= 0 ? '+' : '') + today.skinTempDelta;
  document.getElementById('kcalValue').textContent = today.kcal;
  document.getElementById('avgHrValue').textContent = today.avgHr;

  document.getElementById('insightText').textContent = insightFor(today);

  // --- Sleep ---
  const sl = await Whoop.sleep();
  document.getElementById('sleepDur').textContent  = sl.durationHours;
  document.getElementById('sleepEff').textContent  = sl.efficiency;
  document.getElementById('sleepPerf').textContent = sl.performance;
  document.getElementById('sleepDist').textContent = sl.disturbances;
  document.getElementById('sleepNeed').textContent = sl.need;
  document.getElementById('sleepDebt').textContent = sl.debt;
  renderSleepBars(sl.stages);

  // --- Workouts ---
  const w = await Whoop.workouts();
  renderWorkouts(w);

  // --- Nutrition ---
  initNutrition();

  // --- Render macros on today tab ---
  renderMacroSummary();

  function setRing(fgId, valId, value, max, color) {
    const fg = document.getElementById(fgId);
    const C = 2 * Math.PI * 52; // circumference
    const pct = Math.max(0, Math.min(1, value / max));
    fg.style.strokeDasharray = C;
    fg.style.strokeDashoffset = C * (1 - pct);
    fg.style.stroke = color;
    document.getElementById(valId).textContent = value;
  }

  function recoveryColor(r) {
    if (r >= 67) return '#00e08a';
    if (r >= 34) return '#f7b500';
    return '#ff5a5f';
  }

  function insightFor(t) {
    if (t.recovery >= 67) return 'Green recovery — your body is primed. A high-strain day is well-tolerated.';
    if (t.recovery >= 34) return 'Yellow recovery — maintain moderate strain. Hydrate and watch sleep tonight.';
    return 'Red recovery — prioritize rest. Light activity, more protein, and earlier bedtime.';
  }

  function renderSleepBars(stages) {
    const total = stages.light + stages.deep + stages.rem + stages.awake;
    const bars = document.getElementById('sleepBars');
    bars.innerHTML = '';
    const order = [
      { k: 'light', color: 'var(--light)' },
      { k: 'deep',  color: 'var(--deep)'  },
      { k: 'rem',   color: 'var(--rem)'   },
      { k: 'awake', color: 'var(--awake)' },
    ];
    order.forEach(s => {
      const div = document.createElement('div');
      div.style.background = s.color;
      div.style.width = (stages[s.k] / total * 100) + '%';
      div.title = `${s.k}: ${stages[s.k]} min`;
      bars.appendChild(div);
    });
  }

  function renderWorkouts(list) {
    const ul = document.getElementById('workoutList');
    ul.innerHTML = '';
    if (!list.length) {
      ul.innerHTML = '<li class="muted">No recent activities.</li>';
      return;
    }
    list.forEach(w => {
      const li = document.createElement('li');
      const date = new Date(w.date);
      const dateStr = date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      li.innerHTML = `
        <div>
          <div class="w-name">${w.sport}</div>
          <div class="w-meta">${dateStr} · ${w.durationMin} min · ${w.avgHr}/${w.maxHr} bpm · ${w.kcal} kcal</div>
        </div>
        <div class="w-strain">${w.strain}</div>
      `;
      ul.appendChild(li);
    });
  }

  // --- NUTRITION ---
  function initNutrition() {
    const t = Store.getTargets();
    document.getElementById('tCal').value = t.kcal;
    document.getElementById('tPro').value = t.p;
    document.getElementById('tCar').value = t.c;
    document.getElementById('tFat').value = t.f;

    ['tCal', 'tPro', 'tCar', 'tFat'].forEach(id => {
      document.getElementById(id).addEventListener('change', () => {
        Store.setTargets({
          kcal: +document.getElementById('tCal').value || 0,
          p:    +document.getElementById('tPro').value || 0,
          c:    +document.getElementById('tCar').value || 0,
          f:    +document.getElementById('tFat').value || 0,
        });
        renderMacroBars();
        renderMacroSummary();
      });
    });

    const search = document.getElementById('foodSearch');
    const results = document.getElementById('foodResults');
    search.addEventListener('input', () => {
      const items = Nutrition.search(search.value.trim());
      results.innerHTML = '';
      if (!items.length) { results.classList.remove('show'); return; }
      items.forEach(f => {
        const li = document.createElement('li');
        li.innerHTML = `<div class="fr-name">${f.name}</div>
          <div class="fr-meta">${f.kcal} kcal · P ${f.p} · C ${f.c} · F ${f.f} (per 100g)</div>`;
        li.addEventListener('click', () => {
          document.getElementById('foodName').value = f.name;
          document.getElementById('foodCal').value = f.kcal;
          document.getElementById('foodPro').value = f.p;
          document.getElementById('foodCar').value = f.c;
          document.getElementById('foodFat').value = f.f;
          results.classList.remove('show');
          search.value = f.name;
          document.getElementById('foodQty').focus();
        });
        results.appendChild(li);
      });
      results.classList.add('show');
    });
    document.addEventListener('click', (e) => {
      if (!results.contains(e.target) && e.target !== search) results.classList.remove('show');
    });

    document.getElementById('addMealBtn').addEventListener('click', () => {
      const name = document.getElementById('foodName').value.trim();
      const grams = +document.getElementById('foodQty').value || 0;
      const per100 = {
        kcal: +document.getElementById('foodCal').value || 0,
        p:    +document.getElementById('foodPro').value || 0,
        c:    +document.getElementById('foodCar').value || 0,
        f:    +document.getElementById('foodFat').value || 0,
      };
      const type = document.getElementById('mealType').value;
      if (!name || !grams) return;
      Store.addMeal({ name, grams, per100, type });
      ['foodName','foodQty','foodCal','foodPro','foodCar','foodFat'].forEach(id => document.getElementById(id).value = '');
      document.getElementById('foodSearch').value = '';
      renderMealLog();
      renderMacroBars();
      renderMacroSummary();
    });

    renderMealLog();
    renderMacroBars();
  }

  function renderMealLog() {
    const meals = Store.getMeals();
    const ul = document.getElementById('mealLog');
    ul.innerHTML = '';
    if (!meals.length) {
      ul.innerHTML = '<li class="muted">No meals logged today.</li>';
      return;
    }
    meals.forEach(m => {
      const factor = (m.grams || 0) / 100;
      const kcal = Math.round((m.per100.kcal || 0) * factor);
      const li = document.createElement('li');
      li.innerHTML = `
        <div>
          <div class="ml-name">${m.name}</div>
          <div class="ml-meta">${m.type} · ${m.grams} g · P ${(m.per100.p*factor).toFixed(1)} / C ${(m.per100.c*factor).toFixed(1)} / F ${(m.per100.f*factor).toFixed(1)}</div>
        </div>
        <div class="ml-kcal">${kcal} kcal</div>
        <button class="ml-del" data-id="${m.id}">Remove</button>
      `;
      ul.appendChild(li);
    });
    ul.querySelectorAll('.ml-del').forEach(b => {
      b.addEventListener('click', () => {
        Store.removeMeal(b.dataset.id);
        renderMealLog();
        renderMacroBars();
        renderMacroSummary();
      });
    });
  }

  function renderMacroBars() {
    const meals = Store.getMeals();
    const t = Store.getTargets();
    const totals = Nutrition.totals(meals);
    const wrap = document.getElementById('macroBars');
    wrap.innerHTML = '';
    const rows = [
      { label: 'Calories', value: totals.kcal, target: t.kcal, cls: '' },
      { label: 'Protein',  value: totals.p,    target: t.p,    cls: 'protein' },
      { label: 'Carbs',    value: totals.c,    target: t.c,    cls: 'carbs' },
      { label: 'Fat',      value: totals.f,    target: t.f,    cls: 'fat' },
    ];
    rows.forEach(r => {
      const pct = r.target > 0 ? Math.min(100, (r.value / r.target) * 100) : 0;
      const div = document.createElement('div');
      div.className = 'macro-bar';
      div.innerHTML = `
        <div class="label">${r.label}</div>
        <div class="track"><div class="fill ${r.cls}" style="width:${pct}%"></div></div>
        <div class="num">${Nutrition.format(r.value)} / ${r.target}</div>`;
      wrap.appendChild(div);
    });
  }

  function renderMacroSummary() {
    const meals = Store.getMeals();
    const totals = Nutrition.totals(meals);
    const t = Store.getTargets();
    const left = Math.max(0, t.kcal - totals.kcal);
    const el = document.getElementById('macroSummary');
    el.innerHTML = `
      <div class="ms"><div class="v">${Nutrition.format(totals.kcal)}</div><div class="l">kcal in</div></div>
      <div class="ms"><div class="v">${Nutrition.format(totals.p)}</div><div class="l">protein g</div></div>
      <div class="ms"><div class="v">${Nutrition.format(totals.c)}</div><div class="l">carbs g</div></div>
      <div class="ms"><div class="v">${Nutrition.format(left)}</div><div class="l">kcal left</div></div>
    `;
  }

  // --- TRENDS ---
  let trendRendered = false;
  async function renderTrends() {
    if (trendRendered) return;
    trendRendered = true;
    const data = await Whoop.trend();
    const labels = data.map(d => d.date.slice(5));
    Charts.line(document.getElementById('recoveryChart'), labels, data.map(d => d.recovery), '#00e08a');
    Charts.dualBar(document.getElementById('strainChart'), labels, data.map(d => d.strain), data.map(d => d.kcalIn / 100), '#4aa8ff', '#ff8a5b');
    Charts.line(document.getElementById('hrvChart'), labels, data.map(d => d.hrv), '#b48cff');
  }
})();
