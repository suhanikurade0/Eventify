// Load events and render on events page
async function loadEvents() {
  try {
    const res = await fetch('assets/events.json');
    const events = await res.json();
    renderEvents(events);
    populateEventSelect(events);
    // Search/filter
    const search = document.getElementById('search');
    const category = document.getElementById('category');
    if (search && category) {
      const applyFilter = () => {
        const q = (search.value || '').toLowerCase();
        const c = category.value;
        const filtered = events.filter(e =>
          (!c || e.category === c) &&
          (e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || e.location.toLowerCase().includes(q))
        );
        renderEvents(filtered);
      };
      search.addEventListener('input', applyFilter);
      category.addEventListener('change', applyFilter);
    }
  } catch (e) {
    console.error('Failed to load events.json', e);
  }
}

function renderEvents(list) {
  const grid = document.getElementById('events-grid');
  if (!grid) return;
  grid.innerHTML = '';
  if (!list.length) {
    grid.innerHTML = '<p>No events found.</p>';
    return;
  }
  list.forEach(e => {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.innerHTML = `
      <img src="${e.image}" alt="${e.category} image"/>
      <div class="tile-body">
        <span class="badge">${e.category}</span>
        <h4>${e.title}</h4>
        <p>${e.description}</p>
        <small>📍 ${e.location} • 📅 ${e.date}</small>
      </div>`;
    grid.appendChild(tile);
  });
}

function populateEventSelect(list) {
  const select = document.getElementById('event-select');
  if (!select) return;
  select.innerHTML = '<option value="">Select an event</option>';
  list.forEach(e => {
    const opt = document.createElement('option');
    opt.value = e.title;
    opt.textContent = `${e.title} (${e.date})`;
    select.appendChild(opt);
  });
}

// Create event UI (no backend)
const createForm = document.getElementById('create-event-form');
if (createForm) {
  const preview = document.getElementById('preview');
  createForm.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const form = new FormData(createForm);
    const item = Object.fromEntries(form.entries());
    const div = document.createElement('div');
    div.className = 'tile';
    div.innerHTML = `
      <img src="${item.image}" alt="${item.category} image"/>
      <div class="tile-body">
        <span class="badge">${item.category}</span>
        <h4>${item.title}</h4>
        <p>${item.description}</p>
        <small>📍 ${item.location} • 📅 ${item.date}</small>
      </div>`;
    preview.appendChild(div);
    createForm.reset();
  });

  const exportBtn = document.getElementById('export-json');
  exportBtn.addEventListener('click', () => {
    const tiles = preview.querySelectorAll('.tile');
    const data = [];
    tiles.forEach(t => {
      const title = t.querySelector('h4').textContent;
      const description = t.querySelector('p').textContent;
      const badge = t.querySelector('.badge').textContent;
      const small = t.querySelector('small').textContent;
      const image = t.querySelector('img').getAttribute('src');
      const [location, date] = small.replace('📍 ','').split(' • 📅 ');
      data.push({ title, description, category: badge, location, date, image });
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'events-export.json';
    a.click();
    URL.revokeObjectURL(url);
  });
}

// Register form (save simple pass)
const regForm = document.getElementById('register-form');
if (regForm) {
  regForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(regForm).entries());
    if (!data.event) return alert('Please select an event');
    document.getElementById('ticket-name').textContent = `Name: ${data.name}`;
    document.getElementById('ticket-event').textContent = `Event: ${data.event}`;
    const code = 'PASS-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    document.getElementById('ticket-code').textContent = `Code: ${code}`;
    document.getElementById('ticket').classList.remove('hidden');
  });

  const dl = document.getElementById('download-pass');
  dl.addEventListener('click', () => {
    const content = [
      document.getElementById('ticket-name').textContent,
      document.getElementById('ticket-event').textContent,
      document.getElementById('ticket-code').textContent
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Eventify_Pass.txt';
    a.click();
    URL.revokeObjectURL(url);
  });
}

// On load
document.addEventListener('DOMContentLoaded', () => {
  loadEvents();
});
