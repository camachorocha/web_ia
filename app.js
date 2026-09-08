const demoCars = [
  { name: 'Mazda CX-5', year: '2021', km: '42,180 km', price: 19800, owners: 1, type: 'menos20', image: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=900&q=80' },
  { name: 'Toyota GR86', year: '2022', km: '18,940 km', price: 28900, owners: 1, type: '20a35', image: 'https://images.unsplash.com/photo-1584345604329-be647b5279f4?auto=format&fit=crop&w=900&q=80' },
  { name: 'Audi RS 5', year: '2023', km: '9,120 km', price: 58900, owners: 1, type: 'mas35', image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=900&q=80' },
  { name: 'Honda Civic Sport', year: '2020', km: '51,400 km', price: 18400, owners: 2, type: 'menos20', image: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?auto=format&fit=crop&w=900&q=80' },
  { name: 'Ford Bronco', year: '2022', km: '31,050 km', price: 34700, owners: 1, type: '20a35', image: 'https://images.unsplash.com/photo-1631088994000-049a56d58e44?auto=format&fit=crop&w=900&q=80' },
  { name: 'Porsche 718 Cayman', year: '2021', km: '22,300 km', price: 64900, owners: 1, type: 'mas35', image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80' }
];

const grid = document.querySelector('#carGrid');
const stage = document.querySelector('.hero-stage');
const aiScreen = document.querySelector('#ia');
const aiPanel = document.querySelector('.ai-panel');
const form = document.querySelector('#aiForm');
const input = document.querySelector('#questionInput');
const askButton = document.querySelector('#askButton');
const conversation = document.querySelector('#aiConversation');
let isRequestPending = false;
let hasStartedChat = false;

function renderCars(filter = 'todos') {
  const visibleCars = filter === 'todos'
    ? demoCars.slice(0, 3)
    : demoCars.filter((car) => car.type === filter);

  grid.innerHTML = visibleCars.map((car) => `
    <article class="car-card">
      <div class="car-image">
        <img src="${car.image}" alt="${car.name}" />
        <span class="tag">DEMO M1</span>
      </div>
      <div class="car-details">
        <h3>${car.name}</h3>
        <p>${car.year} &nbsp;•&nbsp; ${car.km} &nbsp;•&nbsp; ${car.owners} dueño${car.owners > 1 ? 's' : ''}</p>
        <div class="car-price">
          <strong>$${car.price.toLocaleString('en-US')}</strong>
          <button type="button" class="car-question" data-question="Cuéntame qué debo considerar al comparar un ${car.name} ${car.year}." aria-label="Preguntar sobre ${car.name}">↗</button>
        </div>
      </div>
    </article>
  `).join('');
}

function setAiOpen(isOpen) {
  stage.classList.toggle('ai-open', isOpen);
  aiScreen.setAttribute('aria-hidden', String(!isOpen));
  if (isOpen) window.setTimeout(() => input.focus(), 150);
}

function apiUrl(path) {
  const baseUrl = (window.M1_CONFIG?.API_BASE_URL || '').replace(/\/$/, '');
  return `${baseUrl}${path}`;
}

function setPending(pending) {
  isRequestPending = pending;
  askButton.disabled = pending;
  input.disabled = pending;
  document.querySelectorAll('.quick-prompts button').forEach((button) => {
    button.disabled = pending;
  });
}

function addMessage(text, type) {
  const message = document.createElement('div');
  message.className = `message ${type}-message`;

  const label = document.createElement('span');
  label.className = 'message-label';
  label.textContent = type === 'user' ? 'TÚ' : 'M1 IA';

  const paragraph = document.createElement('p');
  paragraph.textContent = text;

  message.append(label, paragraph);
  conversation.appendChild(message);
  conversation.scrollTop = conversation.scrollHeight;
  return paragraph;
}

function startChatLayout() {
  if (hasStartedChat) return;
  hasStartedChat = true;
  aiPanel.classList.add('chat-started');
  aiScreen.classList.add('chat-started');
}

async function askM1(question) {
  const message = question.trim();
  if (!message || isRequestPending) return;

  startChatLayout();
  addMessage(message, 'user');
  input.value = '';
  setPending(true);
  const assistantMessage = addMessage('M1 IA está pensando...', 'assistant');

  try {
    const response = await fetch(apiUrl('/api/chat'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Chat request failed (${response.status})`);
    }

    if (!data.reply || typeof data.reply !== 'string') {
      throw new Error('Invalid chat response');
    }

    assistantMessage.textContent = data.reply;
  } catch (error) {
    console.error('M1 IA error:', error);
    assistantMessage.textContent = error.message || 'No pude procesar tu pregunta en este momento.';
  } finally {
    setPending(false);
    input.focus();
    conversation.scrollTop = conversation.scrollHeight;
  }
}

renderCars();

document.querySelectorAll('[data-open-ai]').forEach((button) => {
  button.addEventListener('click', () => setAiOpen(true));
});

document.querySelectorAll('[data-close-ai]').forEach((button) => {
  button.addEventListener('click', () => setAiOpen(false));
});

document.querySelectorAll('.budget-tabs button').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelector('.budget-tabs .active').classList.remove('active');
    button.classList.add('active');
    renderCars(button.dataset.budget);
  });
});

document.querySelectorAll('.quick-prompts button').forEach((button) => {
  button.addEventListener('click', () => askM1(button.textContent));
});

grid.addEventListener('click', (event) => {
  const button = event.target.closest('.car-question');
  if (button) {
    setAiOpen(true);
    askM1(button.dataset.question);
  }
});

/* En cuanto el usuario empieza a escribir, cambia a la vista de conversación. */
input.addEventListener('input', () => {
  if (input.value.trim()) startChatLayout();
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  askM1(input.value);
});
