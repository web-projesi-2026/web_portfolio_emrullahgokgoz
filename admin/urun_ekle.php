<?php
require_once __DIR__ . '/../includes/config.php';
oturumKontrol();

$kategoriler = $pdo->query("SELECT * FROM kategoriler WHERE aktif=1 ORDER BY sira")->fetchAll();
$hatalar = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Form verileri
    $ad           = trim($_POST['ad'] ?? '');
    $marka        = trim($_POST['marka'] ?? '');
    $aciklama     = trim($_POST['aciklama'] ?? '');
    $kategori_id  = (int)($_POST['kategori_id'] ?? 0);
    $fiyat        = str_replace(',', '.', $_POST['fiyat'] ?? '0');
    $ind_fiyat    = trim(str_replace(',', '.', $_POST['indirimli_fiyat'] ?? ''));
    $beden        = trim($_POST['beden'] ?? '');
    $renk         = trim($_POST['renk'] ?? '');
    $stok         = (int)($_POST['stok'] ?? 0);
    $aktif        = isset($_POST['aktif']) ? 1 : 0;
    $one_cikan    = isset($_POST['one_cikan']) ? 1 : 0;

    // Validasyon
    if (!$ad)         $hatalar[] = 'Ürün adı zorunludur.';
    if (!$kategori_id) $hatalar[] = 'Kategori seçiniz.';
    if (!is_numeric($fiyat) || $fiyat < 0) $hatalar[] = 'Geçerli bir fiyat giriniz.';

    if (!$hatalar) {
        // Ürünü kaydet
        $stmt = $pdo->prepare("
            INSERT INTO urunler
                (kategori_id, ad, marka, aciklama, fiyat, indirimli_fiyat, beden, renk, stok, aktif, one_cikan)
            VALUES (?,?,?,?,?,?,?,?,?,?,?)
        ");
        $stmt->execute([
            $kategori_id, $ad, $marka, $aciklama, $fiyat,
            $ind_fiyat ?: null, $beden, $renk, $stok, $aktif, $one_cikan
        ]);
        $urun_id = $pdo->lastInsertId();

        // Fotoğraf yükleme
        $ana_foto = '';
        if (!empty($_FILES['fotograflar']['name'][0])) {
            $izinli_tipler = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            foreach ($_FILES['fotograflar']['tmp_name'] as $idx => $tmp) {
                if (!$tmp || $_FILES['fotograflar']['error'][$idx] !== UPLOAD_ERR_OK) continue;
                $mime = mime_content_type($tmp);
                if (!in_array($mime, $izinli_tipler)) continue;
                if ($_FILES['fotograflar']['size'][$idx] > MAX_DOSYA_BOYUTU) continue;

                $uzanti    = pathinfo($_FILES['fotograflar']['name'][$idx], PATHINFO_EXTENSION);
                $dosya_adi = 'urun_' . $urun_id . '_' . uniqid() . '.' . strtolower($uzanti);
                $hedef     = UPLOAD_KLASORU . $dosya_adi;

                if (move_uploaded_file($tmp, $hedef)) {
                    $pdo->prepare("INSERT INTO urun_fotograflar (urun_id, dosya_adi, sira) VALUES (?,?,?)")
                        ->execute([$urun_id, $dosya_adi, $idx]);
                    if ($idx === 0) $ana_foto = $dosya_adi;
                }
            }
            if ($ana_foto) {
                $pdo->prepare("UPDATE urunler SET ana_fotograf=? WHERE id=?")->execute([$ana_foto, $urun_id]);
            }
        }

        flashMesaj('basari', '"' . $ad . '" ürünü başarıyla eklendi.');
        header('Location: /admin/urunler.php');
        exit;
    }
}

$sayfa_basligi = 'Ürün Ekle';
require 'layouts/header.php';
?>

<div style="max-width:900px">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
    <a href="/admin/urunler.php" class="btn btn-ikincil btn-kucuk">← Ürün Listesi</a>
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
            <input type="text" name="ad" value="<?= e($_POST['ad'] ?? '') ?>" required placeholder="Ör: Midi Wrap Elbise">
          </div>
          <div class="form-grup">
            <label>Marka</label>
            <input type="text" name="marka" value="<?= e($_POST['marka'] ?? '') ?>" placeholder="VogueLine">
          </div>
          <div class="form-grup">
            <label>Kategori *</label>
            <select name="kategori_id" required>
              <option value="">— Seçiniz —</option>
              <?php foreach ($kategoriler as $k): ?>
                <option value="<?= $k['id'] ?>" <?= ($_POST['kategori_id'] ?? '') == $k['id'] ? 'selected' : '' ?>>
                  <?= e($k['ad']) ?>
                </option>
              <?php endforeach; ?>
            </select>
          </div>
          <div class="form-grup form-grup-tam">
            <label>Açıklama</label>
            <textarea name="aciklama" placeholder="Ürün hakkında detaylı açıklama..."><?= e($_POST['aciklama'] ?? '') ?></textarea>
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
            <input type="number" name="fiyat" step="0.01" min="0"
                   value="<?= e($_POST['fiyat'] ?? '') ?>" required placeholder="0.00">
          </div>
          <div class="form-grup">
            <label>İndirimli Fiyat (₺)</label>
            <input type="number" name="indirimli_fiyat" step="0.01" min="0"
                   value="<?= e($_POST['indirimli_fiyat'] ?? '') ?>" placeholder="Boş bırakılabilir">
          </div>
          <div class="form-grup">
            <label>Stok Adedi</label>
            <input type="number" name="stok" min="0" value="<?= e($_POST['stok'] ?? '0') ?>">
          </div>
          <div class="form-grup">
            <label>Bedenler</label>
            <input type="text" name="beden" value="<?= e($_POST['beden'] ?? '') ?>"
                   placeholder="XS,S,M,L,XL veya 34,36,38,40">
            <small style="color:#aaa;font-size:.75rem">Virgülle ayırın</small>
          </div>
          <div class="form-grup">
            <label>Renkler</label>
            <input type="text" name="renk" value="<?= e($_POST['renk'] ?? '') ?>"
                   placeholder="Siyah,Beyaz,Bordo">
            <small style="color:#aaa;font-size:.75rem">Virgülle ayırın</small>
          </div>
        </div>
        <div style="display:flex;gap:2rem;margin-top:1.2rem">
          <label style="display:flex;align-items:center;gap:.6rem;cursor:pointer;font-size:.9rem">
            <input type="checkbox" name="aktif" style="width:auto" <?= isset($_POST['aktif']) || !isset($_POST['ad']) ? 'checked' : '' ?>>
            Aktif (sitede görünsün)
          </label>
          <label style="display:flex;align-items:center;gap:.6rem;cursor:pointer;font-size:.9rem">
            <input type="checkbox" name="one_cikan" style="width:auto" <?= isset($_POST['one_cikan']) ? 'checked' : '' ?>>
            Öne Çıkan ürün ⭐
          </label>
        </div>
      </div>
    </div>

    <div class="kart" style="margin-bottom:1.5rem">
      <div class="kart-baslik"><h3>📷 Ürün Fotoğrafları</h3></div>
      <div style="padding:1.5rem">
        <div class="foto-yukle-alan" onclick="document.getElementById('foto-input').click()">
          <input type="file" id="foto-input" name="fotograflar[]" multiple accept="image/*" onchange="onizlemele(this)">
          <div style="font-size:2.5rem;margin-bottom:.8rem">📷</div>
          <p style="font-size:1rem;color:#555;font-weight:500">Fotoğraf seçmek için tıklayın</p>
          <p>veya sürükle-bırak yapın</p>
          <p style="margin-top:.5rem;font-size:.75rem;color:#bbb">PNG, JPG, WEBP — Maks 5 MB — Birden fazla seçebilirsiniz</p>
          <p style="font-size:.75rem;color:#888;margin-top:.4rem">İlk seçilen fotoğraf ana fotoğraf olarak kullanılır.</p>
        </div>
        <div class="foto-onizleme" id="foto-onizleme"></div>
      </div>
    </div>

    <div style="display:flex;gap:1rem">
      <button type="submit" class="btn btn-birincil">✅ Ürünü Kaydet</button>
      <a href="/admin/urunler.php" class="btn btn-ikincil">İptal</a>
    </div>
  </form>
</div>

<script>
function onizlemele(input) {
  const kap = document.getElementById('foto-onizleme');
  kap.innerHTML = '';
  Array.from(input.files).forEach((dosya, i) => {
    const okuyucu = new FileReader();
    okuyucu.onload = e => {
      const div = document.createElement('div');
      div.className = 'foto-sil';
      div.innerHTML = `<img src="${e.target.result}" title="${dosya.name}">${i === 0 ? '<span style="position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);background:#28a745;color:#fff;font-size:.6rem;padding:.2rem .5rem;border-radius:10px;white-space:nowrap">Ana Foto</span>' : ''}`;
      kap.appendChild(div);
    };
    okuyucu.readAsDataURL(dosya);
  });
}

// Drag & drop desteği
const alan = document.querySelector('.foto-yukle-alan');
alan.addEventListener('dragover', e => { e.preventDefault(); alan.style.borderColor='#1a1a2e'; });
alan.addEventListener('dragleave', () => alan.style.borderColor='');
alan.addEventListener('drop', e => {
  e.preventDefault();
  alan.style.borderColor='';
  const input = document.getElementById('foto-input');
  input.files = e.dataTransfer.files;
  onizlemele(input);
});
</script>

<?php require 'layouts/footer.php'; ?>
