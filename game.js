function UID() {
  return Math.random().toString(36).slice(-6).toUpperCase();
}

class Player {
  constructor({ name, id }) {
    this.id = id;
    this.name = `Player #` + this.id;
    this.ready = false;
  }
}

class Server {
  constructor() {
    this.roomList = [];
  }
  
  fetchRoom(uid) {
    let room = this.roomList.filter(r => {
      return r.uid === uid;
    });
    
    if (room.length > 0) {
      return room[0];
    }
    
    return;
  }
  
  join(player, uid) {
    let room = this.fetchRoom(uid);
    
    if (room instanceof Room) {
      room.join(player);
      
      return { type: 'success' };
    }
    
    return { type: 'error', message: `r̷̢̛̖͍ǫ̶̤̐͑̂ŏ̴̠̰͕̈́̇ͅṁ̶͙͖̋̃̐ ̴͉̫̩̈́̔͐d̸̟̙́̅̽ǫ̸̤̺̏̑͋͆͜e̷͕̲͕̒̅͝ș̷̰͒̏̈́ͅ ̴͕̀̏͒n̷̘̮̖̼̈̈́̚ó̵̫t̷̯̐ ̴̯̬̒ę̵̰̘͕̋̂̈͗ẍ̴̨̪͖̫́̈̎ì̷̟̦̇̽s̵̙̩͂̋ţ̷̛̫̘͔͒` };
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
    let player = this.playerList.filter(p => {
      return p.id === id;
    });
    
    if (player.length > 0) {
      return player[0];
    }
    
    return;
  }
  
  fetchIndex(id) {
    return this.playerList.findIndex(player => player.id === id);
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
      id: this.id
    };
  }
}

function createServer(io) {
  let server = new Server();
  
  io.on("connection", (socket) => {
    function fetchDetails(uid) {
      let room = server.fetchRoom(uid);

      if (room instanceof Room) {
        console.log(`${socket.id} fetched ${uid} details`);
        socket.to(uid).emit("server/room-details", room.details);
      }
    }

    function createRoom() {
      const room = new Room({ owner: socket.id });
      socket.emit("server/new-room", room.uid);
      server.mountRoom(room);
    }

    function joinRoom(uid) {
      const player = new Player({ id: socket.id });
      const response = server.join(player, uid);

      socket.join(uid);
      socket.emit("server/join-room", response);
    }

    function leaveRoom(playerID, uid) {
      let room = server.fetchRoom(uid);

      if (room instanceof Room) {
        room.leave(playerID);
        fetchDetails(uid);
      }
    }
  
  io.of("/").adapter.on("join-room", (roomID, playerID) => {
    console.log(`socket ${playerID} has joined room ${roomID}`);
    
    fetchDetails(roomID);
  });
  
  io.of("/").adapter.on("leave-room", (roomID, playerID) => {
    console.log(`socket ${playerID} has left room ${roomID}`);
    
    leaveRoom(playerID, roomID);
  });
  
  socket.on("server/new-room", function() {
    createRoom();
  });
  
  socket.on("server/room-details", function(uid) {
    fetchDetails(uid);
  });
  
  socket.on("server/player-ready", function(uid) {
    let room = server.fetchRoom(uid);
    
    if (room instanceof Room) {
      let player = room.fetchPlayer(socket.id);
      
      if (player instanceof Player) {
        player.ready = true;
        fetchDetails(uid);
      }
    }
  });
  
  socket.on("server/join-room", function(uid) {
    joinRoom(uid);
  });
  
  socket.on("disconnect", () => {
    
  });
});
}

module.exports = { createServer };