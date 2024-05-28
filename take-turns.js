const { Socket } = require("socket.io");
const { v4: UUID } = require("uuid");

// Handles Usernames
const {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} = require("unique-names-generator");

// Handles Chat
const filter = require("leo-profanity"); // Handles Profanity
const he = require("he"); // Handles Cross Site Scripting (XSS)
const { gameWords } = require("multilingual-game-words"); // Handles common word dictionary
const levenshtein = require("js-levenshtein");

class Charades {
  constructor() {
    this.words = undefined;

    this.init();
  }

  generate(size = 1) {
    const words = [];

    for (let i = 0; i < size; i++) {
      const word = this.words[Math.floor(Math.random() * this.words.length)];

      words.push(word.word);
    }

    return words;
  }

  async init() {
    const g = await gameWords("en");

    this.words = await g.getAllWords();
  }
}

function UID() {
  return Math.random().toString(36).slice(-6).toUpperCase();
}

function teamHasInstanceOfSocket(team, socket) {
  if (!!team === false || !!socket === false) return false;
  if (team.players[socket.id]) return true;

  return false;
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

    this.teamId = null;
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

  thanosSnap() {
    try {
      let i = this.paths.length;

      while (i--) {
        this.paths[i].path.splice(0, 1);
      }
    } catch (e) {
      console.log(e);
    }
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

class Vector2 {
  constructor(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }
}

class Ticker {
  constructor(delay) {
    this.delay = delay > 5 ? delay : 50;
    this.intervalId = null;
    this.timeElapsed = 0;

    this._step = () => {
      this.timeElapsed += this.delay;

      this.step();
    };
  }

  start() {
    // console.log(this);
    if (typeof this.step === "function" && typeof this.delay === "number") {
      this.intervalId = setInterval(this._step, this.delay);

      this.step();
    }
  }

  stop() {
    clearInterval(this.intervalId);
  }
}

function isLetter(c) {
  return c.toLowerCase() != c.toUpperCase();
}

function round(number) {
  return Math.round(number * 10) / 10;
}

function globalStep(io, ticker, sockets) {
  for (let i = 0; i < sockets.length; i++) {
    const socket = sockets[i];

    if (socket.drawing) {
      io.to(socket.id).emit("Room/Draw/Move");
    }
  }

  const timeElapsed = round(ticker.timeElapsed / 1000);

  // console.clear();
  // console.log("=====================================================");
  // console.log(`Time Elapsed: ${timeElapsed}`);
  // console.log(`Round ${this.currentRound}/${this.totalRounds}`);
  // console.log(
  //   `Current Team ${this.currentTeam?.name} Next Team: ${this.nextTeam?.name}`
  // );
  // console.log(
  //   `Current Player: ${this.currentPlayer?.name} Next Player: ${this.nextPlayer?.name}`
  // );
  // console.log("=====================================================\n");

  let triggerTeam = false;
  let triggerRound = false;
  
  if (this.currentRound === this.totalRounds) {
    this.canvas.thanosSnap();
  }

  if (timeElapsed >= this.secondsPerPlayer) {
    console.log(`Pay Load Triggered.`);

    this.currentPlayerIndex++;

    if (this.currentPlayer === undefined) {
      this.currentPlayerIndex = 0;
      this.currentTeamIndex++;

      triggerTeam = true;
    }

    if (this.currentTeam === undefined) {
      this.currentTeamIndex = 0;
      this.currentRound++;

      triggerRound = true;
    }

    if (this.currentRound > this.totalRounds) {
      this.captureEvent({
        event: "Room/Game/End",
      });

      return;
    }

    if (triggerTeam) {
      this.captureEvent({
        event: "Room/Game/Team",
      });
    }

    if (triggerRound) {
      this.captureEvent({
        event: "Room/Game/Round",
      });
    }

    if (!triggerTeam) {
      this.captureEvent({
        event: "Room/Game/Player",
      });
    }

    ticker.timeElapsed = 0;
  }
}

function userCanDraw(room, socket) {
  return room.currentPlayer === socket;
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
    this.id = UUID();
    this.name =
      name ||
      "The " + uniqueNamesGenerator({
        dictionaries: [colors, animals],
        separator: " ",
        style: 'capital',
        length: 2,
      }) + "s";
    this.players = {};
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

    this.socket = {}; // Players
    this.capacity = 16; // Player Capacity

    this.#ticker = new Ticker(100);

    this.#ticker.step = () => {
      const boundGlobalStep = globalStep.bind(this);

      boundGlobalStep(this.#io, this.#ticker, Object.values(this.socket));
    };

    this.canvas = new Canvas(); // Canvas

    this.teams = []; // List of teams
    this.chats = []; // History of Chats

    this.owner = null; // Room Leader

    // Room configurations

    this.totalRounds = 3;
    this.currentRound = 1;

    this.secondsPerTeam = 30;

    this.currentTeamIndex = 0;
    this.currentPlayerIndex = 0;

    this.maxPossibleScore = 1000;
    this.lowestPossibleScore = 100;
    this.scoreLossPerSecond = 50;

    // Time left

    // this.timeElapsedForRound = 0;
    // this.timeElapsedForTeam = 0;
    // this.timeElapsedForPlayer = 0;

    // Status of Game

    this.ready = false;
    this.started = false;
    this.finished = false;

    this.charades = new Charades();

    this.possibleWords = null;
    this.currentWord = null;
  }

  get available() {
    // Checks if room is full
    return Object.keys(this.socket).length / this.capacity < 1;
  }

  parseTeam(player) {
    if (!(player instanceof Player)) return null;
    
    let found = undefined;
    
    this.teams.forEach((team) => {
      if (team.id === player.teamId) {
        found = team;
        return;
      }
    });

    return found;
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

  triggerRound() {
    this.currentRound++;
  }

  triggerTeam() {
    this.currentTeamIndex++;
  }

  triggerPlayer() {
    this.currentPlayerIndex++;
  }

  get currentTeam() {
    return this.teams[this.currentTeamIndex];
  }

  get nextTeam() {
    return this.teams[this.currentTeamIndex + 1];
  }

  get currentPlayer() {
    let players = Object.values(this.currentTeam.players);
    
    return players[this.currentPlayerIndex];
  }

  get nextPlayer() {
    let players = Object.values(this.currentTeam.players);
    
    return players[this.currentPlayerIndex + 1];
  }

  get secondsPerPlayer() {
    return this.secondsPerTeam / Object.keys(this.currentTeam.players).length;
  }

  startGame() {
    this.captureEvent({
      event: "Room/Game/Round",
    });

    this.captureEvent({
      event: "Room/Game/Team",
    });
  }

  createTeams(numberOfTeams) {
    this.teams = [];

    for (let i = 0; i < numberOfTeams; i++) {
      this.teams.push(new Team());
    }
  }

  assignPlayersToTeams() {
    const players = Object.values(this.socket);
    const numberOfTeams = this.teams.length;

    // Iterate through each player and assign them to the least populated team
    players.forEach((player) => {
      let team = this.teams.reduce((prev, current) =>
        Object.keys(prev.players).length < Object.keys(current.players).length ? prev : current
      );
      player.teamId = team.id;
      team.players[player.id] = player;
    });
  }

  // Call this method when you want to start assigning players to teams
  decideTeams() {
    if (this.started) {
      
      
      return;
    }
    
    this.teams = [];

    const playerSize = Object.values(this.socket).length;

    if (this.teams.length === 0) {
      //TODO: Create Algorithm to calculate best number of teams

      switch (playerSize) {
        case 1:
          this.createTeams(1);
          break;
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

  get winner() {
    return this.teams.reduce((maxTeam, currentTeam) => {
      return currentTeam.score > maxTeam.score ? currentTeam : maxTeam;
    }, this.teams[0]);
  }

  get sufficientPlayers() {
    return Object.keys(this.socket).length > 1;
  }

  captureEvent({ event, params = {} }) {
    try {
    const navigator = event.split("/");

    let socket = this.parseSocket(params);

    if (navigator[0] === "Room") {
      if (navigator[1] === "Chat") {
        if (navigator[2] === "Message" && validateMessage(params.message)) {
          if (
            teamHasInstanceOfSocket(this.currentTeam, socket) &&
            this.started
          ) {
            this.#io.to(socket.id).emit("Room/Chat/Message", {
              name: "Server",
              message: "You're not allowed to chat!",
              date: Date.now(),
              isOwner: false,
              isServer: true,
            });

            return;
          }

          this.#io.to(this.id).emit("Room/Chat/Message", {
            name: socket?.name || "Server",
            message: filter.clean(params.message),
            date: Date.now(),
            isOwner: this.owner === socket,
            isServer: !(socket instanceof Player) && params.isServer,
          });

          if (socket) {
            this.#io.to(this.id).emit("Room/Chat/StopTyping", socket.id);

            if (!teamHasInstanceOfSocket(this.currentTeam, socket) && typeof this.currentWord === "string") {
              if (
                this.currentWord.toLowerCase() === params.message?.toLowerCase()
              ) {
                const team = this.parseTeam(socket);

                this.#io.to(socket.id).emit("Room/Chat/Message", {
                  name: "Server",
                  message: "Word guessed successfully",
                  date: Date.now(),
                  isOwner: false,
                  isServer: true,
                });

                team.score +=
                  this.scoreLossPerSecond *
                  round(this.#ticker.timeElapsed / 1000);

                this.currentTeam.score +=
                  this.maxPossibleScore -
                  this.scoreLossPerSecond *
                    round(this.#ticker.timeElapsed / 1000);

                let triggerTeam = true;
                let triggerRound = false;

                this.currentTeamIndex++;

                if (this.currentTeam === undefined) {
                  this.currentTeamIndex = 0;
                  this.currentRound++;

                  triggerRound = true;
                }

                if (this.currentRound > this.totalRounds) {
                  this.captureEvent({
                    event: "Room/Game/End",
                  });

                  return;
                }

                if (triggerTeam) {
                  this.captureEvent({
                    event: "Room/Game/Team",
                  });
                }

                if (triggerRound) {
                  this.captureEvent({
                    event: "Room/Game/Round",
                  });
                }

                this.#ticker.timeElapsed = 0;
              } else if (
                levenshtein(
                  this.currentWord.toLowerCase(),
                  params.message?.toLowerCase()
                ) <= 2
              ) {
                this.#io.to(socket.id).emit("Room/Chat/Message", {
                  name: "Server",
                  message: "Your guess was close!",
                  date: Date.now(),
                  isOwner: false,
                  isServer: true,
                });
              }
            }
          }
        }

        if (navigator[2] === "Typing") {
          this.#io.to(this.id).emit("Room/Chat/Typing", socket.id);
        }

        if (navigator[2] === "StopTyping") {
          this.#io.to(this.id).emit("Room/Chat/StopTyping", socket.id);
        }
      }

      if (
        navigator[1] === "Canvas" &&
        roomHasInstanceOfSocket(this, socket) &&
        userCanDraw(this, socket)
      ) {
        if (navigator[2] === "Clear") {
          this.canvas.clear();
        }

        let canvasData = this.canvas.getFull();

        this.#io.to(this.id).emit("Room/Canvas/Sync", canvasData);
      }

      if (navigator[1] === "Game") {
        if (navigator[2] === "Start") {
          this.decideTeams();

          this.#io.to(this.id).emit("Room/Game/Start");

          this.started = true;

          this.startGame();
        }

        if (navigator[2] === "End") {
          this.finished = true;
          this.#ticker.stop();

          this.#io.to(this.id).emit("Room/Game/End", this.winner);
        }

        // Handles Game Events

        if (navigator[2] === "Round") {
          this.captureEvent({
            event: "Room/Chat/Message",
            params: {
              isServer: true,
              message: `Round ${this.currentRound} is starting.`,
            },
          });

          this.#io.to(this.id).emit("Room/Game/Round", {
            totalRounds: this.totalRounds,
            currentRound: this.currentRound,
          });
        }

        if (navigator[2] === "Team") {
          this.captureEvent({
            event: "Room/Chat/Message",
            params: {
              isServer: true,
              message: `Team ${this.currentTeam.name} is drawing.`,
            },
          });

          this.#io.to(this.id).emit("Room/Game/Team", {
            currentTeam: this.currentTeam,
            nextTeam: this.nextTeam,
            secondsPerTeam: this.secondsPerTeam,
          });

          let socket = this.#io.sockets.sockets.get(this.currentPlayer.id);

          this.possibleWords = this.charades.generate(4);

          this.#ticker.stop();

          socket.emit("Room/Game/Pick", { words: this.possibleWords });

          socket.broadcast.emit("Room/Game/Pick", {
            player: this.currentPlayer,
          });

          this.captureEvent({
            event: "Room/Chat/Message",
            params: {
              isServer: true,
              message: `Player ${this.currentPlayer.name} is picking a word.`,
            },
          });

          this.captureEvent({
            event: "Room/Canvas/Clear",
            params: { socket },
          });
        }

        if (
          navigator[2] === "Pick" &&
          roomHasInstanceOfSocket(this, socket) &&
          userCanDraw(this, socket)
        ) {
          if (this.possibleWords.includes(params?.word)) {
            this.currentWord = params.word;
          } else {
            this.currentWord = this.possibleWords[0];
          }

          this.captureEvent({
            event: "Room/Game/Player",
          });

          this.#ticker.start();
        }

        if (navigator[2] === "Player") {
          this.captureEvent({
            event: "Room/Chat/Message",
            params: {
              isServer: true,
              message: `Player ${this.currentPlayer.name} is drawing.`,
            },
          });

          this.obscuredWord = "";

          for (let i = 0; i < this.currentWord.length; i++) {
            if (isLetter(this.currentWord)) this.obscuredWord += "_";
            else this.obscuredWord += this.currentWord[i];
          }

          let socket = this.#io.sockets.sockets.get(this.currentPlayer.id);

          socket.to(this.id).emit("Room/Game/Player", {
            currentPlayer: this.currentPlayer,
            nextPlayer: this.nextPlayer,
            secondsPerPlayer: this.secondsPerPlayer,
            word: this.obscuredWord,
          });

          this.#io.to(this.currentPlayer.id).emit("Room/Game/Player", {
            currentPlayer: this.currentPlayer,
            nextPlayer: this.nextPlayer,
            secondsPerPlayer: this.secondsPerPlayer,
            word: this.currentWord,
          });
        }

        this.captureEvent({ event: "Room/Details" });
      }

      if (
        navigator[1] === "Draw" &&
        roomHasInstanceOfSocket(this, socket) &&
        this.started
      ) {
        socket.client = params.client;

        if (!userCanDraw(this, socket)) {
          if (socket.path instanceof Path) {
            socket.path.done = true;
            socket.client = {};
            socket.drawing = false;
          }

          return;
        }

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

          if (socket.path) socket.path.done = true;

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

          this.captureEvent({
            event: "Room/Chat/Message",
            params: {
              isServer: true,
              message: `${
                this.socket[params.socket.id].name
              } joined the lobby! 😃`,
            },
          });
        }

        if (navigator[2] === "Leave" && roomHasInstanceOfSocket(this, socket)) {
          // Remove player

          this.captureEvent({
            event: "Room/Chat/Message",
            params: {
              isServer: true,
              message: `${socket.name} left the lobby... 😔`,
            },
          });

          this.unattachSocket(params.socket);

          this.decideTeams();
        }

        // Owner is ready
        if (navigator[2] === "Ready" && roomHasInstanceOfSocket(this, socket)) {
          // When there are sufficient players, game is started
          if (this.owner === socket && this.sufficientPlayers) {
            this.captureEvent({ event: "Room/Game/Start", params: { socket } });
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
          teams: this.teams,
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
    
    } catch (e) {
      console.log(e);
      
      this.#io
      .to(this.id)
      .emit(
        "Room/Console",
        {
          type: "danger",
          message: "A fatal error occurred. This room has been terminated."
        } 
      );
      
      this.kickAll();
    }
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

    socket.on("Room/Game/Pick", (word) => {
      this.captureEvent({ event: "Room/Game/Pick", params: { socket, word } });
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
      this.socket[socket.id] = new Player({
        name: socket.username,
        id: socket.id,
        roomId: this.id,
      });
      this.#io.to(socket.id).emit("Room/Player/Join", this);

      socket.roomId = this.id;

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
      let team = this.parseTeam(player);

      if (player instanceof Player) {
        // No owner currently
        if (this.owner === player) {
          this.decideOwner();
        }
        
        if (team instanceof Team) {
          delete team.players[player.id];
        }

        socket.leave(this.id);
        delete this.socket[socket.id];
        
        console.log(`Socket ${socket.id} was unattached from room ${this.id}`);
      }
    }
  }

  kickAll() {
    const players = Object.values(this.socket);

    for (let i = 0; i < players.length; i++) {
      const socket = this.#io.sockets.sockets.get(players[i].id);

      if (socket instanceof Socket) {
        this.captureEvent({ event: "Room/Player/Leave", params: { socket } });
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
