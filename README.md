# Openhouse — open source app directory

A dense, effects-heavy landing page for an open source app directory.
Plain HTML/CSS/JS, no build step — deploy straight to Vercel.

## Stack

- **GSAP + ScrollTrigger** (CDN) — split-letter title reveal, parallax on the
  hero grid/fog, and the scrub-driven "sticky storytelling" section.
- **Lenis** (CDN) — smooth scroll, wired into the GSAP ticker.
- **Vanilla canvas** (`js/particles.js`) — the monochrome floating-particle
  background, mouse spotlight attraction, and click particle bursts. No
  Three.js/WebGL dependency, so it stays light.
- **`js/main.js`** — everything else: custom physics cursor, magnetic
  buttons, character-scramble brand hover, 3D tilt + mouse-glow cards,
  scroll progress bar, stat count-ups, command palette (⌘K), floating dock
  nav, welcome/shortcuts modals, and toasts.

## Files

```
index.html
style.css
js/particles.js   — canvas background
js/main.js        — cursor, scroll, reveals, palette, modals, toasts
vercel.json       — pins framework to "Other" so Vercel doesn't guess Vite
```

## Customize

- **Content/branding**: it's themed as "Openhouse", a directory of open
  source apps. The six app cards under `#apps` are placeholders (including
  a card for your own `Waveline`/`Rootkit`-style projects) — swap in real
  repos, descriptions, and licenses.
- **Palette**: CSS variables at the top of `style.css` (`--accent` is the
  amber/phosphor tone; swap for your own).
- **Particle density / performance**: `COUNT_DESKTOP` / `COUNT_MOBILE` in
  `js/particles.js`. Heavy effects (cursor, particles, tilt) auto-disable
  on touch devices and respect `prefers-reduced-motion`.
- **Command palette results**: edit the `<li>` list inside
  `#palette-results` in `index.html`.

## Deploy to Vercel

```bash
npm i -g vercel
cd openhouse-site
vercel --prod
```

Framework preset is pinned to "Other" via `vercel.json`, so it will just
serve the static files — no build command needed.
