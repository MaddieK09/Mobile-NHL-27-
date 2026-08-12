import * as THREE from "three";
import { createRink } from "./rink.js";
import { HockeyPlayer } from "./player.js";
// ==================================================
// MOBILE NHL 27 - MAIN GAME
// ==================================================

// --------------------------------------------------
// DOM
// --------------------------------------------------

const gameContainer = document.getElementById("game-container");
const loadingScreen = document.getElementById("loading-screen");

// --------------------------------------------------
// SCENE
// --------------------------------------------------

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x07111f);

// --------------------------------------------------
// CAMERA
// --------------------------------------------------

const camera = new THREE.PerspectiveCamera(
  55,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(0, 38, 52);
camera.lookAt(0, 0, 0);

// --------------------------------------------------
// RENDERER
// --------------------------------------------------

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance"
});

renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2)
);

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.outputColorSpace = THREE.SRGBColorSpace;

gameContainer.appendChild(renderer.domElement);

// --------------------------------------------------
// LIGHTING
// --------------------------------------------------

const ambientLight = new THREE.AmbientLight(
  0xffffff,
  1.5
);

scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(
  0xffffff,
  2.2
);

mainLight.position.set(20, 40, 15);
mainLight.castShadow = true;

scene.add(mainLight);

const fillLight = new THREE.DirectionalLight(
  0xcfe7ff,
  0.8
);

fillLight.position.set(-20, 25, -15);

scene.add(fillLight);

// --------------------------------------------------
// ARENA FLOOR
// --------------------------------------------------

const arenaFloorGeometry = new THREE.PlaneGeometry(
  120,
  100
);

const arenaFloorMaterial = new THREE.MeshStandardMaterial({
  color: 0x151a22,
  roughness: 0.9
});

const arenaFloor = new THREE.Mesh(
  arenaFloorGeometry,
  arenaFloorMaterial
);

arenaFloor.rotation.x = -Math.PI / 2;
arenaFloor.position.y = -0.10;
arenaFloor.receiveShadow = true;

scene.add(arenaFloor);

// --------------------------------------------------
// BUILD RINK
// --------------------------------------------------

const rink = createRink(scene);
// PLAYER
const player = new HockeyPlayer(scene, {
  x: 0,
  z: 6,
  rotation: Math.PI,
  teamColor: 0x1f5dbb
});
// --------------------------------------------------
// TEMPORARY PUCK
// --------------------------------------------------
//
// puck.js will replace this shortly.

const puckGeometry = new THREE.CylinderGeometry(
  0.38,
  0.38,
  0.16,
  32
);

const puckMaterial = new THREE.MeshStandardMaterial({
  color: 0x080808,
  roughness: 0.75
});

const puck = new THREE.Mesh(
  puckGeometry,
  puckMaterial
);

puck.position.set(0, 0.12, 0);
puck.castShadow = true;

scene.add(puck);

// --------------------------------------------------
// RESIZE
// --------------------------------------------------

function resizeGame() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
  );
}

window.addEventListener(
  "resize",
  resizeGame
);

window.addEventListener(
  "orientationchange",
  resizeGame
);

// --------------------------------------------------
// GAME LOOP
// --------------------------------------------------

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(
    clock.getDelta(),
    0.05
  );
player.update(delta);
  // Temporary visual proof that the loop is alive.
  puck.rotation.y += delta * 0.5;

  renderer.render(
    scene,
    camera
  );
}

// --------------------------------------------------
// START
// --------------------------------------------------

resizeGame();
animate();

if (loadingScreen) {
  loadingScreen.classList.add("hidden");
}

console.log("🏒 Mobile NHL 27 started.");
console.log("Rink:", rink);