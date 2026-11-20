/* =========================================================
   THE SHOWRUNNER — LOGIC CHUYỂN MÀU, RADIO & MỞ TIVI CRT
   ========================================================= */

function initShowrunnerGate() {
  const htmlEl = document.documentElement;
  const body = document.body;

  const analogGate = document.getElementById("analog-gate");
  const tvPowerBtn = document.getElementById("tv-power-btn");
  const tvOffBtn = document.getElementById("tv-off-btn");
  const audioToggleBtn = document.getElementById("audio-toggle-btn");
  const glitchOverlay = document.getElementById("crt-glitch-overlay");
  const glitchOsd = document.getElementById("glitch-osd");
  const mainApp = document.getElementById("main-app");
  const osdClock = document.getElementById("osd-clock");

  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const radioToggleBtn = document.getElementById("radio-toggle-btn");
  const radioPanel = document.getElementById("radio-panel");
  const radioPlayBtn = document.getElementById("radio-play-btn");
  const radioStatusText = document.getElementById("radio-status-text");
  const radioStationList = document.getElementById("radio-station-list");
  const radioVolumeInput = document.getElementById("radio-volume");

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
     1. CHUYỂN ĐỔI 2 GIAO DIỆN MÀU (RED <-> SILENT RELIC)
     ------------------------------------------------------- */
  const THEME_STORAGE_KEY = "showrunner_theme";

  function applyTheme(themeName, withBlip = false) {
    const safeTheme = themeName === "relic" ? "relic" : "red";
    htmlEl.setAttribute("data-theme", safeTheme);
    body.setAttribute("data-theme", safeTheme);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, safeTheme);
    } catch (e) {}

    if (withBlip) {
      if (window.AnalogAudio) {
        window.AnalogAudio.playClickBlip();
      }
      body.classList.add("is-switching-theme");
      setTimeout(() => {
        body.classList.remove("is-switching-theme");
      }, 240);
    }
  }

  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === "relic" || savedTheme === "red") {
      applyTheme(savedTheme, false);
    }
  } catch (e) {}

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const current = htmlEl.getAttribute("data-theme") || "red";
      const next = current === "red" ? "relic" : "red";
      applyTheme(next, true);
    });
  }

  /* -------------------------------------------------------
     2. BỘ PHÁT RADIO ANALOG & ĐĨA CD QUAY TRÒN
     ------------------------------------------------------- */
  function syncRadioUI(playing) {
    if (radioToggleBtn) {
      radioToggleBtn.classList.toggle("is-playing", playing);
    }
    if (radioPlayBtn) {
      radioPlayBtn.innerHTML = playing ? "&#10074;&#10074; TẠM DỪNG" : "&#9654; PHÁT RADIO";
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

  if (radioPlayBtn) {
    radioPlayBtn.addEventListener("click", () => {
      if (!window.AnalogRadio) return;
      const isNowPlaying = window.AnalogRadio.toggle();
      syncRadioUI(isNowPlaying);
    });
  }

  if (radioStationList) {
    const stationBtns = radioStationList.querySelectorAll(".radio-station-btn");
    stationBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        stationBtns.forEach((b) => b.classList.remove("is-selected"));
        btn.classList.add("is-selected");

        const stationId = btn.getAttribute("data-station");
        if (window.AnalogRadio && stationId) {
          window.AnalogRadio.setStation(stationId);
          if (!window.AnalogRadio.isPlaying()) {
            window.AnalogRadio.start();
            syncRadioUI(true);
          }
        }
      });
    });
  }

  if (radioVolumeInput) {
    radioVolumeInput.addEventListener("input", () => {
      if (window.AnalogRadio) {
        window.AnalogRadio.setVolume(Number(radioVolumeInput.value) / 100);
      }
    });
  }

  /* -------------------------------------------------------
     3. ĐỒNG HỒ SWEZAN 1994 CHẠY THỜI GIAN THỰC
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
     4. TƯƠNG TÁC NÚT NGUỒN & ÂM THANH TIVI
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
     5. HÀNH ĐỘNG MỞ TIVI & TẮT TIVI
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

      if (window.AnalogNoise) {
        window.AnalogNoise.setMode("calm");
      }

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
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initShowrunnerGate);
} else {
  initShowrunnerGate();
}