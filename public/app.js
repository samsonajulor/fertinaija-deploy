const states = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT Abuja', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
  'Taraba', 'Yobe', 'Zamfara'
];

const topicMessages = {
  surrogacy: 'Surrogacy can involve significant medical, legal, emotional and time commitments. A clinic must explain its current programme and determine eligibility. We can help you prepare the questions to ask.',
  'egg donation': 'Egg donation normally involves medical screening, medication, monitoring and a retrieval procedure. It is not risk-free, and a qualified clinic must explain the risks before you consent.',
  'sperm donation': 'Sperm-donation programmes usually set their own screening, testing and privacy rules. Availability varies, so you should confirm the current programme directly before travelling.',
  clinic: 'We currently provide a verified public listing for Havilland Fertility Clinic in Omole Phase 1, Ojodu, Lagos. FertiNaija is not affiliated with the clinic and does not make appointments.',
  arrived: 'Welcome. If you are physically at the facility, open the support-team chat and send: “I have arrived.” A coordinator can help you organise your questions, but cannot speak for the clinic.'
};

const guideShell = document.querySelector('.guide-shell');
const messages = document.getElementById('guideMessages');
const composer = document.getElementById('guideComposer');
const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('nav');
const toast = document.querySelector('.toast');
let currentTopic = null;
let selectedState = null;
let lastFocused = null;

function track(name, properties = {}) {
  window._hsq = window._hsq || [];
  window._hsq.push(['trackCustomBehavioralEvent', { name, properties }]);
}

function showToast(text) {
  toast.textContent = text;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 2600);
}

function addMessage(text, type = 'guide') {
  const message = document.createElement('div');
  message.className = `message ${type === 'user' ? 'user' : ''}`;
  message.textContent = text;
  messages.appendChild(message);
  messages.scrollTop = messages.scrollHeight;
}

function renderChoices(items) {
  composer.innerHTML = '';
  const wrapper = document.createElement('div');
  wrapper.className = 'guide-choices';
  items.forEach(({ label, value }) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'guide-choice';
    button.textContent = label;
    button.addEventListener('click', () => chooseTopic(value, label));
    wrapper.appendChild(button);
  });
  composer.appendChild(wrapper);
}

function renderLocationCheck() {
  composer.innerHTML = '';
  const form = document.createElement('div');
  form.className = 'location-form';
  const select = document.createElement('select');
  select.setAttribute('aria-label', 'Select your Nigerian state');
  select.innerHTML = '<option value="">Select your state</option>' + states.map(state => `<option value="${state}">${state}</option>`).join('');
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Continue';
  button.addEventListener('click', () => {
    if (!select.value) {
      showToast('Select your state to continue.');
      return;
    }
    selectedState = select.value;
    addMessage(select.value, 'user');
    addMessage(`Thanks. We have recorded only this session-level location check: ${select.value}, Nigeria. It does not verify identity, residence or medical eligibility.`);
    track('pe_fertinaija_location_check', { state: selectedState });
    renderChoices([
      { label: 'View supported location', value: 'clinic' },
      { label: 'I have arrived', value: 'arrived' },
      { label: 'Talk to support', value: 'support' }
    ]);
  });
  form.append(select, button);
  composer.appendChild(form);
}

function chooseTopic(value, label) {
  if (value === 'support') {
    openSupport();
    return;
  }
  if (value === 'map') {
    addMessage(label, 'user');
    track('pe_fertinaija_map_opened', { topic: currentTopic || 'general' });
    window.open('https://www.google.com/maps/search/?api=1&query=305A+Titilayo+Adedoyin+Street+Omole+Phase+1+Ojodu+Lagos', '_blank', 'noopener,noreferrer');
    renderChoices([{ label: 'I have arrived', value: 'arrived' }, { label: 'Talk to support', value: 'support' }]);
    return;
  }
  if (value === 'location') {
    addMessage(label, 'user');
    addMessage('Choose the Nigerian state you are currently in. This selection stays in this browser session unless you choose to tell a coordinator.');
    renderLocationCheck();
    return;
  }

  currentTopic = value;
  addMessage(label, 'user');
  addMessage(topicMessages[value]);
  track('pe_fertinaija_guide_topic', { topic: value });

  if (value === 'clinic') {
    renderChoices([
      { label: 'Check my Nigeria location', value: 'location' },
      { label: 'Open the map', value: 'map' },
      { label: 'Talk to support', value: 'support' }
    ]);
    return;
  }
  if (value === 'arrived') {
    renderChoices([{ label: 'Open support-team chat', value: 'support' }, { label: 'View the map', value: 'map' }]);
    return;
  }
  renderChoices([
    { label: 'Check my Nigeria location', value: 'location' },
    { label: 'See a public clinic listing', value: 'clinic' },
    { label: 'Talk to support', value: 'support' }
  ]);
}

function resetGuide(topic) {
  messages.innerHTML = '';
  composer.innerHTML = '';
  currentTopic = null;
  selectedState = null;
  addMessage('Hi. I am the FertiNaija automated guide. I can explain the general journey and connect you with an authorised human coordinator. What would you like to explore?');
  renderChoices([
    { label: 'Surrogacy', value: 'surrogacy' },
    { label: 'Egg donation', value: 'egg donation' },
    { label: 'Sperm donation', value: 'sperm donation' },
    { label: 'Find a clinic', value: 'clinic' },
    { label: 'I have arrived', value: 'arrived' }
  ]);
  if (topic) {
    const normalized = topic.toLowerCase();
    window.setTimeout(() => chooseTopic(normalized, topic), 180);
  }
}

function openGuide(topic) {
  lastFocused = document.activeElement;
  guideShell.classList.add('open');
  guideShell.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  resetGuide(topic);
  guideShell.querySelector('[data-close-guide]').focus();
  track('pe_fertinaija_guide_opened', { source: topic || 'general' });
}

function closeGuide() {
  guideShell.classList.remove('open');
  guideShell.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lastFocused) lastFocused.focus();
}

function openSupport() {
  const context = [
    currentTopic ? `Interest: ${currentTopic}` : null,
    selectedState ? `Current state: ${selectedState}` : null,
    currentTopic === 'arrived' ? 'Status: I have arrived at the facility' : null
  ].filter(Boolean).join('\n');

  if (context && navigator.clipboard) {
    navigator.clipboard.writeText(context).catch(() => {});
  }

  closeGuide();
  track('pe_fertinaija_support_handoff', { topic: currentTopic || 'general', state: selectedState || 'not_shared' });

  if (window.HubSpotConversations?.widget) {
    window.HubSpotConversations.widget.open();
    showToast(context ? 'Your journey summary was copied. Paste it into the private chat.' : 'Private support chat opened.');
    return;
  }

  showToast('The support team chat is still loading. Please try again shortly.');
  window.setTimeout(() => {
    if (window.HubSpotConversations?.widget) window.HubSpotConversations.widget.open();
  }, 1800);
}

document.querySelectorAll('[data-open-guide]').forEach(button => button.addEventListener('click', () => openGuide()));
document.querySelectorAll('[data-topic]').forEach(button => button.addEventListener('click', () => openGuide(button.dataset.topic)));
document.querySelectorAll('[data-arrived]').forEach(button => button.addEventListener('click', () => openGuide('arrived')));
document.querySelectorAll('[data-close-guide]').forEach(button => button.addEventListener('click', closeGuide));
document.querySelectorAll('[data-open-support]').forEach(button => button.addEventListener('click', openSupport));

menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});
nav.querySelectorAll('a, button').forEach(item => item.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && guideShell.classList.contains('open')) closeGuide();
});

window.hsConversationsOnReady = window.hsConversationsOnReady || [];
window.hsConversationsOnReady.push(() => track('pe_fertinaija_support_ready'));
