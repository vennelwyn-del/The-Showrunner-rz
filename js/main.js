/* =========================================================
   THE SHOWRUNNER — GIAO DIỆN 2 (BẢN GỘP HOÀN CHỈNH v15)
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const cfg = window.SHOWRUNNER_CONFIG || {};

  function escapeHtml(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, (ch) => {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function formatRichText(str) {
    return escapeHtml(str)
      .replace(/&lt;(strong|b)&gt;([\s\S]*?)&lt;\/\1&gt;/gi, "<strong>$2</strong>")
      .replace(/&lt;(em|i)&gt;([\s\S]*?)&lt;\/\1&gt;/gi, "<em>$2</em>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^\s*][^*]*?)\*/g, "<em>$1</em>");
  }

  /* -------------------------------------------------------
     1. ÁP DỤNG ẢNH NỀN TỪ config.js
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
     2. HỆ THỐNG CHUYỂN TAB (MẶC ĐỊNH VÀO 00. BACKSTORY)
     ------------------------------------------------------- */
  const tabBtns = document.querySelectorAll(".desk-tab");
  const deskPanels = document.querySelectorAll(".desk-panel");
  const videos = Array.isArray(cfg.videos) ? cfg.videos : [];
  let activeTapeId = videos[0] ? videos[0].id : "";

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

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  document.querySelectorAll("[data-open-tab]").forEach((card) => {
    card.addEventListener("click", () => switchTab(card.dataset.openTab));
  });

  /* -------------------------------------------------------
     2B. TAB 00: BACKSTORY & 1 KHUNG ẢNH MỞ ĐẦU
     ------------------------------------------------------- */
  const backstoryEl = document.getElementById("backstory-content");
  const bs = cfg.backstory || {};

  if (backstoryEl) {
    const bsPhoto = bs.imageUrl
      ? `<img src="${escapeHtml(bs.imageUrl)}" alt="${escapeHtml(bs.title || "Swezan Backstory")}" />`
      : `<div class="backstory-photo-empty">
           <span>ARCHIVE PHOTO // SWEZAN 1994</span>
           <strong>[CHÈN 1 ẢNH BACKSTORY TRONG config.js]</strong>
         </div>`;

    const bsParagraphs = Array.isArray(bs.paragraphs)
      ? bs.paragraphs.map((p) => `<p>${formatRichText(p)}</p>`).join("")
      : "";

    backstoryEl.innerHTML = `
      <figure class="backstory-photo-card">
        <span class="pushpin" aria-hidden="true"></span>
        <div class="backstory-photo-frame">${bsPhoto}</div>
        <figcaption class="backstory-photo-caption">
          <span>${escapeHtml(bs.imageCaption || "SWEZAN VALLEY · 1994")}</span>
          <span>FILE // 00</span>
        </figcaption>
      </figure>

      <article class="backstory-story-card">
        <p class="panel-kicker">${escapeHtml(bs.kicker || "PROLOGUE // 1994")}</p>
        <h2 class="backstory-title">${escapeHtml(bs.title || "THUNG LŨNG SWEZAN TRƯỚC GIỜ G")}</h2>
        ${bs.quote ? `<blockquote class="backstory-quote">${formatRichText(bs.quote)}</blockquote>` : ""}
        <div class="backstory-paragraphs">${bsParagraphs}</div>
      </article>
    `;
  }

  /* -------------------------------------------------------
     3. TAB 02: THẾ GIỚI SWEZAN, TIMELINE, KHU VỰC & NGUYÊN TẮC
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
      tag: "THÂN PHẬN 05 · LINH HOẠT ĐỊA VỊ",
      title: "Dân Thường Tự Do (Ngoài 4 Nhóm Trên)",
      body: "Bao gồm mọi thân phận không nằm trong 4 ngành điều tra trên. Bạn có thể là thợ cơ khí bãi than, thân nhân nạn nhân, chủ tiệm, nghệ sĩ cho đến quý tộc / bá tước — tài chính và quyền thế tùy thuộc vào Nghề nghiệp & Địa vị bạn chọn.",
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
     4. TAB 03: CÁC BĂNG VIDEO ĐÃ CÔNG BỐ (3D MODEL & 2D FALLBACK)
     ------------------------------------------------------- */
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

  let simRafId = null;

  function buildCutoutSimHtml(tape) {
    const sim = tape.sim || {};
    const hasCustomCutouts = Boolean(
      sim.bgUrl || sim.personUrl || sim.flowerUrl || sim.flowerRightUrl || sim.overlayUrl
    );

    const tintClass =
      sim.tintMode === "shadow"
        ? "sim-tint-shadow"
        : sim.tintMode === "original"
        ? "sim-tint-original"
        : "sim-tint-noir";

    const motionClass = `motion-${tape.id}`;

    // Nếu người tạo chưa chèn link ảnh cắt nền nào thì giữ thông báo + khung chờ gọn
    if (!hasCustomCutouts) {
      return `
        <div class="sim-cutout-stage">
          <div class="sim-fog-band sim-fog-back"></div>
          <div class="sim-empty-cutout-hint">
            <strong>${escapeHtml(tape.status)}</strong>
            <span>Chèn link ảnh người &amp; hoa cắt nền (.PNG) vào mục <code>videos → sim</code> trong <code>js/config.js</code> để phát hoạt ảnh.</span>
          </div>
          <div class="sim-noise-grain"></div>
          <div class="sim-tracking-band"></div>
          <div class="sim-flash-glitch"></div>
        </div>
      `;
    }

    const bgHtml = sim.bgUrl
      ? `<img class="sim-layer-bg ${tintClass}" src="${escapeHtml(sim.bgUrl)}" alt="" />`
      : "";

    const personHtml = sim.personUrl
      ? `<img class="sim-layer-person ${tintClass} ${motionClass}" src="${escapeHtml(sim.personUrl)}" alt="${escapeHtml(tape.title)}" />`
      : "";

    let flowerHtml = "";
    if (sim.flowerUrl && sim.flowerRightUrl) {
      flowerHtml = `
        <img class="sim-layer-flower is-left ${tintClass}" src="${escapeHtml(sim.flowerUrl)}" alt="" />
        <img class="sim-layer-flower is-right ${tintClass}" src="${escapeHtml(sim.flowerRightUrl)}" alt="" />
      `;
    } else if (sim.flowerUrl) {
      flowerHtml = `<img class="sim-layer-flower is-center ${tintClass}" src="${escapeHtml(sim.flowerUrl)}" alt="" />`;
    } else if (sim.flowerRightUrl) {
      flowerHtml = `<img class="sim-layer-flower is-right ${tintClass}" src="${escapeHtml(sim.flowerRightUrl)}" alt="" />`;
    }

    const overlayHtml = sim.overlayUrl
      ? `<img class="sim-layer-overlay ${motionClass}" src="${escapeHtml(sim.overlayUrl)}" alt="" />`
      : tape.id === "tape-2"
      ? `<div class="sim-egg-glass-rim"></div>`
      : "";

    return `
      <div class="sim-cutout-stage">
        ${bgHtml}
        <div class="sim-fog-band sim-fog-back"></div>
        ${personHtml}
        <div class="sim-fog-band sim-fog-front"></div>
        ${flowerHtml}
        ${overlayHtml}
        <div class="sim-noise-grain"></div>
        <div class="sim-tracking-band"></div>
        <div class="sim-flash-glitch"></div>
      </div>
    `;
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

    tapeCrtMedia.innerHTML = `
      <div id="tape-sim-stage" class="tape-sim-stage is-playing">
        ${buildCutoutSimHtml(tape)}
        <div class="sim-end-stamp">■ END OF PREVIEW // BẤM PHÁT LẠI</div>
      </div>
    `;

    const durationMs = 3800;
    const startAt = performance.now();

    function step(now) {
      const ratio = Math.min(1, (now - startAt) / durationMs);
      const sec = Math.min(4, Math.floor(ratio * 4));

      if (tapeSimProgress) tapeSimProgress.style.width = `${(ratio * 100).toFixed(1)}%`;
      if (tapeCrtTimer) {
        tapeCrtTimer.textContent = ratio < 1 ? `▶ PLAY 00:0${sec}` : "■ STOP 00:04";
      }

      if (ratio < 1) {
        simRafId = requestAnimationFrame(step);
      } else {
        const stage = document.getElementById("tape-sim-stage");
        if (stage) {
          stage.classList.remove("is-playing");
          stage.classList.add("is-ended");
        }
        simRafId = null;
      }
    }

    simRafId = requestAnimationFrame(step);
  }

  function selectTape(tapeId, shouldPlay = true) {
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

    if (shouldPlay) playTapeSimulation(tape);
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
      if (btn) selectTape(btn.dataset.tapeId, true);
    });

    selectTape(activeTapeId, false);
  }

  /* -------------------------------------------------------
     5. TAB 04: NHÂN VẬT & BẢNG GHI CHÚ THÔNG TIN CÔNG KHAI
     ------------------------------------------------------- */
  const characters = Array.isArray(window.SHOWRUNNER_CHARACTERS) ? window.SHOWRUNNER_CHARACTERS : [];
  let castFilter = "all";
  let currentFilteredList = characters;
  let activeCharIndex = -1;

  const castGrid = document.getElementById("cast-grid");
  const castFilterBtns = document.querySelectorAll("[data-cast-filter]");

  const charNoteModal = document.getElementById("char-note-modal");
  const noteCloseBtn = document.getElementById("note-close-btn");
  const notePrevBtn = document.getElementById("note-prev-btn");
  const noteNextBtn = document.getElementById("note-next-btn");

  function openCharacterNote(charId) {
    const idx = currentFilteredList.findIndex((c) => c.id === charId);
    if (idx === -1 || !charNoteModal) return;

    const c = currentFilteredList[idx];
    if (c.classified) return;
    activeCharIndex = idx;

    const setText = (id, txt) => {
      const el = document.getElementById(id);
      if (el) el.textContent = txt || "";
    };

    setText("note-code", c.code);
    setText("note-stamp", c.stamp);
    setText("note-char-name", c.name);
    setText("note-meta", c.ageGender || "Nhân vật tại Swezan");
    setText("note-role", c.role);
    setText("note-appearance", c.appearance || c.desc);
    setText("note-sensory", c.sensory || "Chưa ghi nhận thêm chi tiết cảm quan.");
    setText("note-demeanor", c.demeanor || c.desc);
    setText("note-public", c.publicNotes || c.desc);
    setText("note-quote", c.quote);

    const notePhotoBox = document.getElementById("note-photo-box");
    if (notePhotoBox) {
      notePhotoBox.innerHTML = c.imageUrl
        ? `<img class="char-photo-img" src="${escapeHtml(c.imageUrl)}" alt="${escapeHtml(c.name)}" /><span class="char-cam-tag">FILE // PUBLIC</span>`
        : `<div class="char-photo-placeholder">
             <span class="q-mark">?</span>
             <span class="q-hint">SWEZAN 1994</span>
           </div><span class="char-cam-tag">FILE // PUBLIC</span>`;
    }

    charNoteModal.hidden = false;
  }

  function closeCharacterNote() {
    if (charNoteModal) charNoteModal.hidden = true;
    activeCharIndex = -1;
  }

  function stepCharacterNote(dir) {
    if (currentFilteredList.length === 0 || activeCharIndex === -1) return;
    for (let step = 1; step <= currentFilteredList.length; step++) {
      const nextIdx =
        (activeCharIndex + dir * step + currentFilteredList.length) % currentFilteredList.length;
      if (!currentFilteredList[nextIdx].classified) {
        openCharacterNote(currentFilteredList[nextIdx].id);
        break;
      }
    }
  }

  function renderCast() {
    if (!castGrid) return;
    currentFilteredList =
      castFilter === "all" ? characters : characters.filter((c) => c.group === castFilter);

    castGrid.innerHTML = currentFilteredList
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
        <article class="char-polaroid-card ${isClassified ? "is-classified" : ""}" style="--card-tilt: ${tilt}deg" data-char-id="${escapeHtml(c.id)}" tabindex="0" role="button">
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
          ${isClassified ? "" : `<span class="char-open-hint">[BẤM MỞ GHI CHÚ &#8599;]</span>`}
        </article>`;
      })
      .join("");
  }

  if (castGrid) {
    castGrid.addEventListener("click", (e) => {
      const card = e.target.closest("[data-char-id]");
      if (card) openCharacterNote(card.dataset.charId);
    });
    castGrid.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        const card = e.target.closest("[data-char-id]");
        if (card) {
          e.preventDefault();
          openCharacterNote(card.dataset.charId);
        }
      }
    });
  }

  if (noteCloseBtn) noteCloseBtn.addEventListener("click", closeCharacterNote);
  if (notePrevBtn) notePrevBtn.addEventListener("click", () => stepCharacterNote(-1));
  if (noteNextBtn) noteNextBtn.addEventListener("click", () => stepCharacterNote(1));
  if (charNoteModal) {
    charNoteModal.addEventListener("click", (e) => {
      if (e.target === charNoteModal) closeCharacterNote();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && charNoteModal && !charNoteModal.hidden) {
      closeCharacterNote();
    }
  });

  castFilterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      castFilter = btn.dataset.castFilter;
      castFilterBtns.forEach((b) => b.classList.toggle("is-active", b === btn));
      renderCast();
    });
  });

  renderCast();

  /* -------------------------------------------------------
     6. TAB 05: HỒ SƠ NHẬP TỊCH SWEZAN (1994)
     ------------------------------------------------------- */
  const pfIds = [
    "pf-name",
    "pf-alias",
    "pf-age",
    "pf-gender",
    "pf-orientation",
    "pf-archetype",
    "pf-occupation",
    "pf-district",
    "pf-lenormand",
    "pf-physique",
    "pf-attire",
    "pf-scent",
    "pf-personality",
    "pf-weakness",
    "pf-relations",
    "pf-weapon",
    "pf-tools",
    "pf-vehicle",
    "pf-bio",
    "pf-secret",
    "pf-goal",
    "pf-quote",
    "pf-extra",
  ];

  const ROLE_HINTS = {
    "Thanh Tra Cấp Cao":
      "Nhóm Điều Tra Nhà Nước: Có lệnh trưng dụng từ Bộ Nội vụ và vũ khí công vụ (khởi điểm ~1.200 M), nhưng bị cảnh sát địa phương dè chừng và công nhân thù địch.",
    "Thám Tử Tư":
      "Nhóm Điều Tra Tự Do: Không có thẩm quyền pháp lý chính thức (~300 M), bù lại tự do đi lại ngoài giới nghiêm và giao dịch dưới bến cảng đêm.",
    "Bác Sĩ Pháp Y":
      "Nhóm Giám Định Khoa Học: Nắm quyền tại Nhà xác Tòa án Cũ (~1.500 M), tiếng nói khoa học có trọng lượng nhưng thiếu quyền cưỡng chế ngoài phố.",
    "Phóng Viên Điều Tra":
      "Nhóm Truyền Thông: Có thẻ nhà báo & mạng lưới tin tức (~600 M), định hướng được dư luận nhưng dễ bị cả cảnh sát lẫn tội phạm đề phòng.",
    "Dân Thường Tự Do":
      "Nhóm Ngoài 4 Ngành Điều Tra: Địa vị và tài sản hoàn toàn tự do theo ô “Nghề nghiệp / Địa vị” (có thể là thợ cơ khí bãi than, thân nhân nạn nhân, chủ tiệm, nghệ sĩ hoặc quý tộc / bá tước...).",
  };

  const pfArchetypeEl = document.getElementById("pf-archetype");
  const pfOccupationEl = document.getElementById("pf-occupation");
  const pfRoleHintEl = document.getElementById("pf-role-hint");
  const profileOutput = document.getElementById("profile-output");
  const copyProfileBtn = document.getElementById("copy-profile-btn");
  const copyFeedback = document.getElementById("copy-feedback");

  function syncRoleHint() {
    if (!pfArchetypeEl) return;
    const role = pfArchetypeEl.value;
    if (pfRoleHintEl) pfRoleHintEl.textContent = ROLE_HINTS[role] || "";
    if (pfOccupationEl) {
      if (role === "Dân Thường Tự Do") {
        pfOccupationEl.placeholder = "VD: Bá tước đồi Kranzhügel / Thợ cơ khí bãi than / Chủ tiệm bánh...";
      } else if (role === "Thanh Tra Cấp Cao") {
        pfOccupationEl.placeholder = "VD: Thanh tra cảnh sát liên bang / Đặc phái viên Bộ Nội vụ...";
      } else if (role === "Thám Tử Tư") {
        pfOccupationEl.placeholder = "VD: Thám tử tư giải ngũ / Cựu sĩ quan mất quân tịch...";
      } else if (role === "Bác Sĩ Pháp Y") {
        pfOccupationEl.placeholder = "VD: Bác sĩ giám định độc lập / Chuyên viên giải phẫu...";
      } else {
        pfOccupationEl.placeholder = "VD: Phóng viên điều tra tòa soạn / Ký giả tự do...";
      }
    }
  }

  function buildProfileText() {
    const val = (id, fallback) => {
      const el = document.getElementById(id);
      return el && el.value.trim() ? el.value.trim() : fallback;
    };

    const rawQuote = val(
      "pf-quote",
      "Mọi cuộn băng đều có điểm dừng, chỉ có những gì nằm lại trong bóng tối là còn tiếp tục."
    ).replace(/^["“”]+|["“”]+$/g, "");

    const text = `║ HỒ SƠ NHẬP TỊCH SWEZAN (1994) ║

**Họ và tên:** ${val("pf-name", "[Tên Chính] + [Tên Đệm / Tên Thánh] + [Họ Địa Phương]")}
**Biệt danh / Danh hiệu:** ${val("pf-alias", "(Không có)")}
**Tuổi:** ${val("pf-age", "[Từ 18 tuổi trở lên]")}
**Giới tính & Đại từ xưng hô:** ${val("pf-gender", "Nam / Nữ | Anh / Cô / Tôi")}
**Xu hướng tính dục:** ${val("pf-orientation", "Thẳng / Song tính / Đồng tính / Vô tính")}
**Thân phận:** ${val("pf-archetype", "Dân Thường Tự Do")}
**Nghề nghiệp / Địa vị:** ${val("pf-occupation", "[Ghi rõ nghề nghiệp hoặc tước vị: Bá tước, Thợ cơ khí, Thanh tra...]")}
**Địa bàn cư trú tại Swezan:** ${val("pf-district", "Phố cổ Altstadt")}
**Lá bài Lenormand / Biểu tượng cá nhân:** ${val("pf-lenormand", "Lá 33 - Chìa Khóa")}

---

**Ngoại hình & Giác quan (1994 Noir):**
* Vóc dáng & Diện mạo: ${val("pf-physique", "[Chiều cao, dáng người, màu mắt, kiểu tóc, vết sẹo...]")}
* Phong cách ăn mặc: ${val("pf-attire", "[Áo măng tô dạ, suit cũ, áo da, váy nhung...]")}
* Mùi hương đặc trưng: ${val("pf-scent", "[Mùi cà phê đắng, thuốc lá, mưa bùn than...]")}

**Tính cách & Tâm lý:**
* Tính cách chủ đạo: ${val("pf-personality", "[Điềm tĩnh, hoài nghi, lạnh lùng...]")}
* Điểm yếu tâm lý: ${val("pf-weakness", "[Mất ngủ kinh niên, bóng ma quá khứ...]")}

**Mối quan hệ cá nhân:** ${val("pf-relations", "[Mối quan hệ sẵn có với nhân vật trong Swezan hoặc NPC tự tạo]")}

**Trang bị & Vũ khí khởi điểm (Công nghệ 1994):**
* Vũ khí: ${val("pf-weapon", "[Tay không / Dao găm / Súng lục...]")}
* Dụng cụ nghiệp vụ (nếu có): ${val("pf-tools", "[Đèn pin kim loại, sổ tay da...]")}
* Phương tiện: ${val("pf-vehicle", "[Xe sedan cũ / Xe đạp / Đi bộ]")}

**Tiểu sử:** ${val("pf-bio", "[Quá khứ lớn lên và các biến cố chính]")}

**Bí mật đen tối & Động cơ thực sự (Secret & Personal Motive):**
* ${val("pf-secret", "[Lý do thực sự có mặt tại Swezan]")}

**Mục tiêu trước mắt:**
* ${val("pf-goal", "[Cứu Phó cảnh sát trưởng August trước Chủ Nhật / Tìm hiểu sự thật / Sinh tồn...]")}

**Câu thoại mẫu:**
> **"${rawQuote}"**

**Thông tin thêm:** ${val("pf-extra", "(Không có)")}`;

    if (profileOutput) profileOutput.textContent = text;
    return text;
  }

  pfIds.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const evt = el.tagName === "SELECT" ? "change" : "input";
    el.addEventListener(evt, () => {
      if (el === pfArchetypeEl) syncRoleHint();
      buildProfileText();
    });
  });

  syncRoleHint();
  buildProfileText();

  if (copyProfileBtn) {
    copyProfileBtn.addEventListener("click", () => {
      const text = buildProfileText();
      const showCopied = () => {
        if (copyFeedback) copyFeedback.textContent = "ĐÃ COPY!";
        setTimeout(() => {
          if (copyFeedback) copyFeedback.textContent = "";
        }, 2200);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(showCopied).catch(() => {});
      } else {
        const tmp = document.createElement("textarea");
        tmp.value = text;
        document.body.appendChild(tmp);
        tmp.select();
        try {
          document.execCommand("copy");
          showCopied();
        } catch (e) {}
        document.body.removeChild(tmp);
      }
    });
  }

  /* -------------------------------------------------------
     7. TAB 06 & FOOTER: DỪNG BĂNG & MÀN HÌNH HẠ MÀN (THE END)
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

  // Mặc định khi bước vào Giao diện 2 sẽ mở thẳng Tab 00. BACKSTORY
  switchTab("backstory");
});