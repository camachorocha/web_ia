const cars = [
  { name: 'Mazda CX-5', year: '2021', km: '42,180 km', price: 19800, owners: 1, type: 'menos20', image: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=900&q=80' },
  { name: 'Toyota GR86', year: '2022', km: '18,940 km', price: 28900, owners: 1, type: '20a35', image: 'https://images.unsplash.com/photo-1584345604329-be647b5279f4?auto=format&fit=crop&w=900&q=80' },
  { name: 'Audi RS 5', year: '2023', km: '9,120 km', price: 58900, owners: 1, type: 'mas35', image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=900&q=80' },
  { name: 'Honda Civic Sport', year: '2020', km: '51,400 km', price: 18400, owners: 2, type: 'menos20', image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=900&q=80' },
  { name: 'Ford Bronco', year: '2022', km: '31,050 km', price: 34700, owners: 1, type: '20a35', image: 'https://images.unsplash.com/photo-1631088994000-049a56d58e44?auto=format&fit=crop&w=900&q=80' },
  { name: 'Porsche 718 Cayman', year: '2021', km: '22,300 km', price: 64900, owners: 1, type: 'mas35', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80' }
];
const grid = document.querySelector('#carGrid');
function renderCars(filter = 'todos') { const visible = filter === 'todos' ? cars.slice(0, 3) : cars.filter(car => car.type === filter); grid.innerHTML = visible.map(car => `<article class="car-card"><div class="car-image"><img src="${car.image}" alt="${car.name}" /><span class="tag">VERIFICADO M1</span></div><div class="car-details"><h3>${car.name}</h3><p>${car.year} &nbsp;•&nbsp; ${car.km} &nbsp;•&nbsp; ${car.owners} dueño${car.owners > 1 ? 's' : ''}</p><div class="car-price"><strong>$${car.price.toLocaleString('en-US')}</strong><a href="#ia" aria-label="Consultar ${car.name}">↗</a></div></div></article>`).join(''); }
renderCars();
document.querySelectorAll('.budget-tabs button').forEach(button => button.addEventListener('click', () => { document.querySelector('.budget-tabs .active').classList.remove('active'); button.classList.add('active'); renderCars(button.dataset.budget); }));
const reply = document.querySelector('#aiReply');
function answer(question) { const q = question.toLowerCase(); if (!question.trim()) return; if (q.includes('dueño')) reply.textContent = 'M1 IA: El Mazda CX-5 2021 tiene 1 dueño registrado y un historial de mantenimiento verificado.'; else if (q.includes('suv') || q.includes('25')) reply.textContent = 'M1 IA: Te recomiendo el Mazda CX-5 2021. Está por debajo de $20K, tiene 1 dueño y es ideal para ciudad y viajes.'; else if (q.includes('ciudad')) reply.textContent = 'M1 IA: Para ciudad, el Mazda CX-5 ofrece gran visibilidad, buen consumo y un tamaño muy fácil de manejar.'; else reply.textContent = 'M1 IA: Puedo ayudarte con año, dueños, kilometraje, historial y opciones según tu presupuesto. ¿Qué auto tienes en mente?'; }
document.querySelectorAll('.quick-prompts button').forEach(button => button.addEventListener('click', () => answer(button.textContent)));
document.querySelector('#askButton').addEventListener('click', () => answer(document.querySelector('#questionInput').value));
document.querySelector('#questionInput').addEventListener('keydown', event => { if (event.key === 'Enter') answer(event.target.value); });
