const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const enemy = {
  width: 15, // Reduced from 30
  height: 10, // Reduced from 20
  color: 'red',
};

const enemies = [];
const enemyRowCount = 3;
const enemyColumnCount = 5;
const enemyPadding = 10;
const enemyOffsetTop = -50; // Start enemies 50 pixels above the canvas

const enemyOffsetLeft = 30;

function createEnemies() {
  const totalEnemiesWidth =
    enemyColumnCount * enemy.width + (enemyColumnCount - 1) * enemyPadding;
  const startX = (canvas.width - totalEnemiesWidth) / 2;

  for (let row = 0; row < enemyRowCount; row++) {
    enemies[row] = [];
    for (let column = 0; column < enemyColumnCount; column++) {
      const x = startX + column * (enemy.width + enemyPadding);
      const y = row * (enemy.height + enemyPadding) + enemyOffsetTop;
      enemies[row][column] = { x, y, ...enemy };
    }
  }
}

createEnemies();

let bullets = [];

const bulletWidth = 5;
const bulletHeight = 10;
const bulletSpeed = 5;
const bulletColor = 'green';

function updateBullets() {
  for (let i = 0; i < bullets.length; i++) {
    bullets[i].y -= bulletSpeed;
  }
  bullets = bullets.filter((bullet) => bullet.y + bullet.height > 0); // Remove bullets that are off-screen
}

function drawBullets() {
  for (let bullet of bullets) {
    ctx.fillStyle = bullet.color;
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  }
}

function fireBullet(x, y) {
  bullets.push({
    x,
    y,
    width: bulletWidth,
    height: bulletHeight,
    color: bulletColor,
  });
}

const ship = {
  x: canvas.width / 2,
  y: canvas.height - 60,
  width: 25, // Reduced from 50
  height: 15, // Reduced from 30
  color: 'blue',
};

function drawShip() {
  ctx.fillStyle = ship.color;
  ctx.fillRect(ship.x, ship.y, ship.width, ship.height);
}

function checkCollisions() {
  for (let b = bullets.length - 1; b >= 0; b--) {
    let bullet = bullets[b];
    for (let row = 0; row < enemies.length; row++) {
      for (let column = 0; column < enemies[row].length; column++) {
        let enemy = enemies[row][column];
        if (
          bullet.x < enemy.x + enemy.width &&
          bullet.x + bullet.width > enemy.x &&
          bullet.y < enemy.y + enemy.height &&
          bullet.y + bullet.height > enemy.y
        ) {
          // Collision detected
          bullets.splice(b, 1);
          enemies[row].splice(column, 1);
          updateScore(10); // Add 10 points for each enemy destroyed, adjust as needed

          break; // Exit the loop after collision
        }
      }
    }
  }
}

function areAllEnemiesCleared() {
  for (let row = 0; row < enemies.length; row++) {
    for (let column = 0; column < enemies[row].length; column++) {
      if (enemies[row][column].y <= 200) {
        // If any enemy is still at or above y = 200, return false
        return false;
      }
    }
  }
  // If all enemies are below y = 200, return true
  return true;
}

function drawEnemies() {
  for (let row = 0; row < enemies.length; row++) {
    for (let column = 0; column < enemies[row].length; column++) {
      let currentEnemy = enemies[row][column];
      ctx.fillStyle = currentEnemy.color;
      ctx.fillRect(
        currentEnemy.x,
        currentEnemy.y,
        currentEnemy.width,
        currentEnemy.height
      );
    }
  }
}
function updateEnemyPositions() {
  for (let row = 0; row < enemies.length; row++) {
    for (let column = 0; column < enemies[row].length; column++) {
      enemies[row][column].y += 1;
    }
  }
}

function checkEnemyCollision() {
  for (let row = 0; row < enemies.length; row++) {
    for (let column = 0; column < enemies[row].length; column++) {
      let enemy = enemies[row][column];
      if (
        ship.x < enemy.x + enemy.width &&
        ship.x + ship.width > enemy.x &&
        ship.y < enemy.y + enemy.height &&
        ship.y + ship.height > enemy.y
      ) {
        // Collision detected
        return true;
      }
    }
  }
  return false;
}

let isPaused = false;

let score = 0;
let highScore = localStorage.getItem('highScore') || 0;

function updateScore(points) {
  score += points;
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('highScore', highScore);
  }
}

function drawScores() {
  ctx.font = '10px Arial'; // Even smaller font size
  ctx.fillStyle = '#000'; // Black color for the tex.  t

  ctx.fillText('Score: ' + score, 10, 20);
  ctx.fillText('High Score: ' + highScore, 10, 40);
}

function resetGame() {
  // Reset player ship position
  ship.x = canvas.width / 2;
  ship.y = canvas.height - 60;
  score = 0;

  // Clear bullets
  bullets = [];

  // Recreate enemies
  createEnemies();
}

function gameLoop() {
  if (!isPaused) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (areAllEnemiesCleared()) {
      console.log('All enemies cleared, respawning...');
      createEnemies(); // Respawn enemies
    }

    if (checkEnemyCollision()) {
      resetGame();
    }

    updateEnemyPositions();
    updateBullets();
    checkCollisions();

    drawShip();
    drawEnemies();
    drawBullets();
    drawScores();

    requestAnimationFrame(gameLoop);
  }
}

gameLoop();

document.addEventListener('keydown', function (event) {
  const moveStep = 10; // Adjust the movement step as needed
  if (event.key === 'ArrowLeft') {
    ship.x -= moveStep; // Move left
  } else if (event.key === 'ArrowRight') {
    ship.x += moveStep; // Move right
  } else if (event.key === 'ArrowUp') {
    ship.y -= moveStep; // Move up
  } else if (event.key === 'ArrowDown') {
    ship.y += moveStep; // Move down
  }

  if (event.key === 'p' || event.key === 'P') {
    // 'P' key for pause and resume
    isPaused = !isPaused;

    if (!isPaused) {
      requestAnimationFrame(gameLoop);
    }
  }

  if (event.key === ' ') {
    // Assuming the ship has a property x at its center
    fireBullet(ship.x + ship.width / 2 - bulletWidth / 2, ship.y);
  }

  // Keep the ship within the canvas boundaries
  ship.x = Math.max(0, Math.min(canvas.width - ship.width, ship.x));
  ship.y = Math.max(0, Math.min(canvas.height - ship.height, ship.y));
});
