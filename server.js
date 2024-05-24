const { Socket } = require("socket.io");
const { Room } = require("./take-turns");
const {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} = require("unique-names-generator");
const { v4: UUID } = require('uuid');

const randomName = uniqueNamesGenerator({
  dictionaries: [adjectives, colors, animals],
});

function UID() {
  return Math.random().toString(36).slice(-6).toUpperCase();
}

function roomHasInstanceOfSocket(room, socket) {
  if (!!room === false || !!socket === false) return false;
  if (room.socket[socket.id] !== undefined) return true;
}

// class OldServer {
//     constructor(io) {
//         this.io = io;
//         this.room = {};
//         this.socket = {};
//     }

//     listen() {
//         this.io.on("connection", (socket) => {
//             this.createInstance(socket);
//         });

//         this.io.of("/").adapter.on("delete-room", (room) => {
//             console.log(`room ${room} was deleted`);
//         });

//         this.io.of("/").adapter.on("create-room", (room) => {
//             console.log(`room ${room} was created`);
//         });

//         this.io.of("/").adapter.on("join-room", (room, socket) => {
//             console.log(`socket ${socket} has joined room ${room}`);
//         });

//         this.io.of("/").adapter.on("leave-room", (room, socket) => {
//             this.captureEvent({ event: 'Server/Room/Leave', params: { socket: this.socket[socket], room: this.room[room] } })
//             console.log(`socket ${socket} has left room ${room}`);
//         });
//     }

//     parseSocket({ socket, socketId }) {
//         if (socket instanceof Socket) {
//             return socket;
//         }
//     }

//     parseRoom({ socket, socketId, room, roomId }) {
//         if (typeof socket === 'object' && typeof this.socket[socket.id].roomId === 'string' && this.room[this.socket[socket.id].roomId] instanceof Room) {
//             return this.room[this.socket[socket.id].roomId];
//         }

//         if (room instanceof Room) {
//             return room;
//         }

//         if (this.room[roomId] instanceof Room) {
//             return this.room[roomId];
//         }
//     }

//     captureEvent({ event, params }) {
//         const bookCrumb = event.split("/");
//         const socket = params.socket;
//         const player = this.socket[socket.id];
//         const room = this.parseRoom(params);

//         if (bookCrumb[1] === 'Room') {
//             if (bookCrumb[2] === 'Create') {
//                 const room = new Room({ io: this.io, name: 'Room', password: 'HELLO!' });
//                 this.room[room.id] = room;

//                 socket.emit("Server/Room/Create", { res: 'success', id: room.id });
//                 console.log("Server/Room/Create");
//             }

//             if (bookCrumb[2] === 'Join') {
//                 try {
//                     room.attachPlayer({ player, password: '' });
//                     room.createLocalInstance(socket);
//                     socket.join(room.id);
//                     socket.emit("Server/Room/Join");
//                     player.attachRoom(room.id);
//                 } catch (e) {
//                     console.log(e)
//                 }

//                 this.captureEvent({ event: "Server/Room/Get", params: { socket, get: ['details'] } });
//             }

//             if (roomHasInstanceOfSocket(room, socket)) {
//                 if (bookCrumb[2] === 'Leave') {
//                     room.unattachPlayer({ player });
//                     player.unattachRoom();

//                     // room.checkState();

//                     try {
//                         this.captureEvent({ event: "Server/Room/Get", params: { socket: Object.values(room.socket)[0], get: ['details'] } });
//                     } catch (e) {
//                         setTimeout(() => {
//                             // Check if there are currently no players.
//                             console.log("SELF DESTRUCT?");

//                             // Bug: Server crash if .socket is undefined
//                             if (Object.keys(this.room[room.id].socket).length === 0) {
//                                 delete this.room[room.id];
//                                 console.log("WOOOO!!!!");
//                                 console.table(this.room);
//                             } else {
//                                 console.log("Awww... :(");
//                             }
//                         }, 10000);
//                     }
//                 }

//                 if (bookCrumb[2] === 'Set') {
//                     // Create a way to encapsulate to 'start' the game without having too much code here?
//                     // Or create a function to connect server socket and room

//                     player.setState(params.set);

//                     this.io.to(room.id).emit("Server/Room/State", room.stream
// );
//                 }

//                 if (bookCrumb[2] === 'Get') {
//                     for (let request of params.get) {
//                         switch (request) {
//                             case 'details':
//                                 this.io.to(room.id).emit("Server/Room/State", room.streamDetails);
//                                 break;
//                         }
//                     }
//                 }

//                 console.log(room.streamDetails);

//                 console.log(room.state.ready)
//                 console.log(room.state.starting)
//                 console.log(room.state.started)

//                 if (room.state.ready && !room.state.starting && !room.state.started) {
//                     // If Room is ready and hasn't started a countdown, create one!
//                     var expiredDate = new Date();
//                     expiredDate = new Date(expiredDate.getTime() + room.state.timeout);

//                     console.log(expiredDate);

//                     room.state.countdown = new Countdown(expiredDate, (time) => {
//                         this.io.to(room.id).emit("Server/Console", { type: 'secondary', message: `Game starting in ${time.seconds} seconds.` });
//                     }, () => {
//                         console.log("hello?")
//                         this.io.to(room.id).emit("Server/Room/State/Start");
//                         room.state.started = true;
//                     });

//                     room.state.starting = true;
//                 }

//                 if (!room.state.ready && room.state.starting && !room.state.started) {
//                     this.io.to(room.id).emit("Server/Console", { type: 'secondary', message: `Game was cancelled.` });
//                     room.state.countdown.cancel();

//                     room.state.starting = false;
//                 }

//                 if (!room.state.ready && room.state.starting && room.state.started) {
//                     this.io.to(room.id).emit("Server/Console", { type: 'secondary', message: `Game was cancelled.` });
//                     room.state.countdown.cancel();

//                     room.state.starting = false;
//                     room.state.started = false;
//                 }
//             }
//         }

//         if (bookCrumb[1] === 'Stream') {
//             if (roomHasInstanceOfSocket(room, socket)) {
//                 player.state.client = params.state.client;

//                 if (bookCrumb[2] === 'Start') {
//                     // Start
//                     console.log("El Principio");
//                     player.state.path = new Path(player.state.client.style);
//                     room.game.canvas.appendPath(player.state.path);
//                     player.state.path.moveTo(player.state.client.x, player.state.client.y);
//                     player.state.intervalId = setInterval(() => {
//                         socket.emit("Server/Stream/Move");
//                     }, room.state.tickRateActive);
//                     room.state.drawing = true;
//                 }

//                 if (bookCrumb[2] === 'Move' || bookCrumb[2] === 'End') {
//                     console.log("Moviendo o Fin");

//                     if (player.state.client.buffer !== undefined) {
//                         for (let line of player.state.client.buffer) {
//                             player.state.path.lineTo(line[0], line[1]);
//                         }
//                     }
//                 }

//                 if (bookCrumb[2] === 'End') {
//                     console.log("Fin");

//                     player.state.client = null;

//                     clearInterval(player.state.intervalId);
//                     room.state.drawing = false;

//                     console.log(room.game.canvas.stream)
//                 }
//             }
//         }

//         console.log(event);
//     }

//     createInstance(socket) {
//         this.socket[socket.id] = new Player({ id: socket.id });

//         function Alert({ type, message }) {
//             socket.emit("Server/Console", { type, message });
//         }

//         socket.on("Server/Room/Create", (state) => {
//             this.captureEvent({ event: 'Server/Room/Create', params: { socket } })
//         });

//         socket.on("Server/Room/Join", (id) => {
//             try {
//                 this.captureEvent({ event: 'Server/Room/Join', params: { socket, roomId: id } });
//             } catch (err) {
//                 Alert({ type: 'warning', message: `Could Not Join ${id}` });
//                 console.error(err);
//             }

//             console.table(this.room);
//         });

//         socket.on("Server/Room/Leave", () => {
//             this.captureEvent({ event: 'Server/Room/Leave', params: { socket, room: this.room[this.socket[socket.id].roomId] } }); // Ignore this lol
//         });

//         socket.on("Server/Room/Set", (set) => {
//             this.captureEvent({ event: "Server/Room/Set", params: { socket, set } });
//         });

//         socket.on("Server/Room/Get/", (get) => {
//             this.captureEvent({ event: "Server/Room/Get", params: { socket, get } });
//         });

//         socket.on("Server/Stream/Start", (state) => {
//             this.captureEvent({ event: "Server/Stream/Start", params: { socket, state } });
//         });

//         socket.on("Server/Stream/Move", (state) => {
//             this.captureEvent({ event: "Server/Stream/Move", params: { socket, state } });
//         });

//         socket.on("Server/Stream/End", (state) => {
//             this.captureEvent({ event: "Server/Stream/End", params: { socket, state } });
//         });

//         socket.on("disconnect", () => {
//             delete this.socket[socket.id];
//         });
//     }
// }

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
      if (roomHasInstanceOfSocket(this.room[room], this.socket[socket])) {
        this.captureEvent({
          event: "Room/Player/Leave",
          params: {
            socket: this.socket[socket],
            room: this.room[room],
          },
        });

        console.log(`socket ${socket} has left room ${room}`);
      }
    });
  }

  parseSocket({ socket, socketId }) {
    if (socket instanceof Socket) {
      return socket;
    }

    if (this.socket[socketId] instanceof Socket) {
      return this.socket[socketId];
    }

    return null;
  }

  parseRoom({ socket, socketId, room, roomId }) {
    // console.log([socket, socketId, room, roomId])
    
    if (this.socket[socketId] instanceof Socket) {
      socket = this.socket[socketId];
    }
    
    if (socket instanceof Socket) {
      let rooms = Array.from(socket.rooms);
      
      if (rooms.length > 0)
      {
        for (let i = 0; i < rooms.length; i++)
        {
          if (this.room[rooms[i]] instanceof Room)
            return this.room[rooms[i]];
        }
      }
    }

    if (room instanceof Room) {
      return room;
    }

    if (this.room[roomId] instanceof Room) {
      return this.room[roomId];
    }

    return null;
  }

  getRandomRoom(params) {
    let roomList = Object.keys(this.room).filter(
      (key) => this.room[key].available
    );

    if (roomList.length > 0) {
      // If there are rooms available
      // Run This code block
      // Don't ask...

      return this.room[roomList[Math.floor(Math.random() * roomList.length)]];
    }

    return new Room(this.io);;
  }

  captureEvent({ event, params }) {
    const navigator = event.split("/");

    let socket = this.parseSocket(params);

    if (navigator[0] === "Room") {
      // Socket creates room
      if (navigator[1] === "Create") {
        let room = new Room(this.io);

        this.room[room.id] = room;
        
        room.captureEvent({
          event: "Room/Player/Join",
          params: { socket, formData: params.formData },
        });
      }

      if (navigator[1] === "Player") {
        // Socket Joins Room
        if (navigator[2] === "Join") {
          let room;

          // Player wants to join custom room
          if (params.formData) {
            // Check if room exists and is available
            if (
              this.room[params.formData] &&
              this.room[params.formData].available
            ) {
              room = this.room[params.formData];
            } else {
              socket.emit("Room/Console", {
                type: "warning",
                message: `Could not join room, ${params.formData}. Room doesn't exist or is full.`,
              });
            }
          } else {
            // Search available rooms from room object
            room = this.getRandomRoom(params);
          }

          if (room instanceof Room) {
            // Attaches Socket
             room.captureEvent({
               event: "Room/Player/Join",
               params: { socket, formData: params.formData },
             });

            this.room[room.id] = room;
          }
        }

        // Socket leaves room
        if (navigator[2] === "Leave") {
          let room = this.parseRoom(params);

          if (roomHasInstanceOfSocket(room, socket)) {
            console.log("Successful!")
            room.captureEvent({
              event: "Room/Player/Leave",
              params: { socket },
            });
          }

          // If Room is empty after 5 seconds, delete room
          setTimeout(() => {
            console.log("SELF DESTRUCT???");

            if (room instanceof Room && Object.keys(room.socket).length === 0) {
              console.log("Yessir 💥");
              console.log(`The server has deleted the room of ID '${room.id}'.`);
              room.selfDestruct();
              delete this.room[room.id];
            }
          }, 5000);
        }
      }
    }

    console.log(`Global event "${event}" was captured on ${new Date().toString()}`);
  }

  createInstance(socket) {
    this.socket[socket.id] = socket;

    // Creates On Events for Socket
    socket.on("Room/Create", () => {
      this.captureEvent({
        event: "Room/Create",
        params: { socket },
      });
    });

    socket.on("Room/Player/Join", (formData) => {
      this.captureEvent({
        event: "Room/Player/Join",
        params: { socket, formData },
      });
    });

    socket.on("Room/Player/Leave", () => {
      this.captureEvent({
        event: "Room/Player/Leave",
        params: { socket },
      });
    });

    socket.on("Room/Player/Kick", (socketId) => {
      this.captureEvent({
        event: "Room/Player/Leave",
        params: { socket },
      });
    });

    socket.on("disconnect", () => {
      console.log(`${socket.id} disconnected`);
    });
  }
}

function createServer(io) {
  let server = new Server(io);

  server.listen();
}

module.exports = {
  createServer,
};
