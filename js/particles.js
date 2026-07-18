(function(){
  const canvas = document.getElementById('particles');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover:none)').matches;

  let w, h, dpr;
  let particles = [];
  let mouse = { x: -9999, y: -9999, active:false };
  let bursts = []; // click explosions

  const COUNT_DESKTOP = 90;
  const COUNT_MOBILE = 40;

  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = window.innerWidth * dpr;
    h = canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
  }

  function makeParticle(){
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      r: (Math.random() * 1.6 + 0.4) * dpr,
      vx: (Math.random() - 0.5) * 0.15 * dpr,
      vy: (Math.random() - 0.5) * 0.15 * dpr,
      base: Math.random() * 0.5 + 0.15
    };
  }

  function init(){
    resize();
    const count = isTouch ? COUNT_MOBILE : COUNT_DESKTOP;
    particles = Array.from({length: count}, makeParticle);
  }

  function addBurst(x, y){
    const n = 18;
    for(let i=0;i<n;i++){
      const angle = (Math.PI * 2 * i) / n + Math.random()*0.3;
      const speed = (Math.random()*2.2 + 1) * dpr;
      bursts.push({
        x, y,
        vx: Math.cos(angle)*speed,
        vy: Math.sin(angle)*speed,
        life: 1,
        r: (Math.random()*1.8+0.8) * dpr
      });
    }
  }
  window.__particleBurst = addBurst;

  function step(){
    ctx.clearRect(0,0,w,h);

    // connecting lines (subtle web)
    ctx.lineWidth = 1 * dpr;

    for(let i=0;i<particles.length;i++){
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if(p.x < 0) p.x = w; if(p.x > w) p.x = 0;
      if(p.y < 0) p.y = h; if(p.y > h) p.y = 0;

      // mouse spotlight attraction (gentle)
      if(mouse.active){
        const dx = mouse.x - p.x, dy = mouse.y - p.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        const radius = 180 * dpr;
        if(dist < radius){
          const force = (1 - dist/radius) * 0.02;
          p.x += dx * force * 0.05;
          p.y += dy * force * 0.05;
        }
      }

      const near = mouse.active && Math.hypot(mouse.x-p.x, mouse.y-p.y) < 180*dpr;
      const alpha = near ? Math.min(p.base + 0.4, 1) : p.base;

      ctx.beginPath();
      ctx.shadowBlur = near ? 10*dpr : 4*dpr;
      ctx.shadowColor = 'rgba(255,180,84,0.6)';
      ctx.fillStyle = `rgba(240,238,233,${alpha})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
    }

    // click burst particles
    for(let i=bursts.length-1;i>=0;i--){
      const b = bursts[i];
      b.x += b.vx; b.y += b.vy;
      b.vx *= 0.96; b.vy *= 0.96;
      b.life -= 0.02;
      if(b.life <= 0){ bursts.splice(i,1); continue; }
      ctx.beginPath();
      ctx.shadowBlur = 8*dpr;
      ctx.shadowColor = 'rgba(255,180,84,0.8)';
      ctx.fillStyle = `rgba(255,180,84,${b.life})`;
      ctx.arc(b.x, b.y, b.r * b.life, 0, Math.PI*2);
      ctx.fill();
    }

    if(!reduced) requestAnimationFrame(step);
  }

  window.addEventListener('resize', () => { init(); });
  if(!isTouch){
    window.addEventListener('pointermove', (e) => {
      mouse.x = e.clientX * dpr;
      mouse.y = e.clientY * dpr;
      mouse.active = true;
    });
    window.addEventListener('pointerleave', () => { mouse.active = false; });
  }

  init();
  if(reduced){
    // draw a single static frame for reduced-motion users
    step();
  } else {
    requestAnimationFrame(step);
  }
})();
