<div align="center">

# ✦ VogueLine

**Premium Moda & Koleksiyon Platformu — GitHub Pages Versiyonu**

[![Canlı Site](https://img.shields.io/badge/🌐_GitHub_Pages-vogueline-c9a84c?style=for-the-badge)](https://kullanici.github.io/vogueline)
[![JSON](https://img.shields.io/badge/Veri-products.json-f7df1e?style=for-the-badge&logo=json&logoColor=black)](data/products.json)

</div>

---

## 🌐 Bu Versiyon Hakkında

Bu, VogueLine'ın **statik GitHub Pages versiyonudur**. PHP/MySQL gerektirmez; ürünler `data/products.json` dosyasından okunur.

| Özellik | Durum |
|---------|-------|
| Ürün listeleme | ✅ JSON'dan |
| Filtreleme & arama | ✅ İstemci tarafı |
| Sepet & favoriler | ✅ localStorage |
| Admin paneli | ❌ (sunucu gerektirir) |

---

## 🚀 GitHub Pages'e Deploy

1. Bu repoyu fork'la veya kendi hesabına yükle
2. **Settings → Pages → Source:** `main` branch, `/ (root)`
3. Birkaç dakika bekle → `https://kullanici.github.io/vogueline`

---

## 🛍️ Ürün Ekleme

`data/products.json` dosyasını düzenle:

```json
{
  "id": 10,
  "ad": "Ürün Adı",
  "kategori": "elbise",
  "fiyat": 1500,
  "fiyat_fmt": "1.500 ₺",
  "indirimli_fiyat": null,
  "indirimli_fiyat_fmt": null,
  "aciklama": "Ürün açıklaması...",
  "foto_url": "https://ornek.com/resim.jpg",
  "bedenler": ["S", "M", "L"],
  "one_cikan": false
}
```

**Kategoriler:** `elbise`, `ceket`, `bluz`, `pantolon`, `etek`, `dis_giyim`, `kazak`

---

<div align="center">
  <sub>© 2026 VogueLine — Tüm hakları saklıdır.</sub>
</div>
