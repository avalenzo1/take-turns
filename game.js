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

class Lobby {
  constructor(io) {
    this.io = io;
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
    this.uid = UID();
    this.owner = owner;
    this.playerList = [];
    this.insession = false;
    this.timeout = 2500;
  }
  
  fetchPlayer(id) {
    let player = this.playerList.filter(p => {
      return p.uid === UID;
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
      uid: this.uid
    };
  }
}

module.exports = { Lobby, Room, Player };