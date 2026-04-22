/*
  Anniversary Scrapbook - Complete Experience
  Book pages, memories, story, hearts, envelope, desk, final scene
*/

(() => {
  const dataNode = document.getElementById('appData');
  const data = dataNode ? JSON.parse(dataNode.textContent || '{}') : {};
  const memories = (data.memories || []).length ? data.memories : [];
  const captions = data.captions || [];

  // ===== SCENE MANAGEMENT =====
  const bookScene = document.getElementById('bookScene');
  const deskScene = document.getElementById('deskScene');
  const letterScene = document.getElementById('letterScene');
  const finalScene = document.getElementById('finalScene');

  function showScene(targetScene) {
    [bookScene, deskScene, letterScene, finalScene].forEach((s) => {
      if (s) s.classList.toggle('hidden', s !== targetScene);
    });
  }

  // ===== BOOK NAVIGATION =====
  const pages = Array.from(document.querySelectorAll('.page'));
  const book = document.getElementById('book');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const pageIndicator = document.getElementById('pageIndicator');
  const flipSfx = document.getElementById('flipSfx');

  let currentPage = 0;
  let sfxEnabled = true;
  let isFlipping = false;

  function updateBook() {
    pages.forEach((page, i) => {
      page.classList.toggle('turned', i < currentPage);
      page.style.zIndex = i < currentPage ? '1' : String(pages.length - i);
    });

    if (pageIndicator) pageIndicator.textContent = `Page ${currentPage + 1} / ${pages.length}`;
    if (prevBtn) prevBtn.disabled = currentPage === 0;
    if (nextBtn) nextBtn.disabled = currentPage === pages.length - 1;
  }

  function playFlip() {
    if (!sfxEnabled || !flipSfx) return;
    try {
      flipSfx.currentTime = 0;
      flipSfx.play().catch(() => null);
    } catch {
      // no-op
    }
  }

  function flipTo(index) {
    if (isFlipping) return;
    const bounded = Math.max(0, Math.min(index, pages.length - 1));
    if (bounded === currentPage) return;

    isFlipping = true;
    currentPage = bounded;
    playFlip();
    updateBook();

    setTimeout(() => {
      isFlipping = false;
    }, 600);

    // Auto-advance to desk scene at end
    if (currentPage === pages.length - 1) {
      setTimeout(() => {
        transitionToDesk();
      }, 1200);
    }
  }

  prevBtn?.addEventListener('click', () => flipTo(currentPage - 1));
  nextBtn?.addEventListener('click', () => flipTo(currentPage + 1));

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') flipTo(currentPage + 1);
    if (e.key === 'ArrowLeft') flipTo(currentPage - 1);
  });

  function isInteractiveTarget(target) {
    if (!(target instanceof Element)) return false;
    return Boolean(target.closest('button, a, input, textarea, select, .letter-envelope, .reveal-card, .polaroid'));
  }

  book?.addEventListener('click', (e) => {
    if (isInteractiveTarget(e.target)) return;
    const rect = book.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x >= rect.width / 2) flipTo(currentPage + 1);
    else flipTo(currentPage - 1);
  });

  let touchStartX = 0;
  book?.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0]?.clientX || 0;
  }, { passive: true });

  book?.addEventListener('touchend', (e) => {
    const endX = e.changedTouches[0]?.clientX || 0;
    const dx = endX - touchStartX;
    if (Math.abs(dx) < 28) return;
    if (dx < 0) flipTo(currentPage + 1);
    if (dx > 0) flipTo(currentPage - 1);
  }, { passive: true });

  // ===== MEMORY RENDERING (2 per page x 4 pages = 8 images) =====
  function getCaption(index) {
    if (!captions.length) return 'Add your memory caption here ✍️';
    return captions[index % captions.length];
  }

  function createPolaroid(src, index) {
    const wrap = document.createElement('figure');
    wrap.className = 'polaroid';
    wrap.style.setProperty('--tilt', `${(Math.random() * 10 - 5).toFixed(1)}deg`);

    const img = document.createElement('img');
    img.src = src;
    img.alt = `Memory ${index + 1}`;
    img.loading = 'lazy';

    const cap = document.createElement('figcaption');
    cap.className = 'caption';
    cap.textContent = getCaption(index);

    const sticker = document.createElement('span');
    sticker.className = 'sticker';
    sticker.textContent = ['🎀', '⭐', '💌', '🌸'][index % 4];

    wrap.append(img, cap, sticker);
    return wrap;
  }

  function renderMemories() {
    const grids = [
      document.getElementById('memoryGrid1'),
      document.getElementById('memoryGrid2'),
      document.getElementById('memoryGrid3'),
      document.getElementById('memoryGrid4'),
    ];

    if (memories.length === 0) {
      for (let i = 0; i < 4; i += 1) {
        const grid = grids[i];
        if (grid) {
          const p1 = createPolaroid(`https://picsum.photos/800?random=${i * 2}`, i * 2);
          const p2 = createPolaroid(`https://picsum.photos/800?random=${i * 2 + 1}`, i * 2 + 1);
          grid.append(p1, p2);
        }
      }
    } else {
      for (let i = 0; i < grids.length; i += 1) {
        const grid = grids[i];
        if (grid) {
          const idx1 = i * 2;
          const idx2 = i * 2 + 1;
          const src1 = memories[idx1 % memories.length];
          const src2 = memories[idx2 % memories.length];
          grid.append(createPolaroid(src1, idx1), createPolaroid(src2, idx2));
        }
      }
    }
  }

  // ===== STORY: TYPEWRITER + SHIMMER =====
  const storyText = document.getElementById('storyText');
  const storyLines = data.story || [];

  async function typeStory() {
    if (!storyText || !storyLines.length) return;

    const joined = storyLines.join('\n\n');
    storyText.innerHTML = '';

    for (let i = 0; i < joined.length; i += 1) {
      const char = document.createElement('span');
      char.className = 'story-char';
      char.textContent = joined[i];
      storyText.appendChild(char);
      await new Promise((resolve) => setTimeout(resolve, joined[i] === '\n' ? 14 : 18));
    }

    startShimmer();
  }

  function startShimmer() {
    const chars = Array.from(document.querySelectorAll('.story-char'));
    if (!chars.length) return;

    let head = 0;
    const bandSize = 6;

    setInterval(() => {
      chars.forEach((c) => c.classList.remove('shimmer'));
      for (let k = 0; k < bandSize; k += 1) {
        const idx = (head + k) % chars.length;
        if (chars[idx].textContent.trim()) chars[idx].classList.add('shimmer');
      }
      head = (head + 1) % chars.length;
    }, 85);
  }

  // ===== SYMBOLS =====
  const symbolIntroLeft = document.getElementById('symbolIntroLeft');
  const symbolIntroRight = document.getElementById('symbolIntroRight');
  const finalSymbols = document.getElementById('finalSymbols');

  function loadSymbols() {
    const sym1 = data.symbols?.[0] || '';
    if (sym1) {
      if (symbolIntroLeft) {
        symbolIntroLeft.src = sym1;
        symbolIntroLeft.style.display = 'block';
      }
      if (symbolIntroRight) {
        symbolIntroRight.src = sym1;
        symbolIntroRight.style.display = 'block';
      }
    }
  }

  function createFinalScene() {
    if (!finalSymbols) return;

    const symIndices = [1, 2, 3];
    const positions = [
      { x: '15%', y: '25%', size: 80 },
      { x: '75%', y: '35%', size: 100 },
      { x: '50%', y: '70%', size: 90 },
    ];

    symIndices.forEach((idx, i) => {
      const sym = data.symbols?.[idx];
      if (sym) {
        const wrap = document.createElement('div');
        wrap.className = 'floating-symbol';
        wrap.style.left = positions[i].x;
        wrap.style.top = positions[i].y;
        wrap.style.width = `${positions[i].size}px`;
        wrap.style.height = `${positions[i].size}px`;

        const img = document.createElement('img');
        img.src = sym;
        img.alt = `Symbol ${idx + 1}`;
        wrap.appendChild(img);
        finalSymbols.appendChild(wrap);

        if (window.gsap) {
          gsap.to(wrap, {
            y: '-20px',
            duration: 3,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: i * 0.3,
          });
        }
      }
    });
  }

  // ===== HEART PARTICLES =====
  const canvas = document.getElementById('heartCanvas');
  const ctx = canvas.getContext('2d');

  const hearts = [];
  const HEART_COUNT = 14;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createHeart() {
    const r = 9 + Math.random() * 8;
    const speed = 0.25 + Math.random() * 0.35;
    const angle = Math.random() * Math.PI * 2;

    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r,
      baseR: r,
      hue: 330 + Math.random() * 20,
      pulse: Math.random() * Math.PI * 2,
    };
  }

  function drawHeart(x, y, size, hue, pulse) {
    const animatedSize = size * (0.92 + 0.12 * Math.sin(pulse));
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(animatedSize / 16, animatedSize / 16);
    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.bezierCurveTo(0, 2, -6, -2, -10, 2);
    ctx.bezierCurveTo(-14, 6, -10, 11, 0, 17);
    ctx.bezierCurveTo(10, 11, 14, 6, 10, 2);
    ctx.bezierCurveTo(6, -2, 0, 2, 0, 6);
    ctx.closePath();
    ctx.shadowBlur = 16;
    ctx.shadowColor = `hsla(${hue}, 90%, 70%, 0.65)`;
    ctx.fillStyle = `hsla(${hue}, 86%, 72%, 0.62)`;
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.32)';
    ctx.beginPath();
    ctx.arc(-3.2, 1.4, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function handleEdgeBounce(h) {
    if (h.x - h.r < 0) { h.x = h.r; h.vx *= -1; }
    if (h.x + h.r > canvas.width) { h.x = canvas.width - h.r; h.vx *= -1; }
    if (h.y - h.r < 0) { h.y = h.r; h.vy *= -1; }
    if (h.y + h.r > canvas.height) { h.y = canvas.height - h.r; h.vy *= -1; }
  }

  function resolveCollision(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.hypot(dx, dy);
    const minDist = a.r + b.r;

    if (!dist || dist >= minDist) return;

    const overlap = (minDist - dist) * 0.5;
    const nx = dx / dist;
    const ny = dy / dist;

    a.x -= nx * overlap;
    a.y -= ny * overlap;
    b.x += nx * overlap;
    b.y += ny * overlap;

    const dvx = a.vx - b.vx;
    const dvy = a.vy - b.vy;
    const relVel = dvx * nx + dvy * ny;
    if (relVel > 0) return;

    const impulse = -2 * relVel / 2;
    a.vx += impulse * nx;
    a.vy += impulse * ny;
    b.vx -= impulse * nx;
    b.vy -= impulse * ny;
  }

  function animateHearts() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < hearts.length; i += 1) {
      const h = hearts[i];
      h.x += h.vx;
      h.y += h.vy;
      h.pulse += 0.035;
      handleEdgeBounce(h);
    }

    for (let i = 0; i < hearts.length; i += 1) {
      for (let j = i + 1; j < hearts.length; j += 1) {
        resolveCollision(hearts[i], hearts[j]);
      }
    }

    hearts.forEach((h) => drawHeart(h.x, h.y, h.baseR, h.hue, h.pulse));
    requestAnimationFrame(animateHearts);
  }

  // ===== ENVELOPE / LETTER =====
  const envelope = document.getElementById('envelope');
  const letterContent = document.getElementById('letterContent');
  const letterCard = document.getElementById('letterCard');
  const revealCard = document.getElementById('revealCard');
  const revealImage = document.getElementById('revealImage');

  function setupEnvelope() {
    if (!envelope || !letterContent) return;
    letterContent.textContent = data.letter || 'Write your letter here.';

    const toggle = () => {
      envelope.classList.toggle('open');
      if (envelope.classList.contains('open')) {
        playFlip();
      }
    };

    envelope.addEventListener('click', toggle);
    envelope.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  }

  function setupHoldReveal() {
    if (!revealCard || !revealImage) return;
    revealImage.src = memories[0] || 'https://picsum.photos/700';

    const start = () => revealCard.classList.add('holding');
    const end = () => revealCard.classList.remove('holding');

    ['mousedown', 'touchstart', 'pointerdown'].forEach((evt) => revealCard.addEventListener(evt, start));
    ['mouseup', 'mouseleave', 'touchend', 'touchcancel', 'pointerup', 'pointercancel'].forEach((evt) => revealCard.addEventListener(evt, end));
  }

  // ===== TRANSITIONS =====
  function transitionToDesk() {
    if (window.gsap && bookScene) {
      gsap.to(bookScene, {
        opacity: 0,
        duration: 0.8,
        onComplete: () => {
          showScene(deskScene);
          gsap.set(bookScene, { opacity: 1 });
          
          setTimeout(() => {
            transitionToLetter();
          }, 2000);
        },
      });
    } else {
      setTimeout(() => transitionToLetter(), 2000);
    }
  }

  function transitionToLetter() {
    if (window.gsap && deskScene) {
      gsap.to(deskScene, {
        opacity: 0,
        duration: 0.8,
        onComplete: () => {
          showScene(letterScene);
          gsap.set(deskScene, { opacity: 1 });
        },
      });
    } else {
      showScene(letterScene);
    }
  }

  function transitionToFinal() {
    if (window.gsap && letterScene) {
      gsap.to(letterScene, {
        opacity: 0,
        duration: 0.8,
        onComplete: () => {
          showScene(finalScene);
          gsap.set(letterScene, { opacity: 1 });
          createFinalScene();
        },
      });
    } else {
      showScene(finalScene);
      createFinalScene();
    }
  }

  // ===== AUDIO =====
  const bgMusic = document.getElementById('bgMusic');
  const musicToggle = document.getElementById('musicToggle');
  const muteFxToggle = document.getElementById('muteFxToggle');
  const sparkleLayer = document.getElementById('sparkleLayer');
  const confettiPop = document.getElementById('confettiPop');

  function setupAudio() {
    let musicOn = false;
    let fallbackAudio = null;

    function startFallbackAmbient() {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return false;

      const ctx = new AudioCtx();
      const gain = ctx.createGain();
      gain.gain.value = 0.0001;
      gain.connect(ctx.destination);

      const oscA = ctx.createOscillator();
      const oscB = ctx.createOscillator();
      oscA.type = 'sine';
      oscB.type = 'triangle';
      oscA.frequency.value = 220;
      oscB.frequency.value = 329.63;

      const detuneLfo = ctx.createOscillator();
      const detuneGain = ctx.createGain();
      detuneLfo.type = 'sine';
      detuneLfo.frequency.value = 0.11;
      detuneGain.gain.value = 8;
      detuneLfo.connect(detuneGain);
      detuneGain.connect(oscA.detune);

      oscA.connect(gain);
      oscB.connect(gain);
      oscA.start();
      oscB.start();
      detuneLfo.start();

      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.014, now + 0.7);

      fallbackAudio = { ctx, gain, oscA, oscB, detuneLfo };
      return true;
    }

    async function stopFallbackAmbient() {
      if (!fallbackAudio) return;
      const { ctx, gain, oscA, oscB, detuneLfo } = fallbackAudio;
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      setTimeout(async () => {
        try {
          oscA.stop();
          oscB.stop();
          detuneLfo.stop();
          await ctx.close();
        } catch {
          // no-op
        }
      }, 280);

      fallbackAudio = null;
    }

    musicToggle?.addEventListener('click', async () => {
      musicOn = !musicOn;

      if (musicOn) {
        let started = false;
        if (bgMusic) {
          try {
            bgMusic.volume = 0.55;
            bgMusic.load();
            await bgMusic.play();
            started = true;
          } catch {
            started = false;
          }
        }

        if (!started) {
          started = startFallbackAmbient();
          musicToggle.textContent = started ? '🎵 Music: On' : '🎵 Music: Off';
          musicOn = started;
          return;
        }

        musicToggle.textContent = '🎵 Music: On';
      } else {
        if (bgMusic) bgMusic.pause();
        await stopFallbackAmbient();
        musicToggle.textContent = '🎵 Music: Off';
      }
    });

    if (bgMusic) {
      bgMusic.addEventListener('play', () => {
        if (musicToggle) musicToggle.textContent = '🎵 Music: On';
      });
      bgMusic.addEventListener('pause', () => {
        if (!fallbackAudio && musicToggle) musicToggle.textContent = '🎵 Music: Off';
      });
      bgMusic.addEventListener('ended', () => {
        if (musicOn) {
          bgMusic.currentTime = 0;
          bgMusic.play().catch(() => null);
        }
      });
    }

    muteFxToggle?.addEventListener('click', () => {
      sfxEnabled = !sfxEnabled;
      muteFxToggle.textContent = sfxEnabled ? '🔔 SFX: On' : '🔕 SFX: Off';
    });
  }

  // ===== SPARKLES & POLISH =====
  function spawnSparkle(x, y) {
    if (!sparkleLayer) return;
    const node = document.createElement('span');
    node.textContent = '✦';
    node.style.position = 'absolute';
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
    node.style.color = ['#ffc4e3', '#fff1a5', '#d3b8ff'][Math.floor(Math.random() * 3)];
    node.style.fontSize = `${12 + Math.random() * 14}px`;
    node.style.opacity = '0.95';
    node.style.pointerEvents = 'none';
    node.style.transition = 'transform 1.2s ease, opacity 1.2s ease';
    sparkleLayer.appendChild(node);

    requestAnimationFrame(() => {
      node.style.transform = `translate(${(Math.random() - 0.5) * 60}px, ${-30 - Math.random() * 40}px)`;
      node.style.opacity = '0';
    });

    setTimeout(() => node.remove(), 1300);
  }

  function introConfetti() {
    if (!confettiPop) return;
    const rect = confettiPop.getBoundingClientRect();
    for (let i = 0; i < 55; i += 1) {
      setTimeout(() => {
        spawnSparkle(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }, i * 24);
    }
  }

  function setupParallax() {
    const faces = Array.from(document.querySelectorAll('.page-face.front'));
    window.addEventListener('mousemove', (e) => {
      const xNorm = (e.clientX / window.innerWidth - 0.5) * 2;
      const yNorm = (e.clientY / window.innerHeight - 0.5) * 2;
      faces.forEach((f) => {
        f.style.transform = `translate(${xNorm * 6}px, ${yNorm * 4}px)`;
      });
    });
  }

  function floatingSonu() {
    setInterval(() => {
      const node = document.createElement('div');
      node.className = 'floating-sonu';
      node.textContent = 'Sonu';
      node.style.left = `${8 + Math.random() * 84}vw`;
      node.style.top = `${70 + Math.random() * 20}vh`;
      document.body.appendChild(node);
      setTimeout(() => node.remove(), 7600);
    }, 2800);
  }

  // ===== INITIALIZE =====
  updateBook();
  renderMemories();
  loadSymbols();
  setupEnvelope();
  setupHoldReveal();
  setupAudio();
  setupParallax();
  floatingSonu();
  introConfetti();

  resizeCanvas();
  for (let i = 0; i < HEART_COUNT; i += 1) hearts.push(createHeart());
  animateHearts();

  window.addEventListener('resize', resizeCanvas);

  setTimeout(typeStory, 500);

  window.addEventListener('click', (e) => spawnSparkle(e.clientX, e.clientY));
})();
