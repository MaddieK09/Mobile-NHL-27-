// ==================================================
// MOBILE NHL 27 - CONTROLS
// ==================================================
//
// First-pass input system.
//
// Supports:
// - iPhone / touchscreen virtual joystick
// - mouse/pointer testing
// - keyboard testing
//
// Controller support stays in gamepad.js.
// ==================================================

export class Controls {
  constructor() {
    this.moveX = 0;
    this.moveY = 0;

    // One-shot hockey actions.
    // consumeAction() clears these after game.js reads them.
    this.actions = {
      shoot: false,
      pass: false,
      shootPressed: false,
      shootReleased: false
    };

    this.shootHeld = false;

    this.joystickActive = false;

    this.pointerId = null;

    this.startX = 0;
    this.startY = 0;

    this.currentX = 0;
    this.currentY = 0;

    this.maxRadius = 65;

    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false
    };

    this.createJoystick();
    this.createActionButtons();
    this.setupTouchControls();
    this.setupActionControls();
    this.setupKeyboardControls();
  }

  // ------------------------------------------------
  // CREATE MOBILE JOYSTICK
  // ------------------------------------------------

  createJoystick() {
    this.joystickBase =
      document.createElement("div");

    this.joystickStick =
      document.createElement("div");

    this.joystickBase.id =
      "movement-joystick";

    this.joystickStick.id =
      "movement-stick";

    // Temporary styling.
    //
    // Later we'll move this into style.css.

    Object.assign(
      this.joystickBase.style,
      {
        position: "fixed",

        left: "34px",
        bottom: "34px",

        width: "140px",
        height: "140px",

        borderRadius: "50%",

        background:
          "rgba(255,255,255,0.12)",

        border:
          "3px solid rgba(255,255,255,0.32)",

        zIndex: "200",

        touchAction: "none",

        userSelect: "none",

        WebkitUserSelect: "none"
      }
    );

    Object.assign(
      this.joystickStick.style,
      {
        position: "absolute",

        left: "50%",
        top: "50%",

        width: "62px",
        height: "62px",

        marginLeft: "-31px",
        marginTop: "-31px",

        borderRadius: "50%",

        background:
          "rgba(255,255,255,0.60)",

        boxShadow:
          "0 4px 18px rgba(0,0,0,0.35)",

        pointerEvents: "none",

        transform:
          "translate(0px, 0px)"
      }
    );

    this.joystickBase.appendChild(
      this.joystickStick
    );

    document.body.appendChild(
      this.joystickBase
    );
  }

  // ------------------------------------------------
  // MOBILE HOCKEY BUTTONS
  // ------------------------------------------------

  createActionButtons() {
    this.actionContainer =
      document.createElement("div");

    this.actionContainer.id =
      "hockey-actions";

    Object.assign(
      this.actionContainer.style,
      {
        position: "fixed",
        right: "28px",
        bottom: "30px",
        width: "190px",
        height: "150px",
        zIndex: "210",
        pointerEvents: "none",
        userSelect: "none",
        WebkitUserSelect: "none"
      }
    );

    this.shootButton =
      this.createActionButton(
        "SHOOT",
        "shoot-button",
        86,
        86
      );

    this.passButton =
      this.createActionButton(
        "PASS",
        "pass-button",
        72,
        72
      );

    Object.assign(
      this.shootButton.style,
      {
        position: "absolute",
        right: "0px",
        bottom: "24px"
      }
    );

    Object.assign(
      this.passButton.style,
      {
        position: "absolute",
        right: "92px",
        bottom: "0px"
      }
    );

    this.actionContainer.appendChild(
      this.shootButton
    );

    this.actionContainer.appendChild(
      this.passButton
    );

    document.body.appendChild(
      this.actionContainer
    );
  }

  createActionButton(
    label,
    id,
    width,
    height
  ) {
    const button =
      document.createElement("button");

    button.id = id;
    button.textContent = label;

    Object.assign(
      button.style,
      {
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: "50%",
        border:
          "3px solid rgba(255,255,255,0.34)",
        background:
          "rgba(15,35,58,0.70)",
        color: "#ffffff",
        fontSize: "14px",
        fontWeight: "800",
        letterSpacing: "0.5px",
        boxShadow:
          "0 5px 18px rgba(0,0,0,0.35)",
        touchAction: "none",
        pointerEvents: "auto",
        WebkitTapHighlightColor:
          "transparent"
      }
    );

    return button;
  }

  setupActionControls() {
    const bindAction =
      (button, actionName) => {
        button.addEventListener(
          "pointerdown",
          (event) => {
            event.preventDefault();
            event.stopPropagation();

            this.actions[
              actionName
            ] = true;

            button.style.transform =
              "scale(0.90)";
          }
        );

        const release =
          (event) => {
            if (event) {
              event.preventDefault();
              event.stopPropagation();
            }

            button.style.transform =
              "scale(1)";
          };

        button.addEventListener(
          "pointerup",
          release
        );

        button.addEventListener(
          "pointercancel",
          release
        );

        button.addEventListener(
          "pointerleave",
          release
        );
      };

    // SHOOT is hold-to-charge, release-to-fire.
    this.shootButton.addEventListener(
      "pointerdown",
      (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (!this.shootHeld) {
          this.actions.shootPressed = true;
        }

        this.shootHeld = true;

        this.shootButton.style.transform =
          "scale(0.90)";
      }
    );

    const releaseShoot =
      (event) => {
        if (event) {
          event.preventDefault();
          event.stopPropagation();
        }

        if (this.shootHeld) {
          this.actions.shootReleased = true;
        }

        this.shootHeld = false;

        this.shootButton.style.transform =
          "scale(1)";
      };

    this.shootButton.addEventListener(
      "pointerup",
      releaseShoot
    );

    this.shootButton.addEventListener(
      "pointercancel",
      releaseShoot
    );

    this.shootButton.addEventListener(
      "pointerleave",
      releaseShoot
    );

    // PASS stays a quick one-shot action.
    bindAction(
      this.passButton,
      "pass"
    );
  }

  // ------------------------------------------------
  // TOUCH / POINTER INPUT
  // ------------------------------------------------

  setupTouchControls() {
    this.joystickBase.addEventListener(
      "pointerdown",
      (event) => {
        event.preventDefault();

        this.joystickActive = true;

        this.pointerId =
          event.pointerId;

        this.joystickBase.setPointerCapture(
          event.pointerId
        );

        const rect =
          this.joystickBase.getBoundingClientRect();

        this.startX =
          rect.left +
          rect.width / 2;

        this.startY =
          rect.top +
          rect.height / 2;

        this.updateJoystick(
          event.clientX,
          event.clientY
        );
      }
    );

    this.joystickBase.addEventListener(
      "pointermove",
      (event) => {
        if (
          !this.joystickActive ||
          event.pointerId !==
            this.pointerId
        ) {
          return;
        }

        event.preventDefault();

        this.updateJoystick(
          event.clientX,
          event.clientY
        );
      }
    );

    const endPointer =
      (event) => {
        if (
          event.pointerId !==
          this.pointerId
        ) {
          return;
        }

        this.resetJoystick();
      };

    this.joystickBase.addEventListener(
      "pointerup",
      endPointer
    );

    this.joystickBase.addEventListener(
      "pointercancel",
      endPointer
    );

    this.joystickBase.addEventListener(
      "lostpointercapture",
      () => {
        this.resetJoystick();
      }
    );
  }

  // ------------------------------------------------
  // UPDATE JOYSTICK
  // ------------------------------------------------

  updateJoystick(
    pointerX,
    pointerY
  ) {
    let dx =
      pointerX -
      this.startX;

    let dy =
      pointerY -
      this.startY;

    const distance =
      Math.sqrt(
        dx * dx +
        dy * dy
      );

    if (
      distance >
      this.maxRadius
    ) {
      const scale =
        this.maxRadius /
        distance;

      dx *= scale;
      dy *= scale;
    }

    this.currentX = dx;
    this.currentY = dy;

    this.moveX =
      dx /
      this.maxRadius;

    this.moveY =
      -dy /
      this.maxRadius;

    this.joystickStick.style.transform =
      `translate(${dx}px, ${dy}px)`;
  }

  // ------------------------------------------------
  // RESET JOYSTICK
  // ------------------------------------------------

  resetJoystick() {
    this.joystickActive = false;

    this.pointerId = null;

    this.currentX = 0;
    this.currentY = 0;

    this.moveX = 0;
    this.moveY = 0;

    this.joystickStick.style.transform =
      "translate(0px, 0px)";
  }

  // ------------------------------------------------
  // KEYBOARD INPUT
  // ------------------------------------------------

  setupKeyboardControls() {
    window.addEventListener(
      "keydown",
      (event) => {
        this.setKey(
          event.code,
          true
        );
      }
    );

    window.addEventListener(
      "keyup",
      (event) => {
        this.setKey(
          event.code,
          false
        );
      }
    );
  }

  setKey(
    code,
    pressed
  ) {
    if (
      code === "KeyW" ||
      code === "ArrowUp"
    ) {
      this.keys.up = pressed;
    }

    if (
      code === "KeyS" ||
      code === "ArrowDown"
    ) {
      this.keys.down = pressed;
    }

    if (
      code === "KeyA" ||
      code === "ArrowLeft"
    ) {
      this.keys.left = pressed;
    }

    if (
      code === "KeyD" ||
      code === "ArrowRight"
    ) {
      this.keys.right = pressed;
    }

    // Desktop testing:
    // Hold Space = charge shot, release = fire
    // E = pass
    if (code === "Space") {
      if (
        pressed &&
        !this.shootHeld
      ) {
        this.actions.shootPressed = true;
      }

      if (
        !pressed &&
        this.shootHeld
      ) {
        this.actions.shootReleased = true;
      }

      this.shootHeld = pressed;
    }

    if (
      pressed &&
      code === "KeyE"
    ) {
      this.actions.pass = true;
    }
  }

  // ------------------------------------------------
  // GET MOVEMENT
  // ------------------------------------------------

  isShootHeld() {
    return this.shootHeld;
  }

  consumeShootPressed() {
    const active =
      this.actions.shootPressed;

    this.actions.shootPressed =
      false;

    return active;
  }

  consumeShootReleased() {
    const active =
      this.actions.shootReleased;

    this.actions.shootReleased =
      false;

    return active;
  }

  consumeAction(actionName) {
    if (
      !Object.prototype.hasOwnProperty.call(
        this.actions,
        actionName
      )
    ) {
      return false;
    }

    const active =
      this.actions[actionName];

    this.actions[actionName] =
      false;

    return active;
  }

  getMovement() {
    let x =
      this.moveX;

    let y =
      this.moveY;

    // Keyboard overrides / supplements
    // touch input for desktop testing.

    if (this.keys.left) {
      x -= 1;
    }

    if (this.keys.right) {
      x += 1;
    }

    if (this.keys.up) {
      y += 1;
    }

    if (this.keys.down) {
      y -= 1;
    }

    const magnitude =
      Math.sqrt(
        x * x +
        y * y
      );

    if (magnitude > 1) {
      x /= magnitude;
      y /= magnitude;
    }

    return {
      x,
      y,
      magnitude:
        Math.min(
          Math.sqrt(
            x * x +
            y * y
          ),
          1
        )
    };
  }
}