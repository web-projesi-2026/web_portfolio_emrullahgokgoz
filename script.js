/* ═══════════════════════════════════════════════════════════════
   VogueLine — script.js
   ▸ Ürün verileri JSON dosyasından (fetch) okunur
   ▸ Sepet ve Favoriler localStorage'a kaydedilir
   ▸ Arama kutusu, isim/fiyat sıralama, kullanıcı auth sistemi
   ═══════════════════════════════════════════════════════════════ */

/* ── GLOBAL STATE ──────────────────────────────────────────── */
let products         = [];
let cart             = [];
let favorites        = [];
let currentStep      = 1;
let currentProductId = null;
let currentFilter    = 'tumu';
let currentSort      = 'default';
let searchQuery      = '';

/* ── localStorage ANAHTARLARI ──────────────────────────────── */
const LS_CART  = 'vogueline_cart';
const LS_FAV   = 'vogueline_favorites';
const LS_USER  = 'vogueline_user';
const LS_USERS = 'vogueline_users';

/* ════════════════════════════════════════════════════════════
   1. JSON VERİSİNİ FETCH İLE YÜKLE
   ════════════════════════════════════════════════════════════ */
async function loadProducts() {
  try {
    const res  = await fetch('data/products.json');
    if (!res.ok) throw new Error('JSON yüklenemedi: ' + res.status);
    products = await res.json();
    renderProducts();
    initFavoritesUI();
  } catch (err) {
    console.error('Ürün verisi hatası:', err);
    showToast('Hata', 'Ürün verileri yüklenemedi.');
  }
}

/* ════════════════════════════════════════════════════════════
   2. localStorage — KAYDET & YÜKLE
   ════════════════════════════════════════════════════════════ */
function loadFromStorage() {
  try {
    const savedCart = localStorage.getItem(LS_CART);
    const savedFav  = localStorage.getItem(LS_FAV);
    if (savedCart) cart      = JSON.parse(savedCart);
    if (savedFav)  favorites = JSON.parse(savedFav);
  } catch (e) {
    console.warn('Storage okuma hatası:', e);
  }
}

function saveCart()      { localStorage.setItem(LS_CART, JSON.stringify(cart)); }
function saveFavorites() { localStorage.setItem(LS_FAV,  JSON.stringify(favorites)); }

/* ════════════════════════════════════════════════════════════
   3. FAVORİLER
   ════════════════════════════════════════════════════════════ */
function toggleFavorite(id, event) {
  if (event) event.stopPropagation();
  const idx = favorites.indexOf(id);
  if (idx === -1) {
    favorites.push(id);
    showToast('Favorilere Eklendi ♡', products.find(p => p.id === id)?.name);
  } else {
    favorites.splice(idx, 1);
    showToast('Favorilerden Çıkarıldı', products.find(p => p.id === id)?.name);
  }
  saveFavorites();
  updateFavButtons();
  updateFavCount();
}

function isFavorite(id) { return favorites.includes(id); }

function updateFavButtons() {
  document.querySelectorAll('[data-fav-id]').forEach(btn => {
    const id = parseInt(btn.dataset.favId);
    btn.classList.toggle('fav-active', isFavorite(id));
    btn.textContent = isFavorite(id) ? '♥' : '♡';
    btn.title = isFavorite(id) ? 'Favorilerden çıkar' : 'Favorilere ekle';
  });
}

function updateFavCount() {
  const badge = document.getElementById('fav-badge');
  if (badge) badge.textContent = favorites.length;
}

function initFavoritesUI() { updateFavButtons(); updateFavCount(); }

/* ════════════════════════════════════════════════════════════
   4. ARAMA & SIRALAMA
   ════════════════════════════════════════════════════════════ */
function handleSearch(val) {
  searchQuery = val.toLowerCase().trim();
  renderProducts();
}

function handleSort(val) {
  currentSort = val;
  renderProducts();
}

function applySearchAndSort(list) {
  // Arama filtresi
  if (searchQuery) {
    list = list.filter(p =>
      p.name.toLowerCase().includes(searchQuery) ||
      p.desc.toLowerCase().includes(searchQuery)
    );
  }
  // Sıralama
  if (currentSort === 'name-asc')   list = [...list].sort((a,b) => a.name.localeCompare(b.name, 'tr'));
  if (currentSort === 'name-desc')  list = [...list].sort((a,b) => b.name.localeCompare(a.name, 'tr'));
  if (currentSort === 'price-asc')  list = [...list].sort((a,b) => a.price - b.price);
  if (currentSort === 'price-desc') list = [...list].sort((a,b) => b.price - a.price);
  return list;
}

/* ════════════════════════════════════════════════════════════
   5. ÜRÜN KARTLARINI RENDER ET
   ════════════════════════════════════════════════════════════ */
function renderProducts(filter) {
  if (filter !== undefined) currentFilter = filter;
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  let filtered = products;
  if (currentFilter === 'indirim') {
    filtered = products.filter(p => p.oldPrice);
  } else if (currentFilter === 'yeni') {
    filtered = products.filter(p => p.badge === 'yeni');
  } else if (currentFilter !== 'tumu') {
    filtered = products.filter(p => p.category === currentFilter);
  }

  filtered = applySearchAndSort(filtered);

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:4rem;font-family:var(--ff-serif);font-style:italic;color:var(--muted);">Arama sonucu bulunamadı.</div>`;
    return;
  }

  const bgList = ['#1a1714','#131720','#1a1214','#141a12','#1a1618','#181612'];

  grid.innerHTML = filtered.map((p, i) => {
    const bg         = bgList[i % bgList.length];
    const favActive  = isFavorite(p.id) ? 'fav-active' : '';
    const favIcon    = isFavorite(p.id) ? '♥' : '♡';
    const discountPct = p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : null;

    return `
    <div class="product-card reveal reveal-delay-${(i % 3) + 1}" onclick="openModal(${p.id})">
      <div class="product-img-wrap">
        <div class="product-img" style="background:${bg};display:flex;align-items:center;justify-content:center;">
          <div class="product-silhouette">${p.icon}</div>
        </div>
        ${p.badge === 'yeni' ? '<div class="product-badge badge-new">Yeni</div>' : ''}
        ${discountPct ? `<div class="product-badge badge-sale">%${discountPct} İndirim</div>` : ''}
        <button class="fav-btn ${favActive}" data-fav-id="${p.id}"
          onclick="toggleFavorite(${p.id}, event)"
          title="${favActive ? 'Favorilerden çıkar' : 'Favorilere ekle'}">${favIcon}</button>
        <div class="product-actions">
          <button class="pa-btn" onclick="event.stopPropagation(); addToCart(${p.id})">Sepete Ekle</button>
          <button class="pa-btn" onclick="event.stopPropagation(); openModal(${p.id})">İncele</button>
        </div>
      </div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-meta">
          <div>
            <span class="product-price">₺${p.price.toLocaleString('tr-TR')}</span>
            ${p.oldPrice ? `<span class="product-price-old">₺${p.oldPrice.toLocaleString('tr-TR')}</span>` : ''}
          </div>
          <div class="product-sizes">
            <div class="size-dot"></div><div class="size-dot"></div><div class="size-dot"></div>
          </div>
        </div>
      </div>
    </div>`;
  }).join('');

  setTimeout(revealOnScroll, 80);
}

function filterProducts(cat, btn) {
  if (btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  renderProducts(cat);
  scrollToSection('collections');
}

/* ════════════════════════════════════════════════════════════
   6. SEPET
   ════════════════════════════════════════════════════════════ */
function addToCart(id, size = 'M') {
  const p = products.find(x => x.id === id);
  if (!p) return;
  const existing = cart.find(x => x.id === id && x.size === size);
  if (existing) { existing.qty++; }
  else          { cart.push({ ...p, qty: 1, size }); }
  saveCart();
  updateCartUI();
  showToast('Sepete Eklendi ✦', p.name + ' — Beden: ' + size);
}

function openCart() {
  document.getElementById('cart-overlay').classList.add('open');
  document.getElementById('cart-drawer').classList.add('open');
}

function closeCart() {
  document.getElementById('cart-overlay').classList.remove('open');
  document.getElementById('cart-drawer').classList.remove('open');
}

function changeQty(idx, delta) {
  cart[idx].qty += delta;
  if (cart[idx].qty <= 0) cart.splice(idx, 1);
  saveCart();
  updateCartUI();
}

function updateCartUI() {
  const totalQty   = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const badge = document.getElementById('cart-badge');
  if (badge) badge.textContent = totalQty;
  const totalEl = document.getElementById('cart-total');
  if (totalEl) totalEl.textContent = '₺' + totalPrice.toLocaleString('tr-TR');
  const container = document.getElementById('cart-items-container');
  if (!container) return;
  if (cart.length === 0) {
    container.innerHTML = '<div class="cart-empty">Sepetiniz boş<br><br><em>Koleksiyonu keşfetmeye başlayın</em></div>';
    return;
  }
  container.innerHTML = cart.map((item, i) => `
    <div class="cart-item">
      <div class="cart-item-img">${item.icon}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-meta">Beden: ${item.size}</div>
        <div class="cart-item-price">₺${item.price.toLocaleString('tr-TR')}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty(${i}, -1)">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${i}, 1)">+</button>
        </div>
      </div>
    </div>`).join('');
}

function goToCheckout() {
  closeCart();
  updateSummary();
  showPage('checkout');
}

function updateSummary() {
  const container = document.getElementById('summary-items');
  const total     = cart.reduce((s, i) => s + i.price * i.qty, 0);
  if (!container) return;
  container.innerHTML = cart.map(item => `
    <div class="summary-item">
      <span class="summary-item-name">${item.name} ×${item.qty}</span>
      <span class="summary-item-price">₺${(item.price * item.qty).toLocaleString('tr-TR')}</span>
    </div>`).join('');
  const totalEl = document.getElementById('summary-total');
  if (totalEl) totalEl.textContent = '₺' + total.toLocaleString('tr-TR');
}

/* ════════════════════════════════════════════════════════════
   7. FAVORİLER PANELİ
   ════════════════════════════════════════════════════════════ */
function openFavorites() {
  updateFavDrawer();
  document.getElementById('fav-overlay').classList.add('open');
  document.getElementById('fav-drawer').classList.add('open');
}

function closeFavorites() {
  document.getElementById('fav-overlay').classList.remove('open');
  document.getElementById('fav-drawer').classList.remove('open');
}

function updateFavDrawer() {
  const container  = document.getElementById('fav-items-container');
  if (!container) return;
  const favProducts = products.filter(p => favorites.includes(p.id));
  if (favProducts.length === 0) {
    container.innerHTML = '<div class="cart-empty">Henüz favori eklemediniz<br><br><em>♡ ile ürünleri favorileyin</em></div>';
    return;
  }
  container.innerHTML = favProducts.map(p => `
    <div class="cart-item">
      <div class="cart-item-img">${p.icon}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${p.name}</div>
        <div class="cart-item-meta">₺${p.price.toLocaleString('tr-TR')}</div>
        <div style="display:flex;gap:.5rem;margin-top:.7rem;">
          <button class="pa-btn" style="flex:1;border:1px solid rgba(201,168,76,.3);padding:.5rem;"
            onclick="addToCart(${p.id}); closeFavorites();">Sepete Ekle</button>
          <button class="qty-btn" onclick="toggleFavorite(${p.id}); updateFavDrawer();" title="Çıkar">✕</button>
        </div>
      </div>
    </div>`).join('');
}

/* ════════════════════════════════════════════════════════════
   8. ÜRÜN MODALI
   ════════════════════════════════════════════════════════════ */
function openModal(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  currentProductId = id;
  const bgList = ['#1a1714','#131720','#1a1214','#141a12','#1a1618','#181612'];
  const bg = bgList[(id - 1) % bgList.length];
  const modalImg = document.getElementById('modal-img');
  modalImg.textContent = p.icon;
  modalImg.style.background = bg;
  document.getElementById('modal-tag').textContent  = { kadin:'Kadın', erkek:'Erkek', aksesuar:'Aksesuar' }[p.category] || p.category;
  document.getElementById('modal-name').textContent = p.name;
  document.getElementById('modal-price').innerHTML  = `₺${p.price.toLocaleString('tr-TR')}${p.oldPrice ? ` <span style="text-decoration:line-through;color:var(--muted);font-size:.85em;">₺${p.oldPrice.toLocaleString('tr-TR')}</span>` : ''}`;
  document.getElementById('modal-desc').textContent = p.desc;
  const sizesEl = document.getElementById('modal-sizes');
  sizesEl.innerHTML = (p.sizes || ['XS','S','M','L','XL']).map((s, i) =>
    `<button class="size-btn${i===0?' active':''}" onclick="selectSize(this)">${s}</button>`).join('');
  const favBtn = document.getElementById('modal-fav-btn');
  if (favBtn) {
    favBtn.textContent = isFavorite(id) ? 'Favorilerden Çıkar ♥' : 'Favorilere Ekle ♡';
    favBtn.dataset.favId = id;
    favBtn.classList.toggle('fav-active', isFavorite(id));
    favBtn.onclick = () => {
      toggleFavorite(id);
      favBtn.textContent = isFavorite(id) ? 'Favorilerden Çıkar ♥' : 'Favorilere Ekle ♡';
      favBtn.classList.toggle('fav-active', isFavorite(id));
    };
  }
  document.getElementById('product-modal').classList.add('open');
}

function closeModal(e)  { if (e.target === document.getElementById('product-modal')) closeModalDirect(); }
function closeModalDirect() { document.getElementById('product-modal').classList.remove('open'); }
function selectSize(btn) {
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}
function addFromModal() {
  const size = document.querySelector('.size-btn.active')?.textContent || 'M';
  addToCart(currentProductId, size);
  closeModalDirect();
}

/* ════════════════════════════════════════════════════════════
   9. CHECKOUT ADIMLARI
   ════════════════════════════════════════════════════════════ */
function nextStep() {
  if (currentStep < 3) {
    document.getElementById('step-' + currentStep).classList.remove('active');
    document.getElementById('step-' + currentStep).classList.add('done');
    document.getElementById('panel-' + currentStep).classList.remove('active');
    currentStep++;
    document.getElementById('step-' + currentStep).classList.add('active');
    document.getElementById('panel-' + currentStep).classList.add('active');
  }
}
function prevStep() {
  if (currentStep > 1) {
    document.getElementById('step-' + currentStep).classList.remove('active');
    document.getElementById('panel-' + currentStep).classList.remove('active');
    currentStep--;
    document.getElementById('step-' + currentStep).classList.remove('done');
    document.getElementById('step-' + currentStep).classList.add('active');
    document.getElementById('panel-' + currentStep).classList.add('active');
  }
}
function placeOrder() {
  document.getElementById('panel-3').classList.remove('active');
  document.getElementById('panel-success').classList.add('active');
  cart = [];
  saveCart();
  updateCartUI();
  [1, 2, 3].forEach(i => {
    document.getElementById('step-' + i).classList.remove('active', 'done');
  });
  currentStep = 1;
}

/* ════════════════════════════════════════════════════════════
   10. KULLANICI KİMLİK DOĞRULAMA (localStorage tabanlı)
   ════════════════════════════════════════════════════════════ */
function getUsers() {
  try { return JSON.parse(localStorage.getItem(LS_USERS) || '[]'); } catch { return []; }
}
function saveUsers(users) { localStorage.setItem(LS_USERS, JSON.stringify(users)); }
function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem(LS_USER) || 'null'); } catch { return null; }
}

function updateAuthNav() {
  const user = getCurrentUser();
  const authBtn = document.getElementById('auth-nav-btn');
  if (!authBtn) return;
  if (user) {
    authBtn.textContent = '👤 ' + user.name.split(' ')[0];
    authBtn.onclick = () => logoutUser();
    authBtn.title = 'Çıkış Yap';
  } else {
    authBtn.textContent = 'Giriş Yap';
    authBtn.onclick = () => openAuthModal('login');
    authBtn.title = 'Giriş Yap / Kayıt Ol';
  }
}

function openAuthModal(tab = 'login') {
  const modal = document.getElementById('auth-modal');
  if (!modal) return;
  modal.classList.add('open');
  switchAuthTab(tab);
  document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
  clearAuthErrors();
}

function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.auth-panel').forEach(p => p.classList.toggle('active', p.id === 'auth-' + tab));
}

function clearAuthErrors() {
  document.querySelectorAll('.auth-error').forEach(e => { e.textContent = ''; e.style.display = 'none'; });
}

function showAuthError(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function registerUser() {
  clearAuthErrors();
  const name  = document.getElementById('reg-name')?.value.trim();
  const email = document.getElementById('reg-email')?.value.trim().toLowerCase();
  const pass  = document.getElementById('reg-pass')?.value;
  const pass2 = document.getElementById('reg-pass2')?.value;

  if (!name)              return showAuthError('reg-error', 'Ad Soyad gereklidir.');
  if (!email || !email.includes('@')) return showAuthError('reg-error', 'Geçerli bir e-posta girin.');
  if (!pass || pass.length < 6)       return showAuthError('reg-error', 'Şifre en az 6 karakter olmalıdır.');
  if (pass !== pass2)     return showAuthError('reg-error', 'Şifreler eşleşmiyor.');

  const users = getUsers();
  if (users.find(u => u.email === email)) return showAuthError('reg-error', 'Bu e-posta zaten kayıtlı.');

  const newUser = { id: Date.now(), name, email, pass, createdAt: new Date().toISOString() };
  users.push(newUser);
  saveUsers(users);
  localStorage.setItem(LS_USER, JSON.stringify({ id: newUser.id, name, email }));
  closeAuthModal();
  updateAuthNav();
  showToast('Hoş Geldiniz! ✦', name + ' olarak kayıt oldunuz.');
}

function loginUser() {
  clearAuthErrors();
  const email = document.getElementById('login-email')?.value.trim().toLowerCase();
  const pass  = document.getElementById('login-pass')?.value;

  if (!email) return showAuthError('login-error', 'E-posta gereklidir.');
  if (!pass)  return showAuthError('login-error', 'Şifre gereklidir.');

  const users = getUsers();
  const user  = users.find(u => u.email === email && u.pass === pass);
  if (!user) return showAuthError('login-error', 'E-posta veya şifre hatalı.');

  localStorage.setItem(LS_USER, JSON.stringify({ id: user.id, name: user.name, email: user.email }));
  closeAuthModal();
  updateAuthNav();
  showToast('Hoş Geldiniz! ✦', user.name + ' olarak giriş yapıldı.');
}

function logoutUser() {
  localStorage.removeItem(LS_USER);
  updateAuthNav();
  showToast('Çıkış Yapıldı', 'Görüşmek üzere!');
}

/* ════════════════════════════════════════════════════════════
   11. SAYFA SİSTEMİ, SCROLL, REVEAL
   ════════════════════════════════════════════════════════════ */
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(page + '-page').classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}
window.scrollTo_section = scrollToSection;

function revealOnScroll() {
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 60) el.classList.add('visible');
  });
}

/* ════════════════════════════════════════════════════════════
   12. CURSOR
   ════════════════════════════════════════════════════════════ */
const cursor = document.getElementById('cursor');
const ring   = document.getElementById('cursor-ring');
let rx = 0, ry = 0;

if (cursor && ring) {
  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
  });
  (function animRing() {
    rx += (parseFloat(cursor.style.left || 0) - rx) * 0.12;
    ry += (parseFloat(cursor.style.top  || 0) - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  })();
  document.querySelectorAll('button,a').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('cursor-grow'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-grow'));
  });
}

/* ════════════════════════════════════════════════════════════
   13. TESTİMONİALS SLIDER
   ════════════════════════════════════════════════════════════ */
let slideIndex = 0;
function initSlider() {
  const slides        = document.querySelectorAll('.testimonial-slide');
  const dotsContainer = document.getElementById('slider-dots');
  if (!slides.length || !dotsContainer) return;
  dotsContainer.innerHTML = '';
  slides.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'slider-dot' + (i === 0 ? ' active' : '');
    d.onclick = () => goSlide(i);
    dotsContainer.appendChild(d);
  });
  function goSlide(n) {
    slides[slideIndex].classList.remove('active');
    dotsContainer.children[slideIndex]?.classList.remove('active');
    slideIndex = (n + slides.length) % slides.length;
    slides[slideIndex].classList.add('active');
    dotsContainer.children[slideIndex]?.classList.add('active');
  }
  window.nextSlide = () => goSlide(slideIndex + 1);
  window.prevSlide = () => goSlide(slideIndex - 1);
  setInterval(window.nextSlide, 5000);
}

/* ════════════════════════════════════════════════════════════
   14. BÜLTEN
   ════════════════════════════════════════════════════════════ */
function subscribeNewsletter() {
  const email = document.getElementById('nl-email').value;
  if (!email.includes('@')) { showToast('Hata', 'Geçerli bir e-posta girin'); return; }
  document.querySelector('.newsletter-form').style.display = 'none';
  document.getElementById('nl-success').style.display = 'block';
  showToast('Harika!', 'Bültene başarıyla kayıt oldunuz');
}

/* ════════════════════════════════════════════════════════════
   15. TOAST BİLDİRİMİ
   ════════════════════════════════════════════════════════════ */
function showToast(title, msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  document.getElementById('toast-title').textContent = title;
  document.getElementById('toast-msg').textContent   = msg || '';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}

/* ════════════════════════════════════════════════════════════
   16. KART NUMARASI FORMATI
   ════════════════════════════════════════════════════════════ */
function formatCard(inp) {
  let v = inp.value.replace(/\D/g, '');
  inp.value = v.match(/.{1,4}/g)?.join(' ') || v;
}

/* ════════════════════════════════════════════════════════════
   17. HAMBURGER MENÜ
   ════════════════════════════════════════════════════════════ */
function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  if (!hamburger || !mobileNav) return;
  function toggleMenu() {
    hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open');
    document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
  }
  window.closeMenu = function () {
    hamburger.classList.remove('open');
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  };
  hamburger.addEventListener('click', toggleMenu);
}

/* ════════════════════════════════════════════════════════════
   18. NAVBAR SCROLL
   ════════════════════════════════════════════════════════════ */
window.addEventListener('scroll', () => {
  const nav = document.getElementById('main-nav');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 80);
  revealOnScroll();
});

/* ════════════════════════════════════════════════════════════
   19. KLAVYE KISAYOLLARI
   ════════════════════════════════════════════════════════════ */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModalDirect();
    closeCart();
    closeFavorites();
    closeAuthModal();
    if (typeof closeMenu === 'function') closeMenu();
  }
  // Enter ile arama
  if (e.key === 'Enter' && document.activeElement?.id === 'search-input') {
    scrollToSection('collections');
  }
});

/* ════════════════════════════════════════════════════════════
   20. UYGULAMA BAŞLANGICI
   ════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  loadFromStorage();
  updateCartUI();
  updateFavCount();
  loadProducts();
  initSlider();
  initHamburger();
  revealOnScroll();
  updateAuthNav();
});

/* ════════════════════════════════════════════════════════════
   21. localStorage DURUM GÖSTERGESİ
   ════════════════════════════════════════════════════════════ */
(function patchSaveWithIndicator() {
  function flashIndicator() {
    const el = document.getElementById('storage-indicator');
    if (!el) return;
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), 1800);
  }
  const _origSaveCart = saveCart;
  saveCart = function() { _origSaveCart(); flashIndicator(); };
  const _origSaveFav  = saveFavorites;
  saveFavorites = function() { _origSaveFav(); flashIndicator(); };
})();
