const states = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT Abuja', 'Gombe',
  'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
  'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto',
  'Taraba', 'Yobe', 'Zamfara'
];

const clinics = Array.isArray(window.FERTINAIJA_CLINICS) ? window.FERTINAIJA_CLINICS : [];
const expertChannelUrl = 'https://t.me/fertinaija';
const privacyCookieName = 'fertinaija_privacy_choice';
const directoryPreferenceKey = 'fertinaija_directory_state';

const topicMessages = {
  surrogacy: 'Some private surrogacy arrangements may include agreed expenses, support or compensation for the significant time and pregnancy commitment involved. Terms vary, and you should receive independent medical and legal advice before agreeing to anything.',
  'egg donation': 'Some private egg-donor programmes reimburse expenses and compensate eligible donors for time, inconvenience, risk and commitment. Screening, medication, monitoring and egg retrieval are medical processes that a qualified clinic must explain before you consent.',
  'sperm donation': 'Some active sperm-donor programmes compensate eligible participants. Availability, screening, privacy rules, frequency and reward terms vary by programme, so confirm everything directly before travelling.',
  clinic: 'FertiNaija provides a selected public directory across several Nigerian states. Choose your state to see relevant listings. No clinic is automatically recommended, and a listing does not imply affiliation.',
  arrived: 'Welcome. If you are physically at a facility, open the expert chat and say: “I have arrived.” A coordinator can help you organise your questions but cannot speak for the clinic or make medical decisions.'
};

const guideShell = document.querySelector('.guide-shell');
const messages = document.getElementById('guideMessages');
const composer = document.getElementById('guideComposer');
const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('nav');
const toast = document.querySelector('.toast');
const clinicDirectory = document.getElementById('clinicDirectory');
const clinicStateFilters = document.getElementById('clinicStateFilters');
const clinicResultSummary = document.getElementById('clinicResultSummary');
const clinicEmpty = document.getElementById('clinicEmpty');
const privacyBanner = document.getElementById('privacyBanner');
let currentTopic = null;
let selectedState = null;
let selectedClinic = null;
let lastFocused = null;
let activeDirectoryState = '';

function getCookie(name) {
  const prefix = `${encodeURIComponent(name)}=`;
  const match = document.cookie.split('; ').find(item => item.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : '';
}

function getPrivacyChoice() {
  return getCookie(privacyCookieName);
}

function readSavedDirectoryState() {
  if (getPrivacyChoice() !== 'preferences') return '';
  try {
    const state = window.localStorage.getItem(directoryPreferenceKey) || '';
    return clinics.some(clinic => clinic.state === state) ? state : '';
  } catch {
    return '';
  }
}

function saveDirectoryState() {
  if (getPrivacyChoice() !== 'preferences') return;
  try {
    if (activeDirectoryState) window.localStorage.setItem(directoryPreferenceKey, activeDirectoryState);
    else window.localStorage.removeItem(directoryPreferenceKey);
  } catch {
    // The directory still works when browser storage is unavailable.
  }
}

function setPrivacyChoice(choice) {
  const safeChoice = choice === 'preferences' ? 'preferences' : 'essential';
  document.cookie = `${encodeURIComponent(privacyCookieName)}=${encodeURIComponent(safeChoice)}; Max-Age=31536000; Path=/; SameSite=Lax; Secure`;
  if (safeChoice === 'preferences') {
    saveDirectoryState();
  } else {
    try { window.localStorage.removeItem(directoryPreferenceKey); } catch {}
  }
  privacyBanner.hidden = true;
  track('pe_fertinaija_privacy_choice', { choice: safeChoice });
}

function showPrivacyChoices() {
  privacyBanner.hidden = false;
  privacyBanner.querySelector('[data-privacy-choice="essential"]').focus();
}

function initializePrivacyChoices() {
  if (!getPrivacyChoice() && navigator.globalPrivacyControl === true) {
    setPrivacyChoice('essential');
    return;
  }
  privacyBanner.hidden = Boolean(getPrivacyChoice());
}

function track(name, properties = {}) {
  window.dispatchEvent(new CustomEvent('fertinaija:interaction', { detail: { name, properties } }));
}

function showToast(text) {
  toast.textContent = text;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 3000);
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

function createLink(label, href, className = '') {
  const link = document.createElement('a');
  link.textContent = label;
  link.href = href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  if (className) link.className = className;
  return link;
}

function createClinicCard(clinic) {
  const article = document.createElement('article');
  article.className = `directory-card${clinic.reward ? ' has-reward-info' : ''}`;
  article.dataset.state = clinic.state;

  const meta = document.createElement('div');
  meta.className = 'directory-card-meta';
  const state = document.createElement('span');
  state.textContent = clinic.state;
  const source = document.createElement('span');
  source.textContent = clinic.sourceLabel;
  meta.append(state, source);

  const heading = document.createElement('h3');
  heading.textContent = clinic.name;

  const address = document.createElement('p');
  address.className = 'directory-address';
  address.textContent = clinic.address;

  const services = document.createElement('p');
  services.className = 'directory-services';
  services.textContent = clinic.services;

  article.append(meta, heading, address, services);

  if (clinic.reward) {
    const reward = document.createElement('div');
    reward.className = 'directory-reward';
    const rewardLabel = document.createElement('strong');
    rewardLabel.textContent = 'Published reward information';
    const rewardText = document.createElement('p');
    rewardText.textContent = clinic.reward;
    reward.append(rewardLabel, rewardText, createLink('Read the programme terms →', clinic.rewardSourceUrl));
    article.appendChild(reward);
  } else {
    const prompt = document.createElement('p');
    prompt.className = 'directory-reward-prompt';
    prompt.textContent = 'Ask the clinic whether it currently has a donor or surrogacy programme and request complete reward terms before travelling.';
    article.appendChild(prompt);
  }

  const actions = document.createElement('div');
  actions.className = 'directory-card-actions';
  const expertButton = document.createElement('button');
  expertButton.type = 'button';
  expertButton.textContent = 'Ask an expert';
  expertButton.dataset.clinicExpert = clinic.name;
  actions.append(
    expertButton,
    createLink('View public source', clinic.sourceUrl),
    createLink('Open map', `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clinic.address)}`)
  );

  const disclaimer = document.createElement('small');
  disclaimer.textContent = 'Independent public listing. No partnership, ranking, programme availability, acceptance or payment is implied.';
  article.append(actions, disclaimer);
  return article;
}

function getFilteredClinics() {
  return clinics.filter(clinic => !activeDirectoryState || clinic.state === activeDirectoryState);
}

function updateLocationFilterState() {
  clinicStateFilters.querySelectorAll('[data-directory-state]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.directoryState === activeDirectoryState));
  });
}

function renderLocationFilters() {
  const listedStates = [...new Set(clinics.map(clinic => clinic.state))].sort((a, b) => a.localeCompare(b));
  clinicStateFilters.innerHTML = '';
  [{ label: 'All locations', state: '' }, ...listedStates.map(state => ({ label: state, state }))].forEach(item => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'location-filter';
    button.textContent = item.label;
    button.dataset.directoryState = item.state;
    button.setAttribute('aria-pressed', String(item.state === activeDirectoryState));
    clinicStateFilters.appendChild(button);
  });
}

function renderClinicDirectory() {
  const matches = getFilteredClinics();
  clinicDirectory.innerHTML = '';
  matches.forEach(clinic => clinicDirectory.appendChild(createClinicCard(clinic)));
  clinicEmpty.hidden = matches.length > 0;
  clinicDirectory.hidden = matches.length === 0;

  const scope = activeDirectoryState ? ` in ${activeDirectoryState}` : ' across all listed locations';
  clinicResultSummary.textContent = `${matches.length} clinic listing${matches.length === 1 ? '' : 's'}${scope}.`;
  updateLocationFilterState();
  track('pe_fertinaija_directory_filter', { state: activeDirectoryState || 'all', results: String(matches.length) });
  return matches.length;
}

function showClinicsForState(state, scroll = true) {
  activeDirectoryState = state;
  saveDirectoryState();
  const count = renderClinicDirectory();
  if (scroll) document.getElementById('locations').scrollIntoView({ behavior: 'smooth', block: 'start' });
  return count;
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
    const count = showClinicsForState(selectedState, false);
    const resultText = count
      ? `I found ${count} selected public clinic listing${count === 1 ? '' : 's'} in ${selectedState}. No clinic is automatically preferred. You can compare them or ask an opportunity expert what to verify.`
      : `We do not yet have a featured listing for ${selectedState}. You can use the nationwide AFRH registry or ask an opportunity expert to help you review public options.`;
    addMessage(resultText);
    track('pe_fertinaija_location_check', { state: selectedState, directory_results: String(count) });
    renderChoices([
      { label: count ? `Open ${selectedState} clinic listings` : 'Open the clinic directory', value: 'directory' },
      { label: 'Talk to an opportunity expert', value: 'support' },
      { label: 'I have arrived', value: 'arrived' }
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
  if (value === 'directory') {
    closeGuide();
    document.getElementById('locations').scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }
  if (value === 'location') {
    addMessage(label, 'user');
    addMessage('Choose your Nigerian state. This selection stays in this browser session unless you choose to share it with an expert. We do not request precise GPS location.');
    renderLocationCheck();
    return;
  }

  currentTopic = value;
  addMessage(label, 'user');
  addMessage(topicMessages[value]);
  track('pe_fertinaija_guide_topic', { topic: value });

  if (value === 'clinic') {
    if (selectedState) {
      const count = showClinicsForState(selectedState, false);
      addMessage(count ? `${count} listings are ready for ${selectedState}.` : `No featured listing is available for ${selectedState} yet.`);
      renderChoices([
        { label: 'Open clinic directory', value: 'directory' },
        { label: 'Change my state', value: 'location' },
        { label: 'Talk to an opportunity expert', value: 'support' }
      ]);
    } else {
      addMessage('Select your state so the directory can show relevant public listings rather than defaulting to one clinic.');
      renderLocationCheck();
    }
    return;
  }
  if (value === 'arrived') {
    renderChoices([{ label: 'Open expert chat', value: 'support' }, { label: 'Find this clinic in the directory', value: 'directory' }]);
    return;
  }
  renderChoices([
    { label: 'Check clinics in my state', value: 'location' },
    { label: 'Talk to an opportunity expert', value: 'support' }
  ]);
}

function resetGuide(topic) {
  messages.innerHTML = '';
  composer.innerHTML = '';
  currentTopic = null;
  selectedState = null;
  selectedClinic = null;
  addMessage('Hi. I am the FertiNaija automated opportunity guide. I can explain possible rewards, show public clinics based on your state and connect you with an authorised human coordinator. What would you like to explore?');
  renderChoices([
    { label: 'Surrogacy', value: 'surrogacy' },
    { label: 'Egg donation', value: 'egg donation' },
    { label: 'Sperm donation', value: 'sperm donation' },
    { label: 'Find clinics near me', value: 'clinic' },
    { label: 'Talk to an opportunity expert', value: 'support' }
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

function openSupport(clinicName = null) {
  selectedClinic = clinicName;
  closeGuide();
  track('pe_fertinaija_expert_handoff', {
    topic: currentTopic || 'general',
    state: selectedState || 'not_shared',
    clinic: selectedClinic || 'not_selected'
  });

  const expertWindow = window.open(expertChannelUrl, '_blank', 'noopener,noreferrer');
  showToast(expertWindow ? 'Opening the FertiNaija Telegram channel.' : 'Allow pop-ups to open the FertiNaija Telegram channel.');
}

clinicStateFilters.addEventListener('click', event => {
  const button = event.target.closest('[data-directory-state]');
  if (!button) return;
  activeDirectoryState = button.dataset.directoryState;
  saveDirectoryState();
  renderClinicDirectory();
});
clinicDirectory.addEventListener('click', event => {
  const button = event.target.closest('[data-clinic-expert]');
  if (button) openSupport(button.dataset.clinicExpert);
});
activeDirectoryState = readSavedDirectoryState();
renderLocationFilters();
renderClinicDirectory();
initializePrivacyChoices();

document.querySelectorAll('[data-open-guide]').forEach(button => button.addEventListener('click', () => openGuide()));
document.querySelectorAll('[data-topic]').forEach(button => button.addEventListener('click', () => openGuide(button.dataset.topic)));
document.querySelectorAll('[data-arrived]').forEach(button => button.addEventListener('click', () => openGuide('arrived')));
document.querySelectorAll('[data-close-guide]').forEach(button => button.addEventListener('click', closeGuide));
document.querySelectorAll('[data-open-support]').forEach(button => button.addEventListener('click', () => openSupport()));
document.querySelectorAll('[data-open-privacy-choices]').forEach(button => button.addEventListener('click', showPrivacyChoices));
document.querySelectorAll('[data-privacy-choice]').forEach(button => button.addEventListener('click', () => setPrivacyChoice(button.dataset.privacyChoice)));

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
