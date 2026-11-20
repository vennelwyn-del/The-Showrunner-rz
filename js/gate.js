/* =========================================================
   THE SHOWRUNNER — LOGIC GIAO DIỆN 1, ĐỔI MÀU (ĐỎ/ĐEN) & RADIO
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const body = document.body;

  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const radioToggleBtn = document.getElementById("radio-toggle-btn");
  const radioPanel = document.getElementById("radio-panel");
  const radioStatusText = document.getElementById("radio-status-text");
  const radioStationList = document.getElementById("radio-station-list");
  const radioPlayBtn = document.getElementById("radio-play-btn");
  const radioVolumeInput = document.getElementById("radio-volume");

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
     1. CHUYỂN ĐỔI 2 GIAO DIỆN MÀU: ĐỎ (red) <-> ĐEN (relic)
     (Đồng bộ lên cả <html> và <body> để tránh bị ghi đè CSS)
     ------------------------------------------------------- */
  function applyTheme(themeName) {
    const safeTheme = themeName === "relic" ? "relic" : "red";
    root.setAttribute("data-theme", safeTheme);
    body.setAttribute("data-theme", safeTheme);

    if (window.AnalogNoise && typeof window.AnalogNoise.setTheme === "function") {
      window.AnalogNoise.setTheme(safeTheme);
    }

    try {
      localStorage.setItem("showrunner_theme", safeTheme);
    } catch (e) {}
  }

  // Khởi tạo theme đã lưu (mặc định là "red")
  let savedTheme = "red";
  try {
    savedTheme = localStorage.getItem("showrunner_theme") || "red";
  } catch (e) {}
  applyTheme(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
      const current = body.getAttribute("data-theme") || "red";
      const next = current === "red" ? "relic" : "red";
      applyTheme(next);
    });
  }

  /* -------------------------------------------------------
     2. BỘ ĐIỀU KHIỂN RADIO ANALOG
     ------------------------------------------------------- */
  function syncRadioUI() {
    const playing = window.AnalogRadio ? window.AnalogRadio.isPlaying() : false;
    if (radioToggleBtn) {
      radioToggleBtn.classList.toggle("is-playing", playing);
    }
    if (radioPlayBtn) {
      radioPlayBtn.innerHTML = playing ? "&#9632; DỪNG RADIO" : "&#9654; PHÁT RADIO";
    }
    if (radioStatusText) {
      radioStatusText.textContent = playing ? "ĐANG PHÁT SÓNG" : "ĐANG TẮT";
      radioStatusText.classList.toggle("is-live", playing);
    }
  }

  if (radioToggleBtn && radioPanel) {
    radioToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const willOpen = radioPanel.hidden;
      radioPanel.hidden = !willOpen;
      radioToggleBtn.setAttribute("aria-expanded", String(willOpen));
    });

    // Bấm ra ngoài thì đóng bảng radio cho gọn màn hình
    document.addEventListener("click", (e) => {
      if (
        !radioPanel.hidden &&
        !radioPanel.contains(e.target) &&
        !radioToggleBtn.contains(e.target)
      ) {
        radioPanel.hidden = true;
        radioToggleBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  if (radioStationList) {
    const cfgMusic =
    window.SHOWRUNNER_CONFIG && Array.isArray(window.SHOWRUNNER_CONFIG.music)
      ? window.SHOWRUNNER_CONFIG.music
      : [];

  if (radioStationList && cfgMusic.length > 0) {
    const customHtml = cfgMusic
      .map(
        (m, idx) => `
      <button class="radio-station-btn ${idx === 0 ? "is-selected" : ""}" type="button"
        data-station="${m.id || `track-${idx}`}"
        data-url="${m.url || ""}">
        <span class="st-freq">${m.freq || `TAPE 0${idx + 1}`}</span>
        <span class="st-name">${m.title || "Băng Nhạc Swezan"}</span>
      </button>`
      )
      .join("");
    radioStationList.querySelectorAll(".radio-station-btn").forEach((b) => b.classList.remove("is-selected"));
    radioStationList.insertAdjacentHTML("afterbegin", customHtml);
    if (window.AnalogRadio && cfgMusic[0].url) {
      window.AnalogRadio.setStation(cfgMusic[0].id || "track-0", cfgMusic[0].url);
    }
  }
    radioStationList.addEventListener("click", (e) => {
      const btn = e.target.closest(".radio-station-btn");
      if (!btn) return;
      radioStationList
        .querySelectorAll(".radio-station-btn")
        .forEach((b) => b.classList.remove("is-selected"));
      btn.classList.add("is-selected");

      if (window.AnalogRadio) {
        window.AnalogRadio.setStation(btn.dataset.station, btn.dataset.url || "");
      }
    });
  }

  if (radioPlayBtn) {
    radioPlayBtn.addEventListener("click", () => {
      if (window.AnalogRadio) {
        window.AnalogRadio.togglePlay();
        syncRadioUI();
      }
    });
  }

  if (radioVolumeInput) {
    radioVolumeInput.addEventListener("input", () => {
      if (window.AnalogRadio) {
        window.AnalogRadio.setVolume(radioVolumeInput.value);
      }
    });
  }

  syncRadioUI();

  /* -------------------------------------------------------
     3. ĐỒNG HỒ SWEZAN 1994 (30/11/1994 — 06:15:00)
     ------------------------------------------------------- */
  let simSeconds = 6 * 3600 + 15 * 60;

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
     4. TƯƠNG TÁC NÚT MỞ TIVI & ÂM THANH TIVI
     ------------------------------------------------------- */
  if (tvPowerBtn && analogGate) {
    tvPowerBtn.addEventListener("mouseenter", () => analogGate.classList.add("is-hover-charged"));
    tvPowerBtn.addEventListener("mouseleave", () => analogGate.classList.remove("is-hover-charged"));
    tvPowerBtn.addEventListener("focus", () => analogGate.classList.add("is-hover-charged"));
    tvPowerBtn.addEventListener("blur", () => analogGate.classList.remove("is-hover-charged"));
  }

  if (audioToggleBtn) {
    audioToggleBtn.addEventListener("click", () => {
      if (!window.AnalogAudio) return;
      const muted = window.AnalogAudio.toggleMute();
      audioToggleBtn.textContent = muted ? "[ÂM THANH TIVI: TẮT]" : "[ÂM THANH TIVI: BẬT]";
      audioToggleBtn.setAttribute("aria-pressed", String(!muted));
    });
  }

  function triggerTvPowerOn() {
    if (isTransitioning) return;
    isTransitioning = true;
    clearAllTimers();

    tvPowerBtn.disabled = true;
    tvPowerBtn.classList.add("is-pressing");

    if (window.AnalogAudio) window.AnalogAudio.playPowerOnSound();

    schedule(() => {
      body.classList.remove("is-standby");
      body.classList.add("is-bursting");
      analogGate.classList.add("is-powering-on");

      if (window.AnalogNoise) window.AnalogNoise.setMode("burst");

      glitchOverlay.className = "crt-glitch-overlay is-active is-powering-on is-showing-osd";
      if (glitchOsd) glitchOsd.textContent = "SIGNAL DETECTED // K-TV CH-08";
    }, 100);

    schedule(() => {
      if (glitchOsd) glitchOsd.textContent = "TRACKING 50Hz... [TẬP 3/4: PHÁ KÉN]";
    }, 550);

    schedule(() => {
      if (glitchOsd) glitchOsd.textContent = "CARRIER: THE RIDER — LOCKING...";
    }, 1000);

    schedule(() => {
      if (glitchOsd) glitchOsd.textContent = "▶ PLAY // ĐANG VÀO KÊNH CHÍNH";
    }, 1400);

    schedule(() => {
      analogGate.hidden = true;
      analogGate.classList.remove("is-powering-on", "is-hover-charged");
      tvPowerBtn.classList.remove("is-pressing");
      tvPowerBtn.disabled = false;

      glitchOverlay.className = "crt-glitch-overlay";
      body.classList.remove("is-bursting");
      body.classList.add("is-main-active");

      if (window.AnalogNoise) window.AnalogNoise.setMode("calm");

      mainApp.hidden = false;
      void mainApp.offsetWidth;
      mainApp.classList.add("is-visible");

      isTransitioning = false;
    }, 1820);
  }

  function triggerTvPowerOff() {
    if (isTransitioning) return;
    isTransitioning = true;
    clearAllTimers();

    if (window.AnalogAudio) window.AnalogAudio.playPowerOffSound();

    body.classList.remove("is-main-active");
    body.classList.add("is-bursting");

    if (window.AnalogNoise) window.AnalogNoise.setMode("burst");

    glitchOverlay.className = "crt-glitch-overlay is-active is-powering-off";

    schedule(() => {
      mainApp.classList.remove("is-visible");
      mainApp.hidden = true;
    }, 280);

    schedule(() => {
      glitchOverlay.className = "crt-glitch-overlay";
      body.classList.remove("is-bursting");
      body.classList.add("is-standby");

      if (window.AnalogNoise) window.AnalogNoise.setMode("standby");

      analogGate.hidden = false;
      isTransitioning = false;
    }, 680);
  }

  if (tvPowerBtn) tvPowerBtn.addEventListener("click", triggerTvPowerOn);
  if (tvOffBtn) tvOffBtn.addEventListener("click", triggerTvPowerOff);
});