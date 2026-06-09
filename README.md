# VogueLine

VogueLine, premium moda ürünlerini sergilemek için hazırlanmış statik bir e-ticaret vitrin projesidir.

## 🚀 GitHub Pages'de Yayınlama

1. Bu klasördeki **tüm dosyaları** GitHub repo'na yükle (zip değil, dosyaları direkt yükle)
2. GitHub'da repo sayfasına git → **Settings** → **Pages**
3. **Source** kısmında: Branch: `main` (veya kullandığın branch), Folder: `/ (root)` seç
4. **Save** tıkla
5. 1-2 dakika bekle → `https://KULLANICIADI.github.io/REPOADI/` adresinden açılır

## 📁 Proje Yapısı

```
/
├── index.html          ← Ana sayfa (buradan aç)
├── assets/
│   ├── style.css       ← Stiller
│   └── script.js       ← JavaScript
├── data/
│   └── products.json   ← Ürün verileri
└── pages/
    ├── about.html      ← Hakkımızda
    ├── projects.html   ← Projeler/Blog
    └── contact.html    ← İletişim
```

## Özellikler
- Ürün listeleme & filtreleme
- JSON üzerinden ürün verisi
- Arama ve sıralama
- Favoriler & Sepet (LocalStorage)
- Responsive tasarım
