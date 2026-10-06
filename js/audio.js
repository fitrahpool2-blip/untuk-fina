/* Tiny chiptune engine with WebAudio. Muted by default. */
const Sound = (() => {
  let ctx = null, master = null, musicGain = null, noiseBuf = null;
  let on = false, timer = null, nextT = 0, idx = 0;
  const BEAT = 0.42;
  const G4 = 67, A4 = 69, B4 = 71, C5 = 72, D5 = 74, E5 = 76, F5 = 77, G5 = 79;
  const MEL = [
    [G4, .75], [G4, .25], [A4, 1], [G4, 1], [C5, 1], [B4, 2],
    [G4, .75], [G4, .25], [A4, 1], [G4, 1], [D5, 1], [C5, 2],
    [G4, .75], [G4, .25], [G5, 1], [E5, 1], [C5, 1], [B4, 1], [A4, 2],
    [F5, .75], [F5, .25], [E5, 1], [C5, 1], [D5, 1], [C5, 3], [null, 2],
  ];
  const hz = n => 440 * Math.pow(2, (n - 69) / 12);

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination);
      musicGain = ctx.createGain(); musicGain.gain.value = 0.35; musicGain.connect(master);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
    return true;
  }
  function tone(f, t, dur, type, vol, dest, slideTo) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(f, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || master);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(t, dur, vol, freq) {
    const s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    s.buffer = noiseBuf; f.type = 'lowpass'; f.frequency.value = freq || 1200;
    g.gain.setValueAtTime(vol || 0.2, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + dur + 0.05);
  }
  const SFX = {
    blip: t => tone(880, t, 0.03, 'square', 0.04),
    select: t => { tone(660, t, 0.06, 'square', 0.12); tone(990, t + 0.06, 0.08, 'square', 0.12); },
    coin: t => { tone(988, t, 0.08, 'square', 0.15); tone(1319, t + 0.08, 0.3, 'square', 0.15); },
    thump: t => { tone(220, t, 0.12, 'triangle', 0.35, null, 90); },
    open: t => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, t + i * 0.07, 0.18, 'square', 0.13)); },
    magic: t => { [784, 988, 1175, 1568].forEach((f, i) => tone(f, t + i * 0.06, 0.2, 'triangle', 0.18)); },
    blow: t => { noise(t, 0.45, 0.25, 900); },
    pop: t => { noise(t, 0.25, 0.12, 600); tone(150, t, 0.15, 'triangle', 0.1, null, 60); },
    yay: t => { [523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.09, 0.16, 'square', 0.12)); },
  };
  function play(name) { if (!on || !ctx) return; try { SFX[name] && SFX[name](ctx.currentTime + 0.005); } catch (e) { /* ignore */ } }

  function schedule() {
    while (nextT < ctx.currentTime + 0.25) {
      const [n, b] = MEL[idx];
      const dur = b * BEAT;
      if (n) {
        tone(hz(n), nextT, dur * 0.9, 'square', 0.12, musicGain);
        tone(hz(n - 12), nextT, dur * 0.9, 'triangle', 0.18, musicGain);
      }
      nextT += dur; idx = (idx + 1) % MEL.length;
    }
  }
  function startMusic() { if (timer) return; idx = 0; nextT = ctx.currentTime + 0.1; timer = setInterval(schedule, 60); schedule(); }
  function stopMusic() { clearInterval(timer); timer = null; }

  const listeners = [];
  function setOn(v) {
    on = !!v;
    if (on) { if (ensure()) startMusic(); else on = false; }
    else stopMusic();
    listeners.forEach(fn => fn(on));
  }
  return {
    play, toggle: () => setOn(!on), setOn,
    get on() { return on; },
    onChange: fn => listeners.push(fn),
  };
})();
