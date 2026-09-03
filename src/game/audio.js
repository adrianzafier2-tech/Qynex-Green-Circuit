// Lightweight retro sound synthesis via Web Audio API. No asset files needed.
let ctx = null;
let masterGain = null;
let musicGain = null;
let sfxGain = null;
let musicNodes = null;
let enabled = true;

function ensure() {
  if (ctx) return ctx;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.9;
    masterGain.connect(ctx.destination);
    musicGain = ctx.createGain();
    musicGain.gain.value = 0.35;
    musicGain.connect(masterGain);
    sfxGain = ctx.createGain();
    sfxGain.gain.value = 0.6;
    sfxGain.connect(masterGain);
  } catch (e) {
    enabled = false;
  }
  return ctx;
}

export function resumeAudio() {
  ensure();
  if (ctx && ctx.state === "suspended") ctx.resume();
}

export function setMusicVolume(v) {
  ensure();
  if (musicGain) musicGain.gain.value = v;
}
export function setSfxVolume(v) {
  ensure();
  if (sfxGain) sfxGain.gain.value = v;
}

function tone(freq, dur, type = "square", vol = 0.5, glideTo = null, dest = null) {
  if (!enabled) return;
  ensure();
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, ctx.currentTime + dur);
  g.gain.value = 0;
  g.gain.linearRampToValueAtTime(vol, ctx.currentTime + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
  o.connect(g);
  g.connect(dest || sfxGain);
  o.start();
  o.stop(ctx.currentTime + dur + 0.02);
}

export const sfx = {
  click: () => tone(420, 0.08, "square", 0.3),
  select: () => tone(660, 0.1, "square", 0.35, 880),
  good: () => {
    tone(523, 0.1, "square", 0.35);
    setTimeout(() => tone(784, 0.14, "square", 0.35), 90);
  },
  bad: () => tone(220, 0.25, "sawtooth", 0.35, 110),
  excellent: () => {
    tone(523, 0.09, "square", 0.35);
    setTimeout(() => tone(659, 0.09, "square", 0.35), 80);
    setTimeout(() => tone(880, 0.16, "square", 0.35), 160);
  },
  crash: () => {
    tone(120, 0.3, "sawtooth", 0.5, 60);
    if (!ctx) return;
    const noise = ctx.createBufferSource();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    noise.buffer = buf;
    const g = ctx.createGain();
    g.gain.value = 0.4;
    noise.connect(g);
    g.connect(sfxGain);
    noise.start();
  },
  countdown: () => tone(440, 0.15, "square", 0.4),
  go: () => tone(880, 0.4, "square", 0.45, 1320),
  lap: () => {
    tone(660, 0.1, "square", 0.35);
    setTimeout(() => tone(990, 0.12, "square", 0.35), 100);
  },
  finish: () => {
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.18, "square", 0.4), i * 110));
  },
  victory: () => {
    [523, 659, 784, 1047, 1319, 1568].forEach((f, i) =>
      setTimeout(() => tone(f, 0.22, "square", 0.4), i * 130)
    );
  },
  warning: () => tone(300, 0.2, "triangle", 0.35, 200),
};

// Simple looping arpeggio "music" for menu/race.
export function startMusic(mode = "menu") {
  if (!enabled) return;
  ensure();
  if (!ctx) return;
  stopMusic();
  const tempo = mode === "race" ? 0.13 : 0.22;
  const notes =
    mode === "race"
      ? [330, 392, 440, 523, 440, 392, 330, 294]
      : [262, 330, 392, 523, 392, 330, 294, 247];
  let i = 0;
  const tick = () => {
    if (!musicNodes) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "square";
    o.frequency.value = notes[i % notes.length];
    g.gain.value = 0;
    g.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + tempo * 0.9);
    o.connect(g);
    g.connect(musicGain);
    o.start();
    o.stop(ctx.currentTime + tempo);
    // bass
    const bo = ctx.createOscillator();
    const bg = ctx.createGain();
    bo.type = "triangle";
    bo.frequency.value = notes[i % notes.length] / 4;
    bg.gain.value = 0;
    bg.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 0.02);
    bg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + tempo * 0.9);
    bo.connect(bg);
    bg.connect(musicGain);
    bo.start();
    bo.stop(ctx.currentTime + tempo);
    i++;
  };
  musicNodes = { interval: setInterval(tick, tempo * 1000) };
  tick();
}

export function stopMusic() {
  if (musicNodes) {
    clearInterval(musicNodes.interval);
    musicNodes = null;
  }
}