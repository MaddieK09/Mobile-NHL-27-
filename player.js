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

    this.height = options.height ?? 1.85;

    this.teamColor = options.teamColor ?? 0x1f5dbb;

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

    const stickShaft =
      new THREE.Mesh(
        shaftGeometry,
        stickMaterial
      );

    stickShaft.position.set(
      0.69,
      0.82,
      -0.15
    );

    stickShaft.rotation.z =
      -0.38;

    stickShaft.rotation.x =
      0.10;

    stickShaft.castShadow = true;

    this.group.add(stickShaft);

    const bladeGeometry =
      new THREE.BoxGeometry(
        0.56,
        0.09,
        0.18
      );

    const stickBlade =
      new THREE.Mesh(
        bladeGeometry,
        stickMaterial
      );

    stickBlade.position.set(
      0.98,
      0.13,
      -0.19
    );

    stickBlade.rotation.y =
      -0.15;

    stickBlade.castShadow = true;

    this.group.add(stickBlade);

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

  update(delta) {
    // Movement comes next from controls.js.
    //
    // For now we only keep the player group synced.

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
  // GET OBJECT
  // ------------------------------------------------

  getObject3D() {
    return this.group;
  }
}
