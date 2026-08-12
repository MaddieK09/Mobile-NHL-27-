import * as THREE from "three";

// ==================================================
// MOBILE NHL 27 - RINK
// ==================================================
//
// Regulation-oriented NHL rink geometry.
//
// Coordinate system:
//   X = length of rink
//   Z = width of rink
//   Y = height
//
// Internal scale:
//   1 real foot = 0.30 Three.js units
// ==================================================

export const SCALE = 0.30;

const FT = (feet) => feet * SCALE;
const IN = (inches) => (inches / 12) * SCALE;

export const RINK = {
  length: FT(200),
  width: FT(85),
  cornerRadius: FT(28),

  halfLength: FT(100),
  halfWidth: FT(42.5),

  boardHeight: FT(3.5),
  boardThickness: FT(1),

  glassHeightSide: FT(5),
  glassHeightEnd: FT(8),

  goalLineX: FT(89),
  blueLineX: FT(25),

  centerLineWidth: FT(1),
  blueLineWidth: FT(1),
  thinLineWidth: IN(2),

  faceoffRadius: FT(15),

  goalWidth: FT(6),
  goalHeight: FT(4),

  creaseRadius: FT(6),
  creaseHalfWidth: FT(4),
  creaseStraightDepth: FT(4.5)
};

// ==================================================
// MATERIALS
// ==================================================

const iceMaterial = new THREE.MeshStandardMaterial({
  color: 0xf4fcff,
  roughness: 0.18,
  metalness: 0.015
});

const boardMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  roughness: 0.5
});

const kickplateMaterial = new THREE.MeshStandardMaterial({
  color: 0xf2c500,
  roughness: 0.55
});

const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xd9f3ff,
  transparent: true,
  opacity: 0.17,
  roughness: 0.04,
  metalness: 0,
  transmission: 0.35,
  depthWrite: false,
  side: THREE.DoubleSide
});

const redMaterial = new THREE.MeshBasicMaterial({
  color: 0xc91932,
  side: THREE.DoubleSide
});

const blueMaterial = new THREE.MeshBasicMaterial({
  color: 0x1658ad,
  side: THREE.DoubleSide
});

const creaseFillMaterial = new THREE.MeshBasicMaterial({
  color: 0x8fd5f3,
  transparent: true,
  opacity: 0.72,
  side: THREE.DoubleSide
});

const whiteMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide
});

const postMaterial = new THREE.MeshStandardMaterial({
  color: 0xd71920,
  roughness: 0.36
});

const netMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  wireframe: true,
  transparent: true,
  opacity: 0.42
});

// ==================================================
// RINK SHAPE
// ==================================================

function createRinkShape() {
  const halfL = RINK.halfLength;
  const halfW = RINK.halfWidth;
  const r = RINK.cornerRadius;

  const shape = new THREE.Shape();

  shape.moveTo(-halfL + r, -halfW);
  shape.lineTo(halfL - r, -halfW);

  shape.absarc(
    halfL - r,
    -halfW + r,
    r,
    -Math.PI / 2,
    0,
    false
  );

  shape.lineTo(
    halfL,
    halfW - r
  );

  shape.absarc(
    halfL - r,
    halfW - r,
    r,
    0,
    Math.PI / 2,
    false
  );

  shape.lineTo(
    -halfL + r,
    halfW
  );

  shape.absarc(
    -halfL + r,
    halfW - r,
    r,
    Math.PI / 2,
    Math.PI,
    false
  );

  shape.lineTo(
    -halfL,
    -halfW + r
  );

  shape.absarc(
    -halfL + r,
    -halfW + r,
    r,
    Math.PI,
    Math.PI * 1.5,
    false
  );

  shape.closePath();

  return shape;
}

function rinkHalfWidthAtX(x) {
  const ax = Math.abs(x);
  const straightEnd =
    RINK.halfLength -
    RINK.cornerRadius;

  if (ax <= straightEnd) {
    return RINK.halfWidth;
  }

  const dx =
    ax -
    straightEnd;

  if (dx >= RINK.cornerRadius) {
    return (
      RINK.halfWidth -
      RINK.cornerRadius
    );
  }

  return (
    RINK.halfWidth -
    RINK.cornerRadius +
    Math.sqrt(
      Math.max(
        0,
        RINK.cornerRadius *
          RINK.cornerRadius -
          dx * dx
      )
    )
  );
}

// ==================================================
// ICE
// ==================================================

function createIce() {
  const geometry =
    new THREE.ShapeGeometry(
      createRinkShape(),
      96
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

// ==================================================
// GENERIC ICE MARKINGS
// ==================================================

function createFlatRectangle(
  width,
  depth,
  material,
  x = 0,
  z = 0,
  y = 0.018,
  rotation = 0
) {
  const geometry =
    new THREE.PlaneGeometry(
      width,
      depth
    );

  const mesh =
    new THREE.Mesh(
      geometry,
      material
    );

  mesh.rotation.x =
    -Math.PI / 2;

  mesh.rotation.z =
    rotation;

  mesh.position.set(
    x,
    y,
    z
  );

  return mesh;
}

function createLineSegment(
  x1,
  z1,
  x2,
  z2,
  material,
  thickness = RINK.thinLineWidth,
  y = 0.031
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

  return createFlatRectangle(
    length,
    thickness,
    material,
    (x1 + x2) / 2,
    (z1 + z2) / 2,
    y,
    Math.atan2(
      dz,
      dx
    )
  );
}

function createCircleOutline(
  radius,
  x,
  z,
  material,
  thickness = RINK.thinLineWidth
) {
  const geometry =
    new THREE.RingGeometry(
      Math.max(
        0.01,
        radius - thickness
      ),
      radius,
      96
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
    0.029,
    z
  );

  return circle;
}

function createFaceoffSpot(
  x,
  z,
  material = redMaterial,
  radius = FT(1)
) {
  const geometry =
    new THREE.CircleGeometry(
      radius,
      48
    );

  const spot =
    new THREE.Mesh(
      geometry,
      material
    );

  spot.rotation.x =
    -Math.PI / 2;

  spot.position.set(
    x,
    0.033,
    z
  );

  return spot;
}

// ==================================================
// CENTER + BLUE + GOAL LINES
// ==================================================

function createCenterLine() {
  const group =
    new THREE.Group();

  group.add(
    createFlatRectangle(
      RINK.centerLineWidth,
      RINK.width,
      redMaterial,
      0,
      0,
      0.019
    )
  );

  return group;
}

function createBlueLines() {
  const group =
    new THREE.Group();

  group.add(
    createFlatRectangle(
      RINK.blueLineWidth,
      RINK.width,
      blueMaterial,
      -RINK.blueLineX,
      0,
      0.02
    )
  );

  group.add(
    createFlatRectangle(
      RINK.blueLineWidth,
      RINK.width,
      blueMaterial,
      RINK.blueLineX,
      0,
      0.02
    )
  );

  return group;
}

function createGoalLines() {
  const group =
    new THREE.Group();

  for (const side of [-1, 1]) {
    const x =
      side *
      RINK.goalLineX;

    const halfVisibleWidth =
      rinkHalfWidthAtX(x);

    group.add(
      createFlatRectangle(
        RINK.thinLineWidth,
        halfVisibleWidth * 2,
        redMaterial,
        x,
        0,
        0.022
      )
    );
  }

  return group;
}

// ==================================================
// FACE-OFF MARKINGS
// ==================================================

function createFaceoffLMarks(
  x,
  z
) {
  const group =
    new THREE.Group();

  const sideOffset =
    FT(1.75);

  const forwardOffset =
    FT(1.0);

  const longLength =
    FT(4);

  const shortLength =
    FT(2.83);

  for (
    const sx of [-1, 1]
  ) {
    for (
      const sz of [-1, 1]
    ) {
      group.add(
        createFlatRectangle(
          RINK.thinLineWidth,
          longLength,
          redMaterial,
          x + sx * sideOffset,
          z + sz * FT(2.15),
          0.034
        )
      );

      group.add(
        createFlatRectangle(
          shortLength,
          RINK.thinLineWidth,
          redMaterial,
          x +
            sx *
            (
              sideOffset +
              shortLength / 2
            ),
          z +
            sz *
            forwardOffset,
          0.034
        )
      );
    }
  }

  return group;
}

function createFaceoffMarkings() {
  const group =
    new THREE.Group();

  group.add(
    createCircleOutline(
      RINK.faceoffRadius,
      0,
      0,
      blueMaterial
    )
  );

  group.add(
    createFaceoffSpot(
      0,
      0,
      blueMaterial,
      FT(0.5)
    )
  );

  const zoneX =
    FT(69);

  const spotZ =
    FT(22);

  const endZoneSpots = [
    [-zoneX, -spotZ],
    [-zoneX, spotZ],
    [zoneX, -spotZ],
    [zoneX, spotZ]
  ];

  for (
    const [x, z]
    of endZoneSpots
  ) {
    group.add(
      createCircleOutline(
        RINK.faceoffRadius,
        x,
        z,
        redMaterial
      )
    );

    group.add(
      createFaceoffSpot(
        x,
        z,
        redMaterial,
        FT(1)
      )
    );

    group.add(
      createFaceoffLMarks(
        x,
        z
      )
    );
  }

  const neutralX =
    FT(20);

  const neutralSpots = [
    [-neutralX, -spotZ],
    [-neutralX, spotZ],
    [neutralX, -spotZ],
    [neutralX, spotZ]
  ];

  for (
    const [x, z]
    of neutralSpots
  ) {
    group.add(
      createFaceoffSpot(
        x,
        z,
        redMaterial,
        FT(1)
      )
    );
  }

  return group;
}

// ==================================================
// GOAL CREASE
// ==================================================

function createCrease(side) {
  const group =
    new THREE.Group();

  const goalX =
    side *
    RINK.goalLineX;

  const towardCenter =
    -side;

  const halfWidth =
    RINK.creaseHalfWidth;

  const straightDepth =
    RINK.creaseStraightDepth;

  const radius =
    RINK.creaseRadius;

  const localEndX =
    towardCenter *
    straightDepth;

  const points = [];

  points.push(
    new THREE.Vector2(
      goalX,
      -halfWidth
    )
  );

  points.push(
    new THREE.Vector2(
      goalX + localEndX,
      -halfWidth
    )
  );

  const arcSteps = 36;

  let startAngle;
  let endAngle;

  if (side < 0) {
    const a =
      Math.atan2(
        halfWidth,
        straightDepth
      );

    startAngle = -a;
    endAngle = a;
  } else {
    const a =
      Math.atan2(
        halfWidth,
        straightDepth
      );

    startAngle =
      Math.PI - a;

    endAngle =
      Math.PI + a;
  }

  for (
    let i = 0;
    i <= arcSteps;
    i++
  ) {
    const t =
      i / arcSteps;

    const angle =
      THREE.MathUtils.lerp(
        startAngle,
        endAngle,
        t
      );

    points.push(
      new THREE.Vector2(
        goalX +
          Math.cos(angle) *
          radius,
        Math.sin(angle) *
          radius
      )
    );
  }

  points.push(
    new THREE.Vector2(
      goalX,
      halfWidth
    )
  );

  const shape =
    new THREE.Shape(
      points
    );

  const fillGeometry =
    new THREE.ShapeGeometry(
      shape
    );

  const fill =
    new THREE.Mesh(
      fillGeometry,
      creaseFillMaterial
    );

  fill.rotation.x =
    -Math.PI / 2;

  fill.position.y =
    0.024;

  group.add(fill);

  group.add(
    createLineSegment(
      goalX,
      -halfWidth,
      goalX + localEndX,
      -halfWidth,
      redMaterial,
      RINK.thinLineWidth,
      0.035
    )
  );

  group.add(
    createLineSegment(
      goalX,
      halfWidth,
      goalX + localEndX,
      halfWidth,
      redMaterial,
      RINK.thinLineWidth,
      0.035
    )
  );

  const curve =
    new THREE.EllipseCurve(
      goalX,
      0,
      radius,
      radius,
      startAngle,
      endAngle,
      false,
      0
    );

  const curvePoints =
    curve.getPoints(
      48
    );

  for (
    let i = 0;
    i <
      curvePoints.length - 1;
    i++
  ) {
    const a =
      curvePoints[i];

    const b =
      curvePoints[i + 1];

    group.add(
      createLineSegment(
        a.x,
        a.y,
        b.x,
        b.y,
        redMaterial,
        RINK.thinLineWidth,
        0.036
      )
    );
  }

  const tickDepth =
    FT(4);

  const tickLength =
    IN(5);

  const tickX =
    goalX +
    towardCenter *
    tickDepth;

  group.add(
    createFlatRectangle(
      tickLength,
      RINK.thinLineWidth,
      redMaterial,
      tickX,
      -halfWidth,
      0.037
    )
  );

  group.add(
    createFlatRectangle(
      tickLength,
      RINK.thinLineWidth,
      redMaterial,
      tickX,
      halfWidth,
      0.037
    )
  );

  return group;
}

// ==================================================
// GOALTENDER RESTRICTED AREA / TRAPEZOID
// ==================================================

function createTrapezoid(side) {
  const group =
    new THREE.Group();

  const goalX =
    side *
    RINK.goalLineX;

  const endX =
    side *
    (
      RINK.halfLength -
      0.06
    );

  const goalLineZ =
    FT(11);

  const endBoardZ =
    FT(14);

  group.add(
    createLineSegment(
      goalX,
      goalLineZ,
      endX,
      endBoardZ,
      redMaterial,
      RINK.thinLineWidth,
      0.04
    )
  );

  group.add(
    createLineSegment(
      goalX,
      -goalLineZ,
      endX,
      -endBoardZ,
      redMaterial,
      RINK.thinLineWidth,
      0.04
    )
  );

  return group;
}

// ==================================================
// GOALS
// ==================================================

function makeCylinderBetween(
  start,
  end,
  radius,
  material
) {
  const direction =
    new THREE.Vector3()
      .subVectors(
        end,
        start
      );

  const length =
    direction.length();

  const geometry =
    new THREE.CylinderGeometry(
      radius,
      radius,
      length,
      14
    );

  const mesh =
    new THREE.Mesh(
      geometry,
      material
    );

  mesh.position
    .copy(start)
    .add(end)
    .multiplyScalar(0.5);

  mesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(
      0,
      1,
      0
    ),
    direction
      .clone()
      .normalize()
  );

  mesh.castShadow = true;

  return mesh;
}

function createGoal(side) {
  const goal =
    new THREE.Group();

  const frontX =
    side *
    RINK.goalLineX;

  const backDirection =
    side;

  const halfGoalWidth =
    RINK.goalWidth / 2;

  const goalHeight =
    RINK.goalHeight;

  const baseDepth =
    FT(3.7);

  const topDepth =
    FT(1.6);

  const backBaseX =
    frontX +
    backDirection *
    baseDepth;

  const backTopX =
    frontX +
    backDirection *
    topDepth;

  const postRadius =
    IN(1.25);

  const leftPostBottom =
    new THREE.Vector3(
      frontX,
      0.04,
      -halfGoalWidth
    );

  const leftPostTop =
    new THREE.Vector3(
      frontX,
      goalHeight,
      -halfGoalWidth
    );

  const rightPostBottom =
    new THREE.Vector3(
      frontX,
      0.04,
      halfGoalWidth
    );

  const rightPostTop =
    new THREE.Vector3(
      frontX,
      goalHeight,
      halfGoalWidth
    );

  goal.add(
    makeCylinderBetween(
      leftPostBottom,
      leftPostTop,
      postRadius,
      postMaterial
    )
  );

  goal.add(
    makeCylinderBetween(
      rightPostBottom,
      rightPostTop,
      postRadius,
      postMaterial
    )
  );

  goal.add(
    makeCylinderBetween(
      leftPostTop,
      rightPostTop,
      postRadius,
      postMaterial
    )
  );

  const backLeftBottom =
    new THREE.Vector3(
      backBaseX,
      0.04,
      -halfGoalWidth * 0.92
    );

  const backRightBottom =
    new THREE.Vector3(
      backBaseX,
      0.04,
      halfGoalWidth * 0.92
    );

  goal.add(
    makeCylinderBetween(
      leftPostBottom,
      backLeftBottom,
      postRadius * 0.75,
      whiteMaterial
    )
  );

  goal.add(
    makeCylinderBetween(
      rightPostBottom,
      backRightBottom,
      postRadius * 0.75,
      whiteMaterial
    )
  );

  goal.add(
    makeCylinderBetween(
      backLeftBottom,
      backRightBottom,
      postRadius * 0.75,
      whiteMaterial
    )
  );

  const backLeftTop =
    new THREE.Vector3(
      backTopX,
      goalHeight * 0.72,
      -halfGoalWidth * 0.86
    );

  const backRightTop =
    new THREE.Vector3(
      backTopX,
      goalHeight * 0.72,
      halfGoalWidth * 0.86
    );

  goal.add(
    makeCylinderBetween(
      leftPostTop,
      backLeftTop,
      postRadius * 0.7,
      whiteMaterial
    )
  );

  goal.add(
    makeCylinderBetween(
      rightPostTop,
      backRightTop,
      postRadius * 0.7,
      whiteMaterial
    )
  );

  goal.add(
    makeCylinderBetween(
      backLeftTop,
      backRightTop,
      postRadius * 0.7,
      whiteMaterial
    )
  );

  goal.add(
    makeCylinderBetween(
      backLeftTop,
      backLeftBottom,
      postRadius * 0.65,
      whiteMaterial
    )
  );

  goal.add(
    makeCylinderBetween(
      backRightTop,
      backRightBottom,
      postRadius * 0.65,
      whiteMaterial
    )
  );

  const netGeometry =
    new THREE.BoxGeometry(
      baseDepth,
      goalHeight * 0.95,
      RINK.goalWidth
    );

  const net =
    new THREE.Mesh(
      netGeometry,
      netMaterial
    );

  net.position.set(
    frontX +
      backDirection *
      baseDepth /
      2,
    goalHeight * 0.47,
    0
  );

  goal.add(net);

  return goal;
}

// ==================================================
// BOARD / GLASS PERIMETER
// ==================================================

function getPerimeterPoints() {
  const points = [];

  const halfL =
    RINK.halfLength;

  const halfW =
    RINK.halfWidth;

  const r =
    RINK.cornerRadius;

  const straightSegments = 8;
  const curveSegments = 28;

  function addStraight(
    x1,
    z1,
    x2,
    z2,
    steps,
    includeStart = true
  ) {
    const start =
      includeStart ? 0 : 1;

    for (
      let i = start;
      i <= steps;
      i++
    ) {
      const t =
        i / steps;

      points.push(
        new THREE.Vector2(
          THREE.MathUtils.lerp(
            x1,
            x2,
            t
          ),
          THREE.MathUtils.lerp(
            z1,
            z2,
            t
          )
        )
      );
    }
  }

  function addArc(
    cx,
    cz,
    radius,
    startAngle,
    endAngle,
    steps
  ) {
    for (
      let i = 1;
      i <= steps;
      i++
    ) {
      const t =
        i / steps;

      const a =
        THREE.MathUtils.lerp(
          startAngle,
          endAngle,
          t
        );

      points.push(
        new THREE.Vector2(
          cx +
            Math.cos(a) *
            radius,
          cz +
            Math.sin(a) *
            radius
        )
      );
    }
  }

  addStraight(
    -halfL + r,
    -halfW,
    halfL - r,
    -halfW,
    straightSegments
  );

  addArc(
    halfL - r,
    -halfW + r,
    r,
    -Math.PI / 2,
    0,
    curveSegments
  );

  addStraight(
    halfL,
    -halfW + r,
    halfL,
    halfW - r,
    straightSegments,
    false
  );

  addArc(
    halfL - r,
    halfW - r,
    r,
    0,
    Math.PI / 2,
    curveSegments
  );

  addStraight(
    halfL - r,
    halfW,
    -halfL + r,
    halfW,
    straightSegments,
    false
  );

  addArc(
    -halfL + r,
    halfW - r,
    r,
    Math.PI / 2,
    Math.PI,
    curveSegments
  );

  addStraight(
    -halfL,
    halfW - r,
    -halfL,
    -halfW + r,
    straightSegments,
    false
  );

  addArc(
    -halfL + r,
    -halfW + r,
    r,
    Math.PI,
    Math.PI * 1.5,
    curveSegments
  );

  return points;
}

function createPerimeterSegment(
  a,
  b,
  boardHeight,
  glassHeight
) {
  const group =
    new THREE.Group();

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

  const boardGeometry =
    new THREE.BoxGeometry(
      length + 0.035,
      boardHeight,
      RINK.boardThickness
    );

  const board =
    new THREE.Mesh(
      boardGeometry,
      boardMaterial
    );

  board.position.set(
    centerX,
    boardHeight / 2,
    centerZ
  );

  board.rotation.y =
    -angle;

  board.castShadow = true;
  board.receiveShadow = true;

  group.add(board);

  const kickHeight =
    FT(0.75);

  const kickGeometry =
    new THREE.BoxGeometry(
      length + 0.04,
      kickHeight,
      RINK.boardThickness +
        0.015
    );

  const kick =
    new THREE.Mesh(
      kickGeometry,
      kickplateMaterial
    );

  kick.position.set(
    centerX,
    kickHeight / 2,
    centerZ
  );

  kick.rotation.y =
    -angle;

  group.add(kick);

  const glassGeometry =
    new THREE.BoxGeometry(
      length + 0.015,
      glassHeight,
      0.045
    );

  const glass =
    new THREE.Mesh(
      glassGeometry,
      glassMaterial
    );

  glass.position.set(
    centerX,
    boardHeight +
      glassHeight / 2,
    centerZ
  );

  glass.rotation.y =
    -angle;

  group.add(glass);

  return group;
}

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

    const midpointX =
      (a.x + b.x) / 2;

    const nearEnd =
      Math.abs(
        midpointX
      ) >
      FT(72);

    const glassHeight =
      nearEnd
        ? RINK.glassHeightEnd
        : RINK.glassHeightSide;

    group.add(
      createPerimeterSegment(
        a,
        b,
        RINK.boardHeight,
        glassHeight
      )
    );
  }

  return group;
}

// ==================================================
// ALL ICE MARKINGS
// ==================================================

function createMarkings() {
  const group =
    new THREE.Group();

  group.add(
    createCenterLine()
  );

  group.add(
    createBlueLines()
  );

  group.add(
    createGoalLines()
  );

  group.add(
    createFaceoffMarkings()
  );

  group.add(
    createCrease(-1)
  );

  group.add(
    createCrease(1)
  );

  group.add(
    createTrapezoid(-1)
  );

  group.add(
    createTrapezoid(1)
  );

  return group;
}

// ==================================================
// CREATE COMPLETE RINK
// ==================================================

export function createRink(scene) {
  const rink =
    new THREE.Group();

  rink.name =
    "hockey-rink";

  rink.add(
    createIce()
  );

  rink.add(
    createMarkings()
  );

  rink.add(
    createPerimeter()
  );

  rink.add(
    createGoal(-1)
  );

  rink.add(
    createGoal(1)
  );

  scene.add(rink);

  return rink;
}
