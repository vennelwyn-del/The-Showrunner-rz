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
     4. TAB 3: CÁC BĂNG VIDEO ĐÃ ĐƯỢC CÔNG BỐ
     ------------------------------------------------------- */
  const videos = Array.isArray(cfg.videos) ? cfg.videos : [];
  const tapesListGrid = document.getElementById("tapes-list-grid");
  const tapeCrtMedia = document.getElementById("tape-crt-media");
  const tapeCrtCode = document.getElementById("tape-crt-code");
  const tapeCrtDate = document.getElementById("tape-crt-date");
  const tapeCrtStatus = document.getElementById("tape-crt-status");
  const tapeCrtTitle = document.getElementById("tape-crt-title");
  const tapeCrtSummary = document.getElementById("tape-crt-summary");
  const tapeCrtQuote = document.getElementById("tape-crt-quote");

  let activeTapeId = videos[0] ? videos[0].id : "";

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

    if (tapeCrtMedia) {
      if (tape.videoUrl) {
        tapeCrtMedia.innerHTML = `<video src="${escapeHtml(tape.videoUrl)}" ${tape.thumbnailUrl ? `poster="${escapeHtml(tape.thumbnailUrl)}"` : ""} controls playsinline></video>`;
      } else if (tape.thumbnailUrl) {
        tapeCrtMedia.innerHTML = `<img src="${escapeHtml(tape.thumbnailUrl)}" alt="${escapeHtml(tape.title)}" />`;
      } else {
        tapeCrtMedia.innerHTML = `
          <div class="tape-crt-fallback">
            <strong>${escapeHtml(tape.status)}</strong>
            <span>${escapeHtml(tape.duration)}</span>
          </div>`;
      }
    }

    if (tapesListGrid) {
      tapesListGrid.querySelectorAll(".tape-card-btn").forEach((b) => {
        b.classList.toggle("is-active", b.dataset.tapeId === activeTapeId);
      });
    }
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