/* =========================================================
   THE SHOWRUNNER — NHIỄU ANALOG, ÂM THANH, RADIO & MÁU CLICK
   ========================================================= */

(function () {
  const canvas = document.getElementById("analog-noise-canvas");
  const ctx = canvas ? canvas.getContext("2d", { alpha: true }) : null;

  let mode = "standby";
  let currentTheme = "red";
  let width = 0;
  let height = 0;
  let frameCount = 0;

  const PIXEL_SCALE = 3;

  function resizeCanvas() {
    if (!canvas) return;
    width = Math.max(160, Math.floor(window.innerWidth / PIXEL_SCALE));
    height = Math.max(90, Math.floor(window.innerHeight / PIXEL_SCALE));
    canvas.width = width;
    canvas.height = height;
  }

  function getAccentRgb() {
    return currentTheme === "red" ? [184, 16, 32] : [195, 195, 195];
  }

  function renderStandbyFrame() {
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;
    const [ar, ag, ab] = getAccentRgb();

    for (let i = 0; i < data.length; i += 4) {
      const r = Math.random();
      if (r > 0.92) {
        const v = 135 + Math.floor(Math.random() * 55);
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 105;
      } else if (r < 0.02) {
        data[i] = ar;
        data[i + 1] = ag;
        data[i + 2] = ab;
        data[i + 3] = 145;
      } else {
        const v = 12 + Math.floor(Math.random() * 28);
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 60;
      }
    }

    ctx.putImageData(imgData, 0, 0);

    if (Math.random() > 0.75) {
      const y = Math.floor(Math.random() * height);
      const h = 1 + Math.floor(Math.random() * 2);
      ctx.fillStyle =
        Math.random() > 0.6
          ? `rgba(${ar}, ${ag}, ${ab}, 0.38)`
          : "rgba(185, 185, 185, 0.25)";
      ctx.fillRect(0, y, width, h);
    }
  }

  function renderBurstFrame() {
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;
    const [ar, ag, ab] = getAccentRgb();

    for (let i = 0; i < data.length; i += 4) {
      const roll = Math.random();
      if (roll > 0.92) {
        data[i] = ar;
        data[i + 1] = ag;
        data[i + 2] = ab;
        data[i + 3] = 255;
      } else if (roll > 0.48) {
        const v = 120 + Math.floor(Math.random() * 115);
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 245;
      } else {
        const v = 10 + Math.floor(Math.random() * 44);
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);

    const tearCount = 5 + Math.floor(Math.random() * 6);
    for (let t = 0; t < tearCount; t++) {
      const y = Math.floor(Math.random() * height);
      const h = 2 + Math.floor(Math.random() * 10);
      const xOffset = Math.floor((Math.random() - 0.5) * 44);
      ctx.fillStyle =
        Math.random() > 0.45
          ? `rgba(${ar}, ${ag}, ${ab}, 0.54)`
          : "rgba(195, 195, 195, 0.56)";
      ctx.fillRect(xOffset, y, width, h);
    }
  }

  function renderCalmFrame() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgba(195, 195, 195, 0.2)";
    for (let i = 0; i < 140; i++) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
      ctx.fillRect(x, y, 1, 1);
    }
    if (Math.random() > 0.92) {
      const y = Math.floor(Math.random() * height);
      ctx.fillStyle = "rgba(184, 16, 32, 0.28)";
      ctx.fillRect(0, y, width, 1);
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
    setTheme(nextTheme) {
      currentTheme = nextTheme === "relic" ? "relic" : "red";
    },
  };

  /* =======================================================
     HIỆU ỨNG CHẤM MÁU LAN TẠI CON TRỎ CHUỘT MỖI LẦN NHẤN
     ======================================================= */
  const BLOOD_SHAPES = [
    "M50,24 C63,20 75,31 73,44 C78,52 69,66 57,63 C50,70 36,68 33,57 C23,54 21,39 30,32 C34,22 43,26 50,24 Z",
    "M48,22 C58,18 71,24 72,36 C80,43 75,58 64,61 C56,69 40,67 35,56 C24,52 24,34 36,28 C40,21 44,24 48,22 Z",
    "M52,25 C66,22 76,34 71,48 C75,59 64,67 52,65 C43,72 30,63 29,51 C21,42 29,28 40,26 C44,20 48,26 52,25 Z",
  ];

  function spawnBloodSplat(x, y) {
    if (!document.body) return;
    const holder = document.createElement("div");
    holder.className = "blood-click-splat";
    holder.style.left = `${x}px`;
    holder.style.top = `${y}px`;
    holder.style.setProperty("--splat-rot", `${Math.floor(Math.random() * 46 - 23)}deg`);

    const shape = BLOOD_SHAPES[Math.floor(Math.random() * BLOOD_SHAPES.length)];
    const isRelic = document.body.getAttribute("data-theme") === "relic";
    const mainFill = isRelic ? "#7c0814" : "#ad0716";
    const coreFill = isRelic ? "#4a0208" : "#69010a";

    // Tạo 4-6 giọt bắn văng ngẫu nhiên quanh tâm
    const droplets = Array.from({ length: 5 }, () => {
      const ang = Math.random() * Math.PI * 2;
      const dist = 22 + Math.random() * 20;
      const cx = (50 + Math.cos(ang) * dist).toFixed(1);
      const cy = (45 + Math.sin(ang) * dist).toFixed(1);
      const r = (1.6 + Math.random() * 3.2).toFixed(1);
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${mainFill}" opacity="0.9" />`;
    }).join("");

    const dripX = (44 + Math.random() * 12).toFixed(1);

    holder.innerHTML = `
      <svg viewBox="0 0 100 120" aria-hidden="true">
        <path d="${shape}" fill="${mainFill}" opacity="0.92" />
        <circle cx="50" cy="45" r="11" fill="${coreFill}" opacity="0.72" />
        <path class="blood-drip-tail" d="M${dripX},56 Q${Number(dripX) + 2},82 ${dripX},104" stroke="${mainFill}" stroke-width="3.2" stroke-linecap="round" fill="none" />
        ${droplets}
      </svg>
    `;

    document.body.appendChild(holder);
    setTimeout(() => {
      holder.remove();
    }, 2150);
  }

  document.addEventListener("pointerdown", (e) => {
    if (e.button === 2) return; // Bỏ qua chuột phải
    spawnBloodSplat(e.clientX, e.clientY);
  });

  /* =======================================================
     WEB AUDIO API: ÂM THANH TIVI + RADIO ANALOG 3 KÊNH
     ======================================================= */
  let audioCtx = null;
  let isMuted = false;

  function ensureAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
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
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  window.AnalogAudio = {
    isMuted() { return isMuted; },
    toggleMute() { isMuted = !isMuted; return isMuted; },
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
        clickGain.gain.setValueAtTime(0.45, now);
        clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        clickOsc.connect(clickGain).connect(ctxAudio.destination);
        clickOsc.start(now);
        clickOsc.stop(now + 0.075);

        const noiseSrc = ctxAudio.createBufferSource();
        noiseSrc.buffer = createNoiseBuffer(ctxAudio, 1.5);
        const bandpass = ctxAudio.createBiquadFilter();
        bandpass.type = "bandpass";
        bandpass.frequency.setValueAtTime(1400, now + 0.1);
        const noiseGain = ctxAudio.createGain();
        noiseGain.gain.setValueAtTime(0.001, now + 0.08);
        noiseGain.gain.linearRampToValueAtTime(0.16, now + 0.25);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.55);
        noiseSrc.connect(bandpass).connect(noiseGain).connect(ctxAudio.destination);
        noiseSrc.start(now + 0.08);
        noiseSrc.stop(now + 1.58);
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

  let radioPlaying = false;
  let radioStation = "cassius";
  let radioVolume = 0.45;
  let radioMasterGain = null;
  let radioNoiseSrc = null;
  let radioHumOsc = null;
  let radioNoteTimer = null;
  let noteStep = 0;

  const CHOPIN_NOTES = [220.0, 261.63, 329.63, 311.13, 246.94, 293.66, 220.0, 196.0];
  const SWAN_CHORDS = [
    [146.83, 174.61, 220.0, 261.63],
    [130.81, 164.81, 196.0, 246.94],
    [110.0, 130.81, 164.81, 196.0],
  ];

  function stopRadioNodes() {
    if (radioNoteTimer) { clearInterval(radioNoteTimer); radioNoteTimer = null; }
    try {
      if (radioNoiseSrc) radioNoiseSrc.stop();
      if (radioHumOsc) radioHumOsc.stop();
    } catch (e) {}
    radioNoiseSrc = null;
    radioHumOsc = null;
  }

  function playSoftTone(ctxAudio, freq, duration, type, peakGain) {
    if (!radioMasterGain) return;
    const now = ctxAudio.currentTime;
    const osc = ctxAudio.createOscillator();
    const filter = ctxAudio.createBiquadFilter();
    const gain = ctxAudio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(950, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(peakGain, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(filter).connect(gain).connect(radioMasterGain);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  function startRadioStation() {
    stopRadioNodes();
    const ctxAudio = ensureAudioContext();
    if (!ctxAudio) return;

    radioMasterGain = ctxAudio.createGain();
    radioMasterGain.gain.setValueAtTime(radioVolume * 0.45, ctxAudio.currentTime);
    radioMasterGain.connect(ctxAudio.destination);

    radioNoiseSrc = ctxAudio.createBufferSource();
    radioNoiseSrc.buffer = createNoiseBuffer(ctxAudio, 2.0);
    radioNoiseSrc.loop = true;

    const filter = ctxAudio.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(radioStation === "static" ? 900 : 1800, ctxAudio.currentTime);
    const noiseGain = ctxAudio.createGain();
    noiseGain.gain.setValueAtTime(radioStation === "static" ? 0.24 : 0.045, ctxAudio.currentTime);
    radioNoiseSrc.connect(filter).connect(noiseGain).connect(radioMasterGain);
    radioNoiseSrc.start();

    noteStep = 0;
    if (radioStation === "cassius") {
      playSoftTone(ctxAudio, CHOPIN_NOTES[0], 1.4, "triangle", 0.22);
      radioNoteTimer = setInterval(() => {
        noteStep = (noteStep + 1) % CHOPIN_NOTES.length;
        playSoftTone(ctxAudio, CHOPIN_NOTES[noteStep], 1.35, "triangle", 0.2);
      }, 950);
    } else if (radioStation === "swan") {
      const triggerChord = () => {
        const chord = SWAN_CHORDS[noteStep % SWAN_CHORDS.length];
        chord.forEach((f) => playSoftTone(ctxAudio, f, 2.2, "sine", 0.09));
        noteStep++;
      };
      triggerChord();
      radioNoteTimer = setInterval(triggerChord, 2100);
    } else {
      radioHumOsc = ctxAudio.createOscillator();
      const humGain = ctxAudio.createGain();
      radioHumOsc.type = "sawtooth";
      radioHumOsc.frequency.setValueAtTime(50, ctxAudio.currentTime);
      const lowpass = ctxAudio.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.setValueAtTime(180, ctxAudio.currentTime);
      humGain.gain.setValueAtTime(0.16, ctxAudio.currentTime);
      radioHumOsc.connect(lowpass).connect(humGain).connect(radioMasterGain);
      radioHumOsc.start();
    }
  }

  window.AnalogRadio = {
    isPlaying() { return radioPlaying; },
    setStation(st) { radioStation = st || "cassius"; if (radioPlaying) startRadioStation(); },
    setVolume(val) {
      radioVolume = Math.max(0, Math.min(1, Number(val) / 100));
      if (radioMasterGain && audioCtx) radioMasterGain.gain.setValueAtTime(radioVolume * 0.45, audioCtx.currentTime);
    },
    togglePlay() {
      radioPlaying = !radioPlaying;
      if (radioPlaying) startRadioStation(); else stopRadioNodes();
      return radioPlaying;
    },
  };
  let customAudioEl = null;
  let customTrackUrl = "";

  function ensureCustomAudio() {
    if (!customAudioEl) {
      customAudioEl = new Audio();
      customAudioEl.loop = true;
    }
    return customAudioEl;
  }

  window.AnalogRadio = {
    isPlaying() {
      return radioPlaying;
    },
    setStation(st, customUrl) {
      radioStation = st || "cassius";
      customTrackUrl = customUrl || "";
      if (radioPlaying) {
        this.stop();
        this.play();
      }
    },
    setVolume(val) {
      radioVolume = Math.max(0, Math.min(1, Number(val) / 100));
      if (radioMasterGain && audioCtx) {
        radioMasterGain.gain.setValueAtTime(radioVolume * 0.45, audioCtx.currentTime);
      }
      if (customAudioEl) {
        customAudioEl.volume = radioVolume;
      }
    },
    play() {
      radioPlaying = true;
      if (customTrackUrl) {
        stopRadioNodes();
        const el = ensureCustomAudio();
        el.src = customTrackUrl;
        el.volume = radioVolume;
        el.play().catch(() => {});
      } else {
        if (customAudioEl) customAudioEl.pause();
        startRadioStation();
      }
      return true;
    },
    stop() {
      radioPlaying = false;
      stopRadioNodes();
      if (customAudioEl) customAudioEl.pause();
      return false;
    },
    togglePlay() {
      return radioPlaying ? this.stop() : this.play();
    },
})();