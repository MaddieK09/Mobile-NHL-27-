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
// SHOT AIM INDICATOR
// --------------------------------------------------

const aimIndicatorGroup =
  new THREE.Group();

const aimLineMaterial =
  new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.72,
    depthTest: false
  });

const aimLineGeometry =
  new THREE.BufferGeometry();

const aimLine =
  new THREE.Line(
    aimLineGeometry,
    aimLineMaterial
  );

aimLine.renderOrder = 50;

const aimTipGeometry =
  new THREE.ConeGeometry(
    0.18,
    0.46,
    18
  );

const aimTipMaterial =
  new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.82,
    depthTest: false
  });

const aimTip =
  new THREE.Mesh(
    aimTipGeometry,
    aimTipMaterial
  );

aimTip.rotation.x =
  Math.PI / 2;

aimTip.renderOrder = 51;

aimIndicatorGroup.add(
  aimLine
);

aimIndicatorGroup.add(
  aimTip
);

aimIndicatorGroup.visible =
  false;

scene.add(
  aimIndicatorGroup
);

const aimStart =
  new THREE.Vector3();

const aimEnd =
  new THREE.Vector3();

function updateShotAimIndicator(
  direction,
  charge
) {
  if (
    !direction ||
    direction.lengthSq() <
      0.0001
  ) {
    aimIndicatorGroup.visible =
      false;

    return;
  }

  const puckPosition =
    puck.getPosition();

  const normalizedDirection =
    direction.clone();

  normalizedDirection.y = 0;
  normalizedDirection.normalize();

  const length =
    THREE.MathUtils.lerp(
      2.2,
      6.5,
      THREE.MathUtils.clamp(
        charge,
        0,
        1
      )
    );

  aimStart.set(
    puckPosition.x,
    0.035,
    puckPosition.z
  );

  aimEnd
    .copy(
      aimStart
    )
    .addScaledVector(
      normalizedDirection,
      length
    );

  aimLine.geometry.setFromPoints([
    aimStart,
    aimEnd
  ]);

  aimTip.position.copy(
    aimEnd
  );

  // Cone's local +Y axis is the arrow direction before
  // the X rotation above, so orient the group on the ice.
  const angle =
    Math.atan2(
      normalizedDirection.x,
      normalizedDirection.z
    );

  aimTip.rotation.set(
    Math.PI / 2,
    0,
    -angle
  );

  const opacity =
    THREE.MathUtils.lerp(
      0.45,
      0.95,
      charge
    );

  aimLineMaterial.opacity =
    opacity;

  aimTipMaterial.opacity =
    Math.min(
      1,
      opacity + 0.08
    );

  aimIndicatorGroup.visible =
    true;
}

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

const shotAimDirection = new THREE.Vector3();
const shotFacingDirection = new THREE.Vector3();

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
  if (controls.consumeShootPressed()) {
    puck.startShotCharge();
  }

  // Recalculate aim every frame so the on-ice indicator and
  // the released shot always use the exact same direction.
  shotFacingDirection.copy(
    puck.getPlayerForward(player)
  );

  shotAimDirection.copy(
    shotFacingDirection
  );

  if (
    worldMovement &&
    worldMovement.magnitude > 0.12
  ) {
    const movementAim =
      new THREE.Vector3(
        worldMovement.x,
        0,
        worldMovement.z
      );

    if (
      movementAim.lengthSq() >
      0.0001
    ) {
      movementAim.normalize();

      shotAimDirection
        .multiplyScalar(0.38)
        .addScaledVector(
          movementAim,
          0.62
        )
        .normalize();
    }
  }

  if (controls.isShootHeld()) {
    puck.updateShotCharge(delta);

    const shotCharge =
      puck.getShotCharge01();

    controls.setShootChargeVisual(
      shotCharge
    );

    if (puck.isPossessed()) {
      updateShotAimIndicator(
        shotAimDirection,
        shotCharge
      );
    } else {
      aimIndicatorGroup.visible =
        false;
    }
  } else {
    aimIndicatorGroup.visible =
      false;
  }

  if (controls.consumeShootReleased()) {
    puck.releaseChargedShot(
      shotAimDirection
    );

    controls.setShootChargeVisual(0);
    aimIndicatorGroup.visible =
      false;
  }

  if (
    !controls.isShootHeld() &&
    !puck.isChargingShot
  ) {
    controls.setShootChargeVisual(0);
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

console.log("ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ°ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ Mobile NHL 27 started.");
console.log("Rink:", rink);
console.log(
  "Camera:",
  cameraManager.getModeLabel()
);
console.log(
  "Puck system ready."
);