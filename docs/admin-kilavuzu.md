# Admin kılavuzu

Yönetim paneli: `/admin` (site adresinin sonuna ekle). Sadece `admin` ve `owner` rolleri girer; jüri hesapları sadece `/admin/juri` ekranını görür. Giriş, sitedeki giriş sayfasıyla aynı (e-posta linki veya Google).

Tüm saatler Türkiye saatidir. Her önemli işlem sayfa içinde bir kez daha onay ister ve **İşlem geçmişi**'ne yazılır.

## 0. İlk kurulum (bir kez)

1. `OWNER_EMAILS` içindeki adresle siteye giriş yap. İlk girişte owner olursun (sunucuda `SUPABASE_SERVICE_ROLE_KEY` tanımlı olmalı).
2. **Hesaplar** → diğer organizatörleri **Admin** olarak ekle. Kayıtlı değillerse davet e-postası gider.
3. **İçerik** → başvuru açılış yazısını ("Ocak 2027"), geliştirme başlangıcını ve teslim son saatini kontrol et.

## 1. Başvuruları açma

1. **İçerik** → Başvuru durumu: **Açık** → Kaydet. Sitedeki "Başvur" butonu birkaç saniye içinde forma gider.
2. MLH üyeliği **resmî olarak onaylandıysa** "MLH onay kutularını göster" kutusunu aç. Onay yoksa açma.
3. Başvurular bitince durum: **Kapalı**. Mevcut katılımcılar panellerini kullanmaya devam eder.

## 2. Değerlendirme

1. **Başvurular**: arama, durum / üniversite / takım durumu / düzey filtreleri, sıralama. 18 yaş altı başvurular kırmızı etiketle işaretli (karar: `docs/organizator-notlari.md`).
2. Bir ada tıklayınca detay: tüm cevaplar, onaylar ve zamanları, CV (link 5 dakika geçerli), sadece adminlerin gördüğü notlar.
3. Karar: satırları seç → **Kabul et / Yedeğe al / Reddet**. "Karar e-postası gönder" işaretliyse herkese kendi dilinde e-posta gider.
4. Kabulden **önce** **İçerik** → "Katılım onayı son tarihi"ni gir; kabul e-postasında bu tarih yazar. Son tarihten sonra panelden onay verilemez (reddetmek her zaman mümkün).
5. Yer açılınca yedekteki kişiyi seçip **Kabul et**.

**CSV:** Başvurular sayfasının altında sütun seçerek indir. "Duyuru izni verenler" sadece pazarlama iznini işaretleyenleri içerir. MLH bayrağı açıksa "MLH dışa aktarma" sadece MLH paylaşım onayını verenleri içerir. CSV kişisel veri içerir: paylaşma, işin bitince sil.

## 3. E-posta

**E-posta** sayfası: alıcı gruplarını (duruma göre) seç, şablonu seç (hatırlatma, kabul, yedek vb.) ya da serbest metin yaz. Sağda TR/EN önizleme ve alıcı sayısı var. "Gönder" bir kez daha onay ister.

- Etkinlikle ilgili olmayan duyurular için "Sadece duyuru izni verenler" kutusunu işaretle.
- `RESEND_API_KEY` ve `EMAIL_FROM` yoksa hiçbir e-posta gitmez ve ekran bunu söyler.

## 4. Takımlar

- **Takımlar**: tüm takımlar, üye sayısı (3'ten az / 5'ten fazla uyarısı), takım kodu, teslim durumu.
- Sağda "Takımsız kabul edilenler": takım arayanlar üstte. Cumartesi eşleştirmesinde kişiyi bir takıma ekle ya da "Eşleştirme için yeni takım" kur.
- Eşleştirme bitince **Tüm takımları kilitle** (ya da İçerik'te otomatik kilit zamanı gir).

## 5. Etkinlik günü check-in

1. Telefondan `/admin/checkin` aç → **Kamerayı aç** → katılımcının panelindeki QR kodu okut.
2. Ekranda ad, üniversite, takım, beslenme notu, acil durum kişisi var mı görünür. **Check-in yap**.
3. "Zaten check-in yaptı" uyarısı tekrar girişi gösterir. Kabul edilmemiş veya onay vermemiş kişi için buton çıkmaz.
4. Kamera açılmazsa (izin, eski tarayıcı) aşağıdaki kutuya ad ya da e-posta yazarak ara.
5. Üstte sayaç ve son check-in'ler listesi var.

Check-in yapan katılımcılar, geliştirme başlangıcından teslim son saatine kadar panelden proje teslim edebilir.

## 6. Jüri atama ve puanlama

1. **Hesaplar** → jüri e-postalarını **Jüri** rolüyle ekle.
2. **Puanlama** → Ölçütler: onaylanan ölçüt ve ağırlıkları gir (puanlama başladıktan sonra anahtarları değiştirme).
3. Teslim kapandıktan sonra **Eksikleri otomatik ata (her takıma 2 jüri)**; gerekirse elle ekle/kaldır.
4. Jüriler `/admin/juri` ekranında (telefonda rahat) kendilerine atanan projeleri görür ve her ölçütü 1-10 puanlar. Jüri katılımcıların kişisel verisini görmez.
5. Puanlar bitince **Finalist seçimi** turunu **kapat** (puanlar kilitlenir).

## 7. Sonuçlar

1. **Puanlama → Sonuçlar: finalist seçimi**: ağırlıklı ortalama, jüri sayısı, standart sapma. İlk 10 önceden işaretli; eşitlikte sen karar ver. **Finalistleri kaydet**.
2. Final turunda bütün jüriler finalistleri görür ve puanlar (online jüri dahil).
3. Final bitince **Final** turunu kapat. **Sonuçlar: final** sıralamayı gösterir.

## 8. İçerik

- **Sponsorlar**: ekle / düzenle / sil, kategori, sıra, link, logo (SVG veya PNG, en fazla 2 MB), yayın durumu. Sadece onay veren sponsorları yayınla.
- **Jüri ve mentorlar**: isim, unvan, kurum, fotoğraf, link, yayın durumu. Yayında kimse yoksa sitede bölüm görünmez.
- **MLH rozeti**: üyelik onaylanınca MLH'nin verdiği link ve görsel adresini gir, "rozeti göster"i aç.

## 9. Hesaplar ve güvenlik

- Admin ve owner: admin veya jüri ekler, rolü kaldırır, hesabı devre dışı bırakır.
- Sadece owner başka bir admini owner yapabilir. Owner silinemez, devre dışı bırakılamaz; son owner'ın rolü kaldırılamaz. Kimse kendi rolünü değiştiremez.
- **İşlem geçmişi**: rol değişiklikleri, kararlar, check-in'ler, ayarlar, toplu e-postalar.

## Yerelde deneme (geliştiriciler için)

`supabase/seed.dev.sql` 25 sahte başvuru, 3 jüri, 1 admin, 4 takım ve teslim ekler. **Sadece yerel veritabanında** çalıştır; gerçek kullanıcı olan bir veritabanında çalışmayı reddeder.
