/* =========================================================
   THE SHOWRUNNER — GIAO DIỆN 2: WEB GIỚI THIỆU, ĐỔI NỀN & NHẠC
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  /* -------------------------------------------------------
     1. HỆ THỐNG ĐỔI ẢNH BACKGROUND BẰNG LINK URL / TỆP MÁY
     ------------------------------------------------------- */
  const bgLayer = document.getElementById("main-bg-layer");
  const bgUrlInput = document.getElementById("bg-url-input");
  const bgApplyBtn = document.getElementById("bg-apply-btn");
  const bgFileInput = document.getElementById("bg-file-input");
  const bgResetBtn = document.getElementById("bg-reset-btn");
  const bgBwToggle = document.getElementById("bg-bw-toggle");
  const bgDimSlider = document.getElementById("bg-dim-slider");
  const bgStatusMsg = document.getElementById("bg-status-msg");
  const wireframeSvg = document.getElementById("forensic-wireframe");

  const toggleMediaBtn = document.getElementById("toggle-media-drawer-btn");
  const mediaDrawer = document.getElementById("media-studio-drawer");

  if (toggleMediaBtn && mediaDrawer) {
    toggleMediaBtn.addEventListener("click", () => {
      const willShow = mediaDrawer.hidden;
      mediaDrawer.hidden = !willShow;
      toggleMediaBtn.classList.toggle("is-open", willShow);
      toggleMediaBtn.setAttribute("aria-expanded", String(willShow));
    });
  }

  function applyBackgroundUrl(url, save = true) {
    if (!bgLayer) return;
    const cleanUrl = (url || "").trim();

    if (!cleanUrl) {
      bgLayer.style.backgroundImage = "";
      if (bgStatusMsg) bgStatusMsg.textContent = "Đang dùng: Nền Tư Liệu Mặc Định";
      if (save) localStorage.removeItem("showrunner_bg_url");
      return;
    }

    bgLayer.style.backgroundImage = `url("${cleanUrl.replace(/"/g, '\\"')}")`;
    if (bgUrlInput && !cleanUrl.startsWith("data:")) {
      bgUrlInput.value = cleanUrl;
    }
    if (bgStatusMsg) {
      bgStatusMsg.textContent = cleanUrl.startsWith("data:")
        ? "Đã áp dụng ảnh từ máy của bạn"
        : "Đã áp dụng ảnh từ link URL";
    }
    if (save) {
      try {
        localStorage.setItem("showrunner_bg_url", cleanUrl);
      } catch (e) {}
    }
  }

  function syncBwAndWireframe() {
    const enabled = bgBwToggle ? bgBwToggle.checked : true;
    if (bgLayer) bgLayer.classList.toggle("has-bw-filter", enabled);
    if (wireframeSvg) wireframeSvg.classList.toggle("is-hidden", !enabled);
    try {
      localStorage.setItem("showrunner_bg_bw", enabled ? "1" : "0");
    } catch (e) {}
  }

  function applyDim(val) {
    const opacity = Math.max(0.05, Math.min(0.8, Number(val) / 100));
    document.documentElement.style.setProperty("--bg-dim", String(opacity));
    try {
      localStorage.setItem("showrunner_bg_dim", String(val));
    } catch (e) {}
  }

  try {
    const savedBg = localStorage.getItem("showrunner_bg_url");
    if (savedBg) applyBackgroundUrl(savedBg, false);

    const savedBw = localStorage.getItem("showrunner_bg_bw");
    if (bgBwToggle && savedBw !== null) bgBwToggle.checked = savedBw === "1";

    const savedDim = localStorage.getItem("showrunner_bg_dim");
    if (bgDimSlider && savedDim !== null) {
      bgDimSlider.value = savedDim;
      applyDim(savedDim);
    }
  } catch (e) {}
  syncBwAndWireframe();

  if (bgApplyBtn && bgUrlInput) {
    bgApplyBtn.addEventListener("click", () => applyBackgroundUrl(bgUrlInput.value));
    bgUrlInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        applyBackgroundUrl(bgUrlInput.value);
      }
    });
  }

  if (bgFileInput) {
    bgFileInput.addEventListener("change", () => {
      const file = bgFileInput.files && bgFileInput.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => applyBackgroundUrl(String(reader.result || ""));
      reader.readAsDataURL(file);
    });
  }

  if (bgResetBtn) {
    bgResetBtn.addEventListener("click", () => {
      if (bgUrlInput) bgUrlInput.value = "";
      applyBackgroundUrl("", true);
    });
  }

  if (bgBwToggle) bgBwToggle.addEventListener("change", syncBwAndWireframe);
  if (bgDimSlider) bgDimSlider.addEventListener("input", () => applyDim(bgDimSlider.value));

  /* -------------------------------------------------------
     2. HỆ THỐNG THÊM LINK NHẠC & TRÌNH PHÁT
     ------------------------------------------------------- */
  const musicTitleInput = document.getElementById("music-title-input");
  const musicUrlInput = document.getElementById("music-url-input");
  const musicAddBtn = document.getElementById("music-add-btn");
  const musicPlayBtn = document.getElementById("music-play-btn");
  const musicLoopBtn = document.getElementById("music-loop-btn");
  const musicSeek = document.getElementById("music-seek");
  const musicTime = document.getElementById("music-time");
  const musicVol = document.getElementById("music-vol");
  const musicPlaylistEl = document.getElementById("music-playlist");
  const musicNowPlaying = document.getElementById("music-now-playing");
  const audioPlayer = document.getElementById("custom-audio-player");

  let tracks = [];
  let currentTrackIndex = -1;
  let isLooping = true;

  function saveTracks() {
    try {
      localStorage.setItem("showrunner_tracks", JSON.stringify(tracks));
    } catch (e) {}
  }

  function formatSec(sec) {
    if (!Number.isFinite(sec) || sec < 0) return "00:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function renderPlaylist() {
    if (!musicPlaylistEl) return;
    if (tracks.length === 0) {
      musicPlaylistEl.innerHTML =
        `<div class="studio-status">Chưa có link nhạc nào. Dán link .mp3 / .ogg / .wav ở trên rồi bấm + THÊM NHẠC.</div>`;
      return;
    }

    musicPlaylistEl.innerHTML = tracks
      .map(
        (t, idx) => `
        <div class="playlist-item ${idx === currentTrackIndex ? "is-current" : ""}">
          <button class="playlist-play-pick" type="button" data-idx="${idx}">
            ${idx === currentTrackIndex ? "&#9654; " : ""}${escapeHtml(t.title)}
          </button>
          <button class="playlist-del-btn" type="button" data-del="${idx}" title="Xóa bài này">&times;</button>
        </div>`
      )
      .join("");
  }

  function loadAndPlayTrack(index) {
    if (!audioPlayer || !tracks[index]) return;
    currentTrackIndex = index;
    const track = tracks[index];

    if (window.AnalogRadio && window.AnalogRadio.isPlaying()) {
      window.AnalogRadio.togglePlay();
    }

    audioPlayer.src = track.url;
    audioPlayer.loop = isLooping;
    audioPlayer.volume = musicVol ? Number(musicVol.value) / 100 : 0.7;

    if (musicNowPlaying) musicNowPlaying.textContent = `Đang phát: ${track.title}`;
    renderPlaylist();

    audioPlayer
      .play()
      .then(() => {
        if (musicPlayBtn) musicPlayBtn.innerHTML = "&#10074;&#10074; TẠM DỪNG";
      })
      .catch(() => {
        if (musicNowPlaying) {
          musicNowPlaying.textContent = "Lỗi phát link (cần link file âm thanh trực tiếp .mp3/.ogg/.wav)";
        }
      });
  }

  function addTrackFromInputs() {
    if (!musicUrlInput) return;
    const url = musicUrlInput.value.trim();
    if (!url) return;

    if (/youtube\.com|youtu\.be|spotify\.com/i.test(url)) {
      if (musicNowPlaying) {
        musicNowPlaying.textContent = "Lưu ý: Cần dán link file âm thanh trực tiếp (.mp3/.ogg/.wav)";
      }
      return;
    }

    let title = musicTitleInput ? musicTitleInput.value.trim() : "";
    if (!title) {
      try {
        const parts = new URL(url).pathname.split("/").filter(Boolean);
        title = decodeURIComponent(parts[parts.length - 1] || "Băng Nhạc Swezan");
      } catch (e) {
        title = `Bản nhạc #${tracks.length + 1}`;
      }
    }

    tracks.push({ title, url });
    saveTracks();
    if (musicTitleInput) musicTitleInput.value = "";
    musicUrlInput.value = "";
    loadAndPlayTrack(tracks.length - 1);
  }

  try {
    const savedTracks = JSON.parse(localStorage.getItem("showrunner_tracks") || "[]");
    if (Array.isArray(savedTracks)) tracks = savedTracks;
  } catch (e) {}
  renderPlaylist();

  if (musicAddBtn) musicAddBtn.addEventListener("click", addTrackFromInputs);
  if (musicUrlInput) {
    musicUrlInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addTrackFromInputs();
      }
    });
  }

  if (musicPlaylistEl) {
    musicPlaylistEl.addEventListener("click", (e) => {
      const pickBtn = e.target.closest("[data-idx]");
      const delBtn = e.target.closest("[data-del]");
      if (pickBtn) {
        loadAndPlayTrack(Number(pickBtn.dataset.idx));
      } else if (delBtn) {
        const delIdx = Number(delBtn.dataset.del);
        tracks.splice(delIdx, 1);
        if (delIdx === currentTrackIndex && audioPlayer) {
          audioPlayer.pause();
          audioPlayer.src = "";
          currentTrackIndex = -1;
          if (musicNowPlaying) musicNowPlaying.textContent = "Chưa phát nhạc";
          if (musicPlayBtn) musicPlayBtn.innerHTML = "&#9654; PHÁT";
        } else if (delIdx < currentTrackIndex) {
          currentTrackIndex -= 1;
        }
        saveTracks();
        renderPlaylist();
      }
    });
  }

  if (musicPlayBtn && audioPlayer) {
    musicPlayBtn.addEventListener("click", () => {
      if (tracks.length === 0) return;
      if (currentTrackIndex === -1) {
        loadAndPlayTrack(0);
        return;
      }
      if (audioPlayer.paused) {
        audioPlayer.play().catch(() => {});
        musicPlayBtn.innerHTML = "&#10074;&#10074; TẠM DỪNG";
      } else {
        audioPlayer.pause();
        musicPlayBtn.innerHTML = "&#9654; PHÁT";
      }
    });
  }

  if (musicLoopBtn && audioPlayer) {
    musicLoopBtn.addEventListener("click", () => {
      isLooping = !isLooping;
      audioPlayer.loop = isLooping;
      musicLoopBtn.textContent = isLooping ? "LẶP: BẬT" : "LẶP: TẮT";
      musicLoopBtn.classList.toggle("is-active", isLooping);
    });
  }

  if (musicVol && audioPlayer) {
    musicVol.addEventListener("input", () => {
      audioPlayer.volume = Number(musicVol.value) / 100;
    });
  }

  if (audioPlayer) {
    audioPlayer.addEventListener("timeupdate", () => {
      if (musicTime) musicTime.textContent = formatSec(audioPlayer.currentTime);
      if (musicSeek && audioPlayer.duration) {
        musicSeek.value = String((audioPlayer.currentTime / audioPlayer.duration) * 100);
      }
    });
    audioPlayer.addEventListener("ended", () => {
      if (!isLooping && tracks.length > 0) {
        loadAndPlayTrack((currentTrackIndex + 1) % tracks.length);
      }
    });
  }

  if (musicSeek && audioPlayer) {
    musicSeek.addEventListener("input", () => {
      if (audioPlayer.duration) {
        audioPlayer.currentTime = (Number(musicSeek.value) / 100) * audioPlayer.duration;
      }
    });
  }

  /* -------------------------------------------------------
     3. CHUYỂN TAB GIỚI THIỆU
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

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  document.querySelectorAll("[data-open-tab]").forEach((card) => {
    card.addEventListener("click", () => switchTab(card.dataset.openTab));
  });

  /* -------------------------------------------------------
     4. THẾ GIỚI SWEZAN: TIMELINE, DIỄN BIẾN, NGUYÊN TẮC (CÔNG KHAI)
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
      body: "Nhiều hộ dân dùng chăn dạ hoặc báo cũ trùm kín tivi vào ban đêm, trẻ em bật khóc khi thấy đèn LED đầu máy VCR. Tại Bến cảng và Khối 7, công nhân đốt lửa trong thùng phuy bãi công, thậm chí hò reo trước tin Phó cảnh sát trưởng mất tích; còn giới thượng lưu trên Đồi Kranzhügel đóng chặt cổng thuê vệ sĩ gác đêm.",
    },
    {
      tag: "⚖️ ĐỒN CẢNH SÁT & TÒA THỊ CHÍNH",
      title: "Bộ Máy Công Quyền Hỗn Loạn",
      body: "Cảnh sát trưởng Heckler giam mình trong phòng cùng mùi rượu gin và thuốc lá Chesterfield trước nguy cơ bị Tòa thị chính cách chức. Tuần tra địa phương tăng cường vây ráp, bắt bớ người vô gia cư để tra khảo, trong khi Công tố viên Julian von Brandt trực tiếp siết chặt giám sát hồ sơ.",
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
      body: "Mỗi hành động đều tiêu tốn thời gian thực: khám nghiệm (+4 giờ), thẩm vấn (+2–3 giờ), di chuyển giữa các khu (+30–60 phút). Thức quá 24–30 giờ liên tục sẽ gây run tay, giảm phán đoán và ảo giác. Đến 23:59 Chủ Nhật, kết cục sẽ tự động chốt.",
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

  const WORLD_DISTRICTS = [
    {
      zone: "ĐÔNG · TRUNG TÂM CỔ",
      title: "Phố Cổ Altstadt",
      items: "Kiến trúc đá sa thạch thế kỷ 19, Đồn Cảnh sát, Tòa Thị chính, Tòa soạn Tagblatt, phòng trà Thiên Nga Đen và các hiệu sách yên tĩnh bên bờ kênh.",
    },
    {
      zone: "TÂY · ĐƯỜNG THỦY",
      title: "Bến Cảng Sông Đen (Schwarzhaven)",
      items: "Bãi than ướt, sà lan chở hàng đêm, tiệm cầm đồ Tổ Quạ và quán rượu ngầm Mỏ Neo Mù nồng mùi rượu gin và thuốc lá sợi.",
    },
    {
      zone: "NAM · VÀNH ĐAI RỈ SÉT",
      title: "Tổ Hợp Công Nghiệp Hüt IV & Ga Güterof",
      items: "Những ống khói lò luyện kim sừng sững, phân xưởng dệt cũ và bãi toa xe lửa bỏ không giữa rừng thông ẩm ướt.",
    },
    {
      zone: "BẮC · VÙNG ĐỒI",
      title: "Đồi Kranzhügel & Đồi Gió Hú Wigel",
      items: "Một bên là những biệt thự quý tộc sau cổng sắt rèn; bên kia là tháp tiếp sóng truyền hình K-TV Kênh 8 giữa sương mù.",
    },
    {
      zone: "NGOẠI Ô · KHU LAO ĐỘNG",
      title: "Chung Cư Khối 7–12",
      items: "Những dãy nhà bê tông xám xịt giăng đầy dây phơi và ăng-ten râu thỏ, nơi công nhân tụ tập quanh thùng phuy đốt lửa.",
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

  if (worldDistrictsGrid) {
    worldDistrictsGrid.innerHTML = WORLD_DISTRICTS.map(
      (d) => `<article class="map-card"><div class="card-badge-row"><span>${d.zone}</span></div><h3 class="card-h3">${d.title}</h3><p class="card-body">${d.items}</p></article>`
    ).join("");
  }

  let castFilter = "all";
  const castGrid = document.getElementById("cast-grid");
  const castFilterBtns = document.querySelectorAll("[data-cast-filter]");

  function renderCast() {
    if (!castGrid) return;
    const list =
      castFilter === "all" ? PUBLIC_CAST : PUBLIC_CAST.filter((c) => c.group === castFilter);
    castGrid.innerHTML = list
      .map(
        (c) => `
      <article class="cast-card">
        <div class="card-badge-row"><span>${c.badge}</span></div>
        <h3 class="card-h3">${c.name}</h3>
        <div class="card-sub">${c.role}</div>
        <p class="card-body">${c.desc}</p>
        <p class="card-quote">${c.quote}</p>
      </article>`
      )
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
     5. TRÌNH TẠO HỒ SƠ NHẬP VAI & COPY PROMPT
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

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (ch) => {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }
  /* -------------------------------------------------------
     7. PHẦN END: DỪNG BĂNG & MÀN HÌNH HẠ MÀN (THE END)
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
});