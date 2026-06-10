<?php
require_once __DIR__ . '/../includes/config.php';
oturumKontrol();

// Toplu silme
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['secili'])) {
    $ids = array_map('intval', $_POST['secili']);
    foreach ($ids as $id) {
        // Fotoğrafları da sil
        $fotos = $pdo->prepare("SELECT dosya_adi FROM urun_fotograflar WHERE urun_id = ?");
        $fotos->execute([$id]);
        foreach ($fotos->fetchAll() as $f) {
            @unlink(UPLOAD_KLASORU . $f['dosya_adi']);
        }
        $pdo->prepare("DELETE FROM urunler WHERE id = ?")->execute([$id]);
    }
    flashMesaj('basari', count($ids) . ' ürün silindi.');
    header('Location: /admin/urunler.php');
    exit;
}

// Tekil silme
if (isset($_GET['sil'])) {
    $id = (int)$_GET['sil'];
    $fotos = $pdo->prepare("SELECT dosya_adi FROM urun_fotograflar WHERE urun_id = ?");
    $fotos->execute([$id]);
    foreach ($fotos->fetchAll() as $f) {
        @unlink(UPLOAD_KLASORU . $f['dosya_adi']);
    }
    $pdo->prepare("DELETE FROM urunler WHERE id = ?")->execute([$id]);
    flashMesaj('basari', 'Ürün silindi.');
    header('Location: /admin/urunler.php');
    exit;
}

// Arama & filtre
$arama     = trim($_GET['q'] ?? '');
$kategori  = (int)($_GET['kategori'] ?? 0);
$durum     = $_GET['durum'] ?? '';
$sayfa     = max(1, (int)($_GET['sayfa'] ?? 1));
$sayfa_basi= 15;

$where = ['1=1'];
$params = [];

if ($arama) {
    $where[] = "(u.ad LIKE ? OR u.marka LIKE ?)";
    $params[] = "%$arama%";
    $params[] = "%$arama%";
}
if ($kategori) {
    $where[] = "u.kategori_id = ?";
    $params[] = $kategori;
}
if ($durum === 'aktif')   { $where[] = "u.aktif = 1"; }
if ($durum === 'pasif')   { $where[] = "u.aktif = 0"; }
if ($durum === 'one_cikan') { $where[] = "u.one_cikan = 1 AND u.aktif = 1"; }

$sql_where = implode(' AND ', $where);
$toplam  = $pdo->prepare("SELECT COUNT(*) FROM urunler u WHERE $sql_where");
$toplam->execute($params);
$toplam  = (int)$toplam->fetchColumn();
$toplam_sayfa = max(1, ceil($toplam / $sayfa_basi));
$offset  = ($sayfa - 1) * $sayfa_basi;

$stmt = $pdo->prepare("
    SELECT u.*, k.ad AS kategori_adi
    FROM urunler u
    LEFT JOIN kategoriler k ON k.id = u.kategori_id
    WHERE $sql_where
    ORDER BY u.olusturma DESC
    LIMIT $sayfa_basi OFFSET $offset
");
$stmt->execute($params);
$urunler = $stmt->fetchAll();

$kategoriler = $pdo->query("SELECT * FROM kategoriler ORDER BY sira")->fetchAll();

$sayfa_basligi = 'Ürün Listesi';
require 'layouts/header.php';
?>

<!-- Arama & Filtre -->
<div class="kart" style="margin-bottom:1.5rem">
  <div style="padding:1.2rem 1.5rem">
    <form method="GET" style="display:flex;gap:1rem;flex-wrap:wrap;align-items:flex-end">
      <div class="form-grup" style="flex:1;min-width:200px;margin:0">
        <label>Ürün Ara</label>
        <input type="text" name="q" value="<?= e($arama) ?>" placeholder="Ürün adı veya marka...">
      </div>
      <div class="form-grup" style="min-width:160px;margin:0">
        <label>Kategori</label>
        <select name="kategori">
          <option value="">Tümü</option>
          <?php foreach ($kategoriler as $k): ?>
            <option value="<?= $k['id'] ?>" <?= $kategori == $k['id'] ? 'selected' : '' ?>><?= e($k['ad']) ?></option>
          <?php endforeach; ?>
        </select>
      </div>
      <div class="form-grup" style="min-width:140px;margin:0">
        <label>Durum</label>
        <select name="durum">
          <option value="">Tümü</option>
          <option value="aktif"     <?= $durum==='aktif'      ? 'selected' : '' ?>>Aktif</option>
          <option value="pasif"     <?= $durum==='pasif'      ? 'selected' : '' ?>>Pasif</option>
          <option value="one_cikan" <?= $durum==='one_cikan'  ? 'selected' : '' ?>>Öne Çıkan</option>
        </select>
      </div>
      <button type="submit" class="btn btn-birincil">Filtrele</button>
      <a href="/admin/urunler.php" class="btn btn-ikincil">Temizle</a>
    </form>
  </div>
</div>

<!-- Tablo -->
<div class="kart">
  <div class="kart-baslik">
    <h3>Ürünler <span style="color:#aaa;font-weight:400;font-size:.85rem">(<?= $toplam ?> ürün)</span></h3>
    <a href="/admin/urun_ekle.php" class="btn btn-birincil btn-kucuk">+ Ürün Ekle</a>
  </div>

  <form method="POST" id="toplu-form">
    <table>
      <thead>
        <tr>
          <th><input type="checkbox" id="hepsini-sec" onclick="hepsiniSec(this)"></th>
          <th>#</th>
          <th>Foto</th>
          <th>Ürün</th>
          <th>Kategori</th>
          <th>Fiyat</th>
          <th>Stok</th>
          <th>Durum</th>
          <th>Eklenme</th>
          <th>İşlem</th>
        </tr>
      </thead>
      <tbody>
      <?php foreach ($urunler as $u): ?>
        <tr>
          <td><input type="checkbox" name="secili[]" value="<?= $u['id'] ?>"></td>
          <td style="color:#bbb;font-size:.8rem"><?= $u['id'] ?></td>
          <td>
            <?php if ($u['ana_fotograf']): ?>
              <img src="<?= e(UPLOAD_URL . $u['ana_fotograf']) ?>" style="width:44px;height:44px;object-fit:cover;border-radius:7px;border:1px solid #eee">
            <?php else: ?>
              <div style="width:44px;height:44px;background:#f0f0f0;border-radius:7px;display:flex;align-items:center;justify-content:center">👗</div>
            <?php endif; ?>
          </td>
          <td>
            <strong><?= e($u['ad']) ?></strong>
            <?php if ($u['marka']): ?><br><span style="font-size:.75rem;color:#888"><?= e($u['marka']) ?></span><?php endif; ?>
          </td>
          <td><?= e($u['kategori_adi'] ?? '—') ?></td>
          <td>
            <?php if ($u['indirimli_fiyat']): ?>
              <span style="text-decoration:line-through;color:#bbb;font-size:.78rem"><?= number_format($u['fiyat'],2,',','.') ?>₺</span>
              <strong style="color:#28a745;display:block"><?= number_format($u['indirimli_fiyat'],2,',','.') ?>₺</strong>
            <?php else: ?>
              <?= number_format($u['fiyat'],2,',','.') ?>₺
            <?php endif; ?>
          </td>
          <td><?= $u['stok'] ?></td>
          <td>
            <span class="rozet <?= $u['aktif'] ? 'rozet-yesil' : 'rozet-kirmizi' ?>"><?= $u['aktif'] ? 'Aktif' : 'Pasif' ?></span>
            <?php if ($u['one_cikan']): ?><span class="rozet rozet-sari" style="margin-left:.3rem">⭐</span><?php endif; ?>
          </td>
          <td style="font-size:.78rem;color:#888"><?= date('d.m.Y', strtotime($u['olusturma'])) ?></td>
          <td>
            <div style="display:flex;gap:.4rem">
              <a href="/admin/urun_duzenle.php?id=<?= $u['id'] ?>" class="btn btn-ikincil btn-kucuk" title="Düzenle">✏️</a>
              <a href="/admin/urunler.php?sil=<?= $u['id'] ?>" class="btn btn-tehlike btn-kucuk" title="Sil"
                 onclick="return confirm('Bu ürünü silmek istediğinize emin misiniz?')">🗑️</a>
            </div>
          </td>
        </tr>
      <?php endforeach; ?>
      <?php if (!$urunler): ?>
        <tr><td colspan="10" style="text-align:center;color:#aaa;padding:3rem">Ürün bulunamadı.</td></tr>
      <?php endif; ?>
      </tbody>
    </table>

    <?php if ($urunler): ?>
    <div style="padding:1rem 1.5rem;border-top:1px solid #f0f0f0;display:flex;align-items:center;gap:1rem">
      <button type="submit" class="btn btn-tehlike btn-kucuk"
              onclick="return confirm('Seçili ürünleri silmek istiyor musunuz?')">Seçilileri Sil</button>
    </div>
    <?php endif; ?>
  </form>

  <!-- Sayfalama -->
  <?php if ($toplam_sayfa > 1): ?>
  <div style="padding:1rem 1.5rem;border-top:1px solid #f0f0f0;display:flex;gap:.5rem;justify-content:center">
    <?php for ($i = 1; $i <= $toplam_sayfa; $i++): ?>
      <a href="?sayfa=<?= $i ?>&q=<?= urlencode($arama) ?>&kategori=<?= $kategori ?>&durum=<?= $durum ?>"
         class="btn <?= $i === $sayfa ? 'btn-birincil' : 'btn-ikincil' ?> btn-kucuk"><?= $i ?></a>
    <?php endfor; ?>
  </div>
  <?php endif; ?>
</div>

<script>
function hepsiniSec(cb){
  document.querySelectorAll('input[name="secili[]"]').forEach(c => c.checked = cb.checked);
}
</script>

<?php require 'layouts/footer.php'; ?>
