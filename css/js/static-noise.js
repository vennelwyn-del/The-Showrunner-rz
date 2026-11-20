/* =========================================================
   THE SHOWRUNNER — CANVAS HẠT NHIỄU ANALOG & ÂM THANH CRT 1994
   ========================================================= */

(function () {
  const canvas = document.getElementById("analog-noise-canvas");
  const ctx = canvas ? canvas.getContext("2d", { alpha: true }) : null;

  let mode = "standby"; // "standby" | "burst" | "calm"
  let width = 0;
  let height = 0;
  let frameCount = 0;

  // Độ phân giải hạt nhiễu (chia 3 để tạo hạt to chuẩn tivi CRT 1994 & chạy mượt 60fps)
  const PIXEL_SCALE = 3;

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

    for (let i = 0; i < data.length; i += 4) {
      const r = Math.random();
      if (r > 0.92) {
        // Hạt bạc sáng (#acacac)
        const v = 135 + Math.floor(Math.random() * 50);
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 110;
      } else if (r < 0.015) {
        // Đốm nhiễu đỏ máu (#9C0412)
        data[i] = 156;
        data[i + 1] = 4;
        data[i + 2] = 18;
        data[i + 3] = 130;
      } else {
        // Nền tối xám đá (#090909 - #353535)
        const v = 9 + Math.floor(Math.random() * 28);
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 65;
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Thỉnh thoảng vẽ 1-2 vệt xước sọc từ ngang ngẫu nhiên
    if (Math.random() > 0.78) {
      const y = Math.floor(Math.random() * height);
      const h = 1 + Math.floor(Math.random() * 2);
      ctx.fillStyle =
        Math.random() > 0.72
          ? "rgba(156, 4, 18, 0.35)"
          : "rgba(172, 172, 172, 0.25)";
      ctx.fillRect(0, y, width, h);
    }
  }

  function renderBurstFrame() {
    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    // Bão hạt nhiễu tuyết (TV Snow) độ tương phản cực cao
    for (let i = 0; i < data.length; i += 4) {
      const roll = Math.random();
      if (roll > 0.94) {
        // Bệt nhiễu đỏ tín hiệu (#9C0412)
        data[i] = 156;
        data[i + 1] = 4;
        data[i + 2] = 18;
        data[i + 3] = 255;
      } else if (roll > 0.48) {
        // Tuyết trắng/bạc phai (#acacac)
        const v = 120 + Math.floor(Math.random() * 115);
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 245;
      } else {
        // Tuyết đen tuyền (#090909 - #353535)
        const v = 9 + Math.floor(Math.random() * 44);
        data[i] = v;
        data[i + 1] = v;
        data[i + 2] = v;
        data[i + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Các dải xé hình ngang (Analog Horizontal Tracking Tear)
    const tearCount = 4 + Math.floor(Math.random() * 6);
    for (let t = 0; t < tearCount; t++) {
      const y = Math.floor(Math.random() * height);
      const h = 2 + Math.floor(Math.random() * 10);
      const xOffset = Math.floor((Math.random() - 0.5) * 40);

      if (Math.random() > 0.45) {
        ctx.fillStyle = "rgba(156, 4, 18, 0.52)";
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
        // Standby giữ nhịp ~24fps kiểu băng từ cũ
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
     BỘ TỔNG HỢP ÂM THANH ANALOG WEB AUDIO API (KHÔNG CẦN FILE MP3)
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

        // 1. Tiếng "CẠCH" cơ học của công tắc nguồn Tivi
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

        // 2. Tiếng rít cao áp bóng đèn hình CRT lúc bật nguồn
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

        // 3. Tiếng rè nhiễu sóng trắng (White Noise 50Hz)
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
      } catch (err) {
        // Bỏ qua an toàn nếu trình duyệt chặn audio
      }
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
      } catch (err) {
        // Safe fallback
      }
    },
  };
})();