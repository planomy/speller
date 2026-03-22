/**
 * Speller — word bank by suffix (lowercase keys).
 * Image convention (easy to change later):
 *   Fingerspelling: images/a.png … images/z.png
 *   Word pictures:  images/{word}1.png, images/{word}2.png (correct pair)
 * Distractors for each word are picked from two other words in the same session (images/{other}1.png).
 * Optional teacher clip per word: teacherVideo: "videos/man.mp4" (omit or null to hide panel)
 */
const WORD_BANK = {
  /* Teaching order M, C, P, F, R for phase 1 / 2 */
  an: [
    { word: 'man', teacherVideo: null },
    { word: 'can', teacherVideo: null },
    { word: 'pan', teacherVideo: null },
    { word: 'fan', teacherVideo: null },
    { word: 'ran', teacherVideo: null },
  ],
  at: [
    { word: 'cat', teacherVideo: null },
    { word: 'bat', teacherVideo: null },
    { word: 'hat', teacherVideo: null },
    { word: 'mat', teacherVideo: null },
    { word: 'rat', teacherVideo: null },
  ],
  ap: [
    { word: 'cap', teacherVideo: null },
    { word: 'map', teacherVideo: null },
    { word: 'lap', teacherVideo: null },
    { word: 'tap', teacherVideo: null },
    { word: 'gap', teacherVideo: null },
  ],
  en: [
    { word: 'hen', teacherVideo: null },
    { word: 'pen', teacherVideo: null },
    { word: 'ten', teacherVideo: null },
    { word: 'den', teacherVideo: null },
    { word: 'men', teacherVideo: null },
  ],
  ig: [
    { word: 'big', teacherVideo: null },
    { word: 'dig', teacherVideo: null },
    { word: 'fig', teacherVideo: null },
    { word: 'pig', teacherVideo: null },
    { word: 'wig', teacherVideo: null },
  ],
  it: [
    { word: 'sit', teacherVideo: null },
    { word: 'hit', teacherVideo: null },
    { word: 'bit', teacherVideo: null },
    { word: 'fit', teacherVideo: null },
    { word: 'kit', teacherVideo: null },
  ],
};

const SESSION_SIZE = 5;
const ADVANCE_DELAY_MS = 2200;

const CONFETTI_COLORS = [
  '#fbbf24',
  '#f472b6',
  '#38bdf8',
  '#4ade80',
  '#a78bfa',
  '#fb923c',
  '#facc15',
  '#2dd4bf',
  '#e879f9',
  '#60a5fa',
  '#f87171',
  '#bef264',
  '#ffffff',
  '#fde047',
];

/**
 * Geometric centre of the union of element rects — one burst reads “centred” on the activity.
 */
function boundingCenterOfElements(elements) {
  const nodes = elements.filter(Boolean);
  if (!nodes.length) return null;
  let minL = Infinity;
  let minT = Infinity;
  let maxR = -Infinity;
  let maxB = -Infinity;
  nodes.forEach((el) => {
    const r = el.getBoundingClientRect();
    minL = Math.min(minL, r.left);
    minT = Math.min(minT, r.top);
    maxR = Math.max(maxR, r.right);
    maxB = Math.max(maxB, r.bottom);
  });
  if (!Number.isFinite(minL)) return null;
  return { x: (minL + maxR) / 2, y: (minT + maxB) / 2 };
}

/**
 * Spray from one viewport point (centre of all anchors), mostly upward.
 * Two waves: heavy confetti + faster glitter.
 */
function launchConfettiSpray(anchorElements, options) {
  const opts = options || {};
  const nodes = anchorElements.filter(Boolean);
  if (!nodes.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let origin = boundingCenterOfElements(nodes);
  if (
    !origin &&
    opts.origin === 'phase1-activity' &&
    els.phase1 &&
    !els.phase1.classList.contains('hidden')
  ) {
    const pr = els.phase1.getBoundingClientRect();
    if (pr.width > 2 && pr.height > 2) {
      origin = { x: pr.left + pr.width / 2, y: pr.top + pr.height * 0.42 };
    }
  }
  if (
    !origin &&
    opts.origin === 'phase2-activity' &&
    els.phase2 &&
    !els.phase2.classList.contains('hidden')
  ) {
    const pr = els.phase2.getBoundingClientRect();
    if (pr.width > 2 && pr.height > 2) {
      origin = { x: pr.left + pr.width / 2, y: pr.top + pr.height * 0.45 };
    }
  }
  if (!origin) return;

  const overlay = document.createElement('div');
  overlay.className = 'confetti-overlay';
  overlay.setAttribute('aria-hidden', 'true');

  const flash = document.createElement('div');
  flash.className = 'confetti-flash';
  flash.style.left = `${origin.x}px`;
  flash.style.top = `${origin.y}px`;
  overlay.appendChild(flash);

  function addPiece(wave, sprayX, sprayY) {
    const el = document.createElement('span');
    const isGlitter = wave === 'glitter';
    el.className = isGlitter ? 'confetti-piece confetti-glitter' : 'confetti-piece';

    const w = isGlitter ? 3 + Math.random() * 4 : 4 + Math.random() * 9;
    const h = isGlitter ? 3 + Math.random() * 4 : 7 + Math.random() * 16;
    el.style.width = `${w}px`;
    el.style.height = `${h}px`;
    el.style.borderRadius = Math.random() > 0.35 ? `${Math.random() * 3}px` : '9999px';

    // Screen Y grows downward → negative ty = move up. Fan around vertical “up”.
    const maxDev = isGlitter ? 0.88 : 1.12;
    const a = (Math.random() - 0.5) * 2 * maxDev;
    const power = isGlitter ? 150 + Math.random() * 260 : 260 + Math.random() * 440;
    const jitterX = (Math.random() - 0.5) * (isGlitter ? 70 : 100);
    const extraUp = 40 + Math.random() * 140;
    const tx = Math.sin(a) * power + jitterX;
    const ty = -Math.cos(a) * power - extraUp;

    el.style.left = `${sprayX}px`;
    el.style.top = `${sprayY}px`;
    el.style.setProperty('--tx', `${tx}px`);
    el.style.setProperty('--ty', `${ty}px`);
    el.style.setProperty('--rot', `${(Math.random() - 0.5) * 2200}deg`);
    el.style.backgroundColor = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];

    const dur = isGlitter ? 0.95 + Math.random() * 0.55 : 1.55 + Math.random() * 1.05;
    el.style.animationDuration = `${dur}s`;
    el.style.animationDelay = `${isGlitter ? 0.08 + Math.random() * 0.18 : Math.random() * 0.22}s`;

    overlay.appendChild(el);
  }

  const heavyTotal = 195;
  const glitterTotal = 85;
  const { x, y } = origin;
  for (let i = 0; i < heavyTotal; i++) addPiece('heavy', x, y);
  for (let j = 0; j < glitterTotal; j++) addPiece('glitter', x, y);

  document.body.appendChild(overlay);
  setTimeout(() => overlay.remove(), 3200);
}

const els = {
  setup: document.getElementById('screen-setup'),
  phase1: document.getElementById('screen-phase1'),
  phase2: document.getElementById('screen-phase2'),
  phaseBridge: document.getElementById('screen-phase-bridge'),
  lesson: document.getElementById('screen-lesson'),
  done: document.getElementById('screen-done'),
  suffixInput: document.getElementById('suffix-input'),
  setupError: document.getElementById('setup-error'),
  btnStart: document.getElementById('btn-start'),
  phase1Grid: document.getElementById('phase1-grid'),
  phase1Bank: document.getElementById('phase1-bank'),
  phase1Instruction: document.getElementById('phase1-instruction'),
  phase1InstructionTitle: document.getElementById('phase1-instruction-title'),
  phase2Image: document.getElementById('phase2-image'),
  phase2WordBuild: document.getElementById('phase2-word-build'),
  phase2WordPrint: document.getElementById('phase2-word-print'),
  phase2InstructionTitle: document.getElementById('phase2-instruction-title'),
  phase2Instruction: document.getElementById('phase2-instruction'),
  phase2LetterPicks: document.getElementById('phase2-letter-picks'),
  btnPhaseBridge: document.getElementById('btn-phase-bridge'),
  progressDots: document.getElementById('progress-dots'),
  wordNum: document.getElementById('word-num'),
  suffixDisplay: document.getElementById('suffix-display'),
  teacherPanel: document.getElementById('teacher-panel'),
  teacherVideo: document.getElementById('teacher-video'),
  wordBuild: document.getElementById('word-build'),
  imageGrid: document.getElementById('image-grid'),
  btnAgain: document.getElementById('btn-again'),
};

/** Stable order for early phases (suffix-specific). Falls back to alphabetical. */
function wordsInTeachingOrder(suffix, list) {
  const orderMap = {
    an: ['man', 'can', 'pan', 'fan', 'ran'],
  };
  const order = orderMap[suffix];
  if (order) {
    return order.map((w) => list.find((x) => x.word === w)).filter(Boolean);
  }
  return [...list].sort((a, b) => a.word.localeCompare(b.word));
}

let sessionWords = [];
/** Same five words, teacher order, for phases 1–2 */
let phaseWordsOrdered = [];
let wordIndex = 0;
let phase2Index = 0;
/** 'preview' | 'pick' */
let phase2Mode = 'preview';
let phase2AutoTimer = null;
/** @type {{ tile: HTMLElement, floater: HTMLElement, dx: number, dy: number, pointerId: number, onMove: (ev: PointerEvent) => void, end: (ev: PointerEvent) => void } | null} */
let phase2Drag = null;
let phase1Drag = null;
/** @type {{ rafId: number, ghost: HTMLElement } | null} */
let phase1AnHint = null;
/** 0 = first pass; after first full completion we shuffle and require a second pass before Phase 2 */
let phase1RoundsCompleted = 0;
/** One picture at a time, then all five in a row */
let phase1Mode = 'singles';
let phase1SingleIndex = 0;

const PHASE1_GRID_CLASS_SINGLE =
  'grid min-h-0 w-full min-w-0 flex-1 grid-cols-1 justify-items-center gap-[clamp(0.2rem,1vmin,0.65rem)] [grid-template-rows:minmax(0,1fr)]';
const PHASE1_GRID_CLASS_FULL =
  'grid min-h-0 w-full min-w-0 flex-1 grid-cols-5 gap-[clamp(0.2rem,1vmin,0.65rem)] [grid-template-rows:minmax(0,1fr)]';
const PHASE1_BANK_CLASS_SINGLE =
  'flex w-full min-w-0 flex-row flex-nowrap items-center justify-center gap-0';
const PHASE1_BANK_CLASS_FULL =
  'flex w-full min-w-0 flex-row flex-wrap content-center items-center justify-center gap-[clamp(0.35rem,1.4vmin,0.75rem)]';

const PHASE1_SLOT_EMPTY_CLASS =
  'phase1-drop-slot inline-flex h-[clamp(1.65rem,6.5vmin,2.65rem)] min-w-[clamp(3.2rem,26vmin,6.25rem)] w-auto max-w-full shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-violet-300 bg-violet-50/50 px-[clamp(0.35rem,1.8vmin,0.75rem)] font-black leading-none tracking-tight text-violet-700 [font-size:clamp(0.7rem,2.8vmin,1.15rem)]';

const PHASE2_SLOT_EMPTY_CLASS =
  'phase2-drop-slot inline-flex h-[clamp(1.85rem,7.5vmin,2.85rem)] min-w-[clamp(1.85rem,7.5vmin,3rem)] w-auto max-w-full shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-violet-300 bg-violet-50/50 px-[clamp(0.25rem,1.2vmin,0.5rem)] font-display font-black leading-none tracking-tight text-violet-700 [font-size:clamp(1rem,4.5vmin,2.25rem)]';

function stopPhase1AnHint() {
  if (!phase1AnHint) return;
  cancelAnimationFrame(phase1AnHint.rafId);
  phase1AnHint.ghost.remove();
  phase1AnHint = null;
}

function startPhase1AnHint() {
  stopPhase1AnHint();
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (els.phase1.classList.contains('hidden')) return;

  const firstTile = els.phase1Bank.querySelector('.drag-an-tile');
  const firstSlot = els.phase1Grid.querySelector('.phase1-card .phase1-drop-slot');
  if (!firstTile || !firstSlot || firstSlot.dataset.filled === '1') return;

  const ghost = document.createElement('div');
  ghost.className = 'phase1-an-ghost-hint';
  ghost.textContent = sessionSuffix.toUpperCase();
  ghost.setAttribute('aria-hidden', 'true');
  document.body.appendChild(ghost);

  const cs = window.getComputedStyle(firstTile);
  ghost.style.fontSize = cs.fontSize;
  ghost.style.padding = cs.padding;
  ghost.style.lineHeight = cs.lineHeight;

  const period = 2800;

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
  }

  /** Viewport px — matches drag floater; phase 1 uses transform:scale, not CSS zoom. */
  function centerInViewport(el) {
    const er = el.getBoundingClientRect();
    return {
      x: er.left + er.width / 2,
      y: er.top + er.height / 2,
      w: er.width,
      h: er.height,
    };
  }

  function loop(tFrame) {
    if (!phase1AnHint || phase1AnHint.ghost !== ghost) return;
    const tr = centerInViewport(firstTile);
    const sr = centerInViewport(firstSlot);
    if (tr.w < 4 || sr.w < 4) {
      phase1AnHint.rafId = requestAnimationFrame(loop);
      return;
    }

    ghost.style.width = `${tr.w}px`;
    ghost.style.height = `${tr.h}px`;
    ghost.style.display = 'flex';
    ghost.style.alignItems = 'center';
    ghost.style.justifyContent = 'center';

    const now = performance.now();
    const u = ((now % period) / period) * 2;
    const raw = u <= 1 ? u : 2 - u;
    const k = easeInOut(raw);
    const x = tr.x + (sr.x - tr.x) * k;
    const y = tr.y + (sr.y - tr.y) * k;
    ghost.style.opacity = '0.78';
    ghost.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(0.98)`;

    if (!phase1AnHint || phase1AnHint.ghost !== ghost) return;
    phase1AnHint.rafId = requestAnimationFrame(loop);
  }

  phase1AnHint = { rafId: 0, ghost };
  phase1AnHint.rafId = requestAnimationFrame(loop);
}
let selected = new Set();
let locked = false;

function normalizeSuffix(raw) {
  return raw.trim().toLowerCase().replace(/^[^a-z]+/, '');
}

function cleanupPhase2Drag() {
  if (!phase2Drag) return;
  const { floater, tile, onMove, end } = phase2Drag;
  window.removeEventListener('pointermove', onMove, { passive: false });
  window.removeEventListener('pointerup', end, true);
  window.removeEventListener('pointercancel', end, true);
  if (floater && floater.parentNode) floater.remove();
  if (tile) tile.style.visibility = '';
  phase2Drag = null;
}

function showScreen(which) {
  if (which !== 'phase1') stopPhase1AnHint();
  if (which !== 'phase2') cleanupPhase2Drag();
  if (which !== 'phase2' && phase2AutoTimer) {
    clearTimeout(phase2AutoTimer);
    phase2AutoTimer = null;
  }
  const map = {
    setup: els.setup,
    phase1: els.phase1,
    phase2: els.phase2,
    phaseBridge: els.phaseBridge,
    lesson: els.lesson,
    done: els.done,
  };
  Object.entries(map).forEach(([key, el]) => {
    if (!el) return;
    const on = key === which;
    el.classList.toggle('hidden', !on);
    el.hidden = !on;
  });
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fingerspellPath(letter) {
  const L = letter.toLowerCase();
  if (L < 'a' || L > 'z') return null;
  return `images/${L}.png`;
}

function wordImagePath(word, n) {
  return `images/${word.toLowerCase()}${n}.png`;
}

function buildChoices(currentWord, allWords) {
  const w = currentWord.word.toLowerCase();
  const correct = [wordImagePath(w, 1), wordImagePath(w, 2)];
  const others = shuffle(allWords.map((x) => x.word.toLowerCase()).filter((x) => x !== w));
  const wrong = others.slice(0, 2).map((ow) => wordImagePath(ow, 1));
  const four = shuffle([
    { src: correct[0], correct: true },
    { src: correct[1], correct: true },
    { src: wrong[0], correct: false },
    { src: wrong[1], correct: false },
  ]);
  return four;
}

function renderProgressDots() {
  els.progressDots.innerHTML = '';
  for (let i = 0; i < SESSION_SIZE; i++) {
    const dot = document.createElement('span');
    dot.className =
      'h-5 w-5 rounded-full border-[3px] border-slate-300 transition-all duration-300 sm:h-6 sm:w-6 md:h-7 md:w-7';
    if (i < wordIndex) dot.classList.add('bg-emerald-400', 'border-emerald-400');
    else if (i === wordIndex) dot.classList.add('scale-125', 'bg-sky-400', 'border-sky-500', 'shadow-md');
    else dot.classList.add('bg-white');
    dot.setAttribute('aria-label', i < wordIndex ? 'Completed' : i === wordIndex ? 'Current' : 'Upcoming');
    els.progressDots.appendChild(dot);
  }
}

function fallbackThumb(label) {
  const div = document.createElement('div');
  div.className =
    'flex aspect-square w-full items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-3xl font-black uppercase text-slate-500 sm:text-4xl md:text-5xl';
  div.textContent = (label || '?').slice(0, 6);
  div.setAttribute('role', 'img');
  return div;
}

function renderWordBuild(word, mountEl, options) {
  const opts = options || {};
  const showSignsVisible = opts.showSignsVisible === true;
  const compactLayout = opts.compactLayout === true;
  const omitLettersBelow = opts.omitLettersBelow === true;
  const root = mountEl || els.wordBuild;
  root.innerHTML = '';
  const letters = word.split('');
  letters.forEach((ch) => {
    const col = document.createElement('div');
    col.className = compactLayout
      ? 'flex flex-col items-center gap-0.5'
      : 'flex flex-col items-center gap-0.5 sm:gap-1';

    const stack = document.createElement('div');
    stack.className = compactLayout
      ? 'relative isolate overflow-hidden rounded-xl sm:rounded-2xl h-[clamp(3.25rem,16vmin,6.25rem)] w-[clamp(2.65rem,12vmin,4.85rem)] md:h-[clamp(3.75rem,18vmin,7rem)] md:w-[clamp(3rem,14vmin,5.25rem)]'
      : 'relative isolate overflow-hidden rounded-2xl sm:rounded-3xl h-[clamp(5.5rem,30vmin,12rem)] w-[clamp(4.35rem,24vmin,9.5rem)] md:h-[clamp(6.25rem,32vmin,13rem)] md:w-[clamp(5rem,26vmin,10.5rem)]';

    const ghost = document.createElement('button');
    ghost.type = 'button';
    ghost.className =
      'ghost-cell absolute inset-0 z-0 flex m-0 cursor-pointer appearance-none items-center justify-center rounded-2xl border-[3px] border-dashed border-slate-300 bg-slate-50/80 p-0 text-left outline-none transition hover:border-sky-300 focus-visible:ring-4 focus-visible:ring-sky-300 sm:rounded-3xl';
    ghost.setAttribute('aria-label', `Show handshape for ${ch}`);

    const imgWrap = document.createElement('button');
    imgWrap.type = 'button';
    imgWrap.className =
      'ghost-reveal absolute inset-0 z-[1] m-0 hidden cursor-pointer appearance-none items-center justify-center rounded-2xl bg-white/90 p-1 text-left outline-none ring-0 transition hover:bg-sky-50/90 focus-visible:ring-4 focus-visible:ring-sky-300 sm:rounded-3xl sm:p-1.5';
    imgWrap.setAttribute('aria-label', `Hide handshape for ${ch}`);

    let visible = false;
    const img = document.createElement('img');
    img.alt = `Auslan ${ch}`;
    img.className = 'max-h-full max-w-full object-contain';
    img.draggable = false;
    const path = fingerspellPath(ch);
    if (path) {
      img.src = path;
      img.onerror = () => {
        visible = false;
        imgWrap.classList.add('hidden');
        imgWrap.classList.remove('flex');
        ghost.classList.remove('hidden');
      };
    } else {
      ghost.classList.add('opacity-40');
      ghost.disabled = true;
    }
    imgWrap.appendChild(img);

    if (showSignsVisible && path) {
      visible = true;
      ghost.classList.add('hidden');
      imgWrap.classList.remove('hidden');
      imgWrap.classList.add('flex');
    }

    function showHandshape() {
      if (!path) return;
      visible = true;
      ghost.classList.add('hidden');
      imgWrap.classList.remove('hidden');
      imgWrap.classList.add('flex');
    }

    function hideHandshape() {
      if (!path || !visible) return;
      visible = false;
      imgWrap.classList.add('hidden');
      imgWrap.classList.remove('flex');
      ghost.classList.remove('hidden');
    }

    ghost.addEventListener('click', () => {
      if (!path) return;
      if (visible) hideHandshape();
      else showHandshape();
    });
    imgWrap.addEventListener('click', (e) => {
      e.preventDefault();
      hideHandshape();
    });

    stack.appendChild(ghost);
    stack.appendChild(imgWrap);

    col.appendChild(stack);
    if (!omitLettersBelow) {
      const letterEl = document.createElement('p');
      letterEl.className = compactLayout
        ? 'font-display mt-0 text-[clamp(1.15rem,5.5vmin,2.6rem)] font-black leading-none tracking-[0.12em] text-speller-ink sm:text-[clamp(1.35rem,6vmin,3rem)] md:tracking-[0.18em]'
        : 'font-display mt-0 text-[clamp(3rem,14vmin,7rem)] font-black leading-none tracking-[0.2em] text-speller-ink sm:text-[clamp(3.5rem,15vmin,7.5rem)] md:tracking-[0.25em] lg:text-[clamp(4rem,16vmin,8.5rem)]';
      letterEl.textContent = ch;
      col.appendChild(letterEl);
    }
    root.appendChild(col);
  });
}

function renderTeacher(entry) {
  els.teacherVideo.pause();
  const src = entry.teacherVideo;
  if (src) {
    els.teacherPanel.classList.remove('hidden');
    els.teacherVideo.src = src;
    els.teacherVideo.classList.remove('hidden');
  } else {
    els.teacherPanel.classList.add('hidden');
    els.teacherVideo.removeAttribute('src');
    els.teacherVideo.load();
  }
}

function renderImageGrid(choices) {
  els.imageGrid.innerHTML = '';
  selected.clear();
  locked = false;
  choices.forEach((item, idx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.dataset.index = String(idx);
    btn.dataset.correct = item.correct ? '1' : '0';
    btn.className =
      'choice-card relative flex h-full min-h-0 w-full min-w-0 overflow-hidden rounded-2xl border-[4px] border-transparent bg-slate-100 shadow-soft transition-all duration-200 focus:outline-none focus-visible:ring-[6px] focus-visible:ring-sky-300 sm:rounded-3xl sm:border-[5px] md:border-[6px]';

    const img = document.createElement('img');
    img.src = item.src;
    img.alt = 'Choice';
    img.className = 'h-full w-full rounded-xl object-cover sm:rounded-2xl';
    img.loading = 'lazy';
    img.draggable = false;
    img.onerror = () => {
      const wordGuess = item.src.replace(/^images\//, '').replace(/\d+\.png$/, '');
      const fb = fallbackThumb(wordGuess);
      fb.classList.remove('aspect-square');
      fb.classList.add('h-full', 'w-full', 'min-h-0', 'rounded-xl', 'text-2xl', 'sm:rounded-2xl', 'sm:text-3xl', 'md:text-4xl');
      img.replaceWith(fb);
    };

    btn.appendChild(img);
    btn.addEventListener('click', () => onChoiceTap(btn, choices));
    els.imageGrid.appendChild(btn);
  });
}

function updateChoiceStyles() {
  els.imageGrid.querySelectorAll('.choice-card').forEach((btn) => {
    const i = btn.dataset.index;
    btn.classList.remove(
      'ring-4',
      'ring-[6px]',
      'ring-sky-400',
      'ring-offset-2',
      'ring-offset-white',
      'choice-correct',
    );
    if (selected.has(i)) {
      btn.classList.add('ring-[6px]', 'ring-sky-400', 'ring-offset-2', 'ring-offset-white');
    }
  });
}

function onChoiceTap(btn, choices) {
  if (locked) return;
  const i = btn.dataset.index;
  if (selected.has(i)) {
    selected.delete(i);
  } else if (selected.size < 2) {
    selected.add(i);
  } else {
    const first = [...selected][0];
    selected.delete(first);
    selected.add(i);
  }
  updateChoiceStyles();

  if (selected.size === 2) {
    checkAnswer(choices);
  }
}

function checkAnswer(choices) {
  const picks = [...selected].map((i) => choices[Number(i)]);
  const bothCorrect = picks.every((p) => p.correct);
  if (bothCorrect) {
    locked = true;
    const correctBtns = [...selected].map((i) => els.imageGrid.querySelector(`[data-index="${i}"]`));
    correctBtns.forEach((btn) => {
      if (btn) btn.classList.add('choice-correct');
    });
    requestAnimationFrame(() => launchConfettiSpray(correctBtns));

    const dot = els.progressDots.children[wordIndex];
    if (dot) dot.classList.add('dot-just-filled');

    setTimeout(() => {
      wordIndex += 1;
      if (wordIndex >= SESSION_SIZE) {
        showScreen('done');
      } else {
        showCurrentWord();
      }
    }, ADVANCE_DELAY_MS);
  } else {
    els.imageGrid.classList.add('shake-anim');
    setTimeout(() => {
      els.imageGrid.classList.remove('shake-anim');
      selected.clear();
      updateChoiceStyles();
    }, 450);
  }
}

function showCurrentWord() {
  const entry = sessionWords[wordIndex];
  const word = entry.word.toLowerCase();
  els.wordNum.textContent = String(wordIndex + 1);
  renderProgressDots();
  const suffix = normalizeSuffix(els.suffixInput.value) || sessionSuffix;
  els.suffixDisplay.textContent = `_${suffix}`;

  renderTeacher(entry);
  renderWordBuild(word, els.wordBuild);
  const choices = buildChoices(entry, sessionWords);
  renderImageGrid(choices);
}

let sessionSuffix = '';

function startSession() {
  els.setupError.classList.add('hidden');
  const suf = normalizeSuffix(els.suffixInput.value);
  if (!suf) {
    els.setupError.textContent = 'Please enter a suffix.';
    els.setupError.classList.remove('hidden');
    return;
  }
  const list = WORD_BANK[suf];
  if (!list || list.length < SESSION_SIZE) {
    els.setupError.textContent = `No word list for “${suf}” yet. Try: an, at, ap, en, ig, or it.`;
    els.setupError.classList.remove('hidden');
    return;
  }
  sessionSuffix = suf;
  phaseWordsOrdered = wordsInTeachingOrder(suf, list).slice(0, SESSION_SIZE);
  sessionWords = shuffle([...list]).slice(0, SESSION_SIZE);
  wordIndex = 0;
  phase2Index = 0;
  phase2Mode = 'preview';
  phase1RoundsCompleted = 0;
  phase1Mode = 'singles';
  phase1SingleIndex = 0;
  showScreen('phase1');
  initPhase1();
}

/* ---------- Phase 1: drag “an” ---------- */

function createPhase1HandsRow(word) {
  const row = document.createElement('div');
  const letters = word
    .toLowerCase()
    .split('')
    .filter((ch) => fingerspellPath(ch));
  const n = Math.max(letters.length, 1);
  row.className =
    'phase1-hands-row grid w-full min-h-0 min-w-0 shrink-0 items-center justify-items-stretch gap-[clamp(0.15rem,1vmin,0.5rem)] py-[clamp(0.1rem,0.6vmin,0.35rem)]';
  row.style.gridTemplateColumns = `repeat(${n}, minmax(0, 1fr))`;
  letters.forEach((ch) => {
    const path = fingerspellPath(ch);
    if (!path) return;
    const wrap = document.createElement('div');
    wrap.className =
      'flex aspect-square w-full min-h-0 min-w-0 items-center justify-center rounded-lg border border-slate-200/90 bg-white p-[clamp(2px,0.5vmin,6px)] shadow-sm';
    const img = document.createElement('img');
    img.src = path;
    img.alt = `Auslan ${ch}`;
    img.className = 'h-full w-full object-contain';
    img.draggable = false;
    img.onerror = () => {
      wrap.remove();
    };
    wrap.appendChild(img);
    row.appendChild(wrap);
  });
  return row;
}

function createPhase1Card(entry, options) {
  const opts = options || {};
  const suffix = sessionSuffix;
  const w = entry.word.toLowerCase();
  const first = w[0].toUpperCase();
  const card = document.createElement('div');
  card.className =
    'phase1-card flex h-full min-h-0 min-w-0 flex-col items-center gap-[clamp(0.2rem,1vmin,0.5rem)] overflow-hidden rounded-2xl border border-slate-200 p-[clamp(0.25rem,1vmin,0.5rem)] transition-[box-shadow] duration-300';
  if (opts.singleColumn) {
    card.classList.add(
      'w-[min(92vw,22rem)]',
      'max-w-full',
      'justify-self-center',
      'pt-[clamp(0.65rem,2.8vmin,1.75rem)]',
    );
  } else {
    card.classList.add('w-full');
  }
  card.dataset.word = w;

  const imgWrap = document.createElement('div');
  imgWrap.className =
    'flex min-h-0 w-full min-w-0 flex-1 items-center justify-center overflow-hidden rounded-xl bg-slate-100 shadow-md ring-1 ring-slate-200/60';
  const imgFrame = document.createElement('div');
  imgFrame.className = 'aspect-square max-h-full w-full min-w-0';
  const img = document.createElement('img');
  img.src = wordImagePath(w, 1);
  img.alt = w;
  img.className = 'h-full w-full rounded-lg object-cover';
  img.draggable = false;
  img.onerror = () => {
    img.replaceWith(fallbackThumb(w));
  };
  imgFrame.appendChild(img);
  imgWrap.appendChild(imgFrame);

  const handsRow = createPhase1HandsRow(w);

  const letterRow = document.createElement('div');
  letterRow.className =
    'phase1-word-row flex w-full min-w-0 flex-nowrap items-center justify-center gap-[clamp(0.1rem,0.6vmin,0.35rem)] overflow-hidden';

  const letter = document.createElement('p');
  letter.className =
    'font-display shrink-0 font-black leading-none tracking-tight text-speller-ink [font-size:clamp(1rem,4.5vmin,2.25rem)]';
  letter.textContent = first;

  const slot = document.createElement('div');
  slot.className = PHASE1_SLOT_EMPTY_CLASS;
  slot.dataset.word = w;
  slot.textContent = '';
  slot.setAttribute('aria-label', `Drop ${suffix} here for ${w}`);

  letterRow.appendChild(letter);
  letterRow.appendChild(slot);

  card.appendChild(imgWrap);
  card.appendChild(handsRow);
  card.appendChild(letterRow);
  return card;
}

function updatePhase1InstructionTitle() {
  const el = els.phase1InstructionTitle;
  if (!el) return;
  if (phase1Mode === 'singles') {
    el.textContent = `Picture ${phase1SingleIndex + 1} of ${SESSION_SIZE}`;
  } else {
    el.textContent = 'All five pictures — drag the green letters onto each word';
  }
}

function updatePhase1InstructionChrome() {
  updatePhase1InstructionTitle();
  const p = els.phase1Instruction;
  if (!p) return;
  const suf = sessionSuffix.toUpperCase();
  p.replaceChildren();
  for (let i = 0; i < suf.length; i += 1) {
    const ch = suf[i];
    const span = document.createElement('span');
    span.className = 'phase1-accent shrink-0';
    span.textContent = ch;
    p.appendChild(span);
  }
}

function initPhase1() {
  stopPhase1AnHint();
  els.phase1Grid.innerHTML = '';
  els.phase1Bank.innerHTML = '';

  updatePhase1InstructionChrome();

  if (phase1Mode === 'singles') {
    els.phase1.setAttribute('data-phase1-mode', 'singles');
    els.phase1Grid.className = PHASE1_GRID_CLASS_SINGLE;
    els.phase1Bank.className = PHASE1_BANK_CLASS_SINGLE;
    const entry = phaseWordsOrdered[phase1SingleIndex];
    if (entry) els.phase1Grid.appendChild(createPhase1Card(entry, { singleColumn: true }));
    rebuildPhase1BankTiles(1);
  } else {
    els.phase1.removeAttribute('data-phase1-mode');
    els.phase1Grid.className = PHASE1_GRID_CLASS_FULL;
    els.phase1Bank.className = PHASE1_BANK_CLASS_FULL;
    phaseWordsOrdered.forEach((e) => {
      els.phase1Grid.appendChild(createPhase1Card(e));
    });
    rebuildPhase1BankTiles(SESSION_SIZE);
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => startPhase1AnHint());
  });
}

function rebuildPhase1BankTiles(tileCount) {
  const n = tileCount == null ? SESSION_SIZE : tileCount;
  els.phase1Bank.innerHTML = '';
  const suffix = sessionSuffix;
  for (let i = 0; i < n; i++) {
    const tile = document.createElement('div');
    tile.className =
      'drag-an-tile font-display flex min-h-0 w-min shrink-0 cursor-grab touch-none select-none items-center justify-center rounded-lg border-2 border-violet-400/90 bg-gradient-to-b from-violet-100 to-fuchsia-100 px-[clamp(0.22rem,1.2vmin,0.55rem)] py-[clamp(0.2rem,1vmin,0.5rem)] text-center font-black leading-none tracking-tight text-violet-800 shadow-soft [font-size:clamp(0.7rem,3vmin,1.45rem)] active:cursor-grabbing';
    tile.textContent = suffix.toUpperCase();
    tile.dataset.placed = '';
    tile.setAttribute('role', 'button');
    tile.setAttribute('aria-grabbed', 'false');
    attachAnTileDrag(tile);
    els.phase1Bank.appendChild(tile);
  }
}

function finishPhase1SingleWord() {
  const card = els.phase1Grid.querySelector('.phase1-card');
  requestAnimationFrame(() => launchConfettiSpray(card ? [card] : [], { origin: 'phase1-activity' }));
  setTimeout(() => {
    phase1SingleIndex += 1;
    if (phase1SingleIndex >= SESSION_SIZE) {
      phase1Mode = 'grid';
    }
    initPhase1();
  }, 800);
}

function resetPhase1CardForReplay(card) {
  card.classList.remove('phase1-card-complete', 'ring-4', 'ring-emerald-400');
  const slot = card.querySelector('.phase1-drop-slot');
  if (!slot) return;
  slot.textContent = '';
  delete slot.dataset.filled;
  slot.className = PHASE1_SLOT_EMPTY_CLASS;
}

function phase1ShuffleAndReplay() {
  stopPhase1AnHint();
  const grid = els.phase1Grid;
  const cards = [...grid.querySelectorAll('.phase1-card')];
  if (cards.length !== SESSION_SIZE) return;

  cards.forEach(resetPhase1CardForReplay);

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    shuffle([...cards]).forEach((c) => grid.appendChild(c));
    rebuildPhase1BankTiles(SESSION_SIZE);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => startPhase1AnHint());
    });
    return;
  }

  const firstRects = new Map(cards.map((c) => [c, c.getBoundingClientRect()]));
  shuffle([...cards]).forEach((c) => grid.appendChild(c));

  void grid.offsetHeight;

  cards.forEach((card) => {
    const old = firstRects.get(card);
    const neu = card.getBoundingClientRect();
    card.style.transform = `translate(${old.left - neu.left}px, ${old.top - neu.top}px)`;
    card.style.transition = 'none';
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      cards.forEach((card) => {
        card.style.transition = 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
        card.style.transform = 'translate(0, 0)';
      });
    });
  });

  const durationMs = 620;
  setTimeout(() => {
    cards.forEach((card) => {
      card.style.transition = '';
      card.style.transform = '';
    });
    rebuildPhase1BankTiles(SESSION_SIZE);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => startPhase1AnHint());
    });
  }, durationMs);
}

/**
 * Grab offset inside the tile. Phase 1 uses transform:scale (not zoom); offsetX/Y on the
 * plain tile div still tracks the pointer when needed.
 */
function phase1DragGrabOffset(e, tile, rect) {
  const dxRect = e.clientX - rect.left;
  const dyRect = e.clientY - rect.top;
  if (
    e.target === tile &&
    typeof e.offsetX === 'number' &&
    typeof e.offsetY === 'number' &&
    Number.isFinite(e.offsetX) &&
    Number.isFinite(e.offsetY)
  ) {
    return { dx: e.offsetX, dy: e.offsetY };
  }
  return { dx: dxRect, dy: dyRect };
}

/**
 * Phase 1 suffix drag: real tile stays in the bank (visibility:hidden keeps its slot).
 * A plain floater on document.body follows the pointer using left/top in viewport px only
 * (no transform — avoids zoom/transform composition bugs). Window listeners + pointerId
 * avoid setPointerCapture issues after DOM changes on Safari.
 */
function attachAnTileDrag(tile) {
  const onMove = (ev) => {
    if (!phase1Drag || phase1Drag.tile !== tile || ev.pointerId !== phase1Drag.pointerId) return;
    ev.preventDefault();
    const { floater, dx, dy } = phase1Drag;
    floater.style.left = `${ev.clientX - dx}px`;
    floater.style.top = `${ev.clientY - dy}px`;
  };

  const end = (ev) => {
    if (!phase1Drag || phase1Drag.tile !== tile || ev.pointerId !== phase1Drag.pointerId) return;
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', end, true);
    window.removeEventListener('pointercancel', end, true);

    const { floater } = phase1Drag;
    if (floater && floater.parentNode) floater.remove();

    const stack = document.elementsFromPoint(ev.clientX, ev.clientY);
    const slot = stack.find((el) => el.classList && el.classList.contains('phase1-drop-slot'));
    const card = slot && slot.closest('.phase1-card');

    const dropped =
      slot && !slot.dataset.filled && card && tile.dataset.placed !== '1';

    if (dropped) {
      slot.textContent = sessionSuffix.toUpperCase();
      slot.dataset.filled = '1';
      slot.className = 'phase1-drop-slot phase1-drop-slot-filled shrink-0';
      tile.dataset.placed = '1';
      tile.style.visibility = '';
      tile.remove();

      card.classList.add('phase1-card-complete', 'ring-4', 'ring-emerald-400');

      const slotTotal = els.phase1Grid.querySelectorAll('.phase1-drop-slot').length;
      const filledTotal = els.phase1Grid.querySelectorAll('.phase1-drop-slot[data-filled="1"]').length;
      if (slotTotal > 0 && filledTotal === slotTotal) {
        setTimeout(() => {
          if (phase1Mode === 'singles') {
            finishPhase1SingleWord();
          } else {
            finishPhase1();
          }
        }, 450);
      }
    } else {
      tile.style.visibility = '';
    }

    phase1Drag = null;
  };

  tile.addEventListener(
    'pointerdown',
    (e) => {
      if (tile.dataset.placed === '1') return;
      stopPhase1AnHint();
      e.preventDefault();
      const r = tile.getBoundingClientRect();
      const { dx, dy } = phase1DragGrabOffset(e, tile, r);

      const cs = window.getComputedStyle(tile);
      const floater = document.createElement('div');
      floater.className = 'phase1-drag-floater';
      floater.textContent = (tile.textContent || sessionSuffix || '').toUpperCase();
      floater.setAttribute('aria-hidden', 'true');
      floater.style.cssText = [
        'position:fixed',
        `left:${e.clientX - dx}px`,
        `top:${e.clientY - dy}px`,
        'right:auto',
        'bottom:auto',
        'margin:0',
        'box-sizing:border-box',
        'display:flex',
        'align-items:center',
        'justify-content:center',
        `width:${r.width}px`,
        `height:${r.height}px`,
        `font-family:${cs.fontFamily}`,
        `font-size:${cs.fontSize}`,
        `font-weight:${cs.fontWeight}`,
        `letter-spacing:${cs.letterSpacing}`,
        `border:${cs.border}`,
        `border-radius:${cs.borderRadius}`,
        `background-image:${cs.backgroundImage}`,
        `background-color:${cs.backgroundColor}`,
        `color:${cs.color}`,
        'pointer-events:none',
        'z-index:2147483646',
        'touch-action:none',
        '-webkit-tap-highlight-color:transparent',
      ].join(';');

      document.body.appendChild(floater);
      tile.style.visibility = 'hidden';

      phase1Drag = { tile, floater, dx, dy, pointerId: e.pointerId };

      window.addEventListener('pointermove', onMove, { passive: false });
      window.addEventListener('pointerup', end, true);
      window.addEventListener('pointercancel', end, true);
    },
    { passive: false },
  );
}

function finishPhase1() {
  const cards = document.querySelectorAll('.phase1-card-complete');
  phase1RoundsCompleted += 1;
  requestAnimationFrame(() => launchConfettiSpray([...cards], { origin: 'phase1-activity' }));
  setTimeout(() => {
    if (phase1RoundsCompleted < 2) {
      phase1ShuffleAndReplay();
    } else {
      stopPhase1AnHint();
      phase2Index = 0;
      phase2Mode = 'preview';
      showScreen('phase2');
      renderPhase2Word();
    }
  }, 1400);
}

/* ---------- Phase 2 ---------- */

function updatePhase2InstructionChrome() {
  const titleEl = els.phase2InstructionTitle;
  if (titleEl) {
    titleEl.textContent = `Word ${phase2Index + 1} of ${SESSION_SIZE}`;
  }
  const p = els.phase2Instruction;
  if (!p) return;
  const suf = sessionSuffix.toUpperCase();
  p.replaceChildren();
  for (let i = 0; i < suf.length; i += 1) {
    const span = document.createElement('span');
    span.className = 'phase2-suffix-accent shrink-0';
    span.textContent = suf[i];
    p.appendChild(span);
  }
}

function phase2OnCorrectLetter(L) {
  const slot = els.phase2WordPrint.querySelector('.phase2-drop-slot');
  if (!slot) return;
  slot.textContent = L;
  slot.dataset.filled = '1';
  slot.className = 'phase2-drop-slot phase2-drop-slot-filled shrink-0';
  slot.setAttribute('aria-label', `First letter ${L}`);
  els.phase2LetterPicks.querySelectorAll('button').forEach((b) => b.classList.add('pointer-events-none'));
  requestAnimationFrame(() =>
    launchConfettiSpray([slot, els.phase2Image], { origin: 'phase2-activity' }),
  );
  setTimeout(() => {
    phase2Index += 1;
    if (phase2Index >= SESSION_SIZE) {
      showScreen('phaseBridge');
    } else {
      renderPhase2Word();
    }
  }, 650);
}

/**
 * @param {string} L
 * @param {HTMLElement | null} draggedTile
 * @returns {boolean} true if accepted
 */
function tryPhase2LetterPick(L, draggedTile) {
  if (phase2Mode !== 'pick') return false;
  const target = phaseWordsOrdered[phase2Index].word[0].toUpperCase();
  const slotEl = els.phase2WordPrint.querySelector('.phase2-drop-slot');
  if (L !== target) {
    els.phase2LetterPicks.classList.add('shake-anim');
    if (slotEl) slotEl.classList.add('shake-anim');
    setTimeout(() => {
      els.phase2LetterPicks.classList.remove('shake-anim');
      if (slotEl) slotEl.classList.remove('shake-anim');
    }, 450);
    if (draggedTile) draggedTile.style.visibility = '';
    return false;
  }
  if (!slotEl || slotEl.dataset.filled === '1') {
    if (draggedTile) draggedTile.style.visibility = '';
    return false;
  }
  if (draggedTile) draggedTile.remove();
  phase2OnCorrectLetter(L);
  return true;
}

function attachPhase2LetterDrag(tile) {
  const onMove = (ev) => {
    if (!phase2Drag || phase2Drag.tile !== tile || ev.pointerId !== phase2Drag.pointerId) return;
    ev.preventDefault();
    const { floater, dx, dy } = phase2Drag;
    floater.style.left = `${ev.clientX - dx}px`;
    floater.style.top = `${ev.clientY - dy}px`;
  };

  const end = (ev) => {
    if (!phase2Drag || phase2Drag.tile !== tile || ev.pointerId !== phase2Drag.pointerId) return;
    window.removeEventListener('pointermove', onMove, { passive: false });
    window.removeEventListener('pointerup', end, true);
    window.removeEventListener('pointercancel', end, true);

    const { floater } = phase2Drag;
    if (floater && floater.parentNode) floater.remove();

    const L = tile.dataset.letter;
    const stack = document.elementsFromPoint(ev.clientX, ev.clientY);
    const slot = stack.find((el) => el.classList && el.classList.contains('phase2-drop-slot'));
    const dropped = Boolean(slot && slot.dataset.filled !== '1');

    if (dropped && L) {
      const ok = tryPhase2LetterPick(L, tile);
      if (!ok) tile.style.visibility = '';
    } else {
      tile.style.visibility = '';
    }

    phase2Drag = null;
  };

  tile.addEventListener(
    'pointerdown',
    (e) => {
      if (phase2Mode !== 'pick') return;
      if (tile.classList.contains('pointer-events-none')) return;
      e.preventDefault();
      const r = tile.getBoundingClientRect();
      const { dx, dy } = phase1DragGrabOffset(e, tile, r);

      const cs = window.getComputedStyle(tile);
      const floater = document.createElement('div');
      floater.className = 'phase1-drag-floater';
      floater.textContent = (tile.textContent || '').trim();
      floater.setAttribute('aria-hidden', 'true');
      floater.style.cssText = [
        'position:fixed',
        `left:${e.clientX - dx}px`,
        `top:${e.clientY - dy}px`,
        'right:auto',
        'bottom:auto',
        'margin:0',
        'box-sizing:border-box',
        'display:flex',
        'align-items:center',
        'justify-content:center',
        `width:${r.width}px`,
        `height:${r.height}px`,
        `font-family:${cs.fontFamily}`,
        `font-size:${cs.fontSize}`,
        `font-weight:${cs.fontWeight}`,
        `letter-spacing:${cs.letterSpacing}`,
        `border:${cs.border}`,
        `border-radius:${cs.borderRadius}`,
        `background-color:${cs.backgroundColor}`,
        `color:${cs.color}`,
        'pointer-events:none',
        'z-index:2147483646',
        'touch-action:none',
        '-webkit-tap-highlight-color:transparent',
      ].join(';');

      document.body.appendChild(floater);
      tile.style.visibility = 'hidden';

      phase2Drag = { tile, floater, dx, dy, pointerId: e.pointerId, onMove, end };

      window.addEventListener('pointermove', onMove, { passive: false });
      window.addEventListener('pointerup', end, true);
      window.addEventListener('pointercancel', end, true);
    },
    { passive: false },
  );
}

function renderPhase2Word() {
  const entry = phaseWordsOrdered[phase2Index];
  const w = entry.word.toLowerCase();

  updatePhase2InstructionChrome();

  els.phase2Image.classList.remove('hidden');
  els.phase2Image.src = wordImagePath(w, 1);
  els.phase2Image.alt = w;
  els.phase2Image.onerror = () => {
    els.phase2Image.classList.add('hidden');
  };

  renderWordBuild(w, els.phase2WordBuild, {
    showSignsVisible: true,
    compactLayout: true,
    omitLettersBelow: true,
  });

  els.phase2WordPrint.innerHTML = '';
  const row = document.createElement('div');
  row.className =
    'phase2-word-print-row flex flex-wrap items-baseline justify-center gap-x-[clamp(0.2rem,1.2vmin,0.55rem)] gap-y-1';
  const slot = document.createElement('div');
  slot.className = PHASE2_SLOT_EMPTY_CLASS;
  slot.setAttribute('aria-label', `Drop the first letter of ${w} here`);
  row.appendChild(slot);
  const suf = sessionSuffix.toUpperCase();
  for (let i = 0; i < suf.length; i += 1) {
    const span = document.createElement('span');
    span.className = 'phase2-suffix-accent shrink-0';
    span.textContent = suf[i];
    row.appendChild(span);
  }
  els.phase2WordPrint.appendChild(row);

  phase2Mode = 'preview';
  els.phase2LetterPicks.classList.add('hidden');
  els.phase2LetterPicks.classList.remove('flex');
  els.phase2LetterPicks.innerHTML = '';

  if (phase2AutoTimer) {
    clearTimeout(phase2AutoTimer);
    phase2AutoTimer = null;
  }
  const pauseMs = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 280 : 600;
  phase2AutoTimer = setTimeout(() => beginPhase2LetterPick(), pauseMs);
}

function beginPhase2LetterPick() {
  phase2AutoTimer = null;
  if (els.phase2.classList.contains('hidden')) return;
  if (phase2Mode !== 'preview') return;
  phase2Mode = 'pick';

  const initials = phaseWordsOrdered.map((e) => e.word[0].toUpperCase());
  const shuffled = shuffle([...initials]);

  els.phase2LetterPicks.innerHTML = '';
  const row = document.createElement('div');
  row.className =
    'inline-flex max-w-full flex-row flex-wrap items-center justify-center gap-2 sm:gap-3';
  shuffled.forEach((L) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className =
      'phase2-letter-tile min-h-[3.5rem] min-w-[3.5rem] cursor-grab touch-none select-none rounded-2xl border-4 border-slate-200 bg-white text-3xl font-black text-speller-ink shadow-soft transition hover:border-sky-300 active:cursor-grabbing sm:min-h-[4rem] sm:min-w-[4rem] sm:text-4xl';
    btn.textContent = L;
    btn.dataset.letter = L;
    btn.setAttribute('aria-label', `Letter ${L}, drag or tap`);
    btn.addEventListener('click', () => onPhase2LetterPick(L));
    attachPhase2LetterDrag(btn);
    row.appendChild(btn);
  });
  els.phase2LetterPicks.appendChild(row);
  els.phase2LetterPicks.classList.remove('hidden');
  els.phase2LetterPicks.classList.add('flex', 'justify-center');
}

function onPhase2LetterPick(L) {
  tryPhase2LetterPick(L, null);
}

els.btnPhaseBridge.addEventListener('click', () => {
  wordIndex = 0;
  showScreen('lesson');
  showCurrentWord();
});

els.btnStart.addEventListener('click', startSession);
els.suffixInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') startSession();
});

els.btnAgain.addEventListener('click', () => {
  showScreen('setup');
});

showScreen('setup');
