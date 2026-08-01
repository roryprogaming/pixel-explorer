class Player {
  constructor() {
    this.x = 8;
    this.y = 8;
    this.width = 16;
    this.height = 16;
    this.hp = 100;
    this.maxHp = 100;
    this.level = 1;
    this.exp = 0;
    this.expToLevelUp = 100;
    this.gold = 0;
    this.armor = null;
    this.weapon = 'wooden-sword';
    this.damage = 5;
    this.speed = 2;
    this.color = '#ff0000';
  }

  equip(item) {
    if (item.type === 'armor') {
      this.armor = item.name;
      this.maxHp += item.bonus;
      this.hp = this.maxHp;
    } else if (item.type === 'weapon') {
      this.weapon = item.name;
      this.damage = item.damage;
    }
  }

  gainExp(amount) {
    this.exp += amount;
    if (this.exp >= this.expToLevelUp) {
      this.level++;
      this.exp = 0;
      this.maxHp += 20;
      this.hp = this.maxHp;
      this.damage += 2;
      this.expToLevelUp += 50;
    }
  }

  heal(amount) {
    this.hp = Math.min(this.hp + amount, this.maxHp);
  }
}

class Enemy {
  constructor(x, y, type = 'slime') {
    this.x = x;
    this.y = y;
    this.width = 16;
    this.height = 16;
    this.type = type;
    this.hp = 20;
    this.maxHp = 20;
    this.damage = 3;
    this.color = '#00aa00';
    this.exp = 10;
    this.gold = 5;
    this.speed = 1;
    this.direction = Math.random() > 0.5 ? 1 : -1;

    if (type === 'goblin') {
      this.hp = 40;
      this.maxHp = 40;
      this.damage = 5;
      this.color = '#00ff00';
      this.exp = 25;
      this.gold = 15;
      this.speed = 1.5;
    } else if (type === 'skeleton') {
      this.hp = 50;
      this.maxHp = 50;
      this.damage = 7;
      this.color = '#cccccc';
      this.exp = 35;
      this.gold = 20;
    }
  }

  update(player) {
    // Simple AI: move towards player
    if (Math.abs(this.x - player.x) > Math.abs(this.y - player.y)) {
      this.x += this.x < player.x ? this.speed : -this.speed;
    } else {
      this.y += this.y < player.y ? this.speed : -this.speed;
    }
  }

  isCollidingWith(player) {
    return this.x < player.x + player.width &&
           this.x + this.width > player.x &&
           this.y < player.y + player.height &&
           this.y + this.height > player.y;
  }
}

class Boss {
  constructor(x, y, type = 'goblin-king') {
    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 32;
    this.type = type;
    this.hp = 200;
    this.maxHp = 200;
    this.damage = 15;
    this.color = '#ff0000';
    this.exp = 200;
    this.gold = 100;
    this.speed = 1;
    this.attackCooldown = 0;
    this.phase = 1;

    if (type === 'stone-giant') {
      this.hp = 300;
      this.maxHp = 300;
      this.damage = 20;
      this.color = '#888888';
      this.exp = 300;
      this.gold = 150;
      this.width = 40;
      this.height = 40;
    }
  }

  update(player) {
    this.attackCooldown--;
    if (Math.abs(this.x - player.x) > 2) {
      this.x += this.x < player.x ? this.speed : -this.speed;
    }
    if (Math.abs(this.y - player.y) > 2) {
      this.y += this.y < player.y ? this.speed : -this.speed;
    }
  }

  isCollidingWith(player) {
    return this.x < player.x + player.width &&
           this.x + this.width > player.x &&
           this.y < player.y + player.height &&
           this.y + this.height > player.y;
  }
}

class NPC {
  constructor(x, y, name, dialogues) {
    this.x = x;
    this.y = y;
    this.width = 16;
    this.height = 16;
    this.name = name;
    this.dialogues = dialogues;
    this.color = '#ffff00';
  }

  isNear(player, distance = 40) {
    const dx = this.x - player.x;
    const dy = this.y - player.y;
    return Math.sqrt(dx * dx + dy * dy) < distance;
  }
}

class Item {
  constructor(name, type, x, y, bonus = 0, damage = 0) {
    this.name = name;
    this.type = type;
    this.x = x;
    this.y = y;
    this.width = 8;
    this.height = 8;
    this.bonus = bonus;
    this.damage = damage;
    this.color = '#ffd700';
  }
}

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.player = new Player();
    this.enemies = [];
    this.npcs = [];
    this.bosses = [];
    this.items = [];
    this.inventory = [];
    this.tileSize = 16;
    this.worldWidth = Math.floor(canvas.width / this.tileSize);
    this.worldHeight = Math.floor(canvas.height / this.tileSize);

    this.initializeWorld();
  }

  initializeWorld() {
    for (let i = 0; i < 3; i++) {
      this.enemies.push(new Enemy(
        Math.random() * (this.canvas.width - 32) + 32,
        Math.random() * (this.canvas.height - 32) + 32,
        'slime'
      ));
    }

    this.npcs.push(new NPC(50, 100, 'Blacksmith', [
      'Welcome traveler! I can upgrade your armor.',
      'Bring me gold and materials!'
    ]));

    this.npcs.push(new NPC(150, 50, 'Healer', [
      'Need healing? I can help!',
      'Come back if you are hurt.'
    ]));

    this.bosses.push(new Boss(this.canvas.width - 100, 50, 'goblin-king'));

    this.items.push(new Item('iron-armor', 'armor', 100, 150, 30));
    this.items.push(new Item('iron-sword', 'weapon', 80, 200, 0, 12));
    this.items.push(new Item('health-potion', 'potion', 120, 100));
  }

  update(keys) {
    if (keys['ArrowUp']) this.player.y = Math.max(0, this.player.y - this.player.speed);
    if (keys['ArrowDown']) this.player.y = Math.min(this.canvas.height - this.player.height, this.player.y + this.player.speed);
    if (keys['ArrowLeft']) this.player.x = Math.max(0, this.player.x - this.player.speed);
    if (keys['ArrowRight']) this.player.x = Math.min(this.canvas.width - this.player.width, this.player.x + this.player.speed);

    this.enemies.forEach((enemy, index) => {
      enemy.update(this.player);
      if (enemy.isCollidingWith(this.player)) {
        this.player.hp -= enemy.damage * 0.016;
      }
    });

    this.bosses.forEach((boss, index) => {
      boss.update(this.player);
      if (boss.isCollidingWith(this.player)) {
        this.player.hp -= boss.damage * 0.016;
      }
    });

    this.items.forEach((item, index) => {
      if (item.x < this.player.x + this.player.width &&
          item.x + item.width > this.player.x &&
          item.y < this.player.y + this.player.height &&
          item.y + item.height > this.player.y) {
        this.inventory.push(item);
        this.items.splice(index, 1);
        if (item.type === 'potion') {
          this.player.heal(50);
        }
      }
    });

    if (this.player.hp <= 0) {
      this.resetGame();
    }
  }

  handleAttack(targetX, targetY) {
    this.enemies = this.enemies.filter(enemy => {
      const dist = Math.hypot(enemy.x - targetX, enemy.y - targetY);
      if (dist < 30) {
        enemy.hp -= this.player.damage;
        if (enemy.hp <= 0) {
          this.player.gainExp(enemy.exp);
          this.player.gold += enemy.gold;
          if (Math.random() > 0.6) {
            this.items.push(new Item('coin', 'currency', enemy.x, enemy.y));
          }
          return false;
        }
      }
      return true;
    });

    this.bosses = this.bosses.filter(boss => {
      const dist = Math.hypot(boss.x - targetX, boss.y - targetY);
      if (dist < 50) {
        boss.hp -= this.player.damage * 1.5;
        if (boss.hp <= 0) {
          this.player.gainExp(boss.exp);
          this.player.gold += boss.gold;
          this.items.push(new Item('legendary-sword', 'weapon', boss.x, boss.y, 0, 30));
          return false;
        }
      }
      return true;
    });
  }

  resetGame() {
    this.player = new Player();
    this.enemies = [];
    this.initializeWorld();
  }

  draw() {
    this.ctx.fillStyle = '#87ceeb';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.strokeStyle = '#e0e0e0';
    this.ctx.lineWidth = 0.5;
    for (let i = 0; i <= this.worldWidth; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * this.tileSize, 0);
      this.ctx.lineTo(i * this.tileSize, this.canvas.height);
      this.ctx.stroke();
    }
    for (let i = 0; i <= this.worldHeight; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, i * this.tileSize);
      this.ctx.lineTo(this.canvas.width, i * this.tileSize);
      this.ctx.stroke();
    }

    this.items.forEach(item => {
      this.ctx.fillStyle = item.color;
      this.ctx.fillRect(item.x, item.y, item.width, item.height);
    });

    this.npcs.forEach(npc => {
      this.ctx.fillStyle = npc.color;
      this.ctx.fillRect(npc.x, npc.y, npc.width, npc.height);
    });

    this.enemies.forEach(enemy => {
      this.ctx.fillStyle = enemy.color;
      this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
      this.ctx.fillStyle = '#ff0000';
      this.ctx.fillRect(enemy.x, enemy.y - 5, enemy.width, 3);
      this.ctx.fillStyle = '#00ff00';
      this.ctx.fillRect(enemy.x, enemy.y - 5, (enemy.hp / enemy.maxHp) * enemy.width, 3);
    });

    this.bosses.forEach(boss => {
      this.ctx.fillStyle = boss.color;
      this.ctx.fillRect(boss.x, boss.y, boss.width, boss.height);
      this.ctx.fillStyle = '#ff0000';
      this.ctx.fillRect(boss.x, boss.y - 10, boss.width, 5);
      this.ctx.fillStyle = '#00ff00';
      this.ctx.fillRect(boss.x, boss.y - 10, (boss.hp / boss.maxHp) * boss.width, 5);
      this.ctx.fillStyle = '#000000';
      this.ctx.font = '10px Arial';
      this.ctx.fillText(boss.type, boss.x, boss.y + boss.height + 15);
    });

    this.ctx.fillStyle = this.player.color;
    this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

    this.ctx.fillStyle = '#ff0000';
    this.ctx.fillRect(this.player.x, this.player.y - 10, this.player.width, 3);
    this.ctx.fillStyle = '#00ff00';
    this.ctx.fillRect(this.player.x, this.player.y - 10, (this.player.hp / this.player.maxHp) * this.player.width, 3);
  }
}