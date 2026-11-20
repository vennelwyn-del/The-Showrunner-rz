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
     4. DỮ LIỆU CÔNG KHAI (CHỈ HIỂN THỊ THÔNG TIN BỀ MẶT)
     ------------------------------------------------------- */
  const WORLD_EVENTS = [
    {
      tag: "BỐI CẢNH THỜI ĐẠI · 1994",
      title: "Thung Lũng Công Nghiệp & Màn Ảnh CRT",
      body: "Swezan nằm lọt thỏm giữa khói than, mưa axit và các xưởng dệt suy thoái cuối thời hậu Chiến tranh Lạnh — nơi hạ tầng công nghiệp cũ va chạm với băng từ VHS, máy đánh chữ và tivi đèn hình.",
    },
    {
      tag: "TIN ĐỒN & DƯ LUẬN",
      title: "Hội Chứng Sợ Màn Hình",
      body: "Sau vụ cướp sóng đài truyền hình K-TV Kênh 8 đêm Chủ nhật tuần trước, nhiều gia đình tại Altstadt dùng khăn dạ trùm kín tivi vào ban đêm vì sợ tiếng rè rít trắng lúc 0 giờ.",
    },
    {
      tag: "KHỞI ĐIỂM · 30/11/1994",
      title: "Biến Cố Tại Đồn Cảnh Sát Altstadt",
      body: "Phó Cảnh sát trưởng Matthäus August mất tích 12 tiếng. Sáng nay, một cuộn băng VHS-C xuất hiện cùng lời tuyên án kỳ bí của kẻ tự xưng The Rider, đẩy thị trấn vào cơn hoảng loạn.",
    },
  ];

  const WORLD_ROLES = [
    {
      tag: "THÂN PHẬN 01 · 1.200 MARK",
      title: "Thanh Tra Cấp Cao / Đặc Phái Viên",
      body: "Mang lệnh trưng dụng từ thủ đô và vũ khí công vụ. Có quyền tiếp cận hiện trường phong tỏa nhưng dễ bị cảnh sát địa phương dè chừng và dân nghèo nghi kỵ.",
    },
    {
      tag: "THÂN PHẬN 02 · 300 MARK",
      title: "Thám Tử Tư / Cựu Sĩ Quan",
      body: "Không có thẩm quyền pháp lý, nhưng hoàn toàn tự do lặn ngụp dưới bến cảng đêm, giao dịch chợ đen và lần theo những ngõ tối ngoài giờ giới nghiêm.",
    },
    {
      tag: "THÂN PHẬN 03 · 1.500 MARK",
      title: "Bác Sĩ Pháp Y Độc Lập",
      body: "Làm chủ phòng giải phẫu dưới hầm Tòa án Cũ. Tiếng nói khoa học mang tính quyết định, nhưng thiếu quyền cưỡng chế và dễ gặp áp lực từ giới chức.",
    },
    {
      tag: "THÂN PHẬN 04 · 600 MARK",
      title: "Phóng Viên Điều Tra",
      body: "Sở hữu thẻ nhà báo, máy ảnh 35mm và mạng lưới tin đồn khắp thung lũng. Ngòi bút có thể xoay chuyển dư luận nhưng dễ bị cả hai phía cảnh giác.",
    },
    {
      tag: "THÂN PHẬN 05 · 60 MARK",
      title: "Dân Thường / Thợ Thuyền Bản Địa",
      body: "Sở hữu lớp vỏ bọc vô hình hoàn hảo để hòa vào dòng người biểu tình và khu chung cư lao động, dùng trực giác và quan hệ xóm giềng để sinh tồn.",
    },
  ];

  const WORLD_DISTRICTS = [
    {
      zone: "ĐÔNG · TRUNG TÂM CỔ",
      title: "Phố Cổ Altstadt",
      items: "Kiến trúc đá sa thạch thế kỷ 19, Đồn Cảnh sát, Tòa Thị chính, Tòa soạn Tagblatt, phòng trà Thiên Nga Đen và các tiệm sách yên tĩnh bên bờ kênh.",
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
      items: "Một bên là những biệt thự quý tộc tách biệt sau cổng sắt rèn; bên kia là tháp tiếp sóng truyền hình K-TV Kênh 8 giữa sương mù.",
    },
    {
      zone: "NGOẠI Ô · KHU LAO ĐỘNG",
      title: "Chung Cư Khối 7–12",
      items: "Những dãy nhà bê tông xám xịt giăng đầy dây phơi và ăng-ten râu thỏ, nơi công nhân tụ tập quanh thùng phuy đốt lửa sưởi ấm.",
    },
  ];

  // CHỈ HIỂN THỊ THÔNG TIN CÔNG KHAI CỦA NHÂN VẬT (TUYỆT ĐỐI KHÔNG SPOIL)
  const PUBLIC_CAST = [
    {
      group: "official",
      badge: "BÍ ẨN · K-TV KÊNH 08",
      name: "The Rider",
      role: "Kẻ tự xưng “Biên Kịch” trên sóng truyền hình",
      desc: "Chưa từng lộ mặt. Chỉ xuất hiện qua khung hình VHS 4:3 đen trắng cùng đôi găng tay da đen và giọng nói biến âm trầm đục tần số thấp.",
      quote: "“Hãy ngồi xuống trước màn hình và cùng xem vở kịch của thung lũng này.”",
    },
    {
      group: "official",
      badge: "TÒA THỊ CHÍNH",
      name: "Julian Viktor von Brandt (31t)",
      role: "Công Tố Viên Đặc Biệt",
      desc: "Diện mạo sắc lạnh trong âu phục 3 mảnh xanh than, cặp kính nửa viền và đồng hồ bỏ túi bạch kim. Đại diện cho quyền lực tư pháp đang giám sát toàn bộ cuộc khủng hoảng.",
      quote: "“Công lý ở thung lũng này nằm dưới ngòi bút ký lệnh truy tố của tôi.”",
    },
    {
      group: "official",
      badge: "ĐỒN CẢNH SÁT ALTSTADT",
      name: "Jaxson Heckler (58t) & Ian Alix (22t)",
      role: "Cảnh Sát Trưởng & Tân Binh",
      desc: "Heckler bảo thủ, nóng nảy trong làn khói Chesterfield dày đặc; đối lập hoàn toàn với cậu tân binh Ian Alix vụng về trong chiếc áo măng tô vàng mù tạt quá khổ.",
      quote: "“Ở cái thị trấn này, luật pháp là tao!”",
    },
    {
      group: "official",
      badge: "HẦM TÒA ÁN CŨ",
      name: "Bác sĩ Eva Livingston (34t)",
      role: "Chuyên Viên Pháp Y",
      desc: "Lạnh lùng, chuẩn xác, mái tóc vàng cắt ngắn và chiếc blouse trắng ám mùi formol cùng tinh dầu bạc hà cay nồng.",
      quote: "“Người sống nói dối để tự cứu mình; chỉ có những cái xác trên bàn thép là không.”",
    },
    {
      group: "official",
      badge: "NHẬT BÁO SWEZAN TAGBLATT",
      name: "Isabel Werner (29t)",
      role: "Phóng Viên Hiện Trường",
      desc: "Sắc sảo và tham vọng trong áo măng tô da lộn vàng cát, luôn mang theo chiếc Walkman ghi âm và mùi thuốc lá vani Black Devil.",
      quote: "“Cảnh sát cần báo cáo, còn tôi cần sự thật để đưa lên trang nhất.”",
    },
    {
      group: "town",
      badge: "BẾN CẢNG SCHWARZHAVEN",
      name: "Lukas “Raven” Kováč (29t)",
      role: "Chủ Tiệm Cầm Đồ & Xưởng Cơ Khí “Tổ Quạ”",
      desc: "Cựu lính giải ngũ phong trần với vết sẹo ngang mày trái, tấm thẻ bài Dog-tag bạc trên ngực và mùi dầu súng quyện thuốc lá Lucky Strike.",
      quote: "“Ở bến sông đen ngòm này, lòng tốt không mua được đạn đâu.”",
    },
    {
      group: "town",
      badge: "PHÒNG TRÀ THIÊN NGA ĐEN",
      name: "Clara Evelyne Moreau (26t)",
      role: "Nữ Danh Ca Jazz & Chủ Phòng Trà",
      desc: "Mái tóc đỏ rượu vang cổ điển, trâm cài trăng lưỡi liềm và găng tay lụa dài; giọng hát trầm khàn làm say lòng giới thượng lưu mỗi đêm mưa.",
      quote: "“Ngồi xuống đây đi, để tôi rót cho một ly Bordeaux, đêm nay ngoài kia lạnh lắm.”",
    },
    {
      group: "town",
      badge: "PHỐ CỔ ALTSTADT",
      name: "Alistair Cassius (28t)",
      role: "Chủ Tiệm Cà Phê Sách “Cassius & Co.”",
      desc: "Thiếu gia trầm lặng của một dòng họ buôn bán lâu đời, thích đọc bi kịch cổ Hy Lạp, pha trà Earl Grey và hầu như chẳng bao giờ rời khỏi hiệu sách ấm cúng của mình.",
      quote: "“Ở đây, ít nhất các trang sách không biết làm tổn thương ai bao giờ.”",
    },
    {
      group: "town",
      badge: "CÔNG XƯỞNG & NGHIỆP ĐOÀN",
      name: "Kurt Denholm (52t) · Lotte Loris (45t)",
      role: "Chủ Lò Luyện Kim Hüt IV · Thủ Lĩnh Công Nhân",
      desc: "Hai thái cực đối đầu kịch liệt nhất của thung lũng: một ông chủ nhà máy sắt đá giữa những xưởng thép cũ và người đàn bà đanh thép dẫn đầu các cuộc bãi công.",
      quote: "“Bọn tao đã đổ mồ hôi cho từng tấc đất ở Swezan này!”",
    },
    {
      group: "town",
      badge: "ĐỒI WIGEL · ST. NAZET · KRANZHÜGEL",
      name: "Ena Sherley · Dr. Alis Zola · Traudl Vanessa",
      role: "Kỹ Thuật Viên K-TV · Cựu Bác Sĩ · Quý Bà Kranzhügel",
      desc: "Ena lập dị bên những cuộn dây tín hiệu trên đồi gió hú; bác sĩ Zola u ám với cặp mắt dị sắc; và góa phụ Vanessa sống khép kín sau cánh cổng dinh thự hoa hồng.",
      quote: "“Tín hiệu không bao giờ nói dối... chỉ có âm thanh là chứa đầy tạp âm.”",
    },
  ];

  const worldEventsGrid = document.getElementById("world-events-grid");
  const worldRolesGrid = document.getElementById("world-roles-grid");
  const worldDistrictsGrid = document.getElementById("world-districts-grid");

  if (worldEventsGrid) {
    worldEventsGrid.innerHTML = WORLD_EVENTS.map(
      (e) => `
      <article class="dossier-card">
        <div class="card-badge-row"><span>${e.tag}</span></div>
        <h3 class="card-h3">${e.title}</h3>
        <p class="card-body">${e.body}</p>
      </article>`
    ).join("");
  }

  if (worldRolesGrid) {
    worldRolesGrid.innerHTML = WORLD_ROLES.map(
      (r) => `
      <article class="dossier-card">
        <div class="card-badge-row"><span>${r.tag}</span></div>
        <h3 class="card-h3">${r.title}</h3>
        <p class="card-body">${r.body}</p>
      </article>`
    ).join("");
  }

  if (worldDistrictsGrid) {
    worldDistrictsGrid.innerHTML = WORLD_DISTRICTS.map(
      (d) => `
      <article class="map-card">
        <div class="card-badge-row"><span>${d.zone}</span></div>
        <h3 class="card-h3">${d.title}</h3>
        <p class="card-body">${d.items}</p>
      </article>`
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
});