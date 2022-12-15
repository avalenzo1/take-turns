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
    
    if (room.length === 0) {
      return { type: 'error', message: 'Room Does Not Exist' };
    }
    
    if (room[0] instanceof Room) {
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