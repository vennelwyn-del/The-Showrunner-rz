/* =========================================================
   THE SHOWRUNNER — CANVAS HẠT NHIỄU 2 THEME, ÂM THANH TIVI & RADIO 1994
   ========================================================= */

(function () {
  const canvas = document.getElementById("analog-noise-canvas");
  const ctx = canvas ? canvas.getContext("2d", { alpha: true }) : null;

  let mode = "standby"; // "standby" | "burst" | "calm"
  let width = 0;
  let height = 0;
  let frameCount = 0;

  const PIXEL_SCALE = 3;

  function getActiveTheme() {
    return document.documentElement.getAttribute("data-theme") || "red";
  }

  function resizeCanvas() {
    if (!canvas) return;
    width = Math.max(160, Math.floor(window.innerWidth / PIXEL_SCALE));
    height = Math.max(90, Math.floor(window.innerHeight / PIXEL_SCALE));
    canvas.width = width;
    canvas.height = height;
  }

  function renderStandbyFrame() {
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;
    const isRed = getActiveTheme() === "red";

    for (let i = 0; i < data.length; i += 4) {
      const r = Math.random();
      if (isRed) {
        if (r > 0.93) {
          // Tia nhiễu đỏ tươi (#9C0412) & kem nhẹ
          data[i] = 175 + Math.floor(Math.random() * 45);
          data[i + 1] = 28 + Math.floor(Math.random() * 25);
          data[i + 2] = 38 + Math.floor(Math.random() * 25);
          data[i + 3] = 125;
        } else if (r < 0.03) {
          // Hạt sáng kem
          data[i] = 225;
          data[i + 1] = 205;
          data[i + 2] = 200;
          data[i + 3] = 95;
        } else {
          // Nền đỏ thẫm (#340506 - #520102)
          data[i] = 48 + Math.floor(Math.random() * 35);
          data[i + 1] = 4;
          data[i + 2] = 6;
          data[i + 3] = 65;
        }
      } else {
        // Theme Silent Relic (Đen tuyền #090909 - Xám đá #353535 - Bạc #acacac)
        if (r > 0.92) {
          const v = 140 + Math.floor(Math.random() * 45);
          data[i] = v;
          data[i + 1] = v;
          data[i + 2] = v;
          data[i + 3] = 115;
        } else if (r < 0.015) {
          // Điểm nhấn Blood Wine (#3f1117)
          data[i] = 95;
          data[i + 1] = 22;
          data[i + 2] = 30;
          data[i + 3] = 110;
        } else {
          const v = 9 + Math.floor(Math.random() * 36);
          data[i] = v;
          data[i + 1] = v;
          data[i + 2] = v;
          data[i + 3] = 70;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Vệt xước sọc ngang VHS
    if (Math.random() > 0.78) {
      const y = Math.floor(Math.random() * height);
      const h = 1 + Math.floor(Math.random() * 2);
      ctx.fillStyle = isRed
        ? Math.random() > 0.5
          ? "rgba(156, 4, 18, 0.42)"
          : "rgba(242, 230, 228, 0.25)"
        : Math.random() > 0.78
          ? "rgba(63, 17, 23, 0.45)"
          : "rgba(172, 172, 172, 0.28)";
      ctx.fillRect(0, y, width, h);
    }
  }

  function renderBurstFrame() {
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;
    const isRed = getActiveTheme() === "red";

    for (let i = 0; i < data.length; i += 4) {
      const roll = Math.random();
      if (isRed) {
        if (roll > 0.85) {
          // Đỏ tín hiệu (#9C0412)
          data[i] = 156 + Math.floor(Math.random() * 50);
          data[i + 1] = 8;
          data[i + 2] = 22;
          data[i + 3] = 255;
        } else if (roll > 0.52) {
          // Tuyết sáng hồng tro
          const v = 150 + Math.floor(Math.random() * 85);
          data[i] = v;
          data[i + 1] = v - 22;
          data[i + 2] = v - 24;
          data[i + 3] = 245;
        } else {
          // Đỏ đen (#340506)
          data[i] = 20 + Math.floor(Math.random() * 40);
          data[i + 1] = 4;
          data[i + 2] = 5;
          data[i + 3] = 255;
        }
      } else {
        if (roll > 0.94) {
          // Đốm rượu vang (#3f1117)
          data[i] = 105;
          data[i + 1] = 22;
          data[i + 2] = 30;
          data[i + 3] = 255;
        } else if (roll > 0.48) {
          // Tuyết bạc phai (#acacac)
          const v = 130 + Math.floor(Math.random() * 100);
          data[i] = v;
          data[i + 1] = v;
          data[i + 2] = v;
          data[i + 3] = 245;
        } else {
          // Đen xám đá (#090909 - #353535)
          const v = 9 + Math.floor(Math.random() * 44);
          data[i] = v;
          data[i + 1] = v;
          data[i + 2] = v;
          data[i + 3] = 255;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Dải xé hình ngang
    const tearCount = 4 + Math.floor(Math.random() * 6);
    for (let t = 0; t < tearCount; t++) {
      const y = Math.floor(Math.random() * height);
      const h = 2 + Math.floor(Math.random() * 10);
      const xOffset = Math.floor((Math.random() - 0.5) * 40);

      if (isRed) {
        ctx.fillStyle =
          Math.random() > 0.45
            ? "rgba(156, 4, 18, 0.62)"
            : "rgba(242, 230, 228, 0.45)";
      } else {
        ctx.fillStyle =
          Math.random() > 0.72
            ? "rgba(63, 17, 23, 0.55)"
            : "rgba(172, 172, 172, 0.52)";
      }
      ctx.fillRect(xOffset, y, width, h);
    }
  }

  function renderCalmFrame() {
    const isRed = getActiveTheme() === "red";
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = isRed
      ? "rgba(242, 230, 228, 0.16)"
      : "rgba(172, 172, 172, 0.18)";
    for (let i = 0; i < 120; i++) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
      ctx.fillRect(x, y, 1, 1);
    }
  }

  function loop() {
    frameCount++;
    if (ctx) {
      if (mode === "burst") {
        renderBurstFrame();
      } else if (mode === "calm") {
        if (frameCount % 3 === 0) renderCalmFrame();
      } else {
        if (frameCount % 2 === 0) renderStandbyFrame();
      }
    }
    requestAnimationFrame(loop);
  }

  if (canvas && ctx) {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    requestAnimationFrame(loop);
  }

  window.AnalogNoise = {
    setMode(nextMode) {
      mode = nextMode;
    },
  };

  /* =======================================================
     BỘ TỔNG HỢP ÂM THANH ANALOG CHUNG (TV SFX + RADIO)
     ======================================================= */
  let audioCtx = null;
  let isMuted = false;

  function ensureAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function createNoiseBuffer(context, durationSec) {
    const sampleRate = context.sampleRate;
    const length = Math.floor(sampleRate * durationSec);
    const buffer = context.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  window.AnalogAudio = {
    isMuted() {
      return isMuted;
    },
    toggleMute() {
      isMuted = !isMuted;
      return isMuted;
    },
    playClickBlip() {
      if (isMuted) return;
      try {
        const ctxAudio = ensureAudioContext();
        if (!ctxAudio) return;
        const now = ctxAudio.currentTime;
        const osc = ctxAudio.createOscillator();
        const gain = ctxAudio.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(65, now + 0.04);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
        osc.connect(gain).connect(ctxAudio.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } catch (err) {}
    },
    playPowerOnSound() {
      if (isMuted) return;
      try {
        const ctxAudio = ensureAudioContext();
        if (!ctxAudio) return;
        const now = ctxAudio.currentTime;

        const clickOsc = ctxAudio.createOscillator();
        const clickGain = ctxAudio.createGain();
        clickOsc.type = "triangle";
        clickOsc.frequency.setValueAtTime(160, now);
        clickOsc.frequency.exponentialRampToValueAtTime(42, now + 0.065);
        clickGain.gain.setValueAtTime(0.42, now);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        clickOsc.connect(clickGain).connect(ctxAudio.destination);
        clickOsc.start(now);
        clickOsc.stop(now + 0.075);

        const whineOsc = ctxAudio.createOscillator();
        const whineGain = ctxAudio.createGain();
        whineOsc.type = "sine";
        whineOsc.frequency.setValueAtTime(11800, now + 0.12);
        whineOsc.frequency.exponentialRampToValueAtTime(13800, now + 0.45);
        whineGain.gain.setValueAtTime(0.0001, now + 0.1);
        whineGain.gain.linearRampToValueAtTime(0.025, now + 0.25);
        whineGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
        whineOsc.connect(whineGain).connect(ctxAudio.destination);
        whineOsc.start(now + 0.1);
        whineOsc.stop(now + 1.45);

        const noiseSrc = ctxAudio.createBufferSource();
        noiseSrc.buffer = createNoiseBuffer(ctxAudio, 1.6);
        const bandpass = ctxAudio.createBiquadFilter();
        bandpass.type = "bandpass";
        bandpass.frequency.setValueAtTime(1400, now + 0.12);
        bandpass.Q.setValueAtTime(0.8, now + 0.12);

        const noiseGain = ctxAudio.createGain();
        noiseGain.gain.setValueAtTime(0.001, now + 0.08);
        noiseGain.gain.linearRampToValueAtTime(0.18, now + 0.25);
        noiseGain.gain.setValueAtTime(0.16, now + 1.0);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.65);

        noiseSrc.connect(bandpass).connect(noiseGain).connect(ctxAudio.destination);
        noiseSrc.start(now + 0.08);
        noiseSrc.stop(now + 1.68);
      } catch (err) {}
    },
    playPowerOffSound() {
      if (isMuted) return;
      try {
        const ctxAudio = ensureAudioContext();
        if (!ctxAudio) return;
        const now = ctxAudio.currentTime;

        const offOsc = ctxAudio.createOscillator();
        const offGain = ctxAudio.createGain();
        offOsc.type = "sine";
        offOsc.frequency.setValueAtTime(420, now);
        offOsc.frequency.exponentialRampToValueAtTime(45, now + 0.28);
        offGain.gain.setValueAtTime(0.16, now);
        offGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
        offOsc.connect(offGain).connect(ctxAudio.destination);
        offOsc.start(now);
        offOsc.stop(now + 0.32);
      } catch (err) {}
    },
  };

  /* =======================================================
     BỘ PHÁT RADIO ANALOG 3 KÊNH (CHẠY NGAY KHÔNG CẦN MP3)
     (Nếu bạn muốn dùng file .mp3 riêng sau này, có thể gắn thẻ <audio> vào đây)
     ======================================================= */
  let radioPlaying = false;
  let currentStation = "cassius";
  let radioVolume = 0.45;
  let radioMasterGain = null;
  let radioLoopTimer = null;
  let radioNoiseSrc = null;
  let noteStep = 0;

  // Chuỗi hợp âm trầm buồn cho 2 kênh âm nhạc
  const PIANO_SCALE = [220.0, 261.63, 329.63, 293.66, 246.94, 196.0, 261.63, 246.94];
  const JAZZ_CHORDS = [
    [146.83, 220.0, 261.63, 329.63], // Dm9
    [130.81, 196.0, 246.94, 293.66], // Cmaj9
    [123.47, 185.0, 220.0, 293.66],  // Bm7b5
    [110.0, 164.81, 207.65, 261.63], // AmMaj7
  ];

  function triggerPianoNote(ctxAudio, freq, duration, vol) {
    if (!radioMasterGain) return;
    const now = ctxAudio.currentTime;
    const osc = ctxAudio.createOscillator();
    const filter = ctxAudio.createBiquadFilter();
    const g = ctxAudio.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, now);

    // Giả lập âm thanh ấm qua loa đĩa than cũ
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1100, now);

    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(vol, now + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter).connect(g).connect(radioMasterGain);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  function startAmbientNoise(ctxAudio, level, lowFreq) {
    stopAmbientNoise();
    const buf = createNoiseBuffer(ctxAudio, 2.5);
    const src = ctxAudio.createBufferSource();
    src.buffer = buf;
    src.loop = true;

    const filter = ctxAudio.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(lowFreq, ctxAudio.currentTime);
    filter.Q.setValueAtTime(1.1, ctxAudio.currentTime);

    const g = ctxAudio.createGain();
    g.gain.setValueAtTime(level, ctxAudio.currentTime);

    src.connect(filter).connect(g).connect(radioMasterGain);
    src.start();
    radioNoiseSrc = src;
  }

  function stopAmbientNoise() {
    if (radioNoiseSrc) {
      try {
        radioNoiseSrc.stop();
      } catch (e) {}
      radioNoiseSrc = null;
    }
  }

  function startStationEngine() {
    const ctxAudio = ensureAudioContext();
    if (!ctxAudio) return;

    if (radioLoopTimer) {
      clearInterval(radioLoopTimer);
      radioLoopTimer = null;
    }
    stopAmbientNoise();

    if (!radioMasterGain) {
      radioMasterGain = ctxAudio.createGain();
      radioMasterGain.connect(ctxAudio.destination);
    }
    radioMasterGain.gain.setValueAtTime(radioVolume * 0.55, ctxAudio.currentTime);

    noteStep = 0;

    if (currentStation === "cassius") {
      // Tiếng đĩa than lách tách nhẹ + giai điệu piano buồn
      startAmbientNoise(ctxAudio, 0.035, 1900);
      triggerPianoNote(ctxAudio, PIANO_SCALE[0], 2.2, 0.25);
      radioLoopTimer = setInterval(() => {
        if (!radioPlaying) return;
        noteStep = (noteStep + 1) % PIANO_SCALE.length;
        const freq = PIANO_SCALE[noteStep];
        triggerPianoNote(ctxAudio, freq, 2.0, 0.22);
        if (noteStep % 2 === 0) {
          triggerPianoNote(ctxAudio, freq * 0.5, 2.8, 0.14);
        }
      }, 950);
    } else if (currentStation === "swan") {
      // Tiếng mưa đêm nhẹ + hợp âm Jazz chậm
      startAmbientNoise(ctxAudio, 0.055, 850);
      const firstChord = JAZZ_CHORDS[0];
      firstChord.forEach((f) => triggerPianoNote(ctxAudio, f, 2.6, 0.11));
      radioLoopTimer = setInterval(() => {
        if (!radioPlaying) return;
        noteStep = (noteStep + 1) % JAZZ_CHORDS.length;
        const chord = JAZZ_CHORDS[noteStep];
        chord.forEach((f, idx) => {
          setTimeout(() => {
            if (radioPlaying) triggerPianoNote(ctxAudio, f, 2.5, 0.1);
          }, idx * 75);
        });
      }, 2100);
    } else {
      // K-TV 50Hz nhiễu sóng bến cảng
      startAmbientNoise(ctxAudio, 0.16, 1150);
      radioLoopTimer = setInterval(() => {
        if (!radioPlaying) return;
        triggerPianoNote(ctxAudio, 100, 0.6, 0.04);
      }, 650);
    }
  }

  function stopStationEngine() {
    if (radioLoopTimer) {
      clearInterval(radioLoopTimer);
      radioLoopTimer = null;
    }
    stopAmbientNoise();
  }

  window.AnalogRadio = {
    isPlaying() {
      return radioPlaying;
    },
    start() {
      radioPlaying = true;
      startStationEngine();
    },
    stop() {
      radioPlaying = false;
      stopStationEngine();
    },
    toggle() {
      if (radioPlaying) {
        this.stop();
      } else {
        this.start();
      }
      return radioPlaying;
    },
    setStation(stationId) {
      currentStation = stationId;
      if (radioPlaying) {
        startStationEngine();
      }
    },
    setVolume(val01) {
      radioVolume = Math.max(0, Math.min(1, val01));
      if (radioMasterGain && audioCtx) {
        radioMasterGain.gain.setTargetAtTime(
          radioVolume * 0.55,
          audioCtx.currentTime,
          0.04
        );
      }
    },
  };
})();