# VR Shooting Game — Implementation Plan

## Context

Rewrites the A-Frame people-data visualization into an interactive VR shooting game. Orbiting spheres are destroyed with laser guns. Both `index.html` and `src/main.js` are fully rewritten; no new npm packages needed.

---

## Files Modified

- `index.html` — full rewrite
- `src/main.js` — full rewrite

---

## index.html

- Remove `aframe-text-geometry-component` script tag
- Score HUD: `<div id="score-display">SCORE: 0</div>` (HTML overlay, top-right)
- CSS: flash animation on score change
- Scene:
  - Deep space sky `#0a0a1a`
  - Dark floor plane
  - Camera rig with `laser-controls` on both hands (VR) + cursor with raycaster (desktop)
  - `<a-entity game-manager>`
  - `<a-entity id="spheres-container">`

---

## src/main.js — Components

### AudioSystem
Lazy-init `AudioContext` on first user gesture.
- `playLaser()`: oscillator 800→400Hz, 80ms
- `playExplosion()`: white noise, bandpass filter, 400ms decay

### `orbiting-sphere` Component
- `init()`: create child `<a-sphere class="shootable">` with emissive glow
- `tick()`: update position via `object3D.position.set()` (no setAttribute for perf)
- `this.active` flag — set to false when exploding

### `explodable` Component
- `explode()`: stop orbit, animate sphere (scale up→orange→collapse), spawn particles + point light flash, emit `sphere-destroyed`
- `_spawnParticles(pos)`: 8 small spheres fly outward, fade out, removed after 700ms
- `_spawnPointLight(pos)`: orange point light, fades 300ms, removed after 400ms

### `game-manager` Component
- Spawns 12 spheres: 3 rings (r=3,5,7m), 4 spheres each, random speeds/heights/colors
- `onSphereDestroyed()`: +100 score, flash HUD, respawn on same ring after 2s
- Desktop: listen for `click` on `.shootable` targets
- VR: listen for `triggerdown` on laser-controls entities, check `raycaster.intersectedEls`
- Laser beam: thin cyan cylinder child of each hand, visible 150ms on fire

---

## Key Technical Notes

- `.shootable` class on child `<a-sphere>` (not parent) — raycaster tests Three.js meshes
- `object3D.position.set()` in tick for performance
- `window.THREE` available globally from A-Frame CDN bundle
- Audio init deferred to first click/triggerdown
- Score flash: `void el.offsetWidth` to force reflow before re-adding CSS class
