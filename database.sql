-- ============================================================
-- VogueLine Veritabanı Kurulum Scripti
-- phpMyAdmin'de "SQL" sekmesine yapıştırıp çalıştırın
-- ============================================================

CREATE DATABASE IF NOT EXISTS vogueline_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_turkish_ci;

USE vogueline_db;

-- ─────────────────────────────────────────────────────────────
-- Kategoriler Tablosu
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kategoriler (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  ad        VARCHAR(100) NOT NULL,
  slug      VARCHAR(100) NOT NULL UNIQUE,
  sira      INT DEFAULT 0,
  aktif     TINYINT(1) DEFAULT 1,
  olusturma TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

INSERT INTO kategoriler (ad, slug, sira) VALUES
  ('Elbise',        'elbise',        1),
  ('Gömlek',        'gomlek',        2),
  ('Pantolon',      'pantolon',      3),
  ('Etek',          'etek',          4),
  ('Ceket',         'ceket',         5),
  ('Aksesuar',      'aksesuar',      6),
  ('Çanta',         'canta',         7),
  ('Ayakkabı',      'ayakkabi',      8);

-- ─────────────────────────────────────────────────────────────
-- Ürünler Tablosu
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS urunler (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  kategori_id  INT NOT NULL,
  ad           VARCHAR(200) NOT NULL,
  marka        VARCHAR(100) DEFAULT '',
  aciklama     TEXT,
  fiyat        DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  indirimli_fiyat DECIMAL(10,2) DEFAULT NULL,
  beden        VARCHAR(200) DEFAULT '',   -- virgülle ayrılmış: XS,S,M,L,XL
  renk         VARCHAR(200) DEFAULT '',   -- virgülle ayrılmış: Siyah,Beyaz
  stok         INT DEFAULT 0,
  ana_fotograf VARCHAR(300) DEFAULT '',
  aktif        TINYINT(1) DEFAULT 1,
  one_cikan    TINYINT(1) DEFAULT 0,
  olusturma    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  guncelleme   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (kategori_id) REFERENCES kategoriler(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- ─────────────────────────────────────────────────────────────
-- Ürün Fotoğrafları Tablosu (çoklu fotoğraf desteği)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS urun_fotograflar (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  urun_id    INT NOT NULL,
  dosya_adi  VARCHAR(300) NOT NULL,
  alt_metin  VARCHAR(200) DEFAULT '',
  sira       INT DEFAULT 0,
  FOREIGN KEY (urun_id) REFERENCES urunler(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- ─────────────────────────────────────────────────────────────
-- Admin Kullanıcılar Tablosu
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS adminler (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  kullanici_adi VARCHAR(80) NOT NULL UNIQUE,
  sifre_hash   VARCHAR(255) NOT NULL,
  ad_soyad     VARCHAR(150) DEFAULT '',
  son_giris    TIMESTAMP NULL,
  aktif        TINYINT(1) DEFAULT 1,
  olusturma    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_turkish_ci;

-- Varsayılan admin: kullanıcı=admin  şifre=vogueline2024
INSERT INTO adminler (kullanici_adi, sifre_hash, ad_soyad) VALUES
  ('admin', '$2y$12$9j6Q3XJGf5V8LkM2P4nN5.oWzRtYuIpAsD3fGhJkLmNoPqRsTuVwX', 'VogueLine Admin');
-- NOT: Gerçek şifre için admin/index.php üzerinden şifreyi güncelleyin
-- Yukarıdaki hash "vogueline2024" için örnek. Kendi hash'inizi üretmek için:
-- php -r "echo password_hash('yeni_sifreniz', PASSWORD_BCRYPT, ['cost'=>12]);"

-- ─────────────────────────────────────────────────────────────
-- Örnek ürünler
-- ─────────────────────────────────────────────────────────────
INSERT INTO urunler (kategori_id, ad, marka, aciklama, fiyat, indirimli_fiyat, beden, renk, stok, aktif, one_cikan) VALUES
(1, 'Midi Wrap Elbise', 'VogueLine', 'Zarif kesimi ve akışkan kumaşıyla her ortamda şıklığını tamamlayan midi wrap elbise.', 1299.00, 999.00, 'XS,S,M,L,XL', 'Siyah,Ekru,Bordo', 15, 1, 1),
(1, 'Floral Maxi Elbise', 'VogueLine', 'Çiçek desenli, yazlık maxi elbise. Sahil ve şehir kombinleri için ideal.', 1499.00, NULL, 'S,M,L', 'Pembe,Mavi', 8, 1, 1),
(2, 'Oversize Linen Gömlek', 'VogueLine', 'Keten kumaşından üretilmiş oversize kesim gömlek. Nefes alan yapısıyla yaz favori.', 749.00, 599.00, 'S,M,L,XL', 'Beyaz,Bej,Mint', 20, 1, 0),
(3, 'Wide Leg Jean', 'VogueLine', 'Yüksek bel, geniş paça denim pantolon. Retro ilhamıyla modern bir silüet.', 899.00, NULL, '34,36,38,40,42', 'Koyu Mavi,Açık Mavi', 12, 1, 1),
(5, 'Blazer Ceket', 'VogueLine', 'Klasik kesim blazer ceket. Ofis ve akşam kombinleri için vazgeçilmez.', 1799.00, 1499.00, 'S,M,L,XL', 'Siyah,Kamel,Krem', 6, 1, 1);
