let idx = 0;
const slides = Array.from(document.querySelectorAll('.slide'));
const captionEl = document.getElementById('caption');
let playing = true;
let timer = null;

// Web Audio: simple gentle chime played on each slide change
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let ctx = null;
function ensureAudio() {
  if (!ctx) ctx = new AudioCtx();
  return ctx;
}
function envTone(f, when, dur, type='sine', gain=0.06) {
  const ctx = ensureAudio();
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = f;
  osc.connect(g).connect(ctx.destination);
  const t = when ?? ctx.currentTime;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}
function playChime() {
  const ctx = ensureAudio();
  const t = ctx.currentTime + 0.02;
  [523.25, 659.25, 783.99].forEach((f, i) => envTone(f, t + i*0.08, 0.35, i===1?'triangle':'sine', 0.055));
  envTone(196.00, t + 0.0, 0.45, 'sine', 0.03);
}

function show(i, withChime=true) {
  slides[idx].classList.remove('active');
  idx = (i + slides.length) % slides.length;
  slides[idx].classList.add('active');
  captionEl.textContent = slides[idx].dataset.caption || `Memory ${idx+1}`;
  if (withChime) playChime();
}

function next() { show(idx + 1); }
function prev() { show(idx - 1); }

function start() {
  if (timer) return;
  playing = true;
  timer = setInterval(next, window.SLIDE_INTERVAL_MS || 4200);
}
function stop() {
  playing = false;
  clearInterval(timer);
  timer = null;
}
start();

// Click to toggle pause/play
document.querySelector('.slideshow').addEventListener('click', () => {
  if (playing) stop(); else start();
});

// Keyboard controls
window.addEventListener('keydown', (e) => {
  if (e.key === ' ') { e.preventDefault(); if (playing) stop(); else start(); }
  if (e.key === 'ArrowRight') next();
  if (e.key === 'ArrowLeft') prev();
});

// Buttons
document.getElementById('playBtn').addEventListener('click', () => {
  ensureAudio().resume();
  start();
  playChime();
});
document.getElementById('pauseBtn').addEventListener('click', stop);

document.getElementById('fsBtn').addEventListener('click', () => {
  const el = document.documentElement;
  if (!document.fullscreenElement) el.requestFullscreen?.();
  else document.exitFullscreen?.();
});

// Confetti as a function + click handler
function launchConfetti(){
  const layer = document.createElement('div');
  layer.className = 'confetti';
  const count = 140;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('i');
    piece.style.left = Math.random() * 100 + 'vw';
    piece.style.setProperty('--h', Math.floor(Math.random()*360));
    piece.style.setProperty('--r', (Math.random()*2-1)*180 + 'deg');
    piece.style.animationDuration = (3.2 + Math.random()*1.8) + 's';
    piece.style.opacity = 0.8 + Math.random()*0.2;
    layer.appendChild(piece);
  }
  document.body.appendChild(layer);
  setTimeout(() => layer.remove(), 5200);
}
document.getElementById('confettiBtn').addEventListener('click', launchConfetti);

// Auto-confetti bursts
setTimeout(launchConfetti, 1500);
setInterval(launchConfetti, 22000);

// Birthday Song
let songPlaying = false;
let songTimer = null;
let songNodes = [];
let masterGain = null;

function noteFreq(n){
  const A4 = 440;
  const notes = {'C':-9,'C#':-8,'Db':-8,'D':-7,'D#':-6,'Eb':-6,'E':-5,'F':-4,'F#':-3,'Gb':-3,'G':-2,'G#':-1,'Ab':-1,'A':0,'A#':1,'Bb':1,'B':2};
  const m = n.match(/^([A-G][b#]?)(\d)$/);
  if(!m) return 440;
  const semis = notes[m[1]] + (parseInt(m[2])-4)*12;
  return A4 * Math.pow(2, semis/12);
}

function playNote(name, when, dur=0.38, velocity=0.18){
  const ctx = ensureAudio();
  if(!masterGain){
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.8;
    masterGain.connect(ctx.destination);
  }
  const f = typeof name === 'number' ? name : noteFreq(name);
  const o1 = ctx.createOscillator();
  const o2 = ctx.createOscillator();
  const g = ctx.createGain();
  o1.type = 'sine'; o2.type = 'triangle';
  o1.frequency.value = f; o2.frequency.value = f * 1.005;
  const t = when ?? ctx.currentTime;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(velocity, t+0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, t+dur);
  o1.connect(g); o2.connect(g); g.connect(masterGain);
  o1.start(t); o2.start(t);
  o1.stop(t+dur+0.05); o2.stop(t+dur+0.05);
  songNodes.push(o1,o2,g);
}

function stopSong(){
  songPlaying = false;
  if (songTimer) { clearTimeout(songTimer); songTimer = null; }
  try { songNodes.forEach(n => { try{ n.disconnect(); }catch(_){} }); } catch(_){}
  songNodes = [];
}

function playBirthdaySong(loop=true){
  ensureAudio().resume();
  stopSong();
  songPlaying = true;
  // Melody for "Happy Birthday" in C major
  const seq = [
    ['G4',0.0,0.42], ['G4',0.5,0.42], ['A4',1.0,0.8], ['G4',1.9,0.8], ['C5',2.8,0.8], ['B4',3.7,1.2],
    ['G4',5.2,0.42], ['G4',5.7,0.42], ['A4',6.2,0.8], ['G4',7.1,0.8], ['D5',8.0,0.8], ['C5',8.9,1.2],
    ['G4',10.4,0.42], ['G4',10.9,0.42], ['G5',11.4,0.8], ['E5',12.3,0.8], ['C5',13.2,0.6], ['B4',13.9,0.6], ['A4',14.6,1.0],
    ['F5',16.0,0.42], ['F5',16.5,0.42], ['E5',17.0,0.8], ['C5',17.9,0.8], ['D5',18.8,0.8], ['C5',19.7,1.2]
  ];
  const ctx = ensureAudio();
  const start = ctx.currentTime + 0.08;
  const chords = [
    ['C4',0.0,3.6], ['D4',5.0,3.8], ['C4',10.0,4.8], ['F4',16.0,2.0], ['C4',18.4,2.4]
  ];
  chords.forEach(([n,t,d]) => playNote(n, start + t, d, 0.08));
  seq.forEach(([n,t,d]) => playNote(n, start + t, d, 0.17));
  [0,5.0,10.0,16.0].forEach(t => envTone(987.77, start+t, 0.45, 'sine', 0.04));
  const total = 22.5;
  if (loop) {
    songTimer = setTimeout(() => { if(songPlaying) playBirthdaySong(true); }, total*1000);
  }
}

document.getElementById('songBtn').addEventListener('click', () => {
  ensureAudio().resume();
  if (!songPlaying) {
    playBirthdaySong(true);
    document.getElementById('songBtn').textContent = '⏹ Stop Song';
  } else {
    stopSong();
    document.getElementById('songBtn').textContent = '🎵 Birthday Song';
  }
});

// Lower slide-change chime when song is playing to avoid clutter
const _playChime = playChime;
playChime = function(){ if (!songPlaying) _playChime(); };

// Auto-start birthday song (best effort; some browsers require a click)
window.addEventListener('load', () => {
  try {
    ensureAudio().resume();
    if (typeof playBirthdaySong === 'function') {
      playBirthdaySong(true);
      const btn = document.getElementById('songBtn');
      if (btn) btn.textContent = '⏹ Stop Song';
    }
  } catch(_) {}
  const onceStart = () => {
    try {
      ensureAudio().resume();
      if (typeof playBirthdaySong === 'function') {
        playBirthdaySong(true);
        const btn = document.getElementById('songBtn');
        if (btn) btn.textContent = '⏹ Stop Song';
      }
    } catch(_) {}
    document.removeEventListener('pointerdown', onceStart);
  };
  document.addEventListener('pointerdown', onceStart, { once: true });
});

// Initial caption
captionEl.textContent = slides[0].dataset.caption || 'Memory 1';
