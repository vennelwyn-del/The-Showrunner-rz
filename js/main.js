/* =========================================================
   THE SHOWRUNNER — GIAO DIỆN 2: ĐỔI NỀN, THÊM NHẠC & HỒ SƠ
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
      if (bgStatusMsg) bgStatusMsg.textContent = "Đang dùng: Bàn Gỗ & Tư Liệu Mặc Định";
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
    const opacity = Math.max(0.15, Math.min(0.9, Number(val) / 100));
    document.documentElement.style.setProperty("--bg-dim", String(opacity));
    try {
      localStorage.setItem("showrunner_bg_dim", String(val));
    } catch (e) {}
  }

  // Nạp lại Background đã lưu
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
     2. HỆ THỐNG THÊM LINK NHẠC & TRÌNH PHÁT CASSETTE
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
        `<div class="studio-status">Chưa có link nhạc nào. Hãy dán link .mp3 / .ogg / .wav ở trên rồi bấm + THÊM NHẠC.</div>`;
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

    // Dừng Radio synth ở góc trên nếu đang phát để tránh chồng tiếng
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
          musicNowPlaying.textContent = "Lỗi phát link (hãy dùng link trực tiếp .mp3/.ogg/.wav)";
        }
      });
  }

  function addTrackFromInputs() {
    if (!musicUrlInput) return;
    const url = musicUrlInput.value.trim();
    if (!url) return;

    if (/youtube\.com|youtu\.be|spotify\.com/i.test(url)) {
      if (musicNowPlaying) {
        musicNowPlaying.textContent = "Lưu ý: Trình phát cần link file âm thanh trực tiếp (.mp3/.ogg/.wav)";
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
        const nextIdx = (currentTrackIndex + 1) % tracks.length;
        loadAndPlayTrack(nextIdx);
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
     3. CHUYỂN TAB BÀN ĐIỀU TRA & BẤM VÀO POLAROID
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
     4. DỮ LIỆU HỒ SƠ 4 VỤ ÁN, NHÂN VẬT & 16 ĐỊA DANH SWEZAN
     ------------------------------------------------------- */
  let secretsUnlocked = false;
  const secretLockBtn = document.getElementById("secret-lock-btn");
  const casesGrid = document.getElementById("cases-grid");

  const CASES_DATA = [
    {
      ep: "TẬP 1/4 — ĐÃ KHÉP HỒ SƠ",
      title: "Tái Sinh — Ottomar Burchard",
      card: "Lá 28: The Man · Chủ tiệm ăn Lutz (45t)",
      status: "Đã tử vong (Xà phòng hóa trong bể xút 09)",
      surface: "Bị quấn kén bằng 12 cuộn băng keo treo trên bể NaOH 60°C, thả rơi sau 7 ngày ăn mòn then kẽm. Pháp y phát hiện hóa chất nhuộm độc quyền Alizarin-Fixer TX và nút thắt thợ săn Prusik.",
      secret: "MẮT XÍCH 1974: Ottomar chính là gã đầu bếp đã pha thuốc mê vào bữa tối của 40 đứa trẻ trại mồ côi St. Leopold đêm hỏa hoạn.",
      active: false,
    },
    {
      ep: "TẬP 2/4 — CƯỚP SÓNG KÊNH 8",
      title: "Trứng Ấu Trùng — Malia Ariane",
      card: "Lá 30: Lilies · Ái nữ Nam tước đá quý (24t)",
      status: "Đã tử vong (Phù phổi cấp bởi hơi nước 100°C & SO2)",
      surface: "Bị nhốt trong buồng kính hình quả trứng tại Nhà kính C-4 cùng hoa loa kèn trắng. Hiện trường bắt cóc để lại vỏ đạn .32 ACP khắc đáy RWS-P của Hội Xạ Thủ Quý Tộc.",
      secret: "MẮT XÍCH 1974: Gia tộc Ariane đã chi tiền mua chuộc thanh tra đất đai và bảo an để giải tỏa trại mồ côi xây xưởng.",
      active: false,
    },
    {
      ep: "TẬP 3/4 — ĐANG ĐẾM NGƯỢC (56 TURN)",
      title: "Phá Kén — Matthäus August",
      card: "Lá 35: The Anchor · Phó Cảnh Sát Trưởng (52t)",
      status: "Mất tích 12 tiếng · Hạn chót 23:59 Chủ Nhật",
      surface: "Bị chụp thuốc mê Halothane bên hồ câu. Băng A giấu trong bụng cá chép đột biến chiếu cảnh August bị treo trên ghế sắt bên trên bể cá dữ, hậu cảnh có tem [SCHWARZHAVEN-AQUACULTURE 1974].",
      secret: "TỌA ĐỘ THẬT: Hầm bảo quản ấu trùng thủy sản số 03 (Schwarzhaven). Ngắt cầu dao bơm oxy trước khi kéo tời. August là kẻ đã khóa cửa phòng ngủ và châm lửa đốt St. Leopold.",
      active: true,
    },
    {
      ep: "TẬP 4/4 — SẮP KHỞI CHẠY (TURN 57–112)",
      title: "Bản Ghi Chép Tội Lỗi — Traudl Vanessa",
      card: "Lá 24: The Heart · Góa phụ Đồi Kranzhügel (45t)",
      status: "Chưa bị bắt cóc · Đang sống tại Dinh thự Vanessa",
      surface: "Teaser Băng A Tập 3 hé lộ thỏi son đỏ thẫm đặt cạnh mũ voan đen góa phụ. Đang tiêm thuốc trẻ hóa chui sau cánh cổng sắt Đồi Kranzhügel.",
      secret: "TỌA ĐỘ THẬT: Hầm mộ nhà kính giấu sau tượng Vệ Nữ không đầu. Chồng ả (Heinrich Vanessa) là kẻ lấy tiền bảo hiểm 1974 xây chuỗi khách sạn.",
      active: false,
    },
  ];

  function renderCases() {
    if (!casesGrid) return;
    casesGrid.innerHTML = CASES_DATA.map(
      (c) => `
      <article class="dossier-card ${c.active ? "is-active-case" : ""}">
        <div class="card-badge-row">
          <span>${c.ep}</span>
        </div>
        <h3 class="card-h3">${c.title}</h3>
        <div class="card-sub">${c.card}</div>
        <p class="card-body"><strong>Hiện trạng:</strong> ${c.status}</p>
        <p class="card-body">${c.surface}</p>
        ${secretsUnlocked ? `<div class="card-secret-box">&#128275; ${c.secret}</div>` : ""}
      </article>`
    ).join("");
  }

  const CAST_DATA = [
    {
      group: "core",
      badge: "01 — THE RIDER (VỎ BỌC)",
      name: "Alistair Cassius (28t)",
      role: "Chủ tiệm cà phê sách Cassius & Co. · Altstadt",
      desc: "Quý tộc thanh lịch, đeo găng tay da cừu đen không bao giờ tháo, thích ngủ gục bên sách kịch cổ Hy Lạp và trà Earl Grey.",
      secret: "CHÂN TƯỚNG: Tên gốc là Enes Venn Amory — đứa trẻ duy nhất sống sót sau vụ hỏa thiêu Trại trẻ mồ côi St. Leopold năm 1974; chính là The Rider.",
      quote: "“Ở đây, ít nhất các trang sách không biết mưu sát ai bao giờ.”",
    },
    {
      group: "core",
      badge: "11 — THE WHIP",
      name: "Julian Viktor von Brandt (31t)",
      role: "Công Tố Viên Đặc Biệt · Tòa Thị Chính",
      desc: "Âu phục 3 mảnh xanh than, mắt hổ phách sau kính nửa viền, luôn bật đồng hồ bạch kim. Hội viên Hội Xạ Thủ Quý Tộc (dùng đạn .32 ACP RWS-P).",
      secret: "BÍ MẬT: Đang giữ hồ sơ giải tỏa đất năm 1974 để tống tiền ngược Thị trưởng và Kurt Denholm thâu tóm đường sắt.",
      quote: "“Công lý không nằm trong họng súng, nó nằm dưới ngòi bút ký lệnh truy tố của tôi.”",
    },
    {
      group: "core",
      badge: "03 — THE SHIP",
      name: "Lukas “Raven” Kováč (29t)",
      role: "Chủ tiệm cầm đồ Tổ Quạ · Schwarzhaven",
      desc: "Cựu lính bắn tỉa mang thẻ bài Dog-tag bạc, vết sẹo ngang mày trái, nồng mùi thuốc lá Lucky Strike và dầu súng Ballistol.",
      secret: "BÍ MẬT: Đã bán tời điện công nghiệp & 2 lọ Halothane cho khách che mặt trả bằng tiền vàng cổ; đang giấu hóa đơn trong két sắt.",
      quote: "“Đặt năm mươi Mark lên mặt quầy... rồi tôi kể cho nghe sà lan nào lướt qua Hầm 03.”",
    },
    {
      group: "core",
      badge: "32 — THE MOON",
      name: "Clara Evelyne Moreau (26t)",
      role: "Danh ca Jazz · Phòng trà Thiên Nga Đen",
      desc: "Tóc đỏ rượu vang uốn sóng, trâm cài trăng lưỡi liềm, đầm nhung xẻ đùi, hương hoa nhài đêm và rượu vang Bordeaux.",
      secret: "BÍ MẬT: Anh nuôi từng bị August đánh chết trong phòng biệt giam; đang giấu băng ghi âm phòng VIP dưới sàn phòng thay đồ.",
      quote: "“Khi ánh đèn tắt đi, họ đều quỳ dưới gấu váy nhung của tôi để thú nhận tội lỗi.”",
    },
    {
      group: "core",
      badge: "08 — THE COFFIN",
      name: "Bác sĩ Eva Livingston (34t)",
      role: "Pháp Y · Nhà Xác Hầm Tòa Án Cũ",
      desc: "Tóc vàng pixie, đeo mặt dây quan tài bạc, lạnh lẽo mùi formol và tinh dầu bạc hà.",
      secret: "BÍ MẬT: Từng bị ép sửa hồ sơ ngộ độc hóa chất của công nhân 4 năm trước.",
      quote: "“Chỉ có những kẻ nằm trên bàn thép này là chưa từng biết bịa đặt một lời nào.”",
    },
    {
      group: "core",
      badge: "14 — THE FOX & 19 — THE TOWER & 13 — THE CHILD",
      name: "Isabel · Heckler · Ian Alix",
      role: "Báo Tagblatt · Cảnh Sát Trưởng · Tân Binh",
      desc: "Isabel (29t) giữ ảnh độc quyền; Heckler (58t) phát điên giữ ghế; Ian (22t) vụng về nhưng vô tình nhặt trúng manh mối.",
      secret: "BÍ MẬT: Isabel từng ỉm thư cảnh báo Tập 1; Heckler nhận bảo kê xưởng; Ian bị The Rider chọn làm con cờ gài bẫy.",
      quote: "“Chúng ta đều kiếm sống trên máu của người khác cả thôi.”",
    },
    {
      group: "suspect",
      badge: "15 — THE BEAR (NGHI PHẠM 1)",
      name: "Kurt Denholm (52t)",
      role: "Trùm Lò Luyện Kim Hüt IV",
      desc: "Nắm chìa khóa toàn bộ tổ hợp xưởng dệt/thép nơi xảy ra Tập 1 & 2. Nợ ngập đầu, đang có nguy cơ phá sản.",
      secret: "RED HERRING: Không phải The Rider — hắn lén chứa súng lậu & hàng mafia dưới Hüt IV để gán nợ.",
      quote: "“Tao giết người bằng cách cắt cơm và đóng cửa lò sưởi, không rảnh chơi trò nghệ thuật!”",
    },
    {
      group: "suspect",
      badge: "25 — THE RING (NGHI PHẠM 2)",
      name: "Ena Sherley (27t)",
      role: "Kỹ Thuật Viên Ca Đêm · Đài K-TV Kênh 8",
      desc: "Ám ảnh sóng vô tuyến và CRT, đeo vòng bện ruột băng VHS, am hiểu tháp tiếp sóng Đồi Gió Hú Wigel.",
      secret: "RED HERRING: Mắc chứng quay lén bệnh hoạn; từng tự cướp sóng thử nghiệm một đoạn hoạt hình méo tiếng.",
      quote: "“Tiếng rít 15kHz từ tháp Wigel đang bảo rằng cuốn băng tiếp theo sẽ tuyệt đẹp đấy.”",
    },
    {
      group: "suspect",
      badge: "36 — THE CROSS (NGHI PHẠM 3)",
      name: "Lotte Loris (45t)",
      role: "Thủ Lĩnh Nghiệp Đoàn Công Nhân",
      desc: "Thù ghét giới tư bản và cảnh sát sâu sắc, nắm rõ đường cống ngầm công xưởng và ga hàng hóa Güterof.",
      secret: "RED HERRING: Đang giấu súng trường quân dụng & thuốc nổ công nghiệp để chuẩn bị nổi dậy vũ trang.",
      quote: "“Bọn tao không rảnh khóc mướn cho mấy cái xác mặc áo vest!”",
    },
    {
      group: "suspect",
      badge: "06 — THE CLOUDS (NGHI PHẠM 4)",
      name: "Dr. Alis Zola (33t)",
      role: "Cựu Bác Sĩ Tâm Thần · Viện St. Nazet",
      desc: "Mắt dị sắc, mang dao mổ số 11 trong hộp thuốc lá bạc, từng căng da mặt chui cho Traudl Vanessa.",
      secret: "RED HERRING: Thực hiện thí nghiệm sốc điện não bất hợp pháp dưới tầng hầm hoang phế Viện St. Nazet.",
      quote: "“Kẻ Biên Kịch chỉ đang giúp họ chụp lại khoảnh khắc linh hồn bốc hơi mà thôi.”",
    },
  ];

  let castFilter = "all";
  const castGrid = document.getElementById("cast-grid");
  const castFilterBtns = document.querySelectorAll("[data-cast-filter]");

  function renderCast() {
    if (!castGrid) return;
    const list =
      castFilter === "all" ? CAST_DATA : CAST_DATA.filter((c) => c.group === castFilter);
    castGrid.innerHTML = list
      .map(
        (c) => `
      <article class="cast-card">
        <div class="card-badge-row"><span>${c.badge}</span></div>
        <h3 class="card-h3">${c.name}</h3>
        <div class="card-sub">${c.role}</div>
        <p class="card-body">${c.desc}</p>
        ${secretsUnlocked ? `<div class="card-secret-box">&#128275; ${c.secret}</div>` : ""}
        <p class="card-quote">${c.quote}</p>
      </article>`
      )
      .join("");
  }

  if (secretLockBtn) {
    secretLockBtn.addEventListener("click", () => {
      secretsUnlocked = !secretsUnlocked;
      secretLockBtn.innerHTML = secretsUnlocked
        ? "&#128275; HỒ SƠ MẬT (GM): ĐÃ MỞ"
        : "&#128274; HỒ SƠ MẬT (GM): ĐANG KHÓA";
      secretLockBtn.classList.toggle("studio-btn-red", secretsUnlocked);
      renderCases();
      renderCast();
    });
  }

  castFilterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      castFilter = btn.dataset.castFilter;
      castFilterBtns.forEach((b) => b.classList.toggle("is-active", b === btn));
      renderCast();
    });
  });

  const MAP_ZONES = [
    {
      zone: "ĐÔNG · PHỐ CỔ ALTSTADT",
      title: "1–6. Trung Tâm Hành Chính & Đời Sống Đêm",
      items: "Đồn Cảnh Sát Altstadt · Nhà Xác Hầm Tòa Án Cũ · Tiệm Sách Cassius & Co. · Tòa Soạn Tagblatt · Văn Phòng Công Tố & Kho Vi Phim · Phòng Trà Thiên Nga Đen.",
    },
    {
      zone: "TÂY · BẾN CẢNG SÔNG ĐEN (SCHWARZHAVEN)",
      title: "9 & 15. Hầm Thủy Sản 03, Tổ Quạ & Mỏ Neo Mù",
      items: "Hầm bảo quản ấu trùng 03 (Nơi giam giữ August ở Tập 3) · Tiệm cầm đồ chợ đen Tổ Quạ của Lukas Kováč · Quán rượu ngầm Mỏ Neo Mù · Sà lan than.",
    },
    {
      zone: "NAM · VÀNH ĐAI RỈ SÉT HÜT IV & GÜTEROF",
      title: "7, 8, 11, 12. Công Xưởng & Hiện Trường Tập 1–2",
      items: "Trạm chất thải ngầm 09 (Án 1) · Nhà kính C-4 (Án 2) · Lò luyện kim Số 4 của Kurt Denholm · Ga hàng hóa Güterof của Lotte Loris.",
    },
    {
      zone: "BẮC · ĐỒI WIGEL & ĐỒI KRANZHÜGEL",
      title: "10 & 13. Tháp Sóng Kênh 8 & Dinh Thự Vanessa",
      items: "Tháp truyền hình Đồi Gió Hú Wigel (Ena Sherley) · Dinh thự Vanessa & Hầm mộ nhà kính sau tượng Vệ Nữ không đầu (Án 4).",
    },
    {
      zone: "NGOẠI Ô · KHỐI 7–12 & TRO TÀN 1974",
      title: "14 & 16. Bệnh Viện St. Nazet & St. Leopold",
      items: "Chung cư bê tông công nhân Khối 7–12 · Bệnh viện tâm thần bỏ hoang St. Nazet (Dr. Alis Zola) · Tàn tích Trại trẻ mồ côi St. Leopold cháy năm 1974.",
    },
  ];

  const mapZonesGrid = document.getElementById("map-zones-grid");
  if (mapZonesGrid) {
    mapZonesGrid.innerHTML = MAP_ZONES.map(
      (z) => `
      <article class="map-card">
        <div class="card-badge-row"><span>${z.zone}</span></div>
        <h3 class="card-h3">${z.title}</h3>
        <p class="card-body">${z.items}</p>
      </article>`
    ).join("");
  }

  renderCases();
  renderCast();

  /* -------------------------------------------------------
     5. TRÌNH TẠO HỒ SƠ NHẬP TỊCH & COPY PROMPT
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
**Địa bàn cư trú & Lá bài Lenormand:** ${val("pf-district", "Phố cổ Altstadt | Lá 33 - Chìa Khóa")}
**Ngoại hình & Mùi hương (1994 Noir):** ${val("pf-look", "Áo măng tô dạ tối màu, mùi cà phê đen và khói than Swezan.")}
**Trang bị & Vũ khí khởi điểm:** ${val("pf-gear", "Đèn pin kim loại, sổ tay da, bộ dụng cụ chuyên môn.")}
**Bí mật đen tối & Mục tiêu trước mắt:** ${val("pf-secret", "Tìm ra vị trí giam giữ Phó cảnh sát trưởng August trước 23:59 Chủ Nhật.")}
**Câu thoại mẫu:**
> ${val("pf-quote", "“Người chết không biết nói dối, chỉ có kẻ đứng sau ống kính mới làm vậy.”")}`;

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
});