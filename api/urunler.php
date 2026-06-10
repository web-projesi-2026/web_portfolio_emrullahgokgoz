<?php
// api/urunler.php — Veritabanından ürünleri JSON olarak döner
// Sitenin JavaScript'i bu endpoint'i çağırır

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../includes/config.php';

$kategori = trim($_GET['kategori'] ?? '');
$arama    = trim($_GET['q'] ?? '');
$siralama = $_GET['siralama'] ?? 'default';

$where  = ['u.aktif = 1'];
$params = [];

if ($kategori && $kategori !== 'tumu') {
    if ($kategori === 'indirim') {
        $where[] = 'u.indirimli_fiyat IS NOT NULL';
    } elseif ($kategori === 'yeni') {
        $where[] = 'u.one_cikan = 1';
    } else {
        $where[] = 'k.slug = ?';
        $params[] = $kategori;
    }
}

if ($arama) {
    $where[] = '(u.ad LIKE ? OR u.marka LIKE ? OR u.aciklama LIKE ?)';
    $params[] = "%$arama%";
    $params[] = "%$arama%";
    $params[] = "%$arama%";
}

$order = match($siralama) {
    'name-asc'    => 'u.ad ASC',
    'name-desc'   => 'u.ad DESC',
    'price-asc'   => 'COALESCE(u.indirimli_fiyat, u.fiyat) ASC',
    'price-desc'  => 'COALESCE(u.indirimli_fiyat, u.fiyat) DESC',
    default       => 'u.one_cikan DESC, u.olusturma DESC'
};

$sql = "
    SELECT u.id, u.ad, u.marka, u.aciklama,
           u.fiyat, u.indirimli_fiyat,
           u.beden, u.renk, u.stok,
           u.ana_fotograf, u.one_cikan,
           k.ad AS kategori, k.slug AS kategori_slug
    FROM urunler u
    LEFT JOIN kategoriler k ON k.id = u.kategori_id
    WHERE " . implode(' AND ', $where) . "
    ORDER BY $order
";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$urunler = $stmt->fetchAll();

// Fotoğraf URL'lerini ekle
foreach ($urunler as &$u) {
    $u['foto_url'] = $u['ana_fotograf']
        ? '/uploads/' . $u['ana_fotograf']
        : null;

    // Çoklu fotoğraflar
    $fotos = $pdo->prepare("SELECT dosya_adi FROM urun_fotograflar WHERE urun_id = ? ORDER BY sira");
    $fotos->execute([$u['id']]);
    $u['fotograflar'] = array_map(fn($f) => '/uploads/' . $f['dosya_adi'], $fotos->fetchAll(PDO::FETCH_COLUMN));

    // Beden ve renkleri diziye çevir
    $u['bedenler'] = $u['beden'] ? array_map('trim', explode(',', $u['beden'])) : [];
    $u['renkler']  = $u['renk']  ? array_map('trim', explode(',', $u['renk']))  : [];

    // Fiyat formatlama
    $u['fiyat_fmt']          = number_format($u['fiyat'], 2, ',', '.') . ' ₺';
    $u['indirimli_fiyat_fmt'] = $u['indirimli_fiyat']
        ? number_format($u['indirimli_fiyat'], 2, ',', '.') . ' ₺'
        : null;
}

echo json_encode($urunler, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
