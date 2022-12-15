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
  
  find(uid) {
    return this.roomList.map(room => room.uid).indexOf(uid);
  }
  
  leave(player, uid) {
    let i = this.find(uid);
    
    if (this.roomList[i] instanceof Room) {
      this.roomList[i].leave(player);
    }
  }
  
  join(player, uid) {
    let i = this.find(uid);
    
    if (this.roomList[i] instanceof Room) {
      this.roomList[i].join(player);
      
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
  
  find(id) {
    return this.playerList.map(player => player.id).indexOf(id);
  }
  
  join(player) {
    if (player instanceof Player) {
      this.playerList.push(player);
    }
  }
  
  leave(player) {
    let i = this.find(player.id);
    
    console.log(i);
    
    delete this.playerList[i];
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