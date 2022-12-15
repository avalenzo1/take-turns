class Lobby {
  constructor() {
    this.roomList = [];
  }
  
  mountRoom(room) {
    this.roomList.push(room);
  }
}

class Room {
  constructor({ owner }) {
    this.owner = owner;
    this.insession = false;
  }
}

module.exports = { Lobby, Room };