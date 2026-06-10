<?php
require_once __DIR__ . '/../includes/config.php';
oturumKontrol();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $mevcut  = $_POST['mevcut_sifre'] ?? '';
    $yeni    = $_POST['yeni_sifre'] ?? '';
    $tekrar  = $_POST['sifre_tekrar'] ?? '';

    $admin = $pdo->prepare("SELECT * FROM adminler WHERE id = ?");
    $admin->execute([$_SESSION['admin_id']]);
    $admin = $admin->fetch();

    if (!password_verify($mevcut, $admin['sifre_hash'])) {
        flashMesaj('hata', 'Mevcut şifre hatalı.');
    } elseif (strlen($yeni) < 6) {
        flashMesaj('hata', 'Yeni şifre en az 6 karakter olmalıdır.');
    } elseif ($yeni !== $tekrar) {
        flashMesaj('hata', 'Yeni şifreler eşleşmiyor.');
    } else {
        $hash = password_hash($yeni, PASSWORD_BCRYPT, ['cost' => 12]);
        $pdo->prepare("UPDATE adminler SET sifre_hash=? WHERE id=?")->execute([$hash, $_SESSION['admin_id']]);
        flashMesaj('basari', 'Şifreniz başarıyla güncellendi.');
    }
    header('Location: /admin/ayarlar.php'); exit;
}

$sayfa_basligi = 'Ayarlar';
require 'layouts/header.php';
?>

<div style="max-width:500px">
  <div class="kart">
    <div class="kart-baslik"><h3>🔑 Şifre Değiştir</h3></div>
    <div style="padding:1.5rem">
      <form method="POST">
        <div class="form-grup" style="margin-bottom:1.2rem">
          <label>Mevcut Şifre</label>
          <input type="password" name="mevcut_sifre" required>
        </div>
        <div class="form-grup" style="margin-bottom:1.2rem">
          <label>Yeni Şifre</label>
          <input type="password" name="yeni_sifre" required minlength="6">
        </div>
        <div class="form-grup" style="margin-bottom:1.5rem">
          <label>Yeni Şifre (Tekrar)</label>
          <input type="password" name="sifre_tekrar" required>
        </div>
        <button type="submit" class="btn btn-birincil">Şifreyi Güncelle</button>
      </form>
    </div>
  </div>
</div>

<?php require 'layouts/footer.php'; ?>
