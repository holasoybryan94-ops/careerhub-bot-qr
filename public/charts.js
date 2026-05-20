// Tiny dependency-free chart helpers (line + bar) tuned for dark UI.
const Charts = (() => {
  function dpr() { return window.devicePixelRatio || 1; }

  function setupCanvas(canvas) {
    const ratio = dpr();
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = (canvas.height || 140) * ratio / (canvas.height ? 1 : 1);
    canvas.style.height = (canvas.height / ratio) + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(ratio, ratio);
    return { ctx, w: rect.width, h: canvas.height / ratio };
  }

  function line(canvas, labels, values, color) {
    const { ctx, w, h } = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);
    const pad = { l: 28, r: 8, t: 10, b: 22 };
    const min = Math.min(...values, 0);
    const max = Math.max(...values, 1);
    const range = (max - min) || 1;
    const px = i => pad.l + (i * (w - pad.l - pad.r)) / Math.max(values.length - 1, 1);
    const py = v => pad.t + (h - pad.t - pad.b) * (1 - (v - min) / range);

    // grid + axes
    ctx.strokeStyle = '#232a33';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#8b97a4';
    ctx.font = '10px -apple-system, system-ui, sans-serif';
    for (let g = 0; g < 4; g++) {
      const y = pad.t + (g * (h - pad.t - pad.b)) / 3;
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
      const val = max - (g * range / 3);
      ctx.fillText(Math.round(val), 2, y + 3);
    }
    labels.forEach((lab, i) => {
      ctx.fillText(lab, px(i) - 10, h - 6);
    });

    // area
    const grad = ctx.createLinearGradient(0, pad.t, 0, h - pad.b);
    grad.addColorStop(0, color + '55');
    grad.addColorStop(1, color + '00');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(px(0), py(values[0]));
    values.forEach((v, i) => ctx.lineTo(px(i), py(v)));
    ctx.lineTo(px(values.length - 1), h - pad.b);
    ctx.lineTo(px(0), h - pad.b);
    ctx.closePath();
    ctx.fill();

    // line
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    values.forEach((v, i) => {
      if (i === 0) ctx.moveTo(px(i), py(v));
      else ctx.lineTo(px(i), py(v));
    });
    ctx.stroke();

    // dots
    ctx.fillStyle = color;
    values.forEach((v, i) => {
      ctx.beginPath(); ctx.arc(px(i), py(v), 3, 0, Math.PI * 2); ctx.fill();
    });
  }

  function dualBar(canvas, labels, a, b, colorA, colorB) {
    const { ctx, w, h } = setupCanvas(canvas);
    ctx.clearRect(0, 0, w, h);
    const pad = { l: 28, r: 8, t: 10, b: 22 };
    const max = Math.max(...a, ...b, 1);
    const groupW = (w - pad.l - pad.r) / labels.length;
    const barW = groupW / 3;

    ctx.strokeStyle = '#232a33';
    ctx.fillStyle = '#8b97a4';
    ctx.font = '10px -apple-system, system-ui, sans-serif';
    for (let g = 0; g < 4; g++) {
      const y = pad.t + (g * (h - pad.t - pad.b)) / 3;
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke();
      const val = max - (g * max / 3);
      ctx.fillText(Math.round(val), 2, y + 3);
    }

    labels.forEach((lab, i) => {
      const x0 = pad.l + i * groupW + groupW / 2 - barW;
      const hA = ((h - pad.t - pad.b) * a[i]) / max;
      const hB = ((h - pad.t - pad.b) * b[i]) / max;
      ctx.fillStyle = colorA;
      ctx.fillRect(x0, h - pad.b - hA, barW * 0.9, hA);
      ctx.fillStyle = colorB;
      ctx.fillRect(x0 + barW, h - pad.b - hB, barW * 0.9, hB);
      ctx.fillStyle = '#8b97a4';
      ctx.fillText(lab, x0 + barW * 0.3, h - 6);
    });
  }

  return { line, dualBar };
})();
