import * as THREE from "three";

// ==================================================
// MOBILE NHL 27 - PLAYER
// ==================================================
//
// First-pass player model.
// No external assets yet.
//
// Later this file will expand to support:
// - real player models
// - skating animations
// - handedness
// - stick handling
// - checking
// - shooting
// - body size / height
// - jerseys / equipment
// ==================================================

export class HockeyPlayer {
  constructor(scene, options = {}) {
    this.scene = scene;

    this.position = new THREE.Vector3(
      options.x ?? 0,
      0,
      options.z ?? 6
    );

    this.rotation = options.rotation ?? Math.PI;

    this.speed = 0;
    this.maxSpeed = options.maxSpeed ?? 8;
    this.acceleration = options.acceleration ?? 18;
    this.deceleration = options.deceleration ?? 14;
    this.turnSpeed = options.turnSpeed ?? 3.2;

    // Skating movement state.
    this.velocity = new THREE.Vector3();
    this.moveDirection = new THREE.Vector3();
    this.inputMagnitude = 0;

    // Temporary rink limits. These keep the skater on the ice until
    // collision with the actual rounded boards is added.
    this.rinkHalfLength = options.rinkHalfLength ?? 28.8;
    this.rinkHalfWidth = options.rinkHalfWidth ?? 11.7;

    this.height = options.height ?? 1.85;

    this.teamColor = options.teamColor ?? 0x1f5dbb;

    // Stick / puck control state.
    this.stickhandleTime = 0;
    this.stickhandleAmount = 0;
    this.stickhandleSway = 0;
    this.turnRate = 0;
    this.lastRotation = this.rotation;
    this.puckControlPoint = new THREE.Object3D();

    this.group = new THREE.Group();
    this.group.name = "player";

    this.group.position.copy(this.position);
    this.group.rotation.y = this.rotation;

    this.scene.add(this.group);

    this.buildPlayer();
  }

  // ------------------------------------------------
  // PLAYER MODEL
  // ------------------------------------------------

  buildPlayer() {
    const jerseyMaterial =
      new THREE.MeshStandardMaterial({
        color: this.teamColor,
        roughness: 0.55
      });

    const pantsMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x111827,
        roughness: 0.6
      });

    const helmetMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.45
      });

    const skinMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xd5a37f,
        roughness: 0.65
      });

    const gloveMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x101827,
        roughness: 0.6
      });

    const skateMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x0b0b0b,
        roughness: 0.4
      });

    const bladeMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xbfc7cf,
        metalness: 0.7,
        roughness: 0.2
      });

    const stickMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x3b2616,
        roughness: 0.65
      });

    // ------------------------------------------------
    // TORSO
    // ------------------------------------------------

    const torsoGeometry =
      new THREE.CapsuleGeometry(
        0.46,
        0.72,
        6,
        12
      );

    const torso =
      new THREE.Mesh(
        torsoGeometry,
        jerseyMaterial
      );

    torso.position.set(
      0,
      1.42,
      0
    );

    torso.scale.set(
      1.08,
      1,
      0.72
    );

    torso.castShadow = true;

    this.group.add(torso);

    // ------------------------------------------------
    // HEAD
    // ------------------------------------------------

    const headGeometry =
      new THREE.SphereGeometry(
        0.26,
        20,
        16
      );

    const head =
      new THREE.Mesh(
        headGeometry,
        skinMaterial
      );

    head.position.set(
      0,
      2.18,
      0
    );

    head.castShadow = true;

    this.group.add(head);

    // ------------------------------------------------
    // HELMET
    // ------------------------------------------------

    const helmetGeometry =
      new THREE.SphereGeometry(
        0.29,
        20,
        12,
        0,
        Math.PI * 2,
        0,
        Math.PI / 2
      );

    const helmet =
      new THREE.Mesh(
        helmetGeometry,
        helmetMaterial
      );

    helmet.position.set(
      0,
      2.23,
      0
    );

    helmet.castShadow = true;

    this.group.add(helmet);

    // ------------------------------------------------
    // LEGS
    // ------------------------------------------------

    const legGeometry =
      new THREE.CapsuleGeometry(
        0.16,
        0.58,
        5,
        10
      );

    const leftLeg =
      new THREE.Mesh(
        legGeometry,
        pantsMaterial
      );

    leftLeg.position.set(
      -0.22,
      0.72,
      0
    );

    leftLeg.rotation.z =
      -0.06;

    leftLeg.castShadow = true;

    this.group.add(leftLeg);

    const rightLeg =
      new THREE.Mesh(
        legGeometry,
        pantsMaterial
      );

    rightLeg.position.set(
      0.22,
      0.72,
      0
    );

    rightLeg.rotation.z =
      0.06;

    rightLeg.castShadow = true;

    this.group.add(rightLeg);

    // ------------------------------------------------
    // ARMS
    // ------------------------------------------------

    const armGeometry =
      new THREE.CapsuleGeometry(
        0.12,
        0.52,
        5,
        10
      );

    const leftArm =
      new THREE.Mesh(
        armGeometry,
        jerseyMaterial
      );

    leftArm.position.set(
      -0.48,
      1.50,
      -0.03
    );

    leftArm.rotation.z =
      -0.52;

    leftArm.rotation.x =
      0.15;

    leftArm.castShadow = true;

    this.group.add(leftArm);

    const rightArm =
      new THREE.Mesh(
        armGeometry,
        jerseyMaterial
      );

    rightArm.position.set(
      0.48,
      1.50,
      -0.04
    );

    rightArm.rotation.z =
      0.58;

    rightArm.rotation.x =
      -0.10;

    rightArm.castShadow = true;

    this.group.add(rightArm);

    // ------------------------------------------------
    // GLOVES
    // ------------------------------------------------

    const gloveGeometry =
      new THREE.BoxGeometry(
        0.23,
        0.20,
        0.25
      );

    const leftGlove =
      new THREE.Mesh(
        gloveGeometry,
        gloveMaterial
      );

    leftGlove.position.set(
      -0.72,
      1.23,
      0
    );

    leftGlove.castShadow = true;

    this.group.add(leftGlove);

    const rightGlove =
      new THREE.Mesh(
        gloveGeometry,
        gloveMaterial
      );

    rightGlove.position.set(
      0.70,
      1.20,
      -0.03
    );

    rightGlove.castShadow = true;

    this.group.add(rightGlove);

    // ------------------------------------------------
    // SKATES
    // ------------------------------------------------

    this.createSkate(
      -0.22,
      skateMaterial,
      bladeMaterial
    );

    this.createSkate(
      0.22,
      skateMaterial,
      bladeMaterial
    );

    // ------------------------------------------------
    // STICK
    // ------------------------------------------------

    const shaftGeometry =
      new THREE.BoxGeometry(
        0.08,
        1.65,
        0.08
      );

    this.stickShaft =
      new THREE.Mesh(
        shaftGeometry,
        stickMaterial
      );

    this.stickShaft.position.set(
      0.69,
      0.82,
      -0.15
    );

    this.stickShaft.rotation.z =
      -0.38;

    this.stickShaft.rotation.x =
      0.10;

    this.stickShaft.castShadow = true;

    this.group.add(
      this.stickShaft
    );

    const bladeGeometry =
      new THREE.BoxGeometry(
        0.56,
        0.09,
        0.18
      );

    this.stickBlade =
      new THREE.Mesh(
        bladeGeometry,
        stickMaterial
      );

    this.stickBlade.position.set(
      0.98,
      0.13,
      -0.19
    );

    this.stickBlade.rotation.y =
      -0.15;

    this.stickBlade.castShadow = true;

    this.group.add(
      this.stickBlade
    );

    // Invisible attachment point just ahead of the blade.
    // puck.js can ask for this world position instead of
    // guessing from the player's body center.
    this.puckControlPoint.position.set(
      0.24,
      -0.055,
      -0.02
    );

    this.stickBlade.add(
      this.puckControlPoint
    );

    // ------------------------------------------------
    // SHADOW / PLAYER MARKER
    // ------------------------------------------------

    const markerGeometry =
      new THREE.RingGeometry(
        0.63,
        0.73,
        32
      );

    const markerMaterial =
      new THREE.MeshBasicMaterial({
        color: 0x4ea5ff,
        transparent: true,
        opacity: 0.75,
        side: THREE.DoubleSide
      });

    this.marker =
      new THREE.Mesh(
        markerGeometry,
        markerMaterial
      );

    this.marker.rotation.x =
      -Math.PI / 2;

    this.marker.position.y =
      0.025;

    this.group.add(this.marker);
  }

  // ------------------------------------------------
  // CREATE SKATE
  // ------------------------------------------------

  createSkate(
    x,
    skateMaterial,
    bladeMaterial
  ) {
    const bootGeometry =
      new THREE.BoxGeometry(
        0.26,
        0.19,
        0.46
      );

    const boot =
      new THREE.Mesh(
        bootGeometry,
        skateMaterial
      );

    boot.position.set(
      x,
      0.23,
      0.04
    );

    boot.castShadow = true;

    this.group.add(boot);

    const bladeGeometry =
      new THREE.BoxGeometry(
        0.035,
        0.08,
        0.48
      );

    const blade =
      new THREE.Mesh(
        bladeGeometry,
        bladeMaterial
      );

    blade.position.set(
      x,
      0.10,
      0.04
    );

    this.group.add(blade);
  }

  // ------------------------------------------------
  // POSITION
  // ------------------------------------------------

  setPosition(
    x,
    z
  ) {
    this.position.set(
      x,
      0,
      z
    );

    this.group.position.copy(
      this.position
    );
  }

  // ------------------------------------------------
  // ROTATION
  // ------------------------------------------------

  setRotation(
    rotation
  ) {
    this.rotation =
      rotation;

    this.group.rotation.y =
      rotation;
  }

  // ------------------------------------------------
  // UPDATE
  // ------------------------------------------------

  update(delta, movement = null) {
    const inputX = movement?.x ?? 0;
    const inputY = movement?.y ?? 0;

    this.inputMagnitude = Math.min(
      movement?.magnitude ??
        Math.sqrt(
          inputX * inputX +
          inputY * inputY
        ),
      1
    );

    // World-space skating direction.
    //
    // Joystick up = toward the far end of the rink (-Z).
    // Joystick right = +X.
    this.moveDirection.set(
      inputX,
      0,
      -inputY
    );

    if (
      this.moveDirection.lengthSq() >
      0.0001
    ) {
      this.moveDirection.normalize();

      const targetSpeed =
        this.maxSpeed *
        this.inputMagnitude;

      this.speed = Math.min(
        this.speed +
          this.acceleration *
          delta,
        targetSpeed
      );

      // Smoothly face the direction of travel.
      const targetRotation =
        Math.atan2(
          this.moveDirection.x,
          this.moveDirection.z
        );

      let rotationDifference =
        targetRotation -
        this.rotation;

      rotationDifference =
        Math.atan2(
          Math.sin(rotationDifference),
          Math.cos(rotationDifference)
        );

      const maxTurn =
        this.turnSpeed *
        delta;

      this.rotation +=
        THREE.MathUtils.clamp(
          rotationDifference,
          -maxTurn,
          maxTurn
        );

      // Track how sharply the player is turning so puck.js
      // can let the puck lag instead of feeling welded on.
      let frameRotationDelta =
        this.rotation -
        this.lastRotation;

      frameRotationDelta =
        Math.atan2(
          Math.sin(frameRotationDelta),
          Math.cos(frameRotationDelta)
        );

      this.turnRate =
        delta > 0
          ? frameRotationDelta / delta
          : 0;

      // Skate in the requested direction.
      this.velocity.copy(
        this.moveDirection
      );

      this.velocity.multiplyScalar(
        this.speed
      );
    } else {
      this.turnRate =
        THREE.MathUtils.lerp(
          this.turnRate,
          0,
          1 -
            Math.exp(
              -8 * delta
            )
        );

      // Glide to a stop instead of stopping instantly.
      this.speed = Math.max(
        0,
        this.speed -
          this.deceleration *
          delta
      );

      if (this.speed <= 0.001) {
        this.speed = 0;
        this.velocity.set(
          0,
          0,
          0
        );
      } else if (
        this.velocity.lengthSq() >
        0.0001
      ) {
        this.velocity
          .normalize()
          .multiplyScalar(
            this.speed
          );
      }
    }

    this.position.addScaledVector(
      this.velocity,
      delta
    );

    // Temporary board containment.
    this.position.x =
      THREE.MathUtils.clamp(
        this.position.x,
        -this.rinkHalfLength,
        this.rinkHalfLength
      );

    this.position.z =
      THREE.MathUtils.clamp(
        this.position.z,
        -this.rinkHalfWidth,
        this.rinkHalfWidth
      );

    // Automatic placeholder stickhandling.
    // This is still not the future right-stick skill stick,
    // but it gives the blade independent movement instead of
    // moving as one rigid piece with the player.
    this.stickhandleTime +=
      delta *
      (
        2.4 +
        this.speed * 0.55
      );

    const targetStickhandleAmount =
      this.inputMagnitude > 0.05
        ? 1
        : 0.45;

    this.stickhandleAmount =
      THREE.MathUtils.lerp(
        this.stickhandleAmount,
        targetStickhandleAmount,
        1 -
          Math.exp(
            -6 * delta
          )
      );

    const turnInfluence =
      THREE.MathUtils.clamp(
        this.turnRate / 3.2,
        -1,
        1
      );

    const sideToSide =
      Math.sin(
        this.stickhandleTime
      ) *
      0.19 *
      this.stickhandleAmount;

    const forwardBack =
      Math.cos(
        this.stickhandleTime * 0.82
      ) *
      0.055 *
      this.stickhandleAmount;

    this.stickhandleSway =
      sideToSide;

    if (this.stickBlade) {
      this.stickBlade.position.x =
        0.98 +
        sideToSide +
        turnInfluence * 0.08;

      this.stickBlade.position.z =
        -0.19 +
        forwardBack;

      this.stickBlade.rotation.y =
        -0.15 +
        sideToSide * 0.62 +
        turnInfluence * 0.18;

      this.stickBlade.rotation.z =
        -turnInfluence * 0.06;

      if (this.stickShaft) {
        this.stickShaft.rotation.z =
          -0.38 -
          sideToSide * 0.15 -
          turnInfluence * 0.055;

        this.stickShaft.rotation.x =
          0.10 +
          forwardBack * 0.35;
      }
    }

    this.lastRotation =
      this.rotation;

    this.group.position.copy(
      this.position
    );

    this.group.rotation.y =
      this.rotation;
  }

  // ------------------------------------------------
  // GET POSITION
  // ------------------------------------------------

  getPosition() {
    return this.position;
  }

  // ------------------------------------------------
  // PUCK / STICK CONTROL POINT
  // ------------------------------------------------

  getPuckControlPoint(
    target = new THREE.Vector3()
  ) {
    if (!this.puckControlPoint) {
      return target.copy(
        this.position
      );
    }

    this.group.updateMatrixWorld(
      true
    );

    return this.puckControlPoint
      .getWorldPosition(
        target
      );
  }

  getStickBlade() {
    return this.stickBlade;
  }

  getTurnRate() {
    return this.turnRate;
  }

  getStickhandleSway() {
    return this.stickhandleSway;
  }

  // ------------------------------------------------
  // GET OBJECT
  // ------------------------------------------------

  getObject3D() {
    return this.group;
  }
}
