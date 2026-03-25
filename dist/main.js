"use strict";
// ============================================================================
// CODE INVADERS - Secure Coding Training Game
// ============================================================================
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================
const BASE_CONFIG = {
    canvas: {
        desktop: { width: 1400, height: 700 },
        mobile: { width: 800, height: 600 },
    },
    player: {
        width: 40,
        height: 30,
        speed: 300,
        shootCooldown: 0.25,
    },
    bullet: {
        width: 4,
        height: 15,
        speed: 400,
    },
    block: {
        desktop: {
            width: 560,
            fontSize: 13,
            lineHeight: 16,
            padding: 12,
            maxCharsPerLine: 80,
        },
        mobile: {
            width: 240,
            fontSize: 16,
            lineHeight: 20,
            padding: 12,
            maxCharsPerLine: 35,
        },
        initialSpeed: 40,
        speedIncrement: 3,
        maxSpeed: 150,
    },
    lanes: {
        desktop: 5,
        mobile: 3,
    },
    spawn: {
        initialInterval: 4.5,
        minInterval: 2.0,
        intervalDecrement: 0.03,
        laneBuffer: 350,
    },
    scoring: {
        hitInsecure: 10,
        hitMalware: 25,
        hitSecure: -15,
        reachInsecure: -20,
        reachMalware: -40,
        reachSecure: 2,
        comboMultiplier: 1.5,
    },
    difficulty: {
        levelDuration: 15,
        malwareChanceStart: 0.15,
        malwareChanceMax: 0.35,
        malwareChanceIncrement: 0.02,
        insecureChance: 0.50,
    },
};
// Dynamic CONFIG that adapts to screen size
let CONFIG = {
    canvas: { width: 1400, height: 700 },
    player: BASE_CONFIG.player,
    bullet: BASE_CONFIG.bullet,
    block: {
        width: 560,
        height: 110,
        initialSpeed: 40,
        speedIncrement: 3,
        maxSpeed: 150,
        fontSize: 13,
        lineHeight: 16,
        padding: 12,
        maxCharsPerLine: 80,
    },
    lanes: { count: 5 },
    spawn: BASE_CONFIG.spawn,
    scoring: BASE_CONFIG.scoring,
    difficulty: BASE_CONFIG.difficulty,
};
function isMobile() {
    return window.innerWidth <= 768;
}
function updateConfigForScreenSize() {
    const mobile = isMobile();
    if (mobile) {
        CONFIG.canvas = BASE_CONFIG.canvas.mobile;
        CONFIG.block.width = BASE_CONFIG.block.mobile.width;
        CONFIG.block.fontSize = BASE_CONFIG.block.mobile.fontSize;
        CONFIG.block.lineHeight = BASE_CONFIG.block.mobile.lineHeight;
        CONFIG.block.padding = BASE_CONFIG.block.mobile.padding;
        CONFIG.block.maxCharsPerLine = BASE_CONFIG.block.mobile.maxCharsPerLine;
        CONFIG.lanes.count = BASE_CONFIG.lanes.mobile;
    }
    else {
        CONFIG.canvas = BASE_CONFIG.canvas.desktop;
        CONFIG.block.width = BASE_CONFIG.block.desktop.width;
        CONFIG.block.fontSize = BASE_CONFIG.block.desktop.fontSize;
        CONFIG.block.lineHeight = BASE_CONFIG.block.desktop.lineHeight;
        CONFIG.block.padding = BASE_CONFIG.block.desktop.padding;
        CONFIG.block.maxCharsPerLine = BASE_CONFIG.block.desktop.maxCharsPerLine;
        CONFIG.lanes.count = BASE_CONFIG.lanes.desktop;
    }
}
let SNIPPETS = {
    secure: [],
    insecure: [],
    malware: [],
};
// ============================================================================
// TYPES & ENUMS
// ============================================================================
var BlockType;
(function (BlockType) {
    BlockType["Secure"] = "secure";
    BlockType["Insecure"] = "insecure";
    BlockType["Malware"] = "malware";
})(BlockType || (BlockType = {}));
var GameStatus;
(function (GameStatus) {
    GameStatus["Playing"] = "playing";
    GameStatus["Paused"] = "paused";
    GameStatus["GameOver"] = "gameover";
})(GameStatus || (GameStatus = {}));
const MAX_SECURE_HITS = 15;
const MAX_MISSED_VULNERABILITIES = 15;
// ============================================================================
// GAME STATE
// ============================================================================
let canvas;
let ctx;
let state;
let keys = {};
// Lane positions
let lanePositions = [];
// Player ship image
let playerShipImage = null;
// ============================================================================
// INITIALIZATION
// ============================================================================
function loadSnippets() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Load the new annotated trend pack with rich metadata
            const response = yield fetch('code-invaders-trend-pack-annotated.json');
            if (!response.ok) {
                throw new Error('Failed to load code-invaders-trend-pack-annotated.json');
            }
            const trendPack = yield response.json();
            // Extract snippets with language info and full data from the annotated format
            SNIPPETS.insecure = trendPack.insecure.map(item => ({
                snippet: item.snippet,
                language: item.language,
                snippetData: item
            }));
            SNIPPETS.malware = trendPack.malware.map(item => ({
                snippet: item.snippet,
                language: item.language,
                snippetData: item
            }));
            // Add secure code examples (not in trend pack, so we define them here)
            SNIPPETS.secure = [
                { snippet: 'stmt = conn.prepareStatement("SELECT * FROM users WHERE id=?")', language: 'Java' },
                { snippet: 'const result = await db.query("SELECT * FROM posts WHERE id=$1", [postId])', language: 'JavaScript' },
                { snippet: 'cursor.execute("SELECT * FROM accounts WHERE email=?", (email,))', language: 'Python' },
                { snippet: 'PreparedStatement ps = conn.prepareStatement("SELECT * FROM files WHERE id=?")', language: 'Java' },
                { snippet: 'const safe = DOMPurify.sanitize(userInput)', language: 'JavaScript' },
                { snippet: 'User.where(id: params[:id]).first', language: 'Ruby' },
                { snippet: 'password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt())', language: 'Python' },
                { snippet: 'const token = jwt.sign(payload, secret, {expiresIn: "1h"})', language: 'JavaScript' },
                { snippet: 'if (!validator.isEmail(email)) throw new Error("Invalid")', language: 'JavaScript' },
                { snippet: 'db.collection.findOne({_id: new ObjectId(id)})', language: 'JavaScript' },
                { snippet: 'const escaped = escapeHtml(userInput)', language: 'JavaScript' },
                { snippet: 'crypto.randomBytes(32).toString("hex")', language: 'JavaScript' },
            ];
            console.log('✓ Loaded Code Invaders Annotated Trend Pack:', {
                secure: SNIPPETS.secure.length,
                insecure: SNIPPETS.insecure.length,
                malware: SNIPPETS.malware.length,
                total: SNIPPETS.secure.length + SNIPPETS.insecure.length + SNIPPETS.malware.length
            });
            console.log('  Pack:', trendPack.meta.name);
            console.log('  Generated:', trendPack.meta.generated_on);
            console.log('  Using annotated version with vuln_key, analysis, and line_notes!');
        }
        catch (error) {
            console.error('Error loading trend pack:', error);
            console.log('Attempting to load fallback snippets.json...');
            // Try the old format as fallback
            try {
                const fallbackResponse = yield fetch('snippets.json');
                if (fallbackResponse.ok) {
                    const fallbackData = yield fallbackResponse.json();
                    // Convert old string array format to new object format
                    SNIPPETS = {
                        secure: (fallbackData.secure || []).map((s) => ({ snippet: s, language: 'Mixed' })),
                        insecure: (fallbackData.insecure || []).map((s) => ({ snippet: s, language: 'Mixed' })),
                        malware: (fallbackData.malware || []).map((s) => ({ snippet: s, language: 'Mixed' })),
                    };
                    console.log('✓ Loaded fallback snippets.json');
                }
                else {
                    throw new Error('Fallback also failed');
                }
            }
            catch (fallbackError) {
                console.error('Fallback failed, using minimal snippets');
                // Use minimal snippets as last resort
                SNIPPETS = {
                    secure: [{ snippet: 'PreparedStatement ps = conn.prepareStatement(?)', language: 'Java' }],
                    insecure: [{ snippet: 'query = "SELECT * FROM users WHERE id=" + userId', language: 'JavaScript' }],
                    malware: [{ snippet: 'eval(atob("dmFyIGE9ZG9jdW1lbnQuY29va2ll"))', language: 'JavaScript' }],
                };
            }
        }
    });
}
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        // Update config based on screen size first
        updateConfigForScreenSize();
        canvas = document.getElementById('gameCanvas');
        canvas.width = CONFIG.canvas.width;
        canvas.height = CONFIG.canvas.height;
        ctx = canvas.getContext('2d');
        // Load player ship image
        playerShipImage = new Image();
        playerShipImage.src = 'assets/images/player-ship.png';
        yield new Promise((resolve) => {
            if (playerShipImage.complete) {
                resolve();
            }
            else {
                playerShipImage.onload = () => resolve();
                playerShipImage.onerror = () => {
                    console.warn('Failed to load player ship image, using fallback');
                    playerShipImage = null;
                    resolve();
                };
            }
        });
        // Load snippets from JSON file
        yield loadSnippets();
        calculateLanePositions();
        resetGame();
        setupEventListeners();
        gameLoop(0);
    });
}
function calculateLanePositions() {
    lanePositions = [];
    const blockHalfWidth = CONFIG.block.width / 2;
    const usableWidth = CONFIG.canvas.width - CONFIG.block.width; // Account for block width
    const spacing = usableWidth / (CONFIG.lanes.count - 1);
    for (let i = 0; i < CONFIG.lanes.count; i++) {
        lanePositions.push(blockHalfWidth + spacing * i);
    }
}
function resetGame() {
    state = {
        status: GameStatus.Playing,
        time: 0,
        level: 1,
        spawnTimer: 0,
        spawnInterval: CONFIG.spawn.initialInterval,
        blockSpeed: CONFIG.block.initialSpeed,
        malwareChance: CONFIG.difficulty.malwareChanceStart,
        player: {
            pos: {
                x: CONFIG.canvas.width / 2,
                y: CONFIG.canvas.height - 60,
            },
            vel: { x: 0, y: 0 },
            width: CONFIG.player.width,
            height: CONFIG.player.height,
            lastShot: 0,
        },
        bullets: [],
        blocks: [],
        particles: [],
        stats: {
            score: 0,
            streak: 0,
            maxStreak: 0,
            totalShots: 0,
            secureHits: 0,
            insecureHits: 0,
            malwareHits: 0,
            secureReached: 0,
            insecureReached: 0,
            malwareReached: 0,
            missedVulnerabilities: 0,
        },
        laneCooldowns: new Array(CONFIG.lanes.count).fill(0),
        screenShake: 0,
        flashEffect: null,
        mistakes: [],
    };
    updateHUD();
    hideOverlay();
}
function setupEventListeners() {
    window.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true;
        if (e.key.toLowerCase() === 'p') {
            togglePause();
        }
        else if (e.key.toLowerCase() === 'r' && state.status === GameStatus.GameOver) {
            resetGame();
        }
        else if (e.key.toLowerCase() === 'e' && state.status === GameStatus.Playing) {
            // End game early and show stats
            gameOver('You ended the game early');
        }
        else if (e.key === ' ') {
            e.preventDefault();
            if (state.status === GameStatus.Playing) {
                shoot();
            }
        }
    });
    window.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
    });
    // Touch controls for mobile
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let isTouching = false;
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isTouching = true;
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        touchStartX = touch.clientX - rect.left;
        touchStartY = touch.clientY - rect.top;
        touchStartTime = Date.now();
    });
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!isTouching || state.status !== GameStatus.Playing)
            return;
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const touchX = touch.clientX - rect.left;
        // Convert canvas touch position to game world position
        const canvasX = (touchX / rect.width) * CONFIG.canvas.width;
        // Move player to touch position
        state.player.pos.x = Math.max(state.player.width / 2, Math.min(CONFIG.canvas.width - state.player.width / 2, canvasX));
    });
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        const touchDuration = Date.now() - touchStartTime;
        const touch = e.changedTouches[0];
        const rect = canvas.getBoundingClientRect();
        const touchEndX = touch.clientX - rect.left;
        const touchEndY = touch.clientY - rect.top;
        // Check if it was a tap (not a drag) and quick (< 300ms)
        const distance = Math.sqrt(Math.pow(touchEndX - touchStartX, 2) +
            Math.pow(touchEndY - touchStartY, 2));
        if (distance < 20 && touchDuration < 300) {
            // Check if tapped on a code block
            const clickedBlock = checkCodeBlockClick(touchStartX, touchStartY);
            if (clickedBlock) {
                showCodeModal(clickedBlock);
            }
            else if (state.status === GameStatus.Playing) {
                // Regular tap to shoot
                shoot();
            }
        }
        isTouching = false;
    });
    // Mouse controls (similar to touch for desktop click-and-drag)
    let isMouseDown = false;
    let mouseDownX = 0;
    let mouseDownY = 0;
    canvas.addEventListener('mousedown', (e) => {
        isMouseDown = true;
        const rect = canvas.getBoundingClientRect();
        mouseDownX = e.clientX - rect.left;
        mouseDownY = e.clientY - rect.top;
    });
    canvas.addEventListener('mousemove', (e) => {
        if (!isMouseDown || state.status !== GameStatus.Playing)
            return;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const canvasX = (mouseX / rect.width) * CONFIG.canvas.width;
        state.player.pos.x = Math.max(state.player.width / 2, Math.min(CONFIG.canvas.width - state.player.width / 2, canvasX));
    });
    canvas.addEventListener('mouseup', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseUpX = e.clientX - rect.left;
        const mouseUpY = e.clientY - rect.top;
        const distance = Math.sqrt(Math.pow(mouseUpX - mouseDownX, 2) +
            Math.pow(mouseUpY - mouseDownY, 2));
        // If it was a click (not a drag)
        if (distance < 10) {
            const clickedBlock = checkCodeBlockClick(mouseDownX, mouseDownY);
            if (clickedBlock) {
                showCodeModal(clickedBlock);
            }
            else if (state.status === GameStatus.Playing) {
                shoot();
            }
        }
        isMouseDown = false;
    });
    canvas.addEventListener('mouseleave', () => {
        isMouseDown = false;
    });
    // Code modal close handlers
    document.getElementById('closeCodeModal').addEventListener('click', hideCodeModal);
    document.getElementById('codeModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('codeModal')) {
            hideCodeModal();
        }
    });
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !document.getElementById('codeModal').classList.contains('hidden')) {
            e.preventDefault();
            hideCodeModal();
        }
    });
    // Handle window resize for responsive layout
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = window.setTimeout(() => {
            const wasMobile = CONFIG.canvas.width === BASE_CONFIG.canvas.mobile.width;
            const nowMobile = isMobile();
            // Only reset if we switched between mobile/desktop
            if (wasMobile !== nowMobile) {
                updateConfigForScreenSize();
                canvas.width = CONFIG.canvas.width;
                canvas.height = CONFIG.canvas.height;
                calculateLanePositions();
                resetGame();
            }
        }, 250);
    });
}
// ============================================================================
// GAME LOOP
// ============================================================================
let lastTime = 0;
function gameLoop(timestamp) {
    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    if (state.status === GameStatus.Playing) {
        update(Math.min(deltaTime, 0.1));
    }
    render();
    requestAnimationFrame(gameLoop);
}
// ============================================================================
// UPDATE LOGIC
// ============================================================================
function update(dt) {
    state.time += dt;
    updateDifficulty();
    updatePlayer(dt);
    updateBullets(dt);
    updateBlocks(dt);
    updateParticles(dt);
    updateSpawning(dt);
    checkCollisions();
    updateEffects(dt);
    updateHUD();
}
function updateDifficulty() {
    const newLevel = Math.floor(state.time / CONFIG.difficulty.levelDuration) + 1;
    if (newLevel !== state.level) {
        state.level = newLevel;
        state.spawnInterval = Math.max(CONFIG.spawn.minInterval, state.spawnInterval - CONFIG.spawn.intervalDecrement);
        state.blockSpeed = Math.min(CONFIG.block.maxSpeed, state.blockSpeed + CONFIG.block.speedIncrement);
        state.malwareChance = Math.min(CONFIG.difficulty.malwareChanceMax, state.malwareChance + CONFIG.difficulty.malwareChanceIncrement);
    }
}
function updatePlayer(dt) {
    state.player.vel.x = 0;
    if (keys['arrowleft'] || keys['a']) {
        state.player.vel.x = -CONFIG.player.speed;
    }
    if (keys['arrowright'] || keys['d']) {
        state.player.vel.x = CONFIG.player.speed;
    }
    state.player.pos.x += state.player.vel.x * dt;
    state.player.pos.x = Math.max(state.player.width / 2, Math.min(CONFIG.canvas.width - state.player.width / 2, state.player.pos.x));
}
function shoot() {
    if (state.time - state.player.lastShot < CONFIG.player.shootCooldown) {
        return;
    }
    state.bullets.push({
        pos: { x: state.player.pos.x, y: state.player.pos.y - state.player.height / 2 },
        vel: { x: 0, y: -CONFIG.bullet.speed },
        width: CONFIG.bullet.width,
        height: CONFIG.bullet.height,
        active: true,
    });
    state.player.lastShot = state.time;
    state.stats.totalShots++;
}
function updateBullets(dt) {
    for (const bullet of state.bullets) {
        if (!bullet.active)
            continue;
        bullet.pos.y += bullet.vel.y * dt;
        if (bullet.pos.y < -bullet.height) {
            bullet.active = false;
        }
    }
    state.bullets = state.bullets.filter((b) => b.active);
}
function updateBlocks(dt) {
    const baseLineY = CONFIG.canvas.height - 40;
    for (const block of state.blocks) {
        if (!block.active)
            continue;
        block.pos.y += state.blockSpeed * dt;
        if (block.pos.y - block.height / 2 > baseLineY) {
            block.active = false;
            handleBlockReachedBase(block);
        }
    }
    state.blocks = state.blocks.filter((b) => b.active);
}
function updateParticles(dt) {
    for (const particle of state.particles) {
        particle.pos.x += particle.vel.x * dt;
        particle.pos.y += particle.vel.y * dt;
        particle.life -= dt;
    }
    state.particles = state.particles.filter((p) => p.life > 0);
}
function updateSpawning(dt) {
    state.spawnTimer -= dt;
    for (let i = 0; i < state.laneCooldowns.length; i++) {
        state.laneCooldowns[i] -= dt;
    }
    if (state.spawnTimer <= 0) {
        spawnBlock();
        state.spawnTimer = state.spawnInterval;
    }
}
function updateEffects(dt) {
    if (state.screenShake > 0) {
        state.screenShake -= dt * 5;
        if (state.screenShake < 0)
            state.screenShake = 0;
    }
    if (state.flashEffect) {
        state.flashEffect.alpha -= dt * 2;
        if (state.flashEffect.alpha <= 0) {
            state.flashEffect = null;
        }
    }
}
// ============================================================================
// SPAWNING
// ============================================================================
function spawnBlock() {
    const availableLanes = state.laneCooldowns
        .map((cooldown, index) => (cooldown <= 0 ? index : -1))
        .filter((index) => index !== -1);
    if (availableLanes.length === 0)
        return;
    const lane = availableLanes[Math.floor(Math.random() * availableLanes.length)];
    const type = determineBlockType();
    const snippetData = getRandomSnippet(type);
    // Calculate dynamic height based on number of lines
    const lines = snippetData.snippet.split('\n');
    const lineCount = Math.min(lines.length, 6); // Max 6 lines displayed
    const dynamicHeight = (CONFIG.block.padding * 2) + (lineCount * CONFIG.block.lineHeight) + 8;
    state.blocks.push({
        pos: {
            x: lanePositions[lane],
            y: -dynamicHeight / 2,
        },
        vel: { x: 0, y: state.blockSpeed },
        width: CONFIG.block.width,
        height: dynamicHeight,
        type,
        snippet: snippetData.snippet,
        language: snippetData.language,
        snippetData: snippetData.snippetData,
        lane,
        active: true,
    });
    state.laneCooldowns[lane] = CONFIG.spawn.laneBuffer / state.blockSpeed;
}
function determineBlockType() {
    const rand = Math.random();
    if (rand < state.malwareChance) {
        return BlockType.Malware;
    }
    else if (rand < state.malwareChance + CONFIG.difficulty.insecureChance) {
        return BlockType.Insecure;
    }
    else {
        return BlockType.Secure;
    }
}
function getRandomSnippet(type) {
    const snippets = SNIPPETS[type];
    return snippets[Math.floor(Math.random() * snippets.length)];
}
// ============================================================================
// COLLISION DETECTION
// ============================================================================
function checkCollisions() {
    for (const bullet of state.bullets) {
        if (!bullet.active)
            continue;
        for (const block of state.blocks) {
            if (!block.active)
                continue;
            if (checkAABB(bullet, block)) {
                bullet.active = false;
                block.active = false;
                handleBlockHit(block);
                createExplosion(block.pos, getBlockColor(block.type));
                break;
            }
        }
    }
}
function checkAABB(a, b) {
    return (a.pos.x - a.width / 2 < b.pos.x + b.width / 2 &&
        a.pos.x + a.width / 2 > b.pos.x - b.width / 2 &&
        a.pos.y - a.height / 2 < b.pos.y + b.height / 2 &&
        a.pos.y + a.height / 2 > b.pos.y - b.height / 2);
}
// ============================================================================
// SCORING & FEEDBACK
// ============================================================================
function handleBlockHit(block) {
    let points = 0;
    let correctHit = false;
    switch (block.type) {
        case BlockType.Secure:
            points = CONFIG.scoring.hitSecure;
            state.stats.secureHits++;
            state.stats.streak = 0;
            state.flashEffect = { alpha: 0.5, color: 'rgba(255, 0, 0, ' };
            // Track mistake - shot a secure block
            state.mistakes.push({
                action: 'shot_secure',
                snippet: block.snippet,
                language: block.language,
                type: block.type,
                snippetData: block.snippetData,
            });
            // Check if player shot too many secure blocks
            if (state.stats.secureHits >= MAX_SECURE_HITS) {
                gameOver('You shot too many secure code blocks!');
                return;
            }
            break;
        case BlockType.Insecure:
            points = CONFIG.scoring.hitInsecure;
            state.stats.insecureHits++;
            correctHit = true;
            break;
        case BlockType.Malware:
            points = CONFIG.scoring.hitMalware;
            state.stats.malwareHits++;
            correctHit = true;
            state.screenShake = 0.3;
            break;
    }
    if (correctHit) {
        state.stats.streak++;
        if (state.stats.streak > state.stats.maxStreak) {
            state.stats.maxStreak = state.stats.streak;
        }
        if (state.stats.streak >= 3) {
            points = Math.floor(points * CONFIG.scoring.comboMultiplier);
        }
    }
    state.stats.score += points;
    if (state.stats.score < 0)
        state.stats.score = 0;
}
function handleBlockReachedBase(block) {
    let points = 0;
    switch (block.type) {
        case BlockType.Secure:
            points = CONFIG.scoring.reachSecure;
            state.stats.secureReached++;
            break;
        case BlockType.Insecure:
            points = CONFIG.scoring.reachInsecure;
            state.stats.insecureReached++;
            state.stats.missedVulnerabilities++;
            state.flashEffect = { alpha: 0.4, color: 'rgba(255, 100, 0, ' };
            state.stats.streak = 0;
            // Track mistake - missed a vulnerability
            state.mistakes.push({
                action: 'missed_vulnerability',
                snippet: block.snippet,
                language: block.language,
                type: block.type,
                snippetData: block.snippetData,
            });
            // Check if too many vulnerabilities missed
            if (state.stats.missedVulnerabilities >= MAX_MISSED_VULNERABILITIES) {
                gameOver('Too many vulnerabilities reached production!');
                return;
            }
            break;
        case BlockType.Malware:
            points = CONFIG.scoring.reachMalware;
            state.stats.malwareReached++;
            state.stats.missedVulnerabilities++;
            state.flashEffect = { alpha: 0.6, color: 'rgba(255, 0, 100, ' };
            state.stats.streak = 0;
            // Track mistake - missed malware
            state.mistakes.push({
                action: 'missed_vulnerability',
                snippet: block.snippet,
                language: block.language,
                type: block.type,
                snippetData: block.snippetData,
            });
            // Check if too many vulnerabilities missed
            if (state.stats.missedVulnerabilities >= MAX_MISSED_VULNERABILITIES) {
                gameOver('Too many vulnerabilities reached production!');
                return;
            }
            break;
    }
    state.stats.score += points;
    if (state.stats.score < 0)
        state.stats.score = 0;
}
// ============================================================================
// PARTICLE EFFECTS
// ============================================================================
function createExplosion(pos, color) {
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = 100 + Math.random() * 100;
        state.particles.push({
            pos: { x: pos.x, y: pos.y },
            vel: {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed,
            },
            life: 0.5 + Math.random() * 0.5,
            maxLife: 1,
            color,
            size: 2 + Math.random() * 3,
        });
    }
}
// ============================================================================
// RENDERING
// ============================================================================
function render() {
    ctx.save();
    if (state.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * state.screenShake * 20;
        const shakeY = (Math.random() - 0.5) * state.screenShake * 20;
        ctx.translate(shakeX, shakeY);
    }
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
    drawLanes();
    drawBaseLine();
    drawBlocks();
    drawPlayer();
    drawBullets();
    drawParticles();
    if (state.flashEffect) {
        ctx.fillStyle = state.flashEffect.color + state.flashEffect.alpha + ')';
        ctx.fillRect(0, 0, CONFIG.canvas.width, CONFIG.canvas.height);
    }
    ctx.restore();
}
function drawLanes() {
    ctx.strokeStyle = 'rgba(0, 255, 65, 0.2)';
    ctx.lineWidth = 1;
    for (const laneX of lanePositions) {
        ctx.beginPath();
        ctx.moveTo(laneX, 0);
        ctx.lineTo(laneX, CONFIG.canvas.height);
        ctx.stroke();
    }
}
function drawBaseLine() {
    const baseLineY = CONFIG.canvas.height - 40;
    ctx.strokeStyle = '#ff0064';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, baseLineY);
    ctx.lineTo(CONFIG.canvas.width, baseLineY);
    ctx.stroke();
    ctx.setLineDash([]);
}
function drawPlayer() {
    const p = state.player;
    if (playerShipImage && playerShipImage.complete) {
        // Draw the player ship image
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00aaff';
        ctx.drawImage(playerShipImage, p.pos.x - p.width / 2, p.pos.y - p.height / 2, p.width, p.height);
        ctx.shadowBlur = 0;
        ctx.restore();
    }
    else {
        // Fallback triangle if image doesn't load
        ctx.fillStyle = '#00aaff';
        ctx.strokeStyle = '#00ddff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p.pos.x, p.pos.y - p.height / 2);
        ctx.lineTo(p.pos.x - p.width / 2, p.pos.y + p.height / 2);
        ctx.lineTo(p.pos.x + p.width / 2, p.pos.y + p.height / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00aaff';
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}
function drawBullets() {
    ctx.fillStyle = '#00ff41';
    for (const bullet of state.bullets) {
        if (!bullet.active)
            continue;
        ctx.fillRect(bullet.pos.x - bullet.width / 2, bullet.pos.y - bullet.height / 2, bullet.width, bullet.height);
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#00ff41';
        ctx.fillRect(bullet.pos.x - bullet.width / 2, bullet.pos.y - bullet.height / 2, bullet.width, bullet.height);
        ctx.shadowBlur = 0;
    }
}
function getTokenColor(token, prevToken = '') {
    // Keywords - purple/blue
    const keywords = ['const', 'let', 'var', 'function', 'if', 'else', 'for', 'while', 'return',
        'import', 'from', 'export', 'class', 'new', 'this', 'true', 'false', 'null',
        'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'def', 'async', 'await'];
    if (keywords.includes(token))
        return '#c792ea';
    // Dangerous keywords - bright red
    const dangerous = ['eval', 'exec', 'execute', 'system', 'shell', 'atob', 'btoa', 'decode',
        'DownloadString', 'IEX', 'curl', 'wget', 'bash'];
    if (dangerous.some(d => token.includes(d)))
        return '#ff5370';
    // Strings - green/yellow
    if (token.startsWith('"') || token.startsWith("'") || token.startsWith('`'))
        return '#c3e88d';
    // Numbers - orange
    if (/^\d+$/.test(token))
        return '#f78c6c';
    // Function calls - yellow
    if (token.endsWith('(') || prevToken.endsWith('('))
        return '#ffcb6b';
    // Methods/properties after dot - cyan
    if (prevToken === '.')
        return '#89ddff';
    // Special operators - cyan
    if (['=', '+', '-', '*', '/', '==', '===', '!=', '!==', '=>', '&&', '||'].includes(token))
        return '#89ddff';
    // Default - white
    return '#ffffff';
}
function drawSyntaxHighlightedText(line, x, y, maxWidth) {
    // Simple tokenization
    const tokens = line.match(/(".*?"|'.*?'|`.*?`|\w+|\(|\)|\{|\}|\[|\]|[+\-*\/=!<>]+|[.,;:]|[ ])/g) || [line];
    let currentX = x;
    let prevToken = '';
    for (const token of tokens) {
        const color = getTokenColor(token, prevToken);
        ctx.fillStyle = color;
        const tokenWidth = ctx.measureText(token).width;
        // Check if we're exceeding maxWidth
        if (currentX + tokenWidth - x > maxWidth) {
            ctx.fillStyle = '#888888';
            ctx.fillText('...', currentX, y);
            break;
        }
        ctx.fillText(token, currentX, y);
        currentX += tokenWidth;
        prevToken = token;
    }
}
function drawBlocks() {
    ctx.font = `bold ${CONFIG.block.fontSize}px "Courier New", monospace`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    for (const block of state.blocks) {
        if (!block.active)
            continue;
        // Use same color for all blocks - bright cyan/white for high contrast
        const borderColor = '#00ffff';
        const bgColor = 'rgba(0, 20, 40, 0.95)';
        const x = block.pos.x - block.width / 2;
        const y = block.pos.y - block.height / 2;
        // Draw block background - dark for contrast
        ctx.fillStyle = bgColor;
        ctx.fillRect(x, y, block.width, block.height);
        // Draw border - bright cyan
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, block.width, block.height);
        ctx.shadowBlur = 10;
        ctx.shadowColor = borderColor;
        ctx.strokeRect(x, y, block.width, block.height);
        ctx.shadowBlur = 0;
        // Draw language label HIGHER above the box
        ctx.save();
        const labelFontSize = isMobile() ? 10 : 14;
        const labelOffset = isMobile() ? -16 : -22;
        ctx.font = `bold ${labelFontSize}px "Courier New", monospace`;
        ctx.fillStyle = '#00ffff';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#00ffff';
        ctx.fillText(block.language, x + block.width / 2, y + labelOffset);
        ctx.restore();
        // ABSOLUTE CLIPPING - nothing can render outside this
        ctx.save();
        ctx.rect(x + 5, y + 5, block.width - 10, block.height - 10);
        ctx.clip();
        // Draw syntax-highlighted text
        const lines = block.snippet.split('\n');
        const textStartX = x + CONFIG.block.padding;
        const textStartY = y + CONFIG.block.padding;
        const maxTextWidth = block.width - (CONFIG.block.padding * 2) - 10;
        for (let i = 0; i < Math.min(lines.length, 6); i++) {
            const line = lines[i];
            drawSyntaxHighlightedText(line, textStartX, textStartY + (i * CONFIG.block.lineHeight), maxTextWidth);
        }
        ctx.restore();
    }
}
function drawParticles() {
    for (const particle of state.particles) {
        const alpha = particle.life / particle.maxLife;
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(particle.pos.x, particle.pos.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}
function getBlockColor(type) {
    switch (type) {
        case BlockType.Secure:
            return '#00ff41';
        case BlockType.Insecure:
            return '#ffaa00';
        case BlockType.Malware:
            return '#ff0064';
    }
}
// ============================================================================
// HUD & UI
// ============================================================================
function updateHUD() {
    document.getElementById('score').textContent = state.stats.score.toString();
    document.getElementById('level').textContent = state.level.toString();
    document.getElementById('streak').textContent = state.stats.streak.toString();
    const accuracy = state.stats.totalShots > 0
        ? Math.round(((state.stats.insecureHits + state.stats.malwareHits) / state.stats.totalShots) * 100)
        : 0;
    document.getElementById('accuracy').textContent = accuracy + '%';
    // Top row - destroyed
    document.getElementById('secure-destroyed').textContent = state.stats.secureHits.toString();
    document.getElementById('insecure-hits').textContent = state.stats.insecureHits.toString();
    document.getElementById('malware-hits').textContent = state.stats.malwareHits.toString();
    // Bottom row - passed/missed
    document.getElementById('secure-passed').textContent = state.stats.secureReached.toString();
    document.getElementById('insecure-missed').textContent = state.stats.insecureReached.toString();
    document.getElementById('malware-missed').textContent = state.stats.malwareReached.toString();
}
function togglePause() {
    if (state.status === GameStatus.Playing) {
        state.status = GameStatus.Paused;
        showOverlay('GAME PAUSED', 'Press P to continue');
    }
    else if (state.status === GameStatus.Paused) {
        state.status = GameStatus.Playing;
        hideOverlay();
    }
}
function gameOver(reason = 'Game Over') {
    state.status = GameStatus.GameOver;
    let mistakesHTML = '';
    if (state.mistakes.length > 0) {
        mistakesHTML = '<div style="margin-top: 30px; max-height: 400px; overflow-y: auto; text-align: left;">';
        mistakesHTML += '<h3 style="text-align: center; color: #ff5370; margin-bottom: 20px;">📚 LEARNING REVIEW - Your Mistakes</h3>';
        state.mistakes.forEach((mistake, index) => {
            const actionText = mistake.action === 'shot_secure'
                ? '❌ You shot secure code'
                : '⚠️ You missed this vulnerability';
            mistakesHTML += `
                <div style="margin-bottom: 25px; padding: 15px; background: rgba(0, 20, 40, 0.8); border: 2px solid #ff5370; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <strong style="color: #ff5370; font-size: 1.1em;">${actionText} #${index + 1}</strong>
                        <span style="background: rgba(0, 255, 255, 0.2); padding: 4px 10px; border-radius: 4px; color: #00ffff; font-size: 0.9em;">${mistake.language}</span>
                    </div>
            `;
            // Show the code snippet
            mistakesHTML += `
                <div style="background: #000; padding: 10px; border-radius: 5px; border: 1px solid #00ffff; margin: 10px 0; font-family: 'Courier New', monospace; font-size: 0.85em; color: #fff;">
                    <code>${escapeHtml(mistake.snippet)}</code>
                </div>
            `;
            // If we have the annotated data, show educational info
            if (mistake.snippetData) {
                const data = mistake.snippetData;
                if (data.display_name) {
                    mistakesHTML += `<p style="color: #ffaa00; font-weight: bold; margin: 8px 0;">📌 ${data.display_name}</p>`;
                }
                if (data.player_skill) {
                    mistakesHTML += `<p style="color: #00aaff; margin: 8px 0;"><strong>🎯 Skill:</strong> ${data.player_skill}</p>`;
                }
                if (data.analysis_paragraph) {
                    mistakesHTML += `<p style="color: #ccc; margin: 8px 0; font-size: 0.9em; line-height: 1.4;">${data.analysis_paragraph}</p>`;
                }
            }
            mistakesHTML += '</div>';
        });
        mistakesHTML += '</div>';
    }
    const finalStats = `
        <h3>${reason}</h3>
        <div style="margin: 20px 0; padding: 15px; background: rgba(255, 0, 0, 0.2); border: 1px solid #ff0064; border-radius: 5px;">
            <p style="font-size: 1.2em; color: #ff5370;">Final Score: ${state.stats.score}</p>
        </div>
        <h3>FINAL STATISTICS</h3>
        <p>Level Reached: ${state.level}</p>
        <p>Max Streak: ${state.stats.maxStreak}</p>
        <p style="color: #ffaa00;">Insecure Blocks Destroyed: ${state.stats.insecureHits}</p>
        <p style="color: #ff0064;">Malware Destroyed: ${state.stats.malwareHits}</p>
        <p style="color: #ff5370;">Secure Blocks Hit: ${state.stats.secureHits} / ${MAX_SECURE_HITS}</p>
        <p style="color: #ff5370;">Vulnerabilities Missed: ${state.stats.missedVulnerabilities} / ${MAX_MISSED_VULNERABILITIES}</p>
        <p style="margin-top: 20px; color: #00aaff;">Accuracy: ${state.stats.totalShots > 0 ? Math.round(((state.stats.insecureHits + state.stats.malwareHits) / state.stats.totalShots) * 100) : 0}%</p>
        ${mistakesHTML}
    `;
    showOverlay('GAME OVER', 'Press R to restart', finalStats);
}
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
function showOverlay(title, message, stats = '') {
    document.getElementById('overlayTitle').textContent = title;
    document.getElementById('overlayMessage').textContent = message;
    document.getElementById('finalStats').innerHTML = stats;
    document.getElementById('gameOverlay').classList.remove('hidden');
}
function hideOverlay() {
    document.getElementById('gameOverlay').classList.add('hidden');
}
function showCodeModal(block) {
    document.getElementById('codeModalLanguage').textContent = `${block.language} Code`;
    document.getElementById('codeModalBody').textContent = block.snippet;
    document.getElementById('codeModal').classList.remove('hidden');
}
function hideCodeModal() {
    document.getElementById('codeModal').classList.add('hidden');
}
function checkCodeBlockClick(x, y) {
    // Convert screen coordinates to canvas coordinates
    const rect = canvas.getBoundingClientRect();
    const scaleX = CONFIG.canvas.width / rect.width;
    const scaleY = CONFIG.canvas.height / rect.height;
    const canvasX = x * scaleX;
    const canvasY = y * scaleY;
    // Check if click is on any code block
    for (const block of state.blocks) {
        if (!block.active)
            continue;
        const blockLeft = block.pos.x - block.width / 2;
        const blockRight = block.pos.x + block.width / 2;
        const blockTop = block.pos.y - block.height / 2;
        const blockBottom = block.pos.y + block.height / 2;
        if (canvasX >= blockLeft && canvasX <= blockRight &&
            canvasY >= blockTop && canvasY <= blockBottom) {
            return block;
        }
    }
    return null;
}
// ============================================================================
// START GAME
// ============================================================================
window.addEventListener('DOMContentLoaded', init);
