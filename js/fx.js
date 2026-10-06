/* Pixel confetti + fireworks on a low-res overlay canvas. */
const FX = (() => {
  const cv = document.getElementById('fx');
  const ctx = cv.getContext('2d');
  const P = 4;
  let W = 0, H = 0, parts = [], rockets = [], running = false, last = 0, auto = false, autoT = 0;
  const COLS = ['#ff8fab', '#ffd970', '#c9b6f2', '#ff7b7b', '#ffcfa8', '#fffaf0', '#ff5f73', '#a8e6cf'];
  const pick = a => a[(Math.random() * a.length) | 0];

  function resize() {
    W = Math.ceil(innerWidth / P); H = Math.ceil(innerHeight / P);
    cv.width = W; cv.height = H;
    cv.style.width = W * P + 'px'; cv.style.height = H * P + 'px';
  }
  function kick() { if (!running) { running = true; last = performance.now(); requestAnimationFrame(loop); } }

  function confetti(n) {
    n = n || 140;
    for (let i = 0; i < n; i++) {
      parts.push({ x: Math.random() * W, y: -Math.random() * H * 0.5 - 2, vx: (Math.random() - 0.5) * 16,
        vy: 10 + Math.random() * 20, g: 6, drag: 0.6, life: 3.5 + Math.random() * 2.5, max: 6,
        c: pick(COLS), s: Math.random() < 0.3 ? 2 : 1, wob: Math.random() * 6 });
    }
    kick();
  }
  function burst(x, y, n, cols) {
    n = n || 46; const c1 = pick(cols || COLS), c2 = pick(cols || COLS);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.2, sp = 18 + Math.random() * 26;
      parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: 14, drag: 1.4,
        life: 0.9 + Math.random() * 0.8, max: 1.7, c: i % 2 ? c1 : c2, s: 1, wob: 0, spark: true });
    }
    kick();
  }
  function burstAt(clientX, clientY, n) { burst(clientX / P, clientY / P, n); }
  function firework() {
    rockets.push({ x: W * (0.15 + Math.random() * 0.7), y: H + 2, vy: -(H * 0.9 + Math.random() * 20), ty: H * (0.12 + Math.random() * 0.35) });
    kick();
  }
  function show(nFire) { confetti(160); for (let i = 0; i < (nFire || 4); i++) setTimeout(firework, i * 280); }
  function setAuto(v) { auto = v; autoT = 0; if (v) kick(); }

  function loop(ts) {
    const dt = Math.min(0.05, (ts - last) / 1000); last = ts;
    if (auto) { autoT -= dt; if (autoT <= 0) { firework(); autoT = 0.7 + Math.random() * 0.9; } }
    ctx.clearRect(0, 0, W, H);
    for (let i = rockets.length - 1; i >= 0; i--) {
      const r = rockets[i];
      r.y += r.vy * dt; r.vy *= 1 - 0.6 * dt;
      ctx.fillStyle = '#fffaf0'; ctx.fillRect(r.x | 0, r.y | 0, 1, 2);
      ctx.fillStyle = '#ffd970'; ctx.fillRect(r.x | 0, (r.y + 2) | 0, 1, 1);
      if (r.y <= r.ty) { burst(r.x, r.y, 40 + (Math.random() * 20 | 0)); Sound.play('pop'); rockets.splice(i, 1); }
    }
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life -= dt;
      if (p.life <= 0 || p.y > H + 4) { parts.splice(i, 1); continue; }
      p.vx *= 1 - p.drag * dt; p.vy += p.g * dt; p.vy *= 1 - (p.spark ? p.drag : 0.2) * dt;
      p.x += (p.vx + (p.wob ? Math.sin(ts / 300 + p.wob) * 6 : 0)) * dt; p.y += p.vy * dt;
      if (p.spark && p.life < 0.35 && ((ts / 80) | 0) % 2) continue;
      ctx.fillStyle = p.c; ctx.fillRect(p.x | 0, p.y | 0, p.s, p.s);
    }
    if (parts.length || rockets.length || auto) requestAnimationFrame(loop);
    else { running = false; ctx.clearRect(0, 0, W, H); }
  }
  resize();
  addEventListener('resize', resize);
  return { confetti, burst, burstAt, firework, show, setAuto, resize };
})();
