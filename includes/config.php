<?php
// ─────────────────────────────────────────────────────────────
// Veritabanı Bağlantısı — config.php
// Kendi sunucu bilgilerinizle doldurun
// ─────────────────────────────────────────────────────────────

define('DB_HOST', 'localhost');
define('DB_NAME', 'vogueline_db');
define('DB_USER', 'root');          // phpMyAdmin kullanıcı adınız
define('DB_PASS', '');              // phpMyAdmin şifreniz (XAMPP varsayılanı boş)
define('DB_CHARSET', 'utf8mb4');

define('SITE_ADI', 'VogueLine Admin Paneli');
define('UPLOAD_KLASORU', __DIR__ . '/uploads/');
define('UPLOAD_URL', '/uploads/');
define('MAX_DOSYA_BOYUTU', 5 * 1024 * 1024); // 5 MB

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET,
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );
} catch (PDOException $e) {
    die('<div style="font-family:sans-serif;padding:2rem;color:red;">
        <h2>Veritabanı Bağlantı Hatası</h2>
        <p>' . htmlspecialchars($e->getMessage()) . '</p>
        <p>config.php dosyasındaki DB_USER ve DB_PASS değerlerini kontrol edin.</p>
    </div>');
}

// Oturum başlat
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Oturum kontrol fonksiyonu
function oturumKontrol() {
    if (empty($_SESSION['admin_id'])) {
        header('Location: /admin/giris.php');
        exit;
    }
}

// Güvenli çıktı fonksiyonu
function e($str) {
    return htmlspecialchars($str ?? '', ENT_QUOTES, 'UTF-8');
}

// Flash mesaj fonksiyonları
function flashMesaj($tur, $mesaj) {
    $_SESSION['flash'] = ['tur' => $tur, 'mesaj' => $mesaj];
}
function flashGoster() {
    if (!empty($_SESSION['flash'])) {
        $f = $_SESSION['flash'];
        unset($_SESSION['flash']);
        $renk = $f['tur'] === 'basari' ? '#d4edda;color:#155724' : '#f8d7da;color:#721c24';
        echo "<div style='background:{$renk};padding:1rem 1.5rem;border-radius:8px;margin-bottom:1.5rem;font-weight:500;'>" . e($f['mesaj']) . "</div>";
    }
}
