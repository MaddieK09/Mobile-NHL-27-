import * as THREE from "three";

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

// Temporary broadcast-style camera position.
// Later this will move into camera.js.
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

renderer.shadowMap.type =
  THREE.PCFSoftShadowMap;

renderer.outputColorSpace =
  THREE.SRGBColorSpace;

gameContainer.appendChild(renderer.domElement);

// --------------------------------------------------
// LIGHTING
// --------------------------------------------------

const ambientLight = new THREE.AmbientLight(
  0xffffff,
  1.6
);

scene.add(ambientLight);

const arenaLight = new THREE.DirectionalLight(
  0xffffff,
  2.2
);

arenaLight.position.set(20, 40, 15);

arenaLight.castShadow = true;

scene.add(arenaLight);

// --------------------------------------------------
// TEMPORARY ICE SURFACE
// --------------------------------------------------

// This is intentionally simple.
//
// rink.js will replace this with the real NHL rink
// including:
// - rounded corners
// - boards
// - glass
// - blue lines
// - goal lines
// - faceoff circles
// - creases
// - nets

const iceGeometry = new THREE.PlaneGeometry(
  60,
  26
);

const iceMaterial = new THREE.MeshStandardMaterial({
  color: 0xeaf8ff,
  roughness: 0.28,
  metalness: 0.02
});

const ice = new THREE.Mesh(
  iceGeometry,
  iceMaterial
);

ice.rotation.x = -Math.PI / 2;

ice.receiveShadow = true;

scene.add(ice);

// --------------------------------------------------
// CENTER RED LINE
// --------------------------------------------------

const centerLineGeometry = new THREE.PlaneGeometry(
  0.25,
  26
);

const centerLineMaterial = new THREE.MeshBasicMaterial({
  color: 0xcc2438
});

const centerLine = new THREE.Mesh(
  centerLineGeometry,
  centerLineMaterial
);

centerLine.rotation.x = -Math.PI / 2;

centerLine.position.y = 0.015;

scene.add(centerLine);

// --------------------------------------------------
// BLUE LINES
// --------------------------------------------------

function createBlueLine(x) {
  const geometry = new THREE.PlaneGeometry(
    0.35,
    26
  );

  const material = new THREE.MeshBasicMaterial({
    color: 0x2366c9
  });

  const line = new THREE.Mesh(
    geometry,
    material
  );

  line.rotation.x = -Math.PI / 2;

  line.position.set(
    x,
    0.02,
    0
  );

  scene.add(line);
}

createBlueLine(-10);
createBlueLine(10);

// --------------------------------------------------
// CENTER FACE-OFF CIRCLE
// --------------------------------------------------

const faceoffCircleGeometry =
  new THREE.RingGeometry(
    3.4,
    3.65,
    64
  );

const faceoffCircleMaterial =
  new THREE.MeshBasicMaterial({
    color: 0xcc2438,
    side: THREE.DoubleSide
  });

const faceoffCircle = new THREE.Mesh(
  faceoffCircleGeometry,
  faceoffCircleMaterial
);

faceoffCircle.rotation.x =
  -Math.PI / 2;

faceoffCircle.position.y = 0.025;

scene.add(faceoffCircle);

// --------------------------------------------------
// CENTER DOT
// --------------------------------------------------

const centerDotGeometry =
  new THREE.CircleGeometry(
    0.3,
    32
  );

const centerDotMaterial =
  new THREE.MeshBasicMaterial({
    color: 0x234fc7,
    side: THREE.DoubleSide
  });

const centerDot = new THREE.Mesh(
  centerDotGeometry,
  centerDotMaterial
);

centerDot.rotation.x =
  -Math.PI / 2;

centerDot.position.y = 0.03;

scene.add(centerDot);

// --------------------------------------------------
// TEMPORARY BOARDS
// --------------------------------------------------

const boardMaterial =
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.55
  });

function createBoard(
  width,
  height,
  depth,
  x,
  y,
  z
) {
  const geometry =
    new THREE.BoxGeometry(
      width,
      height,
      depth
    );

  const board = new THREE.Mesh(
    geometry,
    boardMaterial
  );

  board.position.set(
    x,
    y,
    z
  );

  board.castShadow = true;
  board.receiveShadow = true;

  scene.add(board);
}

// Long side boards
createBoard(
  60,
  1.5,
  0.45,
  0,
  0.75,
  -13.2
);

createBoard(
  60,
  1.5,
  0.45,
  0,
  0.75,
  13.2
);

// End boards
createBoard(
  0.45,
  1.5,
  26,
  -30.2,
  0.75,
  0
);

createBoard(
  0.45,
  1.5,
  26,
  30.2,
  0.75,
  0
);

// --------------------------------------------------
// SIMPLE ARENA FLOOR
// --------------------------------------------------

const arenaFloorGeometry =
  new THREE.PlaneGeometry(
    120,
    100
  );

const arenaFloorMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x141b24,
    roughness: 0.9
  });

const arenaFloor = new THREE.Mesh(
  arenaFloorGeometry,
  arenaFloorMaterial
);

arenaFloor.rotation.x =
  -Math.PI / 2;

arenaFloor.position.y = -0.08;

arenaFloor.receiveShadow = true;

scene.add(arenaFloor);

// Put the ice above the arena floor.
ice.position.y = 0;

// --------------------------------------------------
// TEMPORARY PUCK
// --------------------------------------------------

// This is only here so we have something visibly
// 3D on the ice.
//
// puck.js will replace this.

const puckGeometry =
  new THREE.CylinderGeometry(
    0.38,
    0.38,
    0.16,
    32
  );

const puckMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x090909,
    roughness: 0.7
  });

const puck = new THREE.Mesh(
  puckGeometry,
  puckMaterial
);

puck.position.set(
  0,
  0.12,
  0
);

puck.castShadow = true;

scene.add(puck);

// --------------------------------------------------
// RESIZE
// --------------------------------------------------

function resizeGame() {
  const width =
    window.innerWidth;

  const height =
    window.innerHeight;

  camera.aspect =
    width / height;

  camera.updateProjectionMatrix();

  renderer.setSize(
    width,
    height
  );

  renderer.setPixelRatio(
    Math.min(
      window.devicePixelRatio,
      2
    )
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
  requestAnimationFrame(
    animate
  );

  const delta =
    clock.getDelta();

  // Tiny rotation purely to prove that the
  // animation loop is running.
  puck.rotation.y +=
    delta * 0.5;

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
  loadingScreen.classList.add(
    "hidden"
  );
}

console.log(
  "Mobile NHL 27 3D engine started."
);
