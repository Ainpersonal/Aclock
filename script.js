const body = document.body;
const hourHand = document.querySelector(".hour");
const minuteHand = document.querySelector(".minute");
const secondHand = document.querySelector(".second");
const modeSwitch = document.querySelector(".mode-switch");

const digitalTimeEl = document.querySelector("#digital-time");
const digitalDateEl = document.querySelector("#digital-date");
const themeButtons = document.querySelectorAll(".theme-btn");

// ==========================================
// THEME & DARK MODE SETUP
// ==========================================
const setTheme = (theme) => {
    body.dataset.theme = theme;
    localStorage.setItem("theme", theme);

    themeButtons.forEach((btn) => {
        btn.classList.toggle("is-active", btn.dataset.theme === theme);
    });
};

setTheme(localStorage.getItem("theme") || "ocean");

themeButtons.forEach((btn) => {
    btn.addEventListener("click", () => setTheme(btn.dataset.theme));
});

if (localStorage.getItem("mode") === "Dark Mode") {
    body.classList.add("dark");
    modeSwitch.textContent = "Light Mode";
}

const toggleDarkMode = () => {
    const isDarkMode = body.classList.toggle("dark");
    modeSwitch.textContent = isDarkMode ? "Light Mode" : "Dark Mode";
    localStorage.setItem("mode", isDarkMode ? "Dark Mode" : "Light Mode");
};

modeSwitch.addEventListener("click", toggleDarkMode);
modeSwitch.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleDarkMode();
    }
});

// ==========================================
// CLOCK LOGIC
// ==========================================
const updateTime = () => {
    const date = new Date();
    const seconds = date.getSeconds();
    const minutes = date.getMinutes();
    const hours = date.getHours() % 12;

    const secToDeg = (seconds / 60) * 360;
    const minToDeg = ((minutes + seconds / 60) / 60) * 360;
    const hrToDeg = ((hours + minutes / 60) / 12) * 360;
    
    secondHand.style.transform = `rotate(${secToDeg}deg)`;
    minuteHand.style.transform = `rotate(${minToDeg}deg)`;
    hourHand.style.transform = `rotate(${hrToDeg}deg)`;

    if (digitalTimeEl) {
        digitalTimeEl.textContent = new Intl.DateTimeFormat(undefined, {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        }).format(date);
    }

    if (digitalDateEl) {
        digitalDateEl.textContent = new Intl.DateTimeFormat(undefined, {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "2-digit",
        }).format(date);
    }
};

setInterval(updateTime, 1000);
updateTime();

// ==========================================
// CALENDAR LOGIC
// ==========================================
const monthYearEl = document.getElementById("month-year");
const calendarDaysEl = document.getElementById("calendar-days");
const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");

let currentDate = new Date();

const renderCalendar = () => {
    // Dapatkan info bulan & tahun saat ini
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Set judul header (misal: "March 2026")
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    monthYearEl.textContent = `${monthNames[month]} ${year}`;

    // Dapatkan hari pertama di bulan ini (0 = Minggu, 1 = Senin, dst)
    const firstDay = new Date(year, month, 1).getDay();
    
    // Dapatkan jumlah total hari di bulan ini
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Dapatkan tanggal persis hari ini untuk di-highlight
    const today = new Date();
    const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
    const currentDay = today.getDate();

    // Bersihkan isi grid kalender sebelumnya
    calendarDaysEl.innerHTML = "";

    // Tambahkan div kosong untuk hari sebelum tanggal 1
    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement("div");
        emptyDiv.classList.add("empty");
        calendarDaysEl.appendChild(emptyDiv);
    }

    // Tambahkan div untuk setiap tanggal
    for (let i = 1; i <= daysInMonth; i++) {
        const dayDiv = document.createElement("div");
        dayDiv.textContent = i;

        // Jika ini adalah hari ini, tambahkan class "current-date"
        if (isCurrentMonth && i === currentDay) {
            dayDiv.classList.add("current-date");
        }

        calendarDaysEl.appendChild(dayDiv);
    }
};

// Event listener untuk tombol ganti bulan
prevMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// Render kalender saat pertama kali dimuat
renderCalendar();

// ==========================================
// NOTES LOGIC (Auto-save & Download)
// ==========================================
const notesArea = document.getElementById("notes-area");
const saveStatus = document.getElementById("save-status");
const downloadBtn = document.getElementById("download-notes");

// 1. Muat catatan yang sudah tersimpan saat web dibuka
notesArea.value = localStorage.getItem("quick_notes") || "";

// 2. Fitur Auto-Save saat mengetik
let typingTimer;
notesArea.addEventListener("input", () => {
    saveStatus.textContent = "Menyimpan...";
    
    // Hapus timer sebelumnya jika user masih mengetik
    clearTimeout(typingTimer);
    
    // Simpan ke localStorage setelah berhenti mengetik selama 1 detik
    typingTimer = setTimeout(() => {
        localStorage.setItem("quick_notes", notesArea.value);
        saveStatus.textContent = "Tersimpan di browser";
        
        // Hilangkan teks status setelah 3 detik
        setTimeout(() => {
            saveStatus.textContent = "";
        }, 3000);
    }, 1000); 
});

// 3. Fitur Download catatan sebagai file .txt
downloadBtn.addEventListener("click", () => {
    const textContent = notesArea.value;
    
    // Cek apakah catatan kosong
    if (!textContent.trim()) {
        alert("Catatan masih kosong, tidak ada yang bisa diunduh.");
        return;
    }
    
    // Membuat objek Blob (file virtual) dari teks
    const blob = new Blob([textContent], { type: "text/plain" });
    
    // Membuat elemen <a> sementara untuk memicu download
    const anchor = document.createElement("a");
    
    // Membuat nama file otomatis berdasarkan tanggal (misal: Catatan_2026-03-15.txt)
    const dateString = new Date().toISOString().split('T')[0];
    anchor.download = `Catatan_${dateString}.txt`;
    
    // Mengaitkan file virtual ke elemen <a> dan memicu klik
    anchor.href = window.URL.createObjectURL(blob);
    anchor.click();
    
    // Membersihkan URL setelah selesai diunduh
    window.URL.revokeObjectURL(anchor.href);
});