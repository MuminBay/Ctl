document.addEventListener('DOMContentLoaded', function() {
    const userList = document.getElementById('userList');
    const userRecords = document.getElementById('userRecords');
    const recordsList = document.getElementById('recordsList');
    const backToUsers = document.getElementById('backToUsers');
    const usersSection = document.getElementById('users');
    const settingsSection = document.getElementById('settings');
    const usersLink = document.getElementById('usersLink');
    const settingsLink = document.getElementById('settingsLink');
    const adminPasswordForm = document.getElementById('adminPasswordForm');

    // Yönetici kontrolü
    const currentUser = localStorage.getItem('currentUser');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    // Yönetici değilse ana sayfaya yönlendir
    if (!isAdmin) {
        window.location.href = 'index.html';
        return;
    }

    // Kullanıcı bilgilerini txt dosyasına kaydet
    function saveUsersTxt() {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const ADMIN_USERS = [
            { username: 'AbdulvahabDemir', password: '0202' },
            { username: 'HasanAkkaya', password: '4646' }
        ];

        let content = "YÖNETİCİLER:\n";
        content += "===========\n\n";
        
        ADMIN_USERS.forEach(admin => {
            content += `Kullanıcı Adı: ${admin.username}\n`;
            content += `Şifre: ${admin.password}\n`;
            content += "-------------------\n";
        });

        content += "\nKULLANICILAR:\n";
        content += "===========\n\n";

        users.forEach(user => {
            content += `Kullanıcı Adı: ${user.username}\n`;
            content += `Şifre: ${user.password}\n`;
            content += "-------------------\n";
        });

        // Dosyayı oluştur ve indir
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'kullanici_bilgileri.txt';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }

    // Menü geçişleri
    usersLink.addEventListener('click', function(e) {
        e.preventDefault();
        usersSection.classList.remove('gizli');
        userRecords.classList.add('gizli');
        settingsSection.classList.add('gizli');
        usersLink.classList.add('active');
        settingsLink.classList.remove('active');
    });

    settingsLink.addEventListener('click', function(e) {
        e.preventDefault();
        settingsSection.classList.remove('gizli');
        usersSection.classList.add('gizli');
        userRecords.classList.add('gizli');
        settingsLink.classList.add('active');
        usersLink.classList.remove('active');
    });

    // Kullanıcıları listele
    function showUsers() {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const contacts = JSON.parse(localStorage.getItem('contacts')) || {};
        let html = '<h2>Kayıtlı Kullanıcılar</h2>';

        // Kullanıcı bilgilerini kaydet butonu ekle
        html += `
            <div class="admin-actions">
                <button id="saveUsersBtn" class="action-btn">Kullanıcı Bilgilerini İndir</button>
            </div>
        `;

        html += `
            <div class="user-list-header">
                <span>Kullanıcı Adı</span>
                <span>Ad Soyad</span>
                <span>Telefon</span>
            </div>
        `;

        users.forEach(user => {
            const userContact = contacts[user.username] || {};
            html += `
                <div class="user-item" data-username="${user.username}">
                    <span class="username">${user.username}</span>
                    <span>${userContact.fullName || '-'}</span>
                    <span>${userContact.phone ? '+90' + userContact.phone : '-'}</span>
                </div>
            `;
        });

        if (users.length === 0) {
            html += '<div class="user-item">Henüz kayıtlı kullanıcı bulunmamaktadır.</div>';
        }

        userList.innerHTML = html;

        // İndirme butonu olayı
        const saveUsersBtn = document.getElementById('saveUsersBtn');
        saveUsersBtn.addEventListener('click', saveUsersTxt);

        // Kullanıcı öğelerine tıklama olayı ekle
        document.querySelectorAll('.user-item').forEach(item => {
            item.addEventListener('click', function() {
                const username = this.dataset.username;
                if (username) {
                    showUserRecords(username);
                }
            });
        });
    }

    // Kullanıcı kayıtlarını göster
    function showUserRecords(username) {
        const tumKayitlar = JSON.parse(localStorage.getItem('kayitlar')) || {};
        const kayitlar = tumKayitlar[username] || [];

        let html = `
            <h2>${username} Kullanıcısının Kayıtları</h2>
            <div class="records-container">
                <div class="records-header">
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
                    <div class="record-item">
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
                <div class="no-records">
                    Bu kullanıcının henüz kaydı bulunmamaktadır.
                </div>
            `;
        }

        html += '</div>';
        recordsList.innerHTML = html;
        
        // Kayıtlar bölümünü göster, kullanıcılar bölümünü gizle
        usersSection.classList.add('gizli');
        userRecords.classList.remove('gizli');
    }

    // Geri dönüş butonu olayı
    backToUsers.addEventListener('click', function() {
        userRecords.classList.add('gizli');
        usersSection.classList.remove('gizli');
    });

    // Yönetici şifre güncelleme
    adminPasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;

        // Şifre kontrolü
        if (newPassword !== confirmNewPassword) {
            alert('Yeni şifreler eşleşmiyor!');
            return;
        }

        // Sabit yönetici bilgileri
        const ADMIN_USERS = [
            { username: 'AbdulvahabDemir', password: '0202' },
            { username: 'HasanAkkaya', password: '4646' }
        ];

        // Mevcut şifre kontrolü
        const admin = ADMIN_USERS.find(a => a.username === currentUser);
        if (!admin || admin.password !== currentPassword) {
            alert('Mevcut şifre yanlış!');
            return;
        }

        // Yönetici şifresini güncelle
        const adminIndex = ADMIN_USERS.findIndex(a => a.username === currentUser);
        ADMIN_USERS[adminIndex].password = newPassword;

        // LocalStorage'a kaydet
        localStorage.setItem('adminUsers', JSON.stringify(ADMIN_USERS));
        alert('Şifreniz başarıyla güncellendi!');
        adminPasswordForm.reset();
    });

    // Sayfa yüklendiğinde kullanıcıları göster
    showUsers();
}); 