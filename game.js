function UID() {
  return Math.random().toString(36).slice(-6).toUpperCase();
}

class Player {
  constructor({ id }) {
    this.id = id;
  }
}

class Lobby {
  constructor() {
    this.roomList = [];
  }
  
  join(player, UID) {
    let room = this.roomList.filter(r => {
      return r.uid === UID;
    });
    
    if (room instanceof Room) {
      room.join(player);
      return 'success';
    }
    
    return 'error';
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
  
  join(player) {
    if (player instanceof Player) {
      this.playerList.push(player);
    }
  }
  
  get details() {
    return { playerList: this.playerList };
  }
}

module.exports = { Lobby, Room, Player };