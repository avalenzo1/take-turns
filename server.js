const e = require('express');
const { Socket } = require('socket.io');
const { uniqueNamesGenerator, adjectives, colors, animals } = require('unique-names-generator');

const randomName = uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals]
});

function generateID() {
    return Math.random().toString(36).slice(-6).toUpperCase();
}

function UUID() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function roomHasInstanceOfSocket(room, socket) {
    if (room === undefined || !socket === undefined) return false;
    if (room.socket[socket.id] !== undefined) return true;
}

class Countdown {
    constructor(expiredDate, onRender, onComplete) {
        this.setExpiredDate(expiredDate);

        this.onRender = onRender;
        this.onComplete = onComplete;
    }

    setExpiredDate(expiredDate) {
        // get the current time
        const currentTime = new Date().getTime();

        // calculate the remaining time 
        this.timeRemaining = expiredDate.getTime() - currentTime;

        this.timeRemaining <= 0 ?
            this.complete() :
            this.start();
    }


    complete() {
        if (typeof this.onComplete === 'function') {
            this.onComplete();
        }
    }

    getTime() {
        return {
            days: Math.floor(this.timeRemaining / 1000 / 60 / 60 / 24),
            hours: Math.floor(this.timeRemaining / 1000 / 60 / 60) % 24,
            minutes: Math.floor(this.timeRemaining / 1000 / 60) % 60,
            seconds: Math.floor(this.timeRemaining / 1000) % 60
        };
    }

    update() {
        if (typeof this.onRender === 'function') {
            this.onRender(this.getTime());
        }
    }

    cancel() {
        clearInterval(this.intervalId);
    }

    start() {
        // update the countdown
        this.update();

        //  setup a timer
        this.intervalId = setInterval(() => {
            // update the timer  
            this.timeRemaining -= 1000;

            if (this.timeRemaining < 0) {
                // call the callback
                this.complete();

                // clear the interval if expired
                clearInterval(this.intervalId);
            } else {
                this.update();
            }

        }, 1000);
    }
}

class Ticker {
    constructor() {

    }
}

class Path {
    constructor(style) {
        // this.id = UUID();
        this.path = [];
        this.style = style;
    }

    moveTo(x, y) {
        this.path.push({ type: 'moveTo', point: [x, y] });
    }

    lineTo(x, y) {
        this.path.push({ type: 'lineTo', point: [x, y] });
    }
}

class Player {
    constructor({ id, name }) {
        this.id = id;
        this.name = name || uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals], length: 3 });
        this.roomId = null;
        this.state = {
            ready: false,
            gamerule: null,
            path: null,
            client: null
        };
    }

    get clientDetails() {
        return {
            id: this.id,
            name: this.name,
            ready: this.state.ready
        }
    }

    getState(state) {
        return this.state;
    }

    setState(state) {
        if (typeof state.ready !== undefined) {
            this.state.ready = state.ready;
        }
    }

    attachRoom(roomId) {
        this.roomId = roomId;
    }

    unattachRoom() {
        this.roomId = null;
        this.ready = false;
    }
}

class Canvas {
    constructor() {
        this.backgroundColor = "#c00";
        this.width = 200;
        this.height = 200;
        this.activeEffect = false;
        this.stream = [];
        this.intervalId = {};
        this.setEffect('thanos_snap', 100);
        this.setEffect('thanos_cleanup', 2000)
    }

    clearEffect(effect) {
        clearInterval(this.intervalId[effect]);
    }

    setEffect(effect, tickRate) {
        if (effect == 'thanos_snap') {
            this.intervalId['thanos_snap'] = setInterval(() => {
                if (this.activeEffect) {
                    try {
                        let stateChange = false;

                        console.log(this.stream.length);

                        let i = this.stream.length;

                        while (i--) {
                            this.stream[i].path.splice(0, 1);

                            if (this.stream[i].path.length > 0) {
                                stateChange = true;
                            }
                        }

                        if (stateChange === false) this.activeEffect = false;
                    } catch (e) {
                        console.log(e);
                    }
                }
            }, tickRate);
        }

        if (effect == 'thanos_cleanup') {
            this.intervalId['thanos_cleanup'] = setInterval(() => {
                if (this.activeEffect) {
                    try {
                        console.log(this.stream.length);

                        let i = this.stream.length;

                        while (i--) {
                            if (this.stream[i].path.length === 0) {
                                this.stream.splice(i, 1);
                            }
                        }
                    } catch (e) {
                        console.log(e);
                    }
                }
            }, tickRate);
        }
    }

    appendPath(path) {
        if (path instanceof Path) {
            this.stream.push(path);
            this.activeEffect = true;
        }
    }
}

class Gamemode {
    constructor() {
        this.canvas = new Canvas();
    }
}

class Room {
    constructor({ io, name, password, gamemodeType }) {
        this.io = io;
        this.id = generateID();
        this.name = name;
        this.password = password;
        this.socket = {};
        this.game = new Gamemode();

        let cache = this;

        this.state = {
            get ready() {
                try {
                    if (Object.values(cache.socket).length === 1) return false;

                    for (let player of Object.values(cache.socket)) {
                        if (!player.state.ready) return false;
                    }
                } catch {
                    return false;
                }

                return true;
            },
            starting: false,
            started: false,
            // convert to function
            timeout: 100,
            countdown: null,
            tickRateIdle: 2500,
            tickRateActive: 100,
            tickRateEffect: 500,
            ticker: {
                tickRate: null,
                intervalId: false,
                onStep() {
                    try {
                        cache.io.to(cache.id).emit('Server/Room/State', cache.streamDetails);
                    } catch {
                        console.log("AHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH WTFFF")
                    }

                    cache.io.to(cache.id).emit('Server/Room/Stream', cache.streamCanvas);
                },
                start() {
                    if (typeof this.tickRate === 'number' && !this.isRunning) this.intervalId = setInterval(this.onStep, this.tickRate);
                },
                stop() {
                    clearInterval(this.intervalId);
                    this.intervalId = false;
                },
                reset() {
                    this.stop();
                    this.start();
                },
                get isRunning() {
                    return (this.intervalId === false) ? false : true;
                }
            },
            set started(started) {
                if (started) {
                    this.ticker.tickRate = this.tickRateIdle;
                    this.ticker.start();
                } else {
                    this.ticker.stop();
                }
            },
            set drawing(drawing) {
                if (drawing) {
                    this.ticker.tickRate = this.tickRateActive;
                } else {
                    this.ticker.tickRate = this.tickRateIdle;
                }

                this.ticker.reset();
            }
        }
    }

    captureLocalEvent({ events, params }) {

    }

    createLocalInstance(socket) {

    }

    unattachPlayer({ player }) {
        if (player instanceof Player && this.socket[player.id] !== undefined) {
            delete this.socket[player.id];
        }
    }

    attachPlayer({ player, password }) {
        // Check if password is equal to password given.

        if (player instanceof Player) {
            this.socket[player.id] = player;
        }
    }

    get streamDetails() {
        return {
            id: this.id,
            playerList: Object.values(this.socket),
            ready: this.state.ready,
            started: this.state.started,
            tickRate: this.state.ticker.tickRate
        };
    }

    get streamCanvas() {
        return this.game.canvas.stream;
    }
}

class Server {
    constructor(io) {
        this.io = io;
        this.room = {};
        this.socket = {};
    }

    listen() {
        this.io.on("connection", (socket) => {
            this.createInstance(socket);
        });

        this.io.of("/").adapter.on("delete-room", (room) => {
            console.log(`room ${room} was deleted`);
        });

        this.io.of("/").adapter.on("create-room", (room) => {
            console.log(`room ${room} was created`);
        });

        this.io.of("/").adapter.on("join-room", (room, socket) => {
            console.log(`socket ${socket} has joined room ${room}`);
        });

        this.io.of("/").adapter.on("leave-room", (room, socket) => {
            this.captureEvent({ event: 'Server/Room/Leave', params: { socket: this.socket[socket], room: this.room[room] } });

            console.log(`socket ${socket} has left room ${room}`);
        });
    }

    parseSocket({ socket, socketId }) {
        if (socket instanceof Socket) {
            return socket;
        }
    }

    parseRoom({ socket, socketId, room, roomId }) {
        if (typeof socket === 'object' && typeof this.socket[socket.id].roomId === 'string' && this.room[this.socket[socket.id].roomId] instanceof Room) {
            return this.room[this.socket[socket.id].roomId];
        }

        if (room instanceof Room) {
            return room;
        }

        if (this.room[roomId] instanceof Room) {
            return this.room[roomId];
        }
    }

    captureEvent({ event, params }) {
        const bookCrumb = event.split("/");
        const socket = params.socket;
        const player = this.socket[socket.id];
        const room = this.parseRoom(params);

        if (bookCrumb[1] === 'Room') {
            if (bookCrumb[2] === 'Create') {
                const room = new Room({ io: this.io, name: 'Room', password: 'HELLO!' });
                this.room[room.id] = room;

                socket.emit("Server/Room/Create", { res: 'success', id: room.id });
                console.log("Server/Room/Create");
            }

            if (bookCrumb[2] === 'Join') {
                try {
                    room.attachPlayer({ player, password: '' });
                    room.createLocalInstance(socket);
                    socket.join(room.id);
                    socket.emit("Server/Room/Join");
                    player.attachRoom(room.id);
                } catch (e) {
                    console.log(error)
                }

                this.captureEvent({ event: "Server/Room/Get", params: { socket, get: ['details'] } });
            }

            if (roomHasInstanceOfSocket(room, socket)) {
                if (bookCrumb[2] === 'Leave') {
                    room.unattachPlayer({ player });
                    player.unattachRoom();

                    // room.checkState();

                    try {
                        this.captureEvent({ event: "Server/Room/Get", params: { socket: Object.values(room.socket)[0], get: ['details'] } });
                    } catch (e) {
                        setTimeout(() => {
                            // Check if there are currently no players.
                            console.log("SELF DESTRUCT?");

                            // Bug: Server crash if .socket is undefined
                            if (Object.keys(this.room[room.id].socket).length === 0) {
                                delete this.room[room.id];
                                console.log("WOOOO!!!!");
                                console.table(this.room);
                            } else {
                                console.log("Awww... :(");
                            }
                        }, 10000);
                    }
                }

                if (bookCrumb[2] === 'Set') {
                    // Create a way to encapsulate to 'start' the game without having too much code here?
                    // Or create a function to connect server socket and room

                    player.setState(params.set);

                    this.io.to(room.id).emit("Server/Room/State", room.streamDetails);
                }

                if (bookCrumb[2] === 'Get') {
                    for (let request of params.get) {
                        switch (request) {
                            case 'details':
                                this.io.to(room.id).emit("Server/Room/State", room.streamDetails);
                                break;
                        }
                    }
                }

                console.log(room.streamDetails);

                console.log(room.state.ready)
                console.log(room.state.starting)
                console.log(room.state.started)

                if (room.state.ready && !room.state.starting && !room.state.started) {
                    // If Room is ready and hasn't started a countdown, create one!
                    var expiredDate = new Date();
                    expiredDate = new Date(expiredDate.getTime() + room.state.timeout);

                    console.log(expiredDate);

                    room.state.countdown = new Countdown(expiredDate, (time) => {
                        this.io.to(room.id).emit("Server/Console", { type: 'secondary', message: `Game starting in ${time.seconds} seconds.` });
                    }, () => {
                        console.log("hello?")
                        this.io.to(room.id).emit("Server/Room/State/Start");
                        room.state.started = true;
                    });

                    room.state.starting = true;
                }

                if (!room.state.ready && room.state.starting && !room.state.started) {
                    this.io.to(room.id).emit("Server/Console", { type: 'secondary', message: `Game was cancelled.` });
                    room.state.countdown.cancel();

                    room.state.starting = false;
                }

                if (!room.state.ready && room.state.starting && room.state.started) {
                    this.io.to(room.id).emit("Server/Console", { type: 'secondary', message: `Game was cancelled.` });
                    room.state.countdown.cancel();

                    room.state.starting = false;
                    room.state.started = false;
                }
            }
        }

        if (bookCrumb[1] === 'Stream') {
            if (roomHasInstanceOfSocket(room, socket)) {
                player.state.client = params.state.client;

                if (bookCrumb[2] === 'Start') {
                    // Start
                    console.log("El Principio");
                    player.state.path = new Path(player.state.client.style);
                    room.game.canvas.appendPath(player.state.path);
                    player.state.path.moveTo(player.state.client.x, player.state.client.y);
                    player.state.intervalId = setInterval(() => {
                        socket.emit("Server/Stream/Move");
                    }, room.state.tickRateActive);
                    room.state.drawing = true;
                }

                if (bookCrumb[2] === 'Move' || bookCrumb[2] === 'End') {
                    console.log("Moviendo o Final");

                    if (player.state.client.buffer !== undefined) {
                        for (let line of player.state.client.buffer) {
                            player.state.path.lineTo(line[0], line[1]);
                        }
                    }
                }

                if (bookCrumb[2] === 'End') {
                    console.log("Final");

                    player.state.client = null;

                    clearInterval(player.state.intervalId);
                    room.state.drawing = false;

                    console.log(room.game.canvas.stream)
                }
            }
        }

        console.log(event);
    }

    createInstance(socket) {
        this.socket[socket.id] = new Player({ id: socket.id });

        function Alert({ type, message }) {
            socket.emit("Server/Console", { type, message });
        }

        socket.on("Server/Room/Create", (state) => {
            this.captureEvent({ event: 'Server/Room/Create', params: { socket } })
        });

        socket.on("Server/Room/Join", (id) => {
            try {
                this.captureEvent({ event: 'Server/Room/Join', params: { socket, roomId: id } });
            } catch (err) {
                Alert({ type: 'warning', message: `Could Not Join ${id}` });
                console.error(err);
            }

            console.table(this.room);
        });

        socket.on("Server/Room/Leave", () => {
            this.captureEvent({ event: 'Server/Room/Leave', params: { socket, room: this.room[this.socket[socket.id].roomId] } }); // Ignore this lol
        });

        socket.on("Server/Room/Set", (set) => {
            this.captureEvent({ event: "Server/Room/Set", params: { socket, set } });
        });

        socket.on("Server/Room/Get/", (get) => {
            this.captureEvent({ event: "Server/Room/Get", params: { socket, get } });
        });

        socket.on("Server/Stream/Start", (state) => {
            this.captureEvent({ event: "Server/Stream/Start", params: { socket, state } });
        });

        socket.on("Server/Stream/Move", (state) => {
            this.captureEvent({ event: "Server/Stream/Move", params: { socket, state } });
        });

        socket.on("Server/Stream/End", (state) => {
            this.captureEvent({ event: "Server/Stream/End", params: { socket, state } });
        });

        socket.on("disconnect", () => {
            delete this.socket[socket.id];
        });
    }
}

function createServer(io) {
    let server = new Server(io);

    server.listen();
}

module.exports = {
    createServer
};