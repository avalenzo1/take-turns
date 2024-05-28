import { Application, Frame, _Object } from "./atom.js";

function isTouchDevice() {
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.msMaxTouchPoints > 0
  );
}

class Client {
  constructor(socket) {
    this.socket = socket;
    this.room = undefined;
  }

  createInstance() {
    this.socket.on("Room/Player/Join", (room) => {
      this.room = room;

      console.log(room);
    });

    this.socket.on("Room/Player/Leave", () => {
      this.room = undefined;
    });

    this.socket.on("Room/Details", (details) => {
      this.details = details;
    });
  }

  createStream(view) {
    const viewport = document.getElementById("game-view/viewport");
    const container = document.getElementById("game-view/canvas-container");
    const strokeColor = document.getElementById("game-view/stroke-color"); // Input element for picking color
    const fillColor = document.getElementById("game-view/fill-color"); // Input element for picking color
    const clearCanvas = document.getElementById("game-view/clear-canvas"); 
    
    const app = new Application({
      id: "game-view/canvas",
      width: 640,
      height: 640,
    });
    const stage = new Frame({
      app,
      x: 0,
      y: 0,
      w: app.view.width,
      h: app.view.height,
      backgroundColor: "#fff",
    });

    container.innerHTML = "";

    strokeColor.oninput = () => {
      client.style.strokeStyle = strokeColor.value;
    };
    
    fillColor.oninput = () => {
      client.style.fillStyle = fillColor.value;
    };
    
    clearCanvas.onclick = () => {
      this.socket.emit("Room/Canvas/Clear");
    }

    const client = {
      buffer: [],
      active: false,
      style: {
        fillStyle: "transparent",
        strokeStyle: "black",
        lineWidth: 5,
      },
      x: 0,
      y: 0,
    };

    const startClient = (e) => {
      client.active = true;
      updateClient(e);

      this.socket.emit("Room/Draw/Start", client);
    };

    const updateClient = (e) => {
      e.preventDefault();

      const boundingClientRect = app.view.getBoundingClientRect();

      if (e.clientX || e.clientY) {
        client.x = e.clientX;
        client.y = e.clientY;
        
        client.x -= boundingClientRect.left;
        client.y -= boundingClientRect.top;
      }

      if (e.touches) {
        client.x = e.touches[0].clientX;
        client.y = e.touches[0].clientY;
        
        console.log(client);
      }

      client.buffer.push([client.x, client.y]);
    };

    const endClient = (e) => {
      client.active = false;
      client.buffer = [];

      this.socket.emit("Room/Draw/End", client);

      console.log(client);
    };

    this.socket.on("Room/Draw/Move", () => {
      this.socket.emit("Room/Draw/Move", client);

      client.buffer = [];
    });

    this.socket.on("Room/Canvas/Sync", (canvas) => {
      stage.objectList = [];

      console.log(canvas);

      for (let client of canvas.paths) {
        let path = new Path2D();

        console.log(path);
        console.log(client);

        if (client.path.length > 2) {
          for (let i = 0; i < client.path.length; i++) {
            path[client.path[i].type](
              client.path[i].point[0],
              client.path[i].point[1]
            );
          }
        }

        let object = new _Object({ id: client.id, path, style: client.style });
        stage.appendObject(object);
      }
      
      stage.render();
    });

    this.socket.on("Room/Canvas/Update", (canvas) => {
      for (let client of canvas.paths) {
        let path = new Path2D();
        
        console.log("Room/Canvas/Update")
        
        stage.removeObjectById(client.id);

        if (client.path.length > 2) {
          for (let i = 0; i < client.path.length; i++) {
            path[client.path[i].type](
              client.path[i].point[0],
              client.path[i].point[1]
            );
          }
        }

        let object = new _Object({ id: client.id, path, style: client.style });
        stage.appendObject(object);
      }
      
      stage.render();
    });

    app.view.onmousedown = (e) => {
      startClient(e);
    };

    app.view.onmousemove = (e) => {
      if (client.active) updateClient(e);
    };

    app.view.onmouseup = (e) => {
      endClient(e);
    };

    app.view.ontouchstart = (e) => {
      startClient(e);
    };

    app.view.ontouchmove = (e) => {
      if (client.active) updateClient(e);
    };

    app.view.ontouchend = (e) => {
      endClient(e);
    };

    app.view.classList.add("t-canvas");
    container.appendChild(app.view);
  }

  parseURL() {
    const params = new Proxy(new URLSearchParams(window.location.search), {
      get: (searchParams, prop) => searchParams.get(prop),
    });
    
    const id = params.join;

    if (id) {
      this.socket.emit("Room/Player/Join", id);
      
      
    }
  }
}

function createClient(socket) {
  const client = new Client(socket);

  client.createInstance();
  client.parseURL();

  return client;
}

export { createClient };
