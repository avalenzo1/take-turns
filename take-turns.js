const { Socket } = require("socket.io");

const {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} = require("unique-names-generator");
const { v4: UUID } = require("uuid");

const filter = require("leo-profanity");
const he = require("he");

function UID() {
  return Math.random().toString(36).slice(-6).toUpperCase();
}

function roomHasInstanceOfSocket(room, socket) {
  if (!!room === false || !!socket === false) return false;
  if (room.socket[socket.id] !== undefined) return true;
}

class Path {
  constructor(style) {
    this.id = UUID();
    this.path = [];
    this.style = style;
    this.done = false;
  }

  moveTo(x, y) {
    this.path.push({ type: "moveTo", point: [x, y] });
  }

  lineTo(x, y) {
    this.path.push({ type: "lineTo", point: [x, y] });
  }
}

class Player {
  constructor({ id, roomId, name }) {
    this.id = id;
    this.name =
      name ||
      uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        length: 3,
      });

    this.timeJoined = Date.now();

    this.roomId = roomId;
    this.drawing;

    this.path = undefined;
    this.client = {};
  }

  get clientDetails() {
    return {
      id: this.id,
      name: this.name,
    };
  }

  attachRoom(roomId) {
    this.roomId = roomId;
  }

  unattachRoom() {
    this.roomId = null;
  }
}

class Canvas {
  constructor() {
    this.backgroundColor = "#c00";
    this.width = 200;
    this.height = 200;
    this.activeEffect = false;
    this.paths = [];
    this.intervalId = undefined;
    // this.setEffect("thanos_snap", 200);
    // this.setEffect("thanos_cleanup", 200);
  }

  clear() {
    this.paths = [];
    this.backgroundColor = "white";
  }

  reset() {
    this.clear();
  }

  getFull() {
    return {
      backgroundColor: this.backgroundColor,
      width: this.width,
      height: this.height,
      paths: this.paths,
    };
  }

  getLatest() {
    return {
      paths: this.paths.filter((path) => path.done === false),
    };
  }

  clearEffect(effect) {
    clearInterval(this.intervalId[effect]);
  }

  setEffect(effect, tickRate) {
    if (effect == "thanos_snap") {
      this.intervalId["thanos_snap"] = setInterval(() => {
        if (this.activeEffect) {
          try {
            let stateChange = false;

            let i = this.paths.length;

            while (i--) {
              this.paths[i].path.splice(0, 1);

              if (this.paths[i].path.length > 0) {
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

    if (effect == "thanos_cleanup") {
      this.intervalId["thanos_cleanup"] = setInterval(() => {
        if (this.activeEffect) {
          try {
            console.log(this.paths.length);

            let i = this.paths.length;

            while (i--) {
              if (this.paths[i].path.length === 0) {
                this.paths.splice(i, 1);
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
      this.paths.push(path);
      this.activeEffect = true;
    }
  }
}

class Gamemode {
  constructor() {
    this.canvas = new Canvas();
  }
}

// class OldRoom {
//     constructor({ io, name, password, gamemodeType }) {
//         this.io = io;
//         this.id = generateID();
//         this.name = name;
//         this.password = password;
//         this.socket = {};
//         this.game = new Gamemode();

//         let cache = this;

//         this.state = {
//             get ready() {
//                 try {
//                     if (Object.values(cache.socket).length === 1) return false;

//                     for (let player of Object.values(cache.socket)) {
//                         if (!player.state.ready) return false;
//                     }
//                 } catch {
//                     return false;
//                 }

//                 return true;
//             },
//             starting: false,
//             started: false,
//             // convert to function
//             timeout: 5000,
//             countdown: null,
//             tickRateIdle: 2500,
//             tickRateActive: 64,
//             tickRateEffect: 492,
//             ticker: {
//                 tickRate: null,
//                 intervalId: false,
//                 onStep() {
//                   // bug, creates error while drawing?
//                     try {
//                         cache.io.to(cache.id).emit('Server/Room/State', cache.streamDetails);
//                     } catch {
//                         console.log("AHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH WTH")
//                     }

//                     cache.io.to(cache.id).emit('Server/Room/Stream', cache.streamCanvas);
//                 },
//                 start() {
//                     if (typeof this.tickRate === 'number' && !this.isRunning) this.intervalId = setInterval(this.onStep, this.tickRate);
//                 },
//                 stop() {
//                     clearInterval(this.intervalId);
//                     this.intervalId = false;
//                 },
//                 reset() {
//                     this.stop();
//                     this.start();
//                 },
//                 get isRunning() {
//                     return (this.intervalId === false) ? false : true;
//                 }
//             },
//             set started(started) {
//                 if (started) {
//                     this.ticker.tickRate = this.tickRateIdle;
//                     this.ticker.start();
//                 } else {
//                     this.ticker.stop();
//                 }
//             },
//             set drawing(drawing) {
//                 if (drawing) {
//                     this.ticker.tickRate = this.tickRateActive;
//                 } else {
//                     this.ticker.tickRate = this.tickRateIdle;
//                 }

//                 this.ticker.reset();
//             }
//         }
//     }

//     captureLocalEvent({ events, params }) {

//     }

//     createLocalInstance(socket) {

//     }

//     unattachPlayer({ player }) {
//         if (player instanceof Player && this.socket[player.id] !== undefined) {
//             delete this.socket[player.id];
//         }
//     }

//     attachPlayer({ player, password }) {
//         // Check if password is equal to password given.

//         if (player instanceof Player) {
//             this.socket[player.id] = player;
//         }
//     }

//     get streamDetails() {
//         return {
//             id: this.id,
//             playerList: Object.values(this.socket),
//             ready: this.state.ready,
//             started: this.state.started,
//             tickRate: this.state.ticker.tickRate
//         };
//     }

//     get streamCanvas() {
//         return this.game.canvas.stream;
//     }
// }

class Vector2 {
  constructor(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }
}

const Physics = {
  startTime: performance.now(),
  get deltaTime() {
    return (performance.now() - this.startTime) / 1000;
  },
};

class Ticker {
  constructor(delay) {
    this.delay = delay > 5 ? delay : 50;
    this.intervalId = null;
  }

  start() {
    // console.log(this);
    if (typeof this.step === "function" && typeof this.delay === "number") {
      this.intervalId = setInterval(this.step, this.delay);
    }
  }

  stop() {
    clearInterval(this.intervalId);
  }
}

function globalStep(io, sockets) {
  for (let i = 0; i < sockets.length; i++) {
    const socket = sockets[i];

    if (socket.drawing) {
      io.to(socket.id).emit("Room/Draw/Move");
    }
  }
}

function sanitizeMessage(message) {
  return he.encode(message);
}

function validateMessage(message) {
  if (message.trim().length == 0) return false;
  if (message.length > 300) return false;

  return true;
}

class Team {
  constructor(name) {
    this.name =
      name ||
      uniqueNamesGenerator({
        dictionaries: [colors, animals],
        separator: " ",
        length: 3,
      });
    this.players = [];
    this.maxPlayers = 4;

    this.score = 0;
  }
}

class Room {
  #io;
  #ticker;

  constructor(io, name, capacity = 100) {
    this.#io = io;
    this.id = UID();
    this.name =
      name ||
      `${uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        length: 3,
      })}`;
    this.socket = {};
    this.capacity = 16;
    this.#ticker = new Ticker(50);

    this.canvas = new Canvas();

    this.teams = [];

    this.chats = [];

    this.currentRound = 0;
    this.numOfRounds = 3;

    this.timePerTeamRound = 15000;

    this.maxPossibleScore = 1200;
    this.lowestPossibleScore = 400;
    this.scoreLossPerSecond = 150;

    this.owner = null;

    this.ready = false;
    this.started = false;
    this.finished = false;
    this.winner = undefined;

    this.#ticker.step = () => {
      globalStep(this.#io, Object.values(this.socket));

      this.#io.to(this.id).emit("Room/Tick", this);
    };

    this.#ticker.start();
  }

  get available() {
    // Checks if room is full
    return Object.keys(this.socket).length / this.capacity < 1;
  }

  parseSocket({ socket, socketId }) {
    if (socket instanceof Socket) {
      return this.socket[socket.id];
    }

    if (this.socket[socketId] instanceof Socket) {
      return this.socket[socketId];
    }

    return null;
  }

  startGame() {}

  createTeams(numberOfTeams) {
    this.teams = [];
    
    for (let i = 0; i < numberOfTeams; i++) {
      this.teams.push(new Team(`Team ${i + 1}`));
    }
  }

  assignPlayersToTeams() {
    const players = Object.values(this.socket);
    const numberOfTeams = this.teams.length;

    // Iterate through each player and assign them to the least populated team
    players.forEach((player) => {
      let team = this.teams.reduce((prev, current) =>
        prev.players.length < current.players.length ? prev : current
      );
      player.team = team.name;
      team.players.push(player);
    });
  }

  // Call this method when you want to start assigning players to teams
  decideTeams() {
    this.teams = [];
    
    const playerSize = Object.values(this.socket).length;
    
    if (this.teams.length === 0) {
      //TODO: Create Algorithm to calculate best number of teams
      
      switch (playerSize) {
        case 2:
          this.createTeams(2);
          break;
        case 3:
          this.createTeams(2);
          break;
        case 4:
          this.createTeams(2);
          break;
        case 5:
          this.createTeams(2);
          break;
        case 6:
          this.createTeams(2);
          break;
        case 7:
          this.createTeams(2);
          break;
        case 8:
          this.createTeams(2);
          break;
        case 9:
          this.createTeams(3);
          break;
        case 10:
          this.createTeams(3);
          break;
        case 11:
          this.createTeams(3);
          break;
        case 12:
          this.createTeams(3);
          break;
        case 13:
          this.createTeams(4);
          break;
        case 14:
          this.createTeams(4);
          break;
        case 15:
          this.createTeams(4);
          break;
        case 16:
          this.createTeams(4);
          break;
      }
      
    }
    
    this.assignPlayersToTeams();
  }
  
  decideOwner() {
    const sockets = Object.values(this.socket);

    if (sockets.length === 0) {
      this.owner = null;
      return;
    }

    const owner = sockets.reduce((firstJoined, currentPlayer) => {
      return currentPlayer.timeJoined < firstJoined.timeJoined
        ? currentPlayer
        : firstJoined;
    });

    this.owner = owner;
  }
  
  get sufficientPlayers() {
    return Object.keys(this.socket).length > 1;
  }

  captureEvent({ event, params }) {
    const navigator = event.split("/");
    const socket = this.parseSocket(params);

    if (navigator[0] === "Room") {
      if (navigator[1] === "Chat") {
        if (navigator[2] === "Message" && validateMessage(params.message)) {
          this.#io.to(this.id).emit("Room/Chat/Message", {
            name: socket.name,
            message: filter.clean(params.message),
            date: Date.now(),
          });
          this.#io.to(this.id).emit("Room/Chat/StopTyping", socket.id);
        }
        if (navigator[2] === "Typing") {
          this.#io.to(this.id).emit("Room/Chat/Typing", socket.id);
        }
        if (navigator[2] === "StopTyping") {
          this.#io.to(this.id).emit("Room/Chat/StopTyping", socket.id);
        }
      }

      if (navigator[1] === "Canvas" && roomHasInstanceOfSocket(this, socket)) {
        if (navigator[2] === "Clear") {
          this.canvas.clear();
        }

        let canvasData = this.canvas.getFull();

        this.#io.to(this.id).emit("Room/Canvas/Sync", canvasData);
      }

      if (navigator[1] === "Draw" && roomHasInstanceOfSocket(this, socket)) {
        socket.client = params.client;

        if (navigator[2] === "Start") {
          console.log("El Principio");

          socket.path = new Path(socket.client.style);
          socket.path.moveTo(socket.client.x, socket.client.y);

          this.canvas.appendPath(socket.path);

          socket.drawing = true;
        }

        if (navigator[2] === "Move" || navigator[2] === "End") {
          console.log("Moviendo o Fin");
          // Additional move or end logic here

          if (socket.client.buffer !== undefined) {
            for (let line of socket.client.buffer) {
              socket.path.lineTo(line[0], line[1]);
            }
          }
        }

        if (navigator[2] === "End") {
          console.log("Fin");

          socket.path.done = true;

          socket.client = {};
          socket.drawing = false;
        }

        let canvasData = this.canvas.getLatest();

        this.#io.to(this.id).emit("Room/Canvas/Update", canvasData);
      }

      if (navigator[1] === "Player") {
        if (navigator[2] === "Join") {
          this.attachSocket(params.socket, params.formData);
          this.decideTeams();

          // When a player leaves, game is paused
          if (this.started && this.sufficientPlayers) {
            this.paused = false;
            this.decideTeams();
            this.#io.to(this.id).emit("Room/Game/Resume");
          }
        }

        if (navigator[2] === "Leave" && roomHasInstanceOfSocket(this, socket)) {
          // Remove player
          this.unattachSocket(params.socket);
          this.decideTeams();

          // When a player leaves, game is paused
          if (this.started && !this.sufficientPlayers) {
            this.paused = true;

            this.#io.to(this.id).emit("Room/Game/Pause");
          }
        }

        // Owner is ready
        if (navigator[2] === "Ready" && roomHasInstanceOfSocket(this, socket)) {
          if (this.owner === socket && this.sufficientPlayers) {
            this.started = true;

            this.#io.to(this.id).emit("Room/Game/Start");

            this.decideTeams();
          }
        }

        if (this.started) {
          let canvasData = this.canvas.getFull();

          this.#io.to(this.id).emit("Room/Canvas/Sync", canvasData);
        }

        this.captureEvent({ event: "Room/Details", params: { socket } });
      }

      if (navigator[1] === "Details") {
        this.#io.to(this.id).emit("Room/Details", {
          id: this.id,
          playerList: Object.values(this.socket),
          ready: this.ready,
          started: this.started,
          finished: this.finished,
          owner: this.owner,
          teams: this.teams
        });
      }
    }

    this.#io
      .to(this.id)
      .emit(
        "Server/Console",
        `Local event "${event}" was captured on ${new Date().toString()}`
      );
    console.log(
      `Local event "${event}" was captured on ${new Date().toString()}`
    );
  }

  createLocalInstance(socket) {
    // Creates onEvents for socket
    socket.on("Room/Draw/Start", (client) => {
      this.captureEvent({
        event: "Room/Draw/Start",
        params: { socket, client },
      });
    });

    socket.on("Room/Draw/Move", (client) => {
      this.captureEvent({
        event: "Room/Draw/Move",
        params: { socket, client },
      });
    });

    socket.on("Room/Draw/End", (client) => {
      this.captureEvent({
        event: "Room/Draw/End",
        params: { socket, client },
      });
    });

    socket.on("Room/Canvas/Clear", (client) => {
      this.captureEvent({
        event: "Room/Canvas/Clear",
        params: { socket, client },
      });
    });

    socket.on("Room/Chat/Message", (message) => {
      this.captureEvent({
        event: "Room/Chat/Message",
        params: { socket, message: sanitizeMessage(message) },
      });
    });

    socket.on("Room/Chat/Typing", () => {
      this.captureEvent({ event: "Room/Chat/Typing", params: { socket } });
    });

    socket.on("Room/Player/Ready", () => {
      this.captureEvent({ event: "Room/Player/Ready", params: { socket } });
    });

    socket.on("Room/Tick", (controls) => {
      this.socket[socket.id].controls = controls;
    });
  }

  attachSocket(socket, params) {
    if (this.socket.hasOwnProperty(socket.id)) {
      console.warn("Socket already exists");
    } else {
      socket.join(this.id);
      this.socket[socket.id] = new Player({ id: socket.id, roomId: this.id });
      this.#io.to(socket.id).emit("Room/Player/Join", this);

      // No owner currently
      if (this.owner === null) {
        this.decideOwner();
      }

      this.createLocalInstance(socket);
    }
  }

  unattachSocket(socket) {
    if (socket instanceof Socket) {
      let player = this.socket[socket.id];

      if (player instanceof Player) {
        player.roomId = undefined;

        socket.leave(this.id);
        delete this.socket[socket.id];

        // No owner currently
        if (this.owner === player) {
          this.decideOwner();
        }

        console.log(`Socket ${socket.id} was unattached from room ${this.id}`);
      }
    }
  }

  selfDestruct() {
    this.#ticker.stop();
  }
}

module.exports = {
  Room,
};
