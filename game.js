import * as THREE from "three";
import { createRink } from "./rink.js";
import { HockeyPlayer } from "./player.js";
import { Controls } from "./controls.js";
import { CameraManager, CAMERA_MODES } from "./camera.js";
import { HockeyPuck } from "./puck.js";
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
// CONTROLS
// --------------------------------------------------

const controls = new Controls();

// --------------------------------------------------
// GAMEPLAY CAMERA
// --------------------------------------------------

const cameraManager = new CameraManager(
  camera,
  player,
  {
    mode: CAMERA_MODES.DYNAMIC
  }
);

// Snap immediately to the closer landscape follow camera.
cameraManager.update(0);
// --------------------------------------------------
// PUCK
// --------------------------------------------------

const puck = new HockeyPuck(
  scene,
  {
    x: 0,
    z: 0
  }
);

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
  const movement =
    controls.getMovement();

  const worldMovement =
    cameraManager.getWorldMovement(
      movement
    );

  player.update(
    delta,
    worldMovement
  );

  cameraManager.update(delta);

  // ------------------------------------------------
  // HOCKEY ACTIONS
  // ------------------------------------------------

  // Hold SHOOT to charge, release to fire.
  if (
    controls.consumeShootPressed()
  ) {
    puck.startShotCharge();
  }

  if (
    controls.isShootHeld()
  ) {
    puck.updateShotCharge(
      delta
    );
  }

  if (
    controls.consumeShootReleased()
  ) {
    const shotDirection =
      puck.getPlayerForward(
        player
      );

    puck.releaseChargedShot(
      shotDirection
    );
  }

  if (
    controls.consumeAction(
      "pass"
    )
  ) {
    // For now, pass in the direction the skater is
    // facing. Later this will use teammates / aiming.
    const passDirection =
      puck.getPlayerForward(
        player
      );

    puck.pass(
      passDirection,
      12
    );
  }

  puck.update(
    delta,
    player
  );

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

console.log("ÃÂÃÂÃÂÃÂ°ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ Mobile NHL 27 started.");
console.log("Rink:", rink);
console.log(
  "Camera:",
  cameraManager.getModeLabel()
);
console.log(
  "Puck system ready."
);