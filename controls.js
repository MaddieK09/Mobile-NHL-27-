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
    this.setupTouchControls();
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
  }

  // ------------------------------------------------
  // GET MOVEMENT
  // ------------------------------------------------

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