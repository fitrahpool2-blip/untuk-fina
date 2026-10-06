/* Flow / screens */
(() => {
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));

  /* ---------- sprites into <img> ---------- */
  $$('img[data-spr]').forEach(img => {
    const n = img.dataset.spr, [w, h] = Sprites.size(n);
    img.src = Sprites.url(n); img.style.setProperty('--w', w); img.style.setProperty('--h', h);
  });
  function sprImg(n, cls) {
    const img = document.createElement('img'), [w, h] = Sprites.size(n);
    img.className = 'spr ' + (cls || ''); img.alt = ''; img.src = Sprites.url(n);
    img.style.setProperty('--w', w); img.style.setProperty('--h', h);
    return img;
  }

  /* ---------- decorations ---------- */
  $$('.deco').forEach(d => {
    const nc = +d.dataset.clouds || 0, nh = +d.dataset.hearts || 0, ns = +d.dataset.stars || 0;
    for (let i = 0; i < nc; i++) {
      const c = sprImg('cloud', 'cloud');
      c.style.top = (6 + i * 17 + Math.random() * 6) + '%';
      c.style.animationDuration = (38 + Math.random() * 30) + 's';
      c.style.animationDelay = (-Math.random() * 60) + 's';
      d.appendChild(c);
    }
    for (let i = 0; i < nh; i++) {
      const h = sprImg(i % 3 ? 'mini' : 'miniW', 'fheart');
      h.style.left = (4 + Math.random() * 92) + '%';
      h.style.animationDuration = (9 + Math.random() * 9) + 's';
      h.style.animationDelay = (-Math.random() * 18) + 's';
      d.appendChild(h);
    }
    for (let i = 0; i < ns; i++) {
      const s = document.createElement('i');
      s.className = 'star' + (i % 5 === 0 ? ' big' : '');
      s.style.left = (Math.random() * 98) + '%'; s.style.top = (Math.random() * 55) + '%';
      s.style.animationDelay = (-Math.random() * 2) + 's';
      d.appendChild(s);
    }
  });

  /* ---------- sound ---------- */
  const soundBtn = $('#soundBtn');
  function paintSound(on) { soundBtn.classList.toggle('on', on); soundBtn.classList.toggle('off', !on); soundBtn.querySelector('.lbl').textContent = on ? 'ON' : 'OFF'; }
  paintSound(false);
  Sound.onChange(paintSound);
  soundBtn.addEventListener('click', e => { e.stopPropagation(); Sound.toggle(); Sound.play('select'); soundBtn.blur(); });

  /* ---------- countdown ---------- */
  (() => {
    const bd = new Date(BIRTHDAY.y, BIRTHDAY.m - 1, BIRTHDAY.d);
    const now = new Date(); const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diff = Math.round((bd - today) / 864e5);
    let t = '';
    if (diff > 1) t = `${diff} hari lagi menuju 27 Oktober ♥`;
    else if (diff === 1) t = 'Besok hari spesialmu! ♥';
    else if (diff === 0) t = 'Hari ini hari spesialmu! ♥';
    else t = '27 Oktober 2026 · hari spesialmu ♥';
    $('#countdown').textContent = t;
  })();

  /* ---------- screens ---------- */
  let current = 'start', busy = false;
  const hooks = {
    map: { enter: () => Game.start(), leave: () => Game.stop() },
    gift: { enter: () => layoutGift() },
    cake: { enter: () => layoutCake() },
    msg: { enter: () => Msg.enter() },
    video: { enter: () => TV.enter(), leave: () => TV.leave() },
    final: { enter: () => { FX.show(5); FX.setAuto(true); Sound.play('yay'); }, leave: () => FX.setAuto(false) },
  };
  function go(id) {
    if (busy || id === current) return;
    busy = true;
    const wipe = $('#wipe');
    wipe.classList.add('on');
    setTimeout(() => {
      hooks[current] && hooks[current].leave && hooks[current].leave();
      $('#s-' + current).classList.remove('active');
      const el = $('#s-' + id);
      el.classList.add('active'); el.scrollTop = 0;
      current = id;
      hooks[id] && hooks[id].enter && hooks[id].enter();
      wipe.classList.remove('on');
      setTimeout(() => { busy = false; }, 260);
    }, 280);
  }
  window.__go = go;
  window.__cur = () => current;

  /* ---------- start ---------- */
  function startGame() { if (current !== 'start') return; Sound.play('select'); go('map'); }
  $('#s-start').addEventListener('click', startGame);
  addEventListener('keydown', e => {
    if (e.code === 'KeyM' && !e.repeat) { Sound.toggle(); Sound.play('select'); return; }
    const confirm = e.code === 'Space' || e.code === 'Enter' || e.code === 'NumpadEnter';
    if (current === 'start') {
      if (['Tab', 'ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight', 'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight'].includes(e.code)) return;
      e.preventDefault(); if (!e.repeat) startGame();
    } else if (confirm && !e.repeat && !(e.target && e.target.tagName === 'BUTTON')) {
      if (current === 'gift') { e.preventDefault(); tapGift(); }
      else if (current === 'cake') { e.preventDefault(); const c = $$('.candle:not(.out)')[0]; if (c) blow(c); }
      else if (current === 'msg') { e.preventDefault(); Msg.next(); }
    }
  });

  /* ---------- map ---------- */
  const heartHud = $('#heartHud');
  const hudImgs = [0, 1, 2, 3, 4].map(() => { const i = sprImg('heartEmpty'); heartHud.appendChild(i); return i; });
  Game.init({
    onHud: n => hudImgs.forEach((img, i) => {
      const want = i < n ? 'heart' : 'heartEmpty';
      if (img.dataset.k !== want) { img.dataset.k = want; img.src = Sprites.url(want); if (i < n) { img.classList.remove('got'); void img.offsetWidth; img.classList.add('got'); } }
    }),
    onTip: t => { $('#mapTip').textContent = t; },
    onComplete: () => setTimeout(() => go('gift'), 250),
  });
  // D-pad (drag anywhere on it, 8 directions)
  const dpad = $('#dpad'); let padId = null;
  const dps = { up: dpad.querySelector('.up'), down: dpad.querySelector('.down'), left: dpad.querySelector('.left'), right: dpad.querySelector('.right') };
  function padFrom(e) {
    const r = dpad.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    let x = 0, y = 0;
    if (Math.hypot(dx, dy) > r.width * 0.1) {
      const a = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) * (Math.PI / 4);
      x = Math.round(Math.cos(a)); y = Math.round(Math.sin(a));
    }
    Game.setPad(x, y);
    dps.left.classList.toggle('on', x < 0); dps.right.classList.toggle('on', x > 0);
    dps.up.classList.toggle('on', y < 0); dps.down.classList.toggle('on', y > 0);
  }
  function padEnd(e) { if (e.pointerId !== padId) return; padId = null; Game.setPad(0, 0); Object.values(dps).forEach(d => d.classList.remove('on')); }
  dpad.addEventListener('pointerdown', e => { e.preventDefault(); padId = e.pointerId; try { dpad.setPointerCapture(e.pointerId); } catch (_) {} padFrom(e); });
  dpad.addEventListener('pointermove', e => { if (e.pointerId === padId) padFrom(e); });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(t => dpad.addEventListener(t, padEnd));
  const aBtn = $('#aBtn');
  aBtn.addEventListener('pointerdown', e => { e.preventDefault(); aBtn.classList.add('on'); Game.advance(); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => aBtn.addEventListener(t, () => aBtn.classList.remove('on')));
  $('#controls').addEventListener('contextmenu', e => e.preventDefault());

  /* ---------- gift ---------- */
  const giftWrap = $('#giftWrap'); let giftTaps = 0, giftOpened = false;
  $('#giftCake').src = Sprites.url('cake'); $('#giftCake').classList.add('spr-raw');
  function layoutGift() {
    const u = Math.max(5, Math.min(10, Math.floor(Math.min(innerWidth * 0.62, (innerHeight - 330) * 0.95, 300) / 24)));
    giftWrap.style.setProperty('--u', u);
    giftWrap.style.setProperty('--uu', Math.max(2, Math.floor(u * 20 / 48)));
  }
  function tapGift() {
    if (giftOpened) return;
    giftTaps++;
    const r = giftWrap.getBoundingClientRect();
    if (giftTaps < 3) {
      Sound.play('thump');
      giftWrap.classList.remove('shake'); void giftWrap.offsetWidth; giftWrap.classList.add('shake');
      FX.burstAt(r.left + r.width / 2, r.top + r.height * 0.6, 14);
      $('#giftSay').textContent = giftTaps === 1 ? 'Hmm, apa ya isinya? Ketuk lagi! (2)' : 'Sekali lagi...! (1)';
    } else {
      giftOpened = true;
      giftWrap.classList.remove('shake'); giftWrap.classList.add('open');
      Sound.play('open');
      FX.show(4);
      FX.burstAt(r.left + r.width / 2, r.top + r.height * 0.4, 60);
      $('#giftSay').textContent = 'Taraaa! Ada sesuatu yang manis di dalamnya...';
      setTimeout(() => $('#toCake').classList.remove('hidden'), 900);
    }
  }
  giftWrap.addEventListener('click', tapGift);
  $('#toCake').addEventListener('click', () => go('cake'));

  /* ---------- cake ---------- */
  const cakeWrap = $('#cakeWrap'); let blown = 0;
  function layoutCake() {
    const u = Math.max(4, Math.min(9, Math.floor(Math.min(innerWidth * 0.86, 470) / 48), Math.floor((innerHeight - 330) / 56)));
    cakeWrap.style.setProperty('--u', u);
  }
  function blow(c) {
    if (c.classList.contains('out')) return;
    c.classList.add('out'); blown++;
    Sound.play('blow');
    const r = c.getBoundingClientRect();
    FX.burstAt(r.left + r.width / 2, r.top, 16);
    if (blown === 1) $('#cakeSay').textContent = 'Satu lagi! Tiup yang kencang~';
    if (blown >= 2) {
      cakeWrap.classList.add('done');
      $('#blowAll').classList.add('hidden');
      setTimeout(() => { Sound.play('yay'); FX.show(5); }, 250);
      $('#cakeSay').textContent = 'Yeay! Semoga semua permohonanmu terkabul, Fina!';
      setTimeout(() => $('#toMsg').classList.remove('hidden'), 700);
    }
  }
  $$('.candle').forEach(c => c.addEventListener('click', e => { e.stopPropagation(); blow(c); }));
  $('#blowAll').addEventListener('click', () => $$('.candle').forEach((c, i) => setTimeout(() => blow(c), i * 220)));
  $('#toMsg').addEventListener('click', () => go('msg'));

  /* ---------- message ---------- */
  const Msg = (() => {
    const text = $('#msgText'), pageEl = $('#msgPage'), nextBtn = $('#msgNext'), arrow = $('#msgArrow');
    const typer = Typer(text, { speed: 26, onChar: () => Sound.play('blip') });
    let page = -1, full = false;
    function show(i) {
      page = i;
      pageEl.textContent = `${i + 1}/${LETTER.length}`;
      text.classList.toggle('sign', i === LETTER.length - 1);
      arrow.style.visibility = 'hidden';
      nextBtn.textContent = i === LETTER.length - 1 ? 'Kenangan Kita ▶' : 'Lanjut ▶';
      typer.start(LETTER[i], () => { arrow.style.visibility = 'visible'; });
    }
    function next() {
      if (full) { go('video'); return; }
      if (typer.typing) { typer.finish(); return; }
      if (page < LETTER.length - 1) { Sound.play('select'); show(page + 1); }
      else go('video');
    }
    function showAll() {
      typer.stop();
      full = true;
      const L = $('#letter'); L.innerHTML = '';
      LETTER.forEach(p => { const el = document.createElement('p'); el.textContent = p; L.appendChild(el); });
      L.classList.remove('hidden'); $('#msgBox').classList.add('hidden'); $('#msgAll').classList.add('hidden');
      nextBtn.textContent = 'Kenangan Kita ▶';
    }
    function reset() { typer.stop(); page = -1; full = false; $('#letter').classList.add('hidden'); $('#msgBox').classList.remove('hidden'); $('#msgAll').classList.remove('hidden'); }
    $('#msgBox').addEventListener('click', next);
    nextBtn.addEventListener('click', next);
    $('#msgAll').addEventListener('click', showAll);
    return { enter: () => { if (page < 0 || (!full && page >= LETTER.length - 1 && !typer.typing)) { reset(); show(0); } }, next, reset, showAll };
  })();

  /* ---------- video TV ---------- */
  const TV = (() => {
    const screen = $('#tvScreen'), frame = $('#tvFrame'), vid = $('#tvVideo'), osd = $('#tvOsd'), label = $('#tvLabel'), open = $('#tvOpen');
    const st = $('#tvStatic'), sx = st.getContext('2d'); let stRaf = 0, ch = 0, playing = false, tuneTimer = 0;
    const tapes = $('#tapes');
    // Channel list: the compilation (native <video>) first, then the Drive embeds.
    const CH = [];
    if (typeof COMPILATION !== 'undefined' && COMPILATION && COMPILATION.src) CH.push({ kind: 'video', src: COMPILATION.src, poster: COMPILATION.poster, title: COMPILATION.title || 'Kompilasi Kita' });
    VIDEOS.forEach((v, i) => CH.push({ kind: 'drive', id: v.id, title: v.title || 'Kenangan ' + String(i + 1).padStart(2, '0') }));
    const n = CH.length;
    const pad2 = i => String(i + 1).padStart(2, '0');
    CH.forEach((c, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'tape' + (c.kind === 'video' ? ' special' : '');
      b.setAttribute('aria-label', 'Putar ' + c.title);
      const th = document.createElement('span'); th.className = 'thumb';
      th.appendChild(sprImg('heart', 'ph'));
      const im = document.createElement('img'); im.alt = ''; im.loading = 'lazy'; im.referrerPolicy = 'no-referrer';
      im.src = c.kind === 'video' ? (c.poster || '') : `https://drive.google.com/thumbnail?id=${encodeURIComponent(c.id)}&sz=w320`;
      im.onerror = () => im.remove();
      if (im.src) th.appendChild(im);
      const lb = document.createElement('span'); lb.className = 'lbl'; lb.textContent = c.title;
      b.appendChild(th); b.appendChild(lb);
      b.addEventListener('click', () => { tune(i, true); screen.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
      tapes.appendChild(b);
    });
    if (!n) {
      $('#vidNote').textContent = 'Belum ada video. Tempel ID file Google Drive ke array VIDEOS di js/config.js, ya.';
      $('#tvPlay').classList.add('hidden'); $('#chPrev').disabled = $('#chNext').disabled = true;
      label.textContent = 'Belum ada video'; osd.textContent = 'NO SIGNAL'; open.href = DRIVE_FOLDER;
    } else {
      $('#vidNote').textContent = `${n} saluran kenangan. Kalau video dari Drive belum mau muter, coba ketuk "Buka di Google Drive" ya.`;
    }
    let noiseOn = false, noiseImg = null;
    function noise() {
      if (noiseOn) return;
      noiseOn = true;
      const w = st.width, h = st.height; noiseImg = noiseImg || sx.createImageData(w, h); const d = noiseImg.data;
      const loop = () => {
        if (!noiseOn) return;
        for (let i = 0; i < d.length; i += 4) { const v = Math.random() < 0.5 ? 40 + Math.random() * 60 : 150 + Math.random() * 105; d[i] = v; d[i + 1] = v * 0.92; d[i + 2] = v; d[i + 3] = 255; }
        sx.putImageData(noiseImg, 0, 0);
        stRaf = setTimeout(() => requestAnimationFrame(loop), 60);
      };
      loop();
    }
    function stopNoise() { noiseOn = false; clearTimeout(stRaf); stRaf = 0; }
    function stopMedia() {
      clearTimeout(tuneTimer);
      frame.src = 'about:blank';
      try { vid.pause(); } catch (_) {}
      screen.classList.remove('playing', 'native');
    }
    function tune(i, play) {
      if (!n) return;
      ch = (i + n) % n;
      const c = CH[ch];
      osd.textContent = 'CH ' + pad2(ch);
      label.textContent = c.title + `  (${ch + 1}/${n})`;
      if (c.kind === 'video') { open.href = c.src; open.textContent = 'Buka / unduh videonya ↗'; }
      else { open.href = `https://drive.google.com/file/d/${c.id}/view`; open.textContent = 'Buka di Google Drive ↗'; }
      $$('.tape').forEach((t, k) => t.classList.toggle('active', k === ch));
      Sound.play('select');
      if (play || playing) {
        stopMedia();
        noise();
        playing = true;
        if (c.kind === 'video') {
          // start immediately inside the user gesture so mobile browsers allow playback
          if (vid.getAttribute('src') !== c.src) { vid.src = c.src; if (c.poster) vid.poster = c.poster; }
          screen.classList.add('playing', 'native');
          stopNoise();
          const pr = vid.play(); if (pr && pr.catch) pr.catch(() => {});
        } else {
          tuneTimer = setTimeout(() => {
            frame.src = `https://drive.google.com/file/d/${c.id}/preview`;
            screen.classList.add('playing');
            stopNoise();
          }, 380);
        }
      }
    }
    vid.addEventListener('play', () => { if (Sound.on) Sound.setOn(false); });
    $('#tvPlay').addEventListener('click', () => tune(ch, true));
    $('#chPrev').addEventListener('click', () => tune(ch - 1));
    $('#chNext').addEventListener('click', () => tune(ch + 1));
    return {
      enter() { if (!playing) noise(); if (n) tune(ch, false); },
      leave() { stopNoise(); stopMedia(); playing = false; },
    };
  })();
  $('#toFinal').addEventListener('click', () => go('final'));

  /* ---------- final ---------- */
  $('#reread').addEventListener('click', () => { Msg.reset(); go('msg'); });
  $('#rewatch').addEventListener('click', () => go('video'));
  $('#replay').addEventListener('click', () => {
    Game.reset();
    giftTaps = 0; giftOpened = false; giftWrap.classList.remove('open', 'shake'); $('#toCake').classList.add('hidden');
    $('#giftSay').textContent = 'Ketuk kadonya 3 kali buat buka!';
    blown = 0; $$('.candle').forEach(c => c.classList.remove('out')); cakeWrap.classList.remove('done');
    $('#blowAll').classList.remove('hidden'); $('#toMsg').classList.add('hidden');
    $('#cakeSay').textContent = 'Pejamkan mata, ucapkan permohonanmu dalam hati... terus ketuk lilinnya buat niup!';
    Msg.reset();
    go('start');
  });

  addEventListener('resize', () => { if (current === 'gift') layoutGift(); if (current === 'cake') layoutCake(); });
  layoutGift(); layoutCake();
})();
