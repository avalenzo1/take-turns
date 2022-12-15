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

io.on("connection", (socket) => {
  socket.on("server/new-room", function() {
    const room = new Room({ owner: socket.id });
    
    socket.emit("server/new-room", room.uid);
    
    lobby.mountRoom(room);
  });
  
  socket.on("server/join-room", function(roomUID) {
    const player = new Player({ id: socket.id });
    
    switch (lobby.join(player, roomUID)) {
      case 'success':
        socket.emit("server/join-room", { type: 'success' });
        break;
      case 'error':
        socket.emit("server/join-room", { type: 'error' });
        break;
    }
    
    
  });
});

server.listen(port, () => {
  console.log("listening on *:" + port);
});
