const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// --- GAME SETTINGS (MAFIA/AZTEC PHYSICS) ---
const FPS = 60;
// Rubber ball on rough stone stops much faster than a light leather ball on grass
const FRICTION = 0.94;
// Solid hot rubber doesn't bounce as easily as an air-filled ball
const BOUNCE = 0.5;
// It takes more effort to push the heavy ball
const KICK_POWER = 15;

// --- ENTITIES ---
const player = {
    x: 100,
    y: canvas.height / 2,
    radius: 20,
    color: '#8b0000', // Blood Red / Sacrifice Theme
    outline: '#d4af37', // Gold 
    speed: 4, // Slightly slower, heavier movement
    vx: 0,
    vy: 0
};

const enemy = {
    x: canvas.width - 100,
    y: canvas.height / 2,
    radius: 20,
    color: '#1a4e66', // Deep Blue/Teal (Rival faction)
    outline: '#c0c0c0', // Silver
    speed: 3.5, // AI is slightly slower to give human an edge
    vx: 0,
    vy: 0
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 14, // Slightly larger
    color: '#2a2a2a', // Dark heavy rubber / Obsidian
    outline: '#111',
    vx: 0,
    vy: 0,
    mass: 5 // 5x heavier than the previous prototype
};

const score = {
    player: 0,
    enemy: 0
};

// --- INPUT HANDLING ---
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    w: false,
    a: false,
    s: false,
    d: false
};

window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
});

// --- PHYSICS ENGINE ---

function updatePlayer() {
    player.vx = 0;
    player.vy = 0;

    if (keys.ArrowUp || keys.w) player.vy = -player.speed;
    if (keys.ArrowDown || keys.s) player.vy = player.speed;
    if (keys.ArrowLeft || keys.a) player.vx = -player.speed;
    if (keys.ArrowRight || keys.d) player.vx = player.speed;

    // Apply movement
    player.x += player.vx;
    player.y += player.vy;

    // Boundary constraints (Keep player inside Aztec court)
    if (player.x - player.radius < 0) player.x = player.radius;
    if (player.x + player.radius > canvas.width) player.x = canvas.width - player.radius;
    if (player.y - player.radius < 0) player.y = player.radius;
    if (player.y + player.radius > canvas.height) player.y = canvas.height - player.radius;
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.vx = 0;
    ball.vy = 0;

    // Reset players too to avoid immediate re-scoring
    player.x = 100;
    player.y = canvas.height / 2;
    player.vx = 0;
    player.vy = 0;

    enemy.x = canvas.width - 100;
    enemy.y = canvas.height / 2;
    enemy.vx = 0;
    enemy.vy = 0;
}

function updateBall() {
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Heavy Friction 
    ball.vx *= FRICTION;
    ball.vy *= FRICTION;

    if (Math.abs(ball.vx) < 0.1) ball.vx = 0;
    if (Math.abs(ball.vy) < 0.1) ball.vy = 0;

    // --- Court Walls Collision & Scoring ---
    // Left Wall (Enemy Hoop)
    if (ball.x - ball.radius < 0) {
        // Check if ball is inside the Left Hoop area (y: center +- hoop radius)
        if (ball.y > canvas.height / 2 - 30 && ball.y < canvas.height / 2 + 30) {
            score.enemy++;
            resetBall();
            return;
        } else {
            ball.x = ball.radius;
            ball.vx = -ball.vx * BOUNCE;
        }
    }
    // Right Wall (Player Hoop)
    else if (ball.x + ball.radius > canvas.width) {
        if (ball.y > canvas.height / 2 - 30 && ball.y < canvas.height / 2 + 30) {
            score.player++;
            resetBall();
            return;
        } else {
            ball.x = canvas.width - ball.radius;
            ball.vx = -ball.vx * BOUNCE;
        }
    }

    // Top and Bottom Walls
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy = -ball.vy * BOUNCE;
    } else if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius;
        ball.vy = -ball.vy * BOUNCE;
    }
}

function updateEnemy() {
    // Simple AI: Calculate angle to the ball and move towards it
    const dx = ball.x - enemy.x;
    const dy = ball.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Only chase if the ball is reasonably close to give the player some breathing room
    // or if the ball is on their half of the court.
    if (ball.x > canvas.width / 3) {
        const angle = Math.atan2(dy, dx);

        // Add a bit of jitter to AI movement so it's not perfectly precise
        const jitterX = (Math.random() - 0.5) * 0.5;
        const jitterY = (Math.random() - 0.5) * 0.5;

        enemy.vx = Math.cos(angle) * enemy.speed + jitterX;
        enemy.vy = Math.sin(angle) * enemy.speed + jitterY;

        enemy.x += enemy.vx;
        enemy.y += enemy.vy;
    } else {
        // Retreat to defense position
        const targetX = canvas.width - 150;
        const targetY = canvas.height / 2;
        const ddx = targetX - enemy.x;
        const ddy = targetY - enemy.y;
        const dDist = Math.sqrt(ddx * ddx + ddy * ddy);

        if (dDist > 5) {
            const angle = Math.atan2(ddy, ddx);
            enemy.vx = Math.cos(angle) * (enemy.speed * 0.6);
            enemy.vy = Math.sin(angle) * (enemy.speed * 0.6);
            enemy.x += enemy.vx;
            enemy.y += enemy.vy;
        } else {
            enemy.vx = 0;
            enemy.vy = 0;
        }
    }

    // Keep enemy inside boundaries
    if (enemy.x - enemy.radius < 0) enemy.x = enemy.radius;
    if (enemy.x + enemy.radius > canvas.width) enemy.x = canvas.width - enemy.radius;
    if (enemy.y - enemy.radius < 0) enemy.y = enemy.radius;
    if (enemy.y + enemy.radius > canvas.height) enemy.y = canvas.height - enemy.radius;
}

function detectCollisions() {
    // 1. Player hits Ball
    let dx = ball.x - player.x;
    let dy = ball.y - player.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < player.radius + ball.radius) {
        const angle = Math.atan2(dy, dx);
        const overlap = (player.radius + ball.radius) - distance;
        ball.x += Math.cos(angle) * overlap;
        ball.y += Math.sin(angle) * overlap;

        let speedMag = Math.sqrt(player.vx * player.vx + player.vy * player.vy);
        if (speedMag === 0) speedMag = 1.5;

        const force = (KICK_POWER * (speedMag / player.speed)) / ball.mass;
        ball.vx = Math.cos(angle) * force * 4;
        ball.vy = Math.sin(angle) * force * 4;
    }

    // 2. Enemy hits Ball
    dx = ball.x - enemy.x;
    dy = ball.y - enemy.y;
    distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < enemy.radius + ball.radius) {
        const angle = Math.atan2(dy, dx);
        const overlap = (enemy.radius + ball.radius) - distance;
        ball.x += Math.cos(angle) * overlap;
        ball.y += Math.sin(angle) * overlap;

        let speedMag = Math.sqrt(enemy.vx * enemy.vx + enemy.vy * enemy.vy);
        if (speedMag === 0) speedMag = 1.5;

        // AI kicks slightly weaker than player
        const force = ((KICK_POWER - 2) * (speedMag / enemy.speed)) / ball.mass;
        ball.vx = Math.cos(angle) * force * 4;
        ball.vy = Math.sin(angle) * force * 4;
    }

    // 3. Player hits Enemy (Physical Block)
    dx = enemy.x - player.x;
    dy = enemy.y - player.y;
    distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < player.radius + enemy.radius) {
        // Calculate collision response so they push each other and don't overlap
        const angle = Math.atan2(dy, dx);
        const overlap = (player.radius + enemy.radius) - distance;

        // Push both equally in opposite directions
        player.x -= Math.cos(angle) * (overlap / 2);
        player.y -= Math.sin(angle) * (overlap / 2);
        enemy.x += Math.cos(angle) * (overlap / 2);
        enemy.y += Math.sin(angle) * (overlap / 2);

        // Simple momentum kill on crash
        player.vx *= 0.5;
        player.vy *= 0.5;
        enemy.vx *= 0.5;
        enemy.vy *= 0.5;
    }
}


// --- RENDER ENGINE ---

function drawCourt() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Ritual Markings (Faded Blood/Gold lines)
    ctx.strokeStyle = "rgba(139, 0, 0, 0.3)"; // Faded dark red
    ctx.lineWidth = 6;

    // Center divider
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();

    // Center Ritual Circle (Sun Disk)
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 80, 0, Math.PI * 2);
    ctx.stroke();

    // Inner Sun Rays
    for (let i = 0; i < 8; i++) {
        const angle = (Math.PI / 4) * i;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 + Math.cos(angle) * 20, canvas.height / 2 + Math.sin(angle) * 20);
        ctx.lineTo(canvas.width / 2 + Math.cos(angle) * 80, canvas.height / 2 + Math.sin(angle) * 80);
        ctx.stroke();
    }

    // Draw the Aztec Hoops (Tlachtemalacatl) on the sides
    ctx.strokeStyle = "#d4af37"; // Gold hoops
    ctx.lineWidth = 8;

    // Left Hoop (Player defends this, AI attacks it)
    ctx.beginPath();
    ctx.arc(40, canvas.height / 2, 30, Math.PI / 2, Math.PI * 1.5, true);
    ctx.stroke();
    ctx.fillStyle = "#111"; // Hole
    ctx.fill();

    // Right Hoop (AI defends this, Player attacks it)
    ctx.beginPath();
    ctx.arc(canvas.width - 40, canvas.height / 2, 30, Math.PI / 2, Math.PI * 1.5, false);
    ctx.stroke();
    ctx.fill();

    // Draw Scoreboard
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(canvas.width / 2 - 80, 20, 160, 50);
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 2;
    ctx.strokeRect(canvas.width / 2 - 80, 20, 160, 50);

    ctx.fillStyle = "#d4af37";
    ctx.font = "bold 24px Georgia";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // Templo Rojo (Player) vs Templo Azul (AI)
    ctx.fillText(`${score.player}  -  ${score.enemy}`, canvas.width / 2, 45);
}

function drawEntity(obj) {
    ctx.beginPath();
    ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2);
    ctx.fillStyle = obj.color;
    ctx.fill();

    if (obj.outline) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = obj.outline;
        ctx.stroke();
    }
    ctx.closePath();

    // Ritual Shadow
    ctx.beginPath();
    ctx.arc(obj.x - 3, obj.y - 3, obj.radius * 0.9, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fill();
    ctx.closePath();
}

function drawGame() {
    drawCourt();
    drawEntity(player);
    drawEntity(enemy);
    drawEntity(ball);
}

// --- MAIN LOOP ---

function gameLoop() {
    updatePlayer();
    updateEnemy();
    updateBall();
    detectCollisions();
    drawGame();

    requestAnimationFrame(gameLoop);
}

// Start Game
requestAnimationFrame(gameLoop);
