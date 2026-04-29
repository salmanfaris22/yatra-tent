// =================================================================
// INDIA MAP PIN NAVIGATION
// =================================================================
(function mapPins() {
  document.querySelectorAll('.map-pin').forEach((pin) => {
    const target = pin.getAttribute('data-target');
    if (!target) return;
    const go = () => {
      // If target is an ID on current page, smooth-scroll; else navigate.
      if (target.startsWith('#')) {
        const el = document.querySelector(target);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        else window.location.href = '/events' + target;
      } else {
        window.location.href = target;
      }
    };
    pin.addEventListener('click', go);
    pin.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
    });
  });
})();

// =================================================================
// PAGE INTRO — show only once per browser session, hide fast on repeat
// =================================================================
(function hideIntro() {
  const intro = document.getElementById('intro-screen');
  if (!intro) return;
  const seen = sessionStorage.getItem('yatra-intro-seen');
  if (seen) {
    // Already seen this session — skip the animation entirely
    intro.remove();
    return;
  }
  sessionStorage.setItem('yatra-intro-seen', '1');
  setTimeout(() => intro.classList.add('hide'), 1700);
  setTimeout(() => intro.remove(), 2500);
})();

// =================================================================
// MOBILE HAMBURGER MENU TOGGLE
// Clones .nav-right (clock, time-control, lang-toggle) into the menu
// so all controls are accessible from inside the open hamburger.
// =================================================================
(function hamburger() {
  const btn = document.getElementById('nav-burger');
  const menu = document.getElementById('nav-menu');
  if (!btn || !menu) return;

  function ensureMobileControls() {
    if (window.innerWidth > 880) {
      const existing = menu.querySelector('.nav-right-mobile');
      if (existing) existing.remove();
      return;
    }
    if (menu.querySelector('.nav-right-mobile')) return;
    const desktopRight = document.querySelector('.nav-right');
    if (!desktopRight) return;
    const clone = desktopRight.cloneNode(true);
    clone.classList.remove('nav-right');
    clone.classList.add('nav-right-mobile');
    clone.querySelectorAll('[id]').forEach((el) => {
      el.dataset.originalId = el.id;
      el.removeAttribute('id');
    });
    menu.appendChild(clone);
    clone.querySelectorAll('.tc-btn').forEach((cloneBtn) => {
      cloneBtn.addEventListener('click', () => {
        const v = cloneBtn.dataset.set;
        const original = document.querySelector(`.nav-right .tc-btn[data-set="${v}"]`);
        if (original) original.click();
      });
    });
  }

  function close() {
    btn.classList.remove('open');
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', () => {
    ensureMobileControls();
    const open = btn.classList.toggle('open');
    menu.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) close();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 880) {
      close();
      const existing = menu.querySelector('.nav-right-mobile');
      if (existing) existing.remove();
    }
  });
})();

// =================================================================
// HIDE-ON-SCROLL NAVBAR (down → hide, up → show)
// =================================================================
(function navAutoHide() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  let lastY = window.scrollY;
  let ticking = false;
  const HIDE_AFTER = 120; // px scrolled before allowing hide
  const DELTA = 6;        // ignore tiny scroll jitter

  function update() {
    const y = window.scrollY;
    const diff = y - lastY;

    // Add scrolled style after first 10px
    nav.classList.toggle('nav-scrolled', y > 10);

    // Always show within the top zone or while menu is open
    if (y < HIDE_AFTER || nav.querySelector('.nav-links.open')) {
      nav.classList.remove('nav-hidden');
    } else if (Math.abs(diff) > DELTA) {
      if (diff > 0) {
        nav.classList.add('nav-hidden');     // scrolling down
      } else {
        nav.classList.remove('nav-hidden');  // scrolling up
      }
    }

    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
})();

// =================================================================
// SCROLL PROGRESS TRAIL — moves the tent marker with scroll
// =================================================================
(function scrollTrail() {
  const marker = document.getElementById('trail-marker');
  if (!marker) return;
  function updateTrail() {
    const doc = document.documentElement;
    const max = (doc.scrollHeight - window.innerHeight) || 1;
    const p = Math.min(Math.max(window.scrollY / max, 0), 1);
    marker.style.left = (p * 100) + '%';
  }
  window.addEventListener('scroll', updateTrail, { passive: true });
  updateTrail();
})();

// =================================================================
// PER-PAGE INIT (called on first load + after every SPA navigation)
// =================================================================
function initStatCounters(root) {
  const counters = root.querySelectorAll('.stat-counter');
  if (!counters.length) return;
  function animate(el) {
    const target = parseInt(el.dataset.target || '0', 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();
    function frame(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(target * eased);
      el.textContent = (value > 999 ? (value / 1000).toFixed(1) + 'K' : value) + suffix;
      if (t < 1) requestAnimationFrame(frame);
      else {
        el.textContent = (target > 999 ? (target / 1000).toFixed(1) + 'K' : target) + suffix;
        el.classList.add('counting');
        setTimeout(() => el.classList.remove('counting'), 500);
      }
    }
    requestAnimationFrame(frame);
  }
  if (!('IntersectionObserver' in window)) { counters.forEach(animate); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); }
    });
  }, { threshold: 0.4 });
  counters.forEach((el) => io.observe(el));
}

function initHeadingDraw(root) {
  const heads = root.querySelectorAll('.section-head h2, .heading-draw');
  if (!heads.length) return;
  if (!('IntersectionObserver' in window)) { heads.forEach((h) => h.classList.add('visible')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.3 });
  heads.forEach((h) => io.observe(h));
}

function initReveals(root) {
  const items = root.querySelectorAll('.reveal');
  if (!items.length) return;
  if (!('IntersectionObserver' in window)) { items.forEach((el) => el.classList.add('visible')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  items.forEach((el) => io.observe(el));
}

function initClouds(root) {
  root.querySelectorAll('.hero-cloud-host').forEach((host) => {
    if (host.dataset.cloudsSpawned) return;
    host.dataset.cloudsSpawned = '1';
    for (let i = 0; i < 3; i++) {
      const c = document.createElement('span');
      c.className = 'floating-cloud';
      c.textContent = ['☁️', '⛅', '🌥️'][i % 3];
      c.style.top = 10 + i * 18 + '%';
      c.style.animationDuration = 30 + i * 12 + 's';
      c.style.animationDelay = -i * 6 + 's';
      host.appendChild(c);
    }
  });
}

function initCardTilt(root) {
  root.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `translateY(-8px) rotateX(${y * -6}deg) rotateY(${x * 6}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
  root.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${y * -14}deg) rotateY(${x * 14}deg) translateZ(20px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

function initLetterReveal(root) {
  root.querySelectorAll('.section-head h2, .heading-draw').forEach((h) => {
    if (h.dataset.letterized) return;
    h.dataset.letterized = '1';
    const text = h.textContent;
    h.textContent = '';
    [...text].forEach((ch, i) => {
      const s = document.createElement('span');
      s.className = 'letter';
      s.textContent = ch === ' ' ? '\u00A0' : ch;
      s.style.transitionDelay = (i * 28) + 'ms';
      h.appendChild(s);
    });
  });
}

function initMagneticButtons(root) {
  if (window.matchMedia('(hover: none)').matches) return;
  root.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.28}px, ${y * 0.28}px) translateY(-3px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

function initBlobHover(root) {
  if (window.matchMedia('(hover: none)').matches) return;
  root.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
}

function initContactForm(root) {
  const form = root.querySelector('#contact-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = form.querySelector('#form-status');
    const data = Object.fromEntries(new FormData(form));
    try {
      const r = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (r.ok) {
        status.textContent = '✓ Thanks! We will get back to you soon.';
        status.style.color = 'var(--green)';
        form.reset();
      } else { throw new Error('failed'); }
    } catch {
      status.textContent = '✗ Something went wrong. Please try WhatsApp.';
      status.style.color = '#c0392b';
    }
  });
}

function initPageContent(root) {
  initReveals(root);
  initHeadingDraw(root);
  initLetterReveal(root);
  initStatCounters(root);
  initClouds(root);
  initCardTilt(root);
  initBlobHover(root);
  initMagneticButtons(root);
  initContactForm(root);
}

// =================================================================
// LIVE CLOCK + DAY/NIGHT THEME (auto from local time)
// =================================================================
function timeOfDay(hour) {
  if (hour >= 5  && hour < 11) return 'morning';
  if (hour >= 11 && hour < 16) return 'day';
  if (hour >= 16 && hour < 19) return 'evening';
  return 'night';
}
function todLabel(t) {
  return { morning: 'Morning', day: 'Day', evening: 'Evening', night: 'Night' }[t];
}
function pad2(n) { return n < 10 ? '0' + n : '' + n; }

// Manual override — null means auto (real time)
let forcedTime = localStorage.getItem('yatra-time') || null;

function tickClock() {
  const now = new Date();
  const hh = now.getHours();
  const mm = now.getMinutes();
  const ss = now.getSeconds();
  const el = document.getElementById('clock-time');
  if (el) el.textContent = pad2(hh) + ':' + pad2(mm) + ':' + pad2(ss);

  const tod = forcedTime || timeOfDay(hh);
  if (document.documentElement.dataset.time !== tod) {
    document.documentElement.dataset.time = tod;
  }
  const todEl = document.getElementById('clock-tod');
  if (todEl) todEl.textContent = todLabel(tod) + (forcedTime ? ' (manual)' : '');
}
tickClock();
setInterval(tickClock, 1000);

// Wire up the time-control buttons
document.querySelectorAll('.tc-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const v = btn.dataset.set;
    if (v === 'auto') {
      forcedTime = null;
      localStorage.removeItem('yatra-time');
    } else {
      forcedTime = v;
      localStorage.setItem('yatra-time', v);
    }
    document.querySelectorAll('.tc-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    tickClock();
  });
});
// Highlight initial active state
(function markInitial() {
  const v = forcedTime || 'auto';
  const btn = document.querySelector(`.tc-btn[data-set="${v}"]`);
  if (btn) btn.classList.add('active');
})();

// =================================================================
// TRAVELER POSE CYCLE — walks → sits → camps → walks again
// =================================================================
function startTravelerPoses() {
  const traveler = document.querySelector('.traveler');
  if (!traveler) return;
  const POSES = [
    'pose-sit', 'pose-camp', 'pose-tent', 'pose-eat',
    'pose-wash', 'pose-sleep', 'pose-cook', 'pose-photo', 'pose-phone',
  ];
  const cycle = [
    { pose: '',           hold: 14000 }, // 1. walking
    { pose: 'pose-tent',  hold: 6000  }, // 2. pitching tent
    { pose: '',           hold: 10000 }, // 3. walking
    { pose: 'pose-photo', hold: 5000  }, // 4. photographing mountains
    { pose: '',           hold: 8000  }, // 5. walking
    { pose: 'pose-cook',  hold: 7000  }, // 6. cooking over the fire
    { pose: '',           hold: 9000  }, // 7. walking
    { pose: 'pose-eat',   hold: 6000  }, // 8. eating
    { pose: '',           hold: 10000 }, // 9. walking
    { pose: 'pose-phone', hold: 5000  }, // 10. checking phone
    { pose: '',           hold: 9000  }, // 11. walking
    { pose: 'pose-wash',  hold: 5000  }, // 12. bathing
    { pose: '',           hold: 10000 }, // 13. walking
    { pose: 'pose-sit',   hold: 5000  }, // 14. sitting
    { pose: '',           hold: 9000  }, // 15. walking
    { pose: 'pose-camp',  hold: 6000  }, // 16. napping
    { pose: '',           hold: 12000 }, // 17. walking
    { pose: 'pose-sleep', hold: 7000  }, // 18. sleeping on mat
  ];
  let i = 0;
  function next() {
    const step = cycle[i % cycle.length];
    POSES.forEach((p) => traveler.classList.remove(p));
    if (step.pose) traveler.classList.add(step.pose);
    i++;
    setTimeout(next, step.hold);
  }
  next();
}
startTravelerPoses();

// =================================================================
// WEATHER CYCLE — random rain/fog spells (data-weather on <html>)
// =================================================================
(function weatherCycle() {
  const weathers = ['', '', '', '', 'rain', 'fog']; // mostly clear
  function tick() {
    const w = weathers[Math.floor(Math.random() * weathers.length)];
    if (w) document.documentElement.dataset.weather = w;
    else delete document.documentElement.dataset.weather;
    const next = 18000 + Math.random() * 22000;
    setTimeout(tick, next);
  }
  setTimeout(tick, 12000);
})();

// =================================================================
// FOOTPRINT TRAIL — spawn a print behind the traveler periodically
// =================================================================
(function footprints() {
  const container = document.getElementById('footprint-trail');
  const traveler = document.querySelector('.traveler');
  if (!container || !traveler) return;
  let alt = false;
  let lastX = null;
  setInterval(() => {
    // Only spawn while he's actually walking (no pose class)
    if (traveler.className.split(' ').some((c) => c.startsWith('pose-'))) return;
    const r = traveler.getBoundingClientRect();
    if (r.width === 0) return;
    const x = r.left + r.width / 2;
    if (lastX !== null && Math.abs(x - lastX) < 6) return; // only when moving
    lastX = x;
    const p = document.createElement('div');
    p.className = 'footprint' + (alt ? ' alt' : '');
    p.style.left = (x - 5 + (alt ? 4 : -4)) + 'px';
    container.appendChild(p);
    setTimeout(() => p.remove(), 4600);
    alt = !alt;
  }, 550);
})();

// =================================================================
// CANVAS FIREFLIES — real particle system at night
// =================================================================
(function canvasFireflies() {
  const canvas = document.getElementById('firefly-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  const particles = [];

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);
  }
  resize();
  window.addEventListener('resize', resize);

  const COUNT = 90;
  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h * 0.85,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.2,
      r: 1 + Math.random() * 2.2,
      phase: Math.random() * Math.PI * 2,
      speed: 0.03 + Math.random() * 0.04,
    });
  }

  function draw() {
    // Only run at night
    if (document.documentElement.dataset.time !== 'night') {
      ctx.clearRect(0, 0, w, h);
      requestAnimationFrame(draw);
      return;
    }
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.phase += p.speed;
      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;
      if (p.y < -20) p.y = h + 20;
      if (p.y > h + 20) p.y = -20;
      const blink = 0.35 + (Math.sin(p.phase) + 1) * 0.35;
      // Bloom
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 8);
      g.addColorStop(0, `rgba(255, 230, 128, ${blink})`);
      g.addColorStop(0.4, `rgba(255, 180, 60, ${blink * 0.35})`);
      g.addColorStop(1, 'rgba(255, 180, 60, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 8, 0, Math.PI * 2);
      ctx.fill();
      // Core
      ctx.fillStyle = `rgba(255, 245, 200, ${blink})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

// =================================================================
// HEAD-TRACKING — traveler's head rotates toward the cursor
// =================================================================
(function headTracker() {
  if (window.matchMedia('(hover: none)').matches) return;
  const traveler = document.querySelector('.traveler');
  if (!traveler) return;
  const head = traveler.querySelector('.head');
  if (!head) return;
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });

  function tick() {
    const r = traveler.getBoundingClientRect();
    if (r.width > 0) {
      const cx = r.left + r.width / 2;
      const cy = r.top + 18;
      const dx = mx - cx;
      const dy = my - cy;
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      // Clamp head rotation to ±25°
      const clamped = Math.max(-25, Math.min(25, angle * 0.4));
      head.style.transform = `rotate(${clamped}deg)`;
    }
    requestAnimationFrame(tick);
  }
  tick();
})();

// =================================================================
// PATH-AWARE TRAVELER — overrides the CSS left/transform keyframe
// with a JS walker that follows a winding SVG path via
// getPointAtLength (hills, dip, hill). The traveler still animates
// across and back using the path each cycle.
// =================================================================
(function pathWalker() {
  const traveler = document.querySelector('.traveler');
  const path = document.getElementById('walk-path');
  if (!traveler || !path) return;

  // Kill the CSS keyframe animation; we drive position from JS
  traveler.style.animation = 'none';
  traveler.style.left = '0';
  traveler.style.bottom = '8px';

  const LOOP = 55000; // ms — same duration as old CSS loop
  const total = path.getTotalLength();

  function frame(now) {
    const t = (now % LOOP) / LOOP;
    // Go right for first half, left for second half (mirrored)
    const forward = t < 0.5;
    const u = forward ? t * 2 : (1 - t) * 2;
    const pt = path.getPointAtLength(u * total);
    // Map path x (0..2400 in svg units) to viewport width
    const w = window.innerWidth;
    const x = u * (w + 160) - 80;
    const y = pt.y; // negative means "up the hill"
    traveler.style.transform = `translate(${x}px, ${y}px) scaleX(${forward ? 1 : -1})`;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

// =================================================================
// DRONE FOLLOWER — lerps toward traveler with a delay and sine bob
// =================================================================
(function droneFollower() {
  const drone = document.getElementById('drone');
  const traveler = document.querySelector('.traveler');
  if (!drone || !traveler) return;
  let dx = 0, dy = 0;
  let t0 = performance.now();
  function tick(now) {
    const r = traveler.getBoundingClientRect();
    const targetX = r.left + r.width / 2 - 32;
    const targetY = r.top - 90 + Math.sin((now - t0) / 500) * 10;
    // Lerp toward target with damping (delayed follow)
    dx += (targetX - dx) * 0.035;
    dy += (targetY - dy) * 0.035;
    drone.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

// =================================================================
// SPEECH BUBBLES — random idle thoughts above the traveler
// with typewriter effect and bilingual rotation
// =================================================================
(function speechBubbles() {
  const bubble = document.getElementById('speech-bubble');
  const text = bubble && bubble.querySelector('.bubble-text');
  const traveler = document.querySelector('.traveler');
  if (!bubble || !traveler || !text) return;

  const LINES = {
    en: [
      "Nice view up here",
      "Almost there",
      "The stars are out",
      "Need a chai break",
      "Let's set up camp",
      "What a trail",
      "Smell that fire",
      "Sunset soon",
    ],
    ml: [
      "മനോഹരമായ കാഴ്ച",
      "ഏതാണ്ട് എത്തി",
      "നക്ഷത്രങ്ങൾ വന്നു",
      "ഒരു ചായ വേണം",
      "ക്യാമ്പ് ഒരുക്കാം",
      "എന്തൊരു വഴി",
      "തീയുടെ മണം",
      "സൂര്യാസ്തമയം അടുത്തു",
    ],
  };

  async function typeOut(str) {
    text.textContent = '';
    for (let i = 0; i < str.length; i++) {
      text.textContent += str[i];
      await new Promise((r) => setTimeout(r, 35));
    }
  }

  async function show() {
    const lang = document.documentElement.getAttribute('lang') || 'en';
    const lines = LINES[lang] || LINES.en;
    const line = lines[Math.floor(Math.random() * lines.length)];

    // Position above the traveler
    const r = traveler.getBoundingClientRect();
    bubble.style.left = (r.left + r.width / 2 - 20) + 'px';
    bubble.style.top = (r.top - 46) + 'px';
    bubble.style.bottom = 'auto';

    bubble.classList.add('show');
    await typeOut(line);
    await new Promise((r) => setTimeout(r, 2600));
    bubble.classList.remove('show');
  }

  function loop() {
    const next = 12000 + Math.random() * 14000;
    setTimeout(() => { show().then(loop); }, next);
  }
  loop();
})();

// =================================================================
// SPLITTEXT SHUFFLE on language toggle — Matrix-style decode
// =================================================================
(function splitTextShuffle() {
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&';
  const MAL_CHARS = 'അആഇഈഉഊഋഎഏഐഒഓഔകഖഗഘങചഛജഝഞടഠഡഢണതഥദധനപഫബഭമയരലവശഷസഹളഴറ';
  function randChar(isMl) {
    const src = isMl ? MAL_CHARS : CHARS;
    return src[Math.floor(Math.random() * src.length)];
  }
  function shuffleElement(el, finalText, isMl) {
    const duration = 800;
    const start = performance.now();
    function frame(now) {
      const t = Math.min((now - start) / duration, 1);
      const revealed = Math.floor(finalText.length * t);
      let out = finalText.slice(0, revealed);
      for (let i = revealed; i < finalText.length; i++) {
        const ch = finalText[i];
        if (ch === ' ') out += ' ';
        else out += randChar(isMl);
      }
      el.textContent = out;
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = finalText;
    }
    requestAnimationFrame(frame);
  }

  // Hook into the existing toggleLang so it shuffles every visible data-l element
  const originalToggle = window.toggleLang;
  window.toggleLang = function () {
    if (originalToggle) originalToggle();
    const nextLang = document.documentElement.getAttribute('lang');
    const isMl = nextLang === 'ml';
    document.querySelectorAll('[data-l="' + nextLang + '"]').forEach((el) => {
      // Only shuffle leaf text nodes (no nested spans)
      if (el.children.length === 0 && el.textContent.trim().length) {
        const finalText = el.textContent;
        shuffleElement(el, finalText, isMl);
      }
    });
  };
})();

// =================================================================
// SNAP NAV DOTS — build dots from sections, highlight current,
// click scrolls, ←/↓/→/↑ keys navigate
// =================================================================
(function snapNav() {
  const nav = document.getElementById('snap-nav');
  if (!nav) return;

  function build() {
    nav.innerHTML = '';
    const sections = document.querySelectorAll('#nexgo-root > section');
    if (sections.length < 2) { nav.style.display = 'none'; return; }
    nav.style.display = 'flex';
    sections.forEach((s, i) => {
      const dot = document.createElement('button');
      dot.className = 'snap-dot';
      const heading = s.querySelector('h1, h2');
      const label = heading ? heading.textContent.trim().slice(0, 22) : 'Section ' + (i + 1);
      dot.setAttribute('data-label', label);
      dot.setAttribute('aria-label', label);
      dot.addEventListener('click', () => {
        s.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      nav.appendChild(dot);
    });

    // IntersectionObserver for active highlight
    const dots = [...nav.querySelectorAll('.snap-dot')];
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const idx = [...sections].indexOf(e.target);
          dots.forEach((d, i) => d.classList.toggle('active', i === idx));
        }
      });
    }, { threshold: 0.4 });
    sections.forEach((s) => io.observe(s));
  }
  build();

  // Rebuild on SPA nav
  window.addEventListener('popstate', () => setTimeout(build, 250));
  document.addEventListener('click', (e) => {
    if (e.target.closest('a') && !e.target.closest('.snap-nav')) {
      setTimeout(build, 450);
    }
  });

  // Keyboard: ArrowDown/Up jump sections
  window.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea, select')) return;
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const sections = [...document.querySelectorAll('#nexgo-root > section')];
    const y = window.scrollY + window.innerHeight * 0.3;
    let idx = 0;
    sections.forEach((s, i) => {
      if (s.offsetTop <= y) idx = i;
    });
    if (e.key === 'ArrowDown' && idx < sections.length - 1) {
      e.preventDefault();
      sections[idx + 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (e.key === 'ArrowUp' && idx > 0) {
      e.preventDefault();
      sections[idx - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
})();

// =================================================================
// SHADER CURSOR — canvas trail with day/night tint
// =================================================================
(function shaderCursor() {
  if (window.matchMedia('(hover: none)').matches) return;
  const canvas = document.getElementById('shader-cursor');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0;
  function resize() {
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w; canvas.height = h;
  }
  resize();
  window.addEventListener('resize', resize);

  const trail = [];
  const MAX = 24;
  window.addEventListener('mousemove', (e) => {
    trail.push({ x: e.clientX, y: e.clientY, t: performance.now() });
    if (trail.length > MAX) trail.shift();
  }, { passive: true });

  function color() {
    const t = document.documentElement.dataset.time;
    switch (t) {
      case 'morning': return [255, 200, 140];
      case 'evening': return [255, 130, 70];
      case 'night':   return [180, 200, 255];
      default:        return [232, 165, 48];
    }
  }
  function loop() {
    ctx.clearRect(0, 0, w, h);
    const [r, g, b] = color();
    for (let i = 0; i < trail.length; i++) {
      const p = trail[i];
      const age = (performance.now() - p.t) / 600;
      if (age > 1) continue;
      const radius = 24 * (1 - age) + 2;
      const alpha = (1 - age) * 0.55 * (i / trail.length);
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
      grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
      grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(loop);
  }
  loop();
})();

// =================================================================
// SCROLL-BOUND CAMPFIRE — flames phase-shift with scroll position
// =================================================================
(function scrollCampfire() {
  const campfire = document.querySelector('.campfire');
  if (!campfire) return;
  const flames = campfire.querySelectorAll('.flame');
  let ticking = false;
  function update() {
    const y = window.scrollY;
    const phase = (y * 0.01) % (Math.PI * 2);
    flames.forEach((f, i) => {
      const offset = Math.sin(phase + i * 0.8);
      f.style.transform = `translateX(-50%) scale(${1 + offset * 0.12}, ${1 - offset * 0.08})`;
    });
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
})();

// =================================================================
// WEBGL LANDSCAPE — vanilla fragment shader, ~2KB, time-aware
// =================================================================
(function webglLandscape() {
  const canvas = document.getElementById('webgl-landscape');
  if (!canvas) return;
  const gl = canvas.getContext('webgl', { antialias: true, alpha: true });
  if (!gl) return;

  const VS = `
    attribute vec2 aPos;
    varying vec2 vUv;
    void main() {
      vUv = aPos * 0.5 + 0.5;
      gl_Position = vec4(aPos, 0.0, 1.0);
    }
  `;
  const FS = `
    precision mediump float;
    varying vec2 vUv;
    uniform float uTime;
    uniform float uScroll;
    uniform vec3  uSkyTop;
    uniform vec3  uSkyBot;
    uniform vec3  uMtA;
    uniform vec3  uMtB;
    uniform vec3  uMtC;
    uniform vec3  uFog;

    float hash(float n) { return fract(sin(n) * 43758.5453); }
    float noise(float x) {
      float i = floor(x);
      float f = fract(x);
      float u = f * f * (3.0 - 2.0 * f);
      return mix(hash(i), hash(i + 1.0), u);
    }
    float mountainLine(float x, float amp, float freq, float seed) {
      float v = noise(x * freq + seed) * amp;
      v += noise(x * freq * 2.1 + seed * 1.3) * amp * 0.5;
      v += noise(x * freq * 4.3 + seed * 2.7) * amp * 0.25;
      return v;
    }

    void main() {
      vec2 uv = vUv;
      // Sky gradient
      vec3 col = mix(uSkyBot, uSkyTop, pow(uv.y, 0.7));

      float t = uTime * 0.02 + uScroll * 0.0005;

      // 6 layered mountain ridges, back to front
      float m1 = 0.72 + mountainLine(uv.x + t * 0.15, 0.10, 1.5, 0.5);
      float m2 = 0.62 + mountainLine(uv.x + t * 0.22, 0.13, 2.0, 1.7);
      float m3 = 0.52 + mountainLine(uv.x + t * 0.30, 0.16, 2.6, 4.7);
      float m4 = 0.42 + mountainLine(uv.x + t * 0.42, 0.20, 3.4, 9.3);
      float m5 = 0.30 + mountainLine(uv.x + t * 0.55, 0.24, 4.5, 14.1);
      float m6 = 0.18 + mountainLine(uv.x + t * 0.72, 0.26, 5.5, 21.7);

      // Snow caps on the back two ridges (above their crest line)
      vec3 snow = vec3(0.95, 0.97, 1.0);

      // Layer 1 (farthest) — heavily fogged
      if (uv.y < m1) {
        vec3 c = mix(uMtA, uFog, 0.55);
        if (uv.y > m1 - 0.025) c = mix(c, snow, 0.5); // back snow caps
        col = mix(col, c, 0.8);
      }
      // Layer 2 — fogged
      if (uv.y < m2) {
        vec3 c = mix(uMtA, uFog, 0.4);
        if (uv.y > m2 - 0.02) c = mix(c, snow, 0.4);
        col = mix(col, c, 0.85);
      }
      // Layer 3 — slight fog
      if (uv.y < m3) col = mix(col, mix(uMtB, uFog, 0.22), 0.88);
      // Layer 4
      if (uv.y < m4) col = mix(col, uMtB, 0.9);
      // Layer 5 — closer
      if (uv.y < m5) col = mix(col, uMtC, 0.92);
      // Layer 6 — closest
      if (uv.y < m6) col = mix(col, mix(uMtC, vec3(0.05, 0.12, 0.08), 0.4), 0.95);

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('shader', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }
  const vs = compile(gl.VERTEX_SHADER, VS);
  const fs = compile(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) return;

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.warn('link'); return; }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uTime    = gl.getUniformLocation(prog, 'uTime');
  const uScroll  = gl.getUniformLocation(prog, 'uScroll');
  const uSkyTop  = gl.getUniformLocation(prog, 'uSkyTop');
  const uSkyBot  = gl.getUniformLocation(prog, 'uSkyBot');
  const uMtA     = gl.getUniformLocation(prog, 'uMtA');
  const uMtB     = gl.getUniformLocation(prog, 'uMtB');
  const uMtC     = gl.getUniformLocation(prog, 'uMtC');
  const uFog     = gl.getUniformLocation(prog, 'uFog');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener('resize', resize);

  const palettes = {
    morning: { top: [1.0, 0.85, 0.65], bot: [1.0, 0.95, 0.78], A: [0.75, 0.82, 0.72], B: [0.55, 0.7, 0.6],  C: [0.35, 0.55, 0.42], fog: [0.98, 0.9, 0.78] },
    day:     { top: [0.7, 0.85, 1.0],  bot: [0.95, 0.97, 0.9], A: [0.72, 0.83, 0.75], B: [0.5, 0.65, 0.56], C: [0.25, 0.42, 0.28], fog: [0.9, 0.94, 0.95] },
    evening: { top: [0.95, 0.45, 0.25], bot: [1.0, 0.7, 0.35], A: [0.55, 0.4, 0.3],   B: [0.4, 0.28, 0.22], C: [0.25, 0.15, 0.12], fog: [0.85, 0.55, 0.35] },
    night:   { top: [0.05, 0.08, 0.18], bot: [0.1, 0.13, 0.25], A: [0.12, 0.2, 0.28], B: [0.08, 0.14, 0.22], C: [0.05, 0.1, 0.18], fog: [0.2, 0.25, 0.4] },
  };

  const start = performance.now();
  function frame(now) {
    const t = (now - start) / 1000;
    const tod = document.documentElement.dataset.time || 'day';
    const p = palettes[tod] || palettes.day;
    gl.uniform1f(uTime, t);
    gl.uniform1f(uScroll, window.scrollY);
    gl.uniform3fv(uSkyTop, p.top);
    gl.uniform3fv(uSkyBot, p.bot);
    gl.uniform3fv(uMtA, p.A);
    gl.uniform3fv(uMtB, p.B);
    gl.uniform3fv(uMtC, p.C);
    gl.uniform3fv(uFog, p.fog);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(frame);
  }
  canvas.classList.add('ready');
  requestAnimationFrame(frame);
})();

// =================================================================
// 3D MOUSE PARALLAX — cursor drives hero mountain / sun offset
// =================================================================
(function mouseParallax() {
  if (window.matchMedia('(hover: none)').matches) return;
  let tx = 0, ty = 0, cx = 0, cy = 0;
  const mtBack   = document.querySelector('.mt-back');
  const mtMid    = document.querySelector('.mt-mid');
  const mtFront  = document.querySelector('.mt-front');
  const mtForest = document.querySelector('.mt-forest');
  const sun      = document.querySelector('.global-sun');
  const moon     = document.querySelector('.moon');

  window.addEventListener('mousemove', (e) => {
    tx = (e.clientX / window.innerWidth  - 0.5) * 2;
    ty = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  function tick() {
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    const base = (el, depth) => {
      if (!el) return;
      el.style.setProperty('--mpx', (cx * depth) + 'px');
      el.style.setProperty('--mpy', (cy * depth * 0.5) + 'px');
    };
    // Apply via additional translate3d on top of existing scroll parallax.
    if (mtBack)   mtBack.style.translate   = `${cx * 6}px ${cy * 4}px`;
    if (mtMid)    mtMid.style.translate    = `${cx * 12}px ${cy * 6}px`;
    if (mtFront)  mtFront.style.translate  = `${cx * 20}px ${cy * 10}px`;
    if (mtForest) mtForest.style.translate = `${cx * 28}px ${cy * 14}px`;
    if (sun)      sun.style.translate      = `${cx * -16}px ${cy * -8}px`;
    if (moon)     moon.style.translate     = `${cx * -10}px ${cy * -6}px`;
    requestAnimationFrame(tick);
  }
  tick();
})();

// Language toggle (EN <-> ML)
function toggleLang() {
  const html = document.documentElement;
  const cur = html.getAttribute('lang');
  const next = cur === 'en' ? 'ml' : 'en';
  html.setAttribute('lang', next);
  localStorage.setItem('yatra-lang', next);
  const label = document.getElementById('lang-label');
  if (label) label.textContent = next === 'en' ? 'മലയാളം' : 'English';
}

// Restore language preference on load
(function () {
  const saved = localStorage.getItem('yatra-lang');
  if (saved) {
    document.documentElement.setAttribute('lang', saved);
    const label = document.getElementById('lang-label');
    if (label) label.textContent = saved === 'en' ? 'മലയാളം' : 'English';
  }
})();

// Reveal-on-scroll using IntersectionObserver
// =================================================================
// GLOBAL: parallax scroll + device tilt (run ONCE, not per nav)
// =================================================================
(function parallaxAndDeviceTilt() {
  function bindParallax() {
    const mtBack   = document.querySelector('.mt-back');
    const mtMid    = document.querySelector('.mt-mid');
    const mtFront  = document.querySelector('.mt-front');
    const mtForest = document.querySelector('.mt-forest');

    let ticking = false;
    function update() {
      const y = window.scrollY;
      const vh = window.innerHeight || 800;
      const docH = document.documentElement;
      const maxScroll = (docH.scrollHeight - vh) || 1;
      const progress = Math.min(Math.max(y / maxScroll, 0), 1);
      const localP = Math.min(y / vh, 1.5);

      if (mtBack)   mtBack.style.transform   = `translate3d(0, ${y * -0.05}px, 0) scale(${1 + localP * 0.08})`;
      if (mtMid)    mtMid.style.transform    = `translate3d(0, ${y * -0.1}px,  0) scale(${1 + localP * 0.14})`;
      if (mtFront)  mtFront.style.transform  = `translate3d(0, ${y * -0.18}px, 0) scale(${1 + localP * 0.22})`;
      if (mtForest) mtForest.style.transform = `translate3d(0, ${y * -0.26}px, 0) scale(${1 + localP * 0.3})`;

      // The logo-card and tent-illustration may not exist on every page,
      // so query each time (per-page).
      const tentIll  = document.querySelector('.tent2d .tent-illustration');
      const logoCard = document.querySelector('.logo-card');
      const traveler = document.querySelector('.traveler');

      if (tentIll) {
        const k = Math.min(y / vh, 1);
        tentIll.style.transform = `scale(${1 - k * 0.08}) translateY(${-k * 30}px)`;
      }
      if (logoCard) {
        const k = Math.min(y / vh, 1);
        logoCard.style.transform =
          `translateY(${-k * 30}px) rotateX(${-4 + k * 10}deg) rotateY(${-3 + k * 8}deg) scale(${1 - k * 0.06})`;
      }
      if (traveler) {
        if (progress > 0.92) traveler.classList.add('is-resting');
        else traveler.classList.remove('is-resting');
      }
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }
  bindParallax();

  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', (e) => {
      const beta  = Math.max(Math.min(e.beta || 0, 30), -30);
      const gamma = Math.max(Math.min(e.gamma || 0, 30), -30);
      document.querySelectorAll('[data-tilt]').forEach((c) => {
        if (!c.matches(':hover')) {
          c.style.transform = `perspective(900px) rotateX(${-beta * 0.4}deg) rotateY(${gamma * 0.4}deg)`;
        }
      });
    });
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  initPageContent(document);
});

// =================================================================
// PAGE-CORNER PEEL — link to the next page in a fixed order
// =================================================================
(function pagePeel() {
  const peel = document.getElementById('page-peel');
  if (!peel) return;
  const order = ['/', '/tents', '/events', '/gallery', '/about', '/contact'];
  function update() {
    let i = order.indexOf(location.pathname);
    if (i === -1) i = 0;
    const nextPath = order[(i + 1) % order.length];
    peel.setAttribute('href', nextPath);
  }
  update();
  // Re-run on SPA navigations
  window.addEventListener('popstate', update);
  document.addEventListener('click', (e) => {
    if (e.target.closest('a') && !e.target.closest('#page-peel')) {
      setTimeout(update, 60);
    }
  });
})();

// =================================================================
// PARTICLE BURST — when the time-of-day changes, particles burst out
// =================================================================
(function particleBurst() {
  const ap = document.querySelector('.ambient-particles');
  if (!ap) return;
  let lastTime = document.documentElement.dataset.time;
  new MutationObserver(() => {
    const t = document.documentElement.dataset.time;
    if (t === lastTime) return;
    lastTime = t;
    ap.classList.add('bursting');
    setTimeout(() => ap.classList.remove('bursting'), 750);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-time'] });
})();

// =================================================================
// SPA NAVIGATION — intercept link clicks, fetch new page, swap
// #nexgo-root without a full reload (Next.js-style)
// =================================================================
(function spa() {
  const ROOT_SEL = '#nexgo-root';
  let navigating = false;

  function sameOrigin(url) {
    try { return new URL(url, location.href).origin === location.origin; }
    catch { return false; }
  }

  async function navigate(url, push = true) {
    if (navigating) return;
    navigating = true;
    document.body.classList.add('spa-loading');
    try {
      const res = await fetch(url, { credentials: 'same-origin' });
      if (!res.ok || !res.headers.get('content-type')?.includes('text/html')) {
        window.location.href = url;
        return;
      }
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const newMain = doc.querySelector(ROOT_SEL);
      const oldMain = document.querySelector(ROOT_SEL);
      if (!newMain || !oldMain) { window.location.href = url; return; }

      const swap = () => {
        oldMain.replaceWith(newMain);

        // Update document title
        if (doc.title) document.title = doc.title;

        // Sync meta description + canonical + og tags from new head
        [
          'meta[name="description"]',
          'link[rel="canonical"]',
          'meta[property="og:title"]',
          'meta[property="og:description"]',
          'meta[property="og:url"]',
          'meta[property="og:image"]',
          'meta[name="twitter:title"]',
          'meta[name="twitter:description"]',
        ].forEach((sel) => {
          const newEl = doc.querySelector(sel);
          const oldEl = document.querySelector(sel);
          if (newEl && oldEl) {
            if (newEl.hasAttribute('content')) oldEl.setAttribute('content', newEl.getAttribute('content'));
            if (newEl.hasAttribute('href'))    oldEl.setAttribute('href',    newEl.getAttribute('href'));
          }
        });

        // Re-init per-page scripts on the newly swapped content
        initPageContent(document.querySelector(ROOT_SEL));

        window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
      };

      if (push) history.pushState({ spa: true, url }, '', url);

      // Tent-zip transition: close flaps → swap → open flaps
      const zip = document.getElementById('tent-zip');
      if (zip && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        zip.classList.add('active');
        await new Promise((r) => setTimeout(r, 500));
        swap();
        await new Promise((r) => setTimeout(r, 60));
        zip.classList.remove('active');
      } else if (document.startViewTransition) {
        document.startViewTransition(swap);
      } else {
        swap();
      }
    } catch (err) {
      window.location.href = url;
    } finally {
      setTimeout(() => {
        document.body.classList.remove('spa-loading');
        navigating = false;
      }, 50);
    }
  }

  // Intercept link clicks
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href) return;
    if (a.target && a.target !== '_self') return;
    if (a.hasAttribute('download')) return;
    if (a.hasAttribute('data-no-spa')) return;
    if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
    if (!sameOrigin(href)) return;

    const u = new URL(href, location.href);
    // Same-page hash link → let browser handle the jump
    if (u.pathname === location.pathname && u.hash) return;
    // Skip API and nexgo internals
    if (u.pathname.startsWith('/api/') || u.pathname.startsWith('/_nexgo/')) return;
    // Skip static assets
    if (/\.(jpg|jpeg|png|gif|webp|svg|pdf|zip|mp3|mp4)$/i.test(u.pathname)) return;

    e.preventDefault();
    navigate(u.pathname + u.search + u.hash);
  });

  // Back/forward navigation
  window.addEventListener('popstate', () => {
    navigate(location.pathname + location.search + location.hash, false);
  });

  // Optional: prefetch on hover for snappy feel
  const prefetched = new Set();
  document.addEventListener('mouseover', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || !sameOrigin(href)) return;
    const u = new URL(href, location.href);
    if (prefetched.has(u.pathname)) return;
    if (u.pathname.startsWith('/api/') || u.pathname.startsWith('/_nexgo/')) return;
    if (u.pathname === location.pathname) return;
    prefetched.add(u.pathname);
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = u.pathname;
    link.as = 'document';
    document.head.appendChild(link);
  }, { passive: true });
})();
