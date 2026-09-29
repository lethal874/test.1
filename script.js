(() => {
  'use strict';

  // ---------- Mood data ----------
  const MOODS = {
    sunny: {
      label: 'Sunny', icon: '☀️', temp: '29°',
      forecast: 'Clear skies all day, with a 95% chance of good vibes. Sunglasses recommended.',
      words: ['happy', 'great', 'good', 'awesome', 'amazing', 'excited', 'joy', 'joyful', 'love', 'glad', 'fantastic', 'proud', 'cheerful', 'lucky', 'fun', 'yay', 'wonderful', 'best'],
      quotes: ['Bottle this feeling. Future you will want a sip.', 'Good days count double. Notice this one.', 'Let the sun do its thing. You too.'],
      music: 'feel good summer playlist',
    },
    rainy: {
      label: 'Rainy', icon: '🌧️', temp: '14°',
      forecast: 'Steady showers through the evening. Rain waters things, and you will grow from this.',
      words: ['sad', 'down', 'lonely', 'cry', 'crying', 'miss', 'missing', 'hurt', 'heartbroken', 'blue', 'upset', 'gloomy', 'depressed', 'low', 'unhappy', 'grief'],
      quotes: ['Even the sky needs to let it out sometimes.', "Rain isn't the whole forecast. It's just today's.", 'Be gentle with yourself. Soft ground grows things.'],
      music: 'rainy day lofi',
    },
    stormy: {
      label: 'Stormy', icon: '⛈️', temp: '11°',
      forecast: 'Thunder rolling in. Storms are loud, but they always pass. Breathe slow and let it blow through.',
      words: ['angry', 'mad', 'stressed', 'stress', 'anxious', 'anxiety', 'furious', 'overwhelmed', 'frustrated', 'annoyed', 'panic', 'rage', 'nervous', 'worried', 'scared', 'pressure'],
      quotes: ["Storms are loud because they're temporary.", 'Unclench your jaw. Drop your shoulders. Breathe out.', 'One thing at a time. The rest can wait outside.'],
      music: 'calming breathing music',
    },
    snowy: {
      label: 'Snowy', icon: '❄️', temp: '-2°',
      forecast: 'Soft snowfall, zero wind. A perfect day to be still and enjoy it.',
      words: ['calm', 'peaceful', 'relaxed', 'chill', 'quiet', 'cozy', 'cosy', 'content', 'serene', 'still', 'rested', 'okay', 'ok', 'fine', 'at peace'],
      quotes: ['Quiet is a kind of music.', 'Nothing needs fixing right now.', 'Stay a while in the stillness.'],
      music: 'cozy winter acoustic',
    },
    foggy: {
      label: 'Foggy', icon: '🌫️', temp: '9°',
      forecast: 'Low visibility this morning. Take it slow; the fog usually lifts by afternoon.',
      words: ['confused', 'meh', 'bored', 'unsure', 'tired', 'sleepy', 'numb', 'blah', 'lost', 'foggy', 'distracted', 'exhausted', 'stuck', 'drained', 'idk'],
      quotes: ["You don't have to see the whole road, just the next step.", 'Fog is just a cloud that came down to visit.', 'Rest is a valid plan.'],
      music: 'ambient focus music',
    },
    aurora: {
      label: 'Aurora', icon: '🌌', temp: '4°',
      forecast: 'Rare lights overhead tonight. Big ideas are visible from here.',
      words: ['inspired', 'creative', 'hopeful', 'grateful', 'curious', 'dreamy', 'motivated', 'magic', 'magical', 'wonder', 'thankful', 'ideas', 'ambitious', 'amazed', 'hope'],
      quotes: ['Write it down before it floats away.', 'Wonder is a renewable resource.', 'The sky is showing off. You can too.'],
      music: 'dreamy synthwave',
    },
  };

  const $ = (id) => document.getElementById(id);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // ---------- Mood detection ----------
  function detectMood(text) {
    const t = text.toLowerCase();
    let best = null;
    let bestScore = 0;
    for (const [key, m] of Object.entries(MOODS)) {
      const score = m.words.filter((w) => new RegExp(`\\b${escapeRe(w)}\\b`).test(t)).length;
      if (score > bestScore) { best = key; bestScore = score; }
    }
    // "not happy", "don't feel calm" -> flip the obvious ones
    if (/\b(not|no|never|isn'?t|don'?t|can'?t|hardly)\b/.test(t)) {
      if (best === 'sunny') best = 'rainy';
      else if (best === 'snowy') best = 'stormy';
    }
    return best || 'foggy';
  }

  // ---------- Sky canvas ----------
  const canvas = $('sky');
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, t = 0, flash = 0;
  let mood = 'aurora';
  let particles = [];
  let clouds = [];

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
    if (reduceMotion) draw();
  }

  function seed() {
    const area = (W * H) / (1280 * 800);
    const n = (base) => Math.max(12, Math.round(base * area));
    particles = [];
    clouds = [];

    if (mood === 'rainy' || mood === 'stormy') {
      const heavy = mood === 'stormy';
      for (let i = 0; i < n(heavy ? 420 : 260); i++) {
        particles.push({ x: rand(-50, W), y: rand(-H, H), len: rand(10, 24), v: heavy ? rand(16, 26) : rand(10, 18) });
      }
    }
    if (mood === 'rainy' || mood === 'stormy' || mood === 'foggy') {
      const foggy = mood === 'foggy';
      for (let i = 0; i < (foggy ? 11 : 6); i++) {
        clouds.push({ x: rand(-200, W), y: foggy ? rand(H * 0.1, H * 0.95) : rand(-40, H * 0.22), rx: rand(220, 440), ry: rand(60, 130), v: rand(0.1, 0.4) });
      }
    }
    if (mood === 'snowy') {
      for (let i = 0; i < n(220); i++) particles.push({ x: rand(0, W), y: rand(0, H), r: rand(1, 3.6), v: rand(0.4, 1.4), p: rand(0, 6.28) });
    }
    if (mood === 'sunny') {
      for (let i = 0; i < n(60); i++) particles.push({ x: rand(0, W), y: rand(0, H), r: rand(1, 3), v: rand(0.2, 0.6), a: rand(0.2, 0.8) });
    }
    if (mood === 'aurora') {
      for (let i = 0; i < n(160); i++) particles.push({ x: rand(0, W), y: rand(0, H * 0.85), r: rand(0.4, 1.6), p: rand(0, 6.28) });
    }
  }

  function blob(c, rgb, alpha) {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.scale(1, c.ry / c.rx);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, c.rx);
    g.addColorStop(0, `rgba(${rgb},${alpha})`);
    g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, c.rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawSun() {
    const r = Math.min(W, H) * 0.07;
    const cx = W * 0.82;
    const cy = H * 0.2;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 5);
    g.addColorStop(0, 'rgba(255,220,130,0.85)');
    g.addColorStop(0.25, 'rgba(255,160,80,0.3)');
    g.addColorStop(1, 'rgba(255,110,60,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * 0.002);
    ctx.strokeStyle = 'rgba(255,210,120,0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 12; i++) {
      ctx.rotate(Math.PI / 6);
      ctx.beginPath();
      ctx.moveTo(r * 1.5, 0);
      ctx.lineTo(r * (2.4 + 0.3 * Math.sin(t * 0.03 + i)), 0);
      ctx.stroke();
    }
    ctx.restore();

    ctx.fillStyle = '#ffe28a';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawAurora() {
    const bands = [
      ['92,242,194', 0.2, 0.18],
      ['167,139,250', 0.16, 0.28],
      ['80,170,255', 0.12, 0.36],
    ];
    bands.forEach(([rgb, a, yF], i) => {
      const base = H * yF;
      const depth = H * 0.38;
      ctx.beginPath();
      ctx.moveTo(0, base);
      for (let x = 0; x <= W + 20; x += 20) {
        const y = base + Math.sin(x * 0.004 + t * 0.008 + i * 2) * 40 + Math.sin(x * 0.011 + t * 0.005) * 18;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, base + depth);
      ctx.lineTo(0, base + depth);
      ctx.closePath();
      const g = ctx.createLinearGradient(0, base - 40, 0, base + depth);
      g.addColorStop(0, `rgba(${rgb},${a})`);
      g.addColorStop(1, `rgba(${rgb},0)`);
      ctx.fillStyle = g;
      ctx.fill();
    });
  }

  function draw() {
    const move = !reduceMotion;
    ctx.clearRect(0, 0, W, H);

    if (mood === 'sunny') drawSun();
    if (mood === 'aurora') drawAurora();

    if (clouds.length) {
      const rgb = mood === 'foggy' ? '205,212,225' : mood === 'stormy' ? '45,32,78' : '90,110,150';
      const alpha = mood === 'foggy' ? 0.16 : mood === 'stormy' ? 0.6 : 0.3;
      for (const c of clouds) {
        if (move) { c.x += c.v; if (c.x - c.rx > W) c.x = -c.rx; }
        blob(c, rgb, alpha);
      }
    }

    if (mood === 'rainy' || mood === 'stormy') {
      ctx.strokeStyle = mood === 'stormy' ? 'rgba(195,175,255,0.45)' : 'rgba(140,200,255,0.45)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (const p of particles) {
        if (move) {
          p.y += p.v;
          p.x += p.v * 0.15;
          if (p.y > H) { p.y = rand(-40, 0); p.x = rand(-50, W); }
        }
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.len * 0.15, p.y - p.len);
      }
      ctx.stroke();
    } else if (mood === 'snowy') {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      for (const p of particles) {
        if (move) {
          p.y += p.v;
          p.x += Math.sin(t * 0.01 + p.p) * 0.4;
          if (p.y > H + 5) { p.y = -5; p.x = rand(0, W); }
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (mood === 'sunny') {
      for (const p of particles) {
        if (move) {
          p.y -= p.v;
          if (p.y < -10) { p.y = H + 10; p.x = rand(0, W); }
        }
        ctx.fillStyle = `rgba(255,220,150,${p.a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (mood === 'aurora') {
      for (const p of particles) {
        ctx.fillStyle = `rgba(255,255,255,${0.35 + 0.45 * Math.sin(t * 0.03 + p.p)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (mood === 'stormy' && move) {
      if (flash === 0 && Math.random() < 0.006) flash = 1;
      if (flash > 0) {
        ctx.fillStyle = `rgba(210,200,255,${flash * 0.35})`;
        ctx.fillRect(0, 0, W, H);
        flash *= 0.86;
        if (flash < 0.02) flash = 0;
      }
    }
  }

  function loop() {
    t++;
    draw();
    requestAnimationFrame(loop);
  }

  function setSky(key) {
    mood = key;
    document.body.dataset.mood = key;
    seed();
    if (reduceMotion) draw();
  }

  // ---------- Forecast UI ----------
  const HISTORY_KEY = 'mw-history';

  function loadHistory() {
    try {
      const h = JSON.parse(localStorage.getItem(HISTORY_KEY));
      return Array.isArray(h) ? h.filter((e) => e && MOODS[e.m]) : [];
    } catch {
      return [];
    }
  }

  function renderHistory(history = loadHistory()) {
    const strip = $('week-strip');
    strip.textContent = '';
    for (const e of history) {
      const m = MOODS[e.m];
      const li = document.createElement('li');
      const day = document.createElement('span');
      day.textContent = new Date(e.ts).toLocaleDateString(undefined, { weekday: 'short' });
      const ic = document.createElement('span');
      ic.className = 'ic';
      ic.textContent = m.icon;
      const lb = document.createElement('span');
      lb.className = 'lb';
      lb.textContent = m.label;
      li.append(day, ic, lb);
      li.title = `${m.label} · ${new Date(e.ts).toLocaleString()}`;
      strip.append(li);
    }
    $('week-empty').hidden = history.length > 0;
  }

  function addHistory(key) {
    const history = [...loadHistory(), { m: key, ts: Date.now() }].slice(-7);
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch { /* storage unavailable */ }
    renderHistory(history);
  }

  function showForecast(key, { save = true, updateUrl = true } = {}) {
    const m = MOODS[key];
    setSky(key);
    $('r-icon').textContent = m.icon;
    $('r-label').textContent = m.label;
    $('r-temp').textContent = m.temp;
    $('r-forecast').textContent = m.forecast;
    $('r-quote').textContent = pick(m.quotes);
    $('r-music').href = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(m.music);
    $('r-music-label').textContent = 'Play: ' + m.music;
    $('signup-mood').value = key;

    const card = document.querySelector('.result');
    card.classList.remove('pop');
    void card.offsetWidth;
    card.classList.add('pop');

    if (updateUrl) {
      const url = new URL(location.href);
      url.searchParams.set('mood', key);
      url.hash = '';
      history.replaceState(null, '', url);
    }
    if (save) addHistory(key);
  }

  function goToForecast() {
    $('forecast').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  $('mood-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = $('mood-input');
    const text = input.value.trim();
    if (!text) {
      const form = e.currentTarget;
      form.classList.remove('shake');
      void form.offsetWidth;
      form.classList.add('shake');
      input.focus();
      return;
    }
    showForecast(detectMood(text));
    goToForecast();
  });

  document.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      showForecast(chip.dataset.mood);
      goToForecast();
    });
  });

  // ---------- Share ----------
  let toastTimer;
  function toast(message) {
    const el = $('toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
  }

  $('r-share').addEventListener('click', async () => {
    const m = MOODS[mood];
    const url = new URL(location.href);
    url.searchParams.set('mood', mood);
    url.hash = '';
    const text = `My inner weather today: ${m.icon} ${m.label}. What's yours?`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Mood Weather', text, url: url.href });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url.href}`);
      toast('Link copied. Send it to a friend!');
    } catch {
      toast('Copy this link: ' + url.href);
    }
  });

  // ---------- Waitlist (Formspree) ----------
  const signup = $('signup');
  signup.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = $('signup-msg');
    const btn = signup.querySelector('button');
    const done = (text, ok) => {
      msg.textContent = text;
      msg.className = 'signup-msg ' + (ok ? 'ok' : 'err');
    };

    if (signup.action.includes('YOUR_FORM_ID')) {
      done("You're on the list! (Demo mode: connect Formspree to receive real sign-ups.)", true);
      signup.reset();
      $('signup-mood').value = mood;
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Joining…';
    try {
      const res = await fetch(signup.action, {
        method: 'POST',
        body: new FormData(signup),
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(res.statusText);
      done("You're on the list! Watch your inbox.", true);
      signup.reset();
      $('signup-mood').value = mood;
    } catch {
      done('Something went wrong. Please try again.', false);
    } finally {
      btn.disabled = false;
      btn.textContent = 'Join the waitlist';
    }
  });

  // ---------- Mobile menu ----------
  const menuBtn = $('menu-btn');
  const nav = $('nav');
  const setMenu = (open) => {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  };
  menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

  // ---------- Init ----------
  $('year').textContent = new Date().getFullYear();
  window.addEventListener('resize', resize);
  resize();

  const shared = new URLSearchParams(location.search).get('mood');
  if (shared && MOODS[shared]) showForecast(shared, { save: false, updateUrl: false });
  else showForecast('aurora', { save: false, updateUrl: false });
  renderHistory();

  if (!reduceMotion) loop();
})();
