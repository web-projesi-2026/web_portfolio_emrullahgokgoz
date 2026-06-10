<?php
require_once __DIR__ . '/../includes/config.php';

// Zaten giriş yaptıysa yönlendir
if (!empty($_SESSION['admin_id'])) {
    header('Location: /admin/index.php');
    exit;
}

$hata = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $kullanici_adi = trim($_POST['kullanici_adi'] ?? '');
    $sifre         = $_POST['sifre'] ?? '';

    if ($kullanici_adi && $sifre) {
        $stmt = $pdo->prepare("SELECT * FROM adminler WHERE kullanici_adi = ? AND aktif = 1");
        $stmt->execute([$kullanici_adi]);
        $admin = $stmt->fetch();

        if ($admin && password_verify($sifre, $admin['sifre_hash'])) {
            $_SESSION['admin_id']   = $admin['id'];
            $_SESSION['admin_adi']  = $admin['ad_soyad'] ?: $admin['kullanici_adi'];
            $pdo->prepare("UPDATE adminler SET son_giris = NOW() WHERE id = ?")->execute([$admin['id']]);
            header('Location: /admin/index.php');
            exit;
        } else {
            $hata = 'Kullanıcı adı veya şifre hatalı.';
        }
    } else {
        $hata = 'Lütfen tüm alanları doldurun.';
    }
}
?>
<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>VogueLine Admin — Giriş</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{
    min-height:100vh;display:flex;align-items:center;justify-content:center;
    background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);
    font-family:'Jost',sans-serif;
  }
  .kart{
    background:#fff;border-radius:20px;padding:3rem 2.5rem;width:420px;
    box-shadow:0 25px 60px rgba(0,0,0,.35);
  }
  .logo{
    text-align:center;margin-bottom:2rem;
  }
  .logo h1{
    font-family:'Cormorant Garamond',serif;font-size:2.2rem;letter-spacing:6px;
    color:#1a1a2e;text-transform:uppercase;
  }
  .logo span{font-size:.7rem;letter-spacing:3px;color:#888;display:block;margin-top:.2rem}
  .form-grup{margin-bottom:1.4rem}
  label{display:block;font-size:.75rem;letter-spacing:1.5px;color:#666;text-transform:uppercase;margin-bottom:.5rem;font-weight:500}
  input{
    width:100%;padding:.85rem 1.1rem;border:1.5px solid #e0e0e0;border-radius:10px;
    font-family:'Jost',sans-serif;font-size:.95rem;color:#333;
    transition:border-color .2s;outline:none;background:#fafafa;
  }
  input:focus{border-color:#1a1a2e;background:#fff}
  .btn-giris{
    width:100%;padding:1rem;background:#1a1a2e;color:#fff;border:none;border-radius:10px;
    font-family:'Jost',sans-serif;font-size:.95rem;letter-spacing:2px;text-transform:uppercase;
    cursor:pointer;transition:background .2s;margin-top:.5rem;font-weight:500;
  }
  .btn-giris:hover{background:#0f3460}
  .hata{background:#fff0f0;color:#c0392b;padding:.85rem 1.1rem;border-radius:10px;margin-bottom:1.2rem;font-size:.88rem;border:1px solid #f5c6cb}
  .bilgi{text-align:center;margin-top:1.5rem;font-size:.78rem;color:#aaa}
</style>
</head>
<body>
<div class="kart">
  <div class="logo">
    <h1>VogueLine</h1>
    <span>Admin Paneli</span>
  </div>

  <?php if ($hata): ?>
    <div class="hata"><?= e($hata) ?></div>
  <?php endif; ?>

  <form method="POST" autocomplete="off">
    <div class="form-grup">
      <label for="kullanici_adi">Kullanıcı Adı</label>
      <input type="text" id="kullanici_adi" name="kullanici_adi"
             value="<?= e($_POST['kullanici_adi'] ?? '') ?>" required autofocus>
    </div>
    <div class="form-grup">
      <label for="sifre">Şifre</label>
      <input type="password" id="sifre" name="sifre" required>
    </div>
    <button type="submit" class="btn-giris">Giriş Yap</button>
  </form>
  <p class="bilgi">Varsayılan: admin / vogueline2024</p>
</div>
</body>
</html>
