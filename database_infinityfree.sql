-- InfinityFree için düzenlenmiş SQL
-- CREATE DATABASE ve USE satırları kaldırıldı

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO kategoriler (ad, slug, sira) VALUES
  ('Elbise',        'elbise',        1),
  ('Gomlek',        'gomlek',        2),
  ('Pantolon',      'pantolon',      3),
  ('Etek',          'etek',          4),
  ('Ceket',         'ceket',         5),
  ('Aksesuar',      'aksesuar',      6),
  ('Canta',         'canta',         7),
  ('Ayakkabi',      'ayakkabi',      8);

-- ─────────────────────────────────────────────────────────────
-- Ürünler Tablosu
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS urunler (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  kategori_id     INT NOT NULL,
  ad              VARCHAR(200) NOT NULL,
  marka           VARCHAR(100) DEFAULT '',
  aciklama        TEXT,
  fiyat           DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  indirimli_fiyat DECIMAL(10,2) DEFAULT NULL,
  beden           VARCHAR(200) DEFAULT '',
  renk            VARCHAR(200) DEFAULT '',
  stok            INT DEFAULT 0,
  ana_fotograf    VARCHAR(300) DEFAULT '',
  aktif           TINYINT(1) DEFAULT 1,
  one_cikan       TINYINT(1) DEFAULT 0,
  olusturma       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  guncelleme      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (kategori_id) REFERENCES kategoriler(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────────────────────
-- Urun Fotograflar Tablosu
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS urun_fotograflar (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  urun_id   INT NOT NULL,
  dosya_adi VARCHAR(300) NOT NULL,
  alt_metin VARCHAR(200) DEFAULT '',
  sira      INT DEFAULT 0,
  FOREIGN KEY (urun_id) REFERENCES urunler(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────────────────────
-- Admin Tablosu
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS adminler (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  kullanici_adi VARCHAR(80) NOT NULL UNIQUE,
  sifre_hash    VARCHAR(255) NOT NULL,
  ad_soyad      VARCHAR(150) DEFAULT '',
  son_giris     TIMESTAMP NULL,
  aktif         TINYINT(1) DEFAULT 1,
  olusturma     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO adminler (kullanici_adi, sifre_hash, ad_soyad) VALUES
  ('admin', '$2y$12$9j6Q3XJGf5V8LkM2P4nN5.oWzRtYuIpAsD3fGhJkLmNoPqRsTuVwX', 'VogueLine Admin');

-- ─────────────────────────────────────────────────────────────
-- Ornek urunler
-- ─────────────────────────────────────────────────────────────
INSERT INTO urunler (kategori_id, ad, marka, aciklama, fiyat, indirimli_fiyat, beden, renk, stok, aktif, one_cikan) VALUES
(1, 'Midi Wrap Elbise', 'VogueLine', 'Zarif kesimi ve akskan kumasiyla her ortamda sikligini tamamlayan midi wrap elbise.', 1299.00, 999.00, 'XS,S,M,L,XL', 'Siyah,Ekru,Bordo', 15, 1, 1),
(1, 'Floral Maxi Elbise', 'VogueLine', 'Cicek desenli, yazlik maxi elbise.', 1499.00, NULL, 'S,M,L', 'Pembe,Mavi', 8, 1, 1),
(2, 'Oversize Linen Gomlek', 'VogueLine', 'Keten kumasindan uretilmis oversize gomlek.', 749.00, 599.00, 'S,M,L,XL', 'Beyaz,Bej,Mint', 20, 1, 0),
(3, 'Wide Leg Jean', 'VogueLine', 'Yuksek bel, genis paca denim pantolon.', 899.00, NULL, '34,36,38,40,42', 'Koyu Mavi,Acik Mavi', 12, 1, 1),
(5, 'Blazer Ceket', 'VogueLine', 'Klasik kesim blazer ceket.', 1799.00, 1499.00, 'S,M,L,XL', 'Siyah,Kamel,Krem', 6, 1, 1);
