const COLORS = ['#e94560', '#0f3460', '#533483', '#4cc3d9', '#ffc65d', '#ef2d5e', '#7bc8a4'];

function withFade(el, toOpacity) {
  el.setAttribute('opacity', '0');
  el.setAttribute('animation__in', `property: opacity; to: ${toOpacity}; dur: 250; easing: easeOutQuad; startEvents: fadeIn`);
  el.setAttribute('animation__out', `property: opacity; to: 0;           dur: 200; easing: easeInQuad;  startEvents: fadeOut`);
  return el;
}

AFRAME.registerComponent('person-column', {
  schema: {
    name: { type: 'string' },
    age: { type: 'number' },
    color: { type: 'color' },
  },

  init() {
    const { name, age, color } = this.data;
    const height = Math.max(0.3, (age / 100) * 4);

    const box = document.createElement('a-box');
    box.setAttribute('id', `box-${name.toLowerCase()}`);
    box.setAttribute('position', `0 ${height / 2} 0`);
    box.setAttribute('width', '1.2');
    box.setAttribute('depth', '1.2');
    box.setAttribute('height', height);
    box.setAttribute('color', color);
    box.setAttribute('roughness', '0.4');
    box.setAttribute('metalness', '0.3');
    box.setAttribute('animation__hover-in', 'property: scale; to: 1.08 1.08 1.08; dur: 150; startEvents: mouseenter; easing: easeOutQuad');
    box.setAttribute('animation__hover-out', 'property: scale; to: 1 1 1;           dur: 150; startEvents: mouseleave; easing: easeInQuad');
    box.classList.add('interactive');

    const tooltip = document.createElement('a-entity');
    tooltip.setAttribute('id', `tooltip-${name.toLowerCase()}`);
    tooltip.setAttribute('position', `0 ${height + 1.2} 0`);

    const bg = withFade(document.createElement('a-plane'), 0.75);
    bg.setAttribute('color', '#000000');
    bg.setAttribute('width', '1.8');
    bg.setAttribute('height', '0.7');
    bg.setAttribute('position', '0 0 -0.01');

    const nameEl = withFade(document.createElement('a-text'), 1);
    nameEl.setAttribute('value', name || 'Unknown');
    nameEl.setAttribute('align', 'center');
    nameEl.setAttribute('color', '#ffffff');
    nameEl.setAttribute('scale', '1.2 1.2 1.2');
    nameEl.setAttribute('position', '0 0.12 0');

    const ageEl = withFade(document.createElement('a-text'), 1);
    ageEl.setAttribute('value', `Age: ${age}`);
    ageEl.setAttribute('align', 'center');
    ageEl.setAttribute('color', color);
    ageEl.setAttribute('position', '0 -0.12 0');

    tooltip.append(bg, nameEl, ageEl);
    this.el.append(box, tooltip);

    const tooltipEls = [bg, nameEl, ageEl];

    box.addEventListener('mouseenter', () => {
      tooltipEls.forEach(el => el.emit('fadeIn'));
      box.setAttribute('emissive', color);
      box.setAttribute('emissive-intensity', '0.3');
    });

    box.addEventListener('mouseleave', () => {
      tooltipEls.forEach(el => el.emit('fadeOut'));
      box.setAttribute('emissive', '#000000');
      box.setAttribute('emissive-intensity', '0');
    });

    box.addEventListener('click', () => {
      document.querySelector('#sky').setAttribute('color', color);
      const panel = document.querySelector('#info-panel');
      panel.setAttribute('visible', 'true');
      panel.querySelector('[data-role="name"]').setAttribute('value', name);
      panel.querySelector('[data-role="age"]').setAttribute('value', `Age: ${age}`);
      panel.querySelector('[data-role="age"]').setAttribute('color', color);
    });
  },
});

AFRAME.registerPrimitive('a-person-column', {
  defaultComponents: { 'person-column': {} },
  mappings: {
    name: 'person-column.name',
    age: 'person-column.age',
    color: 'person-column.color',
  },
});

document.querySelector('a-scene').addEventListener('loaded', async () => {
  const loading = document.getElementById('loading');
  try {
    const res = await fetch('/data/people.json');
    const people = await res.json();
    console.log(`Loaded ${people.length} people from local JSON:`, people);

    const container = document.getElementById('people-container');
    const spacing = 2.5;
    const offset = ((people.length - 1) * spacing) / 2;

    people.forEach((person, i) => {
      const el = document.createElement('a-person-column');
      el.setAttribute('id', `person-${person.name.toLowerCase()}`);
      el.setAttribute('name', person.name);
      el.setAttribute('age', person.age);
      el.setAttribute('color', COLORS[i % COLORS.length]);
      el.setAttribute('position', `${i * spacing - offset} 0 -5`);
      container.appendChild(el);
    });

    loading.style.display = 'none';
  } catch (err) {
    console.error(err);
    loading.textContent = `Error: ${err.message}`;
    loading.style.color = '#e94560';
  }
});
