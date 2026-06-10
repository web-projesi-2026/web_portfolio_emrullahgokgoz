<?php
require_once __DIR__ . '/../includes/config.php';
oturumKontrol();

// Ekle
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['ekle'])) {
    $ad   = trim($_POST['ad'] ?? '');
    $slug = trim($_POST['slug'] ?? strtolower(str_replace(' ', '-', $ad)));
    $sira = (int)($_POST['sira'] ?? 0);
    if ($ad && $slug) {
        $pdo->prepare("INSERT INTO kategoriler (ad, slug, sira) VALUES (?,?,?)")->execute([$ad, $slug, $sira]);
        flashMesaj('basari', 'Kategori eklendi.');
    }
    header('Location: /admin/kategoriler.php'); exit;
}

// Sil
if (isset($_GET['sil'])) {
    $id = (int)$_GET['sil'];
    $kullaniyor = $pdo->prepare("SELECT COUNT(*) FROM urunler WHERE kategori_id=?");
    $kullaniyor->execute([$id]);
    if ($kullaniyor->fetchColumn() > 0) {
        flashMesaj('hata', 'Bu kategoriye ait ürünler var. Önce ürünleri taşıyın veya silin.');
    } else {
        $pdo->prepare("DELETE FROM kategoriler WHERE id=?")->execute([$id]);
        flashMesaj('basari', 'Kategori silindi.');
    }
    header('Location: /admin/kategoriler.php'); exit;
}

// Durum değiştir
if (isset($_GET['toggle'])) {
    $id = (int)$_GET['toggle'];
    $pdo->prepare("UPDATE kategoriler SET aktif = NOT aktif WHERE id=?")->execute([$id]);
    header('Location: /admin/kategoriler.php'); exit;
}

$kategoriler = $pdo->query("
    SELECT k.*, COUNT(u.id) AS urun_sayisi
    FROM kategoriler k
    LEFT JOIN urunler u ON u.kategori_id = k.id
    GROUP BY k.id
    ORDER BY k.sira, k.id
")->fetchAll();

$sayfa_basligi = 'Kategoriler';
require 'layouts/header.php';
?>

<div style="display:grid;grid-template-columns:1fr 380px;gap:1.5rem;align-items:start">

  <!-- Kategori Listesi -->
  <div class="kart">
    <div class="kart-baslik"><h3>Tüm Kategoriler</h3></div>
    <table>
      <thead>
        <tr>
          <th>#</th><th>Kategori</th><th>Slug</th><th>Sıra</th><th>Ürün</th><th>Durum</th><th>İşlem</th>
        </tr>
      </thead>
      <tbody>
      <?php foreach ($kategoriler as $k): ?>
        <tr>
          <td style="color:#bbb;font-size:.8rem"><?= $k['id'] ?></td>
          <td><strong><?= e($k['ad']) ?></strong></td>
          <td><code style="font-size:.78rem;background:#f0f0f0;padding:.2rem .5rem;border-radius:4px"><?= e($k['slug']) ?></code></td>
          <td><?= $k['sira'] ?></td>
          <td><?= $k['urun_sayisi'] ?></td>
          <td>
            <a href="?toggle=<?= $k['id'] ?>" class="rozet <?= $k['aktif'] ? 'rozet-yesil' : 'rozet-kirmizi' ?>"
               style="cursor:pointer;text-decoration:none">
              <?= $k['aktif'] ? 'Aktif' : 'Pasif' ?>
            </a>
          </td>
          <td>
            <?php if ($k['urun_sayisi'] == 0): ?>
              <a href="?sil=<?= $k['id'] ?>" class="btn btn-tehlike btn-kucuk"
                 onclick="return confirm('Silmek istiyor musunuz?')">🗑️</a>
            <?php else: ?>
              <span style="font-size:.75rem;color:#bbb"><?= $k['urun_sayisi'] ?> ürün</span>
            <?php endif; ?>
          </td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
  </div>

  <!-- Yeni Kategori Ekle -->
  <div class="kart">
    <div class="kart-baslik"><h3>Yeni Kategori Ekle</h3></div>
    <div style="padding:1.5rem">
      <form method="POST">
        <div class="form-grup" style="margin-bottom:1.2rem">
          <label>Kategori Adı *</label>
          <input type="text" name="ad" required placeholder="Ör: Elbise" oninput="slugUret(this.value)">
        </div>
        <div class="form-grup" style="margin-bottom:1.2rem">
          <label>Slug *</label>
          <input type="text" name="slug" id="slug-input" required placeholder="elbise">
          <small style="color:#aaa;font-size:.75rem">URL'de kullanılır, Türkçe karakter içermemeli</small>
        </div>
        <div class="form-grup" style="margin-bottom:1.5rem">
          <label>Sıra</label>
          <input type="number" name="sira" value="0" min="0">
        </div>
        <button type="submit" name="ekle" class="btn btn-birincil">+ Kategori Ekle</button>
      </form>
    </div>
  </div>

</div>

<script>
function slugUret(deger) {
  const turkceden = {'ş':'s','Ş':'S','ğ':'g','Ğ':'G','ü':'u','Ü':'U','ö':'o','Ö':'O','ı':'i','İ':'I','ç':'c','Ç':'C'};
  let slug = deger;
  for (const [k,v] of Object.entries(turkceden)) slug = slug.replaceAll(k, v);
  slug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  document.getElementById('slug-input').value = slug;
}
</script>

<?php require 'layouts/footer.php'; ?>
