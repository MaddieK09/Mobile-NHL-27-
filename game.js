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

aimIndicatorGroup.visible =
  false;

scene.add(
  aimIndicatorGroup
);

// Giant debug arrow: intentionally impossible to miss.
// Once we prove this renders on-device, we'll replace it
// with the subtle on-ice guide.
const debugAimArrow =
  new THREE.ArrowHelper(
    new THREE.Vector3(0, 0, -1),
    new THREE.Vector3(0, 2.5, 0),
    7,
    0xff00ff,
    1.8,
    0.9
  );

debugAimArrow.visible =
  false;

debugAimArrow.line.material.depthTest =
  false;

debugAimArrow.line.material.depthWrite =
  false;

debugAimArrow.cone.material.depthTest =
  false;

debugAimArrow.cone.material.depthWrite =
  false;

debugAimArrow.line.renderOrder =
  1000;

debugAimArrow.cone.renderOrder =
  1001;

scene.add(
  debugAimArrow
);

const aimLineMaterial =
  new THREE.MeshBasicMaterial({
    color: 0x32d8ff,
    transparent: true,
    opacity: 0.86,
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide
  });

const aimTipMaterial =
  new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.95,
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide
  });

const aimLine =
  new THREE.Mesh(
    new THREE.PlaneGeometry(
      1,
      0.16
    ),
    aimLineMaterial
  );

aimLine.rotation.x =
  -Math.PI / 2;

aimLine.renderOrder = 500;

const aimTipShape =
  new THREE.Shape();

aimTipShape.moveTo(
  0.34,
  0
);

aimTipShape.lineTo(
  -0.18,
  0.22
);

aimTipShape.lineTo(
  -0.18,
  -0.22
);

aimTipShape.closePath();

const aimTip =
  new THREE.Mesh(
    new THREE.ShapeGeometry(
      aimTipShape
    ),
    aimTipMaterial
  );

aimTip.rotation.x =
  -Math.PI / 2;

aimTip.renderOrder = 501;

aimIndicatorGroup.add(
  aimLine
);

aimIndicatorGroup.add(
  aimTip
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

  if (
    normalizedDirection.lengthSq() <
    0.0001
  ) {
    aimIndicatorGroup.visible =
      false;

    return;
  }

  normalizedDirection.normalize();

  const length =
    THREE.MathUtils.lerp(
      2.8,
      7.4,
      THREE.MathUtils.clamp(
        charge,
        0,
        1
      )
    );

  aimStart.set(
    puckPosition.x,
    0.12,
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

  const centerX =
    (aimStart.x +
      aimEnd.x) /
    2;

  const centerZ =
    (aimStart.z +
      aimEnd.z) /
    2;

  const angle =
    Math.atan2(
      normalizedDirection.z,
      normalizedDirection.x
    );

  aimLine.position.set(
    centerX,
    0.12,
    centerZ
  );

  aimLine.scale.set(
    length,
    1,
    1
  );

  aimLine.rotation.set(
    -Math.PI / 2,
    0,
    angle
  );

  aimTip.position.set(
    aimEnd.x,
    0.125,
    aimEnd.z
  );

  aimTip.rotation.set(
    -Math.PI / 2,
    0,
    angle
  );

  const opacity =
    THREE.MathUtils.lerp(
      0.65,
      1,
      charge
    );

  aimLineMaterial.opacity =
    opacity;

  aimTipMaterial.opacity =
    Math.min(
      1,
      opacity + 0.05
    );

  // Slightly widen the guide as charge builds.
  aimLine.scale.y =
    THREE.MathUtils.lerp(
      1,
      1.75,
      charge
    );

  aimIndicatorGroup.visible =
    true;
}

function updateDebugAimArrow(
  direction,
  charge
) {
  if (
    !direction ||
    direction.lengthSq() <
      0.0001
  ) {
    debugAimArrow.visible =
      false;

    return;
  }

  const puckPosition =
    puck.getPosition();

  const debugDirection =
    direction.clone();

  debugDirection.y = 0;

  if (
    debugDirection.lengthSq() <
      0.0001
  ) {
    debugAimArrow.visible =
      false;

    return;
  }

  debugDirection.normalize();

  debugAimArrow.position.set(
    puckPosition.x,
    2.5,
    puckPosition.z
  );

  debugAimArrow.setDirection(
    debugDirection
  );

  debugAimArrow.setLength(
    THREE.MathUtils.lerp(
      5,
      10,
      charge
    ),
    1.8,
    0.9
  );

  debugAimArrow.visible =
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

      updateDebugAimArrow(
        shotAimDirection,
        shotCharge
      );
    } else {
      aimIndicatorGroup.visible =
        false;

      debugAimArrow.visible =
        false;
    }
  } else {
    aimIndicatorGroup.visible =
      false;

    debugAimArrow.visible =
      false;
  }

  if (controls.consumeShootReleased()) {
    puck.releaseChargedShot(
      shotAimDirection
    );

    controls.setShootChargeVisual(0);

    aimIndicatorGroup.visible =
      false;

    debugAimArrow.visible =
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

console.log("ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ°ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ Mobile NHL 27 started.");
console.log("Rink:", rink);
console.log(
  "Camera:",
  cameraManager.getModeLabel()
);
console.log(
  "Puck system ready."
);