/* Pixel-art sprites drawn in code (no image files). */
const Sprites = (() => {
  const K = '#4a2c3a';
  const PAL = {
    k: K, s: '#ffdcc0', S: '#f3b892', e: '#2b1a24', w: '#fffaf0', p: '#ff9aa8', m: '#d9536a',
    h: '#6b4330', H: '#3e2433', j: '#6a4256',
    b: '#ffd36e', y: '#f2a541', n: '#8a78c4', f: '#5a3348',
    d: '#ff9ec4', D: '#f0759f', r: '#ff5f73', R: '#c93a52', o: '#ff7b4a',
  };
  const cache = {}, urls = {};

  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const mirror = half => half.map(r => r + r.split('').reverse().join(''));
  function grid(rows, name) {
    const w = Math.max(...rows.map(r => r.length));
    rows.forEach((r, i) => { if (r.length !== w) console.warn('[sprite]', name, 'row', i, 'len', r.length, '!=', w); });
    return rows.map(r => r.padEnd(w, '.').split(''));
  }
  const clone = g => g.map(r => r.slice());
  function set(g, x, y, str) { str.split('').forEach((c, i) => { if (g[y] && x + i < g[y].length) g[y][x + i] = c; }); }
  function render(g, pal) {
    pal = Object.assign({}, PAL, pal || {});
    const c = mk(g[0].length, g.length), x = c.getContext('2d');
    g.forEach((row, j) => row.forEach((ch, i) => {
      if (ch !== '.' && pal[ch]) { x.fillStyle = pal[ch]; x.fillRect(i, j, 1, 1); }
    }));
    return c;
  }
  function flip(src) {
    const c = mk(src.width, src.height), x = c.getContext('2d');
    x.translate(src.width, 0); x.scale(-1, 1); x.drawImage(src, 0, 0); return c;
  }

  /* ---------- BOY ---------- */
  const boyFrontHalf = [
    '...kkkkk', '..khhhhh', '.khhhhhh', 'khhhhhhh', 'khhhhhhh', 'khhshhhs',
    'khssssss', 'ksssekss', 'ksssekss', 'ksspssss', '.ksssssm', '..kkkkss',
    '..kbbbbw', '.kbbbbbb', '.kbyyyyy', '.ksbbbbb', '..knnnnn', '..knnnk.',
    '..kfffk.', '..kkkkk.',
  ];
  const boyFront = grid(mirror(boyFrontHalf), 'boyFront');
  const boyHappy = clone(boyFront);
  // ^ ^ eyes
  set(boyHappy, 4, 7, 'e'); set(boyHappy, 4, 8, 's'); set(boyHappy, 3, 8, 'e'); set(boyHappy, 5, 8, 'e');
  set(boyHappy, 11, 7, 'e'); set(boyHappy, 11, 8, 's'); set(boyHappy, 10, 8, 'e'); set(boyHappy, 12, 8, 'e');
  const boyBack = clone(boyFront);
  for (let y = 5; y <= 9; y++) set(boyBack, 1, y, 'hhhhhhhhhhhhhh');
  set(boyBack, 2, 10, 'hhhhhhhhhhhh');
  set(boyBack, 7, 12, 'bb');
  function walkV(g, side) {
    const c = clone(g);
    const x = side === 1 ? 2 : 9;
    set(c, x, 18, 'kkkkk'); set(c, x, 19, '.....');
    return c;
  }
  const boySideRows = [
    '....kkkkkk......', '...khhhhhhkk....', '..khhhhhhhhhk...', '.khhhhhhhhhhhk..',
    '.khhhhhhhhhhhk..', '.khhhhhhhshhsk..', '.khhhhssssssssk.', '.khhhssssssessk.',
    '.khhSssssssessk.', '..khsssssssspsk.', '...kssssssssmk..', '....kkkkssskk...',
    '.....kbbbbbk....', '....kbbbbbbk....', '....kbyyyyyk....', '....kbbsbbbk....',
    '....knnnnnnk....', '....knnkknnk....', '....kffkkffk....', '....kkkkkkkk....',
  ];
  const boySide = grid(boySideRows, 'boySide');
  const boySide1 = clone(boySide);
  set(boySide1, 0, 17, '...knnkknnk.....');
  set(boySide1, 0, 18, '..kffk..kffk....');
  set(boySide1, 0, 19, '..kkkk..kkkk....');

  /* ---------- GIRL (Fina) ---------- */
  const girlHalf = [
    '....kkkk', '..kkHHHH', '.kHHjHHH', 'kHHjHHHH', 'kHHHHHHH', 'kHHsHHsH',
    'kHssssss', 'kHsssess', 'kHsssess', 'kHsspsss', 'kHksssss', 'kHHkkkss',
    'kHHkdddw', 'kHkddddd', '.ksddddd', '..kdDddd', '.kddddDd', 'kddddddd',
    'kkkkkkkk', '...kfk..',
  ];
  const girl = grid(mirror(girlHalf), 'girl');
  set(girl, 7, 10, 'mm');
  // bow
  set(girl, 10, 0, 'rr.rr'); set(girl, 10, 1, 'rrRrr'); set(girl, 10, 2, 'rr.rr');
  const girlHappy = clone(girl);
  set(girlHappy, 5, 7, 's'); set(girlHappy, 5, 8, 's'); set(girlHappy, 5, 7, 'e'); set(girlHappy, 5, 8, 's');
  set(girlHappy, 4, 8, 'e'); set(girlHappy, 6, 8, 'e');
  set(girlHappy, 10, 7, 'e'); set(girlHappy, 10, 8, 's'); set(girlHappy, 9, 8, 'e'); set(girlHappy, 11, 8, 'e');

  /* ---------- HEART ---------- */
  const heartRows = [
    '..kkk.kkk..', '.krrrkrrrk.', 'krwwrrrrrrk', 'krwrrrrrrRk', 'krrrrrrrrRk',
    '.krrrrrrRk.', '..krrrrRk..', '...krrRk...', '....kRk....', '.....k.....',
  ];
  const heart = grid(heartRows, 'heart');
  const mini = grid(['.r.r.', 'rrrrr', 'rrrrr', '.rrr.', '..r..'], 'mini');

  /* ---------- TREE ---------- */
  const treeRows = [
    '....kkkkkkkk....', '..kkAAaaAAAAkk..', '.kAAaaAAAAAAAAk.', '.kAaAAAAAAaAAAk.',
    'kAAAAAAAAAAAAABk', 'kAAAAAaAAAAAAABk', 'kAaAAAAAAAAAABBk', 'kAAAAAAAAAAAABBk',
    '.kBAAAAAAAAABBk.', '.kBBAAAAAAABBBk.', '..kkBBBBBBBBkk..', '....kkkttkkk....',
    '......kttk......', '......kttk......', '.....kttttk.....', '......kkkk......',
  ];
  const tree = grid(treeRows, 'tree');

  /* ---------- procedural helpers ---------- */
  function draw(w, h, fn) { const c = mk(w, h); const x = c.getContext('2d'); const r = (a, b, ww, hh, col) => { x.fillStyle = col; x.fillRect(a, b, ww, hh); }; fn(r, x); return c; }

  function giftBody() {
    return draw(20, 15, r => {
      r(0, 0, 20, 15, K); r(1, 1, 18, 13, '#c9b6f2'); r(15, 1, 4, 13, '#a996e0');
      r(1, 1, 18, 1, '#ddd0fb');
      r(9, 1, 2, 13, '#ffd970'); r(10, 1, 1, 13, '#f2b84b');
      [[3, 4], [6, 9], [3, 11], [13, 4], [16, 9], [13, 11], [6, 3]].forEach(([a, b]) => r(a, b, 1, 1, '#fff4e6'));
    });
  }
  function giftLid() {
    return draw(24, 12, r => {
      // bow loops
      r(4, 0, 7, 6, K); r(5, 1, 5, 4, '#ff7b7b'); r(6, 2, 2, 2, '#ffb3b3');
      r(13, 0, 7, 6, K); r(14, 1, 5, 4, '#ff7b7b'); r(15, 2, 2, 2, '#ffb3b3');
      r(10, 2, 4, 5, K); r(11, 3, 2, 3, '#e85a5a');
      // lid
      r(0, 6, 24, 6, K); r(1, 7, 22, 4, '#d9cbff'); r(19, 7, 4, 4, '#b9a3f0'); r(1, 7, 22, 1, '#efe8ff');
      r(11, 7, 2, 4, '#ffd970'); r(12, 7, 1, 4, '#f2b84b');
    });
  }
  function giftSmall() {
    return draw(12, 11, r => {
      r(3, 0, 2, 2, '#ff7b7b'); r(7, 0, 2, 2, '#ff7b7b'); r(5, 1, 2, 2, K);
      r(0, 2, 12, 9, K); r(1, 3, 10, 7, '#c9b6f2'); r(1, 3, 10, 2, '#d9cbff'); r(8, 5, 3, 5, '#a996e0');
      r(5, 3, 2, 7, '#ffd970'); r(0, 4, 12, 1, K);
    });
  }
  function cake() {
    return draw(48, 38, r => {
      const pink = '#ff9ec4', pinkL = '#ffc8db', sponge = '#ffdcae', spongeD = '#f6bf86';
      // plate
      r(1, 32, 46, 5, K); r(0, 33, 48, 3, K); r(2, 33, 44, 2, '#fffaf0'); r(1, 34, 46, 1, '#fffaf0'); r(3, 35, 42, 1, '#e8dccf');
      // body
      r(4, 12, 40, 21, K); r(5, 13, 38, 19, sponge); r(38, 13, 5, 19, spongeD);
      r(5, 23, 38, 2, '#ff8fab'); r(5, 25, 38, 1, '#fff4e6');
      // FINA text
      const L = { F: ['###', '#..', '##.', '#..', '#..'], I: ['###', '.#.', '.#.', '.#.', '###'],
        N: ['#..#', '##.#', '#.##', '#..#', '#..#'], A: ['.#.', '#.#', '###', '#.#', '#.#'] };
      let cx = 16;
      ['F', 'I', 'N', 'A'].forEach(ch => { L[ch].forEach((row, j) => row.split('').forEach((p, i) => { if (p === '#') r(cx + i, 26 + j, 1, 1, '#d9536a'); })); cx += L[ch][0].length + 1; });
      // drips
      [[7, 4], [13, 6], [20, 3], [26, 5], [32, 3], [37, 6], [41, 3]].forEach(([dx, len]) => { r(dx - 1, 14, 4, len + 1, K); });
      [[7, 4], [13, 6], [20, 3], [26, 5], [32, 3], [37, 6], [41, 3]].forEach(([dx, len]) => { r(dx, 14, 2, len, pink); });
      // frosting band
      r(3, 7, 42, 8, K); r(4, 8, 40, 6, pink); r(5, 8, 38, 2, pinkL); r(39, 10, 5, 4, '#f586b0');
      // sprinkles
      [[8, 11, '#ffd970'], [12, 12, '#fff'], [17, 11, '#c9b6f2'], [23, 12, '#ffd970'], [29, 11, '#fff'], [34, 12, '#c9b6f2'], [40, 11, '#ffd970'], [10, 9, '#fff'], [26, 9, '#ffd970'], [36, 9, '#fff']]
        .forEach(([a, b, c]) => r(a, b, 1, 1, c));
      // strawberries
      [4, 39].forEach(sx => { r(sx - 1, 3, 7, 6, K); r(sx, 4, 5, 4, '#ff5f73'); r(sx + 1, 5, 1, 1, '#fff'); r(sx + 3, 6, 1, 1, '#ffd970'); r(sx + 1, 2, 3, 2, '#6fae6a'); });
    });
  }
  const DIG = {
    2: ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
    5: ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  };
  function candle(d, col) {
    const W = 12, H = 19;
    const c = mk(W, H), x = c.getContext('2d');
    const on = new Set();
    DIG[d].forEach((row, j) => row.split('').forEach((p, i) => { if (p === '#') for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) on.add((1 + i * 2 + a) + ',' + (4 + j * 2 + b)); }));
    // outline
    x.fillStyle = K;
    on.forEach(k => { const [px, py] = k.split(',').map(Number); x.fillRect(px - 1, py - 1, 3, 3); });
    on.forEach(k => { const [px, py] = k.split(',').map(Number); x.fillStyle = col; x.fillRect(px, py, 1, 1); });
    // highlight stripes
    on.forEach(k => { const [px, py] = k.split(',').map(Number); if ((px + py) % 4 === 0) { x.fillStyle = 'rgba(255,255,255,.55)'; x.fillRect(px, py, 1, 1); } });
    // wick
    x.fillStyle = K; x.fillRect(5, 0, 2, 3);
    return c;
  }
  function flame(f) {
    const rows = f === 0
      ? ['..o..', '.ooo.', '.oyo.', 'oyyyo', 'oywyo', 'oywyo', '.oyo.', '..o..']
      : ['...o.', '..oo.', '.oyo.', 'oyyyo', 'oywyo', 'oywyo', '.oyo.', '..o..'];
    return render(grid(rows, 'flame'), { o: '#ff7b4a', y: '#ffd970', w: '#fffbe6' });
  }
  function cloud() {
    return draw(26, 11, r => {
      const W = '#fffaf3', L = '#f3e6ff';
      r(7, 2, 8, 3, W); r(13, 0, 7, 5, W); r(3, 4, 20, 4, W); r(1, 6, 24, 4, W); r(2, 9, 22, 1, L); r(20, 6, 4, 3, L);
    });
  }
  function antenna() {
    return draw(30, 16, r => {
      for (let i = 0; i < 11; i++) { r(14 - i, 15 - i, 2, 1, K); r(14 + i, 15 - i, 2, 1, K); }
      r(1, 2, 4, 4, K); r(2, 3, 2, 2, '#ff7b7b'); r(25, 2, 4, 4, K); r(26, 3, 2, 2, '#ffd970');
    });
  }

  function build() {
    cache.boyDown0 = render(boyFront);
    cache.boyDown1 = render(walkV(boyFront, 1));
    cache.boyDown2 = render(walkV(boyFront, 2));
    cache.boyUp0 = render(boyBack);
    cache.boyUp1 = render(walkV(boyBack, 1));
    cache.boyUp2 = render(walkV(boyBack, 2));
    cache.boyR0 = render(boySide);
    cache.boyR1 = render(boySide1);
    cache.boyL0 = flip(cache.boyR0);
    cache.boyL1 = flip(cache.boyR1);
    cache.boyHappy = render(boyHappy);
    cache.girl = render(girl);
    cache.girlHappy = render(girlHappy);
    cache.heart = render(heart);
    cache.heartEmpty = render(heart, { r: '#f6e3e8', R: '#e8cbd4', w: '#ffffff', k: '#b98ea0' });
    cache.heartGold = render(heart, { r: '#ffd970', R: '#f2a541', w: '#fffbe6' });
    cache.mini = render(mini, { r: '#ff5f73' });
    cache.miniW = render(mini, { r: '#fffaf0' });
    cache.treePink = render(tree, { A: '#ffb7c5', a: '#ffdbe3', B: '#f08fab', t: '#a8735a' });
    cache.treePeach = render(tree, { A: '#ffcfa8', a: '#ffe6cf', B: '#f5a97a', t: '#a8735a' });
    cache.treeLav = render(tree, { A: '#c9b6f2', a: '#e6dcff', B: '#a996e0', t: '#a8735a' });
    cache.treeGreen = render(tree, { A: '#a9d98f', a: '#d2efb8', B: '#7fbf73', t: '#a8735a' });
    cache.giftBody = giftBody();
    cache.giftLid = giftLid();
    cache.giftSmall = giftSmall();
    cache.cake = cake();
    cache.candle2 = candle(2, '#ffd970');
    cache.candle5 = candle(5, '#c9b6f2');
    cache.flame0 = flame(0);
    cache.flame1 = flame(1);
    cache.cloud = cloud();
    cache.antenna = antenna();
  }
  build();
  return {
    get: n => cache[n],
    url: n => urls[n] || (urls[n] = cache[n].toDataURL()),
    size: n => [cache[n].width, cache[n].height],
    PAL,
  };
})();
