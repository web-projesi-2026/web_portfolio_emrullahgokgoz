<div align="center">

<br>

```
 ██╗   ██╗ ██████╗  ██████╗ ██╗   ██╗███████╗██╗     ██╗███╗   ██╗███████╗
 ██║   ██║██╔═══██╗██╔════╝ ██║   ██║██╔════╝██║     ██║████╗  ██║██╔════╝
 ██║   ██║██║   ██║██║  ███╗██║   ██║█████╗  ██║     ██║██╔██╗ ██║█████╗  
 ╚██╗ ██╔╝██║   ██║██║   ██║██║   ██║██╔══╝  ██║     ██║██║╚██╗██║██╔══╝  
  ╚████╔╝ ╚██████╔╝╚██████╔╝╚██████╔╝███████╗███████╗██║██║ ╚████║███████╗
   ╚═══╝   ╚═════╝  ╚═════╝  ╚═════╝ ╚══════╝╚══════╝╚═╝╚═╝  ╚═══╝╚══════╝
```

### ✦ Premium Moda & Koleksiyon Platformu ✦

*Karanlık tema · Altın aksanlar · Sıfır sunucu*

<br>

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Canlı-c9a84c?style=flat-square&logo=github)](https://kullanici.github.io/vogueline)
[![Lisans](https://img.shields.io/badge/Lisans-MIT-7a7668?style=flat-square)](LICENSE)
[![Versiyon](https://img.shields.io/badge/Versiyon-2.0_Static-e8e4d8?style=flat-square)]()
[![Dil](https://img.shields.io/badge/Dil-Türkçe-c9a84c?style=flat-square)]()

<br>

---

</div>

## ✦ Proje Hakkında

VogueLine, saf HTML, CSS ve JavaScript ile inşa edilmiş; **herhangi bir sunucu ya da veritabanı gerektirmeden** GitHub Pages üzerinde çalışan bir premium moda e-ticaret vitriниdir.

Ürünler `data/products.json` dosyasından okunur — dosyayı düzenlemek tek başına yeterlidir. Dağıtım karmaşıklığı, hosting ücreti ve sunucu konfigürasyonu yoktur.

> *"Bir butik gibi görünür, bir statik site gibi çalışır."*

<br>

---

## ✦ Özellikler

### 🎨 Tasarım & Animasyon

| Özellik | Detay |
|---|---|
| **Özel cursor** | Altın nokta + halka, hover'da büyür |
| **Scroll reveal** | Ürün kartları sayfa kaydırıldıkça belirir |
| **Hero slider** | Otomatik geçişli tam ekran koleksiyon bantı |
| **Marquee şeridi** | Sonsuz kayan marka yazısı |
| **Toast bildirimleri** | Sepet, favori, hata işlemleri için anlık geri bildirim |
| **Noise texture** | SVG tabanlı film tanesi efekti |
| **Karanlık tema** | `#0a0a08` zemin, `#c9a84c` altın aksanlar |

<br>

### 🛍️ Ürün Deneyimi

| Özellik | Detay |
|---|---|
| **Kategori filtresi** | Elbise · Ceket · Bluz · Pantolon · Etek · Dış Giyim · Kazak |
| **Canlı arama** | Ad, açıklama ve kategoriye göre anlık filtreleme |
| **Sıralama** | Fiyat artan/azalan · En yeni · Öne çıkanlar |
| **Ürün modalı** | Tam ekran detay, beden seçimi, açıklama |
| **İndirim rozeti** | İndirimli ürünlerde otomatik badge + üstü çizili eski fiyat |
| **Yeni rozeti** | `one_cikan: true` ürünlerde altın "Yeni" etiketi |

<br>

### 🛒 Sepet & Favoriler

| Özellik | Detay |
|---|---|
| **Sepet çekmecesi** | Sağdan açılan panel, adet artırma/azaltma |
| **Beden seçimi** | Modaldan veya karttan eklerken beden seçilir |
| **Favoriler** | ♡ / ♥ toggle, ayrı panel |
| **Kalıcılık** | `localStorage` — sayfa yenilenince kaybolmaz |
| **Canlı sayaç** | Nav'daki sepet/favori badge'leri anında güncellenir |

<br>

### 👤 Kullanıcı Sistemi

| Özellik | Detay |
|---|---|
| **Giriş / Kayıt modalı** | Tab geçişli tek panel |
| **localStorage oturumu** | Sunucu gerektirmez, tarayıcıda tutulur |
| **Dinamik nav butonu** | Giriş yapılınca "Çıkış Yap" olarak değişir |

<br>

---

## ✦ Dosya Yapısı

```
vogueline/
│
├── index.html              ← Tüm site tek dosyada (CSS dahil)
│
├── assets/
│   └── script.js           ← Tüm JS mantığı; JSON'dan okur
│
├── data/
│   └── products.json       ← Ürün kataloğu ← buradan düzenle
│
├── _config.yml             ← Jekyll: PHP dosyalarını hariç tutar
├── .gitignore
└── README.md
```

<br>

---

## ✦ Hızlı Başlangıç

### GitHub Pages'e Deploy

```bash
# 1. Repoyu fork'la veya kendi hesabına yükle
git clone https://github.com/kullanici/vogueline.git
cd vogueline

# 2. GitHub → Settings → Pages → Source: main branch / root
# 3. Birkaç dakika bekle ✓
```

**Canlı adres:** `https://kullaniciadın.github.io/vogueline`

<br>

### Yerel Geliştirme

```bash
# fetch() için yerel sunucu gerekir (çift tıklama çalışmaz)
npx serve .
# veya
python3 -m http.server 8080
```

Tarayıcıda → `http://localhost:8080`

<br>

---

## ✦ Ürün Yönetimi

Ürün eklemek için yalnızca `data/products.json` dosyasını düzenle:

```jsonc
{
  "id": 10,                          // Benzersiz numara
  "ad": "Ürün Adı",
  "kategori": "elbise",              // bkz. Kategoriler tablosu
  "fiyat": 2500,                     // Sayısal (TL)
  "fiyat_fmt": "2.500 ₺",            // Görüntülenen metin
  "indirimli_fiyat": 1875,           // null → indirim yok
  "indirimli_fiyat_fmt": "1.875 ₺",  // null → gösterilmez
  "aciklama": "Ürün açıklaması...",
  "foto_url": "https://resim.com/foto.jpg",
  "bedenler": ["XS", "S", "M", "L", "XL"],
  "one_cikan": false                 // true → "Yeni" rozeti
}
```

### Kategoriler

| Değer | Filtrede Görünür |
|---|---|
| `elbise` | Elbise |
| `ceket` | Ceket |
| `bluz` | Bluz |
| `pantolon` | Pantolon |
| `etek` | Etek |
| `dis_giyim` | Dış Giyim |
| `kazak` | Kazak |

<br>

---

## ✦ Teknoloji

```
HTML5 ──────── Tüm site tek index.html
CSS3 ───────── CSS variables, grid, animasyonlar (harici stylesheet yok)
JavaScript ─── Vanilla ES2020+, async/await, localStorage
JSON ───────── Ürün kataloğu (sunucu gerektirmez)
Fonts ──────── Cormorant Garamond · Bebas Neue · DM Sans (Google Fonts)
Hosting ────── GitHub Pages (ücretsiz, otomatik HTTPS)
```

<br>

---

## ✦ Ekran Görüntüleri

| Ana Sayfa | Ürün Modalı | Sepet |
|:---:|:---:|:---:|
| Hero slider + koleksiyon grid | Tam ekran detay + beden seçimi | Sağ çekmece + toplam |

<br>

---

<div align="center">

**✦ VogueLine**

Bir stil, iki satır JSON, sıfır sunucu.

<br>

<sub>© 2026 VogueLine — MIT Lisansı</sub>

</div>
