/* =========================================================
   THE SHOWRUNNER — HỒ SƠ NẠN NHÂN CÔNG KHAI & RUMOR (v17)
   (Khóa tuyệt đối spoiler theo mốc 06:15 Thứ Hai - Turn 1)
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const gridEl = document.getElementById("victims-grid");
  if (!gridEl) return;

  const cfg = window.SHOWRUNNER_CONFIG || {};
  const customImages = cfg.victimsImages || {};
  const filterBtns = document.querySelectorAll("[data-victim-filter]");
  let activeFilter = "all";

  const VICTIMS_DATA = [
    {
      id: "vic-1",
      tapeId: "tape-1",
      statusGroup: "deceased",
      cardClass: "is-deceased",
      caseCode: "HỒ SƠ TẬP 1/4 · “TÁI SINH”",
      stamp: "DECEASED // ĐÃ KHÉP ÁN",
      name: "Ottomar Burchard",
      meta: "45 tuổi · Nam · Chủ tiệm ăn bình dân “Lutz”",
      img: customImages["vic-1"] || "./assets/assets/OPW/Theshowrunner/NPC/ottomar.png",
      timelineInfo: "Mất tích 02:00 sáng (~14 ngày trước) · Tử vong sau 7 ngày",
      publicFacts:
        "Bị bắt cóc tại bãi rác cách tiệm ăn Lutz 3km khi đi đổ rác đêm. Cảnh sát phát hiện thi thể bị quấn kín bằng băng keo công nghiệp trong bể chứa dung dịch kiềm nóng (NaOH) dưới khu xử lý chất thải, xảy ra hiện tượng xà phòng hóa. Hồ sơ từng bị đồn cảnh sát ỉm đi trước truyền thông.",
      rumors: [
        {
          src: "Dân Khối 7",
          text: "Quán Lutz nổi tiếng bẩn thỉu, dầu mỡ chiên đi chiên lại, lão chủ hay chửi bới và hất nước sôi đuổi người ăn xin. Có kẻ bảo chết trong bể xà phòng đúng là quả báo.",
        },
        {
          src: "Quán Mỏ Neo Mù",
          text: "Dân bến cảng từng kháo nhau Ottomar dính nợ ngầm nên bị xã hội đen thanh trừng kín, mãi tới khi vụ thứ 2 lên tivi mới rộ tin về kẻ tự xưng The Rider.",
        },
        {
          src: "Tin đồn Tòa soạn",
          text: "Nghe đồn trước khi Ottomar chết từng có một phong thư cảnh báo nặc danh gửi tới báo chí, nhưng chẳng hiểu sao không một dòng nào được lên trang.",
        },
      ],
    },
    {
      id: "vic-2",
      tapeId: "tape-2",
      statusGroup: "deceased",
      cardClass: "is-deceased",
      caseCode: "HỒ SƠ TẬP 2/4 · “TRỨNG ẤU TRÙNG”",
      stamp: "DECEASED // KÊNH 8",
      name: "Malia Isabel Ariane",
      meta: "24 tuổi · Nữ · Ái nữ Nam tước Đá quý Ariane",
      img: customImages["vic-2"] || "./assets/assets/OPW/Theshowrunner/NPC/malia.png",
      timelineInfo: "Cướp sóng 00:00 Đêm Chủ Nhật tuần trước",
      publicFacts:
        "Xe mui trần bị chặn đầu giữa sương mù trên Đại lộ Duyên Biên (tài xế bị bắn hạ bằng 1 phát đạn súng lục). Cuộn băng mở màn được nhét trong ổ bánh mì gửi một lão ăn mày ở Khối 7. Đúng 00:00 đêm Chủ nhật tuần trước, kẻ tự xưng The Rider cướp sóng K-TV Kênh 8, phát cảnh cô ngạt chết trong buồng kính hơi nước 100°C cùng hàng trăm cành hoa loa kèn trắng.",
      rumors: [
        {
          src: "Thợ mỏ & Khối 7",
          text: "Báo chí tung hô tiểu thư là “nữ thánh từ thiện”, nhưng phu mỏ đá thạch anh của nhà Ariane bảo cô ta bịt mũi mỗi khi đi qua người nghèo và phớt lờ hàng trăm ca bệnh bụi phổi.",
        },
        {
          src: "Xì xào Altstadt",
          text: "Lời đồn từ hiện trường xe mui trần nói vỏ đạn bắn tài xế không phải hàng chợ đen thông thường — thứ đạn đó chỉ đám xạ thủ quý tộc thượng lưu mới có quyền mua.",
        },
        {
          src: "Cư dân Kênh 8",
          text: "Sau đêm cướp sóng, nhiều gia đình trùm chăn kín tivi và ném bỏ toàn bộ hoa loa kèn trắng cắm trong nhà vì tin đó là điềm báo tử thần.",
        },
      ],
    },
    {
      id: "vic-3",
      tapeId: "tape-3a",
      statusGroup: "missing",
      cardClass: "is-active-case",
      caseCode: "HỒ SƠ TẬP 3/4 · “PHÁ KÉN”",
      stamp: "MISSING // CÒN 7 NGÀY",
      name: "Matthäus August",
      meta: "52 tuổi · Nam · Phó Cảnh Sát Trưởng Swezan",
      img: customImages["vic-3"] || "./assets/assets/OPW/Theshowrunner/NPC/august.png",
      timelineInfo: "Mất tích ~12:00 trưa Chủ Nhật · Hạn chót 23:59 Chủ Nhật tới",
      publicFacts:
        "Cánh tay phải của Cảnh sát trưởng Heckler, sắp nghỉ hưu vào tháng tới. Mất tích bên hồ nước đen sau tư gia ven rừng, hiện trường chỉ còn cần câu carbon gãy đôi, dép lê và tẩu thuốc. Lúc 06:00 sáng nay, cảnh sát mổ bụng một con cá chép lai dạt bờ hồ và thu được Băng A (Tập 3): hình ảnh ông bị bịt mắt bằng băng dính đen, trói trên ghế sắt treo lơ lửng trên mặt nước tối.",
      rumors: [
        {
          src: "Cảnh sát & Bến Cảng",
          text: "Dân cảng bảo August là người giữ “sổ đen” bảo kê của đồn, bình thường rất khoái câu cá nheo khổng lồ bằng mồi sống đắt tiền.",
        },
        {
          src: "Rượu đêm Schwarzhaven",
          text: "Mấy gã say ở Mỏ Neo Mù rỉ tai nhau chuyện 3 năm trước có một công nhân trẻ bị đánh vỡ sọ trong phòng biệt giam rồi được ký giấy là tự sát — cũng như lời đồn mập mờ về 2 đứa trẻ lang thang năm xưa.",
        },
        {
          src: "Tin vỉa hè Phố Cổ",
          text: "Sáng nay Cảnh sát trưởng Heckler đập bàn quát tháo cả đồn và vội vã dựng rào phong tỏa mọi cây cầu vào Altstadt chỉ để ngăn tin tức rò rỉ thêm.",
        },
      ],
    },
    {
      id: "vic-4",
      tapeId: "tape-4",
      statusGroup: "teaser",
      cardClass: "is-teaser",
      caseCode: "CẢNH BÁO TẬP 4/4 · TEASER BĂNG A",
      stamp: "UNIDENTIFIED // CHỜ TÍN HIỆU",
      name: "[Chưa Xác Định Danh Tính]",
      meta: "Dựa theo dấu hiệu cuối Băng A (Tập 3)",
      img: customImages["vic-4"] || "",
      timelineInfo: "Chưa ghi nhận vụ mất tích mới · Dự báo sau chu kỳ 7 ngày",
      publicFacts:
        "Hiện chưa có bất kỳ nạn nhân mới nào được báo cáo mất tích. Dữ liệu công khai duy nhất đến từ giây cuối cùng của cuộn Băng A (Tập 3): hình ảnh một thỏi son màu đỏ thẫm đắt tiền đặt cạnh chiếc mũ voan đen cài mạng che mặt của góa phụ.",
      rumors: [
        {
          src: "Đồi Kranzhügel",
          text: "Giới phu nhân và các góa phụ giàu có trên Đồi Kranzhügel đang hoảng loạn cực độ; hàng loạt biệt thự thuê thêm vệ sĩ có súng đứng gác cổng suốt 24/24.",
        },
        {
          src: "Phòng trà Thiên Nga Đen",
          text: "Có lời đồn trong giới thượng lưu về những buổi tiệc đêm bí mật và các liệu pháp trẻ hóa kỳ quái mà vài quý bà giàu sụ đang lén lút theo đuổi.",
        },
      ],
    },
  ];

  function esc(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, (ch) => {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function renderVictims() {
    const list =
      activeFilter === "all"
        ? VICTIMS_DATA
        : VICTIMS_DATA.filter((v) => v.statusGroup === activeFilter);

    gridEl.innerHTML = list
      .map((v) => {
        const photoHtml = v.img
          ? `<img class="char-photo-img" src="${esc(v.img)}" alt="${esc(v.name)}" />`
          : `<div class="char-photo-placeholder">
               <span class="q-mark">${v.statusGroup === "teaser" ? "?" : v.id === "vic-3" ? "!" : "✕"}</span>
               <span class="q-hint">${v.statusGroup === "teaser" ? "NO TARGET YET" : "ARCHIVE PHOTO"}</span>
             </div>`;

        const rumorsHtml = v.rumors
          .map(
            (r) => `
            <li>
              <span class="rumor-src">[${esc(r.src)}]</span>
              <span>${esc(r.text)}</span>
            </li>`
          )
          .join("");

        return `
        <article class="victim-dossier-card ${v.cardClass}">
          <span class="pushpin" aria-hidden="true"></span>
          <div class="victim-card-top">
            <span class="victim-case-code">${esc(v.caseCode)}</span>
            <span class="victim-status-stamp">${esc(v.stamp)}</span>
          </div>

          <div class="victim-card-body">
            <div class="victim-photo-col">
              <div class="victim-photo-box">
                ${photoHtml}
                <span class="char-cam-tag">${v.statusGroup === "missing" ? "ACTIVE // 7D" : "CASE FILE"}</span>
              </div>
              <div class="victim-time-note">${esc(v.timelineInfo)}</div>
            </div>

            <div class="victim-info-col">
              <h3 class="victim-name">${esc(v.name)}</h3>
              <div class="victim-role">${esc(v.meta)}</div>

              <div class="victim-section-box">
                <h4>I // THÔNG TIN CÔNG KHAI</h4>
                <p>${esc(v.publicFacts)}</p>
              </div>

              <div class="victim-rumors-box">
                <h4>II // TIN ĐỒN &amp; LỜI XÌ XÀO THỊ TRẤN</h4>
                <ul class="victim-rumor-list">${rumorsHtml}</ul>
              </div>
            </div>
          </div>

          <div class="victim-card-foot">
            <button class="studio-btn" type="button" data-jump-tab="tapes">&#127902; ĐỐI CHIẾU KHO BĂNG</button>
            <button class="studio-btn studio-btn-red" type="button" data-jump-tab="board">&#128204; THẢO LUẬN VỤ ÁN</button>
          </div>
        </article>`;
      })
      .join("");
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      activeFilter = btn.dataset.victimFilter;
      filterBtns.forEach((b) => b.classList.toggle("is-active", b === btn));
      renderVictims();
    });
  });

  gridEl.addEventListener("click", (e) => {
    const jumpBtn = e.target.closest("[data-jump-tab]");
    if (!jumpBtn) return;
    const targetTab = document.querySelector(`.desk-tab[data-tab="${jumpBtn.dataset.jumpTab}"]`);
    if (targetTab) {
      targetTab.click();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  renderVictims();
});