/* =========================================================
   THE SHOWRUNNER — MÔ PHỎNG VIDEO TỐI & BÓNG NGƯỜI ĐỎ (CHUẨN CROQUIS 2D)
   Vẽ giải phẫu tỷ lệ người thật + mảng sáng tối (Chiaroscuro) bằng Canvas 2D
   ========================================================= */

(function () {
  let activeRaf = null;

  function destroy() {
    if (activeRaf) {
      cancelAnimationFrame(activeRaf);
      activeRaf = null;
    }
  }

  /* -------------------------------------------------------
     HÀM VẼ NỀN TỐI, HẠT NHIỄU VHS & SỌC TRACKING TRÊN CANVAS
     ------------------------------------------------------- */
  function drawDarkBackdrop(ctx, w, h, t, lightX, lightY) {
    ctx.fillStyle = "#040102";
    ctx.fillRect(0, 0, w, h);

    // Vầng sáng đỏ hắt từ nguồn sáng lên nền tối
    const bgGlow = ctx.createRadialGradient(lightX, lightY, 12, w * 0.5, h * 0.48, w * 0.62);
    bgGlow.addColorStop(0, "rgba(180, 12, 26, 0.28)");
    bgGlow.addColorStop(0.45, "rgba(88, 4, 12, 0.14)");
    bgGlow.addColorStop(1, "rgba(4, 1, 2, 0)");
    ctx.fillStyle = bgGlow;
    ctx.fillRect(0, 0, w, h);
  }

  function drawVhsPostFx(ctx, w, h, t) {
    // Sọc quét ngang CRT mảnh
    ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, w, 1.4);
    }

    // Dải nhiễu tracking trượt dọc
    const tearY = ((t * 1.15) % 1.2) * h - 30;
    const tearGrad = ctx.createLinearGradient(0, tearY, 0, tearY + 42);
    tearGrad.addColorStop(0, "rgba(255, 40, 58, 0)");
    tearGrad.addColorStop(0.5, "rgba(255, 45, 65, 0.16)");
    tearGrad.addColorStop(1, "rgba(255, 40, 58, 0)");
    ctx.fillStyle = tearGrad;
    ctx.fillRect(0, tearY, w, 42);

    // Chớp nhiễu ngắn ở giữa đoạn (~2.1s)
    if (t > 0.54 && t < 0.60) {
      ctx.fillStyle = "rgba(220, 18, 36, 0.18)";
      ctx.fillRect(0, Math.random() * h * 0.7, w, 26);
    }

    // Hạt film grain đỏ/tối li ti
    for (let i = 0; i < 160; i++) {
      const gx = Math.random() * w;
      const gy = Math.random() * h;
      ctx.fillStyle = Math.random() > 0.65 ? "rgba(255, 70, 88, 0.14)" : "rgba(255, 220, 220, 0.06)";
      ctx.fillRect(gx, gy, 1.5, 1.5);
    }
  }

  /* -------------------------------------------------------
     1. TẬP 2: MODEL NỮ NGHIÊNG 3/4 TRONG BUỒNG KÍNH TRỨNG + MẢNG SÁNG TỐI
     ------------------------------------------------------- */
  function drawFemaleCroquis(ctx, w, h, t) {
    const breath = Math.sin(t * 8.5) * 2.2;
    const swayX = Math.sin(t * 2.6) * 4;
    const pushScale = 0.96 + t * 0.07;

    // Nguồn sáng đỏ phía trên bên phải quét nhẹ để lộ góc sáng tối cơ thể
    const lightX = w * 0.68 - Math.sin(t * Math.PI) * 55;
    const lightY = h * 0.16 + Math.cos(t * 3) * 16;
    drawDarkBackdrop(ctx, w, h, t, lightX, lightY);

    ctx.save();
    ctx.translate(w * 0.5 + swayX, h * 0.98);
    ctx.scale(pushScale, pushScale);
    ctx.translate(-w * 0.5, -h * 0.98);

    // Viền buồng kính quả trứng mờ phía sau
    ctx.save();
    ctx.strokeStyle = "rgba(255, 58, 76, 0.22)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(320, 245, 168, 212, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Hàm tạo Path hình dáng giải phẫu nữ nghiêng 3/4 (Đầu, cổ, vai, eo, hông)
    function traceTorsoAndHead() {
      ctx.beginPath();
      // Đỉnh đầu -> trán -> sống mũi -> môi -> cằm -> cổ trước (nghiêng phải 3/4)
      ctx.moveTo(304, 70 + breath * 0.5);
      ctx.bezierCurveTo(334, 66 + breath * 0.5, 352, 86, 353, 108); // Trán & thái dương
      ctx.lineTo(360, 121); // Sống mũi
      ctx.lineTo(354, 125); // Nhân trung
      ctx.bezierCurveTo(357, 130, 355, 135, 352, 138); // Môi
      ctx.bezierCurveTo(354, 145, 349, 151, 338, 152); // Cằm & hàm dưới
      ctx.bezierCurveTo(333, 162, 332, 174, 338, 184); // Cổ trước vào hõm cổ
      // Vai phải xuôi tự nhiên -> bắp tay xuôi xuống -> khuỷu -> eo -> hông
      ctx.bezierCurveTo(362, 186, 378, 198, 382, 218); // Đường vai & cơ delta phải
      ctx.bezierCurveTo(384, 240, 374, 266, 366, 286); // Sườn phải (ngực -> eo)
      ctx.bezierCurveTo(358, 304, 354, 316, 358, 334); // Thắt eo phải
      ctx.bezierCurveTo(368, 362, 382, 392, 388, 480); // Hông & tà váy xuống đáy
      ctx.lineTo(246, 480);
      // Hông trái -> thắt eo trái -> lồng ngực trái -> vai trái -> gáy & tóc
      ctx.bezierCurveTo(254, 392, 268, 360, 276, 334); // Hông trái lên eo
      ctx.bezierCurveTo(280, 314, 276, 300, 268, 280); // Eo lên sườn trái
      ctx.bezierCurveTo(260, 254, 252, 226, 256, 206); // Lưng/vai trái
      ctx.bezierCurveTo(260, 190, 276, 182, 294, 180); // Cầu vai trái lên gáy
      ctx.bezierCurveTo(298, 166, 296, 152, 290, 144); // Gáy
      ctx.bezierCurveTo(276, 128, 278, 76, 304, 70 + breath * 0.5); // Sọ sau lên đỉnh đầu
      ctx.closePath();
    }

    // Lớp tóc ướt rũ nhẹ sau gáy (tách sắc độ tối hơn thân)
    ctx.save();
    ctx.fillStyle = "#320207";
    ctx.beginPath();
    ctx.moveTo(294, 76);
    ctx.bezierCurveTo(266, 94, 256, 142, 248, 188);
    ctx.bezierCurveTo(262, 184, 282, 178, 298, 176);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Tô thân & đầu bằng hệ ánh sáng 3 sắc độ Chiaroscuro
    ctx.save();
    traceTorsoAndHead();
    ctx.shadowColor = "rgba(255, 24, 48, 0.55)";
    ctx.shadowBlur = 18;
    ctx.fillStyle = "#160104"; // Bóng tối lõi (Core Shadow)
    ctx.fill();
    ctx.clip();

    // Mảng sáng khối (Lighting Plane) hướng từ lightX, lightY
    const bodyLight = ctx.createRadialGradient(lightX, lightY + 40, 14, 338, 235, 250);
    bodyLight.addColorStop(0, "#ff2a3f");
    bodyLight.addColorStop(0.28, "#b00818");
    bodyLight.addColorStop(0.65, "#420309");
    bodyLight.addColorStop(1, "rgba(18, 1, 4, 0)");
    ctx.fillStyle = bodyLight;
    ctx.fillRect(220, 60, 200, 430);

    // Đường sáng mảnh bắt trên xương quai xanh, gò má & ngực (Artist Light Planes)
    ctx.strokeStyle = "rgba(255, 110, 125, 0.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Xương quai xanh
    ctx.moveTo(312, 198);
    ctx.quadraticCurveTo(338, 200, 366, 196);
    // Khối xương ức / ngực
    ctx.moveTo(344, 224);
    ctx.quadraticCurveTo(364, 248, 354, 272);
    ctx.stroke();

    // Mảng tối hốc cổ & rãnh eo tạo chiều sâu
    ctx.fillStyle = "rgba(8, 0, 2, 0.65)";
    ctx.beginPath();
    ctx.ellipse(314, 176, 14, 20, 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Đường Rim Light viền sáng mặt phải (nơi ánh sáng chạm viền cơ thể)
    ctx.save();
    traceTorsoAndHead();
    ctx.strokeStyle = "rgba(255, 68, 86, 0.72)";
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.restore();

    // VẼ 2 CÁNH TAY GẬP TỰ NHIÊN TỪ VAI -> KHUỶU -> CẲNG TAY VƯƠN LÊN ÁP KÍNH
    const slideY = Math.sin(t * Math.PI) * -10 + Math.max(0, (t - 0.5) * 26);

    function drawNaturalArm(shX, shY, elbX, elbY, wriX, wriY, flip) {
      ctx.save();
      ctx.beginPath();
      // Khớp vai -> bắp tay ngoài -> khuỷu tay -> cẳng tay ngoài -> cổ tay -> bàn tay
      ctx.moveTo(shX, shY);
      ctx.quadraticCurveTo(shX + flip * 10, (shY + elbY) * 0.5, elbX, elbY);
      ctx.quadraticCurveTo(elbX + flip * 6, (elbY + wriY) * 0.55, wriX, wriY);
      // Bàn tay & các ngón tay áp vào kính
      ctx.bezierCurveTo(wriX + flip * 12, wriY - 14, wriX + flip * 10, wriY - 34, wriX + flip * 2, wriY - 38);
      ctx.bezierCurveTo(wriX - flip * 8, wriY - 34, wriX - flip * 14, wriY - 16, wriX - flip * 11, wriY + 4);
      // Cẳng tay trong -> nếp gấp khuỷu -> bắp tay trong -> nách
      ctx.quadraticCurveTo(elbX - flip * 14, (elbY + wriY) * 0.52, elbX - flip * 16, elbY - 8);
      ctx.quadraticCurveTo(shX - flip * 10, (shY + elbY) * 0.45, shX - flip * 14, shY + 18);
      ctx.closePath();

      const armGrad = ctx.createLinearGradient(wriX, wriY - 36, elbX, elbY);
      armGrad.addColorStop(0, "#ff2e44");
      armGrad.addColorStop(0.42, "#9c0614");
      armGrad.addColorStop(1, "#260205");

      ctx.shadowColor = "rgba(255, 30, 52, 0.5)";
      ctx.shadowBlur = 12;
      ctx.fillStyle = armGrad;
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 95, 110, 0.65)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
    }

    // Tay trái đặt hơi cao (khuỷu hạ xuống ngang ngực, cẳng tay vươn lên kính)
    drawNaturalArm(266, 198, 224, 272, 248, 178 + slideY * 0.7, -1);
    // Tay phải ở tiền cảnh áp sát mặt kính
    drawNaturalArm(374, 200, 412, 282, 384, 186 + slideY, 1);

    ctx.restore();
    drawVhsPostFx(ctx, w, h, t);
  }

  /* -------------------------------------------------------
     2. TẬP 3A: MODEL NAM NGỒI GHẾ TREO TRÊN MẶT NƯỚC TỐI
     ------------------------------------------------------- */
  function drawMaleChairCroquis(ctx, w, h, t) {
    const swingAngle = Math.sin(t * Math.PI * 2) * 0.055;
    const lightX = w * 0.5 + Math.sin(t * Math.PI * 2) * 45;
    const lightY = 48;
    drawDarkBackdrop(ctx, w, h, t, lightX, lightY);

    // Mặt nước tối phản chiếu vệt sáng đỏ
    ctx.fillStyle = "#030102";
    ctx.fillRect(0, 392, w, 88);
    ctx.strokeStyle = "rgba(220, 24, 42, 0.34)";
    ctx.lineWidth = 1.5;
    for (let r = 0; r < 4; r++) {
      const ry = 404 + r * 14;
      const rw = 160 - r * 28 + Math.sin(t * 8 + r) * 12;
      ctx.beginPath();
      ctx.moveTo(w * 0.5 - rw, ry);
      ctx.lineTo(w * 0.5 + rw, ry);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(w * 0.5, 0);
    ctx.rotate(swingAngle);
    ctx.translate(-w * 0.5, 0);

    // Sợi xích treo từ trần
    ctx.strokeStyle = "rgba(255, 65, 82, 0.52)";
    ctx.lineWidth = 3;
    ctx.setLineDash([7, 5]);
    ctx.beginPath();
    ctx.moveTo(320, 0);
    ctx.lineTo(320, 124);
    ctx.stroke();
    ctx.setLineDash([]);

    // Khung ghế sắt phía sau
    ctx.strokeStyle = "#4d040b";
    ctx.lineWidth = 5;
    ctx.strokeRect(272, 168, 96, 118);
    ctx.fillStyle = "#360308";
    ctx.fillRect(266, 282, 108, 12);

    // Hình dáng giải phẫu nam ngồi cúi đầu, vai rộng, chân thõng xuống
    ctx.save();
    ctx.beginPath();
    // Đầu cúi nghiêng 3/4 phải
    ctx.moveTo(308, 112);
    ctx.bezierCurveTo(334, 108, 348, 126, 348, 144);
    ctx.lineTo(353, 156); // Mũi
    ctx.lineTo(347, 164); // Môi
    ctx.bezierCurveTo(348, 174, 342, 180, 330, 178); // Cằm gục
    // Vai phải rộng -> bắp tay kéo ra sau bị trói -> hông ngồi ghế -> đùi -> cẳng chân
    ctx.bezierCurveTo(366, 180, 378, 198, 376, 224);
    ctx.lineTo(366, 276);
    ctx.lineTo(360, 294);
    ctx.lineTo(364, 376); // Cẳng chân phải
    ctx.lineTo(346, 384);
    ctx.lineTo(338, 304);
    ctx.lineTo(306, 304);
    ctx.lineTo(298, 384); // Cẳng chân trái
    ctx.lineTo(280, 376);
    ctx.lineTo(284, 294);
    ctx.lineTo(274, 276);
    ctx.lineTo(264, 224);
    ctx.bezierCurveTo(262, 198, 274, 180, 304, 178);
    ctx.bezierCurveTo(292, 168, 286, 126, 308, 112);
    ctx.closePath();

    const bodyGrad = ctx.createRadialGradient(lightX, 140, 20, 320, 250, 220);
    bodyGrad.addColorStop(0, "#ff2a3e");
    bodyGrad.addColorStop(0.35, "#9e0615");
    bodyGrad.addColorStop(0.75, "#2b0206");
    bodyGrad.addColorStop(1, "#0d0103");

    ctx.shadowColor = "rgba(255, 22, 42, 0.55)";
    ctx.shadowBlur = 16;
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 82, 98, 0.68)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();

    ctx.restore();

    // Bóng bàn tay đeo găng lướt ngang tiền cảnh
    if (t > 0.25 && t < 0.85) {
      const gx = -80 + ((t - 0.25) / 0.6) * (w + 180);
      ctx.save();
      ctx.fillStyle = "#040102";
      ctx.strokeStyle = "rgba(210, 18, 36, 0.65)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(gx - 34, h);
      ctx.lineTo(gx + 10, 215);
      ctx.quadraticCurveTo(gx + 34, 185, gx + 48, 222);
      ctx.lineTo(gx + 32, h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    drawVhsPostFx(ctx, w, h, t);
  }

  /* -------------------------------------------------------
     3. TẬP 1 & TẬP 4 (KÉN TREO / BÓNG KỴ SĨ CROQUIS)
     ------------------------------------------------------- */
  function drawEpisode1And4(ctx, w, h, t, tapeId) {
    drawDarkBackdrop(ctx, w, h, t, w * 0.5, h * 0.38);

    if (tapeId === "tape-1") {
      const dropY = -30 + t * 55;
      ctx.save();
      ctx.strokeStyle = "rgba(255, 65, 80, 0.5)";
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(320, 0);
      ctx.lineTo(320, 120 + dropY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Hình người quấn chặt lộ rõ vai, đầu & đầu gối
      ctx.beginPath();
      ctx.moveTo(320, 108 + dropY);
      ctx.bezierCurveTo(346, 110 + dropY, 354, 146 + dropY, 358, 178 + dropY);
      ctx.bezierCurveTo(364, 220 + dropY, 350, 290 + dropY, 336, 356 + dropY);
      ctx.bezierCurveTo(330, 382 + dropY, 310, 382 + dropY, 304, 356 + dropY);
      ctx.bezierCurveTo(290, 290 + dropY, 276, 220 + dropY, 282, 178 + dropY);
      ctx.bezierCurveTo(286, 146 + dropY, 294, 110 + dropY, 320, 108 + dropY);
      ctx.closePath();

      const g = ctx.createLinearGradient(280, 110 + dropY, 360, 360 + dropY);
      g.addColorStop(0, "#ff263b");
      g.addColorStop(0.5, "#8f0512");
      g.addColorStop(1, "#1e0204");
      ctx.shadowColor = "rgba(255, 20, 40, 0.55)";
      ctx.shadowBlur = 16;
      ctx.fillStyle = g;
      ctx.fill();
      ctx.restore();
    } else {
      // Tập 4: Bóng đứng của Kỵ Sĩ áo choàng chớp tắt trong nhiễu tối
      const visible = (t > 0.34 && t < 0.44) || (t > 0.68 && t < 0.84);
      if (visible) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(320, 102);
        ctx.bezierCurveTo(344, 102, 352, 126, 348, 152);
        ctx.lineTo(356, 176);
        ctx.bezierCurveTo(396, 186, 408, 228, 422, 480);
        ctx.lineTo(218, 480);
        ctx.bezierCurveTo(232, 228, 244, 186, 284, 176);
        ctx.lineTo(292, 152);
        ctx.bezierCurveTo(288, 126, 296, 102, 320, 102);
        ctx.closePath();

        const rg = ctx.createRadialGradient(345, 155, 16, 320, 260, 230);
        rg.addColorStop(0, "#ff283c");
        rg.addColorStop(0.45, "#8a0511");
        rg.addColorStop(1, "#140103");
        ctx.shadowColor = "rgba(255, 25, 45, 0.7)";
        ctx.shadowBlur = 22;
        ctx.fillStyle = rg;
        ctx.fill();
        ctx.restore();
      }
    }

    drawVhsPostFx(ctx, w, h, t);
  }

  /* -------------------------------------------------------
     MOUNT & CHẠY ANIMATION 3.8 GIÂY
     ------------------------------------------------------- */
  window.Tape3DSim = {
    isSupported() {
      return true;
    },
    destroy,
    mount(container, tapeId, onProgress, onComplete) {
      destroy();
      if (!container) return false;

      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 480;
      canvas.className = "tape-croquis-canvas";

      const ctx = canvas.getContext("2d");
      if (!ctx) return false;

      container.innerHTML = "";
      container.appendChild(canvas);

      const durationMs = 3800;
      const startAt = performance.now();

      function frame(now) {
        const ratio = Math.min(1, (now - startAt) / durationMs);

        if (tapeId === "tape-2") drawFemaleCroquis(ctx, 640, 480, ratio);
        else if (tapeId === "tape-3a") drawMaleChairCroquis(ctx, 640, 480, ratio);
        else drawEpisode1And4(ctx, 640, 480, ratio, tapeId);

        if (typeof onProgress === "function") onProgress(ratio);

        if (ratio < 1) {
          activeRaf = requestAnimationFrame(frame);
        } else {
          activeRaf = null;
          if (typeof onComplete === "function") onComplete();
        }
      }

      activeRaf = requestAnimationFrame(frame);
      return true;
    },
  };
})();