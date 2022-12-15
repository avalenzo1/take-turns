const express = require("express");
const app = express();
const port = 3000;

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const { Lobby, Room } = require("./game.js")
const io = new Server(server);

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.render("/public/index.html");
});

const lobby = new Lobby();

io.on("connection", (socket) => {
  socket.on("server/new-room", function() {
    const room = new Room({ owner: socket.id });
    
    socket.emit("server/new-room", room.details);
    
    lobby.mountRoom(room);
  });
});

server.listen(port, () => {
  console.log("listening on *:" + port);
});
