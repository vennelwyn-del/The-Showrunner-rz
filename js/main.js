/* =========================================================
   THE SHOWRUNNER — GIAO DIỆN 2 (ĐỌC CẤU HÌNH TỪ config.js)
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const cfg = window.SHOWRUNNER_CONFIG || {};

  /* -------------------------------------------------------
     1. ÁP DỤNG ẢNH NỀN TỪ config.js (KHÔNG HIỆN TRÊN WEB)
     ------------------------------------------------------- */
  const bgLayer = document.getElementById("main-bg-layer");
  const wireframeSvg = document.getElementById("forensic-wireframe");
  const bgCfg = cfg.background || {};

  if (bgLayer) {
    if (bgCfg.imageUrl) {
      bgLayer.style.backgroundImage = `url("${String(bgCfg.imageUrl).replace(/"/g, '\\"')}")`;
    }
    const useBw = bgCfg.bwAndWireframe !== false;
    bgLayer.classList.toggle("has-bw-filter", useBw);
    if (wireframeSvg) wireframeSvg.classList.toggle("is-hidden", !useBw);
  }

  if (typeof bgCfg.dimOpacity === "number") {
    document.documentElement.style.setProperty("--bg-dim", String(bgCfg.dimOpacity));
  }

  /* -------------------------------------------------------
     2. CHUYỂN TAB GIAO DIỆN 2
     ------------------------------------------------------- */
  const tabBtns = document.querySelectorAll(".desk-tab");
  const deskPanels = document.querySelectorAll(".desk-panel");

  function switchTab(tabKey) {
    tabBtns.forEach((b) => b.classList.toggle("is-active", b.dataset.tab === tabKey));
    deskPanels.forEach((p) => {
      const match = p.id === `tab-${tabKey}`;
      p.hidden = !match;
      p.classList.toggle("is-active", match);
    });

    if (tabKey === "tapes") {
      const activeTape = videos.find((v) => v.id === activeTapeId) || videos[0];
      if (activeTape) playTapeSimulation(activeTape);
    } else if (window.Tape3DSim) {
      window.Tape3DSim.destroy();
    }
  }

  tabBtns.forEach((btn) => btn.addEventListener("click", () => switchTab(btn.dataset.tab)));
  document.querySelectorAll("[data-open-tab]").forEach((card) => {
    card.addEventListener("click", () => switchTab(card.dataset.openTab));
  });

  /* -------------------------------------------------------
     3. THẾ GIỚI SWEZAN: TIMELINE, DIỄN BIẾN, KHU VỰC & NGUYÊN TẮC
     ------------------------------------------------------- */
  const WORLD_TIMELINE = [
    {
      time: "~14 NGÀY TRƯỚC · SỰ KIỆN ĐẦU TIÊN",
      title: "Ottomar Burchard (45t) tử vong tại khu chất thải công nghiệp",
      desc: "Chủ tiệm ăn nhỏ tên Lutz mất tích lúc 02:00 sáng khi đi đổ rác và được phát hiện tử vong sau 7 ngày trong bể hóa chất. Cảnh sát từng tìm cách dìm vụ việc, coi là thanh trừng ngầm ngoài xã hội.",
      now: false,
    },
    {
      time: "00:00 ĐÊM CHỦ NHẬT TUẦN TRƯỚC · CÚ SỐC TRUYỀN HÌNH",
      title: "Vụ cướp sóng đài K-TV Kênh 8 & Cái chết của Malia Ariane (24t)",
      desc: "Ái nữ của Nam tước đá quý bị chặn xe giữa sương mù trên Đại lộ Duyên Biên. Đúng nửa đêm Chủ nhật, kẻ tự xưng The Rider chiếm sóng Kênh 8, phát thẳng đoạn băng ghi lại cảnh cô bị giam trong buồng kính hơi nước trước hàng vạn màn hình tivi.",
      now: false,
    },
    {
      time: "12:00 TRƯA CHỦ NHẬT HÔM QUA · MẤT TÍCH",
      title: "Phó Cảnh Sát Trưởng Matthäus August (52t) biến mất bên hồ",
      desc: "Cánh tay phải của Cảnh sát trưởng Heckler mất tích trong lúc câu cá tại hồ nước đen sau tư dinh ven rừng. Hiện trường chỉ còn lại chiếc cần câu carbon gãy đôi, đôi dép lê và tẩu thuốc rơi vãi.",
      now: false,
    },
    {
      time: "06:00 SÁNG NAY (30/11/1994) · BĂNG TỪ TRONG BỤNG CÁ",
      title: "Thu giữ Băng A (Tập 3/4) & Lời đếm ngược 7 ngày",
      desc: "Từ bụng một con cá chép đột biến dạt bờ hồ, cảnh sát tìm thấy cuộn băng VHS-C bọc kín. Giọng nói biến âm thông báo phiên tòa kéo dài đúng 7 ngày, hạn chót vào 23:59 đêm Chủ Nhật tới.",
      now: false,
    },
    {
      time: "06:15 SÁNG THỨ HAI (HIỆN TẠI) · KHỞI ĐIỂM CUỘC CHƠI",
      title: "Swezan bước vào tuần lễ sinh tử (-3°C · Mưa phùn tro than)",
      desc: "Mọi cầu nối vào phố cổ Altstadt bị dựng rào phong tỏa. Mức độ hoảng loạn thị trấn chạm mốc 75% giữa làn sóng đình công ở bến cảng và nỗi sợ hãi màn ảnh nhỏ.",
      now: true,
    },
  ];

  const WORLD_LIVE_STATE = [
    {
      tag: "📻 RADIO & TRUYỀN HÌNH ĐANG PHÁT GÌ?",
      title: "Sóng Ngắn Căng Thẳng · K-TV Tạm Ngừng",
      body: "Đài Swan Terof Kênh 8 đã tạm ngưng phát sóng ban đêm sau sự cố nhiễu 50Hz. Trên các băng tần Radio địa phương, Tòa thị chính liên tục phát thông báo giới nghiêm, lệnh kiểm soát các cây cầu vào Altstadt và cảnh báo người dân nộp lại mọi cuộn băng lạ.",
    },
    {
      tag: "👁️ NGƯỜI DÂN ĐANG NHƯ THẾ NÀO?",
      title: "Hội Chứng Sợ Màn Hình CRT (Hoảng Loạn 75%)",
      body: "Nhiều hộ dân dùng chăn dạ hoặc báo cũ trùm kín tivi vào ban đêm, trẻ em bật khóc khi thấy đèn LED đầu máy VCR. Tại Bến cảng và Khối 7, công nhân đốt lửa trong thùng phuy bãi công; còn giới thượng lưu trên Đồi Kranzhügel đóng chặt cổng thuê vệ sĩ gác đêm.",
    },
    {
      tag: "⚖️ ĐỒN CẢNH SÁT & TÒA THỊ CHÍNH",
      title: "Bộ Máy Công Quyền Hỗn Loạn",
      body: "Cảnh sát trưởng Heckler giam mình trong phòng cùng mùi rượu gin và thuốc lá Chesterfield trước nguy cơ bị Tòa thị chính cách chức. Tuần tra địa phương tăng cường vây ráp ngoài phố, trong khi Công tố viên Julian von Brandt trực tiếp siết chặt giám sát hồ sơ.",
    },
  ];

  const WORLD_PRINCIPLES = [
    {
      tag: "NGUYÊN TẮC 01 · TỰ DO & KHÔNG LỐI MÒN",
      title: "Thế Giới Độc Lập — Không “Plot Armor”",
      body: "Swezan không phải sân khấu xoay quanh riêng bạn. Bạn có quyền bỏ qua vụ án để uống rượu ở phòng trà, lặn ngụp dưới chợ đen hay lục kho lưu trữ — nhưng đồng hồ thị trấn vẫn chạy và không ai cứu bạn nếu bạn tự bước vào cạm bẫy.",
    },
    {
      tag: "NGUYÊN TẮC 02 · ĐỒNG HỒ 2 TẦNG",
      title: "Hạn Chót 7 Ngày & Giới Hạn Sinh Học",
      body: "Mỗi hành động đều tiêu tốn thời gian thực: khám nghiệm (+4 giờ), thẩm vấn (+2–3 giờ), di chuyển giữa các khu (+30–60 phút). Thức quá 24–30 giờ liên tục sẽ gây run tay và ảo giác. Đến 23:59 Chủ Nhật, kết cục sẽ tự động chốt.",
    },
    {
      tag: "NGUYÊN TẮC 03 · TỰ SUY LUẬN",
      title: "Dữ Kiện Thô & Ranh Giới Tri Thức",
      body: "Không có lời nhắc bài sẵn. Các nhân vật chỉ biết trong phạm vi nghề nghiệp của họ, giữ định kiến giai cấp riêng và sẵn sàng nói dối để che giấu việc làm ăn bất chính. Kết nối manh mối hoàn toàn nằm ở bạn.",
    },
    {
      tag: "NGUYÊN TẮC 04 · CÁI GIÁ CỦA SAI LẦM",
      title: "Bắt Oan & Thương Tật Vĩnh Viễn",
      body: "Bắt nhầm nghi phạm khi thiếu bằng chứng vật lý sẽ khiến dư luận bùng nổ (+15% hoảng loạn), châm ngòi bạo loạn hoặc bị tước quyền điều tra. Xông vào khu vực nguy hiểm thiếu chuẩn bị sẽ để lại thương tật vĩnh viễn.",
    },
  ];

  const WORLD_ECONOMY = [
    "<strong>Đơn vị tiền tệ:</strong> Mark Swezan (M)",
    "<strong>Thu nhập công nhân:</strong> 800 – 1.200 M/tháng",
    "<strong>Bao thuốc lá:</strong> 4 – 6 M",
    "<strong>Cà phê / Ly rượu:</strong> 8 – 20 M",
    "<strong>Mua tin vỉa hè:</strong> 50 – 100 M",
    "<strong>Trang bị chợ đen / Mặt nạ:</strong> 150 – 300 M",
    "<strong>Súng lậu không số hiệu:</strong> 800 – 1.500 M",
  ];

  const WORLD_ROLES = [
    {
      tag: "THÂN PHẬN 01 · 1.200 MARK",
      title: "Thanh Tra Cấp Cao / Đặc Phái Viên",
      body: "Mang lệnh trưng dụng từ thủ đô và súng công vụ. Có quyền vào hiện trường phong tỏa và triệu tập người, nhưng bị cảnh sát địa phương dè chừng và công nhân thù địch.",
    },
    {
      tag: "THÂN PHẬN 02 · 300 MARK",
      title: "Thám Tử Tư / Cựu Sĩ Quan",
      body: "Không có quyền lực pháp lý, nhưng hoàn toàn tự do lặn ngụp dưới bến cảng đêm, giao dịch chợ đen và lần theo những ngõ tối ngoài giờ giới nghiêm.",
    },
    {
      tag: "THÂN PHẬN 03 · 1.500 MARK",
      title: "Bác Sĩ Pháp Y Độc Lập",
      body: "Làm chủ phòng giải phẫu dưới hầm Tòa án Cũ. Tiếng nói khoa học mang tính quyết định trước tòa, nhưng thiếu quyền cưỡng chế và dễ gặp áp lực bưng bít.",
    },
    {
      tag: "THÂN PHẬN 04 · 600 MARK",
      title: "Phóng Viên Điều Tra",
      body: "Sở hữu thẻ nhà báo, máy ảnh 35mm và mạng lưới tin đồn khắp thung lũng. Ngòi bút có thể xoay chuyển dư luận nhưng dễ bị cả cảnh sát lẫn tội phạm nhắm tới.",
    },
    {
      tag: "THÂN PHẬN 05 · 60 MARK",
      title: "Dân Thường / Thợ Thuyền Bản Địa",
      body: "Sở hữu lớp vỏ bọc vô hình để hòa vào dòng người biểu tình và khu chung cư lao động, dùng trực giác và quan hệ xóm giềng để sinh tồn (dù dễ bị bắt oan).",
    },
  ];

  const worldTimelineEl = document.getElementById("world-timeline");
  const worldLiveGrid = document.getElementById("world-live-grid");
  const worldRulesGrid = document.getElementById("world-rules-grid");
  const worldEconomyStrip = document.getElementById("world-economy-strip");
  const worldRolesGrid = document.getElementById("world-roles-grid");
  const worldDistrictsGrid = document.getElementById("world-districts-grid");

  if (worldTimelineEl) {
    worldTimelineEl.innerHTML = WORLD_TIMELINE.map(
      (item) => `
      <article class="timeline-item ${item.now ? "is-now" : ""}">
        <div class="timeline-time">${item.time}</div>
        <h4 class="timeline-title">${item.title}</h4>
        <p class="timeline-desc">${item.desc}</p>
      </article>`
    ).join("");
  }

  if (worldLiveGrid) {
    worldLiveGrid.innerHTML = WORLD_LIVE_STATE.map(
      (s) => `<article class="dossier-card"><div class="card-badge-row"><span>${s.tag}</span></div><h3 class="card-h3">${s.title}</h3><p class="card-body">${s.body}</p></article>`
    ).join("");
  }

  if (worldRulesGrid) {
    worldRulesGrid.innerHTML = WORLD_PRINCIPLES.map(
      (p) => `<article class="dossier-card"><div class="card-badge-row"><span>${p.tag}</span></div><h3 class="card-h3">${p.title}</h3><p class="card-body">${p.body}</p></article>`
    ).join("");
  }

  if (worldEconomyStrip) {
    worldEconomyStrip.innerHTML = WORLD_ECONOMY.map((item) => `<span>${item}</span>`).join("");
  }

  if (worldRolesGrid) {
    worldRolesGrid.innerHTML = WORLD_ROLES.map(
      (r) => `<article class="dossier-card"><div class="card-badge-row"><span>${r.tag}</span></div><h3 class="card-h3">${r.title}</h3><p class="card-body">${r.body}</p></article>`
    ).join("");
  }

  const locations = Array.isArray(cfg.locations) ? cfg.locations : [];
  if (worldDistrictsGrid) {
    worldDistrictsGrid.innerHTML = locations
      .map((loc) => {
        const photoHtml = loc.imageUrl
          ? `<img class="location-photo-img" src="${escapeHtml(loc.imageUrl)}" alt="${escapeHtml(loc.title)}" />`
          : `<div class="location-photo-empty">
               <span>CAM // ARCHIVE PHOTO</span>
               <strong>${escapeHtml(loc.title)}</strong>
             </div>`;
        return `
        <article class="location-card">
          <div class="location-photo-box">${photoHtml}</div>
          <div class="location-body">
            <div class="card-badge-row"><span>${escapeHtml(loc.zone)}</span></div>
            <h3 class="card-h3">${escapeHtml(loc.title)}</h3>
            <p class="card-body">${escapeHtml(loc.desc)}</p>
          </div>
        </article>`;
      })
      .join("");
  }

  /* -------------------------------------------------------
     4. TAB 3: CÁC BĂNG VIDEO ĐÃ ĐƯỢC CÔNG BỐ (MÔ PHỎNG BÓNG MỜ 3.8s)
     ------------------------------------------------------- */
  const videos = Array.isArray(cfg.videos) ? cfg.videos : [];
  const tapesListGrid = document.getElementById("tapes-list-grid");
  const tapeCrtMedia = document.getElementById("tape-crt-media");
  const tapeCrtCode = document.getElementById("tape-crt-code");
  const tapeCrtDate = document.getElementById("tape-crt-date");
  const tapeCrtTimer = document.getElementById("tape-crt-timer");
  const tapeSimProgress = document.getElementById("tape-sim-progress");
  const tapeReplayBtn = document.getElementById("tape-replay-btn");
  const tapeCrtStatus = document.getElementById("tape-crt-status");
  const tapeCrtTitle = document.getElementById("tape-crt-title");
  const tapeCrtSummary = document.getElementById("tape-crt-summary");
  const tapeCrtQuote = document.getElementById("tape-crt-quote");

  let activeTapeId = videos[0] ? videos[0].id : "";
  let simRafId = null;

  function buildTapeSilhouetteSvg(tapeId) {
    if (tapeId === "tape-2") {
      // Tập 2: Bóng người trong buồng kính hơi nước & nhánh hoa loa kèn mờ
      return `
      <svg class="sim-scene-svg" viewBox="0 0 320 240" aria-hidden="true">
        <defs>
          <radialGradient id="fogGlow2" cx="50%" cy="46%" r="55%">
            <stop offset="0%" stop-color="rgba(220,210,210,0.34)" />
            <stop offset="70%" stop-color="rgba(80,12,18,0.45)" />
            <stop offset="100%" stop-color="rgba(8,6,7,0.96)" />
          </radialGradient>
        </defs>
        <rect width="320" height="240" fill="url(#fogGlow2)" />
        <ellipse cx="160" cy="128" rx="84" ry="96" fill="none" stroke="rgba(235,220,220,0.3)" stroke-width="3" />
        <g class="sim-hand-press">
          <circle cx="158" cy="86" r="21" fill="rgba(8,6,7,0.9)" />
          <path d="M114,195 C118,142 135,116 158,116 C182,116 198,142 204,195 Z" fill="rgba(8,6,7,0.92)" />
          <path d="M188,136 L214,112 L222,120 L195,152 Z" fill="rgba(8,6,7,0.88)" />
        </g>
        <g class="sim-steam-rise" opacity="0.72">
          <ellipse cx="120" cy="172" rx="70" ry="34" fill="rgba(215,205,205,0.22)" />
          <ellipse cx="195" cy="158" rx="76" ry="38" fill="rgba(215,205,205,0.2)" />
          <ellipse cx="158" cy="118" rx="64" ry="28" fill="rgba(215,205,205,0.16)" />
        </g>
      </svg>`;
    }

    if (tapeId === "tape-3a") {
      // Tập 3A: Đèn treo đung đưa, bóng ghế sắt trên mặt nước tối & bóng găng tay lướt qua
      return `
      <svg class="sim-scene-svg" viewBox="0 0 320 240" aria-hidden="true">
        <rect width="320" height="240" fill="#090607" />
        <g class="sim-sway-lamp">
          <line x1="160" y1="0" x2="160" y2="34" stroke="rgba(220,200,200,0.45)" stroke-width="2" />
          <polygon points="160,34 62,215 258,215" fill="rgba(225,215,215,0.14)" />
          <circle cx="160" cy="38" r="5" fill="rgba(255,235,235,0.85)" />
        </g>
        <line x1="160" y1="0" x2="160" y2="74" stroke="rgba(180,170,170,0.35)" stroke-width="2" />
        <g>
          <circle cx="160" cy="96" r="15" fill="#060405" />
          <rect x="142" y="112" width="36" height="46" rx="6" fill="#060405" />
          <rect x="134" y="156" width="52" height="12" fill="#120d0e" />
          <line x1="142" y1="168" x2="138" y2="188" stroke="#0b0809" stroke-width="5" />
          <line x1="178" y1="168" x2="182" y2="188" stroke="#0b0809" stroke-width="5" />
        </g>
        <rect x="0" y="188" width="320" height="52" fill="rgba(14,8,10,0.92)" />
        <ellipse class="sim-water-ripple" cx="160" cy="196" rx="74" ry="8" fill="none" stroke="rgba(210,190,190,0.32)" stroke-width="1.5" />
        <g class="sim-glove-pass">
          <path d="M-20,240 L26,130 C32,118 46,122 44,136 L26,240 Z" fill="#040304" />
        </g>
      </svg>`;
    }

    if (tapeId === "tape-1") {
      // Tập 1: Bóng dây xích ròng rọc trong sương hóa chất
      return `
      <svg class="sim-scene-svg" viewBox="0 0 320 240" aria-hidden="true">
        <rect width="320" height="240" fill="#0b0708" />
        <circle cx="160" cy="95" r="78" fill="rgba(168,16,32,0.16)" />
        <line x1="160" y1="0" x2="160" y2="95" stroke="rgba(210,200,200,0.4)" stroke-width="4" stroke-dasharray="6 4" />
        <ellipse cx="160" cy="132" rx="22" ry="44" fill="#050404" />
        <g class="sim-steam-rise" opacity="0.65">
          <ellipse cx="160" cy="204" rx="130" ry="32" fill="rgba(195,185,185,0.22)" />
        </g>
        <rect x="92" y="102" width="136" height="32" fill="none" stroke="rgba(220,24,42,0.65)" stroke-width="2" transform="rotate(-6 160 118)" />
        <text x="160" y="123" text-anchor="middle" fill="rgba(240,55,70,0.85)" font-family="monospace" font-size="14" font-weight="700" transform="rotate(-6 160 118)">[SEALED FILE]</text>
      </svg>`;
    }

    // Tập 4: Nhiễu hạt chờ + chớp thoáng bóng Kỵ Sĩ
    return `
      <svg class="sim-scene-svg" viewBox="0 0 320 240" aria-hidden="true">
        <rect width="320" height="240" fill="#0d090a" />
        <g class="sim-rider-ghost">
          <circle cx="160" cy="92" r="24" fill="#040304" />
          <path d="M105,225 C112,155 132,126 160,126 C188,126 208,155 215,225 Z" fill="#040304" />
        </g>
        <text x="160" y="124" text-anchor="middle" fill="rgba(245,215,215,0.65)" font-family="monospace" font-size="13" letter-spacing="3">NO SIGNAL // 50Hz</text>
      </svg>`;
  }

     function playTapeSimulation(tape) {
    if (!tapeCrtMedia || !tape) return;
    if (simRafId) {
      cancelAnimationFrame(simRafId);
      simRafId = null;
    }
    if (window.Tape3DSim) window.Tape3DSim.destroy();
    if (tape.videoUrl) {
      tapeCrtMedia.innerHTML = `<video src="${escapeHtml(tape.videoUrl)}" ${tape.thumbnailUrl ? `poster="${escapeHtml(tape.thumbnailUrl)}"` : ""} controls autoplay playsinline></video>`;
      if (tapeCrtTimer) tapeCrtTimer.textContent = "▶ VIDEO";
      if (tapeSimProgress) tapeSimProgress.style.width = "100%";
      return;
    }
    if (window.AnalogAudio && typeof window.AnalogAudio.playTapeStaticBurst === "function") {
      window.AnalogAudio.playTapeStaticBurst(3.8);
    }
    // Tạo khung sân khấu 3D
     tapeCrtMedia.innerHTML = `
      <div id="tape-sim-stage" class="tape-sim-stage is-playing">
        <div id="tape-3d-mount" style="width:100%;height:100%;position:relative;"></div>
        <div class="sim-end-stamp">■ END OF PREVIEW // BẤM PHÁT LẠI</div>
      </div>
    `;
    const mountEl = document.getElementById("tape-3d-mount");
    const used3D =
      window.Tape3DSim &&
      window.Tape3DSim.isSupported() &&
      window.Tape3DSim.mount(
        mountEl,
        tape.id,
        (ratio) => {
          const sec = Math.min(4, Math.floor(ratio * 4));
          if (tapeSimProgress) tapeSimProgress.style.width = `${(ratio * 100).toFixed(1)}%`;
          if (tapeCrtTimer) tapeCrtTimer.textContent = ratio < 1 ? `▶ PLAY 00:0${sec}` : "■ STOP 00:04";
        },
        () => {
          const stage = document.getElementById("tape-sim-stage");
          if (stage) {
            stage.classList.remove("is-playing");
            stage.classList.add("is-ended");
          }
        }
      );

    // Dự phòng nếu máy mất mạng không tải được Three.js -> chạy SVG bóng mờ 2D
    if (!used3D) {
      mountEl.innerHTML = `
        ${buildTapeSilhouetteSvg(tape.id)}
        <div class="sim-noise-grain"></div>
        <div class="sim-tracking-band"></div>
        <div class="sim-flash-glitch"></div>
      `;
      const durationMs = 3800;
      const startAt = performance.now();
      function stepFallback(now) {
        const ratio = Math.min(1, (now - startAt) / durationMs);
        const sec = Math.min(4, Math.floor(ratio * 4));
        if (tapeSimProgress) tapeSimProgress.style.width = `${(ratio * 100).toFixed(1)}%`;
        if (tapeCrtTimer) tapeCrtTimer.textContent = ratio < 1 ? `▶ PLAY 00:0${sec}` : "■ STOP 00:04";
        if (ratio < 1) {
          simRafId = requestAnimationFrame(stepFallback);
        } else {
          const stage = document.getElementById("tape-sim-stage");
          if (stage) {
            stage.classList.remove("is-playing");
            stage.classList.add("is-ended");
          }
          simRafId = null;
        }
      }
      simRafId = requestAnimationFrame(stepFallback);
    }
  }

  function selectTape(tapeId) {
    const tape = videos.find((v) => v.id === tapeId) || videos[0];
    if (!tape) return;
    activeTapeId = tape.id;

    if (tapeCrtCode) tapeCrtCode.textContent = tape.code;
    if (tapeCrtDate) tapeCrtDate.textContent = tape.date;
    if (tapeCrtStatus) tapeCrtStatus.textContent = `${tape.status} · ${tape.duration}`;
    if (tapeCrtTitle) tapeCrtTitle.textContent = tape.title;
    if (tapeCrtSummary) tapeCrtSummary.textContent = tape.summary;
    if (tapeCrtQuote) tapeCrtQuote.textContent = tape.transcript;

    if (tapesListGrid) {
      tapesListGrid.querySelectorAll(".tape-card-btn").forEach((b) => {
        b.classList.toggle("is-active", b.dataset.tapeId === activeTapeId);
      });
    }

    playTapeSimulation(tape);
  }

  if (tapeReplayBtn) {
    tapeReplayBtn.addEventListener("click", () => {
      const tape = videos.find((v) => v.id === activeTapeId) || videos[0];
      if (tape) playTapeSimulation(tape);
    });
  }

  if (tapesListGrid && videos.length > 0) {
    tapesListGrid.innerHTML = videos
      .map(
        (v) => `
      <button class="tape-card-btn ${v.id === activeTapeId ? "is-active" : ""}" type="button" data-tape-id="${escapeHtml(v.id)}">
        <div class="tape-card-top">
          <span>${escapeHtml(v.code)}</span>
          <span>${escapeHtml(v.duration)}</span>
        </div>
        <h4>${escapeHtml(v.title)}</h4>
        <div class="tape-card-meta">${escapeHtml(v.status)} · ${escapeHtml(v.date)}</div>
      </button>`
      )
      .join("");

    tapesListGrid.addEventListener("click", (e) => {
      const btn = e.target.closest(".tape-card-btn");
      if (btn) selectTape(btn.dataset.tapeId);
    });

    selectTape(activeTapeId);
  }

  /* -------------------------------------------------------
     5. TAB 4: NHÂN VẬT (ĐỌC TỪ characters.js, KHÔNG CÓ NÚT SỬA)
     ------------------------------------------------------- */
  const characters = Array.isArray(window.SHOWRUNNER_CHARACTERS) ? window.SHOWRUNNER_CHARACTERS : [];
  let castFilter = "all";
  const castGrid = document.getElementById("cast-grid");
  const castFilterBtns = document.querySelectorAll("[data-cast-filter]");

  function renderCast() {
    if (!castGrid) return;
    const list =
      castFilter === "all" ? characters : characters.filter((c) => c.group === castFilter);

    castGrid.innerHTML = list
      .map((c, i) => {
        const tilt = ((i % 5) - 2) * 1.1;
        const isClassified = Boolean(c.classified);
        const photoHtml = c.imageUrl
          ? `<img class="char-photo-img" src="${escapeHtml(c.imageUrl)}" alt="${escapeHtml(c.name)}" />`
          : `<div class="char-photo-placeholder">
               <span class="q-mark">?</span>
               <span class="q-hint">${isClassified ? "CLASSIFIED" : "SWEZAN 1994"}</span>
             </div>`;

        return `
        <article class="char-polaroid-card ${isClassified ? "is-classified" : ""}" style="--card-tilt: ${tilt}deg">
          <span class="pushpin" aria-hidden="true"></span>
          <div class="char-card-head">
            <span>${escapeHtml(c.code)}</span>
            <span class="char-stamp">${isClassified ? "REDACTED" : escapeHtml(c.stamp)}</span>
          </div>

          <div class="char-photo-box">
            ${photoHtml}
            <span class="char-cam-tag">CAM // ● REC</span>
          </div>

          <h3 class="char-name">${isClassified ? "[HỒ SƠ BỊ NIÊM PHONG]" : escapeHtml(c.name)}</h3>
          <div class="char-role">${escapeHtml(c.role)}</div>
          <p class="char-desc">${escapeHtml(c.desc)}</p>
          <p class="char-quote">${escapeHtml(c.quote)}</p>
        </article>`;
      })
      .join("");
  }

  castFilterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      castFilter = btn.dataset.castFilter;
      castFilterBtns.forEach((b) => b.classList.toggle("is-active", b === btn));
      renderCast();
    });
  });

  renderCast();

  /* -------------------------------------------------------
     6. TAB 5: TẠO HỒ SƠ NHẬP VAI & COPY
     ------------------------------------------------------- */
  const pfFields = [
    "pf-name",
    "pf-age-gender",
    "pf-archetype",
    "pf-district",
    "pf-look",
    "pf-gear",
    "pf-secret",
    "pf-quote",
  ].map((id) => document.getElementById(id));

  const profileOutput = document.getElementById("profile-output");
  const copyProfileBtn = document.getElementById("copy-profile-btn");
  const copyFeedback = document.getElementById("copy-feedback");

  function buildProfileText() {
    const val = (id, fallback) => {
      const el = document.getElementById(id);
      return el && el.value.trim() ? el.value.trim() : fallback;
    };

    const text = `║ HỒ SƠ NHẬP TỊCH SWEZAN (1994) ║

**Họ và tên:** ${val("pf-name", "[Chưa điền tên]")}
**Tuổi & Giới tính / Xưng hô:** ${val("pf-age-gender", "28 tuổi | Nam (Anh / Tôi)")}
**Thân phận khởi điểm:** ${val("pf-archetype", "Thanh Tra Cấp Cao (1.200 M)")}
**Địa bàn cư trú & Kỷ vật:** ${val("pf-district", "Phố cổ Altstadt | Chiếc bật lửa bạc")}
**Ngoại hình & Mùi hương (1994 Noir):** ${val("pf-look", "Áo măng tô dạ tối màu, mùi cà phê đen và khói than Swezan.")}
**Trang bị mang theo:** ${val("pf-gear", "Đèn pin kim loại, sổ tay da, bộ dụng cụ chuyên môn.")}
**Động cơ & Mục tiêu tại Swezan:** ${val("pf-secret", "Tìm hiểu sự thật sau những cuộn băng cướp sóng trên K-TV Kênh 8.")}
**Câu thoại mẫu:**
> ${val("pf-quote", "“Mọi cuộn băng đều có điểm dừng, chỉ có sự thật là ở lại.”")}`;

    if (profileOutput) profileOutput.textContent = text;
    return text;
  }

  pfFields.forEach((el) => {
    if (el) el.addEventListener("input", buildProfileText);
  });
  buildProfileText();

  if (copyProfileBtn) {
    copyProfileBtn.addEventListener("click", () => {
      const text = buildProfileText();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          if (copyFeedback) copyFeedback.textContent = "ĐÃ COPY!";
          setTimeout(() => {
            if (copyFeedback) copyFeedback.textContent = "";
          }, 2200);
        });
      }
    });
  }

  /* -------------------------------------------------------
     7. TAB 6 & FOOTER: DỪNG BĂNG & MÀN HÌNH HẠ MÀN (THE END)
     ------------------------------------------------------- */
  const triggerEndBtn = document.getElementById("trigger-end-btn");
  const footerEndBtn = document.getElementById("footer-end-btn");
  const endCurtainOverlay = document.getElementById("end-curtain-overlay");
  const replayTapeBtn = document.getElementById("replay-tape-btn");

  function openEndCurtain() {
    if (!endCurtainOverlay) return;
    if (window.AnalogAudio) window.AnalogAudio.playPowerOffSound();
    if (window.AnalogNoise) window.AnalogNoise.setMode("standby");
    endCurtainOverlay.hidden = false;
  }

  function closeEndCurtain() {
    if (!endCurtainOverlay) return;
    if (window.AnalogNoise) window.AnalogNoise.setMode("calm");
    endCurtainOverlay.hidden = true;
  }

  if (triggerEndBtn) triggerEndBtn.addEventListener("click", openEndCurtain);
  if (footerEndBtn) footerEndBtn.addEventListener("click", openEndCurtain);
  if (replayTapeBtn) replayTapeBtn.addEventListener("click", closeEndCurtain);

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (ch) => {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }
});