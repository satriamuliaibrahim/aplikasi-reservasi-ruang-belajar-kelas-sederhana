document.addEventListener('DOMContentLoaded', () => {
    // 1. Logika Submit Form Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            if (username !== '' && password !== '') {
                window.location.href = 'index.html';
            } else {
                alert('Silakan masukkan username dan password!');
            }
        });
    }

    // 2. Logika Tombol Logout
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            const konfirmasi = confirm('Apakah Anda yakin ingin keluar dari sistem?');
            if (konfirmasi) {
                window.location.href = 'login.html';
            }
        });
    }
});