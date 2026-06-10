<?php
require_once __DIR__ . '/../includes/config.php';
oturumKontrol();

$sayfa_basligi = 'Dashboard';

// İstatistikler
$toplam_urun     = $pdo->query("SELECT COUNT(*) FROM urunler")->fetchColumn();
$aktif_urun      = $pdo->query("SELECT COUNT(*) FROM urunler WHERE aktif=1")->fetchColumn();
$pasif_urun      = $pdo->query("SELECT COUNT(*) FROM urunler WHERE aktif=0")->fetchColumn();
$toplam_kategori = $pdo->query("SELECT COUNT(*) FROM kategoriler")->fetchColumn();
$one_cikan       = $pdo->query("SELECT COUNT(*) FROM urunler WHERE one_cikan=1 AND aktif=1")->fetchColumn();

// Son eklenen ürünler
$son_urunler = $pdo->query("
    SELECT u.*, k.ad AS kategori_adi
    FROM urunler u
    LEFT JOIN kategoriler k ON k.id = u.kategori_id
    ORDER BY u.olusturma DESC
    LIMIT 8
")->fetchAll();

require 'layouts/header.php';
?>

<div class="istat-grid">
  <div class="istat-kart">
    <div class="ikon-buyuk">👗</div>
    <div class="sayi"><?= $toplam_urun ?></div>
    <div class="etiket">Toplam Ürün</div>
  </div>
  <div class="istat-kart">
    <div class="ikon-buyuk">✅</div>
    <div class="sayi"><?= $aktif_urun ?></div>
    <div class="etiket">Aktif Ürün</div>
  </div>
  <div class="istat-kart">
    <div class="ikon-buyuk">⭐</div>
    <div class="sayi"><?= $one_cikan ?></div>
    <div class="etiket">Öne Çıkan</div>
  </div>
  <div class="istat-kart">
    <div class="ikon-buyuk">🗂️</div>
    <div class="sayi"><?= $toplam_kategori ?></div>
    <div class="etiket">Kategori</div>
  </div>
</div>

<div class="kart">
  <div class="kart-baslik">
    <h3>Son Eklenen Ürünler</h3>
    <a href="/admin/urun_ekle.php" class="btn btn-birincil btn-kucuk">+ Yeni Ürün</a>
  </div>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Fotoğraf</th>
        <th>Ürün Adı</th>
        <th>Kategori</th>
        <th>Fiyat</th>
        <th>Stok</th>
        <th>Durum</th>
        <th>İşlem</th>
      </tr>
    </thead>
    <tbody>
    <?php foreach ($son_urunler as $u): ?>
      <tr>
        <td style="color:#aaa;font-size:.8rem"><?= $u['id'] ?></td>
        <td>
          <?php if ($u['ana_fotograf']): ?>
            <img src="<?= e(UPLOAD_URL . $u['ana_fotograf']) ?>" style="width:50px;height:50px;object-fit:cover;border-radius:8px;border:1px solid #eee">
          <?php else: ?>
            <div style="width:50px;height:50px;background:#f0f0f0;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.3rem">👗</div>
          <?php endif; ?>
        </td>
        <td><strong><?= e($u['ad']) ?></strong><br><span style="font-size:.75rem;color:#888"><?= e($u['marka']) ?></span></td>
        <td><?= e($u['kategori_adi']) ?></td>
        <td>
          <?php if ($u['indirimli_fiyat']): ?>
            <span style="text-decoration:line-through;color:#aaa;font-size:.8rem"><?= number_format($u['fiyat'],2,',','.') ?> ₺</span><br>
            <strong style="color:#28a745"><?= number_format($u['indirimli_fiyat'],2,',','.') ?> ₺</strong>
          <?php else: ?>
            <?= number_format($u['fiyat'],2,',','.') ?> ₺
          <?php endif; ?>
        </td>
        <td><?= $u['stok'] ?></td>
        <td>
          <span class="rozet <?= $u['aktif'] ? 'rozet-yesil' : 'rozet-kirmizi' ?>">
            <?= $u['aktif'] ? 'Aktif' : 'Pasif' ?>
          </span>
          <?php if ($u['one_cikan']): ?>
            <span class="rozet rozet-sari" style="margin-left:.3rem">⭐</span>
          <?php endif; ?>
        </td>
        <td>
          <a href="/admin/urun_duzenle.php?id=<?= $u['id'] ?>" class="btn btn-ikincil btn-kucuk">Düzenle</a>
        </td>
      </tr>
    <?php endforeach; ?>
    <?php if (!$son_urunler): ?>
      <tr><td colspan="8" style="text-align:center;color:#aaa;padding:2rem">Henüz ürün eklenmedi.</td></tr>
    <?php endif; ?>
    </tbody>
  </table>
</div>

<?php require 'layouts/footer.php'; ?>
