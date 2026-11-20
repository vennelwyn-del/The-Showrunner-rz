/* =========================================================
   THE SHOWRUNNER (1994) — FILE CẤU HÌNH CỦA NGƯỜI TẠO WEB
   Người xem trên web KHÔNG thấy các ô chỉnh sửa này.
   Bạn chỉ cần dán link trực tiếp vào các mục bên dưới.
   ========================================================= */

window.SHOWRUNNER_CONFIG = {
  /* -------------------------------------------------------
     1. ẢNH NỀN (BACKGROUND) CỦA GIAO DIỆN 2
     ------------------------------------------------------- */
  background: {
    imageUrl: "", // <-- Dán link ảnh nền vào đây (VD: "assets/bg.jpg" hoặc "https://...")
    bwAndWireframe: true, // true = phủ đen trắng + khung dây đỏ | false = giữ màu gốc của ảnh
    dimOpacity: 0.22, // Độ tối phủ từ 0.05 (rất sáng) đến 0.80 (rất tối)
  },

  /* -------------------------------------------------------
     2. NHẠC NỀN / RADIO (HIỆN TRONG NÚT RADIO GÓC TRÊN PHẢI)
     Dán link file âm thanh trực tiếp (.mp3 / .ogg / .wav)
     ------------------------------------------------------- */
  music: [
    // Ví dụ (bỏ dấu // ở đầu dòng khi bạn đã có link thật):
    // { id: "track-1", freq: "TAPE 01", title: "Swezan Rain (Theme)", url: "assets/theme.mp3" },
    // { id: "track-2", freq: "TAPE 02", title: "Midnight Jazz", url: "https://.../music.mp3" },
  ],

  /* -------------------------------------------------------
     3. LINK ẢNH CÁC KHU VỰC TRONG THỊ TRẤN SWEZAN
     ------------------------------------------------------- */
  locations: [
    {
      id: "altstadt",
      zone: "ĐÔNG · TRUNG TÂM CỔ",
      title: "Phố Cổ Altstadt",
      imageUrl: "", // <-- Dán link ảnh Phố Cổ Altstadt tại đây
      desc: "Kiến trúc đá sa thạch thế kỷ 19, Đồn Cảnh sát, Tòa Thị chính, Tòa soạn Tagblatt, phòng trà Thiên Nga Đen và hiệu sách Cassius & Co.",
    },
    {
      id: "harbor",
      zone: "TÂY · ĐƯỜNG THỦY",
      title: "Bến Cảng Sông Đen (Schwarzhaven)",
      imageUrl: "", // <-- Dán link ảnh Bến Cảng Sông Đen tại đây
      desc: "Bãi than ướt sũng, sà lan chở hàng đêm, tiệm cầm đồ Tổ Quạ và quán rượu ngầm Mỏ Neo Mù nồng mùi rượu gin và thuốc lá sợi.",
    },
    {
      id: "hut4",
      zone: "NAM · VÀNH ĐAI RỈ SÉT",
      title: "Tổ Hợp Công Nghiệp Hüt IV & Ga Güterof",
      imageUrl: "", // <-- Dán link ảnh Nhà máy Hüt IV / Ga tàu cũ tại đây
      desc: "Những ống khói lò luyện kim sừng sững, phân xưởng dệt cũ và bãi toa xe lửa bỏ không giữa rừng thông ẩm ướt.",
    },
    {
      id: "hills",
      zone: "BẮC · VÙNG ĐỒI",
      title: "Đồi Kranzhügel & Đồi Gió Hú Wigel",
      imageUrl: "", // <-- Dán link ảnh Đồi Kranzhügel / Tháp sóng Wigel tại đây
      desc: "Một bên là những biệt thự quý tộc sau cổng sắt rèn; bên kia là tháp tiếp sóng truyền hình K-TV Kênh 8 giữa sương mù.",
    },
    {
      id: "blocks",
      zone: "NGOẠI Ô · KHU LAO ĐỘNG",
      title: "Chung Cư Công Nhân Khối 7–12",
      imageUrl: "", // <-- Dán link ảnh Khu chung cư Khối 7-12 tại đây
      desc: "Những dãy nhà bê tông xám xịt giăng đầy dây phơi và ăng-ten râu thỏ, nơi công nhân tụ tập quanh thùng phuy đốt lửa.",
    },
  ],

  /* -------------------------------------------------------
     4. CÁC BĂNG VIDEO ĐÃ ĐƯỢC CÔNG BỐ (CHỈ THÔNG TIN CÔNG KHAI)
     Có thể điền thêm thumbnailUrl (ảnh bìa) & videoUrl (.mp4)
     ------------------------------------------------------- */
  videos: [
    {
      id: "tape-2",
      code: "BROADCAST // TẬP 2/4",
      status: "ĐÃ CƯỚP SÓNG TRỰC TIẾP K-TV KÊNH 8",
      title: "“Khởi nguồn tội ác: Trứng ấu trùng”",
      duration: "05:20 · VHS 4:3",
      date: "00:00 CHỦ NHẬT TUẦN TRƯỚC",
      thumbnailUrl: "", // <-- Dán link ảnh bìa video Tập 2 (nếu có)
      videoUrl: "", // <-- Dán link file video .mp4 Tập 2 (nếu có)
      summary:
        "Đoạn băng bị kẻ tự xưng The Rider chiếm sóng truyền hình Kênh 8 phát thẳng vào hàng vạn hộ dân Swezan, ghi lại cái chết ngột ngạt trong buồng kính hơi nước của tiểu thư Malia Ariane.",
      transcript:
        "“Sự thanh cao của các người chỉ chịu được 100 độ C. Hãy chờ đợi... mầm mống tội ác tiếp theo sẽ đến từ chính những kẻ đang mang phù hiệu công lý.”",
    },
    {
      id: "tape-3a",
      code: "LEAKED // BĂNG A — TẬP 3/4",
      status: "MỚI PHÁT HIỆN · 06:00 SÁNG 30/11/1994",
      title: "“Khởi nguồn tội ác: Phá kén” (Lời thách thức)",
      duration: "03:30 · VHS-C ĐEN TRẮNG",
      date: "30/11/1994 · 06:00",
      thumbnailUrl: "", // <-- Dán link ảnh bìa Băng A Tập 3 (nếu có)
      videoUrl: "", // <-- Dán link file video .mp4 Tập 3 (nếu có)
      summary:
        "Cuộn băng vừa được thu giữ sáng nay sau vụ mất tích của Phó Cảnh sát trưởng Matthäus August. Khung hình đen trắng quay cảnh ông bị bịt mắt, trói trên ghế sắt phía trên mặt nước tối.",
      transcript:
        "“Con ấu trùng đã phá kén... 7 ngày, hoặc một bộ xương trắng. Đồng hồ đếm ngược đến 23:59 đêm Chủ Nhật đã bắt đầu.”",
    },
    {
      id: "tape-1",
      code: "RUMOR // HỒ SƠ TẬP 1/4",
      status: "TIN ĐỒN BỊ NIÊM PHONG",
      title: "“Khởi nguồn tội ác: Tái sinh”",
      duration: "KHÔNG RÕ THỜI LƯỢNG",
      date: "~14 NGÀY TRƯỚC",
      thumbnailUrl: "", // <-- Dán link ảnh bìa (nếu có)
      videoUrl: "", // <-- Dán link video (nếu có)
      summary:
        "Trước khi Kênh 8 bị cướp sóng, từng có tin đồn về một cuộn băng mở màn xuất hiện tại tiệm ăn nhỏ Lutz sau khi chủ tiệm Ottomar Burchard mất tích. Hồ sơ này chưa từng được công bố rộng rãi.",
      transcript:
        "“Băng từ nằm trong diện lưu trữ kín tại Đồn Cảnh sát Altstadt.”",
    },
    {
      id: "tape-4",
      code: "CARRIER // TÍN HIỆU CHỜ",
      status: "NO SIGNAL · CHƯA CÔNG BỐ",
      title: "Tập 4/4 — [DỮ LIỆU TRỐNG]",
      duration: "--:-- · 50Hz STATIC",
      date: "ĐANG CHỜ...",
      thumbnailUrl: "",
      videoUrl: "",
      summary:
        "Không có hình ảnh. Màn hình chỉ phát ra tiếng rít rè trắng 50Hz kéo dài.",
      transcript: "“Vở kịch gồm bốn hồi. Hồi cuối cùng vẫn chưa kéo màn.”",
    },
  ],
};