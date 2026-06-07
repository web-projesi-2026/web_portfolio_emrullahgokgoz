# VogueLine — Premium Moda & Koleksiyon 2026

**VogueLine**, premium moda ürünlerini sergileyen, modern ve responsive bir e-ticaret ön yüz projesidir. Bahar/Yaz 2026 koleksiyonunu kullanıcıya şık bir deneyimle sunar.

---

## 🚀 Özellikler

### Kullanıcı Deneyimi
- **Ürün Arama Kutusu** — Koleksiyon bölümünde gerçek zamanlı ürün adı/açıklama araması
- **İsim & Fiyata Göre Sıralama** — A→Z, Z→A, Düşükten Yükseğe, Yüksekten Düşüğe seçenekleri
- **Kategori Filtreleme** — Kadın, Erkek, Aksesuar, Yeni Gelenler, İndirim filtreleri
- **Ürün Modalı** — Beden seçimi, detay görünümü
- **Sepet & Favoriler** — Gerçek zamanlı sepet yönetimi, favori ürün listesi
- **Özel Cursor & Animasyonlar** — Premium marka deneyimi
- **Testimonials Slider** — Otomatik geçişli müşteri yorumları
- **Responsive Tasarım** — Mobil, tablet ve masaüstü uyumlu

### Veri Yönetimi (JSON)
- Tüm ürün verileri `data/products.json` dosyasından `fetch()` API ile asenkron olarak yüklenir
- Ürünler dinamik olarak kart yapısında DOM'a render edilir
- Sepet ve favoriler `localStorage` ile kalıcı olarak saklanır

### Kullanıcı Kimlik Doğrulama (localStorage tabanlı)
- **Kayıt Ol** — Ad, e-posta ve şifre ile yeni hesap oluşturma (doğrulama + şifre eşleşme kontrolü)
- **Giriş Yap** — Mevcut hesapla oturum açma
- **Çıkış Yap** — Oturumu kapatma
- Kullanıcılar ve oturum bilgisi `localStorage`'da saklanır; backend olmadan tam işlevsellik

### Profesyonel Detaylar
- Tüm sayfalarda `<title>` etiketleri ve SVG favicon
- Kırık linkler düzeltildi (footer & nav)
- Kod tekrarları azaltıldı (ortak `script.js`, merkezi render fonksiyonları)
- Checkout akışı (3 adım: Bilgiler → Teslimat → Ödeme)

---

## 🛠 Kullanılan Teknolojiler

| Teknoloji | Kullanım Amacı |
|-----------|---------------|
| HTML5     | Sayfa yapısı ve semantik işaretleme |
| CSS3      | Özel değişkenler, animasyonlar, responsive grid |
| JavaScript (ES6+) | Dinamik DOM, fetch API, localStorage, async/await |
| JSON      | Ürün verilerini dışarıdan yükleme |
| Google Fonts | Cormorant Garamond, Bebas Neue, DM Sans |

---

## 📁 Proje Yapısı

```
vogueline/
├── index.html              # Ana sayfa (hero, koleksiyon, checkout)
├── data/
│   └── products.json       # Ürün veritabanı (JSON)
├── assets/
│   ├── style.css           # Global stiller ve bileşenler
│   └── script.js           # Tüm JavaScript işlevleri
└── pages/
    ├── about.html          # Hakkımızda sayfası
    ├── contact.html        # İletişim sayfası
    └── projects.html       # Projeler / Lookbook sayfası
```

---

## ⚙️ Kurulum & Çalıştırma

Proje saf HTML/CSS/JS'den oluştuğundan herhangi bir derleme adımı gerekmez.

```bash
# Yerel geliştirme için (fetch() için HTTP sunucusu gereklidir)
npx serve .
# veya
python3 -m http.server 8080
```

Tarayıcıda `http://localhost:8080` adresini açın.

> ⚠️ `fetch()` çağrıları CORS kısıtlamaları nedeniyle doğrudan `file://` protokolüyle çalışmaz; bir HTTP sunucusu kullanın.

---

## 📸 Ekran Görüntüleri

| Sayfa | Açıklama |
|-------|----------|
| Ana Sayfa — Hero | Tam ekran hero bölümü, marquee animasyonu |
| Koleksiyon | Arama, sıralama, filtreleme, ürün kartları |
| Giriş / Kayıt | Modal tabanlı auth sistemi |
| Sepet & Favoriler | Yan panel çekmeceler |
| Checkout | 3 adımlı ödeme akışı |

---

## 👤 Geliştirici Notları

- Kullanıcı kimlik doğrulama sistemi `localStorage` tabanlıdır; gerçek bir projede şifreler backend tarafında hash'lenerek saklanmalıdır.
- Ürün görselleri CSS gradient ve emoji ikonlarla temsil edilmiştir; gerçek proje için görsel URL'leri `products.json`'a eklenmelidir.

---

© 2026 VogueLine. Tüm hakları saklıdır.
