const express = require("express");
const app = express();
const port = 3000;

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const { Game } = require("./game.js")
const io = new Server(server);

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.render("/public/index.html");
});

const game = () => {
  return { roomList: [] };
};

io.on("connection", (socket) => {
  socket.on("server/new-room", function() {
    game.newRoom();
    
    socket.emit("server/new-room", {
      roomID: "null"
    });
  });
});

server.listen(port, () => {
  console.log("listening on *:" + port);
});
