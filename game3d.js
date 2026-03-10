// --- THREE.JS SETUP ---
const scene = new THREE.Scene();
// Deep ritual darkness background
scene.background = new THREE.Color(0x050508);
scene.fog = new THREE.FogExp2(0x050508, 0.0015); // Adds mystery distance

// Camera (Isometric / Bird's eye view)
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 400, 300);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
document.getElementById('gameContainer').appendChild(renderer.domElement);

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- LIGHTING ---
const ambientLight = new THREE.AmbientLight(0x404040, 0.5); // Soft moonlight
scene.add(ambientLight);

// Fire / Torch light from above
const hemiLight = new THREE.HemisphereLight(0xd4af37, 0x8b0000, 0.6); // Gold and blood red mix
scene.add(hemiLight);

// Main shadow-casting light (Center Sun/Sacrifice spotlight)
const spotLight = new THREE.SpotLight(0xffaa55, 1);
spotLight.position.set(0, 600, 0);
spotLight.angle = Math.PI / 4;
spotLight.penumbra = 0.5;
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
scene.add(spotLight);


// --- ENVIRONMENT (THE TEMPLE COURT) ---
const COURT_WIDTH = 800;
const COURT_DEPTH = 600;

// The ground (Stone Floor)
const groundGeo = new THREE.PlaneGeometry(COURT_WIDTH, COURT_DEPTH);
const groundMat = new THREE.MeshStandardMaterial({
    color: 0x3e3b32, // Dark stone
    roughness: 0.9,
    metalness: 0.1
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2; // Lay flat
ground.receiveShadow = true;
scene.add(ground);

// Temple Walls (Step Pyramids)
const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a473e, // Ancient stone color
    roughness: 1,
    metalness: 0.05
});
const wallHeight = 40;
const wallThickness = 20;

// Top Wall (Endzone)
const topWall = new THREE.Mesh(new THREE.BoxGeometry(COURT_WIDTH + 400, wallHeight * 2, wallThickness), wallMaterial);
topWall.position.set(0, wallHeight, -COURT_DEPTH / 2 - wallThickness / 2);
topWall.castShadow = true;
topWall.receiveShadow = true;
scene.add(topWall);

// Bottom Wall (Endzone)
const bottomWall = new THREE.Mesh(new THREE.BoxGeometry(COURT_WIDTH + 400, wallHeight * 2, wallThickness), wallMaterial);
bottomWall.position.set(0, wallHeight, COURT_DEPTH / 2 + wallThickness / 2);
bottomWall.castShadow = true;
bottomWall.receiveShadow = true;
scene.add(bottomWall);

// Left and Right Temple Stepped Walls
for (let i = 0; i < 5; i++) {
    const stepWidth = 40;
    const stepHeight = 20 + (i * 20); // Height increases per step
    const stepGeo = new THREE.BoxGeometry(stepWidth, stepHeight, COURT_DEPTH);

    // Left Step
    const lStep = new THREE.Mesh(stepGeo, wallMaterial);
    lStep.position.set(-COURT_WIDTH / 2 - (stepWidth / 2) - (i * stepWidth), stepHeight / 2, 0);
    lStep.castShadow = true;
    lStep.receiveShadow = true;
    scene.add(lStep);

    // Right Step
    const rStep = new THREE.Mesh(stepGeo, wallMaterial);
    rStep.position.set(COURT_WIDTH / 2 + (stepWidth / 2) + (i * stepWidth), stepHeight / 2, 0);
    rStep.castShadow = true;
    rStep.receiveShadow = true;
    scene.add(rStep);
}

// Corner Ritual Torches/Altars
const altarGeo = new THREE.CylinderGeometry(15, 25, 40, 4); // Square-ish base
const altarMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 1 });
const corners = [
    { x: -COURT_WIDTH / 2 + 40, z: -COURT_DEPTH / 2 + 40 },
    { x: COURT_WIDTH / 2 - 40, z: -COURT_DEPTH / 2 + 40 },
    { x: -COURT_WIDTH / 2 + 40, z: COURT_DEPTH / 2 - 40 },
    { x: COURT_WIDTH / 2 - 40, z: COURT_DEPTH / 2 - 40 }
];

corners.forEach(pos => {
    // Stone Altar
    const altar = new THREE.Mesh(altarGeo, altarMat);
    altar.position.set(pos.x, 20, pos.z);
    altar.rotation.y = Math.PI / 4;
    altar.castShadow = true;
    scene.add(altar);

    // Fire Light from Altar
    const fireLight = new THREE.PointLight(0xff4500, 1.2, 250); // Deep orange/red fire
    fireLight.position.set(pos.x, 50, pos.z);
    scene.add(fireLight);
});

// --- AZTEC HOOPS (GOALS) ---
const hoopGeo = new THREE.TorusGeometry(20, 5, 16, 100);
const hoopMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.6, roughness: 0.4 });
const supportGeo = new THREE.BoxGeometry(10, 40, 10);

// Left Hoop
const leftHoop = new THREE.Mesh(hoopGeo, hoopMat);
leftHoop.position.set(-COURT_WIDTH / 2 + 15, 60, 0); // Raised higher
leftHoop.rotation.y = Math.PI / 2;
leftHoop.castShadow = true;
scene.add(leftHoop);
const leftSupport = new THREE.Mesh(supportGeo, wallMaterial);
leftSupport.position.set(-COURT_WIDTH / 2 + 5, 20, 0);
leftSupport.castShadow = true;
scene.add(leftSupport);

// Right Hoop
const rightHoop = new THREE.Mesh(hoopGeo, hoopMat);
rightHoop.position.set(COURT_WIDTH / 2 - 15, 60, 0);
rightHoop.rotation.y = Math.PI / 2;
rightHoop.castShadow = true;
scene.add(rightHoop);
const rightSupport = new THREE.Mesh(supportGeo, wallMaterial);
rightSupport.position.set(COURT_WIDTH / 2 - 5, 20, 0);
rightSupport.castShadow = true;
scene.add(rightSupport);


// --- ENTITIES (PHYSICS STATE) ---
const PHY_FRICTION = 0.94;
const PHY_BOUNCE = 0.5;
const KICK_POWER = 15;

// Player Logic State
const pData = {
    radius: 20,
    speed: 4,
    vx: 0,
    vz: 0
};

// --- PROCEDURAL AZTEC WARRIOR BUILDER ---
function createAztecWarrior(primaryColor, secondaryColor) {
    const warriorGroup = new THREE.Group();

    // Materials
    const skinMat = new THREE.MeshStandardMaterial({ color: 0x8d5524, roughness: 0.8 }); // Bronze skin
    const clothMat = new THREE.MeshStandardMaterial({ color: primaryColor, roughness: 0.9 });
    const featherMat = new THREE.MeshStandardMaterial({ color: secondaryColor, roughness: 1 });
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.2 });

    // Torso (Bare chest with a belt)
    const torsoGeo = new THREE.CylinderGeometry(10, 8, 16, 8);
    const torso = new THREE.Mesh(torsoGeo, skinMat);
    torso.position.y = 8;
    torso.castShadow = true;
    warriorGroup.add(torso);

    // Loincloth / Skirt
    const skirtGeo = new THREE.ConeGeometry(12, 10, 8);
    const skirt = new THREE.Mesh(skirtGeo, clothMat);
    skirt.position.y = -2;
    skirt.castShadow = true;
    warriorGroup.add(skirt);

    // Head
    const headGeo = new THREE.SphereGeometry(7, 16, 16);
    const head = new THREE.Mesh(headGeo, skinMat);
    head.position.y = 20;
    head.castShadow = true;
    warriorGroup.add(head);

    // Golden Crown/Band
    const bandGeo = new THREE.CylinderGeometry(7.5, 7.5, 2, 16);
    const band = new THREE.Mesh(bandGeo, goldMat);
    band.position.y = 22;
    warriorGroup.add(band);

    // Feathered Headdress (Penacho)
    for (let i = 0; i < 5; i++) {
        const featherGeo = new THREE.ConeGeometry(2, 15, 4);
        const feather = new THREE.Mesh(featherGeo, featherMat);
        // Fan out the feathers
        const angle = (Math.PI / 4) * (i - 2);
        feather.position.set(Math.sin(angle) * 8, 28, -Math.cos(angle) * 5);
        feather.rotation.z = -angle * 0.5;
        feather.rotation.x = -0.2;
        warriorGroup.add(feather);
    }

    // Scale the whole group to match our original physics bounds
    warriorGroup.scale.set(1.2, 1.2, 1.2);

    return warriorGroup;
}

// 1. Player 3D Mesh (Red & Gold)
const playerMesh = createAztecWarrior(0x8b0000, 0xd4af37);
playerMesh.position.set(-200, pData.radius, 0);
scene.add(playerMesh);


// Enemy Logic State
const eData = {
    radius: 20,
    speed: 3.5,
    vx: 0,
    vz: 0
};
// 2. Enemy 3D Mesh (Teal & Silver)
const enemyMesh = createAztecWarrior(0x1a4e66, 0xc0c0c0);
enemyMesh.position.set(200, eData.radius, 0);
// Enemy faces left initially
enemyMesh.rotation.y = -Math.PI / 2;
scene.add(enemyMesh);


// Ball Logic State
const bData = {
    radius: 14,
    mass: 5,
    vx: 0,
    vz: 0
};
// Ball 3D Mesh
const ballGeo = new THREE.SphereGeometry(bData.radius, 32, 32);
const ballMat = new THREE.MeshStandardMaterial({
    color: 0x111111, // Obsidian
    roughness: 0.1, // Shiny stone
    metalness: 0.5
});
const ballMesh = new THREE.Mesh(ballGeo, ballMat);
ballMesh.position.set(0, bData.radius, 0);
ballMesh.castShadow = true;
scene.add(ballMesh);


// --- SCORE SYSTEM ---
const score = { player: 0, enemy: 0 };

function resetMatch() {
    ballMesh.position.set(0, bData.radius, 0);
    bData.vx = 0;
    bData.vz = 0;

    playerMesh.position.set(-200, pData.radius, 0);
    pData.vx = 0; pData.vz = 0;

    enemyMesh.position.set(200, eData.radius, 0);
    eData.vx = 0; eData.vz = 0;
}


// --- INPUT HANDLING ---
const keys = { w: false, a: false, s: false, d: false, ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
window.addEventListener('keydown', (e) => { if (keys.hasOwnProperty(e.key)) keys[e.key] = true; });
window.addEventListener('keyup', (e) => { if (keys.hasOwnProperty(e.key)) keys[e.key] = false; });


// --- PHYSICS ENGINE TICK ---
function updatePhysics() {
    // 1. UPDATE PLAYER
    pData.vx = 0;
    pData.vz = 0;
    if (keys.ArrowUp || keys.w) pData.vz = -pData.speed;
    if (keys.ArrowDown || keys.s) pData.vz = pData.speed;
    if (keys.ArrowLeft || keys.a) pData.vx = -pData.speed;
    if (keys.ArrowRight || keys.d) pData.vx = pData.speed;

    playerMesh.position.x += pData.vx;
    playerMesh.position.z += pData.vz;

    // Rotate player to face movement direction
    if (pData.vx !== 0 || pData.vz !== 0) {
        playerMesh.rotation.y = -Math.atan2(pData.vz, pData.vx) + Math.PI / 2;
    }

    // Player Boundaries
    const limitX = COURT_WIDTH / 2 - pData.radius;
    const limitZ = COURT_DEPTH / 2 - pData.radius;
    if (playerMesh.position.x < -limitX) playerMesh.position.x = -limitX;
    if (playerMesh.position.x > limitX) playerMesh.position.x = limitX;
    if (playerMesh.position.z < -limitZ) playerMesh.position.z = -limitZ;
    if (playerMesh.position.z > limitZ) playerMesh.position.z = limitZ;


    // 2. UPDATE ENEMY (AI)
    const dxAI = ballMesh.position.x - enemyMesh.position.x;
    const dzAI = ballMesh.position.z - enemyMesh.position.z;

    // Chase ball if it enters AI half
    if (ballMesh.position.x > 0) {
        const angle = Math.atan2(dzAI, dxAI);
        eData.vx = Math.cos(angle) * eData.speed;
        eData.vz = Math.sin(angle) * eData.speed;
    } else {
        // Defend Right Hoop
        const defDX = (COURT_WIDTH / 2 - 100) - enemyMesh.position.x;
        const defDZ = 0 - enemyMesh.position.z;
        const dist = Math.sqrt(defDX * defDX + defDZ * defDZ);
        if (dist > 5) {
            const angle = Math.atan2(defDZ, defDX);
            eData.vx = Math.cos(angle) * (eData.speed * 0.6);
            eData.vz = Math.sin(angle) * (eData.speed * 0.6);
        } else {
            eData.vx = 0; eData.vz = 0;
        }
    }

    enemyMesh.position.x += eData.vx;
    enemyMesh.position.z += eData.vz;

    // Rotate enemy to face movement direction
    if (eData.vx !== 0 || eData.vz !== 0) {
        enemyMesh.rotation.y = -Math.atan2(eData.vz, eData.vx) + Math.PI / 2;
    }

    // Enemy Boundaries
    if (enemyMesh.position.x < -limitX) enemyMesh.position.x = -limitX;
    if (enemyMesh.position.x > limitX) enemyMesh.position.x = limitX;
    if (enemyMesh.position.z < -limitZ) enemyMesh.position.z = -limitZ;
    if (enemyMesh.position.z > limitZ) enemyMesh.position.z = limitZ;


    // 3. UPDATE BALL
    ballMesh.position.x += bData.vx;
    ballMesh.position.z += bData.vz;

    // Rotate ball visually for realism
    ballMesh.rotation.z -= bData.vx * 0.05;
    ballMesh.rotation.x += bData.vz * 0.05;

    bData.vx *= PHY_FRICTION;
    bData.vz *= PHY_FRICTION;
    if (Math.abs(bData.vx) < 0.1) bData.vx = 0;
    if (Math.abs(bData.vz) < 0.1) bData.vz = 0;

    // Ball Wall Collisions & Scoring
    const bLimitX = COURT_WIDTH / 2 - bData.radius;
    const bLimitZ = COURT_DEPTH / 2 - bData.radius;

    // Left Wall
    if (ballMesh.position.x < -bLimitX) {
        // Check Goal (Y in 3D is height, Z is depth. Goal sits at Z=0)
        if (Math.abs(ballMesh.position.z) < 40) {
            score.enemy++;
            document.getElementById('scoreboard').innerText = `${score.player} - ${score.enemy}`;
            resetMatch();
            return;
        }
        ballMesh.position.x = -bLimitX;
        bData.vx = -bData.vx * PHY_BOUNCE;
    }
    // Right Wall
    else if (ballMesh.position.x > bLimitX) {
        if (Math.abs(ballMesh.position.z) < 40) {
            score.player++;
            document.getElementById('scoreboard').innerText = `${score.player} - ${score.enemy}`;
            resetMatch();
            return;
        }
        ballMesh.position.x = bLimitX;
        bData.vx = -bData.vx * PHY_BOUNCE;
    }

    // Top/Bottom Walls (Z axis)
    if (ballMesh.position.z < -bLimitZ) {
        ballMesh.position.z = -bLimitZ;
        bData.vz = -bData.vz * PHY_BOUNCE;
    } else if (ballMesh.position.z > bLimitZ) {
        ballMesh.position.z = bLimitZ;
        bData.vz = -bData.vz * PHY_BOUNCE;
    }


    // 4. ENTITY COLLISIONS

    // Player vs Ball
    let dx = ballMesh.position.x - playerMesh.position.x;
    let dz = ballMesh.position.z - playerMesh.position.z;
    let dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < pData.radius + bData.radius) {
        const angle = Math.atan2(dz, dx);
        const overlap = (pData.radius + bData.radius) - dist;
        ballMesh.position.x += Math.cos(angle) * overlap;
        ballMesh.position.z += Math.sin(angle) * overlap;

        let pSpeedMag = Math.sqrt(pData.vx * pData.vx + pData.vz * pData.vz);
        if (pSpeedMag === 0) pSpeedMag = 1.5;
        const force = (KICK_POWER * (pSpeedMag / pData.speed)) / bData.mass;
        bData.vx = Math.cos(angle) * force * 4;
        bData.vz = Math.sin(angle) * force * 4;
    }

    // Enemy vs Ball
    dx = ballMesh.position.x - enemyMesh.position.x;
    dz = ballMesh.position.z - enemyMesh.position.z;
    dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < eData.radius + bData.radius) {
        const angle = Math.atan2(dz, dx);
        const overlap = (eData.radius + bData.radius) - dist;
        ballMesh.position.x += Math.cos(angle) * overlap;
        ballMesh.position.z += Math.sin(angle) * overlap;

        let eSpeedMag = Math.sqrt(eData.vx * eData.vx + eData.vz * eData.vz);
        if (eSpeedMag === 0) eSpeedMag = 1.5;
        const force = ((KICK_POWER - 2) * (eSpeedMag / eData.speed)) / bData.mass;
        bData.vx = Math.cos(angle) * force * 4;
        bData.vz = Math.sin(angle) * force * 4;
    }

    // Player vs Enemy
    dx = enemyMesh.position.x - playerMesh.position.x;
    dz = enemyMesh.position.z - playerMesh.position.z;
    dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < pData.radius + eData.radius) {
        const angle = Math.atan2(dz, dx);
        const overlap = (pData.radius + eData.radius) - dist;
        playerMesh.position.x -= Math.cos(angle) * (overlap / 2);
        playerMesh.position.z -= Math.sin(angle) * (overlap / 2);
        enemyMesh.position.x += Math.cos(angle) * (overlap / 2);
        enemyMesh.position.z += Math.sin(angle) * (overlap / 2);
    }
}


// --- MAIN RENDERING LOOP ---
function animate() {
    requestAnimationFrame(animate);
    updatePhysics();
    renderer.render(scene, camera);
}

// Start Game
animate();
