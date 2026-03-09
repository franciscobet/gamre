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

function updateBall() {
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Heavy Friction 
    ball.vx *= FRICTION;
    ball.vy *= FRICTION;

    if (Math.abs(ball.vx) < 0.1) ball.vx = 0;
    if (Math.abs(ball.vy) < 0.1) ball.vy = 0;

    // --- Court Walls Collision (Heavy Thuds) ---
    if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
        ball.vx = -ball.vx * BOUNCE;
    } else if (ball.x + ball.radius > canvas.width) {
        ball.x = canvas.width - ball.radius;
        ball.vx = -ball.vx * BOUNCE;
    }

    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy = -ball.vy * BOUNCE;
    } else if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius;
        ball.vy = -ball.vy * BOUNCE;
    }
}

function detectCollisions() {
    const dx = ball.x - player.x;
    const dy = ball.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < player.radius + ball.radius) {
        const angle = Math.atan2(dy, dx);

        const overlap = (player.radius + ball.radius) - distance;
        ball.x += Math.cos(angle) * overlap;
        ball.y += Math.sin(angle) * overlap;

        let speedMag = Math.sqrt(player.vx * player.vx + player.vy * player.vy);

        // Push based on heavy mass
        if (speedMag === 0) speedMag = 1.5;

        // The ball is heavier, so it takes more force to get a high velocity
        const force = (KICK_POWER * (speedMag / player.speed)) / ball.mass;

        ball.vx = Math.cos(angle) * force * 4; // *4 modifier so it still moves despite high mass
        ball.vy = Math.sin(angle) * force * 4;
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

    // Left Hoop
    ctx.beginPath();
    ctx.arc(40, canvas.height / 2, 30, Math.PI / 2, Math.PI * 1.5, true);
    ctx.stroke();
    ctx.fillStyle = "#111"; // Hole
    ctx.fill();

    // Right Hoop
    ctx.beginPath();
    ctx.arc(canvas.width - 40, canvas.height / 2, 30, Math.PI / 2, Math.PI * 1.5, false);
    ctx.stroke();
    ctx.fill();
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
    drawEntity(ball);
}

// --- MAIN LOOP ---

function gameLoop() {
    updatePlayer();
    updateBall();
    detectCollisions();
    drawGame();

    requestAnimationFrame(gameLoop);
}

// Start Game
requestAnimationFrame(gameLoop);
