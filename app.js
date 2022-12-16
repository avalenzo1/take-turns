const express = require("express");
const app = express();
const port = 3000;

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const { Lobby, Room, Player } = require("./game.js")
const io = new Server(server);

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.render("/public/index.html");
});

const lobby = new Lobby(io);

io.on("connection", (socket) => {
  function fetchDetails(uid) {
    let room = lobby.fetchRoom(uid);
    
    if (room instanceof Room) {
      console.log(`${socket.id} fetched ${uid} details`);
      socket.to(uid).emit("server/room-details", room.details);
    }
  }
  
  function createRoom() {
    const room = new Room({ owner: socket.id });
    socket.emit("server/new-room", room.uid);
    lobby.mountRoom(room);
  }
  
  function joinRoom(uid) {
    const player = new Player({ id: socket.id });
    const response = lobby.join(player, uid);
    
    socket.join(uid);
    socket.emit("server/join-room", response);
  }
  
  function leaveRoom(playerID, uid) {
    let room = lobby.fetchRoom(uid);
    
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
    let room = lobby.fetchRoom(uid);
    
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

server.listen(port, () => {
  console.log("listening on *:" + port);
});
