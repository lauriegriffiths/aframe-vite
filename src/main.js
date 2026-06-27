// ─── Constants ────────────────────────────────────────────────────────────────

const ORBIT_RINGS = [
  { radius: 3, count: 4 },
  { radius: 5, count: 4 },
  { radius: 7, count: 4 },
];

const SPHERE_COLORS = [
  '#ff3366', '#33ccff', '#ffcc00',
  '#ff6600', '#00ff99', '#cc33ff', '#ff99cc',
];

// ─── Audio ────────────────────────────────────────────────────────────────────

const AudioSystem = {
  ctx: null,

  init() {
    if (this.ctx) return;
    this.ctx = new AudioContext();
  },

  playLaser() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.09);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  },

  playExplosion() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const bufferSize = Math.floor(ctx.sampleRate * 0.4);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 180;
    filter.Q.value = 0.8;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(1.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    source.stop(ctx.currentTime + 0.45);
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

// ─── orbiting-sphere Component ────────────────────────────────────────────────

AFRAME.registerComponent('orbiting-sphere', {
  schema: {
    radius: { type: 'number', default: 5 },
    speed: { type: 'number', default: 0.5 },
    height: { type: 'number', default: 1.5 },
    phase: { type: 'number', default: 0 },
    color: { type: 'color', default: '#ff3366' },
    size: { type: 'number', default: 0.3 },
  },

  init() {
    this.angle = this.data.phase;
    this.active = true;

    const sphere = document.createElement('a-sphere');
    sphere.setAttribute('radius', this.data.size);
    sphere.setAttribute('color', this.data.color);
    sphere.setAttribute('roughness', '0.15');
    sphere.setAttribute('metalness', '0.6');
    sphere.setAttribute('emissive', this.data.color);
    sphere.setAttribute('emissive-intensity', '0.4');
    sphere.classList.add('shootable');
    this.el.appendChild(sphere);
    this.sphereEl = sphere;
  },

  tick(time, dt) {
    if (!this.active) return;
    this.angle += this.data.speed * (dt / 1000);
    const x = Math.cos(this.angle) * this.data.radius;
    const z = Math.sin(this.angle) * this.data.radius;
    this.el.object3D.position.set(x, this.data.height, z);
  },
});

// ─── explodable Component ─────────────────────────────────────────────────────

AFRAME.registerComponent('explodable', {
  init() {
    this.exploded = false;
  },

  explode() {
    if (this.exploded) return;
    this.exploded = true;

    const orbitComp = this.el.components['orbiting-sphere'];
    if (orbitComp) orbitComp.active = false;

    const worldPos = new THREE.Vector3();
    this.el.object3D.getWorldPosition(worldPos);

    const sphereEl = this.el.querySelector('.shootable');
    if (sphereEl) {
      // Flash orange
      sphereEl.setAttribute('color', '#ff8800');
      sphereEl.setAttribute('emissive', '#ff8800');
      sphereEl.setAttribute('emissive-intensity', '1');

      // Scale burst
      sphereEl.setAttribute('animation__burst',
        'property: scale; to: 2.2 2.2 2.2; dur: 120; easing: easeOutQuad');

      // Then collapse
      setTimeout(() => {
        sphereEl.setAttribute('animation__collapse',
          'property: scale; to: 0.001 0.001 0.001; dur: 220; easing: easeInQuad');
      }, 130);
    }

    AudioSystem.playExplosion();
    this._spawnParticles(worldPos);
    this._spawnPointLight(worldPos);

    const radius = orbitComp ? orbitComp.data.radius : 5;
    this.el.sceneEl.emit('sphere-destroyed', { entity: this.el, radius });

    const el = this.el;
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 420);
  },

  _spawnParticles(pos) {
    const scene = this.el.sceneEl;
    for (let i = 0; i < 10; i++) {
      const p = document.createElement('a-sphere');
      const size = randomBetween(0.04, 0.12);
      const color = Math.random() > 0.5 ? '#ff8800' : '#ffcc00';

      p.setAttribute('radius', size);
      p.setAttribute('position', `${pos.x} ${pos.y} ${pos.z}`);
      p.setAttribute('color', color);
      p.setAttribute('emissive', color);
      p.setAttribute('emissive-intensity', '0.8');
      p.setAttribute('material', 'transparent: true; opacity: 1');

      const dx = (Math.random() - 0.5) * 3.5;
      const dy = randomBetween(0.2, 2.2);
      const dz = (Math.random() - 0.5) * 3.5;

      p.setAttribute('animation__move',
        `property: position; to: ${pos.x + dx} ${pos.y + dy} ${pos.z + dz}; dur: 650; easing: easeOutQuad`);
      p.setAttribute('animation__fade',
        'property: material.opacity; to: 0; dur: 550; easing: easeInQuad');

      scene.appendChild(p);
      setTimeout(() => { if (p.parentNode) p.parentNode.removeChild(p); }, 750);
    }
  },

  _spawnPointLight(pos) {
    const scene = this.el.sceneEl;
    const light = document.createElement('a-light');
    light.setAttribute('type', 'point');
    light.setAttribute('color', '#ff6600');
    light.setAttribute('intensity', '3');
    light.setAttribute('distance', '8');
    light.setAttribute('position', `${pos.x} ${pos.y} ${pos.z}`);
    light.setAttribute('animation',
      'property: intensity; to: 0; dur: 350; easing: easeOutQuad');
    scene.appendChild(light);
    setTimeout(() => { if (light.parentNode) light.parentNode.removeChild(light); }, 450);
  },
});

// ─── game-manager Component ───────────────────────────────────────────────────

AFRAME.registerComponent('game-manager', {
  init() {
    this.score = 0;
    this.scoreEl = document.getElementById('score-display');
    this.container = document.getElementById('spheres-container');

    this.spawnAllSpheres();
    this.setupInputHandlers();

    this.el.sceneEl.addEventListener('sphere-destroyed', (e) => {
      this.onSphereDestroyed(e.detail);
    });
  },

  spawnAllSpheres() {
    ORBIT_RINGS.forEach(({ radius, count }) => {
      for (let i = 0; i < count; i++) {
        const phase = (i / count) * Math.PI * 2;
        this.spawnSphere(radius, phase);
      }
    });
  },

  spawnSphere(radius, phase) {
    const angle = (phase !== undefined) ? phase : Math.random() * Math.PI * 2;
    const speed = randomBetween(0.3, 0.9) * (Math.random() > 0.5 ? 1 : -1);
    const height = randomBetween(0.8, 2.8);
    const color = SPHERE_COLORS[Math.floor(Math.random() * SPHERE_COLORS.length)];
    const size = randomBetween(0.22, 0.42);

    const entity = document.createElement('a-entity');
    entity.setAttribute('orbiting-sphere', {
      radius, speed, height, phase: angle, color, size,
    });
    entity.setAttribute('explodable', '');
    this.container.appendChild(entity);
    return entity;
  },

  onSphereDestroyed({ radius }) {
    this.updateScore(100);
    setTimeout(() => this.spawnSphere(radius), 2000);
  },

  updateScore(delta) {
    this.score += delta;
    this.scoreEl.textContent = `SCORE: ${this.score}`;
    // Restart flash animation
    this.scoreEl.classList.remove('flash');
    void this.scoreEl.offsetWidth;
    this.scoreEl.classList.add('flash');
  },

  setupInputHandlers() {
    const scene = this.el.sceneEl;

    // Desktop: click on shootable sphere (fired by cursor raycaster)
    scene.addEventListener('click', (e) => {
      if (!e.target.classList.contains('shootable')) return;
      AudioSystem.init();
      AudioSystem.playLaser();
      const orbitEntity = e.target.parentNode;
      if (orbitEntity && orbitEntity.components['explodable']) {
        orbitEntity.components['explodable'].explode();
      }
    });

    // VR: triggerdown on a hand with laser-controls
    scene.addEventListener('triggerdown', (e) => {
      const handEl = e.target;
      if (!handEl.components || !handEl.components['laser-controls']) return;
      AudioSystem.init();
      AudioSystem.playLaser();
      this.fireLaser(handEl);
    });

    // Set up laser beam visuals once scene loads
    scene.addEventListener('loaded', () => {
      this._setupLaserBeams();
    });
  },

  _setupLaserBeams() {
    ['#left-hand', '#right-hand'].forEach((sel) => {
      const handEl = document.querySelector(sel);
      if (!handEl) return;

      const beam = document.createElement('a-cylinder');
      beam.setAttribute('radius', '0.008');
      beam.setAttribute('height', '6');
      beam.setAttribute('color', '#00ffff');
      beam.setAttribute('emissive', '#00ffff');
      beam.setAttribute('emissive-intensity', '2');
      beam.setAttribute('material', 'transparent: true; opacity: 0.85');
      beam.setAttribute('position', '0 0 -3');
      beam.setAttribute('rotation', '90 0 0');
      beam.setAttribute('visible', 'false');
      handEl.appendChild(beam);
      handEl._laserBeam = beam;
    });
  },

  fireLaser(handEl) {
    // Flash the laser beam
    const beam = handEl._laserBeam;
    if (beam) {
      beam.setAttribute('visible', 'true');
      setTimeout(() => beam.setAttribute('visible', 'false'), 160);
    }

    // Check raycaster intersections
    const raycaster = handEl.components.raycaster;
    if (!raycaster) return;
    const hits = raycaster.intersectedEls;
    if (!hits || hits.length === 0) return;

    const hitEl = hits[0];
    if (!hitEl.classList.contains('shootable')) return;
    const orbitEntity = hitEl.parentNode;
    if (orbitEntity && orbitEntity.components['explodable']) {
      orbitEntity.components['explodable'].explode();
    }
  },
});
