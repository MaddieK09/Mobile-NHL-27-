import * as THREE from "three";

// ==================================================
// MOBILE NHL 27 - CAMERA SYSTEM
// ==================================================
//
// Gameplay camera presets:
// - Dynamic
// - Classic
// - Broadcast
// - Zone
// - Be A Pro
// - First Person
//
// The pause menu can later call setMode() to choose
// the player's preferred camera.
// ==================================================

export const CAMERA_MODES = {
  DYNAMIC: "dynamic",
  CLASSIC: "classic",
  BROADCAST: "broadcast",
  ZONE: "zone",
  BE_A_PRO: "be-a-pro",
  FIRST_PERSON: "first-person"
};

export const CAMERA_LABELS = {
  [CAMERA_MODES.DYNAMIC]: "Dynamic",
  [CAMERA_MODES.CLASSIC]: "Classic",
  [CAMERA_MODES.BROADCAST]: "Broadcast",
  [CAMERA_MODES.ZONE]: "Zone",
  [CAMERA_MODES.BE_A_PRO]: "Be A Pro",
  [CAMERA_MODES.FIRST_PERSON]: "First Person"
};

export class CameraManager {
  constructor(camera, player, options = {}) {
    this.camera = camera;
    this.player = player;

    this.mode =
      options.mode ??
      CAMERA_MODES.DYNAMIC;

    this.smoothing =
      options.smoothing ?? 7.5;

    this.lookSmoothing =
      options.lookSmoothing ?? 9.0;

    this.currentLookTarget =
      new THREE.Vector3();

    this.desiredPosition =
      new THREE.Vector3();

    this.desiredLookTarget =
      new THREE.Vector3();

    this.forward =
      new THREE.Vector3();

    this.right =
      new THREE.Vector3();

    this.up =
      new THREE.Vector3(0, 1, 0);

    this.tempVector =
      new THREE.Vector3();

    this.firstUpdate = true;

    // Used by Broadcast and Zone cameras.
    this.rinkCenter =
      new THREE.Vector3(0, 0, 0);

    this.setMode(this.mode, true);
  }

  // ------------------------------------------------
  // MODE CONTROL
  // ------------------------------------------------

  setMode(mode, snap = false) {
    if (
      !Object.values(
        CAMERA_MODES
      ).includes(mode)
    ) {
      console.warn(
        `Unknown camera mode: ${mode}`
      );

      return;
    }

    this.mode = mode;

    if (snap) {
      this.firstUpdate = true;
    }
  }

  getMode() {
    return this.mode;
  }

  getModeLabel() {
    return (
      CAMERA_LABELS[
        this.mode
      ] ?? this.mode
    );
  }

  getAvailableModes() {
    return Object.values(
      CAMERA_MODES
    ).map((mode) => ({
      id: mode,
      label:
        CAMERA_LABELS[mode]
    }));
  }

  cycleMode(direction = 1) {
    const modes =
      Object.values(
        CAMERA_MODES
      );

    const currentIndex =
      modes.indexOf(
        this.mode
      );

    const nextIndex =
      (
        currentIndex +
        direction +
        modes.length
      ) %
      modes.length;

    this.setMode(
      modes[nextIndex],
      true
    );

    return this.mode;
  }

  // ------------------------------------------------
  // PLAYER HELPERS
  // ------------------------------------------------

  getPlayerPosition() {
    if (
      this.player?.getPosition
    ) {
      return this.player.getPosition();
    }

    return (
      this.player?.position ??
      this.rinkCenter
    );
  }

  getPlayerRotation() {
    return (
      this.player?.rotation ??
      0
    );
  }

  updatePlayerVectors() {
    const rotation =
      this.getPlayerRotation();

    // Player forward direction.
    //
    // This matches the movement rotation currently used
    // in player.js.
    this.forward.set(
      Math.sin(rotation),
      0,
      Math.cos(rotation)
    );

    this.forward.normalize();

    this.right.set(
      this.forward.z,
      0,
      -this.forward.x
    );

    this.right.normalize();
  }

  // ------------------------------------------------
  // CAMERA PRESETS
  // ------------------------------------------------

  calculateDynamic() {
    const playerPosition =
      this.getPlayerPosition();

    // NHL-style dynamic follow camera:
    // follow the skater's POSITION, not their facing.
    //
    // This keeps "up" on the joystick consistent instead
    // of making the whole camera swing around every time
    // the player turns.
    this.desiredPosition.set(
      playerPosition.x * 0.82,
      10.5,
      playerPosition.z + 15.5
    );

    // Look slightly ahead toward the far end of the rink,
    // but keep the rink orientation stable.
    this.desiredLookTarget.set(
      playerPosition.x,
      0.7,
      playerPosition.z - 3.8
    );
  }

  calculateClassic() {
    const playerPosition =
      this.getPlayerPosition();

    // More traditional hockey-game view:
    // higher, wider, and less tightly attached.
    this.desiredPosition.set(
      playerPosition.x * 0.58,
      17.5,
      playerPosition.z + 22
    );

    this.desiredLookTarget.set(
      playerPosition.x * 0.78,
      0,
      playerPosition.z - 2.5
    );
  }

  calculateBroadcast() {
    const playerPosition =
      this.getPlayerPosition();

    // TV-style camera from the side of the rink.
    // It follows the play along the length of the ice.
    this.desiredPosition.set(
      playerPosition.x * 0.78,
      13.5,
      28
    );

    this.desiredLookTarget.set(
      playerPosition.x,
      0.8,
      playerPosition.z * 0.25
    );
  }

  calculateZone() {
    const playerPosition =
      this.getPlayerPosition();

    // High tactical view with lots of surrounding ice.
    this.desiredPosition.set(
      playerPosition.x * 0.35,
      25,
      playerPosition.z + 11
    );

    this.desiredLookTarget.set(
      playerPosition.x * 0.55,
      0,
      playerPosition.z - 1
    );
  }

  calculateBeAPro() {
    const playerPosition =
      this.getPlayerPosition();

    this.updatePlayerVectors();

    // Tighter player-focused third-person camera.
    this.desiredPosition
      .copy(playerPosition)
      .addScaledVector(
        this.forward,
        -6.4
      )
      .addScaledVector(
        this.up,
        4.3
      );

    this.desiredLookTarget
      .copy(playerPosition)
      .addScaledVector(
        this.forward,
        5.5
      );

    this.desiredLookTarget.y =
      1.15;
  }

  calculateFirstPerson() {
    const playerPosition =
      this.getPlayerPosition();

    this.updatePlayerVectors();

    // Eye / helmet-height camera.
    //
    // The slight forward offset keeps the camera from
    // sitting inside the head geometry.
    this.desiredPosition
      .copy(playerPosition)
      .addScaledVector(
        this.forward,
        0.28
      );

    this.desiredPosition.y =
      2.13;

    this.desiredLookTarget
      .copy(this.desiredPosition)
      .addScaledVector(
        this.forward,
        12
      );

    // Slight downward angle so you can still see the
    // ice / stick area.
    this.desiredLookTarget.y -=
      0.35;
  }

  // ------------------------------------------------
  // CALCULATE CURRENT PRESET
  // ------------------------------------------------

  calculateDesiredCamera() {
    switch (this.mode) {
      case CAMERA_MODES.CLASSIC:
        this.calculateClassic();
        break;

      case CAMERA_MODES.BROADCAST:
        this.calculateBroadcast();
        break;

      case CAMERA_MODES.ZONE:
        this.calculateZone();
        break;

      case CAMERA_MODES.BE_A_PRO:
        this.calculateBeAPro();
        break;

      case CAMERA_MODES.FIRST_PERSON:
        this.calculateFirstPerson();
        break;

      case CAMERA_MODES.DYNAMIC:
      default:
        this.calculateDynamic();
        break;
    }
  }

  // ------------------------------------------------
  // UPDATE
  // ------------------------------------------------

  update(delta) {
    if (
      !this.camera ||
      !this.player
    ) {
      return;
    }

    this.calculateDesiredCamera();

    if (this.firstUpdate) {
      this.camera.position.copy(
        this.desiredPosition
      );

      this.currentLookTarget.copy(
        this.desiredLookTarget
      );

      this.camera.lookAt(
        this.currentLookTarget
      );

      this.firstUpdate = false;

      return;
    }

    // Frame-rate independent smoothing.
    const positionAlpha =
      1 -
      Math.exp(
        -this.smoothing *
        delta
      );

    const lookAlpha =
      1 -
      Math.exp(
        -this.lookSmoothing *
        delta
      );

    this.camera.position.lerp(
      this.desiredPosition,
      positionAlpha
    );

    this.currentLookTarget.lerp(
      this.desiredLookTarget,
      lookAlpha
    );

    this.camera.lookAt(
      this.currentLookTarget
    );
  }
}
