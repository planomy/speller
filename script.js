/**
 * Speller — word bank by suffix (lowercase keys).
 * Image convention (easy to change later):
 *   Fingerspelling: images/a.png … images/z.png
 *   Word pictures:  images/{word}1.png, images/{word}2.png (correct pair)
 * Distractors for each word are picked from two other words in the same session (images/{other}1.png).
 * Optional teacher clip per word: teacherVideo: "videos/man.mp4" (omit or null to hide panel)
 */
const WORD_BANK = {
  an: [
    { word: 'man', teacherVideo: null },
    { word: 'fan', teacherVideo: null },
    { word: 'pan', teacherVideo: null },
    { word: 'ran', teacherVideo: null },
    { word: 'can', teacherVideo: null },
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
 * Spray from the centre of each correct image tile, mostly upward (negative Y in CSS).
 * Two waves per origin: heavy confetti + faster glitter.
 */
function launchConfettiSpray(anchorElements) {
  const nodes = anchorElements.filter(Boolean);
  if (!nodes.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function sprayPointFromEl(el) {
    const r = el.getBoundingClientRect();
    return {
      x: r.left + r.width / 2,
      y: r.top + r.height / 2,
    };
  }

  const points = nodes.map(sprayPointFromEl);

  const overlay = document.createElement('div');
  overlay.className = 'confetti-overlay';
  overlay.setAttribute('aria-hidden', 'true');

  points.forEach((p) => {
    const flash = document.createElement('div');
    flash.className = 'confetti-flash';
    flash.style.left = `${p.x}px`;
    flash.style.top = `${p.y}px`;
    overlay.appendChild(flash);
  });

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
  const n = points.length;

  for (let pi = 0; pi < n; pi++) {
    const heavyHere = Math.floor(heavyTotal / n) + (pi < heavyTotal % n ? 1 : 0);
    const glitterHere = Math.floor(glitterTotal / n) + (pi < glitterTotal % n ? 1 : 0);
    const { x, y } = points[pi];
    for (let i = 0; i < heavyHere; i++) addPiece('heavy', x, y);
    for (let j = 0; j < glitterHere; j++) addPiece('glitter', x, y);
  }

  document.body.appendChild(overlay);
  setTimeout(() => overlay.remove(), 3200);
}

const els = {
  setup: document.getElementById('screen-setup'),
  lesson: document.getElementById('screen-lesson'),
  done: document.getElementById('screen-done'),
  suffixInput: document.getElementById('suffix-input'),
  setupError: document.getElementById('setup-error'),
  btnStart: document.getElementById('btn-start'),
  progressDots: document.getElementById('progress-dots'),
  wordNum: document.getElementById('word-num'),
  suffixDisplay: document.getElementById('suffix-display'),
  teacherPanel: document.getElementById('teacher-panel'),
  teacherVideo: document.getElementById('teacher-video'),
  wordBuild: document.getElementById('word-build'),
  imageGrid: document.getElementById('image-grid'),
  btnAgain: document.getElementById('btn-again'),
};

let sessionWords = [];
let wordIndex = 0;
let selected = new Set();
let locked = false;

function normalizeSuffix(raw) {
  return raw.trim().toLowerCase().replace(/^[^a-z]+/, '');
}

function showScreen(which) {
  const map = { setup: els.setup, lesson: els.lesson, done: els.done };
  Object.entries(map).forEach(([key, el]) => {
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

function renderWordBuild(word) {
  els.wordBuild.innerHTML = '';
  const letters = word.split('');
  letters.forEach((ch) => {
    const col = document.createElement('div');
    col.className = 'flex flex-col items-center gap-0.5 sm:gap-1';

    const ghost = document.createElement('button');
    ghost.type = 'button';
    ghost.className =
      'ghost-cell flex h-[clamp(5.5rem,30vmin,12rem)] w-[clamp(4.35rem,24vmin,9.5rem)] items-center justify-center rounded-2xl border-[3px] border-dashed border-slate-300 bg-slate-50/80 transition hover:border-sky-300 sm:rounded-3xl md:h-[clamp(6.25rem,32vmin,13rem)] md:w-[clamp(5rem,26vmin,10.5rem)]';
    ghost.setAttribute('aria-label', `Show handshape for ${ch}`);

    const imgWrap = document.createElement('button');
    imgWrap.type = 'button';
    imgWrap.className =
      'ghost-reveal hidden h-full w-full items-center justify-center rounded-2xl bg-white/90 p-1 outline-none ring-0 transition hover:bg-sky-50/90 focus-visible:ring-4 focus-visible:ring-sky-300 sm:rounded-3xl sm:p-1.5';
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

    const letterEl = document.createElement('p');
    letterEl.className =
      'font-display mt-0 text-[clamp(3rem,14vmin,7rem)] font-black leading-none tracking-[0.2em] text-speller-ink sm:text-[clamp(3.5rem,15vmin,7.5rem)] md:tracking-[0.25em] lg:text-[clamp(4rem,16vmin,8.5rem)]';
    letterEl.textContent = ch;

    const stack = document.createElement('div');
    stack.className =
      'relative flex h-[clamp(5.5rem,30vmin,12rem)] w-[clamp(4.35rem,24vmin,9.5rem)] items-center justify-center sm:rounded-3xl md:h-[clamp(6.25rem,32vmin,13rem)] md:w-[clamp(5rem,26vmin,10.5rem)]';
    stack.appendChild(ghost);
    stack.appendChild(imgWrap);

    col.appendChild(stack);
    col.appendChild(letterEl);
    els.wordBuild.appendChild(col);
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
  renderWordBuild(word);
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
  sessionWords = shuffle([...list]).slice(0, SESSION_SIZE);
  wordIndex = 0;
  showScreen('lesson');
  showCurrentWord();
}

els.btnStart.addEventListener('click', startSession);
els.suffixInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') startSession();
});

els.btnAgain.addEventListener('click', () => {
  showScreen('setup');
});

showScreen('setup');
