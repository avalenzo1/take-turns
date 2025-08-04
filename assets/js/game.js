// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
// @ (                     (                                      @
// @ )\ )              )   )\ )               )                 ) @
// @(()/(     ) (   ( /(  (()/(     ) (    ( /( (     (    ) ( /( @
// @ /(_)) ( /( )(  )\())  /(_)) ( /( )\ ) )\()))(   ))\( /( )\())@
// @(_))_  )(_)|()\((_)\  (_))_  )(_)|()/(((_)\(()\ /((_)(_)|(_)\ @
// @ |   \((_)_ ((_) |(_)  |   \((_)_ )(_)) |(_)((_|_))((_)_| |(_)@
// @ | |) / _` | '_| / /   | |) / _` | || | '_ \ '_/ -_) _` | / / @
// @ |___/\__,_|_| |_\_\   |___/\__,_|\_, |_.__/_| \___\__,_|_\_\ @
// @                                  |__/                        @
// @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

// Canvas dimensions
let CANVAS_WIDTH = 1920;
let CANVAS_HEIGHT = 1080;

// Handles Camera scale
const CAMERA_SCALE_DEFAULT = 4;
const CAMERA_SCALE_RUNNING = CAMERA_SCALE_DEFAULT * 1.02;
const CAMERA_SCALE_DIALOG = CAMERA_SCALE_DEFAULT * 1.5;

let sprites = {
  meta: {
    width: 180,
    height: 20,
  },

  sprites: {
    "@player/default": {
      meta: {
        x: 0,
        y: 0,
        width: 15,
        height: 51,
        borderWidth: 2,
        spacingWidth: 4,
      },

      animations: {
        down: [[0, 0]],

        up: [[1, 0]],

        right: [[3, 0]],

        left: [[2, 0]],

        down_right: [[4, 0]],

        down_left: [[5, 0]],

        up_left: [[6, 0]],

        up_right: [[7, 0]],
      },
    },
  },
};
let assets = [
  {
    type: "image",
    name: "ico_tap",
    src: "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnV0amN1MGtvYmlqOHVxZHJhdWJocjR6ejg5MzA5NnM0dGtrdDB2ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/Pw2IfovVMywepDwdXl/giphy.gif",
  },
  {
    type: "video",
    name: "vid_vhs",
    src: "https://cdn.glitch.global/b7704957-319e-4b4c-99ef-b74f9a275506/vhs-overlay.mp4?v=1699590338502",
  },
  {
    type: "image",
    name: "bg_day",
    src: "https://cdn.glitch.global/b7704957-319e-4b4c-99ef-b74f9a275506/1000_F_198906827_yU1VSLIgd8urPS2maDndePaxyab7OUCC.jpg?v=1720403176502",
  },
  {
    type: "image",
    name: "ico_flashlight",
    src: "https://cdn.glitch.global/b7704957-319e-4b4c-99ef-b74f9a275506/flashlight.png?v=1700098427029",
  },
  {
    type: "image",
    name: "ico_canteen",
    src: "https://cdn.glitch.global/b7704957-319e-4b4c-99ef-b74f9a275506/canteen.png?v=1700098188992",
  },
  {
    type: "image",
    name: "ico_wasd_w",
    src: "https://cdn.glitch.global/b7704957-319e-4b4c-99ef-b74f9a275506/wasd_w.png?v=1702866300784",
  },
  {
    type: "image",
    name: "ico_wasd_a",
    src: "https://cdn.glitch.global/b7704957-319e-4b4c-99ef-b74f9a275506/wasd_a.png?v=1702866304523",
  },
  {
    type: "image",
    name: "ico_wasd_s",
    src: "https://cdn.glitch.global/b7704957-319e-4b4c-99ef-b74f9a275506/wasd_s.png?v=1702868075630",
  },
  {
    type: "image",
    name: "ico_wasd_d",
    src: "https://cdn.glitch.global/b7704957-319e-4b4c-99ef-b74f9a275506/wasd_d.png?v=1702867981036",
  },
  {
    type: "image",
    name: "ico_shift",
    src: "https://cdn.glitch.global/b7704957-319e-4b4c-99ef-b74f9a275506/shift.png?v=1703389678973",
  },
  {
    type: "image",
    name: "ico_e",
    src: "https://cdn.glitch.global/b7704957-319e-4b4c-99ef-b74f9a275506/e.png?v=1702942191663",
  },
  {
    type: "image",
    name: "ico_enter",
    src: "https://cdn.glitch.global/b7704957-319e-4b4c-99ef-b74f9a275506/enter.png?v=1702867190934",
  },

  {
    type: "image",
    name: "spr_player",
    src: "https://cdn.glitch.global/b7704957-319e-4b4c-99ef-b74f9a275506/Sprite.png?v=1703225443198",
  },
  {
    type: "image",
    name: "img_logo",
    src: "https://cdn.glitch.global/b7704957-319e-4b4c-99ef-b74f9a275506/logo.png?v=1702700688078",
  },
  {
    type: "image",
    name: "bg_room",
    src: "https://cdn.glitch.global/b7704957-319e-4b4c-99ef-b74f9a275506/room.png?v=1703224499660",
  },
  {
    type: "image",
    name: "spr_bed",
    src: "https://cdn.glitch.global/b7704957-319e-4b4c-99ef-b74f9a275506/bed.png?v=1703095303277",
  },
  {
    type: "image",
    name: "spr_trash",
    src: "https://cdn.glitch.global/b7704957-319e-4b4c-99ef-b74f9a275506/trash.png?v=1703213248151",
  },
  {
    type: "image",
    name: "bg_hall",
    src: "https://cdn.glitch.global/b7704957-319e-4b4c-99ef-b74f9a275506/we_outside.png?v=1702700933827",
  },
  {
    type: "audio",
    name: "snd_roblox",
    src: "https://cdn.glitch.global/b7704957-319e-4b4c-99ef-b74f9a275506/do-not-open.mp3?v=1699148590752",
  },
  {
    type: "audio",
    name: "fx_keypress",
    src: "https://cdn.glitch.global/b7704957-319e-4b4c-99ef-b74f9a275506/spacebar-click-keyboard-199448.mp3?v=1720975865128",
  },
  {
    type: "audio",
    name: "fx_open_bag",
    src: "https://cdn.glitch.global/b7704957-319e-4b4c-99ef-b74f9a275506/inventory-open-94932.mp3?v=171047131513",
  },
  {
    type: "audio",
    name: "fx_fireworks",
    src: "https://cdn.glitch.me/b7704957-319e-4b4c-99ef-b74f9a275506/cs.wav?v=1721094021634",
  },
  {
    type: "audio",
    name: "fx_notification",
    src: "https://cdn.glitch.global/b7704957-319e-4b4c-99ef-b74f9a275506/notification.mp3?v=1702858308954",
  },
  {
    type: "audio",
    name: "fx_door",
    src: "https://bigsoundbank.com/UPLOAD/mp3/1703.mp3?v=d",
  },
  {
    type: "audio",
    name: "fx_balcony_door",
    src: "https://cdn.glitch.global/b7704957-319e-4b4c-99ef-b74f9a275506/sliding-door-opening-and-closing-6467.mp3?v=1703121323433",
  },
  {
    type: "audio",
    name: "fx_light",
    src: "https://cdn.glitch.global/b7704957-319e-4b4c-99ef-b74f9a275506/light-switch-81967.mp3?v=1702587318597",
  },
  {
    type: "audio",
    name: "snd_toreador",
    src: "https://cdn.glitch.global/b7704957-319e-4b4c-99ef-b74f9a275506/toreador.mp3?v=102522101648",
  },
  {
    type: "audio",
    name: "snd_untitled",
    src: "https://www.freesoundslibrary.com/wp-content/uploads/2022/04/erie-or-scary-ambient-atmosphere.mp3",
  },
  {
    type: "audio",
    name: "snd_ambiance",
    src: "https://cdn.glitch.global/b7704957-319e-4b4c-99ef-b74f9a275506/apartment_ambiance.mp3?v=1702596205632",
  },
  {
    type: "audio",
    name: "snd_better_days",
    src: "https://cdn.glitch.global/b7704957-319e-4b4c-99ef-b74f9a275506/washed-out.mp3?v=1702869020370",
  },
];

const app = new Application(CANVAS_WIDTH, CANVAS_HEIGHT);

const canvas = app.view;
const ctx = app.ctx;

// Handles game assets
const manifest = new Manifest(assets);

// Will be used to store global in-game variables
const $global = {
  debug: false,
  temp: {},
  dialog: {
    active: false,
    target: undefined,
  },
  tutorial: {
    finished: false,
    wasd: {
      w: true,
      a: true,
      s: true,
      d: true,
    },
    e: true,
    shift: true,
  },
  stage: {
    room: {
      locked: true,
    },
  },
};

const container = document.getElementById("app");
container.appendChild(canvas);

// TODO: Fix bug where firefox does not recognize the below code
document.defaultView.manifest = manifest;
document.defaultView.canvas = canvas;

class Dialog extends EventTarget {
  constructor(dialog) {
    super();

    this.dialog = dialog;

    // Audio
    this.sound = manifest.assets.fx_keypress;
    this.start = 0.05;
    this.sound.playbackRate = 2;

    // Line
    this.line = 0;
    this.char = 0;
    this.speed = 30;
    this.current = "";

    // Event Listener
    this.intervalId = undefined;
  }

  handleInterval() {
    if (this.dialog[this.line][this.char] !== undefined) {
      this.char++;

      this.sound.currentTime = this.start;
      this.sound.play();
    }

    this.current = this.dialog[this.line].slice(0, this.char);
  }

  onKeyDown(e) {
    console.log(e.key);

    switch (e.key) {
      case "Backspace":
        this.prev();
        break;
      case "Enter":
      case " ":
        this.next();
        break;
    }
  }

  onClick(e) {
    this.next();
  }

  prev() {
    if (this.dialog[this.line - 1]) {
      this.line--;
    }

    this.char = 0;
  }

  next() {
    if (this.dialog[this.line + 1]) {
      this.line++;
    } else {
      this.dispatchEvent(new CustomEvent("ended"));
    }

    this.char = 0;
  }

  init() {
    this.line = 0;
    this.char = 0;

    // Create Event Listener
    this.boundOnKeyDown = this.onKeyDown.bind(this);
    this.boundOnClick = this.onClick.bind(this);

    canvas.addEventListener("keydown", this.boundOnKeyDown);
    canvas.addEventListener("click", this.boundOnClick);

    // Create Interval
    this.intervalId = setInterval(
      this.handleInterval.bind(this),
      1000 / this.speed
    );
  }

  destroy() {
    canvas.removeEventListener("keydown", this.boundOnKeyDown);
    canvas.removeEventListener("click", this.boundOnClick);

    clearInterval(this.intervalId);
  }
}

class DialogBox extends UIObject {
  constructor(dialog, ctx) {
    super();

    this.dialog = dialog;

    // Audio
    this.sound = manifest.assets.fx_keypress;
    this.start = 0.05;
    this.sound.playbackRate = 2;

    // Line
    this.line = 0;
    this.char = 0;
    this.speed = 30;
    this.current = "";

    // Event Listener
    this.intervalId = undefined;

    // Bind methods
    this.boundOnKeyDown = this.onKeyDown.bind(this);
    this.boundOnClick = this.onClick.bind(this);
    this.handleInterval = this.handleInterval.bind(this);
  }

  handleInterval() {
    if (this.dialog[this.line][this.char] !== undefined) {
      this.char++;

      this.sound.currentTime = this.start;
      this.sound.play();
    }

    this.current = this.dialog[this.line].slice(0, this.char);
  }

  onKeyDown(e) {
    switch (e.key) {
      case "Backspace":
        this.prev();
        break;
      case "Enter":
      case " ":
        this.next();
        break;
    }
  }

  onClick(e) {
    this.next();
  }

  prev() {
    if (this.dialog[this.line - 1]) {
      this.line--;
    }

    this.char = 0;
  }

  next() {
    if (this.dialog[this.line + 1]) {
      this.line++;
    } else {
      this.dispatchEvent(new CustomEvent("ended"));
    }

    this.char = 0;
  }

  init() {
    this.line = 0;
    this.char = 0;

    // Create Event Listener
    canvas.addEventListener("keydown", this.boundOnKeyDown);
    canvas.addEventListener("click", this.boundOnClick);

    // Create Interval
    this.intervalId = setInterval(this.handleInterval, 1000 / this.speed);
  }

  render() {
    ctx.fillStyle = "rgba(55,55,55,0.5)";
    ctx.strokeStyle = "rgba(55,55,55,0.5)";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.roundRect(
      CANVAS_WIDTH * (1 / 4),
      CANVAS_HEIGHT * (5 / 8),
      CANVAS_WIDTH * (1 / 2),
      CANVAS_HEIGHT * (1 / 8),
      [5]
    );
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.font = "28px monospace";
    ctx.textAlign = "center";
    ctx.fillText(
      this.current,
      CANVAS_WIDTH * (1 / 2),
      CANVAS_HEIGHT * (5.5 / 8)
    );
  }

  destroy() {
    canvas.removeEventListener("keydown", this.boundOnKeyDown);
    canvas.removeEventListener("click", this.boundOnClick);

    clearInterval(this.intervalId);
  }
}

class Item {
  constructor(name, icon) {
    this.name = name;
    this.icon = icon;
  }
}

class Inventory {
  constructor() {
    // Inventory
    this.maxCapacity = 20;

    this.grid = [];

    // Number of columns and rows
    this.rows = 4;
    this.cols = 2;

    // Row and column
    this.row = 0;
    this.col = 0;

    for (let row = 0; row < this.rows; row++) {
      this.grid.push([]);

      for (let col = 0; col < this.cols; col++) {
        this.grid[row][col] = null;
      }
    }

    // UI
    this.hidden = true;
    this.gridLength = 100;

    this.clientX = 0;
    this.clientY = 0;

    this.offsetX = CANVAS_WIDTH / 2 - (this.size * this.columns) / 2;
    this.offsetY = CANVAS_HEIGHT / 2 - (this.size * this.rows) / 2;

    canvas.addEventListener("keydown", this.handleKeyPress.bind(this));
    canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
  }

  get limit() {
    return this.rows * this.cols;
  }

  handleKeyPress(e) {
    switch (e.key) {
      case "ArrowUp":
      case "W":
      case "w":
        if (this.col - 1 > -1 && !this.hidden) this.col--;
        break;
      case "ArrowDown":
      case "S":
      case "s":
        if (this.col + 1 < this.cols && !this.hidden) this.col++;
        break;
      case "ArrowLeft":
      case "A":
      case "a":
        if (this.row - 1 > -1 && !this.hidden) this.row--;
        break;
      case "ArrowRight":
      case "D":
      case "d":
        if (this.row + 1 < this.rows && !this.hidden) this.row++;
        break;
      case "Escape":
        this.hidden = true;
        break;
      case "E":
      case "e":
        $global.tutorial.e = false;
        manifest.assets.fx_open_bag.currentTime = 0;
        manifest.assets.fx_open_bag.play();
        this.hidden = !this.hidden;
        break;
    }
  }

  isOverlapping(x, y) {
    return !(
      this.clientX < x ||
      this.clientX > x + this.size ||
      this.clientY > y + this.size ||
      this.clientY < y
    );
  }

  handleMouseMove(e) {
    let boundingRect = canvas.getBoundingClientRect();

    this.clientX = e.touches ? e.touches[0].clientX : e.clientX;
    this.clientY = e.touches ? e.touches[0].clientY : e.clientY;
  }

  render() {
    if (this.hidden) return;

    ctx.save();

    ctx.fillStyle = "#000c";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.textAlign = "left";

    ctx.translate(
      CANVAS_WIDTH / 2 - (this.rows * this.gridLength) / 2,
      CANVAS_HEIGHT / 2 - (this.cols * this.gridLength) / 2
    );

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const pos = new Vector2(row * this.gridLength, col * this.gridLength);
        const item = this.grid[row][col];
        const active = row == this.row && col == this.col;

        ctx.save();

        if (active) ctx.globalCompositeOperation = "source-over";

        ctx.strokeStyle = ctx.shadowColor = active ? "red" : "gray";
        ctx.lineWidth = 2;

        ctx.shadowBlur = 5;
        ctx.fillStyle = "#000c";

        ctx.beginPath();
        ctx.roundRect(pos.x, pos.y, this.gridLength, this.gridLength, [4]);
        ctx.fill();
        ctx.stroke();

        ctx.restore();

        if (item instanceof Item) {
          ctx.drawImage(
            item.icon,
            pos.x,
            pos.y,
            this.gridLength,
            this.gridLength
          );
        }
      }
    }

    ctx.restore();
  }
}

class Player extends GameObject {
  constructor(x, y) {
    super(x, y, 15, 51);

    this.mass = 62;
    this.µ = 0.00001;
    this.hp = 20;

    this.bounds.y = 46;
    this.bounds.h = 5;

    this.running = false;
    this.locked = true; // Handles whether player can move

    // Sprite data
    this.sprite = new Sprite(sprites, "@player/default");
    this.inventory = new Inventory();

    // TODO: Clean mess here so that class Sprite has needed functions
    this.validAnimations = [
      "up",
      "up_right",
      "right",
      "down_right",
      "down",
      "down_left",
      "left",
      "up_left",
    ];
    this.currentAnimation = "up";
    this.currentFrame = 0;
    this.position = this.sprite.getCurrentFrame(
      this.currentAnimation,
      this.currentFrame
    );
    this.intervalId = setInterval(() => {
      // if (!this.controls.up && !this.controls.down && !this.controls.left && !this.controls.right) return;
      this.currentFrame++;
      this.position = this.sprite.getCurrentFrame(
        this.currentAnimation,
        this.currentFrame
      );
    }, 100);

    // Controls
    this.controls = { up: false, down: false, left: false, right: false };
    this.inventory = new Inventory();

    canvas.addEventListener("keydown", this.handleKeyDown.bind(this));
    canvas.addEventListener("keyup", this.handleKeyUp.bind(this));

    this.extendRender(() => {
      if (this.locked) ctx.globalAlpha = 0.25;

      ctx.imageSmoothingEnabled = false;

      ctx.drawImage(
        manifest.assets.spr_player,
        this.position.x,
        this.position.y,
        this.position.width,
        this.position.height,
        0,
        0,
        this.position.width,
        this.position.height
      );
    });

    if (!$global.tutorial.finished) {
      this.extendRender(() => {
        if ($global.dialog.target instanceof DialogBox) {
          ctx.drawImage(
            manifest.assets.ico_enter,
            this.center.x - manifest.assets.ico_enter.width / 4,
            this.center.y - manifest.assets.ico_enter.height / 4,
            manifest.assets.ico_enter.width / 2,
            manifest.assets.ico_enter.height / 2
          );
          
          ctx.font = "4px monospace"
          ctx.fillStyle="#fff"
          ctx.textAlign = "center"
          ctx.fillText("Press Enter to interact.",12,-5);
        } else if (
          $global.tutorial.wasd.w == true ||
          $global.tutorial.wasd.a == true ||
          $global.tutorial.wasd.s == true ||
          $global.tutorial.wasd.d == true
        ) {
          if ($global.tutorial.wasd.w) {
            ctx.drawImage(
              manifest.assets.ico_wasd_w,
              this.center.x - manifest.assets.ico_wasd_w.width / 4,
              this.center.y - manifest.assets.ico_wasd_w.height / 4,
              manifest.assets.ico_wasd_w.width / 2,
              manifest.assets.ico_wasd_w.height / 2
            );
          }

          if ($global.tutorial.wasd.a) {
            ctx.drawImage(
              manifest.assets.ico_wasd_a,
              this.center.x - manifest.assets.ico_wasd_a.width / 4,
              this.center.y - manifest.assets.ico_wasd_a.height / 4,
              manifest.assets.ico_wasd_a.width / 2,
              manifest.assets.ico_wasd_a.height / 2
            );
          }

          if ($global.tutorial.wasd.s) {
            ctx.drawImage(
              manifest.assets.ico_wasd_s,
              this.center.x - manifest.assets.ico_wasd_s.width / 4,
              this.center.y - manifest.assets.ico_wasd_s.height / 4,
              manifest.assets.ico_wasd_s.width / 2,
              manifest.assets.ico_wasd_s.height / 2
            );
          }

          if ($global.tutorial.wasd.d) {
            ctx.drawImage(
              manifest.assets.ico_wasd_d,
              this.center.x - manifest.assets.ico_wasd_d.width / 4,
              this.center.y - manifest.assets.ico_wasd_d.height / 4,
              manifest.assets.ico_wasd_d.width / 2,
              manifest.assets.ico_wasd_d.height / 2
            );
          }
        } else if ($global.tutorial.shift) {
          ctx.drawImage(
            manifest.assets.ico_shift,
            this.center.x - manifest.assets.ico_shift.width / 4,
            this.center.y - manifest.assets.ico_shift.height / 4,
            manifest.assets.ico_shift.width / 2,
            manifest.assets.ico_shift.height / 2
          );
        } else if ($global.tutorial.e) {
          ctx.drawImage(
            manifest.assets.ico_e,
            this.center.x - manifest.assets.ico_e.width / 4,
            this.center.y - manifest.assets.ico_e.height / 4,
            manifest.assets.ico_e.width / 2,
            manifest.assets.ico_e.height / 2
          );
        } else {
          // Todo remove this:
          // $global.tutorial.finished = true;
        }
      });
    }
  }

  step() {
    super.step();

    if (!this.inventory.hidden || this.locked) return;

    this.acc.x = 0;
    this.acc.y = 0;

    // if (this.radians < 0) {
    //   radians += 2 * Math.PI;
    // }

    if (this.controls.up) {
      this.acc.y = -10 * this.mass * (this.running ? 1.5 : 1);
    }
    if (this.controls.down) {
      this.acc.y = 10 * this.mass * (this.running ? 1.5 : 1);
    }
    if (this.controls.left) {
      this.acc.x = -10 * this.mass * (this.running ? 1.5 : 1);
    }
    if (this.controls.right) {
      this.acc.x = 10 * this.mass * (this.running ? 1.5 : 1);
    }
  }

  handleKeyDown(e) {
    this.handleKeyEvent(e, true);
  }

  handleKeyUp(e) {
    this.handleKeyEvent(e, false);
  }

  handleKeyEvent(e, bool) {
    if (!this.inventory.hidden || this.locked) return;

    switch (e.key) {
      case "ArrowUp":
      case "W":
      case "w":
        this.controls.up = bool;
        $global.tutorial.wasd.w = false;

        break;
      case "ArrowDown":
      case "S":
      case "s":
        this.controls.down = bool;
        $global.tutorial.wasd.s = false;

        break;
      case "ArrowLeft":
      case "A":
      case "a":
        this.controls.left = bool;
        $global.tutorial.wasd.a = false;

        break;
      case "ArrowRight":
      case "D":
      case "d":
        this.controls.right = bool;
        $global.tutorial.wasd.d = false;

        break;
      case "Shift":
        this.running = bool;
        $global.tutorial.shift = false;

        if (this.running) this.dispatchEvent(new CustomEvent("run"));
        else this.dispatchEvent(new CustomEvent("walk"));
        break;
    }

    const currentKeys = [];

    if (this.controls.up) currentKeys.push("up");
    if (this.controls.down) currentKeys.push("down");
    if (this.controls.left) currentKeys.push("left");
    if (this.controls.right) currentKeys.push("right");

    const newAnimation = currentKeys.join("_");

    if (this.validAnimations.includes(newAnimation))
      this.currentAnimation = newAnimation;
  }
}

class Joystick extends UIObject {
  constructor(player) {
    super(0, 0);

    this.player = player;
    this.radius = CANVAS_HEIGHT / 4;
    this.margin = 10;

    this.pos = new Vector2(
      CANVAS_WIDTH - this.radius * 2 + this.margin,
      this.radius * 3 - this.margin
    );

    this.currPos = new Vector2();

    canvas.addEventListener("touchstart", (e) => {
      this.currPos = new Vector2(
        e.touches[0].clientX - this.pos.x,
        e.touches[0].clientY - this.pos.y
      );

      this.handlePlayerPos();
    });

    canvas.addEventListener("touchmove", (e) => {
      this.currPos = new Vector2(
        e.touches[0].clientX - this.pos.x,
        e.touches[0].clientY - this.pos.y
      );

      this.handlePlayerPos();
    });

    canvas.addEventListener("touchend", (e) => {
      this.currPos = new Vector2(0, 0);

      this.player.handleKeyUp({ key: "d" });
      this.player.handleKeyUp({ key: "a" });
      this.player.handleKeyUp({ key: "s" });
      this.player.handleKeyUp({ key: "w" });
      this.player.handleKeyUp({ key: "Shift" });
    });

    this.extendRender(() => {
      ctx.globalCompositeOperation = "difference";
      ctx.fillStyle = "white";
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.setLineDash([5, 2]);
      ctx.moveTo(0, 0);
      ctx.lineTo(this.currPos.x, this.currPos.y);
      ctx.stroke();

      ctx.translate(this.currPos.x, this.currPos.y);
      ctx.beginPath();
      ctx.arc(0, 0, (this.radius * 1) / 3, 0, 2 * Math.PI);
      ctx.fill();

      ctx.globalCompositeOperation = "source-over";
    });
  }

  handlePlayerPos() {
    this.player.handleKeyUp({ key: "d" });
    this.player.handleKeyUp({ key: "a" });
    this.player.handleKeyUp({ key: "s" });
    this.player.handleKeyUp({ key: "w" });
    this.player.handleKeyUp({ key: "Shift" });

    // this.knobRotation = Math.atan(this.currPos.y, this.currPos.x);

    console.log(this.knobRotation);

    if (Math.abs(this.currPos.x) > 80 || Math.abs(this.currPos.y) > 80)
      this.player.handleKeyDown({ key: "Shift" });

    if (this.currPos.x > 25) {
      this.player.handleKeyDown({ key: "d" });
    } else if (this.currPos.x < -25) {
      this.player.handleKeyDown({ key: "a" });
    }

    if (this.currPos.y > 25) {
      this.player.handleKeyDown({ key: "s" });
    } else if (this.currPos.y < -25) {
      this.player.handleKeyDown({ key: "w" });
    }
  }
}

async function loadStage(src) {
  let res = await fetch(src);
  let js = await res.text();

  return { mount, unmount, render };
}

// https://stackoverflow.com/a/4819886
function isTouchDevice() {
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
}

function adjustGain(audioElement, targetVolume, duration = 2000) {
  const initialVolume = audioElement.volume;
  const volumeChangePerMs = (targetVolume - initialVolume) / duration;

  let startTime;

  function updateVolume(currentTime) {
    if (!startTime) {
      startTime = currentTime;
    }

    const elapsed = currentTime - startTime;
    const newVolume = initialVolume + volumeChangePerMs * elapsed;

    if (elapsed < duration) {
      audioElement.volume = newVolume;
      requestAnimationFrame(updateVolume);
    } else {
      audioElement.volume = targetVolume;
    }
  }

  requestAnimationFrame(updateVolume);
}

function createDebugRect(object) {
  let baseColor = [255, 0, 0];

  if (object instanceof InteractiveObject) baseColor = [0, 255, 255];

  function renderDebug() {
    if ($global.debug) {
      ctx.fillStyle = `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, 0.1)`;
      ctx.fillRect(
        object.bounds.x,
        object.bounds.y,
        object.bounds.w,
        object.bounds.h
      );

      ctx.lineWidth = 0.1;
      ctx.strokeStyle = `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, 1)`;

      ctx.strokeRect(
        object.bounds.x,
        object.bounds.y,
        object.bounds.w,
        object.bounds.h
      );

      ctx.fillStyle = "#fff2";
      ctx.font = "4px monospace";
      ctx.fillMultiLineText(
        `UUID: ${object.uuid}\npos: ${JSON.stringify(
          object.pos
        )}\nbounds: ${JSON.stringify(object.bounds)}\n`,
        0,
        0
      );
    }
  }

  object.extendRender(renderDebug, "debug");
}

function createDialog(world, camera, object, dialog) {
  const dialogBox = new DialogBox(); // This handles navigating dialog
  const player = camera.focus;

  dialogBox.zIndex = 999;

  function openDialog() {
    if (dialog === undefined) return;

    $global.dialog.active = true;

    player.locked = true;

    world.addObject(dialogBox);

    dialogBox.dialog = dialog();

    dialogBox.init();

    camera.setScale(CAMERA_SCALE_DIALOG);
    camera.focusOn(object);
  }

  function closeDialog() {
    $global.dialog.active = false;
    $global.dialog.target = undefined;

    player.locked = false;

    dialogBox.destroy();

    world.removeObject(dialogBox);

    camera.setScale(CAMERA_SCALE_DEFAULT);
    camera.focusOn(player);
  }

  document.addEventListener("keyup", (e) => {
    if (e.key === "o") {
      $global.stage.room.locked = false;
    }

    if (
      e.key === "Enter" &&
      $global.dialog.target === dialogBox &&
      !$global.dialog.active
    ) {
      openDialog();
    }
  });

  object.addEventListener("enter", () => {
    if ($global.dialog.target instanceof DialogBox || $global.dialog.active)
      return;

    console.log("OPEN YA EARS! YALL ABOUT TO HEAR SOME");

    manifest.assets.fx_notification.currentTime = 0;
    manifest.assets.fx_notification.play();

    $global.dialog.target = dialogBox;

    console.log(dialogBox);
  });

  object.addEventListener("leave", () => {
    if ($global.dialog.target !== dialogBox) return;

    if (!$global.dialog.active) {
      $global.dialog.target = undefined;

      return;
    }

    console.log("CLOSE YA EARS! YALL JUST HEARD SOME");

    closeDialog();
  });

  dialogBox.addEventListener("ended", () => {
    if ($global.dialog.target !== dialogBox || !$global.dialog.active) return;

    console.log("CLOSE YA EARS! YALL JUST HEARD SOME");

    closeDialog();
  });
}

async function main() {
  document.addEventListener("keydown", function (e) {
    switch (e.key) {
      case "F9":
        $global.debug = !$global.debug;
        break;
    }
  });

  // Initialize global objects
  const world = app.world;
  const camera = app.camera;

  const player = new Player(118, 112);

  world.addEventListener("newObject", function (e) {
    createDebugRect(e.detail.object);
  });

  camera.setCenterCoordinates(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
  camera.setScale(CAMERA_SCALE_DEFAULT);
  camera.focus = player;

  player.zIndex = 99;

  player.addEventListener("run", () => {
    camera.setScale(CAMERA_SCALE_RUNNING);
  });

  player.addEventListener("walk", () => {
    camera.setScale(CAMERA_SCALE_DEFAULT);
  });

  const joystick = new Joystick(player);

  if (isTouchDevice()) {
    world.addObject(joystick);
  }

  // Stages
  const loaderStage = (function () {
    function mount() {}

    function unmount() {}

    function render() {
      if (manifest.ready && navigator.userActivation.hasBeenActive) {
        nextStage = loreStage;
      }

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.font = "24px monospace";

      ctx.save();

      ctx.textAlign = "center";

      if (manifest.error) {
        ctx.fillStyle = "rgb(252, 3, 57)";

        ctx.fillText(
          "An error occurred while loading assets.",
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT / 2
        );
      } else if (!manifest.ready) {
        ctx.fillStyle = "#555555";

        ctx.fillText(
          "Game is loading assets...",
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT / 2
        );
      } else if (!navigator.userActivation.hasBeenActive) {
        ctx.fillStyle = "#879ac7";

        ctx.drawImage(
          manifest.assets.ico_tap,
          CANVAS_WIDTH / 2 - 25,
          CANVAS_HEIGHT / 2 - 100,
          50,
          50
        );
        ctx.fillText(
          "Interaction with screen is needed.",
          CANVAS_WIDTH / 2,
          CANVAS_HEIGHT / 2
        );
      }

      ctx.restore();

      ctx.save();

      ctx.translate(0, CANVAS_HEIGHT - 20);

      ctx.fillStyle = manifest.error ? "rgb(252, 3, 57)" : "#bbb";
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;

      const barWidth = CANVAS_WIDTH / manifest.total;

      for (let i = 0; i < manifest.loaded; i++) {
        ctx.fillRect(barWidth * i, 0, barWidth, 20);
        ctx.strokeRect(barWidth * i, 0, barWidth, 20);
      }

      ctx.restore();
    }

    return { mount, unmount, render };
  })();

  const loreStage = (function () {
    const loreInitial = [
      "Use [Backspace] and [Enter] keys to progress",
      "You woke up.",
      "It's pitch black in your room.",
      "You check the time on your phone...",
      `"July 4, ${new Date().getFullYear() + 1} 9:06 AM"`,
      "You try to turn on the lights. It doesn't work.",
      "Bewildered, you see outside.",
      "\n",
      "The sun is gone.",
      "\n",
    ];
    const storyDialog = new Dialog(loreInitial);

    function mount() {
      storyDialog.init();
    }

    function unmount() {
      storyDialog.destroy();
    }

    async function render() {
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.fillStyle = "#bbb";
      ctx.font = "bold 24px monospace";

      ctx.save();

      ctx.textAlign = "center";

      if (storyDialog.line == 7) {
        manifest.assets.fx_balcony_door.play();
        manifest.assets.fx_balcony_door.loop = true;
      } else {
        manifest.assets.fx_balcony_door.currentTime = 0;
        manifest.assets.fx_balcony_door.pause();
      }

      if (storyDialog.line == 9) {
        nextStage = roomStage;
      }

      ctx.fillMultiLineText(
        storyDialog.current,
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT / 2
      );

      ctx.restore();
    }

    return { mount, unmount, render };
  })();

  const roomStage = (function () {
    // Collision Objects
    const collisionObjects = [
      // Wall
      new StaticBoundObject(0, 0, 338, 114),
      new StaticBoundObject(0, 225, 225, 26),
      new StaticBoundObject(260, 225, 78, 26),
      new StaticBoundObject(312, 191, 26, 34),
      new StaticBoundObject(156, 114, 16, 37),
      new StaticBoundObject(156, 187, 16, 38),
      new StaticBoundObject(312, 114, 26, 41),
      // Cabinet
      new StaticBoundObject(4, 114, 68, 16),
      // Kitchen
      new StaticBoundObject(176, 114, 135, 19),
      new StaticBoundObject(291, 133, 20, 19),
    ];

    // Interactive Objects
    const doorDialog = new InteractiveObject(106, 45, 34, 77);
    const lightDialog = new InteractiveObject(89, 38, 8, 80);
    const cabinetDialog = new InteractiveObject(4, 76, 68, 60);

    const fridgeDialog = new InteractiveObject(176, 88, 37, 50);

    const faucetDialog = new InteractiveObject(254, 88, 34, 50);

    const balcony = new InteractiveObject(227, 237, 34, 13);

    // Image Objects
    const room = new GameObject(0, 0, 0, 0);

    room.extendRender(() => {
      ctx.drawImage(
        manifest.assets.bg_room,
        0,
        0,
        manifest.assets.bg_room.width,
        manifest.assets.bg_room.height
      );
    });

    const trash = new GameObject(132, 216, 14, 5);

    trash.zIndex = 100;

    trash.extendRender(() => {
      ctx.translate(-4, -21);
      ctx.drawImage(
        manifest.assets.spr_trash,
        0,
        0,
        manifest.assets.spr_trash.width,
        manifest.assets.spr_trash.height
      );
    });

    const bed = new GameObject(8, 151, 62, 72);

    bed.zIndex = 100;

    bed.extendRender(() => {
      ctx.translate(0, -10);
      ctx.drawImage(
        manifest.assets.spr_bed,
        0,
        0,
        manifest.assets.spr_bed.width,
        manifest.assets.spr_bed.height
      );
    });

    lightDialog.addEventListener("keydown", function (e) {
      if (e.detail.key !== "Enter") return;

      manifest.assets.fx_light.currentTime = 0;
      manifest.assets.fx_light.play();
    });

    createDialog(world, camera, lightDialog, () => {
      return ["", "The light doesn't work."];
    });

    createDialog(world, camera, doorDialog, () => {
      if ($global.stage.room.locked) {
        return [
          "You're cooked buddy",
          "you dont have the resources",
          "you dont got a flashlight",
          "you dont got a weapon",
          "no phone",
          "no money",
        ];
      } else {
        return ["It opened."]
      }
    });
    
    let fridgeCount = 0;

    createDialog(world, camera, fridgeDialog, () => {
      if (
        player.inventory.grid[0][0] &&
        player.inventory.grid[0][0].name === "Flashlight"
      ) {
        if (fridgeCount == 0) {
          fridgeCount += 1;
          return [
          "There's some fried rice and expired milk.",
          "You consider your life choices...",
          "and maybe ordering more takeout.",
          ];
          
        } else if (fridgeCount == 1) {
          fridgeCount += 1;
          return [
          "You reluctantly open the fridge again",
          "And shut it fast."
          ];
        }
        
        return ["..."];
        
      } else {
        return ["It's too dark to see."];
      }
    });

    createDialog(world, camera, faucetDialog, () => {
      return ["The water is very cold"];
    });

    createDialog(world, camera, cabinetDialog, () => {
      if (
        player.inventory.grid[0][0] &&
        player.inventory.grid[0][0].name === "Flashlight"
      ) {
        return ["There's some worn out shirts and lint."];
      } else {
        player.inventory.grid[0][0] = new Item(
          "Flashlight",
          manifest.assets.ico_flashlight
        );
        
        return ["It's a flashlight!"];
      }
    });

    // Bug where this activates when inactive.
    doorDialog.addEventListener("keydown", function (e) {
      console.log("hello?");

      if (!$global.stage.room.locked && e.detail.key == "Enter") {
        nextStage = apartmentStage;
      }
    });

    const dark = ctx.createRadialGradient(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      400,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      10
    );

    // Add three color stops
    dark.addColorStop(0, "#000");
    dark.addColorStop(1, "#0002");

    const flashlight = ctx.createRadialGradient(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      500,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      10
    );

    // Add three color stops
    flashlight.addColorStop(0, "#000c");
    flashlight.addColorStop(1, "transparent");

    function mount() {
      manifest.assets.snd_untitled.play();
      manifest.assets.snd_untitled.loop = true;
      manifest.assets.snd_untitled.volume = 0;

      adjustGain(manifest.assets.snd_untitled, 1);

      player.x = 118;
      player.y = 142;
      player.locked = false;

      world.bounds.w = 338;
      world.bounds.h = 250;

      // Collision Objects
      for (const object in collisionObjects) {
        world.addObject(collisionObjects[object]);
      }
      // world.addObject(bedCollision);

      // Interactive Objects
      world.addObject(doorDialog);
      world.addObject(lightDialog);
      world.addObject(cabinetDialog);
      world.addObject(fridgeDialog);
      world.addObject(faucetDialog);

      // Tile Objects
      world.addObject(room);
      world.addObject(bed);
      world.addObject(player);
      world.addObject(trash);
    }

    function unmount() {
      adjustGain(manifest.assets.snd_untitled, 0);

      world.clearObjects();
    }

    function render() {
      world.physics.step();

      ctx.save();

      ctx.imageSmoothingEnabled = false;

      // Background
      ctx.fillStyle = "#111";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // World
      world.render(ctx, camera);

      // Gradient
      ctx.save();

      ctx.fillStyle =
        player.inventory.grid[0][0] instanceof Item &&
        player.inventory.row == 0 &&
        player.inventory.col == 0
          ? flashlight
          : dark;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.restore();

      ctx.restore();

      player.inventory.render();
    }

    return { render, unmount, mount };
  })();

  const apartmentStage = (function () {
    const hall = new GameObject(0, 0, 0, 0);
    const wall = new GameObject(0, 0, 500, 72);
    const door = new StaticBoundObject(108, 124, 34, 50);
    const cutscene = new InteractiveObject(475, 100, 50, 50);
    const darkness = new UIObject(0, 0);

    hall.extendRender(() => {
      ctx.globalAlpha = 1;
      ctx.drawImage(
        manifest.assets.bg_hall,
        0,
        0,
        manifest.assets.bg_hall.width,
        manifest.assets.bg_hall.height
      );
    });

    darkness.extendRender(() => {
      ctx.fillStyle = `rgba(0,0,0, ${1 - (cutscene.x - camera.focus.x) / 500})`;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    });

    door.addEventListener("collision", function () {
      nextStage = roomStage;
    });

    cutscene.addEventListener("collision", function () {
      nextStage = apartmentCutsceneStage;
    });

    function mount() {
      manifest.assets.snd_ambiance.volume = 0;
      manifest.assets.snd_ambiance.loop = true;
      manifest.assets.snd_ambiance.play();

      adjustGain(manifest.assets.snd_ambiance, 1);

      world.bounds.w = 1000;
      world.bounds.h = 124;

      player.x = 118;
      player.y = 50;
      player.locked = false;

      world.addObject(player);
      world.addObject(hall);
      world.addObject(wall);
      world.addObject(door);
      world.addObject(cutscene);
      world.addObject(darkness);
    }

    function unmount() {
      adjustGain(manifest.assets.snd_ambiance, 0);

      world.clearObjects();
    }

    function render() {
      world.physics.step();

      ctx.save();

      ctx.imageSmoothingEnabled = false;

      // Background
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // World
      world.render(ctx, camera);

      ctx.restore();

      player.inventory.render();
    }

    return { mount, unmount, render };
  })();

  const apartmentCutsceneStage = (function () {
    function mount() {
      // Don't play music you don't know the meaning of.
      // It opens your spirit and it's not safe!!!
      // setTimeout(() => {
      //   manifest.assets.snd_better_days.play();
      // }, 3000);
      // manifest.assets.snd_better_days.onended = () => { window.location.reload(); };

      setTimeout(() => {
        nextStage = outsideStage;
      }, 3000);
    }

    function unmount() {
      world.clearObjects();
    }

    function render() {
      ctx.save();
      // Background
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Logo
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        manifest.assets.img_logo,
        CANVAS_WIDTH / 2 -
          (manifest.assets.img_logo.width * CAMERA_SCALE_DEFAULT) / 2,
        CANVAS_HEIGHT / 2 -
          (manifest.assets.img_logo.height * CAMERA_SCALE_DEFAULT) / 2,
        manifest.assets.img_logo.width * CAMERA_SCALE_DEFAULT,
        manifest.assets.img_logo.height * CAMERA_SCALE_DEFAULT
      );

      ctx.restore();
    }

    return { mount, unmount, render };
  })();

  const outsideStage = (function () {
    const hall = new GameObject(0, 0, 0, 0);

    hall.extendRender(() => {
      ctx.globalAlpha = 1;
      ctx.drawImage(
        manifest.assets.bg_day,
        0,
        0,
        manifest.assets.bg_day.width,
        manifest.assets.bg_day.height
      );
    });

    function mount() {
      manifest.assets.snd_ambiance.volume = 0;
      manifest.assets.snd_ambiance.loop = true;
      manifest.assets.snd_ambiance.play();

      adjustGain(manifest.assets.snd_ambiance, 1);

      // manifest.assets.fx_fireworks.loop = true;
      // manifest.assets.fx_fireworks.play();

      world.bounds.w = 1000;
      world.bounds.h = 1000;

      player.x = 516;
      player.y = 407;
      player.locked = false;

      world.addObject(player);
      world.addObject(hall);
    }

    function unmount() {
      adjustGain(manifest.assets.snd_ambiance, 0);

      world.clearObjects();
    }

    function render() {
      world.physics.step();

      ctx.save();

      ctx.imageSmoothingEnabled = false;

      // Background
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // World
      world.render(ctx, camera);

      ctx.restore();

      player.inventory.render();
    }

    return { mount, unmount, render };
  })();

  let prevStage = undefined;
  let currStage = loaderStage;
  let nextStage = undefined;

  Time.previousTime = Date.now();

  function renderDebug() {
    ctx.strokeStyle = "#000000";
    ctx.strokeRect(
      world.bounds.x,
      world.bounds.y,
      world.bounds.w,
      world.bounds.h
    );

    ctx.strokeStyle = "#FF5800";
    for (let [id, object] of world.objects) {
      ctx.save();

      ctx.translate(
        object.x + object.center.x + object.bounds.x,
        object.y + object.center.y + object.bounds.y
      );
      ctx.rotate(object.θ);
      ctx.strokeRect(
        -object.center.x,
        -object.center.y,
        object.bounds.w,
        object.bounds.h
      );

      ctx.restore();
    }

    ctx.strokeStyle = "red";

    ctx.save();

    ctx.strokeRect(
      camera.focus.x + camera.focus.center.x - camera.pos.x / camera.scale,
      camera.focus.y + camera.focus.center.y - camera.pos.y / camera.scale,
      CANVAS_WIDTH / camera.scale,
      CANVAS_HEIGHT / camera.scale
    );

    ctx.restore();

    ctx.textAlign = "left";
    ctx.font = "24px monospace";
    ctx.fillStyle = "white";
    ctx.fillMultiLineText(
      `XY: ${parseInt(camera.focus.x)} / ${parseInt(camera.focus.y)}\nSIZE: ${
        world.objects.size
      }`,
      0,
      24
    );
  }

  function loop() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    if (nextStage != undefined) {
      prevStage = currStage;
      currStage = nextStage;
      nextStage = undefined;

      prevStage.unmount();
      currStage.mount();
    }

    try {
      Time.currentTime = performance.now();

      currStage.render();

      if ($global.debug) renderDebug();

      Time.previousTime = performance.now();
    } catch (error) {
      ctx.reset();
      ctx.fillStyle = "blue";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.fillStyle = "white";
      ctx.textAlign = "left";
      ctx.font = "24px monospace";
      ctx.fillMultiLineText(error.stack, 0, 24);

      throw error;
    }

    window.requestAnimationFrame(loop);
  }

  window.requestAnimationFrame(loop);
}

document.addEventListener("DOMContentLoaded", main);
