/* ═══════════════════════════════════════════════════════════════
   VogueLine — script.js
   ▸ Ürün verileri ayrı JSON dosyasından (fetch) okunur
   ▸ Sepet ve Favoriler localStorage'a kalıcı olarak kaydedilir
   ═══════════════════════════════════════════════════════════════ */

/* ── GLOBAL STATE ──────────────────────────────────────────── */
let products     = [];   // JSON'dan yüklenecek
let cart         = [];   // { ...product, qty, size }
let favorites    = [];   // [ productId, ... ]
let currentStep  = 1;
let currentProductId = null;

/* ── localStorage ANAHTARLARI ──────────────────────────────── */
const LS_CART = 'vogueline_cart';
const LS_FAV  = 'vogueline_favorites';

/* ════════════════════════════════════════════════════════════
   1. JSON VERİSİNİ FETCH İLE YÜKLEMEk
   ════════════════════════════════════════════════════════════ */
async function loadProducts() {
  try {
    const res  = await fetch('data/products.json');
    if (!res.ok) throw new Error('JSON yüklenemedi: ' + res.status);
    products = await res.json();
    console.log(`✅ ${products.length} ürün yüklendi`);
    renderProducts();          // veriler geldikten sonra kartları çiz
    initFavoritesUI();         // favori butonlarını güncelle
  } catch (err) {
    console.error('Ürün verisi hatası:', err);
    showToast('Hata', 'Ürün verileri yüklenemedi.');
  }
}

/* ════════════════════════════════════════════════════════════
   2. localStorage — KAYDET & YÜKLE
   ════════════════════════════════════════════════════════════ */

/** localStorage'dan sepet ve favorileri yükle (sayfa yenilenince kalıcı) */
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

/** Sepeti localStorage'a kaydet */
function saveCart() {
  localStorage.setItem(LS_CART, JSON.stringify(cart));
}

/** Favorileri localStorage'a kaydet */
function saveFavorites() {
  localStorage.setItem(LS_FAV, JSON.stringify(favorites));
}

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
  saveFavorites();       // localStorage'a yaz
  updateFavButtons();    // tüm kalp butonlarını güncelle
  updateFavCount();      // nav'daki sayacı güncelle
}

function isFavorite(id) {
  return favorites.includes(id);
}

/** Sayfadaki tüm favori butonlarının doluluk durumunu güncelle */
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

function initFavoritesUI() {
  updateFavButtons();
  updateFavCount();
}

/* ════════════════════════════════════════════════════════════
   4. ÜRÜN KARTLARINI RENDER ET (JSON'dan dinamik)
   ════════════════════════════════════════════════════════════ */
function renderProducts(filter = 'tumu') {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  // Filtre uygula
  let filtered = products;
  if (filter === 'indirim') {
    filtered = products.filter(p => p.oldPrice);
  } else if (filter === 'yeni') {
    filtered = products.filter(p => p.badge === 'yeni');
  } else if (filter !== 'tumu') {
    filtered = products.filter(p => p.category === filter);
  }

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:4rem;font-family:var(--ff-serif);font-style:italic;color:var(--muted);">Bu kategoride ürün bulunamadı.</div>`;
    return;
  }

  grid.innerHTML = filtered.map((p, i) => {
    const bgList = ['#1a1714','#131720','#1a1214','#141a12','#1a1618','#181612'];
    const bg     = bgList[i % bgList.length];
    const favActive = isFavorite(p.id) ? 'fav-active' : '';
    const favIcon   = isFavorite(p.id) ? '♥' : '♡';
    const discountPct = p.oldPrice
      ? Math.round((1 - p.price / p.oldPrice) * 100)
      : null;

    return `
    <div class="product-card reveal reveal-delay-${(i % 3) + 1}" onclick="openModal(${p.id})">
      <div class="product-img-wrap">
        <div class="product-img" style="background:${bg};display:flex;align-items:center;justify-content:center;">
          <div class="product-silhouette">${p.icon}</div>
        </div>

        ${p.badge === 'yeni' ? '<div class="product-badge badge-new">Yeni</div>' : ''}
        ${discountPct      ? `<div class="product-badge badge-sale">%${discountPct} İndirim</div>` : ''}

        <!-- Favori butonu (her kartta görünür) -->
        <button
          class="fav-btn ${favActive}"
          data-fav-id="${p.id}"
          onclick="toggleFavorite(${p.id}, event)"
          title="${favActive ? 'Favorilerden çıkar' : 'Favorilere ekle'}">
          ${favIcon}
        </button>

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
            <div class="size-dot"></div>
            <div class="size-dot"></div>
            <div class="size-dot"></div>
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
   5. SEPET
   ════════════════════════════════════════════════════════════ */
function addToCart(id, size = 'M') {
  const p = products.find(x => x.id === id);
  if (!p) return;
  const existing = cart.find(x => x.id === id && x.size === size);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...p, qty: 1, size });
  }
  saveCart();          // ← localStorage'a kaydet
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
  saveCart();          // ← localStorage'a kaydet
  updateCartUI();
}

function updateCartUI() {
  const totalQty   = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

  // Badge
  const badge = document.getElementById('cart-badge');
  if (badge) badge.textContent = totalQty;

  // Toplam fiyat
  const totalEl = document.getElementById('cart-total');
  if (totalEl) totalEl.textContent = '₺' + totalPrice.toLocaleString('tr-TR');

  // Sepet içeriği
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
    </div>
  `).join('');
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
    </div>
  `).join('');
  const totalEl = document.getElementById('summary-total');
  if (totalEl) totalEl.textContent = '₺' + total.toLocaleString('tr-TR');
}

/* ════════════════════════════════════════════════════════════
   6. FAVORİLER PANELİ (drawer)
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
  const container = document.getElementById('fav-items-container');
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
    </div>
  `).join('');
}

/* ════════════════════════════════════════════════════════════
   7. ÜRÜN MODALI
   ════════════════════════════════════════════════════════════ */
function openModal(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  currentProductId = id;

  const bgList = ['#1a1714','#131720','#1a1214','#141a12','#1a1618','#181612'];
  const bg = bgList[(id - 1) % bgList.length];

  const modalImg = document.getElementById('modal-img');
  modalImg.textContent   = p.icon;
  modalImg.style.background = bg;

  document.getElementById('modal-tag').textContent  = { kadin:'Kadın', erkek:'Erkek', aksesuar:'Aksesuar' }[p.category] || p.category;
  document.getElementById('modal-name').textContent = p.name;
  document.getElementById('modal-price').innerHTML  = `₺${p.price.toLocaleString('tr-TR')}${p.oldPrice ? ` <span style="text-decoration:line-through;color:var(--muted);font-size:.85em;">₺${p.oldPrice.toLocaleString('tr-TR')}</span>` : ''}`;
  document.getElementById('modal-desc').textContent = p.desc;

  // Beden butonları — JSON'dan dinamik
  const sizesEl = document.getElementById('modal-sizes');
  sizesEl.innerHTML = (p.sizes || ['XS','S','M','L','XL']).map((s, i) =>
    `<button class="size-btn${i===0?' active':''}" onclick="selectSize(this)">${s}</button>`
  ).join('');

  // Favori butonu modalda
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

function closeModal(e) {
  if (e.target === document.getElementById('product-modal')) closeModalDirect();
}
function closeModalDirect() {
  document.getElementById('product-modal').classList.remove('open');
}
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
   8. CHECKOUT ADIMLARI
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
  // Siparişi tamamlayınca sepeti temizle
  cart = [];
  saveCart();
  updateCartUI();
  [1, 2, 3].forEach(i => {
    document.getElementById('step-' + i).classList.remove('active', 'done');
  });
  currentStep = 1;
}

/* ════════════════════════════════════════════════════════════
   9. SAYFA SİSTEMİ, SCROLL, REVEAL
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
// Eski scrollTo çağrılarıyla uyumluluk için alias
window.scrollTo_section = scrollToSection;

function revealOnScroll() {
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 60) el.classList.add('visible');
  });
}

/* ════════════════════════════════════════════════════════════
   10. CURSOR
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
   11. TESTİMONİALS SLIDER
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
   12. BÜLTEN
   ════════════════════════════════════════════════════════════ */
function subscribeNewsletter() {
  const email = document.getElementById('nl-email').value;
  if (!email.includes('@')) { showToast('Hata', 'Geçerli bir e-posta girin'); return; }
  document.querySelector('.newsletter-form').style.display = 'none';
  document.getElementById('nl-success').style.display = 'block';
  showToast('Harika!', 'Bültene başarıyla kayıt oldunuz');
}

/* ════════════════════════════════════════════════════════════
   13. TOAST BİLDİRİMİ
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
   14. KART NUMARASI FORMATI
   ════════════════════════════════════════════════════════════ */
function formatCard(inp) {
  let v = inp.value.replace(/\D/g, '');
  inp.value = v.match(/.{1,4}/g)?.join(' ') || v;
}

/* ════════════════════════════════════════════════════════════
   15. HAMBURGER MENÜ
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
   16. NAVBAR SCROLL
   ════════════════════════════════════════════════════════════ */
window.addEventListener('scroll', () => {
  const nav = document.getElementById('main-nav');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 80);
  revealOnScroll();
});

/* ════════════════════════════════════════════════════════════
   17. KLAVYE KISAYOLLARI
   ════════════════════════════════════════════════════════════ */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModalDirect();
    closeCart();
    closeFavorites();
    if (typeof closeMenu === 'function') closeMenu();
  }
});

/* ════════════════════════════════════════════════════════════
   18. UYGULAMA BAŞLANGICI
   ════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  loadFromStorage();   // 1. localStorage'dan sepet ve favorileri yükle
  updateCartUI();      // 2. Sepet UI'ı güncelle
  updateFavCount();    // 3. Favori sayacını güncelle
  loadProducts();      // 4. JSON'dan ürünleri fetch et ve kartları çiz
  initSlider();        // 5. Testimonials slider
  initHamburger();     // 6. Hamburger menü
  revealOnScroll();    // 7. Scroll animasyonları
});

/* ════════════════════════════════════════════════════════════
   19. localStorage DURUM GÖSTERGESI
   ════════════════════════════════════════════════════════════ */
(function patchSaveWithIndicator() {
  const origSaveCart = window.saveCart || function(){};
  const origSaveFav  = window.saveFavorites || function(){};
  function flashIndicator() {
    const el = document.getElementById('storage-indicator');
    if (!el) return;
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), 1800);
  }
  // Monkey-patch: her kayıtta gösterge çak
  const _origSaveCart = saveCart;
  saveCart = function() { _origSaveCart(); flashIndicator(); };
  const _origSaveFav  = saveFavorites;
  saveFavorites = function() { _origSaveFav(); flashIndicator(); };
})();
