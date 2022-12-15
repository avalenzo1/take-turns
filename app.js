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

const lobby = new Lobby();

// main namespace
const rooms = io.of("/").adapter.rooms;
const sids = io.of("/").adapter.sids;

io.on("connection", (socket) => {
  socket.on("server/new-room", function() {
    const room = new Room({ owner: socket.id });
    
    socket.emit("server/new-room", room.uid);
    
    lobby.mountRoom(room);
  });
  
  io.of("/").adapter.on("join-room", (room, id) => {
    console.log(`socket ${id} has joined room ${room}`);
    socket.to(room).emit("server/room-details", lobby.find(room.details));
  });
  
  socket.on("server/join-room", function(roomUID) {
    console.log(roomUID);
    
    const player = new Player({ id: socket.id });
    const response = lobby.join(player, roomUID);
    
    socket.join(roomUID);
    socket.emit("server/join-room", response);
  });
});

server.listen(port, () => {
  console.log("listening on *:" + port);
});
