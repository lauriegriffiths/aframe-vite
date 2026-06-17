Parse.initialize(import.meta.env.VITE_BACK4APP_APP_ID, import.meta.env.VITE_BACK4APP_JS_KEY);
Parse.serverURL = 'https://parseapi.back4app.com';

const COLORS = ['#e94560', '#0f3460', '#533483', '#4cc3d9', '#ffc65d', '#ef2d5e', '#7bc8a4'];

function withFade(el, toOpacity) {
  el.setAttribute('opacity', '0');
  el.setAttribute('animation__in',  `property: opacity; to: ${toOpacity}; dur: 250; easing: easeOutQuad; startEvents: fadeIn`);
  el.setAttribute('animation__out', `property: opacity; to: 0;           dur: 200; easing: easeInQuad;  startEvents: fadeOut`);
  return el;
}

AFRAME.registerComponent('person-column', {
  schema: {
    name:  { type: 'string' },
    age:   { type: 'number' },
    color: { type: 'color'  },
  },

  init() {
    const { name, age, color } = this.data;
    const height = Math.max(0.3, (age / 100) * 4);

    const box = document.createElement('a-box');
    box.setAttribute('position', `0 ${height / 2} 0`);
    box.setAttribute('width', '1.2');
    box.setAttribute('depth', '1.2');
    box.setAttribute('height', height);
    box.setAttribute('color', color);
    box.setAttribute('roughness', '0.4');
    box.setAttribute('metalness', '0.3');
    box.classList.add('interactive');

    const tooltip = document.createElement('a-entity');
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
  },
});

document.querySelector('a-scene').addEventListener('loaded', async () => {
  const loading = document.getElementById('loading');
  try {
    const query = new Parse.Query('person');
    query.limit(20);
    const results = await query.find();
    const people = results.map(obj => ({ name: obj.get('name'), age: obj.get('age') }));
    console.log(`Fetched ${people.length} people from Back4App:`, people);

    if (!people.length) {
      loading.textContent = 'No people found in database.';
      return;
    }

    const container = document.getElementById('people-container');
    const spacing = 2.5;
    const offset = ((people.length - 1) * spacing) / 2;

    people.forEach((person, i) => {
      const el = document.createElement('a-entity');
      el.setAttribute('person-column', { name: person.name, age: person.age, color: COLORS[i % COLORS.length] });
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
