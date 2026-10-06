/* Small shared helpers */
function Typer(el, opts) {
  opts = opts || {};
  const speed = opts.speed || 26;
  let timer = null, full = '', i = 0, done = true, cb = null;
  function step() {
    i++;
    el.textContent = full.slice(0, i);
    const ch = full[i - 1];
    if (opts.onChar && ch && ch !== ' ' && i % 2 === 0) opts.onChar();
    if (i >= full.length) { api.finish(); return; }
    const delay = ',.!?…:'.includes(ch) ? speed * 6 : speed;
    timer = setTimeout(step, delay);
  }
  const api = {
    start(text, onDone) {
      clearTimeout(timer);
      full = text; i = 0; done = false; cb = onDone || null;
      el.textContent = '';
      timer = setTimeout(step, speed);
    },
    finish() {
      clearTimeout(timer);
      el.textContent = full;
      if (!done) { done = true; const c = cb; cb = null; if (c) c(); }
    },
    stop() { clearTimeout(timer); done = true; cb = null; },
    get typing() { return !done; },
  };
  return api;
}
function rng(seed) {
  let s = seed % 2147483647; if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}
