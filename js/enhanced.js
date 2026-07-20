/**
 * OpenHouse Enhanced Features
 * All additive - does not modify existing functionality
 * No dark mode toggle
 */
(function() {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;
  const $ = (s, ctx) => (ctx || document).querySelector(s);
  const $$ = (s, ctx) => Array.from((ctx || document).querySelectorAll(s));

  // ===== 1. BACK TO TOP BUTTON =====
  const backToTop = $('.back-to-top');
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      if (typeof Lenis !== 'undefined' && window.OpenhouseLenis) {
        window.OpenhouseLenis.scrollTo(document.body, { offset: 0 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // ===== 2. TOAST NOTIFICATIONS =====
  const toastStack = $('#toast-stack');
  function showToast(message) {
    if (!toastStack) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = '<span class="dot"></span><span>' + message + '</span>';
    toastStack.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => {
      el.classList.remove('show');
      el.classList.add('hiding');
      setTimeout(() => el.remove(), 400);
    }, 3200);
    return el;
  }
  if (window.showToast) window.showToast = showToast;

  // ===== 3. SCROLL REVEAL ANIMATIONS =====
  if (!reduced) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          if (entry.target.classList.contains('cat-pill')) {
            const index = Array.from(entry.target.parentNode.children).indexOf(entry.target);
            entry.target.style.setProperty('--i', index);
          }
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    $$('.reveal-up, .feature-card, .stat, .cat-pill').forEach(el => revealObserver.observe(el));
  }

  // ===== 4. STATS COUNTER ANIMATION =====
  const stats = $$('.stat-num[data-count]');
  if (stats.length && !reduced) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    stats.forEach(stat => statsObserver.observe(stat));
  }
  function animateCounter(target) {
    const countTo = parseInt(target.dataset.count) || 0;
    const suffix = target.dataset.suffix || '';
    const duration = 2.5;
    const startTime = performance.now();
    function update(currentTime) {
      const elapsed = (currentTime - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(countTo * easeProgress);
      target.textContent = currentValue + suffix;
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        target.classList.add('done');
      }
    }
    requestAnimationFrame(update);
  }

  // ===== 5. TYPEWRITER EFFECT =====
  const typewriteElements = $$('[data-typewrite]');
  if (typewriteElements.length && !reduced) {
    typewriteElements.forEach(el => {
      const text = el.textContent;
      el.innerHTML = '';
      el.style.visibility = 'visible';
      let i = 0;
      const typeInterval = setInterval(() => {
        if (i < text.length) { el.textContent += text.charAt(i); i++; }
        else { clearInterval(typeInterval); el.classList.add('done'); }
      }, 50);
    });
  }

  // ===== 6. MAGNETIC BUTTONS =====
  if (!isTouch && !reduced) {
    $$('[data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const relX = e.clientX - (r.left + r.width / 2);
        const relY = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${relX * 0.3}px, ${relY * 0.4}px) scale(1.05)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate(0, 0) scale(1)';
      });
    });
  }

  // ===== 7. TILT CARDS =====
  if (!isTouch && !reduced) {
    $$('.tilt-card').forEach(card => {
      let rect = null;
      card.addEventListener('mousemove', (e) => {
        if (!rect) rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const rotY = (px - 0.5) * 12;
        const rotX = (0.5 - py) * 12;
        card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(8px)`;
        card.style.setProperty('--mx', (px * 100) + '%');
        card.style.setProperty('--my', (py * 100) + '%');
      });
      card.addEventListener('mouseleave', () => {
        rect = null;
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateZ(0)';
      });
    });
  }

  // ===== 8. MARQUEE PAUSE ON HOVER =====
  const marquee = $('.marquee');
  const marqueeTrack = $('.marquee-track');
  if (marquee && marqueeTrack) {
    marquee.addEventListener('mouseenter', () => {
      marqueeTrack.style.animationPlayState = 'paused';
    });
    marquee.addEventListener('mouseleave', () => {
      marqueeTrack.style.animationPlayState = 'running';
    });
  }

  // ===== 9. DOCK NAVIGATION ACTIVE STATE =====
  const dock = $('#dock');
  if (dock) {
    const dockLinks = $$('a, button', dock);
    function updateDockActive() {
      const sections = ['top', 'apps', 'features', 'submit'];
      const scrollPos = window.scrollY + window.innerHeight / 2;
      sections.forEach((sectionId, index) => {
        const section = $(`#${sectionId}`);
        if (!section) return;
        const sectionTop = section.offsetTop;
        const nextSection = sections[index + 1] ? $(`#${sections[index + 1]}`) : null;
        const nextTop = nextSection ? nextSection.offsetTop : document.body.offsetHeight;
        if (scrollPos >= sectionTop && (nextTop ? scrollPos < nextTop : true)) {
          dockLinks.forEach(link => link.classList.remove('active'));
          const activeLink = dockLinks.find(link => link.getAttribute('href') === `#${sectionId}`);
          if (activeLink) activeLink.classList.add('active');
        }
      });
    }
    window.addEventListener('scroll', updateDockActive, { passive: true });
    updateDockActive();
  }

  // ===== 10. KEYBOARD NAVIGATION =====
  document.addEventListener('keydown', (e) => {
    const tag = (e.target.tagName || '').toLowerCase();
    const typing = tag === 'input' || tag === 'textarea';
    if (typing) return;

    if (e.key === 'Escape') {
      $$('.modal-overlay.open').forEach(overlay => {
        overlay.classList.remove('open');
      });
      document.body.style.overflow = '';
    }

    if (e.key === 'g' && !e.target.closest('input')) {
      const appsSection = $('#apps');
      if (appsSection) {
        if (typeof Lenis !== 'undefined' && window.OpenhouseLenis) {
          window.OpenhouseLenis.scrollTo(appsSection, { offset: -20 });
        } else {
          appsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }

    if (e.key === 'Home') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // ===== 11. SCROLL PROGRESS BAR =====
  const progressBar = $('#scroll-progress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const h = document.documentElement;
      const p = h.scrollTop / (h.scrollHeight - h.clientHeight);
      progressBar.style.transform = `scaleX(${p || 0})`;
    }, { passive: true });
  }

  // ===== 12. BACK TO TOP VISIBILITY =====
  if (backToTop) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }, { passive: true });
  }

  // ===== 13. SEARCH BAR EXPAND =====
  const paletteInput = $('#palette-input');
  if (paletteInput) {
    const originalWidth = paletteInput.parentElement.style.width || 'auto';
    paletteInput.addEventListener('focus', () => {
      paletteInput.parentElement.style.width = '280px';
    });
    paletteInput.addEventListener('blur', () => {
      paletteInput.parentElement.style.width = originalWidth;
    });
  }

  // ===== 14. CHANGELOG MODAL =====
  const changelogLink = $('#changelog-link');
  const changelogOverlay = $('#changelog-overlay');
  const changelogClose = $('#changelog-close');

  function openChangelog() {
    if (!changelogOverlay) return;
    const websiteContent = $('#changelog-website');
    const appsContent = $('#changelog-apps');
    const tabs = $$('.changelog-tab');
    
    if (websiteContent && appsContent) {
      websiteContent.hidden = false;
      appsContent.hidden = true;
    }
    
    tabs.forEach(tab => {
      tab.classList.remove('active');
      if (tab.dataset.tab === 'website') {
        tab.classList.add('active');
      }
    });
    
    changelogOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeChangelog() {
    if (!changelogOverlay) return;
    changelogOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  const changelogTabs = $$('.changelog-tab');
  changelogTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      changelogTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const websiteContent = $('#changelog-website');
      const appsContent = $('#changelog-apps');
      if (targetTab === 'website') {
        if (websiteContent) websiteContent.hidden = false;
        if (appsContent) appsContent.hidden = true;
      } else if (targetTab === 'apps') {
        if (websiteContent) websiteContent.hidden = true;
        if (appsContent) appsContent.hidden = false;
      }
    });
  });

  if (changelogLink) {
    changelogLink.addEventListener('click', (e) => {
      e.preventDefault();
      openChangelog();
    });
  }

  if (changelogClose) {
    changelogClose.addEventListener('click', closeChangelog);
  }

  if (changelogOverlay) {
    changelogOverlay.addEventListener('click', (e) => {
      if (e.target === changelogOverlay) {
        closeChangelog();
      }
    });
  }


  // ===== 15. TAP SOUNDS & CROSS × HIT - FIXED =====
  let audioCtx = null;
  let audioUnlocked = false;

  function getAudioCtx() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
    }
    return audioCtx;
  }

  async function unlockAudio() {
    if (audioUnlocked) return;
    const ctx = getAudioCtx();
    if (!ctx) return;
    try {
      if (ctx.state === 'suspended') await ctx.resume();
      audioUnlocked = true;
      const buf = ctx.createBuffer(1,1,22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
      src.stop(0.01);
    } catch(e){ console.warn('Audio unlock failed', e); }
  }

  // Minecraft hit / hurt sound - classic "oof" when hit by someone
  // Same sound everywhere as requested
  function playTapSound(type='click'){
    // type ignored - same sound everywhere
    const ctx = getAudioCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(()=>{});
    if (navigator.vibrate) navigator.vibrate(12);

    try {
      const now = ctx.currentTime;

      // Layer 1: low square body - the classic oof drop 340Hz -> 85Hz
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filt = ctx.createBiquadFilter();
      filt.type='lowpass';
      filt.frequency.setValueAtTime(850, now);
      filt.frequency.exponentialRampToValueAtTime(300, now+0.22);
      filt.Q.value = 1;
      osc.type='square';
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(82, now+0.19);
      gain.gain.setValueAtTime(0.44, now);
      gain.gain.setValueAtTime(0.44, now+0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now+0.26);
      osc.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now+0.28);

      // Layer 2: punch triangle higher - adds bite
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type='triangle';
      osc2.frequency.setValueAtTime(560, now);
      osc2.frequency.exponentialRampToValueAtTime(130, now+0.13);
      gain2.gain.setValueAtTime(0.20, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now+0.15);
      osc2.connect(gain2); gain2.connect(ctx.destination);
      osc2.start(now); osc2.stop(now+0.17);

      // Layer 3: tiny noise + bandpass - chest hit thump
      const bufferSize = Math.floor(ctx.sampleRate * 0.06);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for(let i=0;i<bufferSize;i++){
        const env = Math.pow(1 - i/bufferSize, 2.2);
        data[i] = (Math.random()*2-1) * env * 0.9;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const nFilt = ctx.createBiquadFilter();
      nFilt.type='bandpass';
      nFilt.frequency.value = 420;
      nFilt.Q.value = 2.5;
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(0.18, now);
      nGain.gain.exponentialRampToValueAtTime(0.001, now+0.08);
      noise.connect(nFilt); nFilt.connect(nGain); nGain.connect(ctx.destination);
      noise.start(now);

    } catch(e){ console.warn('Minecraft hit sound failed', e); }
  }

  function playMinecraftHit(){ playTapSound(); }


  // Crosshair DOM - fixed × shape
  let crossEl = document.getElementById('touch-crosshair');
  if (!crossEl){
    crossEl = document.createElement('div');
    crossEl.id='touch-crosshair';
    crossEl.innerHTML='<div class="ch-cross"></div><div class="ch-dot"></div><div class="ch-ring"></div>';
    document.body.appendChild(crossEl);
  }
  let crossTimer=null;
  function showCrosshair(x,y,variant=''){
    if (reduced) return;
    crossEl.style.left=x+'px'; crossEl.style.top=y+'px';
    crossEl.className=''; if(variant) crossEl.classList.add(variant);
    void crossEl.offsetWidth;
    crossEl.classList.add('active');
    clearTimeout(crossTimer);
    crossTimer=setTimeout(()=>{ crossEl.classList.remove('active'); }, 520);
  }

  const interactiveSel='button, a, [data-cursor], .cat-pill, .feature-card, .download-card, .cat-app, .dock a, .dock button, .modal-close, .changelog-tab, .palette-trigger, .icon-btn, .admin-menu-item, .btn, .btn-primary, .btn-outline, .brand, .footer-col a';
  let lastTouchTs = 0;
  let lastSoundTs = 0;
  let pointerDownActive = false;

  function handleInteraction(e){
    // Suppress mouse event that fires after touch (double sound bug)
    if (e.type === 'touchstart') {
      lastTouchTs = Date.now();
    }
    if (e.type === 'mousedown' && Date.now() - lastTouchTs < 450) {
      return; // synthetic mouse after touch
    }
    // Debounce rapid triggers (Chrome sometimes fires touch+pointer)
    if (Date.now() - lastSoundTs < 110) return;

    const t=e.target.closest(interactiveSel);
    if(!t) return;

    const x=e.touches?e.touches[0].clientX:e.clientX;
    const y=e.touches?e.touches[0].clientY:e.clientY;

    const isPill=t.classList.contains('cat-pill');
    const isBtn=t.classList.contains('btn')||t.classList.contains('btn-primary');

    lastSoundTs = Date.now();
    playTapSound(isPill?'pill':isBtn?'btn':'click');
    showCrosshair(x,y,isPill?'is-pill':isBtn?'is-btn':'');
  }

  // unlock
  ['touchstart','touchend','mousedown','keydown','pointerdown'].forEach(ev=>{
    document.addEventListener(ev, unlockAudio, {once:true, passive:true});
  });
  // Use pointerdown as primary (covers mouse+touch), keep touch/mouse as fallback but debounced
  document.addEventListener('pointerdown', handleInteraction, {passive:true});
  document.addEventListener('touchstart', handleInteraction, {passive:true});
  document.addEventListener('mousedown', handleInteraction, {passive:true});

  // pill glow follow
  document.addEventListener('mousemove', (e)=>{
    $$('.cat-pill').forEach(pill=>{
      const r=pill.getBoundingClientRect();
      const mx=((e.clientX-r.left)/r.width)*100;
      const my=((e.clientY-r.top)/r.height)*100;
      pill.style.setProperty('--mx', mx+'%');
      pill.style.setProperty('--my', my+'%');
    });
  }, {passive:true});


  // ===== INITIALIZATION =====
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    document.body.classList.add('enhanced-loaded');
    console.log('✨ OpenHouse Enhanced Features Loaded');
  }

  // Export for external use
  window.OpenHouseEnhanced = { showToast, init, playTapSound, showCrosshair, unlockAudio };
})();
