function UID() {
  return Math.random().toString(36).slice(-6).toUpperCase();
}

class Player {
  constructor(id) {
    this.id = id;
    this.name = `Player #` + this.id;
    this.ready = false;
  }

  mountRoom(room) {
    this.room = room;
  }
}

class Server {
  constructor() {
    this.roomList = [];
  }

  fetchRoom(id) {
    let room = this.roomList.filter((r) => {
      return r.id === id;
    });

    if (room.length > 0) {
      return room[0];
    }

    return;
  }

  join(player, id) {
    let room = this.fetchRoom(id);

    if (room instanceof Room) {
      room.join(player);

      return { type: "success", room: room };
    }

    return { type: "error", message: `r̷̢̛̖͍ǫ̶̤̐͑̂ŏ̴̠̰͕̈́̇ͅṁ̶͙͖̋̃̐ ̴͉̫̩̈́̔͐d̸̟̙́̅̽ǫ̸̤̺̏̑͋͆͜e̷͕̲͕̒̅͝ș̷̰͒̏̈́ͅ ̴͕̀̏͒n̷̘̮̖̼̈̈́̚ó̵̫t̷̯̐ ̴̯̬̒ę̵̰̘͕̋̂̈͗ẍ̴̨̪͖̫́̈̎ì̷̟̦̇̽s̵̙̩͂̋ţ̷̛̫̘͔͒` };
  }

  mountRoom(room) {
    this.roomList.push(room);
  }
}

class Room {
  constructor({ owner }) {
    this.id = UID();
    this.owner = owner;
    this.playerList = [];
    this.insession = false;
    this.timeout = 2500;
  }

  fetchPlayer(id) {
    let player = this.playerList.filter((p) => {
      return p.id === id;
    });

    if (player.length > 0) {
      return player[0];
    }

    return;
  }

  fetchIndex(id) {
    return this.playerList.findIndex((player) => player.id === id);
  }

  join(player) {
    if (player instanceof Player) {
      this.playerList.push(player);
    }
  }

  leave(id) {
    const playerIndex = this.fetchIndex(id);

    if (playerIndex > -1) this.playerList.splice(playerIndex, 1);
  }

  get details() {
    return {
      owner: this.owner,
      playerList: this.playerList,
      id: this.id,
    };
  }
}

function createServer(io) {
  let server = new Server();

  function fetchDetails(id) {
    let room = server.fetchRoom(id);

    if (room instanceof Room) {
      console.log(`${socket.id} fetched ${id} details`);

      socket.to(id).emit("server/room-details", room.details);
      socket.emit("server/room-details", room.details);
    }
  }

  function setState(state) {
    if (state.ready !== undefined) player.ready = state.ready;
  }

  function createRoom() {
    const room = new Room({ owner: socket.id });
    socket.emit("server/new-room", room.id);
    server.mountRoom(room);
  }

  function joinRoom(id) {
    const response = server.join(player, id);

    if (response.type === "success") {
      console.log(`socket ${socket.id} has joined room ${id}`);

      socket.join(id);
    }
    socket.emit("server/join-room", response);
  }

  function leaveRoom(id) {
    let room = server.fetchRoom(id);

    if (room instanceof Room) {
      console.log(`socket ${socket.id} has left room ${id}`);

      room.leave(socket.id);
      fetchDetails(socket.id);
    }
  }

  io.of("/").adapter.on("join-room", (roomID, playerID) => {
    fetchDetails(roomID);
  });

  io.of("/").adapter.on("leave-room", (roomID, playerID) => {
    leaveRoom(roomID);
  });

  io.on("connection", (socket) => {
    let player = new Player(socket.id);

    socket.on("server/new-room", function () {
      createRoom();
    });

    socket.on("server/join-room", function (id) {
      joinRoom(id);
    });

    socket.on("server/leave-room", function (id) {
      leaveRoom(id);
    });

    socket.on("server/room-details", function (id) {
      fetchDetails(id);
    });

    socket.on("server/player-state", function (e) {
      let room = server.fetchRoom(e.id);

      if (room instanceof Room) {
        setState(e.state);
        fetchDetails(room.id);
      }
    });
  });
}

module.exports = { createServer };
