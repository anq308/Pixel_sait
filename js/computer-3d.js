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

function createScreenTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 320;

  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#041807";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const glow = ctx.createRadialGradient(256, 160, 40, 256, 160, 280);
  glow.addColorStop(0, "rgba(75, 190, 80, .12)");
  glow.addColorStop(1, "rgba(0, 0, 0, .18)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < canvas.height; y += 5) {
    ctx.fillStyle = "rgba(0,0,0,.28)";
    ctx.fillRect(0, y, canvas.width, 1);
  }

  ctx.imageSmoothingEnabled = false;
  ctx.font = "bold 36px monospace";
  ctx.fillStyle = "#8cff8c";
  ctx.shadowColor = "#8cff8c";
  ctx.shadowBlur = 2;

  const lines = [
    "PIXEL-OS v1.0",
    "READY >_",
    "SYSTEM ONLINE",
    "MEM: 64KB",
    "TURBOWEB",
    "DESIGN / CODE"
  ];

  let y = 62;

  lines.forEach((line) => {
    ctx.fillText(line, 36, y);
    y += 42;
  });

  const vignette = ctx.createRadialGradient(256, 160, 100, 256, 160, 330);
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,.62)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.needsUpdate = true;

  return texture;
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
  map: createScreenTexture()
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
const buttonX = [0.85, 1.45, 2.05];

buttonX.forEach((x) => {
  const btn = new THREE.Mesh(
    new THREE.CylinderGeometry(0.17, 0.17, 0.055, 16),
    darkMat
  );

  btn.rotation.x = Math.PI / 2;
  btn.position.set(x, 0.57, 1.765);
  btn.castShadow = true;
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

function animate() {
  requestAnimationFrame(animate);

  screenGlow.intensity = 0.22 + Math.sin(Date.now() * 0.006) * 0.04;

  controls.update();
  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  renderer.setSize(width, height); // Keep fixed size
});
