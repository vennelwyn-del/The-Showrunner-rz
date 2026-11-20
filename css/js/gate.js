/* =========================================================
   THE SHOWRUNNER — LOGIC GIAO DIỆN 1 (MỞ TIVI & CHUYỂN CẢNH)
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const analogGate = document.getElementById("analog-gate");
  const tvPowerBtn = document.getElementById("tv-power-btn");
  const tvOffBtn = document.getElementById("tv-off-btn");
  const audioToggleBtn = document.getElementById("audio-toggle-btn");
  const glitchOverlay = document.getElementById("crt-glitch-overlay");
  const glitchOsd = document.getElementById("glitch-osd");
  const mainApp = document.getElementById("main-app");
  const osdClock = document.getElementById("osd-clock");

  let isTransitioning = false;
  let activeTimers = [];

  function clearAllTimers() {
    activeTimers.forEach((id) => clearTimeout(id));
    activeTimers = [];
  }

  function schedule(fn, delayMs) {
    const id = setTimeout(fn, delayMs);
    activeTimers.push(id);
    return id;
  }

  /* -------------------------------------------------------
     1. ĐỒNG HỒ SWEZAN 1994 CHẠY THỜI GIAN THỰC (30/11/1994 06:15)
     ------------------------------------------------------- */
  let simSeconds = 6 * 3600 + 15 * 60; // 06:15:00 sáng Thứ Hai

  function formatSimClock(totalSec) {
    const h = Math.floor((totalSec / 3600) % 24);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const pad = (n) => String(n).padStart(2, "0");
    return `30/11/1994 — ${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  if (osdClock) {
    osdClock.textContent = formatSimClock(simSeconds);
    setInterval(() => {
      simSeconds += 1;
      osdClock.textContent = formatSimClock(simSeconds);
    }, 1000);
  }

  /* -------------------------------------------------------
     2. TƯƠNG TÁC HOVER NÚT NGUỒN (TĂNG NHIỄU NHẸ TRÊN TIÊU ĐỀ)
     ------------------------------------------------------- */
  if (tvPowerBtn && analogGate) {
    tvPowerBtn.addEventListener("mouseenter", () => {
      analogGate.classList.add("is-hover-charged");
    });
    tvPowerBtn.addEventListener("mouseleave", () => {
      analogGate.classList.remove("is-hover-charged");
    });
    tvPowerBtn.addEventListener("focus", () => {
      analogGate.classList.add("is-hover-charged");
    });
    tvPowerBtn.addEventListener("blur", () => {
      analogGate.classList.remove("is-hover-charged");
    });
  }

  /* -------------------------------------------------------
     3. NÚT BẬT / TẮT ÂM THANH ANALOG
     ------------------------------------------------------- */
  if (audioToggleBtn) {
    audioToggleBtn.addEventListener("click", () => {
      if (!window.AnalogAudio) return;
      const muted = window.AnalogAudio.toggleMute();
      audioToggleBtn.textContent = muted
        ? "[ÂM THANH TIVI: TẮT]"
        : "[ÂM THANH TIVI: BẬT]";
      audioToggleBtn.setAttribute("aria-pressed", String(!muted));
    });
  }

  /* -------------------------------------------------------
     4. HÀNH ĐỘNG MỞ TIVI (BẮT ĐẦU CHUỖI ANIMATION LÀM NHIỄU)
     ------------------------------------------------------- */
  function triggerTvPowerOn() {
    if (isTransitioning) return;
    isTransitioning = true;
    clearAllTimers();

    tvPowerBtn.disabled = true;
    tvPowerBtn.classList.add("is-pressing");

    if (window.AnalogAudio) {
      window.AnalogAudio.playPowerOnSound();
    }

    // Bước 1 (100ms): Bắt đầu xé hình giao diện chờ & bùng nhiễu tuyết
    schedule(() => {
      body.classList.remove("is-standby");
      body.classList.add("is-bursting");
      analogGate.classList.add("is-powering-on");

      if (window.AnalogNoise) {
        window.AnalogNoise.setMode("burst");
      }

      glitchOverlay.className =
        "crt-glitch-overlay is-active is-powering-on is-showing-osd";
      if (glitchOsd) glitchOsd.textContent = "SIGNAL DETECTED // K-TV CH-08";
    }, 100);

    // Bước 2: Chớp các khung dữ liệu cướp sóng
    schedule(() => {
      if (glitchOsd) glitchOsd.textContent = "TRACKING 50Hz... [TẬP 3/4: PHÁ KÉN]";
    }, 550);

    schedule(() => {
      if (glitchOsd) glitchOsd.textContent = "CARRIER: THE RIDER — LOCKING...";
    }, 1000);

    schedule(() => {
      if (glitchOsd) glitchOsd.textContent = "▶ PLAY // ĐANG VÀO KÊNH CHÍNH";
    }, 1400);

    // Bước 3 (1820ms): Ổn định màn hình & mở Giao diện chính
    schedule(() => {
      analogGate.hidden = true;
      analogGate.classList.remove("is-powering-on", "is-hover-charged");
      tvPowerBtn.classList.remove("is-pressing");
      tvPowerBtn.disabled = false;

      glitchOverlay.className = "crt-glitch-overlay";
      body.classList.remove("is-bursting");
      body.classList.add("is-main-active");

      if (window.AnalogNoise) {
        window.AnalogNoise.setMode("calm");
      }

      mainApp.hidden = false;
      void mainApp.offsetWidth; // Trigger reflow để chạy verticalHoldSettle mượt
      mainApp.classList.add("is-visible");

      isTransitioning = false;
    }, 1820);
  }

  /* -------------------------------------------------------
     5. HÀNH ĐỘNG TẮT TIVI (QUAY LẠI GIAO DIỆN 1 ĐỂ TEST LẠI)
     ------------------------------------------------------- */
  function triggerTvPowerOff() {
    if (isTransitioning) return;
    isTransitioning = true;
    clearAllTimers();

    if (window.AnalogAudio) {
      window.AnalogAudio.playPowerOffSound();
    }

    body.classList.remove("is-main-active");
    body.classList.add("is-bursting");

    if (window.AnalogNoise) {
      window.AnalogNoise.setMode("burst");
    }

    glitchOverlay.className = "crt-glitch-overlay is-active is-powering-off";

    schedule(() => {
      mainApp.classList.remove("is-visible");
      mainApp.hidden = true;
    }, 280);

    schedule(() => {
      glitchOverlay.className = "crt-glitch-overlay";
      body.classList.remove("is-bursting");
      body.classList.add("is-standby");

      if (window.AnalogNoise) {
        window.AnalogNoise.setMode("standby");
      }

      analogGate.hidden = false;
      isTransitioning = false;
    }, 680);
  }

  if (tvPowerBtn) {
    tvPowerBtn.addEventListener("click", triggerTvPowerOn);
  }

  if (tvOffBtn) {
    tvOffBtn.addEventListener("click", triggerTvPowerOff);
  }
});