/* The walkable level: collect 5 hearts -> chapters -> gift near Fina. */
const Game = (() => {
  const T = 16, COLS = 28, ROWS = 20, WW = COLS * T, WH = ROWS * T;
  const cv = document.getElementById('game');
  const ctx = cv.getContext('2d');
  const stage = document.getElementById('stage');
  const dlg = document.getElementById('dialog');
  const dlgTitle = document.getElementById('dlgTitle');
  const dlgText = document.getElementById('dlgText');
  const typer = Typer(dlgText, { speed: 22, onChar: () => Sound.play('blip') });

  const WAY = [[2, 17], [10, 17], [10, 12], [4, 12], [4, 6], [13, 6], [13, 10], [20, 10], [20, 4], [22, 4]];
  const HEART_POS = [[10, 15], [6, 12], [8, 6], [17, 10], [20, 7]];
  const PLAZA = { x0: 21, y0: 1, x1: 26, y1: 5 };
  const POND = { x0: 15, y0: 13, x1: 18, y1: 16 };
  const NPC = { x: 24 * T + 8, y: 2 * T + 14 }; // the boy waits here with the gift
  const GIFT = { x: 22 * T + 8, y: 3 * T + 10 };
  const GRASS = '#d4ecb0', GRASS_D = '#b5d98f', GRASS_L = '#e6f6c9';
  const SAND = '#f8deae', SAND_D = '#e4bd85', SAND_L = '#fff0d2';
  const WATER = '#b9c8f5', WATER_D = '#8e9fe2', WATER_L = '#e8eeff';

  let tiles, solid, bg;
  let scale = 2, vw = 320, vh = 180;
  let player, cam, hearts, collected, giftShown, finished, target, stuck, nearNpc, introShown;
  let running = false, raf = 0, last = 0, time = 0, parts = [];
  let dialogOpen = false, dialogCb = null, openedAt = 0;
  const keys = new Set(), pad = { x: 0, y: 0 };
  let onComplete = () => {}, onHud = () => {}, onTip = () => {};

  /* ---------- world ---------- */
  function buildWorld() {
    tiles = Array.from({ length: ROWS }, () => Array(COLS).fill('g'));
    for (let i = 0; i < WAY.length - 1; i++) {
      const [x0, y0] = WAY[i], [x1, y1] = WAY[i + 1];
      const sx = Math.sign(x1 - x0), sy = Math.sign(y1 - y0);
      let x = x0, y = y0; tiles[y][x] = 'p';
      while (x !== x1 || y !== y1) { x += sx; y += sy; tiles[y][x] = 'p'; }
    }
    for (let y = PLAZA.y0; y <= PLAZA.y1; y++) for (let x = PLAZA.x0; x <= PLAZA.x1; x++) tiles[y][x] = 'z';
    for (let y = POND.y0; y <= POND.y1; y++) for (let x = POND.x0; x <= POND.x1; x++) tiles[y][x] = 'w';
    // round the pond corners
    [[POND.x0, POND.y0], [POND.x1, POND.y0], [POND.x0, POND.y1], [POND.x1, POND.y1]].forEach(([x, y]) => tiles[y][x] = 'g');
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (x === 0 || y === 0 || x === COLS - 1 || y === ROWS - 1) tiles[y][x] = 't';
    const near = (x, y, d) => {
      for (let dy = -d; dy <= d; dy++) for (let dx = -d; dx <= d; dx++) {
        const c = tiles[y + dy] && tiles[y + dy][x + dx];
        if (c === 'p' || c === 'z' || c === 'w') return true;
      }
      return false;
    };
    const R = rng(2710);
    for (let y = 1; y < ROWS - 1; y++) for (let x = 1; x < COLS - 1; x++) {
      if (tiles[y][x] === 'g' && !near(x, y, 1) && R() < 0.22) tiles[y][x] = 't';
    }
    solid = tiles.map(row => row.map(c => c === 't' || c === 'w'));

    bg = document.createElement('canvas'); bg.width = WW; bg.height = WH;
    const g = bg.getContext('2d');
    const r = (a, b, w, h, c) => { g.fillStyle = c; g.fillRect(a, b, w, h); };
    const R2 = rng(99);
    const ri = n => (R2() * n) | 0;
    r(0, 0, WW, WH, GRASS);
    const isWalk = (x, y) => { const c = tiles[y] && tiles[y][x]; return c === 'p' || c === 'z'; };
    const isWater = (x, y) => tiles[y] && tiles[y][x] === 'w';
    const flower = (x, y, c) => { r(x + 1, y, 1, 1, c); r(x, y + 1, 1, 1, c); r(x + 2, y + 1, 1, 1, c); r(x + 1, y + 2, 1, 1, c); r(x + 1, y + 1, 1, 1, '#ffd970'); };
    const FL = ['#ff9ec4', '#fffaf0', '#c9b6f2', '#ff7b7b', '#ffcfa8'];
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      const c = tiles[y][x], px = x * T, py = y * T;
      if (c === 'g' || c === 't') {
        for (let k = 0; k < 2; k++) if (R2() < 0.6) { const gx = px + ri(13), gy = py + ri(13); r(gx, gy, 1, 1, GRASS_D); r(gx + 2, gy, 1, 1, GRASS_D); r(gx + 1, gy + 1, 1, 1, GRASS_D); }
        if (R2() < 0.5) r(px + ri(15), py + ri(15), 1, 1, GRASS_L);
        if (c === 'g' && R2() < 0.25) flower(px + 2 + ri(10), py + 2 + ri(10), FL[ri(FL.length)]);
      } else if (c === 'p' || c === 'z') {
        r(px, py, T, T, SAND);
        for (let k = 0; k < 3; k++) r(px + 2 + ri(12), py + 2 + ri(12), 1 + ri(2), 1, SAND_D);
        if (R2() < 0.5) r(px + 2 + ri(12), py + 2 + ri(12), 2, 1, SAND_L);
        if (!isWalk(x, y - 1)) r(px, py, T, 1, SAND_D);
        if (!isWalk(x, y + 1)) r(px, py + T - 1, T, 1, SAND_D);
        if (!isWalk(x - 1, y)) r(px, py, 1, T, SAND_D);
        if (!isWalk(x + 1, y)) r(px + T - 1, py, 1, T, SAND_D);
      } else if (c === 'w') {
        r(px, py, T, T, WATER);
        if (!isWater(x, y - 1)) r(px, py, T, 2, WATER_D);
        if (!isWater(x, y + 1)) r(px, py + T - 2, T, 2, WATER_D);
        if (!isWater(x - 1, y)) r(px, py, 2, T, WATER_D);
        if (!isWater(x + 1, y)) r(px + T - 2, py, 2, T, WATER_D);
        if (R2() < 0.8) { const wx = px + 3 + ri(8), wy = py + 4 + ri(8); r(wx, wy, 4, 1, WATER_L); r(wx + 1, wy - 1, 2, 1, WATER_L); }
      }
    }
    // lily pads
    [[16, 14], [17, 15]].forEach(([x, y]) => { r(x * T + 4, y * T + 6, 6, 4, '#8fc97c'); r(x * T + 6, y * T + 6, 1, 2, WATER); r(x * T + 8, y * T + 5, 2, 2, '#ff9ec4'); });
    // plaza flowers ring + heart mosaic
    for (let y = PLAZA.y0; y <= PLAZA.y1; y++) for (let x = PLAZA.x0; x <= PLAZA.x1; x++) {
      const edge = x === PLAZA.x0 || x === PLAZA.x1 || y === PLAZA.y0 || y === PLAZA.y1;
      if (edge && !(y === 4 && x === PLAZA.x0)) { flower(x * T + 2, y * T + 2, FL[(x + y) % FL.length]); flower(x * T + 10, y * T + 9, FL[(x + y + 2) % FL.length]); }
    }
    const hx = 23 * T + 4, hy = 3 * T + 4;
    ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'].forEach((row, j) => row.split('').forEach((p, i) => { if (p === '#') r(hx + i * 2, hy + j * 2, 2, 2, '#ffc2d4'); }));
    // start sign
    const sx = 3 * T + 3, sy = 15 * T + 4;
    r(sx + 4, sy + 6, 2, 7, '#a8735a'); r(sx - 1, sy - 1, 12, 9, '#4a2c3a'); r(sx, sy, 10, 7, '#e8b98a');
    r(sx + 3, sy + 2, 1, 1, '#ff5f73'); r(sx + 5, sy + 2, 1, 1, '#ff5f73'); r(sx + 2, sy + 3, 5, 1, '#ff5f73'); r(sx + 3, sy + 4, 3, 1, '#ff5f73'); r(sx + 4, sy + 5, 1, 1, '#ff5f73');
    // trees
    const TREES = ['treePink', 'treePink', 'treePink', 'treePeach', 'treeLav', 'treeGreen'];
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (tiles[y][x] === 't') {
      r(x * T + 3, y * T + 14, 10, 2, 'rgba(74,44,58,.16)');
      g.drawImage(Sprites.get(TREES[ri(TREES.length)]), x * T, y * T);
    }
  }

  /* ---------- state ---------- */
  function reset() {
    player = { x: 2 * T + 8, y: 17 * T + 12, dir: 'down', moving: false, anim: 0 };
    hearts = HEART_POS.map(([x, y], i) => ({ x: x * T + 8, y: y * T + 12, got: false, i }));
    collected = 0; giftShown = false; finished = false; target = null; stuck = 0;
    nearNpc = false; introShown = false; parts = []; cam = null;
    closeDialog(true);
    onHud(0);
    onTip('Kumpulin 5 hati buat buka cerita kita!');
  }

  /* ---------- dialog ---------- */
  function openDialog(title, text, cb) {
    dialogOpen = true; dialogCb = cb || null; openedAt = performance.now();
    dlgTitle.textContent = title;
    dlg.classList.remove('hidden');
    typer.start(text);
    target = null;
  }
  function advance() {
    if (!dialogOpen) return false;
    if (performance.now() - openedAt < 220) return true;
    if (typer.typing) { typer.finish(); return true; }
    Sound.play('select');
    closeDialog();
    return true;
  }
  function closeDialog(silent) {
    typer.stop();
    dlg.classList.add('hidden');
    const cb = dialogCb; dialogOpen = false; dialogCb = null;
    if (!silent && cb) cb();
  }

  /* ---------- input ---------- */
  const KEYMAP = { ArrowUp: 'u', KeyW: 'u', ArrowDown: 'd', KeyS: 'd', ArrowLeft: 'l', KeyA: 'l', ArrowRight: 'r', KeyD: 'r' };
  addEventListener('keydown', e => {
    if (!running) return;
    const k = KEYMAP[e.code];
    if (k) { keys.add(k); e.preventDefault(); return; }
    if (e.code === 'Space' || e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'KeyZ' || e.code === 'KeyX') {
      e.preventDefault(); if (!e.repeat) advance();
    }
  });
  addEventListener('keyup', e => { const k = KEYMAP[e.code]; if (k) keys.delete(k); });
  addEventListener('blur', () => { keys.clear(); pad.x = pad.y = 0; });
  dlg.addEventListener('pointerdown', e => { e.preventDefault(); advance(); });
  cv.addEventListener('pointerdown', e => {
    if (!running) return;
    e.preventDefault();
    if (dialogOpen) { advance(); return; }
    const rc = cv.getBoundingClientRect();
    target = { x: (e.clientX - rc.left) / scale + cam.x, y: (e.clientY - rc.top) / scale + cam.y + 6 };
    stuck = 0;
  });
  function setPad(x, y) { pad.x = x; pad.y = y; if (x || y) target = null; }

  /* ---------- logic ---------- */
  function blockedAt(x, y) {
    const pts = [[x - 5, y - 5], [x + 5, y - 5], [x - 5, y - 0.01], [x + 5, y - 0.01]];
    for (const [px, py] of pts) {
      const tx = Math.floor(px / T), ty = Math.floor(py / T);
      if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS || solid[ty][tx]) return true;
    }
    if (Math.abs(x - NPC.x) < 10 && Math.abs(y - NPC.y) < 6) return true;
    return false;
  }
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  function collect(h) {
    h.got = true; collected++;
    Sound.play('coin');
    sparkle(h.x, h.y - 10, 18);
    onHud(collected);
    const n = collected, ch = CHAPTERS[n - 1];
    onTip(n < 5 ? `Chapter ${n} terbuka! ${5 - n} hati lagi...` : 'Semua chapter terbuka!');
    openDialog(`Chapter ${n} · ${ch.title}`, ch.text, () => {
      if (n === 5) {
        giftShown = true;
        Sound.play('magic');
        sparkle(GIFT.x, GIFT.y - 6, 24);
        onTip('Semua hati terkumpul! Samperin aku di ujung jalan ♥');
      }
    });
  }
  function finish() {
    if (finished) return;
    finished = true;
    openDialog('Yeay!', 'Semua hati udah terkumpul, dan akhirnya kamu sampai juga di sini. Makasih udah jalan sejauh ini bareng aku. Ini, ada kado kecil buat kamu. Buka, yuk!', () => {
      Sound.play('open');
      onComplete();
    });
  }
  function sparkle(x, y, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = 15 + Math.random() * 30;
      parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 10, life: 0.6 + Math.random() * 0.5, c: ['#ff5f73', '#ffd970', '#fffaf0', '#c9b6f2'][i % 4] });
    }
  }

  function update(dt) {
    time += dt;
    for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.life -= dt; if (p.life <= 0) { parts.splice(i, 1); continue; } p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 40 * dt; }
    let dx = 0, dy = 0;
    if (!dialogOpen) {
      if (keys.has('l')) dx -= 1; if (keys.has('r')) dx += 1;
      if (keys.has('u')) dy -= 1; if (keys.has('d')) dy += 1;
      if (!dx && !dy) { dx = pad.x; dy = pad.y; }
      if (dx || dy) target = null;
      else if (target) {
        const tx = target.x - player.x, ty = target.y - player.y, d = Math.hypot(tx, ty);
        if (d < 2) target = null; else { dx = tx / d; dy = ty / d; }
      }
    }
    const len = Math.hypot(dx, dy);
    player.moving = len > 0.01;
    if (player.moving) {
      dx /= len; dy /= len;
      const sp = 66 * dt;
      const ox = player.x, oy = player.y;
      if (!blockedAt(player.x + dx * sp, player.y)) player.x += dx * sp;
      if (!blockedAt(player.x, player.y + dy * sp)) player.y += dy * sp;
      const moved = Math.hypot(player.x - ox, player.y - oy);
      if (moved < sp * 0.2) { if (target && ++stuck > 8) target = null; player.moving = moved > 0.01; } else stuck = 0;
      if (Math.abs(dx) > Math.abs(dy) + 0.01) player.dir = dx > 0 ? 'right' : 'left';
      else player.dir = dy < 0 ? 'up' : 'down';
      player.anim += dt * 8;
    } else player.anim = 0;

    if (!dialogOpen && !finished) {
      for (const h of hearts) if (!h.got && Math.hypot(player.x - h.x, player.y - h.y) < 12) { collect(h); break; }
      if (!dialogOpen) {
        const df = dist(player, NPC);
        if (df < 22) {
          if (!nearNpc) {
            nearNpc = true;
            if (collected < 5) openDialog('Eits!', `Sabar dulu, sayang. Hatinya baru ${collected} dari 5. Kumpulin semuanya dulu, ya, nanti aku kasih sesuatu.`);
            else finish();
          }
        } else if (df > 30) nearNpc = false;
        if (giftShown && dist(player, GIFT) < 14) finish();
      }
    }
    // camera
    const desX = WW <= vw ? (WW - vw) / 2 : Math.max(0, Math.min(WW - vw, player.x - vw / 2));
    const desY = WH <= vh ? (WH - vh) / 2 : Math.max(0, Math.min(WH - vh, player.y - 10 - vh / 2));
    if (!cam) cam = { x: desX, y: desY };
    const k = Math.min(1, dt * 7);
    cam.x += (desX - cam.x) * k; cam.y += (desY - cam.y) * k;
  }

  /* ---------- render ---------- */
  function shadow(x, y, w) { ctx.fillStyle = 'rgba(74,44,58,.2)'; ctx.fillRect(x - w / 2, y - 1, w, 2); ctx.fillRect(x - w / 2 + 1, y - 2, w - 2, 1); }
  function draw() {
    const ox = Math.round(cam.x), oy = Math.round(cam.y);
    ctx.fillStyle = '#b5d98f'; ctx.fillRect(0, 0, vw, vh);
    ctx.drawImage(bg, -ox, -oy);
    const items = [];
    hearts.forEach(h => {
      const sx = Math.round(h.x) - ox, sy = Math.round(h.y) - oy;
      if (h.got) {
        items.push({ y: h.y, fn: () => { ctx.fillStyle = '#a8735a'; ctx.fillRect(sx, sy - 12, 1, 12); ctx.fillStyle = '#ff9ec4'; ctx.fillRect(sx + 1, sy - 12, 5, 4); ctx.fillStyle = '#4a2c3a'; ctx.fillRect(sx - 1, sy, 3, 1); } });
      } else {
        const bob = Math.round(Math.sin(time * 3 + h.i) * 2);
        items.push({ y: h.y, fn: () => {
          shadow(sx, sy, 8);
          ctx.drawImage(Sprites.get('heart'), sx - 5, sy - 16 + bob);
          if (((time * 2 + h.i) | 0) % 3 === 0) { ctx.fillStyle = '#fffaf0'; const tx = sx + 6, ty = sy - 18 + bob; ctx.fillRect(tx, ty - 1, 1, 3); ctx.fillRect(tx - 1, ty, 3, 1); }
        } });
      }
    });
    if (giftShown) {
      const sx = GIFT.x - ox, sy = GIFT.y - oy, bob = Math.round(Math.sin(time * 4) * 1);
      items.push({ y: GIFT.y, fn: () => { shadow(sx, sy, 12); ctx.drawImage(Sprites.get('giftSmall'), sx - 6, sy - 11 + bob); } });
    }
    {
      const sx = NPC.x - ox, sy = NPC.y - oy, bob = ((time * 2) | 0) % 2;
      items.push({ y: NPC.y, fn: () => {
        shadow(sx, sy, 12);
        ctx.drawImage(Sprites.get(collected >= 5 ? 'boyHappy' : 'boyDown0'), sx - 8, sy - 20 + bob);
        const hb = Math.round(Math.sin(time * 3) * 1.5);
        ctx.drawImage(Sprites.get('mini'), sx - 2, sy - 28 + hb);
      } });
    }
    {
      const p = player, f = p.moving ? (Math.floor(p.anim) % 4) : 0;
      let spr;
      if (p.dir === 'down') spr = ['girlDown0', 'girlDown1', 'girlDown0', 'girlDown2'][f];
      else if (p.dir === 'up') spr = ['girlUp0', 'girlUp1', 'girlUp0', 'girlUp2'][f];
      else spr = (p.dir === 'right' ? 'girlR' : 'girlL') + (f % 2);
      const sx = Math.round(p.x) - ox, sy = Math.round(p.y) - oy, bob = p.moving && f % 2 ? -1 : 0;
      items.push({ y: p.y, fn: () => { shadow(sx, sy, 10); ctx.drawImage(Sprites.get(spr), sx - 8, sy - 20 + bob); } });
    }
    items.sort((a, b) => a.y - b.y).forEach(it => it.fn());
    parts.forEach(p => { ctx.fillStyle = p.c; ctx.fillRect(Math.round(p.x) - ox, Math.round(p.y) - oy, 1, 1); });
    if (target) { const tx = Math.round(target.x) - ox, ty = Math.round(target.y) - oy; ctx.fillStyle = 'rgba(255,95,115,.8)'; ctx.fillRect(tx - 2, ty, 5, 1); ctx.fillRect(tx, ty - 2, 1, 5); }
    // off-screen pointer to the next goal
    let goal = hearts.find(h => !h.got);
    if (!goal) goal = giftShown ? GIFT : null;
    if (goal && !dialogOpen) {
      const gx = goal.x - ox, gy = goal.y - 8 - oy, m = 8;
      if (gx < 0 || gy < 0 || gx > vw || gy > vh) {
        const cx = vw / 2, cy = vh / 2, ax = gx - cx, ay = gy - cy;
        const s = Math.min((vw / 2 - m) / Math.abs(ax || 1e-6), (vh / 2 - m) / Math.abs(ay || 1e-6));
        const px = Math.round(cx + ax * s), py = Math.round(cy + ay * s);
        if (((time * 3) | 0) % 2) {
          ctx.fillStyle = '#4a2c3a'; ctx.fillRect(px - 4, py - 4, 9, 9);
          ctx.fillStyle = '#fffaf0'; ctx.fillRect(px - 3, py - 3, 7, 7);
          ctx.drawImage(Sprites.get('mini'), px - 2, py - 2);
        }
      }
    }
  }

  function frame(ts) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, Math.max(0, (ts - last) / 1000)); last = ts;
    update(dt); draw();
  }
  function resize() {
    const rc = stage.getBoundingClientRect();
    if (!rc.width || !rc.height) return;
    scale = Math.max(2, Math.floor(Math.min(rc.width / 200, rc.height / 150)));
    vw = Math.ceil(rc.width / scale); vh = Math.ceil(rc.height / scale);
    cv.width = vw; cv.height = vh;
    cv.style.width = vw * scale + 'px'; cv.style.height = vh * scale + 'px';
    ctx.imageSmoothingEnabled = false;
    cam = null;
    if (running) { update(0); draw(); }
  }
  function start() {
    if (running) return;
    running = true;
    resize();
    last = performance.now();
    raf = requestAnimationFrame(frame);
    if (!introShown) {
      introShown = true;
      setTimeout(() => { if (running && !dialogOpen && collected === 0) openDialog('Petunjuk', INTRO_TEXT); }, 450);
    }
  }
  function stop() { running = false; cancelAnimationFrame(raf); keys.clear(); pad.x = pad.y = 0; }

  buildWorld();
  addEventListener('resize', () => { if (running) resize(); });
  return {
    init(o) { onComplete = o.onComplete || onComplete; onHud = o.onHud || onHud; onTip = o.onTip || onTip; reset(); },
    start, stop, reset, resize, advance, setPad,
    get debug() { return { player, hearts, collected, dialogOpen, giftShown, finished, scale, vw, vh }; },
    _teleport(x, y) { player.x = x; player.y = y; },
    T,
  };
})();
