document.addEventListener('DOMContentLoaded', function() {
    const formContainer = document.getElementById('formContainer');
    const ekleBtn = document.getElementById('ekleBtn');
    const listeleBtn = document.getElementById('listeleBtn');
    const kayitListesi = document.getElementById('kayitListesi');
    const listeSection = document.getElementById('liste');
    const formSection = document.getElementById('form');
    const formLink = document.getElementById('formLink');
    const listeLink = document.getElementById('listeLink');
    const currentUser = localStorage.getItem('currentUser');

    // Menü geçişleri
    formLink.addEventListener('click', function(e) {
        e.preventDefault();
        formSection.classList.remove('gizli');
        listeSection.classList.add('gizli');
    });

    listeLink.addEventListener('click', function(e) {
        e.preventDefault();
        formSection.classList.add('gizli');
        listeSection.classList.remove('gizli');
        verileriListele();
    });

    // Kayıtları localStorage'dan al
    function getKayitlar() {
        const tumKayitlar = JSON.parse(localStorage.getItem('kayitlar')) || {};
        return tumKayitlar[currentUser] || [];
    }

    // Kayıtları localStorage'a kaydet
    function kayitlariKaydet(kayitlar) {
        const tumKayitlar = JSON.parse(localStorage.getItem('kayitlar')) || {};
        tumKayitlar[currentUser] = kayitlar;
        localStorage.setItem('kayitlar', JSON.stringify(tumKayitlar));
    }

    // Tarih kontrolü
    function tarihKontrol(yeniTarih) {
        const kayitlar = getKayitlar();
        return !kayitlar.some(kayit => kayit.tarih === yeniTarih);
    }

    // Bugünün tarihini al
    const bugun = new Date().toISOString().split('T')[0];
    document.querySelector('.tarih').value = bugun;

    // Yeni satır ekleme fonksiyonu
    function yeniSatirEkle() {
        const yeniSatir = document.createElement('div');
        yeniSatir.className = 'form-row';
        yeniSatir.innerHTML = `
            <input type="date" class="tarih" required>
            <input type="text" placeholder="Yazı" class="yazi">
            <input type="text" placeholder="Cevşen" class="cevsen">
            <input type="text" placeholder="Kuran" class="kuran">
            <input type="text" placeholder="Mütala" class="mutala">
            <input type="text" placeholder="Ezber" class="ezber">
            <button class="sil-btn">Sil</button>
        `;

        // Yeni satırın tarih alanına bugünün tarihini set et
        const tarihInput = yeniSatir.querySelector('.tarih');
        tarihInput.value = bugun;

        // Tarih değişikliği kontrolü
        tarihInput.addEventListener('change', function(e) {
            if (!tarihKontrol(e.target.value)) {
                alert('Bu tarih için zaten bir kayıt mevcut!');
                e.target.value = '';
            }
        });

        // Silme butonu işlevselliği
        const silBtn = yeniSatir.querySelector('.sil-btn');
        silBtn.addEventListener('click', function(e) {
            if (confirm('Bu satırı silmek istediğinizden emin misiniz?')) {
                const silinecekTarih = yeniSatir.querySelector('.tarih').value;
                let kayitlar = getKayitlar();
                kayitlar = kayitlar.filter(kayit => kayit.tarih !== silinecekTarih);
                kayitlariKaydet(kayitlar);
                yeniSatir.remove();
                verileriListele();
            }
        });

        formContainer.appendChild(yeniSatir);
        alert('Yeni satır başarıyla eklendi!');
    }

    // Verileri kaydet
    function verileriKaydet() {
        const satirlar = document.querySelectorAll('.form-row');
        let kayitlar = getKayitlar();

        satirlar.forEach((satir) => {
            const tarih = satir.querySelector('.tarih').value;
            const yazi = satir.querySelector('.yazi').value;
            const cevsen = satir.querySelector('.cevsen').value;
            const kuran = satir.querySelector('.kuran').value;
            const mutala = satir.querySelector('.mutala').value;
            const ezber = satir.querySelector('.ezber').value;

            if (tarih) {
                // Eğer bu tarih için kayıt varsa güncelle, yoksa yeni kayıt ekle
                const kayitIndex = kayitlar.findIndex(k => k.tarih === tarih);
                const yeniKayit = {
                    tarih, yazi, cevsen, kuran, mutala, ezber
                };

                if (kayitIndex === -1) {
                    kayitlar.push(yeniKayit);
                } else {
                    kayitlar[kayitIndex] = yeniKayit;
                }
            }
        });

        kayitlariKaydet(kayitlar);
    }

    // Verileri listeleme fonksiyonu
    function verileriListele() {
        const kayitlar = getKayitlar();
        let html = `
            <div class="baslik-satir">
                <span>Tarih</span>
                <span>Yazı</span>
                <span>Cevşen</span>
                <span>Kuran</span>
                <span>Mütala</span>
                <span>Ezber</span>
            </div>
        `;

        if (kayitlar.length > 0) {
            // Tarihe göre sırala
            kayitlar.sort((a, b) => new Date(b.tarih) - new Date(a.tarih));

            kayitlar.forEach(kayit => {
                html += `
                    <div class="kayit-satir">
                        <span>${kayit.tarih}</span>
                        <span>${kayit.yazi || '-'}</span>
                        <span>${kayit.cevsen || '-'}</span>
                        <span>${kayit.kuran || '-'}</span>
                        <span>${kayit.mutala || '-'}</span>
                        <span>${kayit.ezber || '-'}</span>
                    </div>
                `;
            });
        } else {
            html += `
                <div class="kayit-satir">
                    <span colspan="6" style="text-align: center; grid-column: span 6;">Henüz kayıt bulunmamaktadır.</span>
                </div>
            `;
        }

        kayitListesi.innerHTML = html;
    }

    // İlk satırın tarih kontrolünü ekle
    const ilkTarihInput = document.querySelector('.tarih');
    ilkTarihInput.addEventListener('change', function(e) {
        if (!tarihKontrol(e.target.value)) {
            alert('Bu tarih için zaten bir kayıt mevcut!');
            e.target.value = bugun;
        }
    });

    // İlk satırın sil butonuna işlevsellik ekleme
    const ilkSilBtn = document.querySelector('.sil-btn');
    ilkSilBtn.addEventListener('click', function(e) {
        const satirlar = document.querySelectorAll('.form-row');
        if (satirlar.length > 1) {
            if (confirm('Bu satırı silmek istediğinizden emin misiniz?')) {
                const silinecekTarih = e.target.closest('.form-row').querySelector('.tarih').value;
                let kayitlar = getKayitlar();
                kayitlar = kayitlar.filter(kayit => kayit.tarih !== silinecekTarih);
                kayitlariKaydet(kayitlar);
                e.target.closest('.form-row').remove();
                verileriListele();
            }
        } else {
            alert('Son satır silinemez!');
        }
    });

    // Event listener'ları ekleme
    ekleBtn.addEventListener('click', yeniSatirEkle);
    listeleBtn.addEventListener('click', function() {
        verileriKaydet(); // Önce mevcut verileri kaydet
        formSection.classList.add('gizli');
        listeSection.classList.remove('gizli');
        verileriListele();
    });

    // Sayfa yüklendiğinde form bölümünü göster, liste bölümünü gizle
    formSection.classList.remove('gizli');
    listeSection.classList.add('gizli');

    // Sayfa yüklendiğinde mevcut kayıtları form alanlarına doldur
    const kayitlar = getKayitlar();
    if (kayitlar.length > 0) {
        // İlk satırı doldur
        const ilkSatir = document.querySelector('.form-row');
        ilkSatir.querySelector('.tarih').value = kayitlar[0].tarih;
        ilkSatir.querySelector('.yazi').value = kayitlar[0].yazi || '';
        ilkSatir.querySelector('.cevsen').value = kayitlar[0].cevsen || '';
        ilkSatir.querySelector('.kuran').value = kayitlar[0].kuran || '';
        ilkSatir.querySelector('.mutala').value = kayitlar[0].mutala || '';
        ilkSatir.querySelector('.ezber').value = kayitlar[0].ezber || '';

        // Diğer kayıtlar için yeni satırlar ekle
        for (let i = 1; i < kayitlar.length; i++) {
            const yeniSatir = document.createElement('div');
            yeniSatir.className = 'form-row';
            yeniSatir.innerHTML = `
                <input type="date" class="tarih" value="${kayitlar[i].tarih}" required>
                <input type="text" placeholder="Yazı" class="yazi" value="${kayitlar[i].yazi || ''}">
                <input type="text" placeholder="Cevşen" class="cevsen" value="${kayitlar[i].cevsen || ''}">
                <input type="text" placeholder="Kuran" class="kuran" value="${kayitlar[i].kuran || ''}">
                <input type="text" placeholder="Mütala" class="mutala" value="${kayitlar[i].mutala || ''}">
                <input type="text" placeholder="Ezber" class="ezber" value="${kayitlar[i].ezber || ''}">
                <button class="sil-btn">Sil</button>
            `;

            // Silme butonu işlevselliği
            const silBtn = yeniSatir.querySelector('.sil-btn');
            silBtn.addEventListener('click', function(e) {
                if (confirm('Bu satırı silmek istediğinizden emin misiniz?')) {
                    const silinecekTarih = yeniSatir.querySelector('.tarih').value;
                    let kayitlar = getKayitlar();
                    kayitlar = kayitlar.filter(kayit => kayit.tarih !== silinecekTarih);
                    kayitlariKaydet(kayitlar);
                    yeniSatir.remove();
                    verileriListele();
                }
            });

            formContainer.appendChild(yeniSatir);
        }
    }
}); 