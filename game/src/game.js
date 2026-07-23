(() => {
  const COLS = 10;
  const ROWS = 20;
  const BLOCK = 24;

  const canvas = document.getElementById('board');
  const ctx = canvas.getContext('2d');
  const nextCanvas = document.getElementById('nextCanvas');
  const nextCtx = nextCanvas.getContext('2d');

  const scoreEl = document.getElementById('score');
  const linesEl = document.getElementById('lines');
  const levelEl = document.getElementById('level');
  const overlay = document.getElementById('overlay');
  const overlayText = document.getElementById('overlayText');
  const overlayBtn = document.getElementById('overlayBtn');
  const restartBtn = document.getElementById('restartBtn');

  const COLORS = {
    I: '#4dd0e1',
    J: '#4d5bce',
    L: '#ffa94d',
    O: '#ffd54d',
    S: '#69db7c',
    T: '#cc5de8',
    Z: '#ff6b6b'
  };

  const SHAPES = {
    I: [
      [0,0,0,0],
      [1,1,1,1],
      [0,0,0,0],
      [0,0,0,0]
    ],
    J: [
      [1,0,0],
      [1,1,1],
      [0,0,0]
    ],
    L: [
      [0,0,1],
      [1,1,1],
      [0,0,0]
    ],
    O: [
      [1,1],
      [1,1]
    ],
    S: [
      [0,1,1],
      [1,1,0],
      [0,0,0]
    ],
    T: [
      [0,1,0],
      [1,1,1],
      [0,0,0]
    ],
    Z: [
      [1,1,0],
      [0,1,1],
      [0,0,0]
    ]
  };

  const TYPES = Object.keys(SHAPES);

  function rotateMatrix(m) {
    const n = m.length;
    const res = [];
    for (let y = 0; y < n; y++) {
      res.push([]);
      for (let x = 0; x < n; x++) {
        res[y][x] = m[n - 1 - x][y];
      }
    }
    return res;
  }

  function randomType() {
    return TYPES[Math.floor(Math.random() * TYPES.length)];
  }

  function newPiece(type) {
    return {
      type,
      matrix: SHAPES[type].map(row => row.slice()),
      x: Math.floor((COLS - SHAPES[type].length) / 2),
      y: -2
    };
  }

  let board, current, next, score, lines, level, dropInterval, dropTimer, lastTime;
  let gameOver = false;
  let paused = false;
  let running = false;

  function createBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  }

  function resetGame() {
    board = createBoard();
    score = 0;
    lines = 0;
    level = 1;
    dropInterval = 600;
    dropTimer = 0;
    lastTime = 0;
    gameOver = false;
    paused = false;
    current = newPiece(randomType());
    next = newPiece(randomType());
    updateStats();
    overlay.classList.remove('show');
  }

  function updateStats() {
    scoreEl.textContent = score;
    linesEl.textContent = lines;
    levelEl.textContent = level;
  }

  function collides(matrix, offX, offY) {
    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        if (!matrix[y][x]) continue;
        const bx = x + offX;
        const by = y + offY;
        if (bx < 0 || bx >= COLS || by >= ROWS) return true;
        if (by >= 0 && board[by][bx]) return true;
      }
    }
    return false;
  }

  function merge() {
    const { matrix, x: offX, y: offY, type } = current;
    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        if (matrix[y][x]) {
          const by = y + offY;
          const bx = x + offX;
          if (by >= 0) board[by][bx] = type;
        }
      }
    }
  }

  function clearLines() {
    let cleared = 0;
    for (let y = ROWS - 1; y >= 0; y--) {
      if (board[y].every(cell => cell)) {
        board.splice(y, 1);
        board.unshift(Array(COLS).fill(null));
        cleared++;
        y++;
      }
    }
    if (cleared > 0) {
      const points = [0, 100, 300, 500, 800][cleared] || 800;
      score += points * level;
      lines += cleared;
      const newLevel = Math.floor(lines / 10) + 1;
      if (newLevel !== level) {
        level = newLevel;
        dropInterval = Math.max(100, 600 - (level - 1) * 70);
      }
      updateStats();
    }
  }

  function spawnNext() {
    current = next;
    current.x = Math.floor((COLS - current.matrix.length) / 2);
    current.y = -2;
    next = newPiece(randomType());
    if (collides(current.matrix, current.x, current.y + 1) && collides(current.matrix, current.x, current.y)) {
      triggerGameOver();
    }
  }

  function triggerGameOver() {
    gameOver = true;
    running = false;
    overlayText.textContent = 'GAME OVER';
    overlay.classList.add('show');
  }

  function hardDrop() {
    while (!collides(current.matrix, current.x, current.y + 1)) {
      current.y++;
    }
    lockPiece();
  }

  function lockPiece() {
    merge();
    clearLines();
    spawnNext();
    dropTimer = 0;
  }

  function move(dx) {
    if (!collides(current.matrix, current.x + dx, current.y)) {
      current.x += dx;
    }
  }

  function softDrop() {
    if (!collides(current.matrix, current.x, current.y + 1)) {
      current.y++;
      score += 1;
      updateStats();
    } else {
      lockPiece();
    }
  }

  function rotate() {
    const rotated = rotateMatrix(current.matrix);
    const kicks = [0, -1, 1, -2, 2];
    for (const k of kicks) {
      if (!collides(rotated, current.x + k, current.y)) {
        current.matrix = rotated;
        current.x += k;
        return;
      }
    }
  }

  function drawCell(c, x, y, color) {
    const px = x * BLOCK;
    const py = y * BLOCK;
    c.fillStyle = color;
    c.fillRect(px, py, BLOCK, BLOCK);
    c.strokeStyle = 'rgba(0,0,0,0.35)';
    c.lineWidth = 2;
    c.strokeRect(px + 1, py + 1, BLOCK - 2, BLOCK - 2);
    c.fillStyle = 'rgba(255,255,255,0.2)';
    c.fillRect(px + 2, py + 2, BLOCK - 4, 4);
  }

  function getGhostY() {
    let gy = current.y;
    while (!collides(current.matrix, current.x, gy + 1)) gy++;
    return gy;
  }

  function draw() {
    ctx.fillStyle = '#0f0f1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * BLOCK, 0);
      ctx.lineTo(x * BLOCK, ROWS * BLOCK);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * BLOCK);
      ctx.lineTo(COLS * BLOCK, y * BLOCK);
      ctx.stroke();
    }

    // placed blocks
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const cell = board[y][x];
        if (cell) drawCell(ctx, x, y, COLORS[cell]);
      }
    }

    // ghost
    if (!gameOver) {
      const gy = getGhostY();
      const { matrix, x: offX } = current;
      ctx.globalAlpha = 0.25;
      for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[y].length; x++) {
          if (matrix[y][x]) {
            const by = gy + y;
            if (by >= 0) drawCell(ctx, offX + x, by, COLORS[current.type]);
          }
        }
      }
      ctx.globalAlpha = 1;

      // current piece
      for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[y].length; x++) {
          if (matrix[y][x]) {
            const by = current.y + y;
            if (by >= 0) drawCell(ctx, offX + x, by, COLORS[current.type]);
          }
        }
      }
    }

    drawNext();
  }

  function drawNext() {
    nextCtx.fillStyle = '#0f0f1a';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    const m = next.matrix;
    const size = m.length;
    const blockSize = 20;
    const offsetX = (nextCanvas.width - size * blockSize) / 2;
    const offsetY = (nextCanvas.height - size * blockSize) / 2;
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (m[y][x]) {
          const px = offsetX + x * blockSize;
          const py = offsetY + y * blockSize;
          nextCtx.fillStyle = COLORS[next.type];
          nextCtx.fillRect(px, py, blockSize, blockSize);
          nextCtx.strokeStyle = 'rgba(0,0,0,0.35)';
          nextCtx.strokeRect(px + 1, py + 1, blockSize - 2, blockSize - 2);
        }
      }
    }
  }

  function loop(time = 0) {
    if (!running) return;
    const delta = time - lastTime;
    lastTime = time;
    if (!paused && !gameOver) {
      dropTimer += delta;
      if (dropTimer > dropInterval) {
        dropTimer = 0;
        if (!collides(current.matrix, current.x, current.y + 1)) {
          current.y++;
        } else {
          lockPiece();
        }
      }
      draw();
    } else if (paused) {
      draw();
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fff';
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    }
    requestAnimationFrame(loop);
  }

  function startGame() {
    resetGame();
    running = true;
    lastTime = performance.now();
    requestAnimationFrame(loop);
  }

  document.addEventListener('keydown', (e) => {
    if (gameOver && e.code !== 'KeyP') return;
    switch (e.code) {
      case 'ArrowLeft':
        e.preventDefault();
        if (!paused) move(-1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (!paused) move(1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!paused) softDrop();
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!paused) rotate();
        break;
      case 'Space':
        e.preventDefault();
        if (!paused) hardDrop();
        break;
      case 'KeyP':
        e.preventDefault();
        if (!gameOver) paused = !paused;
        break;
    }
    if (!paused) draw();
  });

  restartBtn.addEventListener('click', startGame);
  overlayBtn.addEventListener('click', startGame);

  startGame();
})();
