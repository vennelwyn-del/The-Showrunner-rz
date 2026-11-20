/* =========================================================
   THE SHOWRUNNER — CANVAS NHIỄU ANALOG, ÂM THANH CRT & RADIO 1994
   ========================================================= */

(function () {
  const canvas = document.getElementById("analog-noise-canvas");
  const ctx = canvas ? canvas.getContext("2d", { alpha: true }) : null;

  let mode = "standby"; // "standby" | "burst" | "calm"
  let currentTheme = "red"; // "red" | "relic"
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
    return currentTheme === "red" ? [156, 4, 18] : [172, 172, 172];
  }

  function renderStandbyFrame() {
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;
    const [ar, ag, ab] = getAccentRgb();

    for (let i = 0; i < data.length; i += 4) {
      const r = Math.random();
      if (r > 0.92) {
        const v = 135 + Math.floor(Math.random() * 50);
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 105;
      } else if (r < 0.018) {
        data[i] = ar;
        data[i + 1] = ag;
        data[i + 2] = ab;
        data[i + 3] = 140;
      } else {
        const v = 9 + Math.floor(Math.random() * 28);
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 65;
      }
    }

    ctx.putImageData(imgData, 0, 0);

    if (Math.random() > 0.78) {
      const y = Math.floor(Math.random() * height);
      const h = 1 + Math.floor(Math.random() * 2);
      ctx.fillStyle =
        Math.random() > 0.65
          ? `rgba(${ar}, ${ag}, ${ab}, 0.36)`
          : "rgba(172, 172, 172, 0.24)";
      ctx.fillRect(0, y, width, h);
    }
  }

  function renderBurstFrame() {
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;
    const [ar, ag, ab] = getAccentRgb();

    for (let i = 0; i < data.length; i += 4) {
      const roll = Math.random();
      if (roll > 0.93) {
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
        const v = 9 + Math.floor(Math.random() * 44);
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);

    const tearCount = 4 + Math.floor(Math.random() * 6);
    for (let t = 0; t < tearCount; t++) {
      const y = Math.floor(Math.random() * height);
      const h = 2 + Math.floor(Math.random() * 10);
      const xOffset = Math.floor((Math.random() - 0.5) * 40);

      if (Math.random() > 0.45) {
        ctx.fillStyle = `rgba(${ar}, ${ag}, ${ab}, 0.52)`;
      } else if (Math.random() > 0.5) {
        ctx.fillStyle = "rgba(172, 172, 172, 0.58)";
      } else {
        ctx.fillStyle = "rgba(9, 9, 9, 0.85)";
      }
      ctx.fillRect(xOffset, y, width, h);
    }
  }

  function renderCalmFrame() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgba(172, 172, 172, 0.18)";
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
    setTheme(nextTheme) {
      currentTheme = nextTheme === "relic" ? "relic" : "red";
    },
  };

  /* =======================================================
     WEB AUDIO API: ÂM THANH TIVI + RADIO ANALOG 3 KÊNH
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
     BỘ PHÁT RADIO ANALOG SWEZAN 1994 (3 KÊNH)
     ======================================================= */
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
    if (radioNoteTimer) {
      clearInterval(radioNoteTimer);
      radioNoteTimer = null;
    }
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

    // Lớp nền tiếng rè đĩa than / nhiễu sóng nhẹ
    const noiseBuffer = createNoiseBuffer(ctxAudio, 2.0);
    radioNoiseSrc = ctxAudio.createBufferSource();
    radioNoiseSrc.buffer = noiseBuffer;
    radioNoiseSrc.loop = true;

    const filter = ctxAudio.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(radioStation === "static" ? 900 : 1800, ctxAudio.currentTime);
    filter.Q.setValueAtTime(radioStation === "static" ? 0.6 : 1.4, ctxAudio.currentTime);

    const noiseGain = ctxAudio.createGain();
    noiseGain.gain.setValueAtTime(radioStation === "static" ? 0.24 : 0.045, ctxAudio.currentTime);

    radioNoiseSrc.connect(filter).connect(noiseGain).connect(radioMasterGain);
    radioNoiseSrc.start();

    noteStep = 0;

    if (radioStation === "cassius") {
      // 94.1 FM: Giai điệu piano vinyl u sầu
      playSoftTone(ctxAudio, CHOPIN_NOTES[0], 1.4, "triangle", 0.22);
      radioNoteTimer = setInterval(() => {
        noteStep = (noteStep + 1) % CHOPIN_NOTES.length;
        playSoftTone(ctxAudio, CHOPIN_NOTES[noteStep], 1.35, "triangle", 0.2);
      }, 950);
    } else if (radioStation === "swan") {
      // 102.8 FM: Hợp âm Jazz khuya Thiên Nga Đen
      const triggerChord = () => {
        const chord = SWAN_CHORDS[noteStep % SWAN_CHORDS.length];
        chord.forEach((f) => playSoftTone(ctxAudio, f, 2.2, "sine", 0.09));
        noteStep++;
      };
      triggerChord();
      radioNoteTimer = setInterval(triggerChord, 2100);
    } else {
      // CH-08: Tín hiệu 50Hz trầm rền
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
    isPlaying() {
      return radioPlaying;
    },
    getStation() {
      return radioStation;
    },
    setStation(st) {
      radioStation = st || "cassius";
      if (radioPlaying) startRadioStation();
    },
    setVolume(val) {
      radioVolume = Math.max(0, Math.min(1, Number(val) / 100));
      if (radioMasterGain && audioCtx) {
        radioMasterGain.gain.setValueAtTime(radioVolume * 0.45, audioCtx.currentTime);
      }
    },
    togglePlay() {
      radioPlaying = !radioPlaying;
      if (radioPlaying) {
        startRadioStation();
      } else {
        stopRadioNodes();
      }
      return radioPlaying;
    },
  };
})();