/* =============================================================================
 * FloatingLines (React Bits–style)
 * 3 stacked sine-wave layers; mouse bends nearby lines; subtle parallax.
 * Site palette: greens #7bd0a3 / #2db371 / #00a651
 * ============================================================================= */
(function () {
  const canvas = document.getElementById('hero-lines');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
  let W = 0, H = 0;
  let mouseTarget = { x: -9999, y: -9999 };
  const mouse = { x: -9999, y: -9999 };
  let t0 = performance.now();

  /* Three layers — react-bits style: top / middle / bottom.
     Each layer is a coherent "band" of parallel waves. Same frequency, amp,
     and speed inside a layer — only the vertical offset and a small phase
     shift (so the lines don't all hit crest at the same x) vary per line. */
  const layerBands = [
    /* slope > 0 = band tilts down to the right, < 0 = down to the left.
       0.12 means each side is ~12% of H lower than the centre. */
    { yFrac: 0.22, count: 10, spacing: 7, amp: 16, freq: 0.0050, speed: 0.00018, alpha: 0.50, width: 0.7, slope: -0.12 },
    { yFrac: 0.50, count: 14, spacing: 8, amp: 26, freq: 0.0038, speed: 0.00012, alpha: 0.55, width: 0.9, slope:  0.00 },
    { yFrac: 0.78, count: 10, spacing: 7, amp: 18, freq: 0.0046, speed: 0.00016, alpha: 0.50, width: 0.7, slope:  0.12 }
  ];

  /* Build line specs — deterministic, no randomness.
     Phase shifts by 0.35 rad per line so the band undulates as a coherent
     wave-train, not a stack of identical copies. */
  const layers = layerBands.map(b => ({
    yFrac:  b.yFrac,
    alpha:  b.alpha,
    speed:  b.speed,
    width:  b.width,
    slope:  b.slope,
    lines: Array.from({ length: b.count }, (_, i) => ({
      offsetY: (i - (b.count - 1) / 2) * b.spacing,
      amp:     b.amp,
      freq:    b.freq,
      phase:   i * 0.35,
      speed:   b.speed,
      width:   b.width
    }))
  }));

  /* Mouse-driven bend */
  const BEND_RADIUS = 140;
  const BEND_STRENGTH = 22;

  function resize() {
    const r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width  = Math.max(1, Math.floor(W * DPR));
    canvas.height = Math.max(1, Math.floor(H * DPR));
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function draw(now) {
    const time = now - t0;

    /* Smoothly lerp mouse position */
    mouse.x += (mouseTarget.x - mouse.x) * 0.06;
    mouse.y += (mouseTarget.y - mouse.y) * 0.06;

    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = 'round';

    /* Shanghai Electric palette: top layer blue, mid layer green,
       bottom layer blends the two — echo of the logo. */
    const PALETTE = [
      '21, 101, 192',  // top    → brand blue
      '0, 166, 81',    // mid    → accent green
      '21, 101, 192'   // bottom → brand blue
    ];
    for (let li = 0; li < layers.length; li++) {
      const L = layers[li];
      /* Each layer gets a global slope so the band tilts across the screen.
         Top band slopes down-left, mid stays level, bottom slopes up-left
         (mirror feel). This is the "倾斜一点" you wanted. */
      const slope = L.slope;
      ctx.strokeStyle = `rgba(${PALETTE[li] || PALETTE[0]}, ${L.alpha})`;

      for (const ln of L.lines) {
        ctx.beginPath();
        ctx.lineWidth = ln.width;
        /* Two stacked sines: a strong fundamental + a soft harmonic to soften
           the geometric perfection. Same amp/freq/phase on every line in a
           layer — the only variation per line is the phase offset above. */
        for (let x = -20; x <= W + 20; x += 4) {
          const t = time * ln.speed;
          /* Tilt: every x unit adds slope*W*0.5 to y, so the line is tilted. */
          const tilt = slope * x;
          const baseY = H * L.yFrac + tilt;
          const wave =
            Math.sin(x * ln.freq       + t + ln.phase) * ln.amp +
            Math.sin(x * ln.freq * 2.1 + t * 0.7)        * (ln.amp * 0.18);
          let y = baseY + ln.offsetY + wave;

          /* Mouse bend: push nearby points away from cursor */
          if (mouse.x > -1000) {
            const dx = x - mouse.x;
            const dy = (baseY + ln.offsetY) - mouse.y;
            const d = Math.hypot(dx, dy);
            if (d < BEND_RADIUS) {
              const k = 1 - d / BEND_RADIUS;
              const len = d || 1;
              y -= (dy / len) * k * k * BEND_STRENGTH;
            }
          }

          if (x === -20) ctx.moveTo(x, y);
          else           ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }

    requestAnimationFrame(draw);
  }

  /* ---- Events ---- */
  window.addEventListener('resize', resize);
  canvas.parentElement.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    mouseTarget.x = e.clientX - r.left;
    mouseTarget.y = e.clientY - r.top;
  });
  canvas.parentElement.addEventListener('pointerleave', () => {
    mouseTarget.x = mouseTarget.y = -9999;
  });

  resize();
  requestAnimationFrame(draw);
})();
