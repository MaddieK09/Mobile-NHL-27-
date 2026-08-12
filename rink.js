import * as THREE from "three";

// ==================================================
// MOBILE NHL 27 - RINK
// ==================================================
//
// Internal scale:
// 1 real foot = 0.30 Three.js units
//
// NHL rink:
// 200 ft long
// 85 ft wide
// 28 ft corner radius
//
// That becomes:
// 60 x 25.5 game units
// ==================================================

const SCALE = 0.30;

export const RINK = {
  length: 200 * SCALE,
  width: 85 * SCALE,
  cornerRadius: 28 * SCALE,

  boardHeight: 3.5 * SCALE,
  boardThickness: 1.0 * SCALE,

  glassHeight: 6 * SCALE,

  goalLineX: 89 * SCALE,
  blueLineX: 25 * SCALE,

  faceoffRadius: 15 * SCALE,

  creaseRadius: 6 * SCALE
};

// --------------------------------------------------
// MATERIALS
// --------------------------------------------------

const iceMaterial =
  new THREE.MeshStandardMaterial({
    color: 0xf1fbff,
    roughness: 0.20,
    metalness: 0.02
  });

const boardMaterial =
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.48
  });

const yellowKickplateMaterial =
  new THREE.MeshStandardMaterial({
    color: 0xf3c623,
    roughness: 0.55
  });

const glassMaterial =
  new THREE.MeshPhysicalMaterial({
    color: 0xcfeeff,
    transparent: true,
    opacity: 0.18,
    roughness: 0.05,
    metalness: 0,
    transmission: 0.35,
    depthWrite: false,
    side: THREE.DoubleSide
  });

const redMaterial =
  new THREE.MeshBasicMaterial({
    color: 0xc92032,
    side: THREE.DoubleSide
  });

const blueMaterial =
  new THREE.MeshBasicMaterial({
    color: 0x1763bd,
    side: THREE.DoubleSide
  });

const creaseMaterial =
  new THREE.MeshBasicMaterial({
    color: 0x9ed8f5,
    transparent: true,
    opacity: 0.65,
    side: THREE.DoubleSide
  });

// --------------------------------------------------
// ROUNDED RINK SHAPE
// --------------------------------------------------

function createRinkShape() {
  const halfLength =
    RINK.length / 2;

  const halfWidth =
    RINK.width / 2;

  const r =
    RINK.cornerRadius;

  const shape =
    new THREE.Shape();

  shape.moveTo(
    -halfLength + r,
    -halfWidth
  );

  shape.lineTo(
    halfLength - r,
    -halfWidth
  );

  shape.absarc(
    halfLength - r,
    -halfWidth + r,
    r,
    -Math.PI / 2,
    0,
    false
  );

  shape.lineTo(
    halfLength,
    halfWidth - r
  );

  shape.absarc(
    halfLength - r,
    halfWidth - r,
    r,
    0,
    Math.PI / 2,
    false
  );

  shape.lineTo(
    -halfLength + r,
    halfWidth
  );

  shape.absarc(
    -halfLength + r,
    halfWidth - r,
    r,
    Math.PI / 2,
    Math.PI,
    false
  );

  shape.lineTo(
    -halfLength,
    -halfWidth + r
  );

  shape.absarc(
    -halfLength + r,
    -halfWidth + r,
    r,
    Math.PI,
    Math.PI * 1.5,
    false
  );

  shape.closePath();

  return shape;
}

// --------------------------------------------------
// ICE
// --------------------------------------------------

function createIce() {
  const geometry =
    new THREE.ShapeGeometry(
      createRinkShape(),
      64
    );

  const ice =
    new THREE.Mesh(
      geometry,
      iceMaterial
    );

  ice.rotation.x =
    -Math.PI / 2;

  ice.position.y = 0;

  ice.receiveShadow = true;

  return ice;
}

// --------------------------------------------------
// FLAT RECTANGLE MARKING
// --------------------------------------------------

function createFlatRectangle(
  width,
  depth,
  colorMaterial,
  x = 0,
  z = 0,
  y = 0.018
) {
  const geometry =
    new THREE.PlaneGeometry(
      width,
      depth
    );

  const mesh =
    new THREE.Mesh(
      geometry,
      colorMaterial
    );

  mesh.rotation.x =
    -Math.PI / 2;

  mesh.position.set(
    x,
    y,
    z
  );

  return mesh;
}

// --------------------------------------------------
// CIRCLE OUTLINE
// --------------------------------------------------

function createCircleOutline(
  radius,
  x,
  z,
  material = redMaterial,
  thickness = 0.12
) {
  const geometry =
    new THREE.RingGeometry(
      radius - thickness,
      radius,
      64
    );

  const circle =
    new THREE.Mesh(
      geometry,
      material
    );

  circle.rotation.x =
    -Math.PI / 2;

  circle.position.set(
    x,
    0.026,
    z
  );

  return circle;
}

// --------------------------------------------------
// FACE-OFF DOT
// --------------------------------------------------

function createFaceoffDot(
  x,
  z,
  material = redMaterial,
  radius = 0.30
) {
  const geometry =
    new THREE.CircleGeometry(
      radius,
      32
    );

  const dot =
    new THREE.Mesh(
      geometry,
      material
    );

  dot.rotation.x =
    -Math.PI / 2;

  dot.position.set(
    x,
    0.029,
    z
  );

  return dot;
}

// --------------------------------------------------
// CREASE
// --------------------------------------------------

function createCrease(
  side
) {
  const radius =
    RINK.creaseRadius;

  const shape =
    new THREE.Shape();

  const goalX =
    side * RINK.goalLineX;

  // Crease extends toward center ice.
  const direction =
    -side;

  shape.moveTo(
    goalX,
    -radius
  );

  shape.absarc(
    goalX,
    0,
    radius,
    -Math.PI / 2,
    Math.PI / 2,
    side < 0
  );

  shape.lineTo(
    goalX,
    radius
  );

  shape.closePath();

  const geometry =
    new THREE.ShapeGeometry(
      shape,
      32
    );

  const crease =
    new THREE.Mesh(
      geometry,
      creaseMaterial
    );

  crease.rotation.x =
    -Math.PI / 2;

  crease.position.y =
    0.021;

  // ShapeGeometry uses XY.
  // Our x coordinates already match rink x.
  //
  // Mirroring ensures the filled portion faces
  // center ice on both ends.

  if (direction < 0) {
    crease.scale.x = -1;
  }

  return crease;
}

// --------------------------------------------------
// GOAL
// --------------------------------------------------

function createGoal(
  side
) {
  const goal =
    new THREE.Group();

  const postMaterial =
    new THREE.MeshStandardMaterial({
      color: 0xd71920,
      roughness: 0.38
    });

  const netMaterial =
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.34,
      wireframe: true
    });

  const postRadius =
    0.075;

  const goalWidth =
    6 * SCALE;

  const goalHeight =
    4 * SCALE;

  const goalDepth =
    3.5 * SCALE;

  const x =
    side *
    (
      RINK.goalLineX +
      goalDepth * 0.48
    );

  // Vertical posts

  for (const z of [
    -goalWidth / 2,
    goalWidth / 2
  ]) {
    const geometry =
      new THREE.CylinderGeometry(
        postRadius,
        postRadius,
        goalHeight,
        12
      );

    const post =
      new THREE.Mesh(
        geometry,
        postMaterial
      );

    post.position.set(
      x -
        side *
        goalDepth /
        2,
      goalHeight / 2,
      z
    );

    post.castShadow = true;

    goal.add(post);
  }

  // Crossbar

  const crossbarGeometry =
    new THREE.CylinderGeometry(
      postRadius,
      postRadius,
      goalWidth,
      12
    );

  const crossbar =
    new THREE.Mesh(
      crossbarGeometry,
      postMaterial
    );

  crossbar.rotation.x =
    Math.PI / 2;

  crossbar.position.set(
    x -
      side *
      goalDepth /
      2,
    goalHeight,
    0
  );

  goal.add(crossbar);

  // Basic net volume

  const netGeometry =
    new THREE.BoxGeometry(
      goalDepth,
      goalHeight,
      goalWidth
    );

  const net =
    new THREE.Mesh(
      netGeometry,
      netMaterial
    );

  net.position.set(
    x,
    goalHeight / 2,
    0
  );

  goal.add(net);

  return goal;
}

// --------------------------------------------------
// RINK PERIMETER POINTS
// --------------------------------------------------

function getPerimeterPoints() {
  const points = [];

  const halfLength =
    RINK.length / 2;

  const halfWidth =
    RINK.width / 2;

  const r =
    RINK.cornerRadius;

  const straightSegments = 18;
  const curveSegments = 14;

  // Bottom straight
  for (
    let i = 0;
    i <= straightSegments;
    i++
  ) {
    const t =
      i / straightSegments;

    points.push(
      new THREE.Vector2(
        THREE.MathUtils.lerp(
          -halfLength + r,
          halfLength - r,
          t
        ),
        -halfWidth
      )
    );
  }

  // Bottom-right curve
  for (
    let i = 1;
    i <= curveSegments;
    i++
  ) {
    const angle =
      THREE.MathUtils.lerp(
        -Math.PI / 2,
        0,
        i / curveSegments
      );

    points.push(
      new THREE.Vector2(
        halfLength -
          r +
          Math.cos(angle) *
          r,

        -halfWidth +
          r +
          Math.sin(angle) *
          r
      )
    );
  }

  // Right straight
  for (
    let i = 1;
    i <= straightSegments;
    i++
  ) {
    const t =
      i / straightSegments;

    points.push(
      new THREE.Vector2(
        halfLength,

        THREE.MathUtils.lerp(
          -halfWidth + r,
          halfWidth - r,
          t
        )
      )
    );
  }

  // Top-right curve
  for (
    let i = 1;
    i <= curveSegments;
    i++
  ) {
    const angle =
      THREE.MathUtils.lerp(
        0,
        Math.PI / 2,
        i / curveSegments
      );

    points.push(
      new THREE.Vector2(
        halfLength -
          r +
          Math.cos(angle) *
          r,

        halfWidth -
          r +
          Math.sin(angle) *
          r
      )
    );
  }

  // Top straight
  for (
    let i = 1;
    i <= straightSegments;
    i++
  ) {
    const t =
      i / straightSegments;

    points.push(
      new THREE.Vector2(
        THREE.MathUtils.lerp(
          halfLength - r,
          -halfLength + r,
          t
        ),
        halfWidth
      )
    );
  }

  // Top-left curve
  for (
    let i = 1;
    i <= curveSegments;
    i++
  ) {
    const angle =
      THREE.MathUtils.lerp(
        Math.PI / 2,
        Math.PI,
        i / curveSegments
      );

    points.push(
      new THREE.Vector2(
        -halfLength +
          r +
          Math.cos(angle) *
          r,

        halfWidth -
          r +
          Math.sin(angle) *
          r
      )
    );
  }

  // Left straight
  for (
    let i = 1;
    i <= straightSegments;
    i++
  ) {
    const t =
      i / straightSegments;

    points.push(
      new THREE.Vector2(
        -halfLength,

        THREE.MathUtils.lerp(
          halfWidth - r,
          -halfWidth + r,
          t
        )
      )
    );
  }

  // Bottom-left curve
  for (
    let i = 1;
    i <= curveSegments;
    i++
  ) {
    const angle =
      THREE.MathUtils.lerp(
        Math.PI,
        Math.PI * 1.5,
        i / curveSegments
      );

    points.push(
      new THREE.Vector2(
        -halfLength +
          r +
          Math.cos(angle) *
          r,

        -halfWidth +
          r +
          Math.sin(angle) *
          r
      )
    );
  }

  return points;
}

// --------------------------------------------------
// SEGMENTED BOARDS + GLASS
// --------------------------------------------------

function createPerimeter() {
  const group =
    new THREE.Group();

  const points =
    getPerimeterPoints();

  for (
    let i = 0;
    i < points.length;
    i++
  ) {
    const a =
      points[i];

    const b =
      points[
        (i + 1) %
        points.length
      ];

    const dx =
      b.x - a.x;

    const dz =
      b.y - a.y;

    const length =
      Math.sqrt(
        dx * dx +
        dz * dz
      );

    const centerX =
      (a.x + b.x) / 2;

    const centerZ =
      (a.y + b.y) / 2;

    const angle =
      Math.atan2(
        dz,
        dx
      );

    // --------------------------------------------
    // WHITE BOARD
    // --------------------------------------------

    const boardGeometry =
      new THREE.BoxGeometry(
        length + 0.05,
        RINK.boardHeight,
        RINK.boardThickness
      );

    const board =
      new THREE.Mesh(
        boardGeometry,
        boardMaterial
      );

    board.position.set(
      centerX,
      RINK.boardHeight / 2,
      centerZ
    );

    board.rotation.y =
      -angle;

    board.castShadow = true;
    board.receiveShadow = true;

    group.add(board);

    // --------------------------------------------
    // YELLOW KICKPLATE
    // --------------------------------------------

    const kickHeight =
      0.22;

    const kickGeometry =
      new THREE.BoxGeometry(
        length + 0.055,
        kickHeight,
        RINK.boardThickness +
          0.015
      );

    const kick =
      new THREE.Mesh(
        kickGeometry,
        yellowKickplateMaterial
      );

    kick.position.set(
      centerX,
      kickHeight / 2,
      centerZ
    );

    kick.rotation.y =
      -angle;

    group.add(kick);

    // --------------------------------------------
    // GLASS
    // --------------------------------------------

    const glassGeometry =
      new THREE.BoxGeometry(
        length,
        RINK.glassHeight,
        0.045
      );

    const glass =
      new THREE.Mesh(
        glassGeometry,
        glassMaterial
      );

    glass.position.set(
      centerX,

      RINK.boardHeight +
        RINK.glassHeight /
        2,

      centerZ
    );

    glass.rotation.y =
      -angle;

    group.add(glass);
  }

  return group;
}

// --------------------------------------------------
// GOALIE TRAPEZOID
// --------------------------------------------------

function createTrapezoid(
  side
) {
  const group =
    new THREE.Group();

  const goalX =
    side *
    RINK.goalLineX;

  const endX =
    side *
    (
      RINK.length / 2 -
      0.25
    );

  const innerZ =
    5.5 * SCALE;

  const outerZ =
    11 * SCALE;

  function createSegment(
    x1,
    z1,
    x2,
    z2
  ) {
    const dx =
      x2 - x1;

    const dz =
      z2 - z1;

    const length =
      Math.sqrt(
        dx * dx +
        dz * dz
      );

    const geometry =
      new THREE.PlaneGeometry(
        length,
        0.10
      );

    const line =
      new THREE.Mesh(
        geometry,
        redMaterial
      );

    line.rotation.x =
      -Math.PI / 2;

    line.rotation.z =
      Math.atan2(
        dz,
        dx
      );

    line.position.set(
      (x1 + x2) / 2,
      0.031,
      (z1 + z2) / 2
    );

    group.add(line);
  }

  createSegment(
    goalX,
    innerZ,
    endX,
    outerZ
  );

  createSegment(
    goalX,
    -innerZ,
    endX,
    -outerZ
  );

  return group;
}

// --------------------------------------------------
// ALL ICE MARKINGS
// --------------------------------------------------

function createMarkings() {
  const group =
    new THREE.Group();

  // Center red line
  group.add(
    createFlatRectangle(
      0.16,
      RINK.width,
      redMaterial
    )
  );

  // Blue lines
  group.add(
    createFlatRectangle(
      0.24,
      RINK.width,
      blueMaterial,
      -RINK.blueLineX
    )
  );

  group.add(
    createFlatRectangle(
      0.24,
      RINK.width,
      blueMaterial,
      RINK.blueLineX
    )
  );

  // Goal lines
  group.add(
    createFlatRectangle(
      0.11,
      RINK.width,
      redMaterial,
      -RINK.goalLineX
    )
  );

  group.add(
    createFlatRectangle(
      0.11,
      RINK.width,
      redMaterial,
      RINK.goalLineX
    )
  );

  // Center circle
  group.add(
    createCircleOutline(
      RINK.faceoffRadius,
      0,
      0
    )
  );

  // Center dot
  group.add(
    createFaceoffDot(
      0,
      0,
      blueMaterial,
      0.27
    )
  );

  // Offensive-zone circles

  const zoneX =
    69 * SCALE;

  const dotZ =
    22 * SCALE;

  const offensiveDots = [
    [-zoneX, -dotZ],
    [-zoneX, dotZ],
    [zoneX, -dotZ],
    [zoneX, dotZ]
  ];

  for (
    const [x, z]
    of offensiveDots
  ) {
    group.add(
      createCircleOutline(
        RINK.faceoffRadius,
        x,
        z
      )
    );

    group.add(
      createFaceoffDot(
        x,
        z
      )
    );
  }

  // Neutral-zone dots

  const neutralX =
    20 * SCALE;

  const neutralDots = [
    [-neutralX, -dotZ],
    [-neutralX, dotZ],
    [neutralX, -dotZ],
    [neutralX, dotZ]
  ];

  for (
    const [x, z]
    of neutralDots
  ) {
    group.add(
      createFaceoffDot(
        x,
        z,
        redMaterial,
        0.24
      )
    );
  }

  // Creases
  group.add(
    createCrease(-1)
  );

  group.add(
    createCrease(1)
  );

  // Trapezoids
  group.add(
    createTrapezoid(-1)
  );

  group.add(
    createTrapezoid(1)
  );

  return group;
}

// --------------------------------------------------
// CREATE COMPLETE RINK
// --------------------------------------------------

export function createRink(
  scene
) {
  const rink =
    new THREE.Group();

  rink.name =
    "hockey-rink";

  // Ice
  const ice =
    createIce();

  rink.add(ice);

  // Markings
  rink.add(
    createMarkings()
  );

  // Boards / glass
  rink.add(
    createPerimeter()
  );

  // Goals
  rink.add(
    createGoal(-1)
  );

  rink.add(
    createGoal(1)
  );

  scene.add(rink);

  return rink;
}
