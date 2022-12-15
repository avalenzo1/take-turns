function UID() {
  return Math.random().toString(36).slice(-6).toUpperCase();
}

class Player {
  constructor({ id }) {
    this.id = id;
    this.ready = false;
  }
}

class Lobby {
  constructor() {
    this.roomList = [];
  }
  
  find(UID) {
    let room = this.roomList.filter(r => {
      return r.uid === UID;
    });
    
    if (room.length > 0) {
      return room[0];
    }
    
    return;
  }
  
  join(player, UID) {
    let room = this.find(UID);
    
    if (room instanceof Room) {
      room.join(player);
      
      return { type: 'success' };
    }
    
    return { type: 'error', message: `R̷̗̼̆̈͗͊o̷͕̬̕o̵͎̩̠͐́̉̿m̴̻͓͝ ̸̩̾Ḋ̵̛̛͓̓ö̷͚ė̶͎̞̄̓s̵̱͛̓ ̷̤͉̝́̈́̈́̌N̸͍̣̍̐ǫ̷̛̣̠̓͒ẗ̷̡͖́͒ ̵̡͖̫̉̀E̸͍̝̋̅̕ẍ̷̘́ì̶̥s̵͈͛t̴͓̻̮͝` };
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
  
  find(playerID) {
    let player = this.roomList.filter(p => {
      return p.uid === playerID;
    });
    
    if (player.length > 0) {
      return player[0];
    }
    
    return;
  }
  
  join(player) {
    if (player instanceof Player) {
      this.playerList.push(player);
    }
  }
  
  leave(player) {
    
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