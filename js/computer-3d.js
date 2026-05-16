import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const container = document.getElementById("hero-computer");

// Set fixed size for the container in JS to match layout
const width = 450;
const height = 450;

const scene = new THREE.Scene();
// Scene is transparent, so no background color needed

const camera = new THREE.PerspectiveCamera(
  42,
  width / height,
  0.1,
  100
);

camera.position.set(6.8, 4.5, 7.8);

const renderer = new THREE.WebGLRenderer({
  antialias: false,
  alpha: true // Enable transparency
});

renderer.setSize(width, height);
renderer.setPixelRatio(window.devicePixelRatio || 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.enableZoom = false; // Disable zooming so size stays static
controls.enablePan = false;  // Prevent moving the model out of center
controls.autoRotate = true;
controls.autoRotateSpeed = 0.55;
controls.target.set(0, 1.4, 0);

function createPlasticTexture() {
  const size = 96;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ebe6c8";
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 900; i++) {
    const x = Math.floor(Math.random() * size);
    const y = Math.floor(Math.random() * size);
    const shade = 210 + Math.random() * 35;
    ctx.fillStyle = `rgba(${shade}, ${shade}, ${shade - 35}, .23)`;
    ctx.fillRect(x, y, 1, 1);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;

  return texture;
}

let currentScreenMode = 0; // 0 = Terminal, 1 = 3D Engine, 2 = Dino Game
let screenCanvas, screenCtx, screenTexture;
let lastScreenUpdate = 0;

// Dino Game Setup
let dino = { y: 500, vy: 0, gravity: 2.5, jumpPower: -25, isJumping: false, isDead: false, score: 0, hiScore: 0 };
let cacti = [];
let gameSpeed = 15;
let frameCount = 0;

function resetDino() {
    dino.y = 500;
    dino.vy = 0;
    dino.isJumping = false;
    dino.isDead = false;
    dino.score = 0;
    cacti = [];
    gameSpeed = 15;
}

window.addEventListener('keydown', (e) => {
    if (currentScreenMode === 2) {
        if ((e.code === 'Space' || e.code === 'ArrowUp')) {
            e.preventDefault(); // Prevent page scroll
            if (dino.isDead) {
                resetDino();
            } else if (!dino.isJumping) {
                dino.vy = dino.jumpPower;
                dino.isJumping = true;
                if (window.playTypingSound) window.playTypingSound();
            }
        }
    }
});

function initScreenTexture() {
  screenCanvas = document.createElement("canvas");
  screenCanvas.width = 1024;
  screenCanvas.height = 640;
  screenCtx = screenCanvas.getContext("2d");

  screenTexture = new THREE.CanvasTexture(screenCanvas);
  screenTexture.magFilter = THREE.NearestFilter;
  screenTexture.minFilter = THREE.NearestFilter;
  
  // Fix UV mapping for ExtrudeGeometry (width: 3.18, height: 1.82)
  screenTexture.repeat.set(1 / 3.18, 1 / 1.82);
  screenTexture.offset.set(0.5, 0.5);
  
  updateScreenTexture();
  return screenTexture;
}

function updateScreenTexture() {
  if (!screenCtx || !screenTexture) return;
  
  const now = Date.now();
  if (now - lastScreenUpdate < 50) return; // ~20fps
  lastScreenUpdate = now;

  const w = screenCanvas.width;
  const h = screenCanvas.height;

  if (currentScreenMode === 0 || currentScreenMode === 1 || currentScreenMode === 2) {
    // Base clear
    screenCtx.fillStyle = "#041807";
    screenCtx.fillRect(0, 0, w, h);

    // Glow
    const glow = screenCtx.createRadialGradient(512, 320, 80, 512, 320, 560);
    glow.addColorStop(0, "rgba(75, 190, 80, .12)");
    glow.addColorStop(1, "rgba(0, 0, 0, .18)");
    screenCtx.fillStyle = glow;
    screenCtx.fillRect(0, 0, w, h);
  }

  // Static scanlines
  for (let y = 0; y < h; y += 8) {
    screenCtx.fillStyle = "rgba(0,0,0,.28)";
    screenCtx.fillRect(0, y, w, 2);
  }

  // Moving scanline
  const scanY = (now * 0.1) % h;
  screenCtx.fillStyle = "rgba(75, 190, 80, 0.05)";
  screenCtx.fillRect(0, scanY, w, 60);

  screenCtx.imageSmoothingEnabled = false;
  screenCtx.shadowColor = "#8cff8c";
  screenCtx.shadowBlur = 4;

  if (currentScreenMode === 0) {
    // TERMINAL MODE
    screenCtx.font = "bold 56px monospace";
    screenCtx.fillStyle = "#8cff8c";

    const dateObj = new Date();
    const timeStr = dateObj.toLocaleTimeString('ru-RU', { hour12: false });
    const blink = Math.floor(now / 500) % 2 === 0 ? "_" : " ";
    const memAvail = 640 - Math.floor(Math.random() * 24);

    const lines = [
      "KREO-OS v2.0",
      `SYS TIME: ${timeStr}`,
      `MEM: 640K / ${memAvail}K`,
      "NETWORK: ONLINE",
      "STATUS: SECURE",
      `AWAITING CMD${blink}`
    ];

    let textY = 100;
    lines.forEach((line) => {
      screenCtx.fillText(line, 60, textY);
      textY += 80;
    });
  } else if (currentScreenMode === 1) {
    // 3D WIREFRAME ENGINE MODE
    const cx = w / 2;
    const cy = h / 2;
    
    screenCtx.fillStyle = "#8cff8c";
    screenCtx.font = "bold 42px monospace";
    screenCtx.fillText("KREO 3D ENGINE v1.0", 40, 80);
    screenCtx.font = "24px monospace";
    screenCtx.fillText("RENDER: WIREFRAME (HARDWARE ACCEL)", 40, 120);
    
    // 3D Cube Math
    const size = 160;
    const vertices = [
        [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
        [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
    ];
    const edges = [
        [0,1], [1,2], [2,3], [3,0],
        [4,5], [5,6], [6,7], [7,4],
        [0,4], [1,5], [2,6], [3,7]
    ];
    
    const angleX = now * 0.001;
    const angleY = now * 0.0015;
    
    const projected = vertices.map(v => {
        // Rotate Y
        let x = v[0]*Math.cos(angleY) - v[2]*Math.sin(angleY);
        let z = v[0]*Math.sin(angleY) + v[2]*Math.cos(angleY);
        let y = v[1];
        
        // Rotate X
        let y2 = y*Math.cos(angleX) - z*Math.sin(angleX);
        let z2 = y*Math.sin(angleX) + z*Math.cos(angleX);
        
        // Project
        let scale = 400 / (400 + z2 * size);
        return [cx + x * size * scale, cy + y2 * size * scale];
    });
    
    screenCtx.strokeStyle = "#8cff8c";
    screenCtx.lineWidth = 4;
    screenCtx.beginPath();
    edges.forEach(edge => {
        const p1 = projected[edge[0]];
        const p2 = projected[edge[1]];
        screenCtx.moveTo(p1[0], p1[1]);
        screenCtx.lineTo(p2[0], p2[1]);
    });
    screenCtx.stroke();
    
    screenCtx.fillStyle = "rgba(75, 190, 80, 0.8)";
    screenCtx.fillText(`POLYGONS: 12  VERTICES: 8`, 40, 560);
    screenCtx.fillText(`FPS: 20 (LOCKED)`, 40, 600);
    
  } else if (currentScreenMode === 2) {
    // DINO GAME MODE
    frameCount++;
    
    if (!dino.isDead) {
        dino.score++;
        if (dino.score > dino.hiScore) dino.hiScore = dino.score;
        if (dino.score % 500 === 0) gameSpeed += 1;
        
        // Physics
        dino.vy += dino.gravity;
        dino.y += dino.vy;
        
        if (dino.y > 500) {
            dino.y = 500;
            dino.vy = 0;
            dino.isJumping = false;
        }
        
        // Cacti spawn
        if (Math.random() < 0.05 && (cacti.length === 0 || cacti[cacti.length-1].x < w - 400)) {
            cacti.push({ x: w + 50, w: 20, h: 40 + Math.random() * 40 });
        }
        
        for (let i = cacti.length - 1; i >= 0; i--) {
            cacti[i].x -= gameSpeed;
            if (cacti[i].x < -100) cacti.splice(i, 1);
            else {
                // Collision
                const cx = cacti[i].x;
                const cw = cacti[i].w;
                const ch = cacti[i].h;
                
                // Dino box approx: x: 90 to 140, y: dino.y - 44 to dino.y
                if (140 > cx - 10 && 90 < cx + cw + 10 && dino.y > 500 - ch && dino.y - 44 < 500) {
                    dino.isDead = true;
                }
            }
        }
    }
    
    // Draw Ground
    screenCtx.fillStyle = "#8cff8c";
    screenCtx.fillRect(0, 500, w, 4);
    
    // Draw Cacti
    cacti.forEach(c => {
        screenCtx.fillRect(c.x, 500 - c.h, c.w, c.h);
        // Arms
        screenCtx.fillRect(c.x - 12, 500 - c.h + 10, 12, 16);
        screenCtx.fillRect(c.x + c.w, 500 - c.h + 24, 12, 16);
    });
    
    // Draw Dino (Pixel style)
    const dx = 100;
    const dy = dino.y;
    screenCtx.fillStyle = "#8cff8c";
    screenCtx.fillRect(dx + 20, dy - 44, 24, 20); // Head
    screenCtx.fillStyle = "#041807";
    screenCtx.fillRect(dx + 26, dy - 40, 4, 4); // Eye
    screenCtx.fillStyle = "#8cff8c";
    screenCtx.fillRect(dx + 24, dy - 24, 16, 4); // Snout
    screenCtx.fillRect(dx, dy - 24, 20, 20); // Body
    screenCtx.fillRect(dx - 10, dy - 28, 10, 8); // Tail
    screenCtx.fillRect(dx + 20, dy - 16, 8, 4); // Arm
    
    // Legs
    if (dino.isDead || dino.isJumping) {
        screenCtx.fillRect(dx, dy - 4, 8, 4);
        screenCtx.fillRect(dx + 12, dy - 4, 8, 4);
    } else {
        if (Math.floor(frameCount / 3) % 2 === 0) {
            screenCtx.fillRect(dx, dy - 4, 8, 4); 
            screenCtx.fillRect(dx + 12, dy, 8, 4); 
        } else {
            screenCtx.fillRect(dx, dy, 8, 4); 
            screenCtx.fillRect(dx + 12, dy - 4, 8, 4); 
        }
    }
    
    // Score
    screenCtx.font = "bold 32px monospace";
    screenCtx.fillText(`HI: ${Math.floor(dino.hiScore/5)}  SCORE: ${Math.floor(dino.score/5)}`, w - 400, 60);
    
    if (dino.isDead) {
        screenCtx.font = "bold 56px monospace";
        screenCtx.fillText("G A M E  O V E R", w/2 - 240, h/2 - 50);
        screenCtx.font = "24px monospace";
        screenCtx.fillText("PRESS SPACE TO RESTART", w/2 - 160, h/2 + 20);
    } else if (dino.score === 0) {
        screenCtx.font = "24px monospace";
        screenCtx.fillText("PRESS SPACE TO JUMP", 100, 400);
    }
  }

  // Vignette
  const vignette = screenCtx.createRadialGradient(512, 320, 200, 512, 320, 660);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,.62)");
  screenCtx.fillStyle = vignette;
  screenCtx.fillRect(0, 0, w, h);

  screenTexture.needsUpdate = true;
}

const plasticMat = new THREE.MeshStandardMaterial({
  color: "#eee8c8",
  map: createPlasticTexture(),
  roughness: 0.92,
  metalness: 0.02
});

const plasticDarkMat = new THREE.MeshStandardMaterial({
  color: "#cfc89e",
  roughness: 0.92
});

const darkMat = new THREE.MeshStandardMaterial({
  color: "#101010",
  roughness: 0.9
});

const blackMat = new THREE.MeshStandardMaterial({
  color: "#040404",
  roughness: 0.85
});

const grayMat = new THREE.MeshStandardMaterial({
  color: "#5b5b5b",
  roughness: 0.88
});

const screenMat = new THREE.MeshBasicMaterial({
  map: initScreenTexture()
});

const greenGlowMat = new THREE.MeshBasicMaterial({
  color: "#35ff52",
  transparent: true,
  opacity: 0.035
});

const group = new THREE.Group();
scene.add(group);

function cube(w, h, d, x, y, z, mat) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function bevelBox(w, h, d, x, y, z, mat, bevel = 0.08) {
  const shape = new THREE.Shape();

  const hw = w / 2;
  const hh = h / 2;

  shape.moveTo(-hw + bevel, -hh);
  shape.lineTo(hw - bevel, -hh);
  shape.lineTo(hw, -hh + bevel);
  shape.lineTo(hw, hh - bevel);
  shape.lineTo(hw - bevel, hh);
  shape.lineTo(-hw + bevel, hh);
  shape.lineTo(-hw, hh - bevel);
  shape.lineTo(-hw, -hh + bevel);
  shape.lineTo(-hw + bevel, -hh);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: d,
    bevelEnabled: false
  });

  geo.center();

  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

// Основной передний корпус
bevelBox(4.9, 3.55, 1.15, 0, 1.85, 0.82, plasticMat, 0.22);

// Задняя объемная CRT-часть
const back = bevelBox(3.85, 2.95, 2.95, 0, 1.92, -1.16, plasticMat, 0.18);
back.scale.set(0.88, 0.9, 1);

// Задний хвост
const tail = bevelBox(3.05, 2.45, 1.7, 0, 1.9, -2.55, plasticMat, 0.12);
tail.scale.set(0.82, 0.86, 1);

// Верхняя крышка
cube(4.65, 0.18, 3.65, 0, 3.72, -0.42, plasticDarkMat);

// Нижняя губа корпуса
cube(4.7, 0.22, 1.1, 0, 0.12, 1.05, plasticDarkMat);

// Внешняя рамка экрана
bevelBox(3.85, 2.45, 0.2, 0, 2.25, 1.48, plasticDarkMat, 0.16);

// Черная внутренняя рамка
bevelBox(3.45, 2.08, 0.13, 0, 2.28, 1.61, blackMat, 0.18);

// Зеленый экран с текстом
bevelBox(3.18, 1.82, 0.055, 0, 2.3, 1.695, screenMat, 0.18);

// Легкое свечение экрана
const glowPanel = bevelBox(3.2, 1.85, 0.018, 0, 2.3, 1.735, greenGlowMat, 0.18);
glowPanel.castShadow = false;
glowPanel.receiveShadow = false;

// Нижняя передняя панель
cube(4.35, 0.65, 0.34, 0, 0.62, 1.54, plasticMat);

// Табличка
cube(0.92, 0.28, 0.035, -1.45, 0.87, 1.735, plasticDarkMat);

// Дисковод
cube(0.92, 0.31, 0.045, -1.55, 0.52, 1.735, darkMat);
cube(0.68, 0.11, 0.035, -1.55, 0.53, 1.765, plasticMat);

// Зеленый индикатор
const led = new THREE.Mesh(
  new THREE.BoxGeometry(0.09, 0.09, 0.025),
  new THREE.MeshBasicMaterial({ color: "#56d85d" })
);
led.position.set(-0.9, 0.58, 1.755);
group.add(led);

// Передняя решетка
for (let i = 0; i < 9; i++) {
  cube(0.045, 0.25, 0.025, -0.48 + i * 0.11, 0.55, 1.755, darkMat);
}

// Круглые кнопки
const interactiveButtons = [];
const buttonXPositions = [0.85, 1.45, 2.05];

buttonXPositions.forEach((x, index) => {
  const btn = new THREE.Mesh(
    new THREE.CylinderGeometry(0.17, 0.17, 0.055, 16),
    darkMat
  );

  btn.rotation.x = Math.PI / 2;
  btn.position.set(x, 0.57, 1.765);
  btn.castShadow = true;
  btn.userData = { isButton: true, mode: index };
  
  interactiveButtons.push(btn);
  group.add(btn);
});

// Боковая кнопка
cube(0.05, 0.38, 0.25, -2.49, 1.1, 1.05, darkMat);

// Подставка
cube(1.55, 0.55, 1.05, 0, -0.25, 0.15, grayMat);
bevelBox(3.55, 0.32, 2.15, 0, -0.72, 0.15, grayMat, 0.15);

// Свет
const ambient = new THREE.AmbientLight("#ffffff", 0.72);
scene.add(ambient);

const keyLight = new THREE.DirectionalLight("#ffffff", 2.2);
keyLight.position.set(5, 7, 6);
keyLight.castShadow = true;
keyLight.shadow.mapSize.width = 1024;
keyLight.shadow.mapSize.height = 1024;
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight("#bfc9ff", 0.45);
fillLight.position.set(-5, 3, 2);
scene.add(fillLight);

const screenGlow = new THREE.PointLight("#2ecc46", 0.25, 2.5);
screenGlow.position.set(0, 2.2, 2.05);
scene.add(screenGlow);

// Пол / тень
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20),
  new THREE.ShadowMaterial({ opacity: 0.28 })
);

floor.rotation.x = -Math.PI / 2;
floor.position.y = -0.9;
floor.receiveShadow = true;
scene.add(floor);

group.rotation.y = -0.15;

// RAYCASTER FOR INTERACTIVE BUTTONS
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

renderer.domElement.addEventListener('pointerdown', (e) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactiveButtons);
    
    if (intersects.length > 0) {
        const btn = intersects[0].object;
        
        // If clicking the game button while the game is already active, jump!
        if (btn.userData.mode === 2 && currentScreenMode === 2) {
            if (dino.isDead) {
                resetDino();
            } else if (!dino.isJumping) {
                dino.vy = dino.jumpPower;
                dino.isJumping = true;
                if (window.playTypingSound) window.playTypingSound();
            }
        } else {
            // Change Screen Mode
            currentScreenMode = btn.userData.mode;
            
            if (currentScreenMode === 2) {
                // Orient camera roughly straight-on when starting the game
                // So the user can see the game clearly
                // We'll let orbit controls damping handle the smooth rotation towards this
                // if we don't force it, but just stopping auto-rotate is enough.
            }
        }
        
        // Push button animation
        btn.position.z = 1.74;
        setTimeout(() => {
            btn.position.z = 1.765;
        }, 150);
        
        // Play sound if available
        if (window.playBootSound) window.playBootSound();
    }
});

function animate() {
  requestAnimationFrame(animate);

  screenGlow.intensity = 0.22 + Math.sin(Date.now() * 0.006) * 0.04;

  // Stop rotating when playing Dino
  controls.autoRotate = (currentScreenMode !== 2);

  updateScreenTexture();

  controls.update();
  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  renderer.setSize(width, height); // Keep fixed size
});
