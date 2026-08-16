// ===================== BUSINESS 3D — GAME LOGIC =====================

const TOKEN_COLORS = ["#ff5252", "#448aff", "#69f0ae", "#ffd740", "#e040fb", "#40c4ff"];
let BOARD = [];
let CHANCE_CARDS = [];

let players = [];
let currentPlayerIndex = 0;
let gameStarted = false;
let awaitingAction = false; // true while a modal needs a response before ending turn

// ---------- THREE.JS SETUP ----------
let scene, camera, renderer, controls;
let tileGroup, tokenGroup, diceGroup;
let tileMeshes = {};
let tokenMeshes = {};
let diceMeshes = [];

const HALF = 12;   // half-size of board square
const STEP = (HALF * 2) / 7; // spacing between tiles per side (7 tiles/side)

init3D();
loadBoardData();

function init3D() {
  const canvas = document.getElementById("game-canvas");
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0e0e1a);
  scene.fog = new THREE.Fog(0x0e0e1a, 40, 90);

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 28, 30);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.maxPolarAngle = Math.PI / 2.1;
  controls.minDistance = 15;
  controls.maxDistance = 60;
  controls.target.set(0, 0, 0);

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);
  const sun = new THREE.DirectionalLight(0xffffff, 0.9);
  sun.position.set(20, 35, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -30;
  sun.shadow.camera.right = 30;
  sun.shadow.camera.top = 30;
  sun.shadow.camera.bottom = -30;
  scene.add(sun);

  // ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(120, 120),
    new THREE.MeshStandardMaterial({ color: 0x111122 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.6;
  ground.receiveShadow = true;
  scene.add(ground);

  // board base
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(HALF * 2 + 3, 0.5, HALF * 2 + 3),
    new THREE.MeshStandardMaterial({ color: 0x1b3d2f })
  );
  base.position.y = -0.3;
  base.receiveShadow = true;
  scene.add(base);

  tileGroup = new THREE.Group();
  tokenGroup = new THREE.Group();
  diceGroup = new THREE.Group();
  scene.add(tileGroup, tokenGroup, diceGroup);

  window.addEventListener("resize", onResize);
  animate();
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// ---------- BOARD DATA ----------
async function loadBoardData() {
  const res = await fetch("/api/board");
  const data = await res.json();
  BOARD = data.board;
  CHANCE_CARDS = data.chanceCards;
  buildBoard3D();
  buildSetupScreen();
}

function tilePosition(i) {
  const n = BOARD.length;
  const perSide = n / 4;
  const side = Math.floor(i / perSide);
  const posInSide = i % perSide;
  let x = 0, z = 0;
  if (side === 0) { x = -HALF + posInSide * STEP; z = HALF; }
  else if (side === 1) { x = HALF; z = HALF - posInSide * STEP; }
  else if (side === 2) { x = HALF - posInSide * STEP; z = -HALF; }
  else { x = -HALF; z = -HALF + posInSide * STEP; }
  return { x, z };
}

function makeLabelTexture(tile) {
  const canvas = document.createElement("canvas");
  canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = tile.color || "#33334d";
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 30px Segoe UI";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  wrapText(ctx, tile.name, 128, 128, 220, 34);
  if (tile.price) {
    ctx.font = "22px Segoe UI";
    ctx.fillText("₹" + tile.price, 128, 200);
  }
  return new THREE.CanvasTexture(canvas);
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "", lines = [];
  for (const w of words) {
    const test = line + w + " ";
    if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = w + " "; }
    else line = test;
  }
  lines.push(line);
  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((l, idx) => ctx.fillText(l.trim(), x, startY + idx * lineHeight));
}

function buildBoard3D() {
  BOARD.forEach((tile, i) => {
    const { x, z } = tilePosition(i);
    const height = tile.type === "city" ? 0.6 : 0.9;
    const geo = new THREE.BoxGeometry(STEP * 0.85, height, STEP * 0.85);
    const tex = makeLabelTexture(tile);
    const mat = [
      new THREE.MeshStandardMaterial({ color: tile.color || "#2d2d45" }),
      new THREE.MeshStandardMaterial({ color: tile.color || "#2d2d45" }),
      new THREE.MeshStandardMaterial({ map: tex }), // top
      new THREE.MeshStandardMaterial({ color: tile.color || "#2d2d45" }),
      new THREE.MeshStandardMaterial({ color: tile.color || "#2d2d45" }),
      new THREE.MeshStandardMaterial({ color: tile.color || "#2d2d45" }),
    ];
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, height / 2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.tileId = tile.id;
    tileGroup.add(mesh);
    tileMeshes[tile.id] = mesh;

    // ownership marker (small flag), hidden until bought
    const flagGeo = new THREE.ConeGeometry(0.35, 1, 6);
    const flag = new THREE.Mesh(flagGeo, new THREE.MeshStandardMaterial({ color: 0xffffff }));
    flag.position.set(x, height + 0.6, z);
    flag.visible = false;
    tileGroup.add(flag);
    tileMeshes[tile.id].flag = flag;
  });
}

// ---------- SETUP SCREEN ----------
function buildSetupScreen() {
  const container = document.getElementById("player-inputs");
  container.innerHTML = "";
  addPlayerRow();
  addPlayerRow();
  document.getElementById("add-player-btn").onclick = () => {
    if (container.children.length < 6) addPlayerRow();
  };
  document.getElementById("start-game-btn").onclick = startGame;
}

function addPlayerRow() {
  const container = document.getElementById("player-inputs");
  const idx = container.children.length;
  const row = document.createElement("div");
  row.className = "player-row";
  row.innerHTML = `
    <div class="swatch" style="background:${TOKEN_COLORS[idx]}"></div>
    <input type="text" placeholder="Player ${idx + 1} name" value="Player ${idx + 1}" />
  `;
  container.appendChild(row);
}

function startGame() {
  const rows = document.querySelectorAll("#player-inputs .player-row");
  players = Array.from(rows).map((row, idx) => ({
    id: idx,
    name: row.querySelector("input").value || `Player ${idx + 1}`,
    color: TOKEN_COLORS[idx],
    money: 6000,
    position: 0,
    properties: [],
    inJail: false,
    bankrupt: false,
  }));

  players.forEach((p) => {
    const geo = new THREE.ConeGeometry(0.5, 1.4, 8);
    const mat = new THREE.MeshStandardMaterial({ color: p.color, emissive: p.color, emissiveIntensity: 0.2 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    const { x, z } = tilePosition(0);
    mesh.position.set(x, 1.2, z);
    tokenGroup.add(mesh);
    tokenMeshes[p.id] = mesh;
  });

  buildDice();
  document.getElementById("setup-screen").classList.add("hidden");
  document.getElementById("hud").classList.remove("hidden");
  document.getElementById("roll-btn").onclick = handleRoll;
  document.getElementById("end-turn-btn").onclick = endTurn;

  gameStarted = true;
  currentPlayerIndex = 0;
  renderPlayersPanel();
  log(`Game started with ${players.length} players. ${players[0].name}'s turn.`);
}

// ---------- DICE ----------
function buildDice() {
  diceMeshes.forEach((d) => diceGroup.remove(d));
  diceMeshes = [];
  for (let i = 0; i < 2; i++) {
    const geo = new THREE.BoxGeometry(1.4, 1.4, 1.4);
    const materials = [1, 2, 3, 4, 5, 6].map((n) => new THREE.MeshStandardMaterial({ map: diceFaceTexture(n) }));
    const mesh = new THREE.Mesh(geo, materials);
    mesh.position.set(i === 0 ? -1 : 1, 6, 0);
    mesh.castShadow = true;
    diceGroup.add(mesh);
    diceMeshes.push(mesh);
  }
}

function diceFaceTexture(n) {
  const canvas = document.createElement("canvas");
  canvas.width = 128; canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(0, 0, 128, 128);
  ctx.fillStyle = "#c0392b";
  const dot = (x, y) => { ctx.beginPath(); ctx.arc(x, y, 11, 0, Math.PI * 2); ctx.fill(); };
  const pts = {
    1: [[64, 64]],
    2: [[38, 38], [90, 90]],
    3: [[38, 38], [64, 64], [90, 90]],
    4: [[38, 38], [90, 38], [38, 90], [90, 90]],
    5: [[38, 38], [90, 38], [64, 64], [38, 90], [90, 90]],
    6: [[38, 32], [90, 32], [38, 64], [90, 64], [38, 96], [90, 96]],
  };
  pts[n].forEach(([x, y]) => dot(x, y));
  return new THREE.CanvasTexture(canvas);
}

function rollDiceAnimation(v1, v2) {
  return new Promise((resolve) => {
    let elapsed = 0;
    const duration = 900;
    const start = performance.now();
    function tick(now) {
      elapsed = now - start;
      diceMeshes.forEach((d, i) => {
        d.rotation.x += 0.35 + i * 0.05;
        d.rotation.y += 0.28 + i * 0.04;
      });
      if (elapsed < duration) {
        requestAnimationFrame(tick);
      } else {
        diceMeshes[0].rotation.set(faceRotation(v1).x, faceRotation(v1).y, 0);
        diceMeshes[1].rotation.set(faceRotation(v2).x, faceRotation(v2).y, 0);
        resolve();
      }
    }
    requestAnimationFrame(tick);
  });
}

function faceRotation(n) {
  const map = {
    1: { x: 0, y: 0 }, 2: { x: 0, y: Math.PI / 2 }, 3: { x: -Math.PI / 2, y: 0 },
    4: { x: Math.PI / 2, y: 0 }, 5: { x: 0, y: -Math.PI / 2 }, 6: { x: Math.PI, y: 0 },
  };
  return map[n];
}

// ---------- TURN FLOW ----------
async function handleRoll() {
  if (!gameStarted || awaitingAction) return;
  const player = players[currentPlayerIndex];
  if (player.bankrupt) { nextPlayer(); return; }

  document.getElementById("roll-btn").disabled = true;
  const v1 = 1 + Math.floor(Math.random() * 6);
  const v2 = 1 + Math.floor(Math.random() * 6);
  await rollDiceAnimation(v1, v2);
  const total = v1 + v2;
  document.getElementById("dice-result").textContent = `${player.name} rolled ${v1} + ${v2} = ${total}`;
  log(`${player.name} rolled ${v1} and ${v2} (total ${total}).`);

  await moveToken(player, total);
  resolveTile(player);
}

async function moveToken(player, steps) {
  const n = BOARD.length;
  const startPos = player.position;
  for (let s = 1; s <= steps; s++) {
    const newPos = (startPos + s) % n;
    player.position = newPos;
    const { x, z } = tilePosition(newPos);
    await animateTokenTo(tokenMeshes[player.id], x, z);
    if (newPos === 0) {
      player.money += 2000;
      log(`${player.name} passed START and collected ₹2000.`);
    }
  }
  renderPlayersPanel();
}

function animateTokenTo(mesh, x, z) {
  return new Promise((resolve) => {
    const startX = mesh.position.x, startZ = mesh.position.z;
    const duration = 180;
    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      mesh.position.x = startX + (x - startX) * t;
      mesh.position.z = startZ + (z - startZ) * t;
      mesh.position.y = 1.2 + Math.sin(t * Math.PI) * 0.8;
      if (t < 1) requestAnimationFrame(tick);
      else resolve();
    }
    requestAnimationFrame(tick);
  });
}

function resolveTile(player) {
  const tile = BOARD[player.position];
  document.getElementById("end-turn-btn").disabled = false;

  if (tile.type === "start") {
    log(`${player.name} is at START.`);
  } else if (tile.type === "tax") {
    player.money -= tile.amount;
    log(`${player.name} paid ₹${tile.amount} in ${tile.name}.`);
    checkBankruptcy(player);
  } else if (tile.type === "chance") {
    drawChance(player);
  } else if (tile.type === "jail") {
    log(`${player.name} landed on ${tile.name}.`);
  } else if (tile.type === "parking") {
    log(`${player.name} rests at Free Parking.`);
  } else if (tile.type === "city") {
    const owner = findOwner(tile.id);
    if (!owner) {
      showBuyModal(player, tile);
      return; // waits for modal response before enabling end-turn fully
    } else if (owner.id !== player.id) {
      const rent = tile.rent;
      player.money -= rent;
      owner.money += rent;
      log(`${player.name} paid ₹${rent} rent to ${owner.name} for ${tile.name}.`);
      checkBankruptcy(player);
    } else {
      log(`${player.name} owns ${tile.name} already.`);
    }
  }
  document.getElementById("roll-btn").disabled = true;
  renderPlayersPanel();
}

function findOwner(tileId) {
  return players.find((p) => p.properties.includes(tileId));
}

function showBuyModal(player, tile) {
  awaitingAction = true;
  const backdrop = document.getElementById("modal-backdrop");
  const modal = document.getElementById("modal");
  modal.innerHTML = `
    <h2>${tile.name}</h2>
    <div class="price-tag">₹${tile.price}</div>
    <p>Rent: ₹${tile.rent} · ${player.name}'s balance: ₹${player.money}</p>
    <button class="btn primary" id="buy-btn" ${player.money < tile.price ? "disabled" : ""}>Buy Property</button>
    <button class="btn secondary" id="skip-btn">Skip</button>
  `;
  backdrop.classList.remove("hidden");
  document.getElementById("buy-btn").onclick = () => {
    player.money -= tile.price;
    player.properties.push(tile.id);
    tileMeshes[tile.id].flag.visible = true;
    tileMeshes[tile.id].flag.material.color.set(player.color);
    log(`${player.name} bought ${tile.name} for ₹${tile.price}.`);
    closeModal();
  };
  document.getElementById("skip-btn").onclick = () => {
    log(`${player.name} skipped buying ${tile.name}.`);
    closeModal();
  };
}

function drawChance(player) {
  awaitingAction = true;
  fetch("/api/chance").then((r) => r.json()).then((card) => {
    const backdrop = document.getElementById("modal-backdrop");
    const modal = document.getElementById("modal");
    modal.innerHTML = `
      <h2>🎴 Chance</h2>
      <p>${card.text}</p>
      <button class="btn primary" id="ok-btn">OK</button>
    `;
    backdrop.classList.remove("hidden");
    document.getElementById("ok-btn").onclick = () => {
      player.money += card.amount;
      log(`${player.name}: ${card.text}`);
      checkBankruptcy(player);
      closeModal();
    };
  });
}

function closeModal() {
  document.getElementById("modal-backdrop").classList.add("hidden");
  awaitingAction = false;
  document.getElementById("roll-btn").disabled = true;
  document.getElementById("end-turn-btn").disabled = false;
  renderPlayersPanel();
}

function checkBankruptcy(player) {
  if (player.money < 0) {
    player.bankrupt = true;
    log(`💥 ${player.name} is bankrupt and out of the game!`);
    player.properties.forEach((id) => { tileMeshes[id].flag.visible = false; });
    player.properties = [];
    checkWinner();
  }
}

function checkWinner() {
  const alive = players.filter((p) => !p.bankrupt);
  if (alive.length === 1) {
    log(`🏆 ${alive[0].name} wins the game!`);
    document.getElementById("dice-result").textContent = `🏆 ${alive[0].name} wins!`;
    document.getElementById("roll-btn").disabled = true;
    document.getElementById("end-turn-btn").disabled = true;
  }
}

function endTurn() {
  if (awaitingAction) return;
  document.getElementById("end-turn-btn").disabled = true;
  nextPlayer();
}

function nextPlayer() {
  const alive = players.filter((p) => !p.bankrupt);
  if (alive.length <= 1) return;
  do {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  } while (players[currentPlayerIndex].bankrupt);
  document.getElementById("roll-btn").disabled = false;
  document.getElementById("dice-result").textContent = `${players[currentPlayerIndex].name}'s turn — roll the dice!`;
  renderPlayersPanel();
}

// ---------- UI HELPERS ----------
function renderPlayersPanel() {
  const panel = document.getElementById("players-panel");
  panel.innerHTML = players.map((p, idx) => {
    const propNames = p.properties.map((id) => BOARD[id].name).join(", ") || "—";
    return `
      <div class="player-card ${idx === currentPlayerIndex ? "active" : ""} ${p.bankrupt ? "bankrupt" : ""}" style="border-left-color:${p.color}">
        <div class="pname">${p.name}</div>
        <div class="pmoney">₹${p.money}</div>
        <div class="pprops">${propNames}</div>
      </div>
    `;
  }).join("");
}

function log(msg) {
  const logEl = document.getElementById("log");
  const div = document.createElement("div");
  div.textContent = msg;
  logEl.prepend(div);
}
