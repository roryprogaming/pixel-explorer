let game;
let keys = {};
let gameRunning = true;

window.addEventListener('load', () => {
  const canvas = document.getElementById('gameCanvas');
  game = new Game(canvas);

  document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
  });

  document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
      e.preventDefault();
      game.handleAttack(game.player.x + game.player.width / 2, game.player.y + game.player.height / 2);
    }
  });

  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    game.handleAttack(x, y);
  });

  document.getElementById('summarize-btn').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'getSummary' }, (response) => {
        if (response && response.summary) {
          document.getElementById('summary-text').textContent = response.summary;
        } else {
          document.getElementById('summary-text').textContent = 'Could not summarize this page.';
        }
      });
    });
  });

  function gameLoop() {
    game.update(keys);
    game.draw();
    updateUI();
    if (gameRunning) {
      requestAnimationFrame(gameLoop);
    }
  }

  gameLoop();
});

function updateUI() {
  document.getElementById('hp').textContent = Math.max(0, Math.floor(game.player.hp));
  document.getElementById('level').textContent = game.player.level;
  document.getElementById('gold').textContent = game.player.gold;
  document.getElementById('armor').textContent = game.player.armor || 'None';

  const inventoryList = document.getElementById('inventory-list');
  inventoryList.innerHTML = '';
  game.inventory.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item.name;
    li.style.cursor = 'pointer';
    li.addEventListener('click', () => {
      if (item.type === 'armor' || item.type === 'weapon') {
        game.player.equip(item);
        game.inventory = game.inventory.filter(i => i !== item);
      }
    });
    inventoryList.appendChild(li);
  });
}