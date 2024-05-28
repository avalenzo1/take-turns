const { Socket } = require("socket.io");
const { Room } = require("./take-turns");
const {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} = require("unique-names-generator");
const { v4: UUID } = require("uuid");

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

      if (rooms.length > 0) {
        for (let i = 0; i < rooms.length; i++) {
          let room = this.room[rooms[i]];
          
          if (room instanceof Room) {
            return room;
          }
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
      (key) => (this.room[key].available && !this.room[key].started)
    );

    if (roomList.length > 0) {
      // If there are rooms available
      // Run This code block
      // Don't ask...

      return this.room[roomList[Math.floor(Math.random() * roomList.length)]];
    }

    return new Room(this.io);
  }

  captureEvent({ event, params }) {
    const navigator = event.split("/");

    let socket = this.parseSocket(params);
    
    if (navigator[0] === "Player") {
      if (navigator[1] === "Username") {
        socket.username = params.username;
      }
    }

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
            console.log("Successful!");
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
              console.log(
                `The server has deleted the room of ID '${room.id}'.`
              );
              room.selfDestruct();
              delete this.room[room.id];
            }
          }, 5000);
        }

        if (navigator[2] === "Sync") {
          let room = this.parseRoom({ roomId: socket.roomId });

          if (!(room instanceof Room)) {
            socket.emit("Room/Console", {
              type: "danger",
              message: "This room does not exist.",
            });
            
            socket.emit("Room/Player/Leave");
          }
        }
      }
    }

    console.log(
      `Global event "${event}" was captured on ${new Date().toString()}`
    );
  }

  createInstance(socket) {
    this.socket[socket.id] = socket;

    // Creates On Events for Socket
    socket.on("Player/Username", (username) => {
      this.captureEvent({
        event: "Player/Username",
        params: { socket, username },
      });
    });
    
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
    
    // socket.on("Room/Player/Sync", (socketId) => {
    //   this.captureEvent({
    //     event: "Room/Player/Sync",
    //     params: { socket },
    //   });
    // });

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
