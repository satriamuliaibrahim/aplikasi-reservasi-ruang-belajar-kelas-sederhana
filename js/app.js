document.addEventListener("DOMContentLoaded", () => {
  // Registrasi akun demo disimpan di localStorage browser.
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = document.getElementById("regNama").value.trim();
      const nim = document.getElementById("regNim").value.trim();
      const email = document.getElementById("regEmail").value.trim().toLowerCase();
      const password = document.getElementById("regPassword").value;
      const confirmPassword = document.getElementById("regConfirm").value;
      const message = document.getElementById("registerMessage");
      const users = JSON.parse(localStorage.getItem("rb_demo_users") || "[]");

      message.classList.remove("error");
      if (password !== confirmPassword) {
        message.textContent = "Konfirmasi password belum sama.";
        message.classList.add("error");
        return;
      }
      if (users.some((user) => user.email === email || user.nim === nim)) {
        message.textContent = "Email atau NIM sudah terdaftar. Coba gunakan data lain.";
        message.classList.add("error");
        return;
      }

      users.push({ name, nim, email, password, role: "mahasiswa" });
      localStorage.setItem("rb_demo_users", JSON.stringify(users));
      localStorage.setItem("rb_demo_name", name);
      message.textContent = "Akun demo berhasil dibuat! Mengarahkan ke halaman login...";
      registerForm.reset();
      window.setTimeout(() => { window.location.href = "index.html"; }, 1000);
    });
  }
  const rolePages = { admin: "admin-dashboard.html", petugas: "petugas-dashboard.html", mahasiswa: "mahasiswa-dashboard.html" };

  // Demo login: setiap peran diarahkan ke file HTML dashboard yang terpisah.
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = document.getElementById("nama").value.trim();
      const nim = document.getElementById("nim").value.trim();
      const password = document.getElementById("password").value;
      const role = document.getElementById("role").value;
      if (!name || !nim || !password) return;

      // Akun mahasiswa harus cocok dengan data yang dibuat di halaman registrasi.
      if (role === "mahasiswa") {
        const users = JSON.parse(localStorage.getItem("rb_demo_users") || "[]");
        const matchedUser = users.find((user) =>
          user.name.toLowerCase() === name.toLowerCase() &&
          user.nim === nim && user.password === password
        );
        if (!matchedUser) {
          alert("Nama, NIM, atau password salah. Jika belum punya akun, silakan daftar dulu.");
          return;
        }
      } else {
        // Akun admin/petugas masih menggunakan akses demo untuk prototipe.
        const demoPassword = "demo123";
        if (password !== demoPassword) {
          alert("Untuk demo Admin/Petugas, gunakan password: demo123");
          return;
        }
      }
      localStorage.setItem("rb_demo_name", name);
      localStorage.setItem("rb_demo_nim", nim);
      localStorage.setItem("rb_demo_role", role);
      window.location.href = rolePages[role];
    });
  }

  const welcomeName = document.getElementById("welcomeName");
  if (welcomeName) {
    const savedName = localStorage.getItem("rb_demo_name");
    if (savedName) welcomeName.textContent = savedName;
  }

  // Form reservasi menyimpan data untuk demo di browser ini.
  const reservationForm = document.getElementById("reservationForm");
  if (reservationForm) {
    const roomSelect = document.getElementById("roomSelect");
    document.querySelectorAll(".reserve-room").forEach((button) => {
      button.addEventListener("click", () => {
        roomSelect.value = button.dataset.room;
        document.getElementById("reservasi").scrollIntoView({ behavior: "smooth" });
      });
    });

    reservationForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const reservation = {
        name: document.getElementById("studentName").value.trim(),
        room: roomSelect.value,
        date: document.getElementById("reservationDate").value,
        time: document.getElementById("reservationTime").value,
        purpose: document.getElementById("purpose").value.trim(),
        status: "Menunggu"
      };
      const reservations = JSON.parse(localStorage.getItem("rb_demo_reservations") || "[]");
      reservations.unshift(reservation);
      localStorage.setItem("rb_demo_reservations", JSON.stringify(reservations));
      const message = document.getElementById("formMessage");
      message.textContent = "Pengajuan demo berhasil ditambahkan ke browser.";
      reservationForm.reset();
      renderMyReservations();
    });
    renderMyReservations();
  }

  function renderMyReservations() {
    const table = document.getElementById("myReservationTable");
    if (!table) return;
    const stored = JSON.parse(localStorage.getItem("rb_demo_reservations") || "[]");
    if (!stored.length) return;
    const dateFormat = (value) => {
      if (!value) return "-";
      const d = new Date(value + "T00:00:00");
      return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
    };
    table.innerHTML = stored.map((item) => `<tr>
      <td>${escapeHtml(item.room)}</td><td>${dateFormat(item.date)}</td><td>${escapeHtml(item.time)}</td>
      <td>${escapeHtml(item.purpose)}</td><td><span class="pill pending">${escapeHtml(item.status)}</span></td>
    </tr>`).join("") + table.innerHTML;
    const count = document.getElementById("myReservationCount");
    const pending = document.getElementById("myPendingCount");
    if (count) count.textContent = 2 + stored.length;
    if (pending) pending.textContent = 1 + stored.length;
  }

  // Petugas hanya memverifikasi dan memberi rekomendasi, bukan menyetujui reservasi.
  const staffTable = document.getElementById("staffReservationTable");
  if (staffTable) {
    staffTable.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-action]");
      if (!button) return;
      const row = button.closest("tr");
      const statusCell = row.children[3];
      if (button.dataset.action === "recommend") {
        statusCell.innerHTML = '<span class="pill approved">Direkomendasikan ke Admin</span>';
        row.children[4].innerHTML = '<span class="muted">Rekomendasi terkirim ke Admin</span>';
      } else if (button.dataset.action === "flag") {
        statusCell.innerHTML = '<span class="pill pending">Perlu pemeriksaan ruangan</span>';
        row.children[4].innerHTML = '<span class="muted">Menunggu pemeriksaan</span>';
      }
    });
    const search = document.getElementById("searchReservation");
    if (search) search.addEventListener("input", () => {
      const query = search.value.toLowerCase();
      staffTable.querySelectorAll("tr").forEach((row) => {
        row.hidden = !row.textContent.toLowerCase().includes(query);
      });
    });
  }

  // Keputusan akhir persetujuan/penolakan hanya tersedia di halaman Admin.
  const adminTable = document.getElementById("adminReservationTable");
  if (adminTable) {
    adminTable.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-action]");
      if (!button) return;
      const row = button.closest("tr");
      const decisionCell = row.children[4];
      const actionCell = row.children[5];
      if (button.dataset.action === "approve") {
        decisionCell.innerHTML = '<span class="pill approved">Disetujui Admin</span>';
      } else if (button.dataset.action === "reject") {
        decisionCell.innerHTML = '<span class="pill rejected">Ditolak Admin</span>';
      }
      actionCell.innerHTML = '<span class="muted">Keputusan selesai</span>';
    });
  }

  // Pencarian daftar ruang mahasiswa.
  const searchRoom = document.getElementById("searchRoom");
  if (searchRoom) {
    searchRoom.addEventListener("input", () => {
      const query = searchRoom.value.toLowerCase();
      document.querySelectorAll("#roomCards .room-card").forEach((card) => {
        card.hidden = !card.textContent.toLowerCase().includes(query);
      });
    });
  }

  // Tombol tambah ruang demo di halaman admin.
  const addRoomBtn = document.getElementById("addRoomBtn");
  if (addRoomBtn) {
    addRoomBtn.addEventListener("click", () => {
      const name = prompt("Masukkan nama ruangan baru:");
      if (!name || !name.trim()) return;
      const row = document.createElement("tr");
      row.innerHTML = `<td><strong>${escapeHtml(name.trim())}</strong><small>Ruangan baru</small></td><td>-</td><td>Belum ditentukan</td><td><span class="pill available">Tersedia</span></td>`;
      document.getElementById("roomTable").appendChild(row);
      const count = document.getElementById("roomCount");
      if (count) count.textContent = Number(count.textContent) + 1;
    });
  }
});

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
}
