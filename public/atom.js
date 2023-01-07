function isString(obj) {
    return (Object.prototype.toString.call(obj) === '[object String]');
}

function reduce(numerator, denominator) {
    var gcd = function gcd(a, b) {
        return b ? gcd(b, a % b) : a;
    };
    gcd = gcd(numerator, denominator);
    return [numerator / gcd, denominator / gcd];
}

class Point {
    constructor({ x, y, cx, cy, sx, sy, rx, ry }) {
        this.x = x || 0;
        this.y = y || 0;
        this.cx = cx || 0;
        this.cy = cy || 0;
        this.sx = sx || 1;
        this.sy = sy || 1;
        this.rx = rx || 0;
        this.ry = ry || 0;
    }
}

class Color {
    constructor({ red: r, green: g, blue: b, alpha: a }) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a || 1;

        return;
    }

    random({ red: r, green: g, blue: b, alpha: a }) {
        this.r = parseInt(r || 255 * Math.random());
        this.g = parseInt(g || 255 * Math.random());
        this.b = parseInt(b || 255 * Math.random());
        this.a = a || 1 * Math.random();

        return;
    }

    get rgba() {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }

    get hex() {}
}

class Style {
    constructor({ fillStyle, strokeStyle, lineWidth, lineCap, lineJoin, miterLimit }) {
        this.fillStyle = fillStyle;
        this.strokeStyle = strokeStyle;
        this.lineWidth = lineWidth;
        this.lineCap = lineCap;
        this.lineJoin = lineJoin;
        this.miterLimit = miterLimit;


    }

    postRender(ctx) {
        if (this.fillStyle) ctx.fillStyle = this.fillStyle;
        if (this.strokeStyle) ctx.strokeStyle = this.strokeStyle;
        if (this.lineWidth) ctx.lineWidth = this.lineWidth;
        if (this.lineCap) ctx.lineCap = this.lineCap;
        if (this.lineJoin) ctx.lineJoin = this.lineJoin;
        if (this.miterLimit) ctx.miterLimit = this.miterLimit;
    }
}

class _Object {
    constructor({ path, style, point, postRender }) {
        if (path instanceof Path2D) {
            this.path = path;
        } else {
            this.path = new Path2D(path);
        }

        if (style instanceof Style) {
            this.style = style;
        } else {
            this.style = new Style(style);
        }

        if (point instanceof Point) {
            this.point = point;
        } else {
            this.point = new Point({});
        }
    }

    setStyle(style) {
        this.style;
    }

    mount({ app, camera }) {
        if (app) this.app = app;
        if (camera) this.camera = camera;
    }

    addEventListener(type, callback) {
        if (this.app instanceof Application) {
            // Application was mounted

            this.app.view.addEventListener(type, (e) => {
                if (this.checkIfInContact(e)) {
                    callback(e);
                }
            });
        } else {
            // Application wasn't mounted

            throw new Error("Object must be attached to an instance of a Stage");
        }
    }

    checkIfInContact(e) {
        let isInContact = false;
        const ctx = this.app.ctx;

        ctx.save();

        this.postRender();

        if (ctx.isPointInPath(this.path, e.offsetX, e.offsetY)) {
            isInContact = true;
        }

        ctx.restore();

        return isInContact;
    }

    postRender() {
        const ctx = this.app.ctx;
        const view = this.app.view;

        if (this.app instanceof Application) {
            if (this.style) {
                this.style.postRender(ctx);
            }

            ctx.translate(this.point.x, this.point.y);
            ctx.scale(this.point.sx, this.point.sy);
            ctx.rotate(this.point.rx, this.point.ry);
        } else {
            // Application wasn't mounted

            throw new Error("Object must be attached to an instance of a Stage");
        }
    }

    render() {
        if (this.app instanceof Application) {
            const ctx = this.app.ctx;
            const view = this.app.view;

            ctx.save();

            this.postRender();
            ctx.fill(this.path);
            ctx.stroke(this.path);
            ctx.restore();
        } else {
            // Application wasn't mounted

            throw new Error("Object must be attached to an instance of a Stage");
        }
    }
}

class Sprite extends _Object {
    constructor({ src, sheet, point }) {
        super({ point });

        this.sprite = new Image();
        this.sprite.src = src;

        this.sheet = sheet;
    }
}

class Application {
    constructor({ id, width, height }) {
        this.id = id;
        this.width = width;
        this.height = height;

        this.createCanvas();
    }

    createCanvas() {
        this.view = document.createElement("canvas");
        this.ctx = this.view.getContext("2d");

        if (this.id) {
            this.view.id = this.id;
        }

        if (this.width && this.height) {
            this.view.width = this.width;
            this.view.height = this.height;
        }
    }
}

class Font extends _Object {
    constructor(string, font, style, point, maxWidth) {
        super({ style, point });

        this.string = string;
        this.font = font;
        this.maxWidth = maxWidth;
    }

    render({ app, camera }) {
        const ctx = app.ctx;

        ctx.font = this.font;

        ctx.fillStyle()
    }
}

class Ticker {
    constructor(x, y) {}
}

class Frame {
    constructor({ app, x, y, w, h, backgroundColor }) {
        this.app = app;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.backgroundColor = backgroundColor;

        this.objectList = [];
        this.camera;
    }

    setBounds({ x, y, w, h }) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    appendObject(object) {
        if (object instanceof _Object) {
            this.objectList.push(object);
            object.mount({ app: this.app });
        }
    }

    render() {
        const ctx = this.app.ctx;
        const view = this.app.view;

        ctx.clearRect(0, 0, view.width, view.height);

        // Rendered Object

        ctx.save();
        ctx.translate(this.x, this.y);

        if (this.backgroundColor) {
            ctx.fillStyle = this.backgroundColor;
            ctx.fillRect(0, 0, view.width, view.height);
        }

        for (let object of this.objectList) {
            if (object instanceof _Object) {
                object.render();
            }
        }

        ctx.font = "16px 'Roboto Mono'";
        ctx.fillStyle = "rgb(255, 63, 0)";
        ctx.fillText(`X: ${this.x}, Y: ${this.y}, Width: ${this.w - this.x}, Height: ${this.h - this.y}`, 0, 20);

        ctx.globalCompositeOperation = 'destination-in';

        // Cropped Frame

        ctx.beginPath();
        ctx.rect(0, 0, this.w - this.x, this.h - this.y);
        ctx.closePath();
        ctx.fill();

        ctx.restore();

        ctx.globalCompositeOperation = 'source-over';
    }
}

class Camera {
    constructor(x, y) {}
}

export {
    Point,
    Ticker,
    Frame,
    Camera,
    Color,
    Application,
    _Object,
    Font,
    Style,
    Sprite,
};