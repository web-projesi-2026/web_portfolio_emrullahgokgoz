<?php
require_once __DIR__ . '/../includes/config.php';
oturumKontrol();

$id = (int)($_GET['id'] ?? 0);
if (!$id) { header('Location: /admin/urunler.php'); exit; }

$urun = $pdo->prepare("SELECT * FROM urunler WHERE id = ?");
$urun->execute([$id]);
$urun = $urun->fetch();
if (!$urun) { flashMesaj('hata', 'Ürün bulunamadı.'); header('Location: /admin/urunler.php'); exit; }

$fotograflar = $pdo->prepare("SELECT * FROM urun_fotograflar WHERE urun_id = ? ORDER BY sira");
$fotograflar->execute([$id]);
$fotograflar = $fotograflar->fetchAll();

$kategoriler = $pdo->query("SELECT * FROM kategoriler WHERE aktif=1 ORDER BY sira")->fetchAll();
$hatalar = [];

// Fotoğraf sil (AJAX)
if (isset($_GET['foto_sil'])) {
    $foto_id = (int)$_GET['foto_sil'];
    $f = $pdo->prepare("SELECT * FROM urun_fotograflar WHERE id = ? AND urun_id = ?");
    $f->execute([$foto_id, $id]);
    $f = $f->fetch();
    if ($f) {
        @unlink(UPLOAD_KLASORU . $f['dosya_adi']);
        $pdo->prepare("DELETE FROM urun_fotograflar WHERE id = ?")->execute([$foto_id]);
        // Ana fotoğraf güncelle
        $yeni = $pdo->prepare("SELECT dosya_adi FROM urun_fotograflar WHERE urun_id = ? ORDER BY sira LIMIT 1");
        $yeni->execute([$id]);
        $yeni = $yeni->fetchColumn();
        $pdo->prepare("UPDATE urunler SET ana_fotograf = ? WHERE id = ?")->execute([$yeni ?: '', $id]);
    }
    header('Location: /admin/urun_duzenle.php?id=' . $id);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $ad          = trim($_POST['ad'] ?? '');
    $marka       = trim($_POST['marka'] ?? '');
    $aciklama    = trim($_POST['aciklama'] ?? '');
    $kategori_id = (int)($_POST['kategori_id'] ?? 0);
    $fiyat       = str_replace(',', '.', $_POST['fiyat'] ?? '0');
    $ind_fiyat   = trim(str_replace(',', '.', $_POST['indirimli_fiyat'] ?? ''));
    $beden       = trim($_POST['beden'] ?? '');
    $renk        = trim($_POST['renk'] ?? '');
    $stok        = (int)($_POST['stok'] ?? 0);
    $aktif       = isset($_POST['aktif']) ? 1 : 0;
    $one_cikan   = isset($_POST['one_cikan']) ? 1 : 0;

    if (!$ad)          $hatalar[] = 'Ürün adı zorunludur.';
    if (!$kategori_id) $hatalar[] = 'Kategori seçiniz.';
    if (!is_numeric($fiyat) || $fiyat < 0) $hatalar[] = 'Geçerli bir fiyat giriniz.';

    if (!$hatalar) {
        $pdo->prepare("
            UPDATE urunler SET
                kategori_id=?, ad=?, marka=?, aciklama=?, fiyat=?,
                indirimli_fiyat=?, beden=?, renk=?, stok=?, aktif=?, one_cikan=?
            WHERE id=?
        ")->execute([
            $kategori_id, $ad, $marka, $aciklama, $fiyat,
            $ind_fiyat ?: null, $beden, $renk, $stok, $aktif, $one_cikan, $id
        ]);

        // Yeni fotoğraflar
        if (!empty($_FILES['fotograflar']['name'][0])) {
            $izinli = ['image/jpeg','image/png','image/webp','image/gif'];
            $mevcut_sira = count($fotograflar);
            foreach ($_FILES['fotograflar']['tmp_name'] as $idx => $tmp) {
                if (!$tmp || $_FILES['fotograflar']['error'][$idx] !== UPLOAD_ERR_OK) continue;
                $mime = mime_content_type($tmp);
                if (!in_array($mime, $izinli)) continue;
                if ($_FILES['fotograflar']['size'][$idx] > MAX_DOSYA_BOYUTU) continue;
                $uzanti    = pathinfo($_FILES['fotograflar']['name'][$idx], PATHINFO_EXTENSION);
                $dosya_adi = 'urun_' . $id . '_' . uniqid() . '.' . strtolower($uzanti);
                if (move_uploaded_file($tmp, UPLOAD_KLASORU . $dosya_adi)) {
                    $pdo->prepare("INSERT INTO urun_fotograflar (urun_id, dosya_adi, sira) VALUES (?,?,?)")
                        ->execute([$id, $dosya_adi, $mevcut_sira + $idx]);
                }
            }
            // Ana fotoğrafı güncelle
            $ilk = $pdo->prepare("SELECT dosya_adi FROM urun_fotograflar WHERE urun_id = ? ORDER BY sira LIMIT 1");
            $ilk->execute([$id]);
            $ilk = $ilk->fetchColumn();
            if ($ilk) $pdo->prepare("UPDATE urunler SET ana_fotograf=? WHERE id=?")->execute([$ilk, $id]);
        }

        flashMesaj('basari', 'Ürün başarıyla güncellendi.');
        header('Location: /admin/urun_duzenle.php?id=' . $id);
        exit;
    }

    // Hata varsa POST verileri ile doldur
    $urun = array_merge($urun, $_POST);
}

$sayfa_basligi = 'Ürün Düzenle';
require 'layouts/header.php';
?>

<div style="max-width:900px">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
    <a href="/admin/urunler.php" class="btn btn-ikincil btn-kucuk">← Ürün Listesi</a>
    <a href="/admin/urunler.php?sil=<?= $id ?>" class="btn btn-tehlike btn-kucuk"
       onclick="return confirm('Bu ürünü silmek istediğinize emin misiniz?')">🗑️ Ürünü Sil</a>
  </div>

  <?php if ($hatalar): ?>
    <div style="background:#f8d7da;color:#721c24;padding:1rem 1.5rem;border-radius:10px;margin-bottom:1.5rem">
      <?php foreach ($hatalar as $h): ?><div>⚠️ <?= e($h) ?></div><?php endforeach; ?>
    </div>
  <?php endif; ?>

  <form method="POST" enctype="multipart/form-data">
    <div class="kart" style="margin-bottom:1.5rem">
      <div class="kart-baslik"><h3>📝 Ürün Bilgileri</h3></div>
      <div style="padding:1.5rem">
        <div class="form-grid">
          <div class="form-grup form-grup-tam">
            <label>Ürün Adı *</label>
            <input type="text" name="ad" value="<?= e($urun['ad']) ?>" required>
          </div>
          <div class="form-grup">
            <label>Marka</label>
            <input type="text" name="marka" value="<?= e($urun['marka']) ?>">
          </div>
          <div class="form-grup">
            <label>Kategori *</label>
            <select name="kategori_id" required>
              <option value="">— Seçiniz —</option>
              <?php foreach ($kategoriler as $k): ?>
                <option value="<?= $k['id'] ?>" <?= $urun['kategori_id'] == $k['id'] ? 'selected' : '' ?>>
                  <?= e($k['ad']) ?>
                </option>
              <?php endforeach; ?>
            </select>
          </div>
          <div class="form-grup form-grup-tam">
            <label>Açıklama</label>
            <textarea name="aciklama"><?= e($urun['aciklama']) ?></textarea>
          </div>
        </div>
      </div>
    </div>

    <div class="kart" style="margin-bottom:1.5rem">
      <div class="kart-baslik"><h3>💰 Fiyat & Stok</h3></div>
      <div style="padding:1.5rem">
        <div class="form-grid">
          <div class="form-grup">
            <label>Fiyat (₺) *</label>
            <input type="number" name="fiyat" step="0.01" min="0" value="<?= e($urun['fiyat']) ?>" required>
          </div>
          <div class="form-grup">
            <label>İndirimli Fiyat (₺)</label>
            <input type="number" name="indirimli_fiyat" step="0.01" min="0" value="<?= e($urun['indirimli_fiyat'] ?? '') ?>">
          </div>
          <div class="form-grup">
            <label>Stok</label>
            <input type="number" name="stok" min="0" value="<?= e($urun['stok']) ?>">
          </div>
          <div class="form-grup">
            <label>Bedenler</label>
            <input type="text" name="beden" value="<?= e($urun['beden']) ?>" placeholder="XS,S,M,L,XL">
          </div>
          <div class="form-grup">
            <label>Renkler</label>
            <input type="text" name="renk" value="<?= e($urun['renk']) ?>" placeholder="Siyah,Beyaz,Bordo">
          </div>
        </div>
        <div style="display:flex;gap:2rem;margin-top:1.2rem">
          <label style="display:flex;align-items:center;gap:.6rem;cursor:pointer;font-size:.9rem">
            <input type="checkbox" name="aktif" style="width:auto" <?= $urun['aktif'] ? 'checked' : '' ?>>
            Aktif
          </label>
          <label style="display:flex;align-items:center;gap:.6rem;cursor:pointer;font-size:.9rem">
            <input type="checkbox" name="one_cikan" style="width:auto" <?= $urun['one_cikan'] ? 'checked' : '' ?>>
            Öne Çıkan ⭐
          </label>
        </div>
      </div>
    </div>

    <!-- Mevcut Fotoğraflar -->
    <div class="kart" style="margin-bottom:1.5rem">
      <div class="kart-baslik"><h3>📷 Mevcut Fotoğraflar</h3></div>
      <div style="padding:1.5rem">
        <?php if ($fotograflar): ?>
          <div class="foto-onizleme">
            <?php foreach ($fotograflar as $foto): ?>
              <div class="foto-sil">
                <img src="<?= e(UPLOAD_URL . $foto['dosya_adi']) ?>" title="<?= e($foto['dosya_adi']) ?>">
                <a href="/admin/urun_duzenle.php?id=<?= $id ?>&foto_sil=<?= $foto['id'] ?>"
                   class="sil-btn"
                   onclick="return confirm('Bu fotoğrafı silmek istiyor musunuz?')" title="Fotoğrafı sil">✕</a>
                <?php if ($foto['dosya_adi'] === $urun['ana_fotograf']): ?>
                  <span style="position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);background:#28a745;color:#fff;font-size:.6rem;padding:.2rem .5rem;border-radius:10px;white-space:nowrap">Ana</span>
                <?php endif; ?>
              </div>
            <?php endforeach; ?>
          </div>
        <?php else: ?>
          <p style="color:#aaa;font-size:.88rem">Henüz fotoğraf eklenmemiş.</p>
        <?php endif; ?>

        <div style="margin-top:1.5rem">
          <p style="font-size:.8rem;color:#888;margin-bottom:.8rem;font-weight:500;letter-spacing:.5px;text-transform:uppercase">Yeni Fotoğraf Ekle</p>
          <div class="foto-yukle-alan" onclick="document.getElementById('foto-input2').click()">
            <input type="file" id="foto-input2" name="fotograflar[]" multiple accept="image/*" onchange="onizlemele(this)">
            <div style="font-size:2rem;margin-bottom:.5rem">📎</div>
            <p>Yeni fotoğraf(lar) seçin</p>
            <p style="font-size:.75rem;color:#bbb;margin-top:.3rem">PNG, JPG, WEBP — Maks 5 MB</p>
          </div>
          <div class="foto-onizleme" id="foto-onizleme"></div>
        </div>
      </div>
    </div>

    <div style="display:flex;gap:1rem">
      <button type="submit" class="btn btn-birincil">✅ Değişiklikleri Kaydet</button>
      <a href="/admin/urunler.php" class="btn btn-ikincil">İptal</a>
    </div>
  </form>
</div>

<script>
function onizlemele(input) {
  const kap = document.getElementById('foto-onizleme');
  kap.innerHTML = '';
  Array.from(input.files).forEach(dosya => {
    const okuyucu = new FileReader();
    okuyucu.onload = e => {
      const div = document.createElement('div');
      div.className = 'foto-sil';
      div.innerHTML = `<img src="${e.target.result}" title="${dosya.name}">`;
      kap.appendChild(div);
    };
    okuyucu.readAsDataURL(dosya);
  });
}
</script>

<?php require 'layouts/footer.php'; ?>
