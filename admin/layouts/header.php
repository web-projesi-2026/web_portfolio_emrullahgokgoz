<?php
// layouts/header.php — admin paneli ortak üst bölümü
// Kullanım: $sayfa_basligi değişkenini tanımlayıp include edin
?>
<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title><?= e($sayfa_basligi ?? 'Panel') ?> — VogueLine Admin</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=Jost:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
/* ═══════════════════════════════════
   RESET & BASE
═══════════════════════════════════ */
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Jost',sans-serif;background:#f5f5f7;color:#2c2c2c;min-height:100vh;display:flex}

/* ═══════════════════════════════════
   SIDEBAR
═══════════════════════════════════ */
.sidebar{
  width:260px;min-height:100vh;background:#1a1a2e;
  display:flex;flex-direction:column;position:fixed;left:0;top:0;bottom:0;
  z-index:100;box-shadow:4px 0 20px rgba(0,0,0,.15);
}
.sidebar-logo{
  padding:2rem 1.5rem 1.5rem;border-bottom:1px solid rgba(255,255,255,.08);
}
.sidebar-logo h1{
  font-family:'Cormorant Garamond',serif;color:#fff;font-size:1.7rem;
  letter-spacing:5px;text-transform:uppercase;
}
.sidebar-logo span{font-size:.65rem;letter-spacing:2px;color:rgba(255,255,255,.4);display:block;margin-top:.2rem}

.nav{padding:1.5rem 0;flex:1}
.nav-baslik{
  font-size:.6rem;letter-spacing:2.5px;text-transform:uppercase;
  color:rgba(255,255,255,.3);padding:.5rem 1.5rem .3rem;margin-top:.5rem;
}
.nav a{
  display:flex;align-items:center;gap:.75rem;
  padding:.8rem 1.5rem;color:rgba(255,255,255,.7);text-decoration:none;
  font-size:.88rem;font-weight:400;letter-spacing:.3px;transition:all .2s;
  border-left:3px solid transparent;
}
.nav a:hover,.nav a.aktif{
  color:#fff;background:rgba(255,255,255,.07);border-left-color:#e8c9a0;
}
.nav a .ikon{font-size:1.05rem;min-width:20px;text-align:center}

.sidebar-alt{
  padding:1.2rem 1.5rem;border-top:1px solid rgba(255,255,255,.08);
}
.sidebar-alt a{
  display:flex;align-items:center;gap:.6rem;color:rgba(255,255,255,.5);
  font-size:.82rem;text-decoration:none;padding:.4rem 0;transition:color .2s;
}
.sidebar-alt a:hover{color:#fff}

/* ═══════════════════════════════════
   MAIN CONTENT
═══════════════════════════════════ */
.ana-icerik{
  margin-left:260px;flex:1;display:flex;flex-direction:column;min-height:100vh;
}
.ust-bar{
  background:#fff;padding:1rem 2rem;
  display:flex;align-items:center;justify-content:space-between;
  box-shadow:0 2px 10px rgba(0,0,0,.06);position:sticky;top:0;z-index:50;
}
.ust-bar h2{font-size:1.15rem;font-weight:500;color:#1a1a2e}
.ust-bar-sag{display:flex;align-items:center;gap:1.5rem}
.kullanici{font-size:.85rem;color:#666}
.btn{
  display:inline-flex;align-items:center;gap:.5rem;
  padding:.6rem 1.2rem;border-radius:8px;font-family:'Jost',sans-serif;
  font-size:.85rem;font-weight:500;cursor:pointer;transition:all .2s;
  text-decoration:none;border:none;letter-spacing:.3px;
}
.btn-birincil{background:#1a1a2e;color:#fff}
.btn-birincil:hover{background:#0f3460}
.btn-ikincil{background:#fff;color:#1a1a2e;border:1.5px solid #ddd}
.btn-ikincil:hover{border-color:#1a1a2e}
.btn-tehlike{background:#fff;color:#dc3545;border:1.5px solid #f5c6cb}
.btn-tehlike:hover{background:#dc3545;color:#fff}
.btn-kucuk{padding:.4rem .9rem;font-size:.78rem}

.icerik{padding:2rem}

/* ═══════════════════════════════════
   KARTLAR / ISTATISTIK
═══════════════════════════════════ */
.istat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1.2rem;margin-bottom:2rem}
.istat-kart{
  background:#fff;border-radius:14px;padding:1.5rem;
  box-shadow:0 2px 12px rgba(0,0,0,.06);border:1px solid rgba(0,0,0,.04);
}
.istat-kart .sayi{font-size:2rem;font-weight:600;color:#1a1a2e;line-height:1}
.istat-kart .etiket{font-size:.78rem;color:#888;margin-top:.5rem;letter-spacing:.5px;text-transform:uppercase}
.istat-kart .ikon-buyuk{font-size:1.8rem;margin-bottom:.8rem}

/* ═══════════════════════════════════
   TABLO
═══════════════════════════════════ */
.kart{background:#fff;border-radius:14px;box-shadow:0 2px 12px rgba(0,0,0,.06);overflow:hidden}
.kart-baslik{
  padding:1.2rem 1.5rem;border-bottom:1px solid #f0f0f0;
  display:flex;align-items:center;justify-content:space-between;
}
.kart-baslik h3{font-size:1rem;font-weight:500}
table{width:100%;border-collapse:collapse}
th{
  padding:.9rem 1rem;text-align:left;font-size:.72rem;letter-spacing:1.5px;
  text-transform:uppercase;color:#888;background:#fafafa;border-bottom:1px solid #f0f0f0;
}
td{padding:.9rem 1rem;border-bottom:1px solid #f5f5f5;font-size:.88rem;vertical-align:middle}
tr:last-child td{border-bottom:none}
tr:hover td{background:#fafbff}

.rozet{
  display:inline-block;padding:.25rem .7rem;border-radius:20px;font-size:.7rem;font-weight:500;
}
.rozet-yesil{background:#d4edda;color:#155724}
.rozet-kirmizi{background:#f8d7da;color:#721c24}
.rozet-sari{background:#fff3cd;color:#856404}

/* ═══════════════════════════════════
   FORM
═══════════════════════════════════ */
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem}
.form-grid.tek{grid-template-columns:1fr}
.form-grup-tam{grid-column:1/-1}
.form-grup label{display:block;font-size:.75rem;letter-spacing:1px;color:#555;text-transform:uppercase;margin-bottom:.5rem;font-weight:500}
.form-grup input,.form-grup select,.form-grup textarea{
  width:100%;padding:.8rem 1rem;border:1.5px solid #e5e5e5;border-radius:10px;
  font-family:'Jost',sans-serif;font-size:.92rem;color:#333;
  transition:border-color .2s;outline:none;background:#fafafa;
}
.form-grup input:focus,.form-grup select:focus,.form-grup textarea:focus{border-color:#1a1a2e;background:#fff}
.form-grup textarea{min-height:120px;resize:vertical}

.foto-onizleme{display:flex;flex-wrap:wrap;gap:.8rem;margin-top:1rem}
.foto-onizleme img{
  width:100px;height:100px;object-fit:cover;border-radius:8px;
  border:2px solid #e5e5e5;cursor:pointer;
}
.foto-onizleme .foto-sil{
  position:relative;display:inline-block;
}
.foto-onizleme .sil-btn{
  position:absolute;top:-6px;right:-6px;background:#dc3545;color:#fff;
  border:none;border-radius:50%;width:20px;height:20px;font-size:.7rem;
  cursor:pointer;display:flex;align-items:center;justify-content:center;
  line-height:1;padding:0;
}

.foto-yukle-alan{
  border:2px dashed #d0d0d0;border-radius:12px;padding:2rem;text-align:center;
  cursor:pointer;transition:border-color .2s;background:#fafafa;
}
.foto-yukle-alan:hover{border-color:#1a1a2e}
.foto-yukle-alan p{color:#888;font-size:.88rem}
.foto-yukle-alan input[type=file]{display:none}
</style>
</head>
<body>

<div class="sidebar">
  <div class="sidebar-logo">
    <h1>VogueLine</h1>
    <span>Admin Paneli</span>
  </div>
  <nav class="nav">
    <div class="nav-baslik">Genel</div>
    <a href="/admin/index.php" class="<?= basename($_SERVER['PHP_SELF']) === 'index.php' ? 'aktif' : '' ?>">
      <span class="ikon">📊</span> Dashboard
    </a>

    <div class="nav-baslik">Ürün Yönetimi</div>
    <a href="/admin/urunler.php" class="<?= basename($_SERVER['PHP_SELF']) === 'urunler.php' ? 'aktif' : '' ?>">
      <span class="ikon">👗</span> Ürünler
    </a>
    <a href="/admin/urun_ekle.php" class="<?= basename($_SERVER['PHP_SELF']) === 'urun_ekle.php' ? 'aktif' : '' ?>">
      <span class="ikon">➕</span> Ürün Ekle
    </a>
    <a href="/admin/kategoriler.php" class="<?= basename($_SERVER['PHP_SELF']) === 'kategoriler.php' ? 'aktif' : '' ?>">
      <span class="ikon">🗂️</span> Kategoriler
    </a>
  </nav>
  <div class="sidebar-alt">
    <a href="/admin/ayarlar.php"><span>⚙️</span> Ayarlar</a>
    <a href="/admin/cikis.php"><span>🚪</span> Çıkış Yap</a>
  </div>
</div>

<div class="ana-icerik">
  <div class="ust-bar">
    <h2><?= e($sayfa_basligi ?? '') ?></h2>
    <div class="ust-bar-sag">
      <span class="kullanici">👤 <?= e($_SESSION['admin_adi'] ?? 'Admin') ?></span>
      <a href="/admin/cikis.php" class="btn btn-ikincil btn-kucuk">Çıkış</a>
    </div>
  </div>
  <div class="icerik">
    <?php flashGoster(); ?>
