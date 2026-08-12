import * as THREE from "three";
import { RINK } from "./rink.js";

// ==================================================
// MOBILE NHL 27 - PUCK
// ==================================================
//
// First real puck system.
//
// Includes:
// - puck mesh
// - free sliding
// - friction
// - player pickup / possession
// - carrying at the stick side
// - dropping
// - basic shooting impulse
// - basic passing impulse
//
// Later:
// - board collisions
// - stick handling
// - goalie saves
// - deflections
// - rebounds
// - lift / slapshots / wrist shots
// ==================================================

export class HockeyPuck {
  constructor(scene, options = {}) {
    this.scene = scene;

    // Regulation puck scale for this rink:
    // 3 in diameter x 1 in thick.
    this.radius =
      options.radius ?? 0.0375;

    this.height =
      options.height ?? 0.025;

    this.visualScale =
      options.visualScale ?? 1.75;

    this.indicatorRadius =
      options.indicatorRadius ?? 0.18;

    this.position =
      new THREE.Vector3(
        options.x ?? 0,
        this.height / 2,
        options.z ?? 0
      );

    this.velocity =
      new THREE.Vector3();

    this.friction =
      options.friction ?? 2.4;

    this.maxFreeSpeed =
      options.maxFreeSpeed ?? 28;

    this.boardRestitution =
      options.boardRestitution ?? 0.68;

    this.boardTangentialDrag =
      options.boardTangentialDrag ?? 0.94;

    this.boardInset =
      options.boardInset ?? 0.10;

    this.pickupRadius =
      options.pickupRadius ?? 1.35;

    // Loose-puck control tuning.
    this.pickupFrontDot =
      options.pickupFrontDot ?? -0.15;

    this.pickupCooldown =
      options.pickupCooldown ?? 0;

    this.repickupDelay =
      options.repickupDelay ?? 0.20;

    this.controlBreakDistance =
      options.controlBreakDistance ?? 1.10;

    this.controlBreakTurnRate =
      options.controlBreakTurnRate ?? 3.05;

    this.controlBreakMinSpeed =
      options.controlBreakMinSpeed ?? 6.25;

    this.possessedBy = null;

    // Shot charging / release.
    this.shotCharge = 0;
    this.maxShotChargeTime = 1.15;
    this.minShotPower = 11;
    this.maxShotPower = 28;
    this.isChargingShot = false;

    // Temporary stick-blade target until the player model
    // gets an actual animated stick / blade attachment point.
    this.carrySide =
      options.carrySide ?? 1;

    this.carryForward =
      options.carryForward ?? 0.72;

    this.carryRight =
      options.carryRight ?? 0.52;

    this.carryFollowSpeed =
      options.carryFollowSpeed ?? 18;

    this.carryTarget =
      new THREE.Vector3();

    this.bladeWorldPosition =
      new THREE.Vector3();

    // Possession dynamics. These let the puck feel controlled
    // by the stick without being perfectly welded to it.
    this.possessionOffset =
      new THREE.Vector3();

    this.possessionLag =
      new THREE.Vector3();

    this.lastCarryTarget =
      new THREE.Vector3();

    this.mesh =
      this.createMesh();

    this.mesh.position.copy(
      this.position
    );

    this.indicator =
      this.createIndicator();

    this.indicator.position.copy(
      this.position
    );

    this.scene.add(
      this.mesh
    );

    this.scene.add(
      this.indicator
    );
  }

  // ------------------------------------------------
  // MESH
  // ------------------------------------------------

  createMesh() {
    const geometry =
      new THREE.CylinderGeometry(
        this.radius *
          this.visualScale,
        this.radius *
          this.visualScale,
        this.height *
          this.visualScale,
        40,
        1,
        false
      );

    const material =
      new THREE.MeshStandardMaterial({
        color: 0x070707,
        roughness: 0.72
      });

    const mesh =
      new THREE.Mesh(
        geometry,
        material
      );

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
  }

  createIndicator() {
    const geometry =
      new THREE.RingGeometry(
        this.indicatorRadius * 0.62,
        this.indicatorRadius,
        40
      );

    const material =
      new THREE.MeshBasicMaterial({
        color: 0x111111,
        transparent: true,
        opacity: 0.28,
        side: THREE.DoubleSide,
        depthWrite: false
      });

    const indicator =
      new THREE.Mesh(
        geometry,
        material
      );

    indicator.rotation.x =
      -Math.PI / 2;

    indicator.position.y =
      0.008;

    return indicator;
  }

  // ------------------------------------------------
  // POSSESSION
  // ------------------------------------------------

  isPossessed() {
    return this.possessedBy !== null;
  }

  canBePickedUpBy(player) {
    if (
      this.isPossessed() ||
      !player ||
      this.pickupCooldown > 0
    ) {
      return false;
    }

    const playerPosition =
      player.getPosition
        ? player.getPosition()
        : player.position;

    if (!playerPosition) {
      return false;
    }

    const toPuck =
      new THREE.Vector3(
        this.position.x -
          playerPosition.x,
        0,
        this.position.z -
          playerPosition.z
      );

    const distance =
      toPuck.length();

    if (
      distance >
      this.pickupRadius ||
      distance <
      0.0001
    ) {
      return false;
    }

    toPuck.normalize();

    const forward =
      this.getPlayerForward(
        player
      );

    // Don't magically collect a puck that's well behind the
    // skater. Slightly beside the player is still allowed so
    // mobile pickup remains forgiving.
    const frontDot =
      forward.dot(
        toPuck
      );

    if (
      frontDot <
      this.pickupFrontDot
    ) {
      return false;
    }

    // If the player exposes a real blade control point, the
    // puck must also be reasonably close to the stick area.
    if (
      typeof player.getPuckControlPoint ===
      "function"
    ) {
      player.getPuckControlPoint(
        this.bladeWorldPosition
      );

      const bladeDistance =
        this.bladeWorldPosition
          .distanceTo(
            this.position
          );

      if (
        bladeDistance >
        this.pickupRadius * 1.15
      ) {
        return false;
      }
    }

    return true;
  }

  tryPickup(player) {
    if (
      !this.canBePickedUpBy(
        player
      )
    ) {
      return false;
    }

    this.possessedBy = player;

    this.velocity.set(
      0,
      0,
      0
    );

    return true;
  }

  drop() {
    this.possessedBy = null;
    this.pickupCooldown =
      this.repickupDelay;
    this.isChargingShot = false;
    this.shotCharge = 0;
  }

  losePossession(
    player,
    outwardDirection = null
  ) {
    if (
      !this.possessedBy
    ) {
      return false;
    }

    const playerVelocity =
      player?.velocity
        ? player.velocity.clone()
        : new THREE.Vector3();

    const releaseDirection =
      outwardDirection?.clone?.() ??
      this.getPlayerRight(
        player
      );

    releaseDirection.y = 0;

    if (
      releaseDirection.lengthSq() >
      0.0001
    ) {
      releaseDirection.normalize();
    }

    this.drop();

    // Keep some of the skater's momentum so losing the puck
    // during a hard cut looks like a real bobble instead of
    // the puck freezing in place.
    this.velocity
      .copy(
        playerVelocity
      )
      .multiplyScalar(
        0.58
      )
      .addScaledVector(
        releaseDirection,
        2.1
      );

    this.clampVelocity();

    return true;
  }

  // ------------------------------------------------
  // PLAYER FORWARD / RIGHT
  // ------------------------------------------------

  getPlayerForward(player) {
    const rotation =
      player?.rotation ?? 0;

    return new THREE.Vector3(
      Math.sin(rotation),
      0,
      Math.cos(rotation)
    ).normalize();
  }

  getPlayerRight(player) {
    const forward =
      this.getPlayerForward(
        player
      );

    return new THREE.Vector3(
      forward.z,
      0,
      -forward.x
    ).normalize();
  }

  // ------------------------------------------------
  // CARRY
  // ------------------------------------------------

  updateCarriedPosition(delta = 0) {
    const player =
      this.possessedBy;

    if (!player) {
      return;
    }

    const forward =
      this.getPlayerForward(
        player
      );

    const right =
      this.getPlayerRight(
        player
      );

    // Best path: follow the real blade attachment point.
    if (
      typeof player.getPuckControlPoint ===
      "function"
    ) {
      player.getPuckControlPoint(
        this.bladeWorldPosition
      );

      this.carryTarget.copy(
        this.bladeWorldPosition
      );
    } else {
      const playerPosition =
        player.getPosition
          ? player.getPosition()
          : player.position;

      if (!playerPosition) {
        return;
      }

      this.carryTarget
        .copy(playerPosition)
        .addScaledVector(
          forward,
          this.carryForward
        )
        .addScaledVector(
          right,
          this.carryRight *
            this.carrySide
        );
    }

    // Let the puck sweep slightly across / ahead of the blade
    // instead of staying on one exact local point.
    const sway =
      typeof player.getStickhandleSway ===
      "function"
        ? player.getStickhandleSway()
        : 0;

    const speed =
      player.speed ?? 0;

    const turnRate =
      typeof player.getTurnRate ===
      "function"
        ? player.getTurnRate()
        : 0;

    const turnAmount =
      THREE.MathUtils.clamp(
        turnRate / 3.2,
        -1,
        1
      );

    this.possessionOffset
      .set(0, 0, 0)
      .addScaledVector(
        right,
        sway * 0.42
      )
      .addScaledVector(
        forward,
        0.035 +
          Math.min(
            speed / 8,
            1
          ) * 0.08
      );

    this.carryTarget.add(
      this.possessionOffset
    );

    // During harder turns, the puck resists the change of
    // direction for a fraction of a second. This creates the
    // visual "lag" that was missing from the rigid version.
    this.possessionLag
      .multiplyScalar(
        Math.exp(
          -10 * delta
        )
      )
      .addScaledVector(
        right,
        -turnAmount *
          speed *
          delta *
          0.16
      );

    this.carryTarget.add(
      this.possessionLag
    );

    this.carryTarget.y =
      this.height / 2 +
      0.012;

    // Faster near the blade, but not instant.
    const followSpeed =
      THREE.MathUtils.lerp(
        16,
        24,
        Math.min(
          speed / 8,
          1
        )
      );

    const followAlpha =
      delta > 0
        ? 1 -
          Math.exp(
            -followSpeed *
            delta
          )
        : 1;

    this.position.lerp(
      this.carryTarget,
      followAlpha
    );

    this.lastCarryTarget.copy(
      this.carryTarget
    );

    this.velocity.set(
      0,
      0,
      0
    );

    // Hard, fast cuts can now cause a bobbled puck if the
    // puck gets too far from the blade. This is deterministic:
    // no random turnovers.
    const controlDistance =
      this.position.distanceTo(
        this.carryTarget
      );

    const hardTurn =
      Math.abs(
        turnRate
      ) >=
      this.controlBreakTurnRate;

    const movingFast =
      speed >=
      this.controlBreakMinSpeed;

    if (
      hardTurn &&
      movingFast &&
      controlDistance >
        this.controlBreakDistance
    ) {
      const side =
        turnRate >= 0
          ? -1
          : 1;

      const outward =
        right.clone()
          .multiplyScalar(
            side
          );

      this.losePossession(
        player,
        outward
      );
    }
  }

  // ------------------------------------------------
  // SHOT CHARGE
  // ------------------------------------------------

  startShotCharge() {
    if (!this.possessedBy) {
      return false;
    }

    this.isChargingShot = true;
    this.shotCharge = 0;

    return true;
  }

  updateShotCharge(delta) {
    if (
      !this.isChargingShot ||
      !this.possessedBy
    ) {
      return;
    }

    this.shotCharge =
      Math.min(
        this.maxShotChargeTime,
        this.shotCharge + delta
      );
  }

  releaseChargedShot(
    direction = null
  ) {
    if (
      !this.isChargingShot ||
      !this.possessedBy
    ) {
      this.isChargingShot = false;
      this.shotCharge = 0;
      return false;
    }

    const t =
      THREE.MathUtils.clamp(
        this.shotCharge /
          this.maxShotChargeTime,
        0,
        1
      );

    // Ease the power curve so short taps stay useful while
    // a full hold produces a noticeably harder shot.
    const eased =
      1 -
      Math.pow(
        1 - t,
        2
      );

    const power =
      THREE.MathUtils.lerp(
        this.minShotPower,
        this.maxShotPower,
        eased
      );

    this.isChargingShot = false;
    this.shotCharge = 0;

    return this.shoot(
      power,
      direction
    );
  }

  getShotCharge01() {
    return THREE.MathUtils.clamp(
      this.shotCharge /
        this.maxShotChargeTime,
      0,
      1
    );
  }

  // ------------------------------------------------
  // SHOOT
  // ------------------------------------------------

  shoot(
    power = 20,
    direction = null
  ) {
    if (!this.possessedBy) {
      return false;
    }

    const player =
      this.possessedBy;

    const shotDirection =
      direction?.clone?.() ??
      this.getPlayerForward(
        player
      );

    shotDirection.y = 0;

    if (
      shotDirection.lengthSq() <
      0.0001
    ) {
      return false;
    }

    shotDirection.normalize();

    this.drop();

    this.velocity.copy(
      shotDirection
    );

    this.velocity.multiplyScalar(
      power
    );

    this.clampVelocity();

    return true;
  }

  // ------------------------------------------------
  // PASS
  // ------------------------------------------------

  pass(
    direction,
    power = 12
  ) {
    if (!this.possessedBy) {
      return false;
    }

    if (!direction) {
      return false;
    }

    const passDirection =
      direction.clone();

    passDirection.y = 0;

    if (
      passDirection.lengthSq() <
      0.0001
    ) {
      return false;
    }

    passDirection.normalize();

    this.drop();

    this.velocity.copy(
      passDirection
    );

    this.velocity.multiplyScalar(
      power
    );

    this.clampVelocity();

    return true;
  }

  // ------------------------------------------------
  // RINK / BOARD COLLISION
  // ------------------------------------------------

  getPlayableHalfWidthAtX(x) {
    const halfLength =
      RINK.length / 2;

    const halfWidth =
      RINK.width / 2;

    const radius =
      RINK.cornerRadius;

    const straightEnd =
      halfLength - radius;

    const absX =
      Math.abs(x);

    if (absX <= straightEnd) {
      return halfWidth;
    }

    const dx =
      absX - straightEnd;

    const inside =
      Math.max(
        0,
        radius * radius -
          dx * dx
      );

    return (
      halfWidth -
      radius +
      Math.sqrt(inside)
    );
  }

  resolveBoardCollision() {
    const halfLength =
      RINK.length / 2;

    const halfWidth =
      RINK.width / 2;

    const cornerRadius =
      RINK.cornerRadius;

    const puckRadius =
      this.radius;

    const inset =
      this.boardInset +
      puckRadius;

    const straightEnd =
      halfLength -
      cornerRadius;

    const absX =
      Math.abs(
        this.position.x
      );

    const absZ =
      Math.abs(
        this.position.z
      );

    // ----------------------------------------------
    // STRAIGHT SIDE BOARDS
    // ----------------------------------------------

    if (
      absX <= straightEnd
    ) {
      const maxZ =
        halfWidth - inset;

      if (
        absZ > maxZ
      ) {
        const signZ =
          Math.sign(
            this.position.z
          ) || 1;

        this.position.z =
          signZ *
          maxZ;

        this.velocity.z *=
          -this.boardRestitution;

        this.velocity.x *=
          this.boardTangentialDrag;
      }

      return;
    }

    // ----------------------------------------------
    // STRAIGHT END BOARDS
    // ----------------------------------------------

    const verticalStraightLimit =
      halfWidth -
      cornerRadius;

    if (
      absZ <=
      verticalStraightLimit
    ) {
      const maxX =
        halfLength - inset;

      if (
        absX > maxX
      ) {
        const signX =
          Math.sign(
            this.position.x
          ) || 1;

        this.position.x =
          signX *
          maxX;

        this.velocity.x *=
          -this.boardRestitution;

        this.velocity.z *=
          this.boardTangentialDrag;
      }

      return;
    }

    // ----------------------------------------------
    // ROUNDED CORNERS
    // ----------------------------------------------

    const centerX =
      Math.sign(
        this.position.x
      ) *
      straightEnd;

    const centerZ =
      Math.sign(
        this.position.z
      ) *
      verticalStraightLimit;

    const dx =
      this.position.x -
      centerX;

    const dz =
      this.position.z -
      centerZ;

    const distance =
      Math.sqrt(
        dx * dx +
        dz * dz
      );

    const maxRadius =
      cornerRadius - inset;

    if (
      distance >
      maxRadius &&
      distance >
      0.0001
    ) {
      const normalX =
        dx / distance;

      const normalZ =
        dz / distance;

      // Push puck back onto playable ice.
      this.position.x =
        centerX +
        normalX *
        maxRadius;

      this.position.z =
        centerZ +
        normalZ *
        maxRadius;

      // Reflect velocity off the curved board.
      const dot =
        this.velocity.x *
          normalX +
        this.velocity.z *
          normalZ;

      if (dot > 0) {
        this.velocity.x -=
          (1 + this.boardRestitution) *
          dot *
          normalX;

        this.velocity.z -=
          (1 + this.boardRestitution) *
          dot *
          normalZ;
      }

      // Lose a little energy along the wall.
      this.velocity.x *=
        this.boardTangentialDrag;

      this.velocity.z *=
        this.boardTangentialDrag;
    }
  }

  // ------------------------------------------------
  // FREE PUCK PHYSICS
  // ------------------------------------------------

  clampVelocity() {
    const speed =
      this.velocity.length();

    if (
      speed >
      this.maxFreeSpeed
    ) {
      this.velocity
        .normalize()
        .multiplyScalar(
          this.maxFreeSpeed
        );
    }
  }

  updateFreePuck(delta) {
    const speed =
      this.velocity.length();

    if (speed > 0.001) {
      const newSpeed =
        Math.max(
          0,
          speed -
            this.friction *
            delta
        );

      if (newSpeed <= 0.001) {
        this.velocity.set(
          0,
          0,
          0
        );
      } else {
        this.velocity
          .normalize()
          .multiplyScalar(
            newSpeed
          );
      }
    }

    this.position.addScaledVector(
      this.velocity,
      delta
    );

    this.resolveBoardCollision();

    this.position.y =
      this.height / 2;
  }

  // ------------------------------------------------
  // UPDATE
  // ------------------------------------------------

  update(delta, player = null) {
    if (
      this.pickupCooldown > 0
    ) {
      this.pickupCooldown =
        Math.max(
          0,
          this.pickupCooldown -
            delta
        );
    }

    if (
      this.isPossessed()
    ) {
      this.updateCarriedPosition(
        delta
      );
    } else {
      this.updateFreePuck(
        delta
      );

      // Auto-pickup for now:
      // skate close enough and you gain possession.
      //
      // Later this can depend on stick position,
      // ratings, loose-puck battles, etc.
      if (player) {
        this.tryPickup(
          player
        );
      }
    }

    this.mesh.position.copy(
      this.position
    );

    this.indicator.position.set(
      this.position.x,
      0.008,
      this.position.z
    );

    this.indicator.visible =
      !this.isPossessed();

    // Visual spin while moving.
    const speed =
      this.velocity.length();

    if (speed > 0.01) {
      this.mesh.rotation.y +=
        delta *
        speed *
        0.9;
    }
  }

  // ------------------------------------------------
  // GETTERS
  // ------------------------------------------------

  getPosition() {
    return this.position;
  }

  getVelocity() {
    return this.velocity;
  }

  getObject3D() {
    return this.mesh;
  }
}

