function UID() {
  return Math.random().toString(36).slice(-6).toUpperCase();
}

class Player {
  constructor({ uid }) {
    this.uid = uid;
  }
  
  
}

class Lobby {
  constructor() {
    this.roomList = [];
  }
  
  join(player, UID) {
    
  }
  
  mountRoom(room) {
    this.roomList.push(room);
  }
}

class Room {
  constructor({ owner }) {
    this.uid = UID();
    this.owner = owner;
    this.playerList = [];
    this.insession = false;
    this.timeout = 2500;
  }
  
  get details() {
    return { playerList: this.playerList };
  }
}

module.exports = { Lobby, Room, Player };