# VogueLine Admin Paneli — Kurulum Kılavuzu

## 📁 Dosya Yapısı

```
vogueline/
├── admin/
│   ├── giris.php          ← Giriş sayfası
│   ├── index.php          ← Dashboard
│   ├── urunler.php        ← Ürün listesi
│   ├── urun_ekle.php      ← Ürün ekleme
│   ├── urun_duzenle.php   ← Ürün düzenleme
│   ├── kategoriler.php    ← Kategori yönetimi
│   ├── ayarlar.php        ← Şifre değiştirme
│   ├── cikis.php          ← Çıkış
│   └── layouts/
│       ├── header.php
│       └── footer.php
├── includes/
│   └── config.php         ← VT bağlantısı (buraya bilgilerinizi girin)
├── uploads/               ← Yüklenen fotoğraflar burada saklanır
│   └── .htaccess          ← Güvenlik: PHP çalıştırmayı engeller
├── database.sql           ← VT kurulum scripti
└── README.md
```

---

## 🚀 Kurulum (XAMPP / phpMyAdmin)

### 1. Dosyaları Kopyalayın
Tüm `vogueline/` klasörünü şuraya kopyalayın:
```
C:\xampp\htdocs\vogueline\
```

### 2. Veritabanını Kurun
1. Tarayıcıda `http://localhost/phpmyadmin` adresine gidin
2. Sol menüde **"Yeni"** ye tıklayın
3. Üst menüden **SQL** sekmesine tıklayın
4. `database.sql` dosyasının içeriğini kopyalayıp yapıştırın
5. **Çalıştır** düğmesine basın

### 3. config.php Düzenleyin
`includes/config.php` dosyasını açın:
```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'vogueline_db');
define('DB_USER', 'root');    // phpMyAdmin kullanıcı adınız
define('DB_PASS', '');        // XAMPP varsayılanı boş şifredir
```

### 4. Uploads Klasörü İzni
`uploads/` klasörünün yazılabilir olduğundan emin olun.
- **XAMPP Windows**: Otomatik olarak çalışır
- **Linux/Mac**: `chmod 775 uploads/`

### 5. Admin Paneline Giriş
```
http://localhost/vogueline/admin/giris.php
```
- **Kullanıcı adı**: admin
- **Şifre**: vogueline2024

> ⚠️ **Güvenlik**: Giriş yaptıktan sonra hemen şifrenizi değiştirin!
> Ayarlar → Şifre Değiştir

---

## 🔑 Varsayılan Şifre Hash'i Sorunları

Eğer giriş yapamıyorsanız, phpMyAdmin'de SQL ile şifreyi manuel güncelleyin:
```sql
UPDATE adminler
SET sifre_hash = '$2y$12$...'   -- aşağıda üretilecek hash
WHERE kullanici_adi = 'admin';
```

PHP ile hash üretmek için (htdocs'ta geçici bir dosya oluşturun):
```php
<?php echo password_hash('yeni_sifreniz', PASSWORD_BCRYPT, ['cost'=>12]); ?>
```

---

## 📋 Özellikler

| Özellik | Detay |
|---------|-------|
| ✅ Ürün Ekleme | Ad, marka, kategori, açıklama, fiyat, beden, renk, stok |
| ✅ Çoklu Fotoğraf | Birden fazla ürün fotoğrafı, drag & drop destekli |
| ✅ Fotoğraf Silme | Mevcut fotoğrafları tek tek silebilirsiniz |
| ✅ Ürün Güncelleme | Tüm alanlar düzenlenebilir |
| ✅ Ürün Silme | Tekil veya toplu silme |
| ✅ Kategori Yönetimi | Ekleme, silme, aktif/pasif toggle |
| ✅ Arama & Filtre | İsim, marka, kategori, durum bazlı filtre |
| ✅ Sayfalama | 15 ürün/sayfa |
| ✅ Dashboard | Anlık istatistikler + son ürünler |
| ✅ Güvenli Giriş | bcrypt şifreleme, oturum yönetimi |
| ✅ Şifre Değiştirme | Admin paneli üzerinden |

---

## 🛡️ Güvenlik

- Şifreler bcrypt (cost=12) ile hash'lenir
- PDO prepared statements — SQL injection koruması
- `htmlspecialchars` — XSS koruması
- Dosya tipi kontrolü (MIME type)
- `uploads/.htaccess` — PHP yürütme engeli
- Oturum kontrolü tüm sayfalarda aktif
