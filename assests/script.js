/* ── PRODUCTS DATA ──────────────────────────────── */
const products = [
  { id:1, name:'Jasmine Silk Bluz', category:'kadin', price:1890, icon:'👗', badge:'yeni', desc:'İpek dokulu premium kumaştan üretilmiş, minimal kesimli bluz. Her ortama uygun zarif bir seçim.' },
  { id:2, name:'Onyx Slim Takım', category:'erkek', price:4250, icon:'🤵', badge:'yeni', desc:'Merino yün karışımlı kumaştan üretilen bu slim fit takım elbise, profesyonel ve şık görünümü bir arada sunar.' },
  { id:3, name:'Luna Deri Çanta', category:'aksesuar', price:3100, oldPrice:3900, icon:'👜', badge:'sale', desc:'Tam tahıllı deri ve el yapımı detaylarıyla hazırlanmış. Her gün kullanıma uygun.' },
  { id:4, name:'Ember Trençkot', category:'kadin', price:5650, icon:'🧥', badge:'', desc:'Kashmere yün karışımlı çift katmanlı trençkot. Sonbahar ve kış için ideal.' },
  { id:5, name:'Noir Oxford Ayakkabı', category:'erkek', price:2800, oldPrice:3200, icon:'👞', badge:'sale', desc:'El boyamalı İtalyan deri üst ve tahta taban. Klasik şıklığın simgesi.' },
  { id:6, name:'Aurore Kolye', category:'aksesuar', price:890, icon:'💎', badge:'yeni', desc:'925 ayar gümüş zincir üzerine altın kaplama yuvarlak kolye. Minimalist şıklık.' },
];

let cart = [];
let currentStep = 1;
let currentProductId = null;

/* ── CURSOR ─────────────────────────────────────── */
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let rx=0,ry=0;
document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX+'px';
  cursor.style.top = e.clientY+'px';
  rx += (e.clientX - rx) * .15;
  ry += (e.clientY - ry) * .15;
  ring.style.left = rx+'px';
  ring.style.top = ry+'px';
});
function animRing(){
  rx += (parseFloat(cursor.style.left||0) - rx) * .12;
  ry += (parseFloat(cursor.style.top||0) - ry) * .12;
  ring.style.left = rx+'px';
  ring.style.top = ry+'px';
  requestAnimationFrame(animRing);
}
animRing();
document.querySelectorAll('button,a').forEach(el=>{
  el.addEventListener('mouseenter',()=>cursor.classList.add('cursor-grow'));
  el.addEventListener('mouseleave',()=>cursor.classList.remove('cursor-grow'));
});

/* ── NAVBAR SCROLL ──────────────────────────────── */
window.addEventListener('scroll',()=>{
  document.getElementById('main-nav').classList.toggle('scrolled', window.scrollY > 80);
  revealOnScroll();
});

/* ── REVEAL ON SCROLL ───────────────────────────── */
function revealOnScroll(){
  document.querySelectorAll('.reveal:not(.visible)').forEach(el=>{
    const rect = el.getBoundingClientRect();
    if(rect.top < window.innerHeight - 60) el.classList.add('visible');
  });
}
revealOnScroll();

/* ── SCROLL TO SECTION ──────────────────────────── */
function scrollTo(id){
  const el = document.getElementById(id);
  if(el) el.scrollIntoView({behavior:'smooth'});
}

/* ── PAGE SYSTEM ────────────────────────────────── */
function showPage(page){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(page+'-page').classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
}

/* ── PRODUCTS RENDER ────────────────────────────── */
function renderProducts(filter='tumu'){
  const grid = document.getElementById('products-grid');
  const filtered = filter==='tumu' ? products : products.filter(p=>p.category===filter||(filter==='indirim'&&p.oldPrice)||(filter==='yeni'&&p.badge==='yeni'));
  grid.innerHTML = filtered.map((p,i)=>`
    <div class="product-card reveal reveal-delay-${(i%3)+1}" onclick="openModal(${p.id})">
      <div class="product-img-wrap">
        <div class="product-img prod-img-${(i%6)+1}">
          <div class="product-silhouette">${p.icon}</div>
        </div>
        ${p.badge==='yeni'?'<div class="product-badge badge-new">Yeni</div>':''}
        ${p.badge==='sale'?'<div class="product-badge badge-sale">İndirim</div>':''}
        <div class="product-actions">
          <button class="pa-btn" onclick="event.stopPropagation();addToCart(${p.id})">Sepete Ekle</button>
          <button class="pa-btn" onclick="event.stopPropagation();openModal(${p.id})">İncele</button>
        </div>
      </div>
      <div class="product-info">
        <div class="product-name">${p.name}</div>
        <div class="product-meta">
          <div>
            <span class="product-price">₺${p.price.toLocaleString('tr-TR')}</span>
            ${p.oldPrice?`<span class="product-price-old">₺${p.oldPrice.toLocaleString('tr-TR')}</span>`:''}
          </div>
          <div class="product-sizes">
            <div class="size-dot"></div>
            <div class="size-dot"></div>
            <div class="size-dot"></div>
          </div>
        </div>
      </div>
    </div>
  `).join('');
  setTimeout(revealOnScroll, 100);
}
renderProducts();

function filterProducts(cat, btn){
  if(btn){
    document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
  }
  renderProducts(cat);
  scrollTo('collections');
}

/* ── TESTIMONIALS SLIDER ────────────────────────── */
let slideIndex = 0;
const slides = document.querySelectorAll('.testimonial-slide');
const dotsContainer = document.getElementById('slider-dots');
slides.forEach((_,i)=>{
  const d = document.createElement('div');
  d.className = 'slider-dot'+(i===0?' active':'');
  d.onclick = ()=>goSlide(i);
  dotsContainer.appendChild(d);
});
function goSlide(n){
  slides[slideIndex].classList.remove('active');
  dotsContainer.children[slideIndex].classList.remove('active');
  slideIndex = (n+slides.length)%slides.length;
  slides[slideIndex].classList.add('active');
  dotsContainer.children[slideIndex].classList.add('active');
}
function nextSlide(){ goSlide(slideIndex+1); }
function prevSlide(){ goSlide(slideIndex-1); }
setInterval(nextSlide, 5000);

/* ── NEWSLETTER ─────────────────────────────────── */
function subscribeNewsletter(){
  const email = document.getElementById('nl-email').value;
  if(!email.includes('@')){ showToast('Hata','Geçerli bir e-posta girin'); return; }
  document.querySelector('.newsletter-form').style.display='none';
  document.getElementById('nl-success').style.display='block';
  showToast('Harika!','Bültene başarıyla kayıt oldunuz');
}

/* ── CART ───────────────────────────────────────── */
function addToCart(id, size='M'){
  const p = products.find(x=>x.id===id);
  const existing = cart.find(x=>x.id===id&&x.size===size);
  if(existing) existing.qty++;
  else cart.push({...p, qty:1, size});
  updateCart();
  showToast('Sepete Eklendi', p.name+' — Beden: '+size);
}
function openCart(){ document.getElementById('cart-overlay').classList.add('open'); document.getElementById('cart-drawer').classList.add('open'); }
function closeCart(){ document.getElementById('cart-overlay').classList.remove('open'); document.getElementById('cart-drawer').classList.remove('open'); }
function updateCart(){
  const badge = document.getElementById('cart-badge');
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  badge.textContent = cart.reduce((s,i)=>s+i.qty,0);
  document.getElementById('cart-total').textContent = '₺'+total.toLocaleString('tr-TR');
  const container = document.getElementById('cart-items-container');
  if(cart.length===0){ container.innerHTML='<div class="cart-empty">Sepetiniz boş<br><br><em>Koleksiyonu keşfetmeye başlayın</em></div>'; return; }
  container.innerHTML = cart.map((item,i)=>`
    <div class="cart-item">
      <div class="cart-item-img">${item.icon}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-meta">Beden: ${item.size}</div>
        <div class="cart-item-price">₺${item.price.toLocaleString('tr-TR')}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty(${i},-1)">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${i},1)">+</button>
        </div>
      </div>
    </div>
  `).join('');
}
function changeQty(idx, delta){
  cart[idx].qty += delta;
  if(cart[idx].qty <= 0) cart.splice(idx,1);
  updateCart();
}
function goToCheckout(){
  closeCart();
  updateSummary();
  showPage('checkout');
}
function updateSummary(){
  const container = document.getElementById('summary-items');
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  container.innerHTML = cart.map(item=>`
    <div class="summary-item">
      <span class="summary-item-name">${item.name} ×${item.qty}</span>
      <span class="summary-item-price">₺${(item.price*item.qty).toLocaleString('tr-TR')}</span>
    </div>
  `).join('');
  document.getElementById('summary-total').textContent = '₺'+total.toLocaleString('tr-TR');
}

/* ── CHECKOUT STEPS ─────────────────────────────── */
function nextStep(){
  if(currentStep<3){
    document.getElementById('step-'+currentStep).classList.remove('active');
    document.getElementById('step-'+currentStep).classList.add('done');
    document.getElementById('panel-'+currentStep).classList.remove('active');
    currentStep++;
    document.getElementById('step-'+currentStep).classList.add('active');
    document.getElementById('panel-'+currentStep).classList.add('active');
  }
}
function loadPage(page) {
  const content = document.getElementById('main-content');
  const pages = {
    about: '<h1>Hakkımızda</h1><p>İçerik buraya...</p>',
    projects: '<h1>Projeler</h1><p>İçerik buraya...</p>',
    contact: '<h1>İletişim</h1><p>İçerik buraya...</p>'
  };
  content.innerHTML = pages[page] || '<p>Sayfa bulunamadı</p>';
}
function prevStep(){
  if(currentStep>1){
    document.getElementById('step-'+currentStep).classList.remove('active');
    document.getElementById('panel-'+currentStep).classList.remove('active');
    currentStep--;
    document.getElementById('step-'+currentStep).classList.remove('done');
    document.getElementById('step-'+currentStep).classList.add('active');
    document.getElementById('panel-'+currentStep).classList.add('active');
  }
}
function placeOrder(){
  document.getElementById('panel-3').classList.remove('active');
  document.getElementById('panel-success').classList.add('active');
  cart = []; updateCart();
  [1,2,3].forEach(i=>{
    document.getElementById('step-'+i).classList.remove('active','done');
  });
  currentStep=1;
}

/* ── PRODUCT MODAL ──────────────────────────────── */
function openModal(id){
  const p = products.find(x=>x.id===id);
  currentProductId = id;
  document.getElementById('modal-img').textContent = p.icon;
  document.getElementById('modal-img').style.fontSize = '8rem';
  document.getElementById('modal-img').style.opacity = '.15';
  const bg = ['#1a1714','#131720','#1a1214','#141a12','#1a1618','#181612'];
  document.getElementById('modal-img').style.background = bg[(id-1)%bg.length];
  document.getElementById('modal-tag').textContent = {kadin:'Kadın',erkek:'Erkek',aksesuar:'Aksesuar'}[p.category];
  document.getElementById('modal-name').textContent = p.name;
  document.getElementById('modal-price').textContent = '₺'+p.price.toLocaleString('tr-TR');
  document.getElementById('modal-desc').textContent = p.desc;
  document.querySelectorAll('.size-btn').forEach((b,i)=>b.classList.toggle('active',i===2));
  document.getElementById('product-modal').classList.add('open');
}
function closeModal(e){ if(e.target===document.getElementById('product-modal')) closeModalDirect(); }
function closeModalDirect(){ document.getElementById('product-modal').classList.remove('open'); }
function selectSize(btn){ document.querySelectorAll('.size-btn').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); }
function addFromModal(){
  const size = document.querySelector('.size-btn.active')?.textContent || 'M';
  addToCart(currentProductId, size);
  closeModalDirect();
}

/* ── TOAST ──────────────────────────────────────── */
function showToast(title, msg){
  const toast = document.getElementById('toast');
  document.getElementById('toast-title').textContent = title;
  document.getElementById('toast-msg').textContent = msg;
  toast.classList.add('show');
  setTimeout(()=>toast.classList.remove('show'), 3000);
}

/* ── CARD FORMAT ────────────────────────────────── */
function formatCard(inp){
  let v = inp.value.replace(/\D/g,'');
  inp.value = v.match(/.{1,4}/g)?.join(' ')||v;
}

/* ── KEYBOARD ───────────────────────────────────── */
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){ closeModalDirect(); closeCart(); }
});
