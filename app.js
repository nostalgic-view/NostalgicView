/* ============================================================
   ★ НАСТРОЙКИ ★
   ============================================================ */
const DONATE_URL = 'https://boosty.to/nostalgicview/donate';
const SUPABASE_URL = 'https://ygtbmacfyilybtfwpjaf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlndGJtYWNmeWlseWJ0ZndwamFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5Njk3NjcsImV4cCI6MjEwNjU0NTc2N30.igr2riaeAzh5HOhZ_WE16UnC8lknJTGdlGZta7GWcCY';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let myProfile = null;
let currentProfile = null;

const CHAT_COOLDOWN_MS = 1000;
const ZVUK_VOLUME = 0.6;
const RUB_PER_PRYANIK = 1.2;

const GIFTS = [
  { id: 'rose',    icon: '', name: '',    price: 999  },
  { id: 'cake',    icon: '', name: '',  price: 999  },
  { id: 'star',    icon: '', name: '',  price: 999 },
  { id: 'diamond', icon: '', name: '',   price: 999 },
  { id: 'cup',     icon: '', name: '',   price: 999 },
  { id: 'heart',   icon: '', name: '',  price: 999 }
];

const NICK_SHOP = [
  { id: 'rainbow', type: 'class', cls: 'nick-rainbow', category: 'color', name: 'Радужный',  price: 100, desc: 'Переливается всеми цветами радуги' },
  { id: 'gold',    type: 'class', cls: 'nick-gold',    category: 'color', name: 'Золотой',   price: 200, desc: 'Золотой блеск, как на погонах' },
  { id: 'neon',    type: 'class', cls: 'nick-neon',    category: 'color', name: 'Неоновый',  price: 150, desc: 'Сине-фиолетовое неоновое свечение' },
  { id: 'fire',    type: 'class', cls: 'nick-fire',    category: 'color', name: 'Огненный',  price: 120, desc: 'Пылающий ник, как костёр в ночи' },
  { id: 'ice',     type: 'class', cls: 'nick-ice',     category: 'color', name: 'Ледяной',   price: 120, desc: 'Холодный ледяной отблеск' },

  { id: 'camo_1', type: 'camo', camoNum: 1, category: 'camo', name: 'ВСР-93',          price: 100, desc: 'Барвиха, Вертикалка, Арбуз' },
  { id: 'camo_2', type: 'camo', camoNum: 2, category: 'camo', name: 'Берёзка серебряный лист', price: 100, desc: 'Классическая берёзка, камуфляж погранцов или разведчиков' },
  { id: 'camo_3', type: 'camo', camoNum: 3, category: 'camo', name: 'ВСР-98',            price: 100, desc: 'Легендарная общевойсковая флора' },
  { id: 'camo_4', type: 'camo', camoNum: 4, category: 'camo', name: 'Бутан',                   price: 100, desc: 'Дубок, мабуте такое не выдавали' },
  { id: 'camo_5', type: 'camo', camoNum: 5, category: 'camo', name: 'Цифра',                   price: 100, desc: 'Соверменный камуфляж ВС РФ' },
  { id: 'camo_6', type: 'camo', camoNum: 6, category: 'camo', name: 'Вудланд',                 price: 100, desc: 'Старый камуфляж пендосов' },
  { id: 'camo_7', type: 'camo', camoNum: 7, category: 'camo', name: 'Камыш синий',             price: 100, desc: 'ОМОН такое носил' },
  { id: 'camo_8', type: 'camo', camoNum: 8, category: 'camo', name: 'Берёзка бронзовый лист',  price: 100, desc: 'Более версия берёзки' }
];

const PET_BREEDS = [
  { id: 'cat_dvor',  type: 'pet', petNum: 1, category: 'pets', name: 'Дворовая кошка',   price: 300, desc: 'Дворовая, Без породы' },
//  { id: 'cat_sib',   type: 'pet', petNum: 2, category: 'pets', name: 'Сибирская кошка',  price: 400, desc: 'Пушистая, с характером. Уважает только деда' },
//  { id: 'cat_brit',  type: 'pet', petNum: 3, category: 'pets', name: 'Британская кошка', price: 500, desc: 'Плюшевая порода, любит спать на подоконнике' },
//  { id: 'dog_dvor',  type: 'pet', petNum: 4, category: 'pets', name: 'Дворовый пёс',     price: 350, desc: 'Верный друг, охраняет КПП по ночам' },
//  { id: 'dog_ovch',  type: 'pet', petNum: 5, category: 'pets', name: 'Овчарка',          price: 550, desc: 'Служебная собака, знает команды «сидеть» и «фас»' },
//  { id: 'dog_husky', type: 'pet', petNum: 6, category: 'pets', name: 'Хаски',            price: 600, desc: 'Северный пёс, любит снег и внимание' }
];

/* ============================================================
   1. Автопоиск картинок
   ============================================================ */
function candidateList(baseNames) {
  const exts = ['jpg','jpeg','png','gif','webp','bmp','JPG','JPEG','PNG','GIF','WEBP','BMP'];
  const list = [];
  baseNames.forEach(n => exts.forEach(e => list.push(n + '.' + e)));
  return list;
}
function findImage(imgEl, baseNames, onFail) {
  if (!imgEl) return;
  const list = candidateList(baseNames);
  let i = 0;
  imgEl.onerror = function () {
    i++;
    if (i < list.length) this.src = list[i];
    else if (onFail) onFail(this);
  };
  imgEl.src = list[0];
}

findImage(document.getElementById('logoImg'), ['Logo', 'logo', 'LOGO'],
  el => { el.style.display = 'none'; el.parentNode.textContent = 'ЛОГО'; });
findImage(document.getElementById('fonImg'), ['Fon', 'fon', 'FON']);
findImage(document.getElementById('armeykafonImg'),
  ['armeykafon', 'Armeykafon', 'ARMEYKAFON'],
  (el) => { const w = el.closest('.main-photo'); if (w) w.classList.add('empty'); });

let pryanikIconSrc = null;
const pryanikIconEl = document.getElementById('pryanikIcon');
if (pryanikIconEl) {
  pryanikIconEl.addEventListener('load', () => {
    pryanikIconSrc = pryanikIconEl.src;
    const shopPanel = document.getElementById('panel-shop');
    if (shopPanel && shopPanel.classList.contains('active')) renderShop();
  });
}
findImage(pryanikIconEl, ['valuta', 'Valuta', 'VALUTA'], el => {
  el.style.display = 'none';
  pryanikIconSrc = null;
});

function pryanikImgHtml(size) {
  if (!pryanikIconSrc) return '';
  const px = size || 16;
  return '<img class="pryanik-img" src="' + esc(pryanikIconSrc) + '" ' +
         'style="width:' + px + 'px;height:' + px + 'px;" alt="">';
}

/* ============================================================
   2. Zvuk
   ============================================================ */
const zvukAudio = new Audio();
let zvukReady = false;
(function findZvuk() {
  const exts  = ['mp3','wav','ogg','m4a','aac','opus','webm','MP3','WAV','OGG','M4A','AAC'];
  const bases = ['Zvuk', 'zvuk', 'ZVUK'];
  const list  = [];
  bases.forEach(b => exts.forEach(e => list.push(b + '.' + e)));
  let i = 0;
  zvukAudio.preload = 'auto';
  zvukAudio.onerror = function () {
    i++;
    if (i < list.length) zvukAudio.src = list[i];
    else zvukReady = false;
  };
  zvukAudio.oncanplaythrough = () => { zvukReady = true; };
  zvukAudio.src = list[0];
})();

function playZvuk() {
  if (!zvukReady) return;
  try {
    zvukAudio.currentTime = 0;
    zvukAudio.volume = ZVUK_VOLUME;
    const p = zvukAudio.play();
    if (p && p.catch) p.catch(() => {});
  } catch (e) {}
}

document.addEventListener('click', function unlockZvuk() {
  try {
    const p = zvukAudio.play();
    if (p && p.then) p.then(() => zvukAudio.pause()).catch(()=>{});
    else zvukAudio.pause();
  } catch(e){}
  document.removeEventListener('click', unlockZvuk);
}, { once: true });

/* ============================================================
   3. Часы
   ============================================================ */
(function buildClockDial() {
  const dial = document.getElementById('clockDial');
  if (!dial) return;
  for (let i = 0; i < 60; i++) {
    const t = document.createElement('div');
    const major = (i % 5 === 0);
    t.className = 'wall-clock-tick' + (major ? ' major' : '');
    const angle = i * 6;
    const radius = major ? 62 : 64;
    t.style.transform = 'rotate(' + angle + 'deg) translateY(-' + radius + 'px)';
    dial.appendChild(t);
  }
  for (let i = 1; i <= 12; i++) {
    const n = document.createElement('div');
    n.className = 'wall-clock-num';
    n.textContent = i;
    const angle = i * 30;
    n.style.transform = 'rotate(' + angle + 'deg) translateY(-46px) rotate(-' + angle + 'deg)';
    dial.appendChild(n);
  }
})();

const clockHourEl   = document.getElementById('clockHour');
const clockMinuteEl = document.getElementById('clockMinute');
const clockSecondEl = document.getElementById('clockSecond');

function tickClock() {
  const now = new Date();
  const h = now.getHours() % 12;
  const m = now.getMinutes();
  const s = now.getSeconds();
  const ms = now.getMilliseconds();
  const secAngle  = (s + ms / 1000) * 6;
  const minAngle  = (m + s / 60) * 6;
  const hourAngle = (h + m / 60 + s / 3600) * 30;
  if (clockHourEl)   clockHourEl.style.transform   = 'rotate(' + hourAngle + 'deg)';
  if (clockMinuteEl) clockMinuteEl.style.transform = 'rotate(' + minAngle + 'deg)';
  if (clockSecondEl) clockSecondEl.style.transform = 'rotate(' + secAngle + 'deg)';
  requestAnimationFrame(tickClock);
}
requestAnimationFrame(tickClock);

/* ============================================================
   3.5. Армейские объявления (отбой / подъём)
   ============================================================ */
let lastAnnouncedHour = -1;

function showArmyAnnouncement(text, ms) {
  const el = document.getElementById('armyAnnouncement');
  if (!el) return;
  el.textContent = text;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), ms || 25000);
}

function checkArmyAnnouncement() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();

  // Сброс флага, когда ушли из «объявленного» часа
  if (h !== 22 && h !== 6) {
    lastAnnouncedHour = -1;
    return;
  }

  if (m !== 0) return;
  if (lastAnnouncedHour === h) return;

  lastAnnouncedHour = h;
  if (h === 22) showArmyAnnouncement('Рота, отбой!');
  else          showArmyAnnouncement('Рота, подъём!');
}

// Проверяем сразу при загрузке и потом каждые 10 секунд
checkArmyAnnouncement();
setInterval(checkArmyAnnouncement, 10000);

/* ============================================================
   4. Пользователи
   ============================================================ */
function getMe() { return myProfile; }

async function loadMyProfile() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) { myProfile = null; return; }
  const { data } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();
  myProfile = data || null;
  if (myProfile) {
    avatarCache.set(myProfile.login, myProfile.avatar || null);
    nickStyleCache.set(myProfile.login, myProfile.nick_style || null);
  }
}

async function findUser(login) {
  const { data } = await supabaseClient
    .from('profiles')
    .select('*')
    .ilike('login', login)
    .maybeSingle();
  return data || null;
}

/* ============================================================
   5. Модалка авторизации
   ============================================================ */
let modalMode = 'login';
const overlay = document.getElementById('modalOverlay');
const mTitle  = document.getElementById('modalTitle');
const mHint   = document.getElementById('mHint');
const mErr    = document.getElementById('mError');
const mSubmit = document.getElementById('mSubmit');
const mForm   = document.getElementById('modalForm');

function openModal(mode) {
  modalMode = mode;
  mTitle.textContent = mode === 'login' ? 'Вход' : 'Регистрация';
  mSubmit.textContent = mode === 'login' ? 'Войти' : 'Создать аккаунт';
  if (mHint) mHint.style.display = mode === 'register' ? '' : 'none';
  mErr.textContent = '';
  mForm.reset();
  overlay.classList.add('open');
  setTimeout(() => document.getElementById('mLogin').focus(), 50);
}
function closeModal() {
  overlay.classList.remove('open');
  mErr.textContent = '';
}
overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (overlay.classList.contains('open')) closeModal();
    const tu = document.getElementById('topUpModal');
    if (tu && tu.classList.contains('open')) closeTopUp();
    const gm = document.getElementById('giftModal');
    if (gm && gm.classList.contains('open')) closeGift();
    const dm = document.getElementById('dmModal');
    if (dm && dm.classList.contains('open')) closeDM();
    const pm = document.getElementById('petNameModal');
    if (pm && pm.classList.contains('open')) closePetName();
    const gvm = document.getElementById('giftsModal');
    if (gvm && gvm.classList.contains('open')) closeGiftsModal();
  }
});

async function submitAuth(e) {
  e.preventDefault();
  mErr.textContent = '';
  const login = document.getElementById('mLogin').value.trim();
  const password = document.getElementById('mPassword').value;

  if (login.length < 3) { mErr.textContent = 'Ник минимум 3 символа'; return; }
  if (!/^[a-zA-Z0-9_а-яА-ЯёЁ]+$/.test(login)) { mErr.textContent = 'Только буквы, цифры и _'; return; }
  if (password.length < 6) { mErr.textContent = 'Пароль минимум 6 символов'; return; }

  const fakeEmail = login.toLowerCase() + '@nostalgicview.local';

  if (modalMode === 'register') {
    const { data: exist } = await supabaseClient
      .from('profiles')
      .select('login')
      .ilike('login', login)
      .maybeSingle();
    if (exist) { mErr.textContent = 'Такой ник уже занят'; return; }

    const { data, error } = await supabaseClient.auth.signUp({
      email: fakeEmail,
      password: password,
      options: { data: { login: login } }
    });

    if (error) { mErr.textContent = error.message; return; }
    if (!data.session) {
      mErr.textContent = 'Не удалось создать аккаунт. Проверь Supabase.';
      return;
    }
    closeModal();
    await loadMyProfile();
    await renderAll();
  } else {
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('login')
      .ilike('login', login)
      .maybeSingle();
    if (!profile) { mErr.textContent = 'Неверный ник или пароль'; return; }

    const loginEmail = profile.login.toLowerCase() + '@nostalgicview.local';
    const { error } = await supabaseClient.auth.signInWithPassword({
      email: loginEmail,
      password: password
    });
    if (error) { mErr.textContent = 'Неверный ник или пароль'; return; }
    closeModal();
    await loadMyProfile();
    await renderAll();
  }
}

async function logout() {
  await supabaseClient.auth.signOut();
  myProfile = null;
  currentProfile = null;
  stopPetWalk();
  await renderAll();
  switchTab('main', true);
}

/* ============================================================
   6. Смена аватара
   ============================================================ */
async function changeAvatar(evt) {
  const file = evt.target.files && evt.target.files[0];
  evt.target.value = '';
  if (!file || !myProfile) return;
  if (!file.type.startsWith('image/')) { alert('Это не картинка'); return; }
  if (file.size > 2 * 1024 * 1024) { alert('Максимум 2 МБ'); return; }

  const path = `${myProfile.id}/avatar`;

  const { error: upErr } = await supabaseClient.storage
    .from('avatars')
    .upload(path, file, { upsert: true, cacheControl: '3600', contentType: file.type });
  if (upErr) { alert('Ошибка загрузки: ' + upErr.message); return; }

  const { data: pub } = supabaseClient.storage.from('avatars').getPublicUrl(path);
  const url = pub.publicUrl + '?v=' + Date.now();

  const { error: dbErr } = await supabaseClient
    .from('profiles').update({ avatar: url }).eq('id', myProfile.id);
  if (dbErr) { alert('Ошибка: ' + dbErr.message); return; }

  invalidateAvatar(myProfile.login);
  await loadMyProfile();
  if (currentProfile && currentProfile.id === myProfile.id) currentProfile = myProfile;
  await renderAll();
}

/* ============================================================
   7. Утилита
   ============================================================ */
function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

const avatarCache = new Map();
const nickStyleCache = new Map();
const camoImageCache = new Map();
const petImageCache  = new Map();
const camoNums = [1,2,3,4,5,6,7,8];
let defaultAvatarUrl;
let myOwnedItems = new Set();

function invalidateAvatar(login) {
  if (login) avatarCache.delete(login);
}

async function prefetchAvatars(logins) {
  const missing = [...new Set(logins)].filter(l => l && !avatarCache.has(l));
  if (!missing.length) return;
  const { data } = await supabaseClient
    .from('profiles').select('login, avatar, nick_style').in('login', missing);
  const found = new Set();
  (data || []).forEach(p => {
    avatarCache.set(p.login, p.avatar || null);
    nickStyleCache.set(p.login, p.nick_style || null);
    found.add(p.login);
  });
  missing.forEach(l => {
    if (!found.has(l)) {
      avatarCache.set(l, null);
      nickStyleCache.set(l, null);
    }
  });
}

function testImage(url) {
  return new Promise(res => {
    const i = new Image();
    i.onload = () => res(true);
    i.onerror = () => res(false);
    i.src = url;
  });
}

async function resolveDefaultAvatar() {
  if (defaultAvatarUrl !== undefined) return defaultAvatarUrl;
  for (const e of ['png','jpg','jpeg','webp','gif']) {
    const url = 'Avatar.' + e;
    if (await testImage(url)) { defaultAvatarUrl = url; return url; }
  }
  defaultAvatarUrl = null;
  return null;
}

async function preloadCamoImages() {
  for (const n of camoNums) {
    for (const ext of ['jpg','jpeg','png','webp','gif']) {
      const url = `kamuflyazh/${n}.${ext}`;
      if (await testImage(url)) { camoImageCache.set(n, url); break; }
    }
    if (!camoImageCache.has(n)) camoImageCache.set(n, null);
  }
}

const pawImage  = { url: null };
const loveImage = { url: null };
const starImage = { url: null };

async function preloadPetImages() {
  for (const b of PET_BREEDS) {
    let found = null;
    for (const ext of ['png','gif','webp','jpg','jpeg']) {
      const url = `pets/${b.petNum}.${ext}`;
      if (await testImage(url)) { found = url; break; }
    }
    petImageCache.set(b.id, found);
  }
  for (const ext of ['png','gif','webp','jpg','jpeg']) {
    const url = `pets/paw.${ext}`;
    if (await testImage(url)) { pawImage.url = url; break; }
  }
  for (const ext of ['png','gif','webp','jpg','jpeg']) {
    const url = `pets/love.${ext}`;
    if (await testImage(url)) { loveImage.url = url; break; }
  }
  for (const ext of ['png','gif','webp','jpg','jpeg']) {
    const url = `pets/star.${ext}`;
    if (await testImage(url)) { starImage.url = url; break; }
  }
}

const PET_DECAY = {
  hunger: 4,
  mood:   3,
  energy: 8,
  sleepRestore: 12,
  offlineEnergy: 8
};

function nickHtml(login) {
  const safe = esc(login);
  const styleId = nickStyleCache.get(login);
  if (!styleId) return safe;
  const item = NICK_SHOP.find(i => i.id === styleId);
  if (!item) return safe;
  if (item.type === 'class') {
    return `<span class="nick ${item.cls}">${safe}</span>`;
  }
  if (item.type === 'camo') {
    const url = camoImageCache.get(item.camoNum);
    if (!url) return safe;
    return `<span class="nick nick-camo" style="--camo-url:url('${url}')">${safe}</span>`;
  }
  return safe;
}

/* ============================================================
   8. Верхний правый угол
   ============================================================ */
async function renderUserArea() {
  const area = document.getElementById('userArea');
  const me = getMe();

  if (!me) {
    area.innerHTML = `
      <button class="aero-btn green small" onclick="openModal('login')">Вход</button>
      <button class="aero-btn green small" onclick="openModal('register')">Регистрация</button>
    `;
    return;
  }

  area.innerHTML = `
    <label class="avatar-wrap" id="avatarWrap" title="Моя страничка">
      <img id="userAvatarImg" alt="">
      <input type="file" accept="image/*" hidden onchange="changeAvatar(event)">
    </label>
    <span class="uname">${nickHtml(me.login)}</span>
    <button class="logout-x" type="button" title="Выйти" onclick="logout()">×</button>
  `;

  document.getElementById('avatarWrap').addEventListener('click', (e) => {
    e.preventDefault();
    openProfile(me.login);
  });

  const img = document.getElementById('userAvatarImg');
  const wrap = document.getElementById('avatarWrap');

  const src = me.avatar || (await resolveDefaultAvatar());
  if (src) {
    img.src = src;
    img.style.display = '';
  } else {
    img.style.display = 'none';
    wrap.classList.add('empty');
    wrap.dataset.initial = (me.login[0] || '?').toUpperCase();
  }
}

function renderPryanikChip() {
  const chip = document.getElementById('pryanikChip');
  const cnt  = document.getElementById('pryanikCount');
  const me = getMe();
  if (!chip) return;
  if (!me) { chip.style.display = 'none'; return; }
  chip.style.display = 'flex';
  cnt.textContent = me.pryaniki ?? 0;
}

/* ============================================================
   9. Профиль
   ============================================================ */
let bioEditMode = false;

async function openProfile(login) {
  const me = getMe();
  if (!me) { openModal('login'); return; }
  const user = await findUser(login);
  if (!user) return;
  currentProfile = user;
  avatarCache.set(user.login, user.avatar || null);
  nickStyleCache.set(user.login, user.nick_style || null);
  bioEditMode = false;
  switchTab('profile', false);
  await renderProfile();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeProfile() {
  currentProfile = null;
  switchTab('main', true);
}

async function getRelation(otherId) {
  const me = getMe();
  if (!me) return 'guest';
  if (me.id === otherId) return 'me';

  const { data } = await supabaseClient
    .from('friendships')
    .select('*')
    .or(`and(user_id.eq.${me.id},friend_id.eq.${otherId}),and(user_id.eq.${otherId},friend_id.eq.${me.id})`)
    .maybeSingle();

  if (!data) return 'none';
  if (data.status === 'accepted') return 'friend';
  if (data.user_id === me.id) return 'outgoing';
  return 'incoming';
}

async function renderProfile() {
  const me = getMe();
  const nameEl    = document.getElementById('profileName');
  const bioEl     = document.getElementById('profileBio');
  const pAvatar   = document.getElementById('profileAvatar');
  const pImg      = document.getElementById('profileAvatarImg');
  const actions   = document.getElementById('bioActions');
  const friendBox = document.getElementById('profileActions');
  const titleEl   = document.getElementById('profilePanelTitle');
  const lsWrap    = document.getElementById('lsBtnWrap');
  const friendsSec= document.getElementById('friendsSection');
  const invSec    = document.getElementById('inventorySection');

  const user = currentProfile;

  if (!me || !user) {
    titleEl.textContent = 'Моя страничка';
    nameEl.textContent = 'Гость';
    bioEl.textContent = 'Войдите, чтобы увидеть свою страничку.';
    bioEl.classList.add('empty');
    bioEl.classList.remove('editable');
    bioEl.onclick = null;
    pAvatar.classList.add('empty', 'not-own');
    pAvatar.dataset.initial = '?';
    pImg.style.display = 'none';
    actions.style.display = 'none';
    friendBox.innerHTML = '';
    lsWrap.innerHTML = '';
    friendsSec.innerHTML = '';
    if (invSec) invSec.innerHTML = '';
    const gbw = document.getElementById('giftsBtnWrap');
    if (gbw) gbw.innerHTML = '';
    return;
  }

  const isOwn = (user.id === me.id);

  titleEl.textContent = isOwn ? 'Моя страничка' : ('Профиль ' + user.login);
  nameEl.innerHTML = nickHtml(user.login);

  pAvatar.classList.toggle('not-own', !isOwn);
  const src = user.avatar || (await resolveDefaultAvatar());
  if (src) {
    pImg.src = src;
    pImg.style.display = '';
    pAvatar.classList.remove('empty');
    pAvatar.dataset.initial = '';
  } else {
    pImg.style.display = 'none';
    pImg.removeAttribute('src');
    pAvatar.classList.add('empty');
    pAvatar.dataset.initial = (user.login[0] || '?').toUpperCase();
  }

  // Кнопка «Подарки» под аватаркой
  const giftsBtnWrap = document.getElementById('giftsBtnWrap');
  if (giftsBtnWrap) {
    giftsBtnWrap.innerHTML = '';
    const gBtn = document.createElement('button');
    gBtn.type = 'button';
    gBtn.className = 'aero-btn small';
    gBtn.textContent = 'Подарки';
    gBtn.addEventListener('click', () => openGiftsModal(user.login));
    giftsBtnWrap.appendChild(gBtn);
  }

  if (!bioEditMode) {
    actions.style.display = 'none';
    if (user.bio && user.bio.trim()) {
      bioEl.textContent = user.bio;
      bioEl.classList.remove('empty');
    } else {
      bioEl.textContent = isOwn
        ? 'Нажми, чтобы написать описание о себе...'
        : (user.login + ' пока ничего о себе не написал(а).');
      bioEl.classList.add('empty');
    }
    if (isOwn) {
      bioEl.classList.add('editable');
      bioEl.onclick = startBioEdit;
    } else {
      bioEl.classList.remove('editable');
      bioEl.onclick = null;
    }
  }

  friendBox.innerHTML = '';
  lsWrap.innerHTML = '';
  friendsSec.innerHTML = '';
  if (invSec) invSec.innerHTML = '';

  if (!isOwn) {
    const rel = await getRelation(user.id);
    if (rel === 'none') {
      friendBox.appendChild(makeFriendBtn('+', 'Добавить в друзья', 'green', () => relationAction(user)));
    } else if (rel === 'outgoing') {
      friendBox.appendChild(makeFriendBtn('✕', 'Отменить заявку', 'red', () => relationAction(user)));
    } else if (rel === 'incoming') {
      friendBox.appendChild(makeFriendBtn('✓', 'Принять в друзья', 'green', () => relationAction(user)));
    } else if (rel === 'friend') {
      friendBox.appendChild(makeFriendBtn('✕', 'Удалить из друзей', 'red', () => relationAction(user)));
    }

    const giftBtn = document.createElement('button');
    giftBtn.type = 'button';
    giftBtn.className = 'friend-btn gift';
    giftBtn.textContent = '🎁';
    giftBtn.title = 'Подарить подарок';
    giftBtn.addEventListener('click', () => openGift(user.login));
    friendBox.appendChild(giftBtn);

    const lsBtn = document.createElement('button');
    lsBtn.type = 'button';
    lsBtn.className = 'ls-btn';
    lsBtn.textContent = '✉ Личные сообщения';
    lsBtn.addEventListener('click', () => openDM(user.login));
    lsWrap.appendChild(lsBtn);
  } else {
    await renderInventory();
    await buildFriendsSection(friendsSec, me);
  }
}

function makeFriendBtn(label, title, color, onClick) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'friend-btn' + (color === 'red' ? ' red' : '');
  btn.textContent = label;
  btn.title = title;
  btn.addEventListener('click', onClick);
  return btn;
}

async function buildFriendsSection(container, me) {
  container.innerHTML = '';

  const { data: rels } = await supabaseClient
    .from('friendships')
    .select('*')
    .or(`user_id.eq.${me.id},friend_id.eq.${me.id}`)
    .eq('status', 'accepted');
  const friendIds = (rels || []).map(r => r.user_id === me.id ? r.friend_id : r.user_id);

  const { data: inc } = await supabaseClient
    .from('friendships')
    .select('*')
    .eq('friend_id', me.id)
    .eq('status', 'pending');
  const incomingIds = (inc || []).map(r => r.user_id);

  const allIds = [...new Set([...friendIds, ...incomingIds])];
  let usersMap = {};
  if (allIds.length > 0) {
    const { data: users } = await supabaseClient
      .from('profiles')
      .select('id, login, avatar')
      .in('id', allIds);
    (users || []).forEach(u => { usersMap[u.id] = u; });
  }

  const wrap = document.createElement('div');
  wrap.className = 'friends-section';

  const friendsPane = document.createElement('div');
  friendsPane.className = 'friends-pane';
  friendsPane.innerHTML = '<h3>Друзья</h3>';
  const frList = document.createElement('div');
  if (friendIds.length === 0) {
    frList.innerHTML = '<div class="empty-note">Пока никого</div>';
  } else {
    friendIds.forEach(id => {
      const u = usersMap[id];
      if (u) frList.appendChild(buildFriendRow(u, 'friend'));
    });
  }
  friendsPane.appendChild(frList);

  const reqPane = document.createElement('div');
  reqPane.className = 'friends-pane';
  reqPane.innerHTML = '<h3>Заявки</h3>';
  const reqList = document.createElement('div');
  if (incomingIds.length === 0) {
    reqList.innerHTML = '<div class="empty-note">Заявок нет</div>';
  } else {
    incomingIds.forEach(id => {
      const u = usersMap[id];
      if (u) reqList.appendChild(buildFriendRow(u, 'incoming'));
    });
  }
  reqPane.appendChild(reqList);

  wrap.appendChild(friendsPane);
  wrap.appendChild(reqPane);
  container.appendChild(wrap);
}

function buildFriendRow(user, kind) {
  const row = document.createElement('div');
  row.className = 'friend-row';

  const av = document.createElement('div');
  av.className = 'fr-avatar';
  av.textContent = (user.login[0] || '?').toUpperCase();
  if (user.avatar) {
    const img = document.createElement('img');
    img.src = user.avatar;
    av.textContent = '';
    av.appendChild(img);
  }

  const name = document.createElement('span');
  name.className = 'fr-name';
  name.innerHTML = nickHtml(user.login);
  name.addEventListener('click', () => openProfile(user.login));

  row.appendChild(av);
  row.appendChild(name);

  if (kind === 'incoming') {
    const ok = document.createElement('button');
    ok.type = 'button';
    ok.className = 'mini-ok';
    ok.textContent = '✓';
    ok.title = 'Принять заявку';
    ok.addEventListener('click', () => acceptFriend(user.id));
    row.appendChild(ok);

    const x = document.createElement('button');
    x.type = 'button';
    x.className = 'mini-x';
    x.textContent = '✕';
    x.title = 'Отклонить';
    x.addEventListener('click', () => rejectIncoming(user.id));
    row.appendChild(x);
  } else {
    const x = document.createElement('button');
    x.type = 'button';
    x.className = 'mini-x';
    x.textContent = '✕';
    x.title = 'Удалить из друзей';
    x.addEventListener('click', () => removeFriend(user.id));
    row.appendChild(x);
  }

  return row;
}

async function relationAction(user) {
  const me = getMe();
  if (!me || !user) return;
  const rel = await getRelation(user.id);

  if (rel === 'none') {
    const { error } = await supabaseClient
      .from('friendships')
      .insert({ user_id: me.id, friend_id: user.id, status: 'pending' });
    if (error) { alert('Ошибка: ' + error.message); return; }
  } else if (rel === 'outgoing') {
    await supabaseClient.from('friendships')
      .delete().eq('user_id', me.id).eq('friend_id', user.id);
  } else if (rel === 'incoming') {
    await supabaseClient.from('friendships')
      .update({ status: 'accepted' })
      .eq('user_id', user.id).eq('friend_id', me.id);
  } else if (rel === 'friend') {
    await removeFriend(user.id);
    return;
  }

  await renderProfile();
}

async function acceptFriend(otherId) {
  const me = getMe();
  if (!me) return;
  await supabaseClient.from('friendships')
    .update({ status: 'accepted' })
    .eq('user_id', otherId).eq('friend_id', me.id);
  await renderProfile();
}

async function removeFriend(otherId) {
  const me = getMe();
  if (!me) return;
  await supabaseClient.from('friendships')
    .delete()
    .or(`and(user_id.eq.${me.id},friend_id.eq.${otherId}),and(user_id.eq.${otherId},friend_id.eq.${me.id})`);
  await renderProfile();
}

async function rejectIncoming(otherId) {
  const me = getMe();
  if (!me) return;
  await supabaseClient.from('friendships')
    .delete().eq('user_id', otherId).eq('friend_id', me.id);
  await renderProfile();
}

function startBioEdit() {
  const me = getMe();
  if (!me || !currentProfile || currentProfile.id !== me.id) return;
  if (bioEditMode) return;
  bioEditMode = true;

  const bioEl = document.getElementById('profileBio');
  const actions = document.getElementById('bioActions');

  bioEl.classList.remove('empty');
  bioEl.classList.remove('editable');
  bioEl.onclick = null;
  bioEl.innerHTML = '';
  const ta = document.createElement('textarea');
  ta.id = 'bioTextarea';
  ta.maxLength = 500;
  ta.placeholder = 'Расскажи о себе...';
  ta.value = me.bio || '';
  bioEl.appendChild(ta);
  actions.style.display = 'flex';
  ta.focus();
  ta.setSelectionRange(ta.value.length, ta.value.length);
}

async function saveBio() {
  const me = getMe();
  if (!me) return;
  const ta = document.getElementById('bioTextarea');
  const text = ta ? ta.value.trim().slice(0, 500) : '';
  const { error } = await supabaseClient
    .from('profiles')
    .update({ bio: text })
    .eq('id', me.id);
  if (error) { alert('Ошибка: ' + error.message); return; }
  await loadMyProfile();
  if (myProfile) currentProfile = myProfile;
  bioEditMode = false;
  await renderProfile();
}

function cancelBioEdit() {
  bioEditMode = false;
  renderProfile();
}

/* ============================================================
   10. Чат
   ============================================================ */
let chatMessages = [];
let chatSubscribed = false;
let lastSentAt = 0;
let cooldownTimer = null;

function renderChatAccess() {
  const me = getMe();
  const whoInput = document.getElementById('chatWho');
  const textInput = document.getElementById('chatText');
  const sendBtn = document.getElementById('chatSend');

  if (me) {
    whoInput.value = me.login;
    whoInput.readOnly = true;
    textInput.disabled = false;
    textInput.placeholder = 'Сообщение...';
    sendBtn.disabled = false;
  } else {
    whoInput.value = '';
    whoInput.placeholder = 'Войди, чтобы писать';
    whoInput.readOnly = true;
    textInput.disabled = true;
    textInput.value = '';
    textInput.placeholder = 'Сначала войдите';
    sendBtn.disabled = true;
  }
}

async function loadChatMessages() {
  const { data } = await supabaseClient
    .from('chat_messages')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(200);
  chatMessages = data || [];
}

async function renderChat() {
  const list = document.getElementById('chatList');
  const me = getMe();

  if (!chatMessages.length) {
    list.innerHTML = '<div style="color:#7a94b0;text-align:center;padding:20px;font-style:italic;">Сообщений пока нет.</div>';
    return;
  }

  const logins = [...new Set(chatMessages.map(m => m.login))];
  await prefetchAvatars(logins);
  const fallback = await resolveDefaultAvatar();

  list.innerHTML = chatMessages.map(m => {
    const d = new Date(m.created_at);
    const when = d.toLocaleString('ru-RU', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' });
    const own = me && m.login === me.login;
    const initial = (m.login[0] || '?').toUpperCase();
    const src = avatarCache.get(m.login) || fallback || '';
    const imgHtml = src ? `<img src="${esc(src)}" alt="">` : '';

    return `<div class="msg${own ? ' own' : ''}">
      <div class="msg-avatar" data-initial="${esc(initial)}" data-login="${esc(m.login)}" title="Открыть профиль ${esc(m.login)}">
        ${imgHtml}
      </div>
      <div class="msg-bubble">
        <div class="msg-head">
          <span class="who" data-login="${esc(m.login)}">${nickHtml(m.login)}</span>
          <span class="when">${when}</span>
        </div>
        <div class="msg-text">${esc(m.text)}</div>
      </div>
    </div>`;
  }).join('');

  list.querySelectorAll('.msg-avatar').forEach(el => {
    el.addEventListener('click', e => { e.stopPropagation(); openProfile(el.dataset.login); });
  });
  list.querySelectorAll('.who[data-login]').forEach(el => {
    el.addEventListener('click', e => { e.stopPropagation(); openProfile(el.dataset.login); });
  });

  list.scrollTop = list.scrollHeight;
}

async function sendMsg(e) {
  e.preventDefault();
  const me = getMe();
  if (!me) { openModal('login'); return; }

  const now = Date.now();
  const left = CHAT_COOLDOWN_MS - (now - lastSentAt);
  if (left > 0) { showCooldown(left); return; }

  const textEl = document.getElementById('chatText');
  const text = textEl.value.trim();
  if (!text) { textEl.focus(); return; }

  textEl.value = '';
  textEl.focus();
  playZvuk();

  const { error } = await supabaseClient.from('chat_messages').insert({
    user_id: me.id,
    login: me.login,
    text: text
  });
  if (error) { alert('Ошибка: ' + error.message); return; }

  lastSentAt = Date.now();
  lockChatButton();
  startCooldownTimer();
}

function lockChatButton() {
  const btn = document.getElementById('chatSend');
  const txt = document.getElementById('chatText');
  if (btn) btn.disabled = true;
  if (txt) txt.disabled = true;
}
function unlockChatButton() {
  const me = getMe();
  if (!me) return;
  const btn = document.getElementById('chatSend');
  const txt = document.getElementById('chatText');
  if (btn) btn.disabled = false;
  if (txt) txt.disabled = false;
}

function startCooldownTimer() {
  if (cooldownTimer) clearInterval(cooldownTimer);
  cooldownTimer = setInterval(() => {
    const left = CHAT_COOLDOWN_MS - (Date.now() - lastSentAt);
    if (left <= 0) {
      clearInterval(cooldownTimer);
      cooldownTimer = null;
      hideCooldown();
      unlockChatButton();
    } else {
      showCooldown(left);
    }
  }, 100);
}

function showCooldown(msLeft) {
  const el = document.getElementById('chatCooldown');
  if (!el) return;
  const sec = (msLeft / 1000).toFixed(1);
  el.textContent = 'Подожди ' + sec + ' сек...';
  el.classList.add('show');
}
function hideCooldown() {
  const el = document.getElementById('chatCooldown');
  if (!el) return;
  el.classList.remove('show');
  el.textContent = '';
}

function subscribeChat() {
  if (chatSubscribed) return;
  chatSubscribed = true;
  supabaseClient
    .channel('chat_messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, payload => {
      const msg = payload.new;
      if (chatMessages.find(m => m.id === msg.id)) return;
      chatMessages.push(msg);

      const need = !avatarCache.has(msg.login);
      const redraw = () => renderChat();
      if (need) prefetchAvatars([msg.login]).then(redraw);
      else redraw();

      if (!myProfile || msg.user_id !== myProfile.id) playZvuk();
    })
    .subscribe();
}

/* ============================================================
   11. Вкладки
   ============================================================ */
function switchTab(name, clickTab) {
  document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(x => x.classList.remove('active'));
  if (clickTab) {
    const t = document.querySelector(`.tab[data-tab="${name}"]`);
    if (t) t.classList.add('active');
  }
  const p = document.getElementById('panel-' + name);
  if (p) p.classList.add('active');
  if (name === 'shop') renderShop();
}

document.querySelectorAll('[data-tab]').forEach(t => {
  t.addEventListener('click', () => {
    const name = t.dataset.tab;
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(x => x.classList.remove('active'));
    if (t.classList.contains('tab')) t.classList.add('active');
    const p = document.getElementById('panel-' + name);
    if (p) p.classList.add('active');
    if (name === 'shop') renderShop();
  });
});

/* ============================================================
   12. Игры
   ============================================================ */
function openGame(file, title) {
  const f = document.getElementById('gameFrame');
  const t = document.getElementById('gamePanelTitle');
  t.textContent = title || 'Игра';
  f.src = file;
  switchTab('game', false);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
function closeGame() {
  const f = document.getElementById('gameFrame');
  f.src = '';
  switchTab('games', true);
}
function toggleFullscreen() {
  const wrap = document.getElementById('gameWrap');
  if (!wrap) return;
  const isFs = document.fullscreenElement || document.webkitFullscreenElement;
  if (!isFs) {
    const req = wrap.requestFullscreen || wrap.webkitRequestFullscreen;
    if (req) req.call(wrap).catch(() => {});
  } else {
    const exit = document.exitFullscreen || document.webkitExitFullscreen;
    if (exit) exit.call(document);
  }
}
document.addEventListener('fullscreenchange', updateFsBtn);
document.addEventListener('webkitfullscreenchange', updateFsBtn);
function updateFsBtn() {
  const btn = document.getElementById('fsBtn');
  if (!btn) return;
  const isFs = document.fullscreenElement || document.webkitFullscreenElement;
  btn.textContent = isFs ? '⛶ Выйти из полноэкранного' : '⛶ Во весь экран';
}

/* ============================================================
   13. Донат
   ============================================================ */
function openDonate() {
  if (!DONATE_URL || DONATE_URL === '#' || DONATE_URL.indexOf('example.com') !== -1) {
    alert('Ссылка для доната ещё не настроена.');
    return;
  }
  window.open(DONATE_URL, '_blank', 'noopener');
}

/* ============================================================
   14. Пряники
   ============================================================ */
function openTopUp() {
  const me = getMe();
  if (!me) { openModal('login'); return; }
  document.getElementById('topUpModal').classList.add('open');
}
function closeTopUp() {
  document.getElementById('topUpModal').classList.remove('open');
}
function topUp(amount) {
  alert('Пополнение пока что выполняется руками. Задонатьте на Boosty и напишите сколько нужно пряников.');
}

/* ============================================================
   15. Подарки
   ============================================================ */
let giftTargetId = null;

async function openGift(login) {
  const me = getMe();
  if (!me) { openModal('login'); return; }
  const user = await findUser(login);
  if (!user) return;
  giftTargetId = user.id;

  document.getElementById('giftModalTitle').textContent = 'Подарить · ' + login;
  const msgEl = document.getElementById('giftMessageInput');
  if (msgEl) msgEl.value = '';
  const list = document.getElementById('giftList');
  list.innerHTML = '';

  GIFTS.forEach(g => {
    const row = document.createElement('div');
    row.className = 'gift-row';

    const ic = document.createElement('div');
    ic.className = 'gift-icon';
    ic.textContent = g.icon;

    const info = document.createElement('div');
    info.className = 'gift-info';
    info.innerHTML = '<div class="gift-name">' + esc(g.name) + '</div>' +
                     '<div class="gift-price">' + g.price + ' пряников</div>';

    const canAfford = (me.pryaniki || 0) >= g.price;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'aero-btn green small';
    btn.textContent = canAfford ? 'Подарить' : 'Не хватает';
    btn.disabled = !canAfford;
    btn.addEventListener('click', () => sendGift(g));

    row.appendChild(ic);
    row.appendChild(info);
    row.appendChild(btn);
    list.appendChild(row);
  });

  document.getElementById('giftModal').classList.add('open');
}

function closeGift() {
  document.getElementById('giftModal').classList.remove('open');
  giftTargetId = null;
}

async function sendGift(gift) {
  if (!giftTargetId) return;
  const me = getMe();
  if (!me) return;
  if ((me.pryaniki || 0) < gift.price) return;

  const msgInput = document.getElementById('giftMessageInput');
  const message = msgInput ? msgInput.value.trim().slice(0, 200) : '';

  const { error: errIns } = await supabaseClient.from('gifts').insert({
    from_id: me.id,
    to_id: giftTargetId,
    gift_id: gift.id,
    gift_name: gift.name,
    gift_icon: gift.icon,
    message: message
  });
  if (errIns) { alert('Ошибка: ' + errIns.message); return; }

  const { error: errUpd } = await supabaseClient
    .from('profiles')
    .update({ pryaniki: (me.pryaniki || 0) - gift.price })
    .eq('id', me.id);
  if (errUpd) { alert('Ошибка: ' + errUpd.message); return; }

  await loadMyProfile();
  renderPryanikChip();
  closeGift();
  alert('Подарок отправлен!');
}

/* ============================================================
   Просмотр подарков
   ============================================================ */
async function openGiftsModal(login) {
  const me = getMe();
  if (!me) { openModal('login'); return; }
  const user = await findUser(login);
  if (!user) return;

  const isOwn = user.id === me.id;

  const titleEl = document.getElementById('giftsModalTitle');
  titleEl.textContent = isOwn ? 'Мои подарки' : ('Подарки · ' + login);

  const visWrap = document.getElementById('giftsViewVisibility');
  const visBtn = document.getElementById('giftsVisBtn');
  if (isOwn) {
    visWrap.style.display = '';
    visBtn.textContent = user.gifts_hidden ? 'Показать всем' : 'Скрыть ото всех';
  } else {
    visWrap.style.display = 'none';
  }

  const list = document.getElementById('giftsViewList');
  list.innerHTML = '<div class="empty-note">Загрузка...</div>';
  document.getElementById('giftsModal').classList.add('open');

  // Скрыто чужому пользователю
  if (!isOwn && user.gifts_hidden) {
    list.innerHTML = '<div class="empty-note">Подарки скрыты владельцем</div>';
    return;
  }

  const { data: gifts } = await supabaseClient
    .from('gifts')
    .select('*')
    .eq('to_id', user.id)
    .order('created_at', { ascending: false });

  if (!gifts || gifts.length === 0) {
    list.innerHTML = '<div class="empty-note">' +
      (isOwn ? 'Тебе пока никто не дарил подарков' : 'Подарков пока нет') +
      '</div>';
    return;
  }

  const senderIds = [...new Set(gifts.map(g => g.from_id))];
  const { data: profiles } = await supabaseClient
    .from('profiles')
    .select('id, login')
    .in('id', senderIds);
  const loginMap = {};
  (profiles || []).forEach(p => { loginMap[p.id] = p.login; });

  list.innerHTML = gifts.map(g => {
    const d = new Date(g.created_at);
    const when = d.toLocaleString('ru-RU', {
      day:'2-digit', month:'2-digit', year:'numeric',
      hour:'2-digit', minute:'2-digit'
    });
    const sender = loginMap[g.from_id] || '?';
    const icon = g.gift_icon || '🎁';
    const msg = g.message
      ? '<div class="gift-msg">«' + esc(g.message) + '»</div>'
      : '';

    return '<div class="gifts-view-row">' +
      '<div class="gifts-view-icon">' + esc(icon) + '</div>' +
      '<div class="gifts-view-info">' +
        '<div class="gifts-view-name">' + esc(g.gift_name || g.gift_id) + '</div>' +
        '<div class="gifts-view-from">от <span class="gifts-view-from-link" data-login="' + esc(sender) + '">' + esc(sender) + '</span> · ' + when + '</div>' +
        msg +
      '</div>' +
    '</div>';
  }).join('');

  list.querySelectorAll('.gifts-view-from-link').forEach(el => {
    el.addEventListener('click', () => {
      closeGiftsModal();
      openProfile(el.dataset.login);
    });
  });
}

function closeGiftsModal() {
  document.getElementById('giftsModal').classList.remove('open');
}

async function toggleGiftsVisibility() {
  const me = getMe();
  if (!me) return;
  const newHidden = !me.gifts_hidden;

  const { error } = await supabaseClient
    .from('profiles')
    .update({ gifts_hidden: newHidden })
    .eq('id', me.id);
  if (error) { alert('Ошибка: ' + error.message); return; }

  await loadMyProfile();
  if (currentProfile && currentProfile.id === me.id) {
    currentProfile.gifts_hidden = newHidden;
  }
  await openGiftsModal(me.login);
}

/* ============================================================
   16. Личные сообщения
   ============================================================ */
let dmTarget = null;
let dmTargetId = null;
let dmChannel = null;

async function openDM(login) {
  const me = getMe();
  if (!me) { openModal('login'); return; }
  const user = await findUser(login);
  if (!user) return;
  dmTarget = login;
  dmTargetId = user.id;
  document.getElementById('dmTitle').textContent = 'Сообщение · ' + login;
  await renderDM();
  document.getElementById('dmModal').classList.add('open');
  setTimeout(() => document.getElementById('dmInput').focus(), 50);
  subscribeDM();
}

function closeDM() {
  document.getElementById('dmModal').classList.remove('open');
  unsubscribeDM();
  dmTarget = null;
  dmTargetId = null;
}

async function renderDM() {
  const me = getMe();
  const list = document.getElementById('dmList');
  if (!me || !dmTargetId) { list.innerHTML = ''; return; }

  const { data: msgs } = await supabaseClient
    .from('dm_messages')
    .select('*')
    .or(`and(sender_id.eq.${me.id},recipient_id.eq.${dmTargetId}),and(sender_id.eq.${dmTargetId},recipient_id.eq.${me.id})`)
    .order('created_at', { ascending: true })
    .limit(200);

  if (!msgs || msgs.length === 0) {
    list.innerHTML = '<div class="empty-note">Сообщений пока нет. Напиши первым!</div>';
    return;
  }

  const ids = [...new Set(msgs.flatMap(m => [m.sender_id, m.recipient_id]))];
  let loginMap = {};
  if (ids.length > 0) {
    const { data: profiles } = await supabaseClient
      .from('profiles').select('id, login').in('id', ids);
    (profiles || []).forEach(p => { loginMap[p.id] = p.login; });
  }

  list.innerHTML = msgs.map(m => {
    const own = m.sender_id === me.id;
    const d = new Date(m.created_at);
    const when = d.toLocaleString('ru-RU', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' });
    return '<div class="dm-msg' + (own ? ' own' : '') + '">' +
      '<div class="dm-meta">' + esc(loginMap[m.sender_id] || '?') + ' · ' + when + '</div>' +
      '<div class="dm-text">' + esc(m.text) + '</div>' +
    '</div>';
  }).join('');
  list.scrollTop = list.scrollHeight;
}

async function sendDM(e) {
  e.preventDefault();
  const me = getMe();
  if (!me || !dmTargetId) return;
  const input = document.getElementById('dmInput');
  const text = input.value.trim();
  if (!text) { input.focus(); return; }

  input.value = '';
  input.focus();
  playZvuk();

  const { error } = await supabaseClient.from('dm_messages').insert({
    sender_id: me.id,
    recipient_id: dmTargetId,
    text: text
  });
  if (error) { alert('Ошибка: ' + error.message); return; }
  await renderDM();
}

function subscribeDM() {
  if (dmChannel) return;
  dmChannel = supabaseClient
    .channel('dm_messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'dm_messages' }, payload => {
      const m = payload.new;
      if (!myProfile || !dmTargetId) return;
      const relevant =
        (m.sender_id === myProfile.id && m.recipient_id === dmTargetId) ||
        (m.sender_id === dmTargetId && m.recipient_id === myProfile.id);
      if (!relevant) return;
      renderDM();
      if (m.sender_id !== myProfile.id) playZvuk();
    })
    .subscribe();
}

function unsubscribeDM() {
  if (dmChannel) {
    supabaseClient.removeChannel(dmChannel);
    dmChannel = null;
  }
}

/* ============================================================
   17. ПИТОМЦЫ
   ============================================================ */
const PET_SPRITE_W = 64, PET_SPRITE_H = 64;
let petWalker = null;
let petResizeTimer = null;
let lastPawX = 0, lastPawY = 0;
let lastMouseMoveTs = 0;
let lastMouseMoveX = 0, lastMouseMoveY = 0;

function buildPetGraph() {
  const wrap = document.querySelector('.wrap');
  if (!wrap) return { nodes: [], edges: [], W: 0, H: 0 };
  const r = wrap.getBoundingClientRect();
  const W = window.innerWidth, H = window.innerHeight;
  const PET_W = 64, PET_H = 64, pad = 10;
  const leftMax  = r.left - PET_W - pad;
  const rightMin = r.right + pad;
  const topMax   = r.top - PET_H - pad;
  const hasLeft  = leftMax > pad + 10;
  const hasRight = rightMin + PET_W < W - pad;
  const hasTop   = topMax > pad + 10;

  const nodes = [], edges = [], idx = {};
  if (hasTop) {
    const y = Math.max(pad, topMax - 10);
    idx.topMid = nodes.length; nodes.push({ x: W / 2, y });
  }
  if (hasLeft) {
    const x = Math.max(pad, leftMax - 10);
    const yTop = hasTop ? Math.max(pad, topMax - 10) : pad + 40;
    const yBot = H - PET_H - 80;
    idx.leftTop = nodes.length; nodes.push({ x, y: yTop });
    idx.leftBot = nodes.length; nodes.push({ x, y: yBot });
  }
  if (hasRight) {
    const x = Math.min(W - PET_W - pad, rightMin + 10);
    const yTop = hasTop ? Math.max(pad, topMax - 10) : pad + 40;
    const yBot = H - PET_H - 80;
    idx.rightTop = nodes.length; nodes.push({ x, y: yTop });
    idx.rightBot = nodes.length; nodes.push({ x, y: yBot });
  }
  if (hasLeft && hasTop)  edges.push([idx.leftTop,  idx.topMid]);
  if (hasTop && hasRight) edges.push([idx.topMid,   idx.rightTop]);
  if (hasLeft)            edges.push([idx.leftBot,  idx.leftTop]);
  if (hasRight)           edges.push([idx.rightTop, idx.rightBot]);

  return { nodes, edges, W, H,
           sleepLeft:  hasLeft  ? idx.leftBot  : null,
           sleepRight: hasRight ? idx.rightBot : null };
}

function spawnPetEmote(kind) {
  if (!petWalker) return;
  const layer = document.getElementById('petLayer');
  if (!layer) return;
  const st = petWalker;

  const el = document.createElement('div');
  el.className = 'pet-emote ' + kind;

  const imgUrl = kind === 'love' ? loveImage.url : (kind === 'star' ? starImage.url : null);
  if (imgUrl) {
    const img = document.createElement('img');
    img.src = imgUrl;
    img.alt = '';
    el.appendChild(img);
  } else {
    el.textContent = kind === 'love' ? '❤' : '⭐';
    el.style.fontSize = kind === 'love' ? '14px' : '12px';
    el.style.color = kind === 'love' ? '#e84a6f' : '';
  }

  const offsetX = -28 + Math.random() * 56;
  const offsetY = Math.random() * 8;
  el.style.left = (st.x + PET_SPRITE_W / 2 - 9 + offsetX) + 'px';
  el.style.top  = (st.y - 14 + offsetY) + 'px';

  layer.appendChild(el);
  setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 1700);
}

function dropPaw(x, y, dir) {
  if (!pawImage.url) return;
  const layer = document.getElementById('petLayer');
  if (!layer) return;
  const img = document.createElement('img');
  img.className = 'pet-paw';
  img.src = pawImage.url;
  img.style.left = (x + 20) + 'px';
  img.style.top  = (y + PET_SPRITE_H - 14) + 'px';
  img.style.transform = (dir === -1) ? 'scaleX(-1)' : 'scaleX(1)';
  layer.insertBefore(img, layer.firstChild);
  setTimeout(() => img.classList.add('fade'), 400);
  setTimeout(() => { if (img.parentNode) img.parentNode.removeChild(img); }, 2800);
}

function startPetWalk(pet) {
  stopPetWalk();
  if (!pet) return;
  const url = petImageCache.get(pet.breed_id);
  if (!url) return;
  const layer = document.getElementById('petLayer');
  if (!layer) return;

  layer.innerHTML = '';

  const sprite = document.createElement('div');
  sprite.className = 'pet-sprite';
  sprite.dataset.dir = '1';
  const img = document.createElement('img');
  img.src = url; img.alt = '';
  sprite.appendChild(img);
  layer.appendChild(sprite);

  const graph = buildPetGraph();
  if (!graph.nodes.length) { stopPetWalk(); return; }

  const startNode = graph.nodes[0];

  let startX = startNode.x;
  let startY = startNode.y;
  if (typeof pet.pos_x === 'number' && typeof pet.pos_y === 'number') {
    const W = window.innerWidth, H = window.innerHeight;
    if (pet.pos_x >= 0 && pet.pos_x <= W - PET_SPRITE_W &&
        pet.pos_y >= 0 && pet.pos_y <= H - PET_SPRITE_H) {
      startX = pet.pos_x;
      startY = pet.pos_y;
    }
  }

  const st = {
    pet, sprite, layer, graph,
    nodeIdx: 0,
    x: startX, y: startY,
    tx: startX, ty: startY,
    dir: 1,
    paused: false, pauseUntil: 0,
    state: 'normal',
    dragging: false, dragOffsetX: 0, dragOffsetY: 0,
    petting: false, lastMoodGain: 0,
    petCursorX: null, petCursorY: null,
    lastPetEmoteAt: 0,
    shakePoints: [],
    lastShakeEmoteAt: 0,
    hadShake: false,
    dizzyUntil: 0,
    raf: null
  };

  sprite.style.left = st.x + 'px';
  sprite.style.top  = st.y + 'px';

  function pickNext() {
    const { nodes, edges } = graph;

    if (st.state === 'sleepy' && (graph.sleepLeft !== null || graph.sleepRight !== null)) {
      const leftDist  = graph.sleepLeft  !== null ? Math.hypot(st.x - nodes[graph.sleepLeft].x,  st.y - nodes[graph.sleepLeft].y)  : Infinity;
      const rightDist = graph.sleepRight !== null ? Math.hypot(st.x - nodes[graph.sleepRight].x, st.y - nodes[graph.sleepRight].y) : Infinity;
      st.nodeIdx = leftDist <= rightDist ? graph.sleepLeft : graph.sleepRight;
      st.tx = nodes[st.nodeIdx].x;
      st.ty = nodes[st.nodeIdx].y;
      return;
    }

    let next = st.nodeIdx;
    if (edges.length > 0 && Math.random() < 0.45) {
      const nb = [];
      for (const [a, b] of edges) {
        if (a === st.nodeIdx) nb.push(b);
        else if (b === st.nodeIdx) nb.push(a);
      }
      if (nb.length) next = nb[Math.floor(Math.random() * nb.length)];
    }
    st.nodeIdx = next;
    const n = nodes[next];
    st.tx = n.x + (Math.random() - 0.5) * 24;
    st.ty = n.y + (Math.random() - 0.5) * 24;
  }

  function tick() {
    if (petWalker !== st) return;
    const now = performance.now();
    const p = st.pet;

    const isSleeping  = st.state === 'sleeping';
    const isSleepy    = (p.energy ?? 100) < 25;
    const isSad       = (p.hunger ?? 100) < 25;
    const lowMood     = (p.mood ?? 100) < 40;

    if (st.state === 'dizzy') {
      if (now >= st.dizzyUntil) {
        st.state = 'normal';
        st.sprite.classList.remove('dizzy');
        st.paused = false;
        st.pauseUntil = 0;
        pickNext();
      }
    }

    if (st.state !== 'dragging' && st.state !== 'dizzy') {
      if (isSleeping && (p.energy ?? 100) < 80) {
        // спит
      } else if (isSleeping && (p.energy ?? 100) >= 80) {
        st.state = 'normal';
        st.sprite.classList.remove('sleeping');
        st.paused = false;
        pickNext();
      } else if (isSleepy && st.state !== 'sleepy' && st.state !== 'sleeping') {
        st.state = 'sleepy';
        st.paused = false;
        pickNext();
      } else if (st.state !== 'sleeping' && st.state !== 'sleepy') {
        st.state = (isSad || lowMood) ? 'sad' : 'normal';
      }
    }

    const dtHours = (1 / 3600) / 60;
    if (st.state === 'sleeping') {
      p.energy = Math.min(100, (p.energy ?? 100) + PET_DECAY.sleepRestore * dtHours);
    } else {
      p.energy = Math.max(0, (p.energy ?? 100) - PET_DECAY.energy * dtHours);
    }

    if (st.dragging) {
      st.sprite.style.left = st.x + 'px';
      st.sprite.style.top  = st.y + 'px';
      st.raf = requestAnimationFrame(tick);
      return;
    }

    if (st.state === 'dizzy') {
      st.sprite.style.left = st.x + 'px';
      st.sprite.style.top  = st.y + 'px';
      st.raf = requestAnimationFrame(tick);
      return;
    }

    if (st.petting && (now - st.lastMoodGain) > 120) {
      st.lastMoodGain = now;
      p.mood = Math.min(100, (p.mood ?? 0) + 0.5);
      if (st.petCursorX != null && st.petCursorY != null && st.state !== 'sleeping') {
        const cx = st.x + PET_SPRITE_W / 2, cy = st.y + PET_SPRITE_H / 2;
        st.x += (st.petCursorX - cx) * 0.08;
        st.y += (st.petCursorY - cy) * 0.08;
      }
      if (st.state !== 'sleeping') sprite.classList.add('happy');
    } else if (!st.petting) {
      sprite.classList.remove('happy');
    }

    if (st.petting && !st.dragging && now - st.lastPetEmoteAt > 320) {
      st.lastPetEmoteAt = now;
      const count = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i++) spawnPetEmote('love');
    }

    if (st.state === 'sleeping') {
      st.sprite.style.left = st.x + 'px';
      st.sprite.style.top  = st.y + 'px';
      st.raf = requestAnimationFrame(tick);
      return;
    }

    if (st.paused) {
      if (now >= st.pauseUntil) {
        st.paused = false;
        sprite.classList.remove('paused');
        pickNext();
      }
    } else {
      if (lowMood && st.petCursorX != null && st.petCursorY != null) {
        st.tx = st.petCursorX - PET_SPRITE_W / 2;
        st.ty = st.petCursorY - PET_SPRITE_H / 2;
        if (st.paused) {
          st.paused = false;
          st.sprite.classList.remove('paused');
        }
      }

      const dx = st.tx - st.x;
      const dy = st.ty - st.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 2) {
        st.paused = true;
        st.pauseUntil = now + (lowMood ? 300 : (1000 + Math.random() * 3000));
        sprite.classList.add('paused');
      } else {
        const baseSpeed = lowMood ? 1.0 : 0.65;
        const speed = st.state === 'sleepy' ? baseSpeed * 1.2 : baseSpeed;
        const nx = st.x + (dx / dist) * speed;
        const ny = st.y + (dy / dist) * speed;

        const nd = dx < 0 ? -1 : 1;
        if (nd !== st.dir) { st.dir = nd; sprite.dataset.dir = String(nd); }

        if (Math.hypot(nx - lastPawX, ny - lastPawY) > 40) {
          lastPawX = nx; lastPawY = ny;
          dropPaw(st.x, st.y, st.dir);
        }
        st.x = nx; st.y = ny;
      }
    }

    if (st.state === 'sleepy') {
      const target = graph.nodes[st.nodeIdx];
      if (target && Math.hypot(st.x - target.x, st.y - target.y) < 4) {
        st.state = 'sleeping';
        st.sprite.classList.add('sleeping');
        st.paused = true;
        st.pauseUntil = now + 60000;
      }
    }

    if (st.state === 'sad' && !sprite.classList.contains('sad')) sprite.classList.add('sad');
    if (st.state !== 'sad') sprite.classList.remove('sad');

    st.sprite.style.left = st.x + 'px';
    st.sprite.style.top  = st.y + 'px';
    st.raf = requestAnimationFrame(tick);
  }

  petWalker = st;
  pickNext();
  tick();
}

function stopPetWalk() {
  if (!petWalker) return;
  if (petWalker.raf) cancelAnimationFrame(petWalker.raf);
  if (petWalker.sprite && petWalker.sprite.parentNode) {
    petWalker.sprite.parentNode.removeChild(petWalker.sprite);
  }
  petWalker = null;
  const layer = document.getElementById('petLayer');
  if (layer) layer.innerHTML = '';
}

/* --- МЫШЬ --- */
document.addEventListener('mousemove', (e) => {
  if (!petWalker) return;
  const st = petWalker;

  if (st.dragging) {
    st.x = e.clientX - st.dragOffsetX;
    st.y = e.clientY - st.dragOffsetY;
    const W = window.innerWidth, H = window.innerHeight;
    st.x = Math.max(0, Math.min(W - PET_SPRITE_W, st.x));
    st.y = Math.max(0, Math.min(H - PET_SPRITE_H, st.y));

    const nowMs = performance.now();
    st.shakePoints.push({ t: nowMs, x: e.clientX });
    st.shakePoints = st.shakePoints.filter(pt => nowMs - pt.t < 600);

    if (st.shakePoints.length >= 4) {
      let minX = Infinity, maxX = -Infinity;
      let signChanges = 0;
      let lastSign = 0;
      for (let i = 1; i < st.shakePoints.length; i++) {
        const dx = st.shakePoints[i].x - st.shakePoints[i - 1].x;
        if (Math.abs(dx) < 2) continue;
        const s = dx > 0 ? 1 : -1;
        if (lastSign && s !== lastSign) signChanges++;
        lastSign = s;
        if (st.shakePoints[i].x < minX) minX = st.shakePoints[i].x;
        if (st.shakePoints[i].x > maxX) maxX = st.shakePoints[i].x;
      }
      const amplitude = maxX - minX;
      if (signChanges >= 3 && amplitude > 200 && nowMs - st.lastShakeEmoteAt > 180) {
        st.lastShakeEmoteAt = nowMs;
        st.hadShake = true;
        spawnPetEmote('star');
      }
    }
    return;
  }

  const nowMs = performance.now();
  const moved = Math.abs(e.clientX - lastMouseMoveX) + Math.abs(e.clientY - lastMouseMoveY);
  if (moved > 1) lastMouseMoveTs = nowMs;
  lastMouseMoveX = e.clientX;
  lastMouseMoveY = e.clientY;

  st.petCursorX = e.clientX;
  st.petCursorY = e.clientY;

  const cx = st.x + PET_SPRITE_W / 2;
  const cy = st.y + PET_SPRITE_H / 2;
  const dist = Math.hypot(e.clientX - cx, e.clientY - cy);

  const isMoving = (nowMs - lastMouseMoveTs) < 250;
  st.petting = dist < 90 && isMoving;

  const lowMood = (st.pet.mood ?? 100) < 40;
  const busy = st.state === 'sleeping' || st.state === 'sleepy' || st.state === 'dizzy';
  if (lowMood && !busy) {
    st.tx = e.clientX - PET_SPRITE_W / 2;
    st.ty = e.clientY - PET_SPRITE_H / 2;
    if (st.paused) {
      st.paused = false;
      st.sprite.classList.remove('paused');
    }
  }
});

document.addEventListener('mousedown', (e) => {
  if (!petWalker) return;
  const st = petWalker;
  const cx = st.x, cy = st.y;
  const inside =
    e.clientX >= cx && e.clientX <= cx + PET_SPRITE_W &&
    e.clientY >= cy && e.clientY <= cy + PET_SPRITE_H;
  if (!inside) return;

  e.preventDefault();

  if (st.state === 'sleeping') {
    st.sprite.classList.remove('sleeping');
    st.state = 'normal';
  }
  if (st.state === 'dizzy') {
    st.sprite.classList.remove('dizzy');
    st.state = 'normal';
  }

  st.dragging = true;
  st.state = 'dragging';
  st.hadShake = false;
  st.shakePoints = [];
  st.dragOffsetX = e.clientX - st.x;
  st.dragOffsetY = e.clientY - st.y;
  st.sprite.classList.add('dragging');
});

document.addEventListener('mouseup', () => {
  if (!petWalker) return;
  const st = petWalker;
  if (st.dragging) {
    st.dragging = false;
    st.sprite.classList.remove('dragging');
    st.shakePoints = [];

    if (st.hadShake) {
      st.state = 'dizzy';
      st.dizzyUntil = performance.now() + 2000;
      st.hadShake = false;
      st.sprite.classList.add('dizzy');
    } else {
      st.state = 'normal';
      st.paused = false;
      st.pauseUntil = 0;
    }
  }
});

document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState === 'hidden' && petWalker && petWalker.pet) {
    await savePetPosition(petWalker.pet, petWalker.x, petWalker.y);
  }
});

window.addEventListener('resize', () => {
  if (petResizeTimer) clearTimeout(petResizeTimer);
  petResizeTimer = setTimeout(() => {
    const me = getMe();
    if (!me || !me.active_pet_id) return;
    const pet = myPets.find(p => p.id === me.active_pet_id);
    if (pet) startPetWalk(pet);
  }, 250);
});

/* ============================================================
   18. Магазин и инвентарь
   ============================================================ */
async function loadMyOwnedItems() {
  myOwnedItems = new Set();
  const me = getMe();
  if (!me) return;
  const { data } = await supabaseClient
    .from('user_items')
    .select('item_id')
    .eq('user_id', me.id);
  (data || []).forEach(r => myOwnedItems.add(r.item_id));
}

let myPets = [];

async function loadMyPets() {
  myPets = [];
  const me = getMe();
  if (!me) return;
  const { data } = await supabaseClient
    .from('pets')
    .select('*')
    .eq('user_id', me.id)
    .order('created_at', { ascending: true });
  myPets = data || [];
  const now = Date.now();
  const toSave = [];
  for (const p of myPets) {
    const last = p.last_tick ? new Date(p.last_tick).getTime() : now;
    const hours = Math.max(0, (now - last) / 3600000);
    if (hours < 0.01) continue;
    applyPetDecay(p, hours);
    toSave.push(p);
  }
  for (const p of toSave) {
    await supabaseClient.from('pets').update({
      hunger: Math.round(p.hunger),
      mood:   Math.round(p.mood),
      energy: Math.round(p.energy),
      last_tick: new Date().toISOString()
    }).eq('id', p.id);
  }

  const nowMs = Date.now();
  for (const p of myPets) {
    if (!p.pos_x || !p.pos_y) continue;
    const lastPos = p.pos_at ? new Date(p.pos_at).getTime() : nowMs;
    const secondsOffline = Math.max(0, (nowMs - lastPos) / 1000);
    if (secondsOffline < 30) continue;

    const steps = Math.min(30, Math.floor(secondsOffline / 3));
    let nx = p.pos_x;
    let ny = p.pos_y;
    for (let i = 0; i < steps; i++) {
      const ang = Math.random() * Math.PI * 2;
      const dist = 20 + Math.random() * 60;
      nx += Math.cos(ang) * dist;
      ny += Math.sin(ang) * dist;
    }
    const W = window.innerWidth, H = window.innerHeight;
    nx = Math.max(20, Math.min(W - PET_SPRITE_W - 20, nx));
    ny = Math.max(20, Math.min(H - PET_SPRITE_H - 20, ny));
    p.pos_x = nx;
    p.pos_y = ny;

    await supabaseClient.from('pets').update({
      pos_x: Math.round(nx),
      pos_y: Math.round(ny),
      pos_at: new Date().toISOString()
    }).eq('id', p.id);
  }
}

function applyPetDecay(pet, hours) {
  pet.hunger = Math.max(0, (pet.hunger ?? 100) - PET_DECAY.hunger * hours);
  pet.mood   = Math.max(0, (pet.mood   ?? 100) - PET_DECAY.mood   * hours);
  let en = pet.energy ?? 100;
  let remaining = hours;
  while (remaining > 0) {
    const step = Math.min(remaining, 0.25);
    if (en < 25) en = Math.min(100, en + PET_DECAY.offlineEnergy * step);
    else         en = Math.max(25, en - PET_DECAY.energy * step);
    remaining -= step;
  }
  pet.energy = en;
}

async function savePetState(pet) {
  if (!pet || !pet.id) return;
  await supabaseClient.from('pets').update({
    hunger: Math.round(pet.hunger),
    mood:   Math.round(pet.mood),
    energy: Math.round(pet.energy),
    last_tick: new Date().toISOString()
  }).eq('id', pet.id);
}

async function savePetPosition(pet, x, y) {
  if (!pet || !pet.id) return;
  await supabaseClient.from('pets').update({
    pos_x: Math.round(x),
    pos_y: Math.round(y),
    pos_at: new Date().toISOString()
  }).eq('id', pet.id);
}

let petTickTimer = null;

function startPetTick() {
  if (petTickTimer) return;
  petTickTimer = setInterval(async () => {
    const me = getMe();
    if (!me || !myPets.length) return;
    for (const p of myPets) {
      applyPetDecay(p, 30 / 3600);
      await savePetState(p);
    }

    if (petWalker && petWalker.pet) {
      await savePetPosition(petWalker.pet, petWalker.x, petWalker.y);
      const fresh = myPets.find(x => x.id === petWalker.pet.id);
      if (fresh) {
        fresh.pos_x = petWalker.x;
        fresh.pos_y = petWalker.y;
        fresh.pos_at = new Date().toISOString();
        petWalker.pet = fresh;
      }
    }
    const shop = document.getElementById('panel-shop');
    if (shop && shop.classList.contains('active') && myPets.length) renderShop();
    const profilePanel = document.getElementById('panel-profile');
    if (profilePanel && profilePanel.classList.contains('active')) renderInventory();
  }, 30000);
}

async function startActivePetFromProfile() {
  const me = getMe();
  if (!me || !me.active_pet_id) { stopPetWalk(); return; }
  const pet = myPets.find(p => p.id === me.active_pet_id);
  if (pet) startPetWalk(pet);
  else stopPetWalk();
}

/* ---- МАГАЗИН ---- */
async function renderShop() {
  const container = document.getElementById('shopContent');
  if (!container) return;
  const me = getMe();

  const amountEl = document.getElementById('shopBalanceAmount');
  if (amountEl) {
    amountEl.innerHTML = (me ? (me.pryaniki ?? 0) : 0) + pryanikImgHtml(26);
  }

  if (!me) {
    container.innerHTML = '<div class="placeholder">Войдите, чтобы увидеть магазин.</div>';
    return;
  }

  const groups = [
    { title: 'Переливающиеся ники', items: NICK_SHOP.filter(i => i.category === 'color') },
    { title: 'Камуфляжные ники',    items: NICK_SHOP.filter(i => i.category === 'camo')  },
    { title: 'Питомцы',             items: PET_BREEDS }
  ];
  const allItems = [...NICK_SHOP, ...PET_BREEDS];

  const balance = me.pryaniki || 0;
  let html = '';

  for (const g of groups) {
    html += '<div class="shop-category"><h3>' + esc(g.title) + '</h3><div class="shop-grid">';
    for (const item of g.items) {
      const owned  = item.type !== 'pet' && myOwnedItems.has(item.id);
      const active = item.type !== 'pet' && me.nick_style === item.id;
      html += renderShopCard(item, owned, active, balance);
    }
    html += '</div></div>';
  }
  container.innerHTML = html;

  container.querySelectorAll('[data-shop-action]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const item = allItems.find(i => i.id === btn.dataset.itemId);
      const action = btn.dataset.shopAction;
      if (!item) return;
      if (action === 'buy-pet') { openPetName(item); return; }
      if (action === 'buy')       await buyShopItem(item);
      else if (action === 'equip')   await equipNick(item);
      else if (action === 'unequip') await unequipNick(item);
    });
  });
}

function renderShopCard(item, owned, active, balance) {
  const preview = shopPreviewHtml(item);

  let actionHtml = '';
  if (item.type === 'pet') {
    const canAfford = balance >= item.price;
    actionHtml = '<button type="button" class="aero-btn green small" data-shop-action="buy-pet" data-item-id="' + item.id + '"' +
      (canAfford ? '' : ' disabled') + '>' + (canAfford ? 'Купить' : 'Не хватает') + '</button>';
  } else if (active) {
    actionHtml = '<button type="button" class="aero-btn red small" data-shop-action="unequip" data-item-id="' + item.id + '">Снять</button>';
  } else if (owned) {
    actionHtml = '<button type="button" class="aero-btn green small" data-shop-action="equip" data-item-id="' + item.id + '">Надеть</button>';
  } else {
    const canAfford = balance >= item.price;
    actionHtml = '<button type="button" class="aero-btn green small" data-shop-action="buy" data-item-id="' + item.id + '"' +
      (canAfford ? '' : ' disabled') + '>' + (canAfford ? 'Купить' : 'Не хватает') + '</button>';
  }

  let badge = '';
  if (item.type !== 'pet') {
    if (active) badge = '<span class="badge active">НАДЕТО</span>';
    else if (owned) badge = '<span class="badge owned">КУПЛЕНО</span>';
  }

  return '<div class="shop-item' + (owned ? ' owned' : '') + (active ? ' active' : '') + '">' +
    badge +
    '<div class="shop-preview">' + preview + '</div>' +
    '<div class="name">' + esc(item.name) + '</div>' +
    '<div class="desc">' + esc(item.desc || '') + '</div>' +
    '<div class="price">' + pryanikImgHtml(16) + '<span>' + item.price + '</span></div>' +
    '<div class="actions">' + actionHtml + '</div>' +
  '</div>';
}

function shopPreviewHtml(item) {
  if (item.type === 'class') return '<span class="nick ' + item.cls + '">Солдат</span>';
  if (item.type === 'camo') {
    const url = camoImageCache.get(item.camoNum);
    if (!url) return '<span style="color:#7a94b0;font-style:italic;">картинка не найдена</span>';
    return '<span class="nick nick-camo" style="--camo-url:url(\'' + url + '\')">Солдат</span>';
  }
  if (item.type === 'pet') {
    const url = petImageCache.get(item.id);
    if (!url) return '<span style="color:#7a94b0;font-style:italic;">картинка не найдена</span>';
    return '<img src="' + esc(url) + '" alt="" style="width:56px;height:56px;object-fit:contain;image-rendering:pixelated;">';
  }
  return '';
}

async function buyShopItem(item) {
  const me = getMe();
  if (!me) { openModal('login'); return; }
  if (myOwnedItems.has(item.id)) return;

  const { data: existing } = await supabaseClient
    .from('user_items')
    .select('id')
    .eq('user_id', me.id)
    .eq('item_id', item.id)
    .maybeSingle();

  if (existing) {
    myOwnedItems.add(item.id);
    await renderShop();
    return;
  }

  if ((me.pryaniki || 0) < item.price) { alert('Не хватает пряников'); return; }

  const startBalance = me.pryaniki || 0;
  const newBalance = startBalance - item.price;

  const { error: errUpd } = await supabaseClient
    .from('profiles')
    .update({ pryaniki: newBalance })
    .eq('id', me.id);
  if (errUpd) { alert('Ошибка: ' + errUpd.message); return; }

  const { error: errIns } = await supabaseClient
    .from('user_items')
    .insert({ user_id: me.id, item_id: item.id });

  if (errIns) {
    await supabaseClient
      .from('profiles')
      .update({ pryaniki: startBalance })
      .eq('id', me.id);

    if (errIns.code === '23505') {
      myOwnedItems.add(item.id);
      await loadMyProfile();
      renderPryanikChip();
      await renderShop();
      return;
    }
    alert('Ошибка: ' + errIns.message);
    return;
  }

  await loadMyProfile();
  myOwnedItems.add(item.id);
  renderPryanikChip();
  await renderShop();
}

/* ============================================================
   18.5. ИНВЕНТАРЬ (на страничке)
   ============================================================ */
async function renderInventory() {
  const container = document.getElementById('inventorySection');
  if (!container) return;
  const me = getMe();

  if (!me) { container.innerHTML = ''; return; }

  let html = '';

  if (myPets.length > 0) {
    html += renderMyPetsSection();
  } else {
    html += '<div class="shop-category"><h3>Мои питомцы</h3>' +
            '<div class="empty-note">Пока никого. Загляни в магазин!</div></div>';
  }

  const ownedNicks = NICK_SHOP.filter(i => myOwnedItems.has(i.id));
  if (ownedNicks.length > 0) {
    html += '<div class="shop-category"><h3>Мои ники</h3><div class="shop-grid">';
    for (const item of ownedNicks) {
      const active = me.nick_style === item.id;
      html += '<div class="shop-item' + (active ? ' active' : '') + ' owned">' +
        (active ? '<span class="badge active">НАДЕТО</span>' : '<span class="badge owned">КУПЛЕНО</span>') +
        '<div class="shop-preview">' + shopPreviewHtml(item) + '</div>' +
        '<div class="name">' + esc(item.name) + '</div>' +
        '<div class="desc">' + esc(item.desc || '') + '</div>' +
        '<div class="actions">' +
          (active
            ? '<button type="button" class="aero-btn red small" data-inv-nick="unequip" data-item-id="' + item.id + '">Снять</button>'
            : '<button type="button" class="aero-btn green small" data-inv-nick="equip" data-item-id="' + item.id + '">Надеть</button>') +
        '</div>' +
      '</div>';
    }
    html += '</div></div>';
  } else {
    html += '<div class="shop-category"><h3>Мои ники</h3>' +
            '<div class="empty-note">Пока пусто.</div></div>';
  }

  container.innerHTML = html;

  container.querySelectorAll('[data-inv-nick]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const item = NICK_SHOP.find(i => i.id === btn.dataset.itemId);
      if (!item) return;
      if (btn.dataset.invNick === 'equip') await equipNick(item);
      else await unequipNick(item);
    });
  });

  container.querySelectorAll('[data-pet-action]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const petId = btn.dataset.petId;
      const action = btn.dataset.petAction;
      if (action === 'activate')   await activatePet(petId);
      else if (action === 'deactivate') await deactivatePet();
      else if (action === 'rename')     openPetName(null, petId);
      else if (action === 'feed')       await feedPet(petId);
      else if (action === 'release')    await releasePet(petId);
    });
  });
}

function renderMyPetsSection() {
  const activeId = myProfile && myProfile.active_pet_id;
  let html = '<div class="shop-category"><h3>Мои питомцы</h3><div class="pets-list">';
  for (const p of myPets) {
    const breed = PET_BREEDS.find(b => b.id === p.breed_id);
    const url = petImageCache.get(p.breed_id) || '';
    const isActive = p.id === activeId;

    const h = Math.round(p.hunger ?? 100);
    const m = Math.round(p.mood   ?? 100);
    const e = Math.round(p.energy ?? 100);
    const cls = v => v < 25 ? 'low' : '';

    html += '<div class="pet-row' + (isActive ? ' active' : '') + '">' +
      '<div class="pet-thumb">' + (url ? '<img src="' + esc(url) + '" alt="">' : '') + '</div>' +
      '<div class="pet-info">' +
        '<div class="pet-name">' + esc(p.name) + '</div>' +
        '<div class="pet-breed">' + esc(breed ? breed.name : p.breed_id) + '</div>' +
      '</div>' +
      '<div class="pet-actions">' +
        (isActive
          ? '<button type="button" class="aero-btn red small" data-pet-action="deactivate" data-pet-id="' + p.id + '">Убрать</button>'
          : '<button type="button" class="aero-btn green small" data-pet-action="activate" data-pet-id="' + p.id + '">Выпустить</button>') +
        '<button type="button" class="aero-btn small" data-pet-action="rename" data-pet-id="' + p.id + '">Переименовать</button>' +
        '<button type="button" class="aero-btn green small" data-pet-action="feed" data-pet-id="' + p.id + '">Покормить</button>' +
        '<button type="button" class="aero-btn red small" data-pet-action="release" data-pet-id="' + p.id + '">Отпустить</button>' +
      '</div>' +
      '<div class="pet-stats">' +
        '<div class="pet-stat hunger ' + cls(h) + '"><span class="label">Еда</span><span class="pet-stat-bar"><i style="width:' + h + '%"></i></span></div>' +
        '<div class="pet-stat mood '   + cls(m) + '"><span class="label">Настр</span><span class="pet-stat-bar"><i style="width:' + m + '%"></i></span></div>' +
        '<div class="pet-stat energy ' + cls(e) + '"><span class="label">Силы</span><span class="pet-stat-bar"><i style="width:' + e + '%"></i></span></div>' +
      '</div>' +
    '</div>';
  }
  html += '</div></div>';
  return html;
}

/* ============================================================
   19. Ники: надеть / снять
   ============================================================ */
async function equipNick(item) {
  const me = getMe();
  if (!me) return;
  const { error } = await supabaseClient
    .from('profiles')
    .update({ nick_style: item.id })
    .eq('id', me.id);
  if (error) { alert('Ошибка: ' + error.message); return; }

  await loadMyProfile();
  nickStyleCache.set(me.login, item.id);
  await renderShop();
  if (currentProfile && currentProfile.id === me.id) currentProfile.nick_style = item.id;
  if (currentProfile) await renderProfile();
  await renderUserArea();
  await renderChat();
}

async function unequipNick(item) {
  const me = getMe();
  if (!me) return;
  const { error } = await supabaseClient
    .from('profiles')
    .update({ nick_style: null })
    .eq('id', me.id);
  if (error) { alert('Ошибка: ' + error.message); return; }

  await loadMyProfile();
  nickStyleCache.set(me.login, null);
  await renderShop();
  if (currentProfile && currentProfile.id === me.id) currentProfile.nick_style = null;
  if (currentProfile) await renderProfile();
  await renderUserArea();
  await renderChat();
}

/* ============================================================
   20. Модалка имени питомца
   ============================================================ */
let petModalMode = 'create';
let petModalBreed = null;
let petModalPetId = null;

function openPetName(breed, petId) {
  const me = getMe();
  if (!me) { openModal('login'); return; }

  const input = document.getElementById('petNameInput');
  const errEl = document.getElementById('petNameError');
  const submitBtn = document.getElementById('petNameSubmit');

  if (breed) {
    if ((me.pryaniki || 0) < breed.price) { alert('Не хватает пряников'); return; }
    petModalMode = 'create';
    petModalBreed = breed;
    petModalPetId = null;
    document.getElementById('petNameTitle').textContent = 'Купить: ' + breed.name;
    submitBtn.textContent = 'Создать';
    input.value = '';
  } else if (petId) {
    const pet = myPets.find(p => p.id === petId);
    if (!pet) return;
    petModalMode = 'rename';
    petModalBreed = null;
    petModalPetId = petId;
    document.getElementById('petNameTitle').textContent = 'Переименовать';
    submitBtn.textContent = 'Сохранить';
    input.value = pet.name;
  } else {
    return;
  }

  errEl.textContent = '';
  document.getElementById('petNameModal').classList.add('open');
  setTimeout(() => { input.focus(); input.select(); }, 50);
}

function closePetName() {
  document.getElementById('petNameModal').classList.remove('open');
  petModalBreed = null;
  petModalPetId = null;
}

async function confirmPetName(e) {
  e.preventDefault();
  const me = getMe();
  if (!me) return;

  const name = document.getElementById('petNameInput').value.trim();
  const errEl = document.getElementById('petNameError');

  if (name.length < 1) { errEl.textContent = 'Введи имя'; return; }
  if (name.length > 20) { errEl.textContent = 'Максимум 20 символов'; return; }

  if (petModalMode === 'create') {
    const breed = petModalBreed;
    if (!breed) return;

    const startBalance = me.pryaniki || 0;
    if (startBalance < breed.price) { errEl.textContent = 'Не хватает пряников'; return; }

    const { error: errUpd } = await supabaseClient
      .from('profiles')
      .update({ pryaniki: startBalance - breed.price })
      .eq('id', me.id);
    if (errUpd) { errEl.textContent = errUpd.message; return; }

    const { error: errIns } = await supabaseClient
      .from('pets')
      .insert({ user_id: me.id, breed_id: breed.id, name });
    if (errIns) {
      await supabaseClient.from('profiles').update({ pryaniki: startBalance }).eq('id', me.id);
      errEl.textContent = errIns.message;
      return;
    }

    await loadMyProfile();
    await loadMyPets();
    renderPryanikChip();
    closePetName();
    await renderShop();
    await renderInventory();
  } else {
    const { error } = await supabaseClient
      .from('pets')
      .update({ name })
      .eq('id', petModalPetId);
    if (error) { errEl.textContent = error.message; return; }
    await loadMyPets();
    closePetName();
    await renderInventory();
  }
}

/* ============================================================
   21. Питомцы: управление
   ============================================================ */
async function activatePet(petId) {
  const me = getMe();
  if (!me) return;
  const { error } = await supabaseClient
    .from('profiles')
    .update({ active_pet_id: petId })
    .eq('id', me.id);
  if (error) { alert('Ошибка: ' + error.message); return; }
  await loadMyProfile();
  const pet = myPets.find(p => p.id === petId);
  if (pet) startPetWalk(pet); else stopPetWalk();
  await renderInventory();
}

async function deactivatePet() {
  const me = getMe();
  if (!me) return;
  const { error } = await supabaseClient
    .from('profiles')
    .update({ active_pet_id: null })
    .eq('id', me.id);
  if (error) { alert('Ошибка: ' + error.message); return; }
  await loadMyProfile();
  stopPetWalk();
  await renderInventory();
}

async function releasePet(petId) {
  const me = getMe();
  if (!me) return;
  if (!confirm('Отпустить питомца навсегда? Это нельзя отменить.')) return;

  const { error } = await supabaseClient
    .from('pets')
    .delete()
    .eq('id', petId);
  if (error) { alert('Ошибка: ' + error.message); return; }

  if (me.active_pet_id === petId) {
    await supabaseClient
      .from('profiles')
      .update({ active_pet_id: null })
      .eq('id', me.id);
    stopPetWalk();
  }

  await loadMyProfile();
  await loadMyPets();
  await renderInventory();
}

async function feedPet(petId) {
  const me = getMe();
  if (!me) return;
  const pet = myPets.find(p => p.id === petId);
  if (!pet) return;

  const RESTORE = 40;

  const newHunger = Math.min(100, (pet.hunger ?? 100) + RESTORE);
  const newMood   = Math.min(100, (pet.mood   ?? 100) + 10);
  const { error: errPet } = await supabaseClient
    .from('pets')
    .update({ hunger: newHunger, mood: newMood, last_tick: new Date().toISOString() })
    .eq('id', pet.id);
  if (errPet) { alert('Ошибка: ' + errPet.message); return; }

  pet.hunger = newHunger;
  pet.mood = newMood;

  if (petWalker && petWalker.pet && petWalker.pet.id === pet.id) {
    petWalker.pet = pet;
  }
  await renderInventory();
}

/* ============================================================
   22. Старт
   ============================================================ */
async function renderAll() {
  await renderUserArea();
  renderPryanikChip();
  renderChatAccess();
  await renderChat();
  await renderProfile();
  if (getMe()) {
    await loadMyOwnedItems();
    await loadMyPets();
    await startActivePetFromProfile();
  } else {
    stopPetWalk();
  }
}

(async () => {
  await Promise.all([ preloadCamoImages(), preloadPetImages() ]);
  await loadMyProfile();
  await loadChatMessages();
  await renderAll();
  subscribeChat();
  startPetTick();
})();

supabaseClient.auth.onAuthStateChange(async () => {
  await loadMyProfile();
  await renderAll();
});

/* ============================================================
   Обложки игр
   ============================================================ */
(function initGameCovers() {
  document.querySelectorAll('.game-cover[data-logo-base]').forEach(cover => {
    const img = cover.querySelector('img');
    if (!img) return;
    const base = cover.dataset.logoBase;
    findImage(img, [base], () => {
      img.remove();
      cover.classList.add('no-logo');
    });
  });
})();