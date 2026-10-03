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
  { id: 'rose',    icon: '🌹', name: 'Роза',    price: 10  },
  { id: 'cake',    icon: '🍰', name: 'Тортик',  price: 25  },
  { id: 'star',    icon: '⭐', name: 'Звезда',  price: 50  },
  { id: 'diamond', icon: '💎', name: 'Алмаз',   price: 100 },
  { id: 'cup',     icon: '🏆', name: 'Кубок',   price: 250 },
  { id: 'heart',   icon: '💖', name: 'Сердце',  price: 500 }
];

const NICK_SHOP = [
  { id: 'rainbow', type: 'class', cls: 'nick-rainbow', category: 'color', name: 'Радужный',  price: 100, desc: 'Переливается всеми цветами радуги' },
  { id: 'gold',    type: 'class', cls: 'nick-gold',    category: 'color', name: 'Золотой',   price: 200, desc: 'Золотой блеск, как на погонах' },
  { id: 'neon',    type: 'class', cls: 'nick-neon',    category: 'color', name: 'Неоновый',  price: 150, desc: 'Сине-фиолетовое неоновое свечение' },
  { id: 'fire',    type: 'class', cls: 'nick-fire',    category: 'color', name: 'Огненный',  price: 120, desc: 'Пылающий ник, как костёр в ночи' },
  { id: 'ice',     type: 'class', cls: 'nick-ice',     category: 'color', name: 'Ледяной',   price: 120, desc: 'Холодный ледяной отблеск' },
  { id: 'camo_1', type: 'camo', camoNum: 1, category: 'camo', name: 'ВСР-93 Барвиха', price: 100 },
  { id: 'camo_2', type: 'camo', camoNum: 2, category: 'camo', name: 'Берёзка серебряный лист', price: 100 },
  { id: 'camo_3', type: 'camo', camoNum: 3, category: 'camo', name: 'ВСР-98 Флора', price: 100 },
  { id: 'camo_4', type: 'camo', camoNum: 4, category: 'camo', name: 'Бутан', price: 100 },
  { id: 'camo_5', type: 'camo', camoNum: 5, category: 'camo', name: 'Цифра', price: 100 },
  { id: 'camo_6', type: 'camo', camoNum: 6, category: 'camo', name: 'Вудланд', price: 100 },
  { id: 'camo_7', type: 'camo', camoNum: 7, category: 'camo', name: 'Камыш синий', price: 100 },
  { id: 'camo_8', type: 'camo', camoNum: 8, category: 'camo', name: 'Берёзка бронзовый лист', price: 100 }
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

/* --- Картинка пряника: грузим один раз и запоминаем успешный src --- */
let pryanikIconSrc = null;
const pryanikIconEl = document.getElementById('pryanikIcon');
if (pryanikIconEl) {
  pryanikIconEl.addEventListener('load', () => {
    pryanikIconSrc = pryanikIconEl.src;
    // если магазин уже открыт — перерисуем, чтобы картинка появилась сразу
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

/* Аватары: кэш и дефолт */
const avatarCache = new Map();
const nickStyleCache = new Map();
const camoImageCache = new Map();
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

/* ---- Ники ---- */
async function preloadCamoImages() {
  for (const n of camoNums) {
    for (const ext of ['jpg','jpeg','png','webp','gif']) {
      const url = `kamuflyazh/${n}.${ext}`;
      if (await testImage(url)) { camoImageCache.set(n, url); break; }
    }
    if (!camoImageCache.has(n)) camoImageCache.set(n, null);
  }
}

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

  const { error: errIns } = await supabaseClient.from('gifts').insert({
    from_id: me.id,
    to_id: giftTargetId,
    gift_id: gift.id,
    gift_name: gift.name,
    gift_icon: gift.icon
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
   16.5. Магазин
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
    { title: 'Камуфляжные ники',    items: NICK_SHOP.filter(i => i.category === 'camo')  }
  ];

  const activeStyle = me.nick_style || null;
  const balance = me.pryaniki || 0;

  let html = '';
  for (const g of groups) {
    html += '<div class="shop-category"><h3>' + esc(g.title) + '</h3><div class="shop-grid">';
    for (const item of g.items) {
      html += renderShopCard(item, myOwnedItems.has(item.id), activeStyle === item.id, balance);
    }
    html += '</div></div>';
  }
  container.innerHTML = html;

  container.querySelectorAll('[data-shop-action]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const item = NICK_SHOP.find(i => i.id === btn.dataset.itemId);
      if (!item) return;
      const action = btn.dataset.shopAction;
      if (action === 'buy') await buyNickItem(item);
      else if (action === 'equip') await equipNickItem(item);
      else if (action === 'unequip') await unequipNickItem();
    });
  });
}

function renderShopCard(item, owned, active, balance) {
  const preview = nickPreviewHtml(item);

  let actionHtml = '';
  if (active) {
    actionHtml = '<button type="button" class="aero-btn red small" data-shop-action="unequip" data-item-id="' + item.id + '">Снять</button>';
  } else if (owned) {
    actionHtml = '<button type="button" class="aero-btn green small" data-shop-action="equip" data-item-id="' + item.id + '">Надеть</button>';
  } else {
    const canAfford = balance >= item.price;
    actionHtml = '<button type="button" class="aero-btn green small" data-shop-action="buy" data-item-id="' + item.id + '"' +
      (canAfford ? '' : ' disabled') + '>' + (canAfford ? 'Купить' : 'Не хватает') + '</button>';
  }

  let badge = '';
  if (active) badge = '<span class="badge active">НАДЕТО</span>';
  else if (owned) badge = '<span class="badge owned">КУПЛЕНО</span>';

  return '<div class="shop-item' + (owned ? ' owned' : '') + (active ? ' active' : '') + '">' +
    badge +
    '<div class="shop-preview">' + preview + '</div>' +
    '<div class="name">' + esc(item.name) + '</div>' +
    '<div class="desc">' + esc(desc) + '</div>' +
    '<div class="price">' + pryanikImgHtml(16) + '<span>' + item.price + '</span></div>' +
    '<div class="actions">' + actionHtml + '</div>' +
  '</div>';
}

function nickPreviewHtml(item) {
  const sample = 'Солдат';
  if (item.type === 'class') {
    return '<span class="nick ' + item.cls + '">' + sample + '</span>';
  }
  if (item.type === 'camo') {
    const url = camoImageCache.get(item.camoNum);
    if (!url) return '<span style="color:#7a94b0;font-style:italic;">картинка не найдена</span>';
    return '<span class="nick nick-camo" style="--camo-url:url(\'' + url + '\')">' + sample + '</span>';
  }
  return esc(sample);
}

async function buyNickItem(item) {
  const me = getMe();
  if (!me) { openModal('login'); return; }
  if (myOwnedItems.has(item.id)) return;
  if ((me.pryaniki || 0) < item.price) { alert('Не хватает пряников'); return; }

  const { error: errIns } = await supabaseClient
    .from('user_items')
    .insert({ user_id: me.id, item_id: item.id });
  if (errIns) { alert('Ошибка: ' + errIns.message); return; }

  const { error: errUpd } = await supabaseClient
    .from('profiles')
    .update({ pryaniki: (me.pryaniki || 0) - item.price })
    .eq('id', me.id);
  if (errUpd) { alert('Ошибка: ' + errUpd.message); return; }

  await loadMyProfile();
  myOwnedItems.add(item.id);
  renderPryanikChip();
  await renderShop();
}

async function equipNickItem(item) {
  const me = getMe();
  if (!me) return;
  if (!myOwnedItems.has(item.id)) return;

  const { error } = await supabaseClient
    .from('profiles')
    .update({ nick_style: item.id })
    .eq('id', me.id);
  if (error) { alert('Ошибка: ' + error.message); return; }

  await loadMyProfile();
  nickStyleCache.set(me.login, item.id);
  await renderShop();
  await renderUserArea();
  await renderChat();
  if (currentProfile && currentProfile.id === me.id) {
    currentProfile.nick_style = item.id;
  }
  if (currentProfile) await renderProfile();
}

async function unequipNickItem() {
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
  await renderUserArea();
  await renderChat();
  if (currentProfile && currentProfile.id === me.id) {
    currentProfile.nick_style = null;
  }
  if (currentProfile) await renderProfile();
}

/* ============================================================
   17. Старт
   ============================================================ */
async function renderAll() {
  await renderUserArea();
  renderPryanikChip();
  renderChatAccess();
  await renderChat();
  await renderProfile();
  if (getMe()) await loadMyOwnedItems();
}

(async () => {
  await preloadCamoImages();
  await loadMyProfile();
  await loadChatMessages();
  await renderAll();
  subscribeChat();
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