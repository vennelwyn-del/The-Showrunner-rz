/* =========================================================
   THE SHOWRUNNER — BỘ DỰNG CẢNH 3D MODEL CƠ THỂ NGƯỜI & HOA (3.8s)
   Sử dụng Three.js (r147 UMD) chạy trực tiếp trong màn hình CRT
   ========================================================= */

(function () {
  let activeRenderer = null;
  let activeScene = null;
  let activeRaf = null;
  let activeCleanup = null;

  function disposeObject(obj) {
    if (!obj) return;
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
      else obj.material.dispose();
    }
  }

  function destroy() {
    if (activeRaf) {
      cancelAnimationFrame(activeRaf);
      activeRaf = null;
    }
    if (typeof activeCleanup === "function") {
      activeCleanup();
      activeCleanup = null;
    }
    if (activeScene) {
      activeScene.traverse(disposeObject);
      activeScene = null;
    }
    if (activeRenderer) {
      activeRenderer.dispose();
      if (activeRenderer.domElement && activeRenderer.domElement.parentNode) {
        activeRenderer.domElement.parentNode.removeChild(activeRenderer.domElement);
      }
      activeRenderer = null;
    }
  }

  /* -------------------------------------------------------
     TẠO CÁC BỘ PHẬN 3D: CƠ THỂ NGƯỜI, HOA LOA KÈN, BUỒNG TRỨNG
     ------------------------------------------------------- */
  function createHumanArm(bodyMat, side = 1) {
    const shoulderPivot = new THREE.Group();
    shoulderPivot.position.set(side * 0.27, 1.38, 0.02);

    const shoulderJoint = new THREE.Mesh(new THREE.SphereGeometry(0.068, 12, 10), bodyMat);
    shoulderPivot.add(shoulderJoint);

    const upperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.046, 0.36, 12), bodyMat);
    upperArm.position.y = -0.18;
    shoulderPivot.add(upperArm);

    const elbowPivot = new THREE.Group();
    elbowPivot.position.set(0, -0.36, 0);
    shoulderPivot.add(elbowPivot);

    const elbowJoint = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 8), bodyMat);
    elbowPivot.add(elbowJoint);

    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.032, 0.34, 12), bodyMat);
    forearm.position.y = -0.17;
    elbowPivot.add(forearm);

    const handGroup = new THREE.Group();
    handGroup.position.set(0, -0.35, 0);
    elbowPivot.add(handGroup);

    const palm = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.09, 0.024), bodyMat);
    palm.position.y = -0.04;
    handGroup.add(palm);

    // 5 ngón tay tách rõ ràng
    for (let f = 0; f < 5; f++) {
      const finger = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.006, 0.075, 6), bodyMat);
      finger.position.set((f - 2) * 0.015, -0.11, 0);
      finger.rotation.z = (f - 2) * -0.06;
      handGroup.add(finger);
    }

    return { shoulderPivot, elbowPivot, handGroup };
  }

  function createFemaleSilhouette(bodyMat) {
    const group = new THREE.Group();

    // Đường cong giải phẫu thân trên nữ (từ thắt lưng/hông lên vai cổ)
    const torsoPoints = [
      new THREE.Vector2(0.001, 0.0),
      new THREE.Vector2(0.32, 0.02),
      new THREE.Vector2(0.30, 0.22),
      new THREE.Vector2(0.24, 0.50),
      new THREE.Vector2(0.165, 0.78), // Eo thắt rõ
      new THREE.Vector2(0.225, 1.05), // Ngực
      new THREE.Vector2(0.255, 1.24),
      new THREE.Vector2(0.23, 1.40),  // Vai
      new THREE.Vector2(0.085, 1.48), // Chân cổ
      new THREE.Vector2(0.068, 1.62), // Cổ
      new THREE.Vector2(0.001, 1.64),
    ];
    const torsoGeo = new THREE.LatheGeometry(torsoPoints, 24);
    const torso = new THREE.Mesh(torsoGeo, bodyMat);
    torso.scale.set(1.06, 1, 0.68);
    group.add(torso);

    // Tạo đường nét ngực để bóng nghiêng/chính diện rõ cơ thể nữ
    [-1, 1].forEach((side) => {
      const chestCurve = new THREE.Mesh(new THREE.SphereGeometry(0.115, 16, 12), bodyMat);
      chestCurve.position.set(side * 0.11, 1.15, 0.12);
      chestCurve.scale.set(0.95, 0.9, 0.85);
      group.add(chestCurve);
    });

    // Đầu & Tóc dài
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.77, 0.02);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.145, 20, 16), bodyMat);
    head.scale.set(0.88, 1.14, 0.96);
    headGroup.add(head);

    const hairBack = new THREE.Mesh(new THREE.CylinderGeometry(0.145, 0.20, 0.44, 16, 1, false), bodyMat);
    hairBack.position.set(0, -0.18, -0.06);
    hairBack.scale.set(1.02, 1, 0.72);
    headGroup.add(hairBack);
    group.add(headGroup);

    const leftArm = createHumanArm(bodyMat, -1);
    const rightArm = createHumanArm(bodyMat, 1);

    // Tư thế 2 tay giơ lên áp sát mặt kính buồng trứng phía trước
    leftArm.shoulderPivot.rotation.set(-1.35, 0.18, -0.25);
    leftArm.elbowPivot.rotation.set(-0.75, 0, 0.15);

    rightArm.shoulderPivot.rotation.set(-1.62, -0.14, 0.2);
    rightArm.elbowPivot.rotation.set(-0.68, 0, -0.1);

    group.add(leftArm.shoulderPivot, rightArm.shoulderPivot);

    return { group, headGroup, leftArm, rightArm };
  }

  function createMaleChairSilhouette(bodyMat) {
    const group = new THREE.Group();

    const torsoPoints = [
      new THREE.Vector2(0.001, 0.42),
      new THREE.Vector2(0.24, 0.46),
      new THREE.Vector2(0.23, 0.76),
      new THREE.Vector2(0.27, 1.08),
      new THREE.Vector2(0.29, 1.28),
      new THREE.Vector2(0.10, 1.38),
      new THREE.Vector2(0.075, 1.50),
      new THREE.Vector2(0.001, 1.52),
    ];
    const torso = new THREE.Mesh(new THREE.LatheGeometry(torsoPoints, 20), bodyMat);
    torso.scale.set(1.08, 1, 0.72);
    group.add(torso);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.148, 18, 14), bodyMat);
    head.position.set(0, 1.63, 0.04);
    head.scale.set(0.9, 1.12, 0.96);
    head.rotation.x = 0.25; // Cúi gục
    group.add(head);

    // Hai đùi & cẳng chân ngồi trên ghế
    [-1, 1].forEach((side) => {
      const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.07, 0.46, 12), bodyMat);
      thigh.rotation.x = Math.PI / 2;
      thigh.position.set(side * 0.13, 0.44, 0.24);
      group.add(thigh);

      const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.048, 0.48, 12), bodyMat);
      shin.position.set(side * 0.13, 0.20, 0.45);
      group.add(shin);

      const arm = createHumanArm(bodyMat, side);
      arm.shoulderPivot.position.set(side * 0.29, 1.24, -0.02);
      arm.shoulderPivot.rotation.set(0.35, 0, side * -0.18); // Tay bị trói ra sau lưng ghế
      arm.elbowPivot.rotation.set(0.75, 0, side * -0.35);
      group.add(arm.shoulderPivot);
    });

    return group;
  }

  function createLilyFlower(petalMat, stemMat, centerMat) {
    const flower = new THREE.Group();

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.015, 0.55, 8), stemMat);
    stem.position.y = -0.27;
    flower.add(stem);

    // 2 lá dài ôm thân
    [-1, 1].forEach((s) => {
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.28, 5), stemMat);
      leaf.position.set(s * 0.05, -0.32, 0);
      leaf.rotation.z = s * -0.55;
      flower.add(leaf);
    });

    // Bông hoa loa kèn 6 cánh uốn loa rõ ràng
    const head = new THREE.Group();
    const petalShape = new THREE.Shape();
    petalShape.moveTo(0, 0);
    petalShape.quadraticCurveTo(0.078, 0.12, 0.048, 0.28);
    petalShape.quadraticCurveTo(0, 0.37, 0, 0.39);
    petalShape.quadraticCurveTo(0, 0.37, -0.048, 0.28);
    petalShape.quadraticCurveTo(-0.078, 0.12, 0, 0);
    const petalGeo = new THREE.ShapeGeometry(petalShape, 8);

    for (let i = 0; i < 6; i++) {
      const petalWrap = new THREE.Group();
      petalWrap.rotation.y = (i * Math.PI * 2) / 6;

      const petal = new THREE.Mesh(petalGeo, petalMat);
      petal.rotation.x = i % 2 === 0 ? 0.62 : 0.78;
      petalWrap.add(petal);
      head.add(petalWrap);
    }

    // Nhụy hoa loa kèn ở giữa
    for (let k = 0; k < 4; k++) {
      const stamen = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.18, 5), centerMat);
      stamen.position.y = 0.09;
      stamen.rotation.set(Math.sin(k * 1.5) * 0.22, 0, Math.cos(k * 1.5) * 0.22);
      head.add(stamen);
    }

    flower.add(head);
    return { flower, head };
  }

  /* -------------------------------------------------------
     1. CẢNH 3D TẬP 2: TRỨNG ẤU TRÙNG (CÔ GÁI TRONG BUỒNG TRỨNG + HOA LOA KÈN)
     ------------------------------------------------------- */
  function buildEpisode2Scene(scene, camera) {
    camera.position.set(0, 1.35, 3.05);
    camera.lookAt(0, 1.15, 0);

    scene.fog = new THREE.FogExp2(0x160709, 0.18);

    // Ánh sáng ngược mạnh để làm nổi rõ đường nét cơ thể & cánh hoa trắng
    scene.add(new THREE.AmbientLight(0x4a2428, 0.7));

    const backGlow = new THREE.PointLight(0xffdede, 3.4, 8);
    backGlow.position.set(0, 1.65, -1.65);
    scene.add(backGlow);

    const rimRed = new THREE.SpotLight(0xd81024, 3.2, 10, Math.PI / 4, 0.5);
    rimRed.position.set(-1.9, 2.8, 1.4);
    scene.add(rimRed);

    const lilyLight = new THREE.PointLight(0xfff4ea, 1.6, 5);
    lilyLight.position.set(0.8, 1.2, 1.6);
    scene.add(lilyLight);

    // Màn sáng sương mù phía sau để bóng cơ thể nổi bật
    const backdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(6.5, 4.5),
      new THREE.MeshBasicMaterial({ color: 0x3b1218 })
    );
    backdrop.position.set(0, 1.3, -2.0);
    scene.add(backdrop);

    const chamberGroup = new THREE.Group();
    scene.add(chamberGroup);

    // Lớp đất/cát ngập tới ngang thắt lưng bên trong đáy quả trứng
    const soilBed = new THREE.Mesh(
      new THREE.CylinderGeometry(0.76, 0.52, 0.42, 28),
      new THREE.MeshPhongMaterial({ color: 0x160e0e, shininess: 10 })
    );
    soilBed.position.y = 0.38;
    chamberGroup.add(soilBed);

    // Model 3D cơ thể cô gái (đậm, bóng sắc nét)
    const bodyMat = new THREE.MeshPhongMaterial({
      color: 0x12090b,
      emissive: 0x120305,
      specular: 0x6b222a,
      shininess: 35,
    });
    const figure = createFemaleSilhouette(bodyMat);
    figure.group.position.set(0, 0.25, -0.02);
    figure.group.rotation.y = 0.14; // Xoay nhẹ 3/4 cho rõ đường cong cơ thể & cánh tay vươn
    chamberGroup.add(figure.group);

    // Đám hoa loa kèn trắng rõ ràng vây quanh thắt lưng trong buồng kính
    const petalMat = new THREE.MeshPhongMaterial({
      color: 0xf4ece6,
      emissive: 0x2e1f21,
      specular: 0xffffff,
      shininess: 40,
      side: THREE.DoubleSide,
    });
    const stemMat = new THREE.MeshPhongMaterial({ color: 0x1f2b1c, side: THREE.DoubleSide });
    const centerMat = new THREE.MeshBasicMaterial({ color: 0x9c202a });

    const lilies = [];
    const lilyCount = 13;
    for (let i = 0; i < lilyCount; i++) {
      const angle = (i / lilyCount) * Math.PI * 2 + (i % 2) * 0.15;
      const radius = 0.34 + (i % 3) * 0.13;
      const l = createLilyFlower(petalMat, stemMat, centerMat);
      l.flower.position.set(Math.cos(angle) * radius, 0.72 + (i % 3) * 0.1, Math.sin(angle) * radius);
      l.flower.rotation.set(0.28 + (i % 2) * 0.12, -angle + Math.PI / 2, (Math.random() - 0.5) * 0.25);
      l.flower.scale.setScalar(0.92 + (i % 3) * 0.14);
      chamberGroup.add(l.flower);
      lilies.push({ obj: l.flower, head: l.head, baseRotX: l.flower.rotation.x, phase: i * 0.7 });
    }

    // Buồng kính 3D hình quả trứng bao bọc bên ngoài
    const eggPoints = [];
    for (let i = 0; i <= 32; i++) {
      const t = (i / 32) * Math.PI;
      const r = Math.sin(t) * (0.94 + 0.18 * Math.cos(t));
      const y = 1.28 - Math.cos(t) * 1.18;
      eggPoints.push(new THREE.Vector2(Math.max(0.001, r), y));
    }
    const eggGeo = new THREE.LatheGeometry(eggPoints, 36);
    const eggGlassMat = new THREE.MeshPhongMaterial({
      color: 0xd9c2c4,
      emissive: 0x200a0d,
      specular: 0xffffff,
      shininess: 110,
      transparent: true,
      opacity: 0.24,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const eggDome = new THREE.Mesh(eggGeo, eggGlassMat);
    chamberGroup.add(eggDome);

    // Khung xương kim loại bao quanh quả trứng + đường ống hơi nước
    const metalMat = new THREE.MeshPhongMaterial({ color: 0x2d2426, shininess: 65 });
    [0.58, 1.32, 2.18].forEach((ringY, idx) => {
      const ringR = idx === 0 ? 0.88 : idx === 1 ? 0.96 : 0.62;
      const ring = new THREE.Mesh(new THREE.TorusGeometry(ringR, 0.022, 8, 36), metalMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = ringY;
      chamberGroup.add(ring);
    });

    [-0.98, 0.98].forEach((px) => {
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 2.5, 10), metalMat);
      pipe.position.set(px, 1.25, -0.2);
      chamberGroup.add(pipe);
    });

    // Hạt hơi nước 3D bốc lên bên trong buồng kính
    const steamMat = new THREE.MeshBasicMaterial({
      color: 0xf2e4e4,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    });
    const steamPuffs = [];
    for (let s = 0; s < 16; s++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.16 + (s % 3) * 0.07, 10, 8), steamMat.clone());
      const a = (s / 16) * Math.PI * 2;
      puff.position.set(Math.cos(a) * 0.45, 0.55 + (s % 5) * 0.28, Math.sin(a) * 0.4);
      chamberGroup.add(puff);
      steamPuffs.push({ mesh: puff, speed: 0.22 + (s % 4) * 0.08, startY: puff.position.y });
    }

    return function update(t) {
      // Đẩy camera vào gần nhẹ & lắc kiểu máy quay cầm tay 1994
      camera.position.z = 3.05 - t * 0.32;
      camera.position.x = Math.sin(t * Math.PI) * 0.16;
      camera.position.y = 1.34 + Math.sin(t * 2.2) * 0.025;
      camera.lookAt(0, 1.18, 0);

      // Cử động thở gấp & bàn tay cào trượt nhẹ xuống mặt kính
      figure.group.position.y = 0.25 + Math.sin(t * 9) * 0.012;
      figure.headGroup.rotation.x = -0.14 + Math.sin(t * 5) * 0.08;
      figure.rightArm.shoulderPivot.rotation.x = -1.62 + Math.sin(t * 4.5) * 0.18;
      figure.leftArm.shoulderPivot.rotation.x = -1.35 + Math.cos(t * 5.2) * 0.12;

      // Hoa loa kèn rung nhẹ và rũ xuống ở cuối đoạn khi hơi nóng tăng
      const droop = Math.max(0, (t - 0.55) * 0.45);
      lilies.forEach((l) => {
        l.obj.rotation.x = l.baseRotX + Math.sin(t * 6 + l.phase) * 0.04 + droop;
      });

      // Hơi nước bốc cuộn lên & làm kính mờ dần
      steamPuffs.forEach((p, idx) => {
        p.mesh.position.y = 0.48 + ((p.startY + t * p.speed * 2.4) % 1.85);
        p.mesh.material.opacity = 0.12 + t * 0.22 + Math.sin(t * 5 + idx) * 0.04;
      });
      eggGlassMat.opacity = 0.22 + t * 0.16;
    };
  }

  /* -------------------------------------------------------
     2. CẢNH 3D TẬP 3A: GHẾ SẮT TREO TRÊN MẶT NƯỚC TỐI
     ------------------------------------------------------- */
  function buildEpisode3Scene(scene, camera) {
    camera.position.set(0.3, 1.4, 3.2);
    camera.lookAt(0, 1.1, 0);

    scene.add(new THREE.AmbientLight(0x281214, 0.6));

    const lampLight = new THREE.SpotLight(0xffe2d6, 3.8, 10, Math.PI / 4, 0.45);
    lampLight.position.set(0, 2.75, 0.25);
    scene.add(lampLight);

    const redFill = new THREE.PointLight(0xb80f1e, 1.6, 6);
    redFill.position.set(-1.5, 1.2, -1.0);
    scene.add(redFill);

    // Bóng đèn treo đung đưa
    const lampGroup = new THREE.Group();
    lampGroup.position.set(0, 2.8, 0.2);
    const cord = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, 0.6, 6),
      new THREE.MeshBasicMaterial({ color: 0x444444 })
    );
    cord.position.y = -0.3;
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.07, 10, 8),
      new THREE.MeshBasicMaterial({ color: 0xfff0e6 })
    );
    bulb.position.y = -0.6;
    lampGroup.add(cord, bulb);
    scene.add(lampGroup);

    // Ghế sắt & Model 3D người bị trói treo lơ lửng
    const rigGroup = new THREE.Group();
    rigGroup.position.y = 0.55;
    scene.add(rigGroup);

    const chain = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 1.8, 8),
      new THREE.MeshPhongMaterial({ color: 0x332c2d })
    );
    chain.position.y = 2.05;
    rigGroup.add(chain);

    const chairMat = new THREE.MeshPhongMaterial({ color: 0x241d1e, shininess: 40 });
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.05, 0.52), chairMat);
    seat.position.set(0, 0.38, 0.14);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.78, 0.04), chairMat);
    back.position.set(0, 0.78, -0.11);
    rigGroup.add(seat, back);

    const bodyMat = new THREE.MeshPhongMaterial({ color: 0x0f0809, specular: 0x55181e, shininess: 30 });
    const prisoner = createMaleChairSilhouette(bodyMat);
    rigGroup.add(prisoner);

    // Mặt nước tối gợn sóng bên dưới
    const waterGeo = new THREE.PlaneGeometry(7, 5, 24, 24);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshPhongMaterial({
      color: 0x0b0708,
      specular: 0xb81020,
      shininess: 90,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.y = 0.12;
    scene.add(water);

    // Bóng bàn tay đeo găng đen lướt qua trước ống kính
    const glove = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.95, 0.08),
      new THREE.MeshBasicMaterial({ color: 0x040303 })
    );
    glove.position.set(-2.2, 0.85, 2.25);
    glove.rotation.z = -0.22;
    scene.add(glove);

    return function update(t) {
      lampGroup.rotation.z = Math.sin(t * Math.PI * 2) * 0.12;
      lampLight.position.x = Math.sin(t * Math.PI * 2) * 0.35;

      rigGroup.rotation.y = Math.sin(t * 2.5) * 0.14;
      rigGroup.position.y = 0.55 + Math.sin(t * 4) * 0.03;

      // Lướt bóng găng tay qua màn hình ở khoảng giữa đoạn
      glove.position.x = -2.2 + t * 4.4;
      glove.position.y = 0.78 + Math.sin(t * Math.PI) * 0.25;

      camera.position.z = 3.2 - t * 0.25;
      camera.lookAt(0, 1.15, 0);
    };
  }

  /* -------------------------------------------------------
     3. CẢNH 3D TẬP 1 & TẬP 4 (RÒNG RỌC SƯƠNG MÙ / BÓNG KỴ SĨ)
     ------------------------------------------------------- */
  function buildFallback3DScene(scene, camera, tapeId) {
    camera.position.set(0, 1.2, 3.0);
    camera.lookAt(0, 1.1, 0);

    const redLight = new THREE.PointLight(0xd81024, 3.2, 8);
    redLight.position.set(0, 2.2, -1.2);
    scene.add(redLight);
    scene.add(new THREE.AmbientLight(0x281214, 0.5));

    const bodyMat = new THREE.MeshPhongMaterial({ color: 0x0c0708, specular: 0x6e1820 });

    if (tapeId === "tape-1") {
      const cocoon = new THREE.Mesh(new THREE.CapsuleGeometry ? new THREE.SphereGeometry(0.32, 16, 14) : new THREE.SphereGeometry(0.32, 16, 14), bodyMat);
      cocoon.scale.set(0.75, 2.1, 0.75);
      cocoon.position.y = 1.25;
      scene.add(cocoon);

      const chain = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 1.5, 8),
        new THREE.MeshPhongMaterial({ color: 0x443536 })
      );
      chain.position.y = 2.3;
      scene.add(chain);

      return function update(t) {
        cocoon.position.y = 1.35 - t * 0.45;
        cocoon.rotation.y = t * 1.1;
      };
    }

    // Tập 4: Bóng Kỵ Sĩ mờ chớp tắt
    const rider = new THREE.Group();
    const cloak = new THREE.Mesh(new THREE.ConeGeometry(0.52, 1.6, 18), bodyMat);
    cloak.position.y = 0.85;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), bodyMat);
    head.position.y = 1.72;
    rider.add(cloak, head);
    rider.visible = false;
    scene.add(rider);

    return function update(t) {
      rider.visible = t > 0.62 && t < 0.74;
      redLight.intensity = rider.visible ? 5.5 : 1.4 + Math.random() * 0.8;
    };
  }

  /* -------------------------------------------------------
     MOUNT & CHẠY ANIMATION 3.8 GIÂY
     ------------------------------------------------------- */
  window.Tape3DSim = {
    isSupported() {
      return typeof window.THREE !== "undefined";
    },
    destroy,
    mount(container, tapeId, onProgress, onComplete) {
      destroy();
      if (!container || typeof window.THREE === "undefined") return false;

      const width = container.clientWidth || 460;
      const height = container.clientHeight || 345;

      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch (e) {
        return false;
      }

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setSize(width, height);
      renderer.setClearColor(0x090506, 1);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 25);

      let updater;
      if (tapeId === "tape-2") updater = buildEpisode2Scene(scene, camera);
      else if (tapeId === "tape-3a") updater = buildEpisode3Scene(scene, camera);
      else updater = buildFallback3DScene(scene, camera, tapeId);

      container.innerHTML = "";
      container.appendChild(renderer.domElement);

      const overlayHud = document.createElement("div");
      overlayHud.className = "sim-webgl-hud";
      overlayHud.innerHTML = `
        <div class="sim-noise-grain"></div>
        <div class="sim-tracking-band"></div>
        <div class="sim-flash-glitch"></div>
      `;
      container.appendChild(overlayHud);

      const onResize = () => {
        const w = container.clientWidth || 460;
        const h = container.clientHeight || 345;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener("resize", onResize);

      activeRenderer = renderer;
      activeScene = scene;
      activeCleanup = () => window.removeEventListener("resize", onResize);

      const durationMs = 3800;
      const startAt = performance.now();

      function animate(now) {
        const elapsed = now - startAt;
        const ratio = Math.min(1, elapsed / durationMs);

        if (typeof updater === "function") updater(ratio);
        renderer.render(scene, camera);

        if (typeof onProgress === "function") onProgress(ratio);

        if (ratio < 1) {
          activeRaf = requestAnimationFrame(animate);
        } else {
          activeRaf = null;
          if (typeof onComplete === "function") onComplete();
        }
      }

      activeRaf = requestAnimationFrame(animate);
      return true;
    },
  };
})();