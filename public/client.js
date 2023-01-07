import { Application, Frame, _Object } from "./atom.js";

class Client {
    constructor(socket) {
        this.socket = socket;
        this.room = undefined;
    }

    createInstance() {
        this.socket.on("Server/Room/Join", (room) => {
            this.room = room;
        });

        this.socket.on("Server/Room/Leave", () => {
            this.room = undefined;
        });

        this.socket.on("Server/Room/State", (details) => {
            this.details = details;
        });
    }

    createStream(view) {
        const viewport = document.getElementById("game-view/viewport");
        const app = new Application({ id: 'game-view/canvas', width: Infinity, height: Infinity });
        const stage = new Frame({ app, x: 0, y: 0, w: app.view.width, h: app.view.height, backgroundColor: '#fff' });

        const client = {
            buffer: [],
            active: false,
            style: {
                fillStyle: 'transparent',
                strokeStyle: '#000',
                lineWidth: 5,
            },
            x: 0,
            y: 0
        };

        const startClient = (e) => {
            client.active = true;
            updateClient(e);

            this.socket.emit("Server/Stream/Start", { client });
        }

        const updateClient = (e) => {
            if (e.clientX || e.clientY) {
                client.x = e.clientX;
                client.y = e.clientY;
            }

            if (e.touches) {
                client.x = e.touches[0].clientX;
                client.y = e.touches[0].clientY;
            }

            client.buffer.push([client.x, client.y]);

            // var i = client.buffer.length;

            // while (i--) {
            //     (i + 1) % 3 === 0 && client.buffer.splice(i, 1);
            // }
        }

        const endClient = (e) => {
            client.active = false;
            client.buffer = [];

            this.socket.emit("Server/Stream/End", { client });
            console.log(client)
        }

        this.socket.on("Server/Stream/Move", () => {
            console.log("helllo???")
            this.socket.emit("Server/Stream/Move", { client });

            client.buffer = [];
        });

        this.socket.on("Server/Room/Stream", (stream) => {
            stage.objectList = [];

            for (let client of stream) {
                let path = new Path2D();

                if (client.path.length > 2) {
                    for (let i = 0; i < client.path.length; i++) {
                        path[client.path[i].type](client.path[i].point[0], client.path[i].point[1]);
                    }
                }

                let object = new _Object({ path, style: client.style });
                stage.appendObject(object);
            }
        });

        function loop() {
            stage.render();

            window.requestAnimationFrame(loop);
        }

        app.view.onmousedown = (e) => {
            startClient(e);
        };

        app.view.onmousemove = (e) => {
            if (client.active) updateClient(e);
        };

        app.view.onmouseup = (e) => {
            endClient(e);
        }

        app.view.ontouchstart = (e) => {
            startClient(e);
        };

        app.view.ontouchmove = (e) => {
            if (client.active) updateClient(e);
        };

        app.view.ontouchend = (e) => {
            endClient(e);
        }

        const resizeCanvas = () => {
            app.view.width = view.clientWidth;
            app.view.height = view.clientHeight;
            stage.setBounds({ x: 0, y: 0, w: view.clientWidth, h: view.clientHeight });
        };

        app.view.classList.add("t-canvas");
        view.appendChild(app.view);
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        loop();
    }

    parseURL() {
        const params = new Proxy(new URLSearchParams(window.location.search), {
            get: (searchParams, prop) => searchParams.get(prop),
        });
        const id = params.join;

        if (id) {
            this.socket.emit("Server/Room/Join", id);
        }
    }
}

function createClient(socket) {
    const client = new Client(socket);

    client.createInstance();
    client.parseURL();

    return client;
}

export { createClient };