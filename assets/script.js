/* ═══════════════════════════════════════════════════════════
   VogueLine — assets/script.js
   Veritabanından ürün çeker, sepet/favorileri yönetir
═══════════════════════════════════════════════════════════ */

/* ── STATE ──────────────────────────────────────────────── */
let allProducts   = [];
let filteredProds = [];
let cart          = JSON.parse(localStorage.getItem('vl_cart') || '[]');
let favorites     = JSON.parse(localStorage.getItem('vl_favs') || '[]');
let currentFilter = 'tumu';
let currentSort   = 'default';
let currentSearch = '';
let modalProduct  = null;

/* ── INIT ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initNav();
  initSlider();
  initReveal();
  updateCartBadge();
  updateFavBadge();
  loadProducts();
  updateAuthBtn();
  duplicateMarquee();
});

/* ── PRODUCTS FROM API ──────────────────────────────────── */
async function loadProducts(kategori = 'tumu', q = '', siralama = 'default') {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  grid.innerHTML = `
    <div style="grid-column:1/-1;text-align:center;padding:4rem;color:var(--muted)">
      <div style="font-size:2rem;margin-bottom:1rem;animation:slowSpin 1s linear infinite;display:inline-block">✦</div>
      <p style="font-family:var(--ff-serif);font-style:italic">Koleksiyon yükleniyor...</p>
    </div>`;

  try {
    const params = new URLSearchParams({ kategori, siralama });
    if (q) params.set('q', q);

    const res  = await fetch(`/api/urunler.php?${params}`);
    const data = await res.json();

    allProducts   = data;
    filteredProds = data;
    renderProducts(data);
  } catch (err) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:4rem;color:var(--muted)">
        <p style="font-family:var(--ff-serif);font-style:italic">Ürünler yüklenirken hata oluştu.</p>
      </div>`;
  }
}

function renderProducts(products) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  if (!products.length) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:4rem;">
        <p style="font-family:var(--ff-serif);font-style:italic;color:var(--muted);font-size:1.2rem">
          Bu kategoride ürün bulunamadı.
        </p>
      </div>`;
    return;
  }

  grid.innerHTML = products.map((p, i) => {
    const isFav   = favorites.some(f => f.id === p.id);
    const hasSale = !!p.indirimli_fiyat;
    const isNew   = !!p.one_cikan;

    // Fotoğraf veya emoji placeholder
    const imgHtml = p.foto_url
      ? `<img src="${p.foto_url}" alt="${escHtml(p.ad)}"
             style="width:100%;height:100%;object-fit:cover;"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
             loading="lazy">
         <div class="product-silhouette" style="display:none">👗</div>`
      : `<div class="product-silhouette">👗</div>`;

    // Bedenler
    const sizes = (p.bedenler || []).slice(0, 4).map(b =>
      `<span class="size-dot" title="${escHtml(b)}"></span>`
    ).join('');

    return `
    <div class="product-card reveal" style="transition-delay:${(i % 3) * 0.1}s"
         data-id="${p.id}">
      <div class="product-img-wrap prod-img-${(i % 6) + 1}">
        ${imgHtml}
        ${hasSale ? `<span class="product-badge badge-sale">İndirim</span>` : ''}
        ${isNew && !hasSale ? `<span class="product-badge badge-new">Yeni</span>` : ''}
        <div class="product-actions">
          <button class="pa-btn" onclick="openModal(${p.id})">Detay</button>
          <button class="pa-btn" onclick="addToCart(${p.id})">Sepete Ekle</button>
          <button class="pa-btn" onclick="toggleFav(${p.id})" id="fav-btn-${p.id}">
            ${isFav ? '♥' : '♡'}
          </button>
        </div>
      </div>
      <div class="product-info">
        <div class="product-name">${escHtml(p.ad)}</div>
        <div class="product-meta">
          <div>
            ${hasSale
              ? `<span class="product-price">${p.indirimli_fiyat_fmt}</span>
                 <span class="product-price-old">${p.fiyat_fmt}</span>`
              : `<span class="product-price">${p.fiyat_fmt}</span>`
            }
          </div>
          <div class="product-sizes">${sizes}</div>
        </div>
      </div>
    </div>`;
  }).join('');

  // Reveal animasyonu tetikle
  setTimeout(() => {
    document.querySelectorAll('#products-grid .reveal').forEach(el => {
      el.classList.add('visible');
    });
  }, 100);
}

/* ── FILTER / SEARCH / SORT ─────────────────────────────── */
function filterProducts(kat, btn) {
  currentFilter = kat;
  if (btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  loadProducts(currentFilter, currentSearch, currentSort);
  if (kat !== 'tumu') {
    document.getElementById('collections')?.scrollIntoView({ behavior: 'smooth' });
  }
}

function handleSearch(val) {
  currentSearch = val;
  loadProducts(currentFilter, currentSearch, currentSort);
}

function handleSort(val) {
  currentSort = val;
  loadProducts(currentFilter, currentSearch, currentSort);
}

/* ── PRODUCT MODAL ──────────────────────────────────────── */
function openModal(id) {
  const p = allProducts.find(x => x.id == id);
  if (!p) return;
  modalProduct = p;

  // Görseli ayarla
  const imgEl = document.getElementById('modal-img');
  if (p.foto_url) {
    imgEl.innerHTML = `<img src="${p.foto_url}" alt="${escHtml(p.ad)}"
      style="width:100%;height:100%;object-fit:cover;"
      onerror="this.outerHTML='<div style=font-size:8rem;opacity:.15>👗</div>'">`;
  } else {
    imgEl.innerHTML = `<div style="font-size:8rem;opacity:.15">👗</div>`;
  }

  document.getElementById('modal-tag').textContent   = p.kategori || '';
  document.getElementById('modal-name').textContent  = p.ad;
  document.getElementById('modal-desc').textContent  = p.aciklama || '';

  const priceEl = document.getElementById('modal-price');
  priceEl.innerHTML = p.indirimli_fiyat_fmt
    ? `${p.indirimli_fiyat_fmt} <span style="text-decoration:line-through;color:var(--muted);font-size:.85em">${p.fiyat_fmt}</span>`
    : p.fiyat_fmt;

  // Bedenler
  const sizesEl = document.querySelector('.modal-sizes');
  if (p.bedenler && p.bedenler.length) {
    sizesEl.innerHTML = p.bedenler.map((b, i) =>
      `<button class="size-btn${i===0?' active':''}" onclick="selectSize(this)">${escHtml(b)}</button>`
    ).join('');
  } else {
    sizesEl.innerHTML = '<span style="color:var(--muted);font-size:.85rem">Standart beden</span>';
  }

  // Favori butonu
  const isFav = favorites.some(f => f.id === p.id);
  document.getElementById('modal-fav-btn').textContent =
    isFav ? 'Favorilerden Çıkar ♥' : 'Favorilere Ekle ♡';

  document.getElementById('product-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(e) {
  if (e.target === document.getElementById('product-modal')) closeModalDirect();
}
function closeModalDirect() {
  document.getElementById('product-modal').classList.remove('open');
  document.body.style.overflow = '';
}

function selectSize(btn) {
  btn.closest('.modal-sizes').querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function addFromModal() {
  if (!modalProduct) return;
  const secilenBeden = document.querySelector('.modal-sizes .size-btn.active')?.textContent || 'Standart';
  addToCartWithSize(modalProduct.id, secilenBeden);
  closeModalDirect();
}

/* ── CART ───────────────────────────────────────────────── */
function addToCart(id) {
  const p = allProducts.find(x => x.id == id);
  if (!p) return;
  addToCartWithSize(id, 'M');
}

function addToCartWithSize(id, beden) {
  const p = allProducts.find(x => x.id == id);
  if (!p) return;

  const fiyat = p.indirimli_fiyat || p.fiyat;
  const existing = cart.find(c => c.id == id && c.beden === beden);

  if (existing) {
    existing.adet++;
  } else {
    cart.push({
      id, ad: p.ad, fiyat: parseFloat(fiyat),
      fiyat_fmt: p.indirimli_fiyat_fmt || p.fiyat_fmt,
      foto_url: p.foto_url, beden, adet: 1
    });
  }

  saveCart();
  updateCartBadge();
  showToast('Sepete Eklendi', p.ad + ' — Beden: ' + beden);
}

function saveCart() {
  localStorage.setItem('vl_cart', JSON.stringify(cart));
}

function updateCartBadge() {
  const total = cart.reduce((s, c) => s + c.adet, 0);
  const badge = document.getElementById('cart-badge');
  if (badge) badge.textContent = total;
}

function openCart() {
  renderCartItems();
  document.getElementById('cart-overlay').classList.add('open');
  document.getElementById('cart-drawer').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cart-overlay').classList.remove('open');
  document.getElementById('cart-drawer').classList.remove('open');
  document.body.style.overflow = '';
}

function renderCartItems() {
  const el = document.getElementById('cart-items-container');
  if (!el) return;

  if (!cart.length) {
    el.innerHTML = `<div class="cart-empty">Sepetiniz boş<br><br><em>Koleksiyonu keşfetmeye başlayın</em></div>`;
    document.getElementById('cart-total').textContent = '₺0';
    return;
  }

  el.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-img">
        ${item.foto_url
          ? `<img src="${item.foto_url}" style="width:100%;height:100%;object-fit:cover"
               onerror="this.outerHTML='<span style=font-size:2.5rem;opacity:.4>👗</span>'">`
          : '<span style="font-size:2.5rem;opacity:.4">👗</span>'}
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${escHtml(item.ad)}</div>
        <div class="cart-item-meta">Beden: ${escHtml(item.beden)}</div>
        <div class="cart-item-price">${item.fiyat_fmt}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty(${item.id},'${item.beden}',-1)">−</button>
          <span class="qty-val">${item.adet}</span>
          <button class="qty-btn" onclick="changeQty(${item.id},'${item.beden}',1)">+</button>
          <button style="background:none;border:none;color:var(--muted);cursor:pointer;margin-left:.5rem;font-size:.75rem"
                  onclick="removeFromCart(${item.id},'${item.beden}')">Kaldır</button>
        </div>
      </div>
    </div>`
  ).join('');

  const total = cart.reduce((s, c) => s + c.fiyat * c.adet, 0);
  document.getElementById('cart-total').textContent =
    '₺' + total.toLocaleString('tr-TR', { minimumFractionDigits: 2 });
}

function changeQty(id, beden, delta) {
  const item = cart.find(c => c.id == id && c.beden === beden);
  if (!item) return;
  item.adet = Math.max(1, item.adet + delta);
  saveCart(); updateCartBadge(); renderCartItems();
}

function removeFromCart(id, beden) {
  cart = cart.filter(c => !(c.id == id && c.beden === beden));
  saveCart(); updateCartBadge(); renderCartItems();
}

function goToCheckout() {
  closeCart();
  renderSummary();
  showPage('checkout');
}

function renderSummary() {
  const el = document.getElementById('summary-items');
  if (!el) return;
  el.innerHTML = cart.map(c =>
    `<div class="summary-item">
      <span class="summary-item-name">${escHtml(c.ad)} ×${c.adet}</span>
      <span class="summary-item-price">₺${(c.fiyat * c.adet).toLocaleString('tr-TR',{minimumFractionDigits:2})}</span>
    </div>`
  ).join('');
  const total = cart.reduce((s, c) => s + c.fiyat * c.adet, 0);
  const el2 = document.getElementById('summary-total');
  if (el2) el2.textContent = '₺' + total.toLocaleString('tr-TR', { minimumFractionDigits: 2 });
}

/* ── FAVORITES ──────────────────────────────────────────── */
function toggleFav(id) {
  const p = allProducts.find(x => x.id == id);
  if (!p) return;

  const idx = favorites.findIndex(f => f.id == id);
  if (idx >= 0) {
    favorites.splice(idx, 1);
    showToast('Favorilerden Çıkarıldı', p.ad);
  } else {
    favorites.push({ id, ad: p.ad, fiyat_fmt: p.indirimli_fiyat_fmt || p.fiyat_fmt,
                     fiyat: parseFloat(p.indirimli_fiyat || p.fiyat), foto_url: p.foto_url });
    showToast('Favorilere Eklendi ♥', p.ad);
  }

  localStorage.setItem('vl_favs', JSON.stringify(favorites));
  updateFavBadge();

  // Kart ve modal butonlarını güncelle
  const btn = document.getElementById('fav-btn-' + id);
  if (btn) btn.textContent = favorites.some(f => f.id == id) ? '♥' : '♡';
  const modalBtn = document.getElementById('modal-fav-btn');
  if (modalBtn && modalProduct?.id == id)
    modalBtn.textContent = favorites.some(f => f.id == id) ? 'Favorilerden Çıkar ♥' : 'Favorilere Ekle ♡';
}

function updateFavBadge() {
  const badge = document.getElementById('fav-badge');
  if (badge) badge.textContent = favorites.length;
}

function openFavorites() {
  renderFavItems();
  document.getElementById('fav-overlay')?.classList.add('open');
  document.getElementById('fav-drawer')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeFavorites() {
  document.getElementById('fav-overlay')?.classList.remove('open');
  document.getElementById('fav-drawer')?.classList.remove('open');
  document.body.style.overflow = '';
}

function renderFavItems() {
  const el = document.getElementById('fav-items-container');
  if (!el) return;

  if (!favorites.length) {
    el.innerHTML = `<div class="cart-empty">Henüz favori eklemediniz<br><br><em>♡ ile ürünleri favorileyin</em></div>`;
    document.getElementById('fav-footer').style.display = 'none';
    return;
  }

  el.innerHTML = favorites.map(f => `
    <div class="cart-item">
      <div class="cart-item-img">
        ${f.foto_url
          ? `<img src="${f.foto_url}" style="width:100%;height:100%;object-fit:cover"
               onerror="this.outerHTML='<span style=font-size:2.5rem;opacity:.4>👗</span>'">`
          : '<span style="font-size:2.5rem;opacity:.4">👗</span>'}
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${escHtml(f.ad)}</div>
        <div class="cart-item-price">${f.fiyat_fmt}</div>
        <div style="display:flex;gap:.5rem;margin-top:.5rem">
          <button style="background:var(--gold);color:var(--bg);border:none;padding:.4rem .8rem;font-size:.7rem;cursor:pointer"
                  onclick="addFavToCart(${f.id})">Sepete Ekle</button>
          <button style="background:none;border:1px solid rgba(255,255,255,.1);color:var(--muted);padding:.4rem .8rem;font-size:.7rem;cursor:pointer"
                  onclick="removeFav(${f.id})">Kaldır</button>
        </div>
      </div>
    </div>`
  ).join('');

  const footer = document.getElementById('fav-footer');
  if (footer) footer.style.display = 'block';
  const count = document.getElementById('fav-count-num');
  if (count) count.textContent = favorites.length + ' ürün';
}

function addFavToCart(id) {
  const f = favorites.find(x => x.id == id);
  if (!f) return;
  const existing = cart.find(c => c.id == id);
  if (existing) { existing.adet++; }
  else { cart.push({ ...f, beden: 'M', adet: 1 }); }
  saveCart(); updateCartBadge();
  showToast('Sepete Eklendi', f.ad);
}

function removeFav(id) {
  favorites = favorites.filter(f => f.id != id);
  localStorage.setItem('vl_favs', JSON.stringify(favorites));
  updateFavBadge(); renderFavItems();
  const btn = document.getElementById('fav-btn-' + id);
  if (btn) btn.textContent = '♡';
}

function addAllFavToCart() {
  favorites.forEach(f => {
    const existing = cart.find(c => c.id == f.id);
    if (existing) { existing.adet++; }
    else { cart.push({ ...f, beden: 'M', adet: 1 }); }
  });
  saveCart(); updateCartBadge();
  closeFavorites();
  openCart();
}

/* ── AUTH (localStorage tabanlı demo) ──────────────────── */
function updateAuthBtn() {
  const user = JSON.parse(localStorage.getItem('vl_user') || 'null');
  const btn  = document.getElementById('auth-nav-btn');
  if (!btn) return;
  if (user) {
    btn.textContent = user.ad.split(' ')[0];
    btn.onclick = logoutUser;
  } else {
    btn.textContent = 'Giriş Yap';
    btn.onclick = () => openAuthModal('login');
  }
}

function openAuthModal(tab) {
  document.getElementById('auth-modal').classList.add('open');
  switchAuthTab(tab);
}

function closeAuthModal() {
  document.getElementById('auth-modal').classList.remove('open');
}

function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.getElementById('auth-login').classList.toggle('active', tab === 'login');
  document.getElementById('auth-register').classList.toggle('active', tab === 'register');
}

function loginUser() {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;
  const err   = document.getElementById('login-error');

  const users = JSON.parse(localStorage.getItem('vl_users') || '[]');
  const user  = users.find(u => u.email === email && u.pass === pass);

  if (!user) { err.style.display='block'; err.textContent='E-posta veya şifre hatalı.'; return; }
  err.style.display = 'none';
  localStorage.setItem('vl_user', JSON.stringify(user));
  closeAuthModal();
  updateAuthBtn();
  showToast('Hoş Geldiniz', user.ad);
}

function registerUser() {
  const ad    = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass  = document.getElementById('reg-pass').value;
  const pass2 = document.getElementById('reg-pass2').value;
  const err   = document.getElementById('reg-error');

  if (!ad || !email || !pass) { err.style.display='block'; err.textContent='Tüm alanları doldurun.'; return; }
  if (pass !== pass2)         { err.style.display='block'; err.textContent='Şifreler eşleşmiyor.'; return; }
  if (pass.length < 6)        { err.style.display='block'; err.textContent='Şifre en az 6 karakter olmalı.'; return; }

  const users = JSON.parse(localStorage.getItem('vl_users') || '[]');
  if (users.find(u => u.email === email)) { err.style.display='block'; err.textContent='Bu e-posta zaten kayıtlı.'; return; }

  const newUser = { ad, email, pass };
  users.push(newUser);
  localStorage.setItem('vl_users', JSON.stringify(users));
  localStorage.setItem('vl_user', JSON.stringify(newUser));
  err.style.display = 'none';
  closeAuthModal();
  updateAuthBtn();
  showToast('Kayıt Başarılı', 'Hoş geldiniz, ' + ad + '!');
}

function logoutUser() {
  localStorage.removeItem('vl_user');
  updateAuthBtn();
  showToast('Çıkış Yapıldı', 'Görüşürüz!');
}

/* ── CHECKOUT STEPS ─────────────────────────────────────── */
let currentStep = 1;

function nextStep() {
  if (currentStep >= 3) { placeOrder(); return; }
  document.getElementById(`panel-${currentStep}`).classList.remove('active');
  document.getElementById(`step-${currentStep}`).classList.add('done');
  currentStep++;
  document.getElementById(`panel-${currentStep}`).classList.add('active');
  document.getElementById(`step-${currentStep}`).classList.add('active');
}

function prevStep() {
  if (currentStep <= 1) return;
  document.getElementById(`panel-${currentStep}`).classList.remove('active');
  document.getElementById(`step-${currentStep}`).classList.remove('active');
  currentStep--;
  document.getElementById(`panel-${currentStep}`).classList.add('active');
}

function placeOrder() {
  document.getElementById(`panel-${currentStep}`).classList.remove('active');
  document.getElementById('panel-success').classList.add('active');
  cart = [];
  saveCart();
  updateCartBadge();
}

/* ── PAGE NAVIGATION ────────────────────────────────────── */
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById(name + '-page');
  if (el) { el.classList.add('active'); window.scrollTo(0, 0); }
}

function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

/* ── NEWSLETTER ─────────────────────────────────────────── */
function subscribeNewsletter() {
  const email = document.getElementById('nl-email').value;
  if (!email.includes('@')) return;
  document.getElementById('nl-success').style.display = 'block';
  document.getElementById('nl-email').value = '';
}

/* ── TOAST ──────────────────────────────────────────────── */
let toastTimer;
function showToast(title, msg) {
  const t = document.getElementById('toast');
  document.getElementById('toast-title').textContent = title;
  document.getElementById('toast-msg').textContent   = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

/* ── CURSOR ─────────────────────────────────────────────── */
function initCursor() {
  const c  = document.getElementById('cursor');
  const cr = document.getElementById('cursor-ring');
  if (!c || !cr || window.innerWidth < 768) return;

  document.addEventListener('mousemove', e => {
    c.style.left  = e.clientX + 'px';
    c.style.top   = e.clientY + 'px';
    setTimeout(() => {
      cr.style.left = e.clientX + 'px';
      cr.style.top  = e.clientY + 'px';
    }, 80);
  });

  document.querySelectorAll('a,button,.cat-card,.product-card').forEach(el => {
    el.addEventListener('mouseenter', () => cr.classList.add('cursor-grow'));
    el.addEventListener('mouseleave', () => cr.classList.remove('cursor-grow'));
  });
}

/* ── NAV ────────────────────────────────────────────────── */
function initNav() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });
}

function toggleMenu() {
  const ham = document.getElementById('hamburger');
  const mob = document.getElementById('mobile-nav');
  if (!ham || !mob) return;
  ham.classList.toggle('open');
  mob.classList.toggle('open');
  document.body.style.overflow = mob.classList.contains('open') ? 'hidden' : '';
}

function closeMenu() {
  document.getElementById('hamburger')?.classList.remove('open');
  document.getElementById('mobile-nav')?.classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('hamburger')?.addEventListener('click', toggleMenu);

/* ── SLIDER ─────────────────────────────────────────────── */
let slideIdx = 0;
function initSlider() {
  const slides = document.querySelectorAll('.testimonial-slide');
  const dotsEl = document.getElementById('slider-dots');
  if (!slides.length || !dotsEl) return;

  slides.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'slider-dot' + (i === 0 ? ' active' : '');
    d.onclick   = () => goSlide(i);
    dotsEl.appendChild(d);
  });
}

function goSlide(idx) {
  const slides = document.querySelectorAll('.testimonial-slide');
  const dots   = document.querySelectorAll('.slider-dot');
  slides[slideIdx]?.classList.remove('active');
  dots[slideIdx]?.classList.remove('active');
  slideIdx = (idx + slides.length) % slides.length;
  slides[slideIdx]?.classList.add('active');
  dots[slideIdx]?.classList.add('active');
}

function nextSlide() { goSlide(slideIdx + 1); }
function prevSlide() { goSlide(slideIdx - 1); }

setInterval(() => nextSlide(), 5000);

/* ── REVEAL ON SCROLL ───────────────────────────────────── */
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

/* ── MARQUEE ────────────────────────────────────────────── */
function duplicateMarquee() {
  const track = document.getElementById('marquee-track');
  if (track && track.children.length === 1) {
    track.appendChild(track.children[0].cloneNode(true));
  }
}

/* ── CARD FORMAT ────────────────────────────────────────── */
function formatCard(input) {
  let v = input.value.replace(/\D/g, '').substring(0, 16);
  input.value = v.replace(/(\d{4})(?=\d)/g, '$1 ');
}

/* ── UTIL ───────────────────────────────────────────────── */
function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
