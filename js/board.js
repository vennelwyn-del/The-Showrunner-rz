/* =========================================================
   THE SHOWRUNNER — SWEZAN-NET BBS & BẢNG TIN CƯ DÂN (v17)
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const workspace = document.getElementById("board-workspace");
  const syncBadge = document.getElementById("board-sync-status");
  if (!workspace) return;

  const cfg = window.SHOWRUNNER_CONFIG || {};
  const fbCfg = cfg.firebase || {};
  const FB_URL = String(fbCfg.url || "").replace(/\/+$/, "");
  const BOARD_NODE = String(fbCfg.boardNode || "showrunner_board").replace(/^\/+|\/+$/g, "");
  const GM_PIN = String(fbCfg.gmPin || "1994");

  const LS_POSTS = "sr_board_local_posts_v1";
  const LS_MY_IDS = "sr_board_my_ids_v1";
  const LS_LIKES = "sr_board_likes_v1";

  const NPC_STARTERS = [
    {
      id: "npc_isabel",
      isNpc: true,
      name: "Isabel Werner",
      role: "Phóng viên · Swezan Tagblatt",
      tag: "KÊNH 08",
      time: "30/11/1994 · 06:20",
      text: "Tòa soạn vừa nhận được tin về cuộn Băng A tìm thấy ở hồ nước đen. Ai ở quanh Đồn Cảnh Sát hoặc Bến Cảng sáng nay có nghe thấy gì bất thường về Phó cảnh sát trưởng August xin để lại manh mối dưới đây.",
      likes: 6,
      replies: [],
    },
    {
      id: "npc_dock",
      isNpc: true,
      name: "Thợ bốc vác giấu tên",
      role: "Công nhân · Bến Cảng Sông Đen",
      tag: "TIN ĐỒN",
      time: "30/11/1994 · 05:45",
      text: "Đêm qua tầm 1 giờ có một chiếc sedan đen không biển số đậu sát Xí nghiệp Thủy Sản Cũ. Mấy gã trên cầu cảng còn đồn tiệm Tổ Quạ mới nhập được linh kiện đầu thu sóng lạ.",
      likes: 4,
      replies: [],
    },
    {
      id: "npc_block7",
      isNpc: true,
      name: "Cư dân #409",
      role: "Dân thường · Chung cư Khối 7",
      tag: "GIẢ THUYẾT",
      time: "30/11/1994 · 04:10",
      text: "Cả tầng nhà tôi lấy chăn dạ trùm kín tivi hết rồi. Không hiểu sao tên The Rider lại chọn đúng 00:00 Chủ Nhật tuần trước để phát đoạn băng buồng kính lên Kênh 8. Hắn chắc chắn phải có người quen ở Trạm Sóng Đồi Wigel.",
      likes: 9,
      replies: [],
    },
  ];

  let activeFilter = "ALL";
  let gmUnlocked = false;
  let openReplyId = null;
  let remotePosts = [];
  let npcRepliesMap = {};
  let npcLikesMap = {};
  let isOnline = false;

  function esc(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, (ch) => {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function getJsonLS(key, fallback) {
    try {
      const val = JSON.parse(localStorage.getItem(key) || "null");
      return val == null ? fallback : val;
    } catch (e) {
      return fallback;
    }
  }

  function setJsonLS(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {}
  }

  function format1994Time() {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `30/11/1994 · ${hh}:${mm}`;
  }

  function setSyncState(online, msg) {
    isOnline = online;
    if (!syncBadge) return;
    syncBadge.textContent = msg;
    syncBadge.classList.toggle("is-online", online);
  }

  function readProfileTabDefaults() {
    const getVal = (id) => {
      const el = document.getElementById(id);
      return el && el.value ? el.value.trim() : "";
    };
    const name = getVal("pf-name");
    const occ = getVal("pf-occupation");
    const arch = getVal("pf-archetype");
    const dist = getVal("pf-district");
    const roleParts = [occ || arch, dist].filter(Boolean);
    return {
      name,
      role: roleParts.join(" · "),
    };
  }

  function buildShell() {
    const def = readProfileTabDefaults();
    workspace.innerHTML = `
      <aside class="board-bbs-terminal">
        <div class="bbs-screen-head">
          <span>SWEZAN-NET BBS v0.9</span>
          <span>2400 BAUD // 1994</span>
        </div>

        <form id="bbs-post-form" class="bbs-form">
          <div class="bbs-field">
            <label for="bbs-name">TÊN NGƯỜI GỬI (CƯ DÂN / ĐIỀU TRA VIÊN)</label>
            <input id="bbs-name" type="text" maxlength="40" placeholder="VD: Lukas / Cư dân Khối 9..." value="${esc(def.name)}" />
          </div>

          <div class="bbs-field">
            <label for="bbs-role">THÂN PHẬN &amp; ĐỊA BÀN</label>
            <input id="bbs-role" type="text" maxlength="60" placeholder="VD: Thợ cơ khí · Bến Cảng / Thanh tra..." value="${esc(def.role)}" />
          </div>

          <div class="bbs-checkbox-row">
            <label><input id="bbs-anon" type="checkbox" /> Đăng ẩn danh (Cư dân giấu mặt)</label>
            <button id="bbs-sync-profile-btn" class="bbs-mini-btn" type="button">Lấy từ Tab 05</button>
          </div>

          <div class="bbs-field">
            <label for="bbs-tag">CHUYÊN MỤC TIN BÁO</label>
            <select id="bbs-tag">
              <option value="GIẢ THUYẾT">[GIẢ THUYẾT PHÁ ÁN]</option>
              <option value="TIN ĐỒN">[TIN ĐỒN ĐƯỜNG PHỐ]</option>
              <option value="NHÂN CHỨNG">[NHÂN CHỨNG HIỆN TRƯỜNG]</option>
              <option value="KÊNH 08">[BĂNG TỪ &amp; K-TV KÊNH 08]</option>
            </select>
          </div>

          <div class="bbs-field">
            <label for="bbs-text">NỘI DUNG THẢO LUẬN / MANH MỐI</label>
            <textarea id="bbs-text" rows="4" maxlength="500" placeholder="Nhập giả thuyết, tin đồn hoặc lời khai của bạn tại Swezan..."></textarea>
          </div>

          <button class="bbs-submit-btn" type="submit">&#9654; PHÁT TÍN HIỆU LÊN BẢNG TIN</button>
        </form>

        <p class="bbs-terminal-note">
          * Tín hiệu phát đi sẽ được in thành phiếu tin đính trên Bảng Tin Phố Cổ. Không dùng lời lẽ công kích ngoài nhập vai.
        </p>
      </aside>

      <div class="board-cork-column">
        <div class="board-filter-bar">
          <div class="cast-filter-group">
            <button class="studio-btn is-active" type="button" data-board-filter="ALL">TẤT CẢ</button>
            <button class="studio-btn" type="button" data-board-filter="GIẢ THUYẾT">GIẢ THUYẾT</button>
            <button class="studio-btn" type="button" data-board-filter="TIN ĐỒN">TIN ĐỒN</button>
            <button class="studio-btn" type="button" data-board-filter="NHÂN CHỨNG">NHÂN CHỨNG</button>
            <button class="studio-btn" type="button" data-board-filter="KÊNH 08">KÊNH 08</button>
          </div>

          <div class="cast-filter-group">
            <button id="board-refresh-btn" class="studio-btn" type="button">&#8635; TẢI LẠI</button>
            <button id="board-gm-btn" class="studio-btn" type="button" title="Mở khóa xóa bài cho GM">GM</button>
          </div>
        </div>

        <div id="board-posts-list" class="board-posts-list"></div>
      </div>
    `;
  }

  function normalizeReplies(raw) {
    if (!raw || typeof raw !== "object") return [];
    return Object.entries(raw)
      .filter(([, v]) => v && v.text)
      .map(([k, v]) => ({ id: k, ...v }))
      .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
  }

  async function fetchBoardData() {
    if (!FB_URL) {
      remotePosts = getJsonLS(LS_POSTS, []);
      setSyncState(false, "LOCAL MODE // CHƯA CÓ FIREBASE");
      renderPosts();
      return;
    }

    try {
      const res = await fetch(`${FB_URL}/${BOARD_NODE}.json`);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = (await res.json()) || {};

      const rawPosts = data.posts && typeof data.posts === "object" ? data.posts : {};
      remotePosts = Object.entries(rawPosts)
        .filter(([, v]) => v && v.text)
        .map(([k, v]) => ({
          id: k,
          isNpc: false,
          name: v.name || "Ẩn danh",
          role: v.role || "Cư dân Swezan",
          tag: v.tag || "TIN ĐỒN",
          time: v.time || "30/11/1994",
          text: v.text,
          likes: typeof v.likes === "number" ? v.likes : 0,
          createdAt: v.createdAt || 0,
          replies: normalizeReplies(v.replies),
        }))
        .sort((a, b) => b.createdAt - a.createdAt);

      npcRepliesMap = data.npc_replies && typeof data.npc_replies === "object" ? data.npc_replies : {};
      npcLikesMap = data.npc_likes && typeof data.npc_likes === "object" ? data.npc_likes : {};

      setJsonLS(LS_POSTS, remotePosts);
      setSyncState(true, "ONLINE // FIREBASE RTDB 1994");
    } catch (err) {
      remotePosts = getJsonLS(LS_POSTS, []);
      const reason = String((err && err.message) || "LỖI MẠNG");
      const label = reason.includes("401")
        ? "LỖI 401 // BỊ CHẶN RULES FIREBASE"
        : reason.includes("404")
        ? "LỖI 404 // SAI LINK FIREBASE"
        : `OFFLINE CACHE // ${reason}`;
      setSyncState(false, label);
    }

    renderPosts();
  }

  function getMergedPosts() {
    const npcPrepared = NPC_STARTERS.map((npc) => ({
      ...npc,
      likes: typeof npcLikesMap[npc.id] === "number" ? npcLikesMap[npc.id] : npc.likes,
      replies: normalizeReplies(npcRepliesMap[npc.id]),
    }));
    const all = [...remotePosts, ...npcPrepared];
    return activeFilter === "ALL" ? all : all.filter((p) => p.tag === activeFilter);
  }

  function renderPosts() {
    const listEl = document.getElementById("board-posts-list");
    if (!listEl) return;

    const myIds = getJsonLS(LS_MY_IDS, []);
    const likedMap = getJsonLS(LS_LIKES, {});
    const items = getMergedPosts();

    if (items.length === 0) {
      listEl.innerHTML = `<div class="board-empty-note">Chưa có tin báo nào trong chuyên mục này. Hãy là người đầu tiên phát tín hiệu từ máy BBS bên cạnh!</div>`;
      return;
    }

    listEl.innerHTML = items
      .map((p, idx) => {
        const isLiked = Boolean(likedMap[p.id]);
        const canDelete = !p.isNpc && (gmUnlocked || myIds.includes(p.id));
        const repliesHtml = (p.replies || [])
          .map(
            (r) => `
            <div class="board-reply-item">
              <div class="board-reply-head">
                <strong>${esc(r.name)}</strong>
                <span>[${esc(r.role || "Cư dân")}]</span>
                <em>${esc(r.time || "")}</em>
              </div>
              <p>${esc(r.text)}</p>
            </div>`
          )
          .join("");

        const replyBoxHtml =
          openReplyId === p.id
            ? `
            <div class="board-reply-box" data-reply-form="${esc(p.id)}">
              <div class="board-reply-inputs">
                <input type="text" class="reply-name-in" maxlength="40" placeholder="Tên (để trống = Ẩn danh)" />
                <input type="text" class="reply-role-in" maxlength="50" placeholder="Thân phận (VD: Cư dân Phố Cổ)" />
              </div>
              <textarea class="reply-text-in" rows="2" maxlength="350" placeholder="Nhập phản hồi nối đuôi..."></textarea>
              <div class="board-reply-actions">
                <button class="studio-btn studio-btn-red" type="button" data-send-reply="${esc(p.id)}" data-is-npc="${p.isNpc ? "1" : "0"}">GỬI PHẢN HỒI</button>
                <button class="studio-btn" type="button" data-cancel-reply="1">HỦY</button>
              </div>
            </div>`
            : "";

        return `
        <article class="board-note-card ${p.isNpc ? "is-npc" : ""}">
          <span class="pushpin" aria-hidden="true"></span>
          <div class="board-note-head">
            <span class="board-msg-code">MSG #${String(idx + 1).padStart(3, "0")} // ${esc(p.time)}</span>
            <span class="board-tag-stamp">${esc(p.tag)}</span>
          </div>

          <div class="board-note-author">
            <strong>${esc(p.name)}</strong>
            <span class="board-role-pill">${esc(p.role)}</span>
          </div>

          <p class="board-note-body">${esc(p.text)}</p>

          ${repliesHtml ? `<div class="board-replies-wrap">${repliesHtml}</div>` : ""}

          <div class="board-note-foot">
            <button class="board-act-btn ${isLiked ? "is-liked" : ""}" type="button" data-like-id="${esc(p.id)}" data-is-npc="${p.isNpc ? "1" : "0"}">
              &#9650; ĐỒNG TÌNH (${p.likes || 0})
            </button>
            <button class="board-act-btn" type="button" data-open-reply="${esc(p.id)}">
              &#8627; PHẢN HỒI (${(p.replies || []).length})
            </button>
            ${
              canDelete
                ? `<button class="board-act-btn is-del" type="button" data-del-id="${esc(p.id)}">&#10005; XÓA</button>`
                : ""
            }
          </div>

          ${replyBoxHtml}
        </article>`;
      })
      .join("");
  }

  async function submitNewPost(e) {
    e.preventDefault();
    const submitBtn = workspace.querySelector(".bbs-submit-btn");
    if (submitBtn && submitBtn.disabled) return;
    const anonEl = document.getElementById("bbs-anon");
    const nameEl = document.getElementById("bbs-name");
    const roleEl = document.getElementById("bbs-role");
    const tagEl = document.getElementById("bbs-tag");
    const textEl = document.getElementById("bbs-text");

    const text = textEl ? textEl.value.trim() : "";
    if (!text) {
      alert("Bạn chưa nhập nội dung tin báo!");
      return;
    }

    const isAnon = Boolean(anonEl && anonEl.checked);
    const randCode = Math.floor(100 + Math.random() * 900);
    const name = isAnon ? `Ẩn danh #${randCode}` : (nameEl && nameEl.value.trim()) || `Cư dân #${randCode}`;
    const role = isAnon
      ? "Cư dân giấu mặt · Swezan"
      : (roleEl && roleEl.value.trim()) || "Cư dân thị trấn";

    const newPost = {
      name,
      role,
      tag: tagEl ? tagEl.value : "TIN ĐỒN",
      time: format1994Time(),
      text,
      likes: 0,
      createdAt: Date.now(),
    };

    if (textEl) textEl.value = "";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "ĐANG PHÁT TÍN HIỆU...";
    }
    if (FB_URL && isOnline) {
      try {
        const res = await fetch(`${FB_URL}/${BOARD_NODE}/posts.json`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newPost),
        });
        const saved = await res.json();
        if (saved && saved.name) {
          const myIds = getJsonLS(LS_MY_IDS, []);
          myIds.push(saved.name);
          setJsonLS(LS_MY_IDS, myIds);
        }
        await fetchBoardData();
        return;
      } catch (err) {
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = "&#9654; PHÁT TÍN HIỆU LÊN BẢNG TIN";
        }
      }
    }
    

    const localId = `loc_${Date.now()}`;
    const myIds = getJsonLS(LS_MY_IDS, []);
    myIds.push(localId);
    setJsonLS(LS_MY_IDS, myIds);
    remotePosts.unshift({ id: localId, isNpc: false, replies: [], ...newPost });
    setJsonLS(LS_POSTS, remotePosts);
    renderPosts();
  }

  async function toggleLike(postId, isNpc) {
    const all = getMergedPosts();
    const target = all.find((p) => p.id === postId);
    if (!target) return;

    const likedMap = getJsonLS(LS_LIKES, {});
    const wasLiked = Boolean(likedMap[postId]);
    const nextLikes = Math.max(0, (target.likes || 0) + (wasLiked ? -1 : 1));

    if (wasLiked) delete likedMap[postId];
    else likedMap[postId] = true;
    setJsonLS(LS_LIKES, likedMap);

    if (isNpc) npcLikesMap[postId] = nextLikes;
    else {
      const rp = remotePosts.find((p) => p.id === postId);
      if (rp) rp.likes = nextLikes;
    }
    renderPosts();

    if (FB_URL) {
      const path = isNpc ? `npc_likes/${postId}` : `posts/${postId}/likes`;
      fetch(`${FB_URL}/${BOARD_NODE}/${path}.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextLikes),
      }).catch(() => {});
    }
  }

  async function submitReply(postId, isNpc, boxEl) {
    const nameIn = boxEl.querySelector(".reply-name-in");
    const roleIn = boxEl.querySelector(".reply-role-in");
    const textIn = boxEl.querySelector(".reply-text-in");
    const text = textIn ? textIn.value.trim() : "";
    if (!text) {
      alert("Bạn chưa nhập nội dung phản hồi!");
      return;
    }

    const def = readProfileTabDefaults();
    const replyObj = {
      name: (nameIn && nameIn.value.trim()) || def.name || `Ẩn danh #${Math.floor(100 + Math.random() * 900)}`,
      role: (roleIn && roleIn.value.trim()) || def.role || "Cư dân Swezan",
      time: format1994Time(),
      text,
      createdAt: Date.now(),
    };

    openReplyId = null;

    if (FB_URL && isOnline) {
      const path = isNpc ? `npc_replies/${postId}` : `posts/${postId}/replies`;
      try {
        await fetch(`${FB_URL}/${BOARD_NODE}/${path}.json`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(replyObj),
        });
        await fetchBoardData();
        return;
      } catch (err) {}
    }

    if (!isNpc) {
      const rp = remotePosts.find((p) => p.id === postId);
      if (rp) {
        rp.replies = rp.replies || [];
        rp.replies.push({ id: `r_${Date.now()}`, ...replyObj });
        setJsonLS(LS_POSTS, remotePosts);
      }
    } else {
      npcRepliesMap[postId] = npcRepliesMap[postId] || {};
      npcRepliesMap[postId][`r_${Date.now()}`] = replyObj;
    }
    renderPosts();
  }

  async function deletePost(postId) {
    if (!confirm("Xóa phiếu tin báo này khỏi Bảng Tin?")) return;
    remotePosts = remotePosts.filter((p) => p.id !== postId);
    setJsonLS(LS_POSTS, remotePosts);
    renderPosts();

    if (FB_URL) {
      fetch(`${FB_URL}/${BOARD_NODE}/posts/${postId}.json`, { method: "DELETE" }).catch(() => {});
    }
  }

  buildShell();
  fetchBoardData();
  const boardTabBtn = document.querySelector('.desk-tab[data-tab="board"]');
  if (boardTabBtn) {
    boardTabBtn.addEventListener("click", () => {
      fetchBoardData();
    });
  }

  workspace.addEventListener("submit", (e) => {
    if (e.target && e.target.id === "bbs-post-form") submitNewPost(e);
  });

  workspace.addEventListener("click", (e) => {
    const filterBtn = e.target.closest("[data-board-filter]");
    if (filterBtn) {
      activeFilter = filterBtn.dataset.boardFilter;
      workspace.querySelectorAll("[data-board-filter]").forEach((b) => {
        b.classList.toggle("is-active", b === filterBtn);
      });
      renderPosts();
      return;
    }

    if (e.target.closest("#board-refresh-btn")) {
      fetchBoardData();
      return;
    }

    if (e.target.closest("#bbs-sync-profile-btn")) {
      const def = readProfileTabDefaults();
      const nEl = document.getElementById("bbs-name");
      const rEl = document.getElementById("bbs-role");
      if (nEl && def.name) nEl.value = def.name;
      if (rEl && def.role) rEl.value = def.role;
      return;
    }

    if (e.target.closest("#board-gm-btn")) {
      if (gmUnlocked) {
        gmUnlocked = false;
        e.target.closest("#board-gm-btn").classList.remove("is-active");
        renderPosts();
      } else {
        const pin = prompt("Nhập mã GM để mở khóa quyền xóa bài:");
        if (pin === GM_PIN) {
          gmUnlocked = true;
          e.target.closest("#board-gm-btn").classList.add("is-active");
          renderPosts();
        } else if (pin !== null) {
          alert("Sai mã GM!");
        }
      }
      return;
    }

    const likeBtn = e.target.closest("[data-like-id]");
    if (likeBtn) {
      toggleLike(likeBtn.dataset.likeId, likeBtn.dataset.isNpc === "1");
      return;
    }

    const openRepBtn = e.target.closest("[data-open-reply]");
    if (openRepBtn) {
      const id = openRepBtn.dataset.openReply;
      openReplyId = openReplyId === id ? null : id;
      renderPosts();
      return;
    }

    if (e.target.closest("[data-cancel-reply]")) {
      openReplyId = null;
      renderPosts();
      return;
    }

    const sendRepBtn = e.target.closest("[data-send-reply]");
    if (sendRepBtn) {
      const box = sendRepBtn.closest("[data-reply-form]");
      if (box) submitReply(sendRepBtn.dataset.sendReply, sendRepBtn.dataset.isNpc === "1", box);
      return;
    }

    const delBtn = e.target.closest("[data-del-id]");
    if (delBtn) {
      deletePost(delBtn.dataset.delId);
    }
  });
});