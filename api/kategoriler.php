<?php
// api/kategoriler.php — Kategorileri JSON olarak döner
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../includes/config.php';

$stmt = $pdo->query("
    SELECT k.id, k.ad, k.slug,
           COUNT(u.id) AS urun_sayisi
    FROM kategoriler k
    LEFT JOIN urunler u ON u.kategori_id = k.id AND u.aktif = 1
    WHERE k.aktif = 1
    GROUP BY k.id
    ORDER BY k.sira
");

echo json_encode($stmt->fetchAll(), JSON_UNESCAPED_UNICODE);
