// ============================================================================
// CODE INVADERS - Secure Coding Training Game
// ============================================================================

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const CONFIG = {
    canvas: {
        width: 1400,
        height: 700,
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
        width: 280,
        height: 110,
        initialSpeed: 40,
        speedIncrement: 3,
        maxSpeed: 150,
        fontSize: 13,
        lineHeight: 16,
        padding: 12,
        maxCharsPerLine: 40,
    },
    lanes: {
        count: 5,
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

// ============================================================================
// CODE SNIPPETS - Loaded from code-invaders-trend-pack.json
// ============================================================================

interface CodeSnippet {
    type: string;
    category: string;
    language: string;
    snippet: string;
    look_for: string;
    why_it_matters: string;
}

interface TrendPackData {
    meta: {
        name: string;
        generated_on: string;
        counts: {
            insecure: number;
            malware: number;
            total: number;
        };
    };
    insecure: CodeSnippet[];
    malware: CodeSnippet[];
}

interface SnippetData {
    secure: string[];
    insecure: string[];
    malware: string[];
}

let SNIPPETS: SnippetData = {
    secure: [],
    insecure: [],
    malware: [],
};

// ============================================================================
// TYPES & ENUMS
// ============================================================================

enum BlockType {
    Secure = 'secure',
    Insecure = 'insecure',
    Malware = 'malware',
}

enum GameStatus {
    Playing = 'playing',
    Paused = 'paused',
    GameOver = 'gameover',
}

interface Vector2 {
    x: number;
    y: number;
}

interface Entity {
    pos: Vector2;
    vel: Vector2;
    width: number;
    height: number;
}

interface Player extends Entity {
    lastShot: number;
}

interface Bullet extends Entity {
    active: boolean;
}

interface CodeBlock extends Entity {
    type: BlockType;
    snippet: string;
    lane: number;
    active: boolean;
}

interface Particle {
    pos: Vector2;
    vel: Vector2;
    life: number;
    maxLife: number;
    color: string;
    size: number;
}

interface GameStats {
    score: number;
    streak: number;
    maxStreak: number;
    totalShots: number;
    secureHits: number;
    insecureHits: number;
    malwareHits: number;
    secureReached: number;
    insecureReached: number;
    malwareReached: number;
    missedVulnerabilities: number;
}

const MAX_SECURE_HITS = 15;
const MAX_MISSED_VULNERABILITIES = 15;

interface GameState {
    status: GameStatus;
    time: number;
    level: number;
    spawnTimer: number;
    spawnInterval: number;
    blockSpeed: number;
    malwareChance: number;
    player: Player;
    bullets: Bullet[];
    blocks: CodeBlock[];
    particles: Particle[];
    stats: GameStats;
    laneCooldowns: number[];
    screenShake: number;
    flashEffect: { alpha: number; color: string } | null;
}

// ============================================================================
// GAME STATE
// ============================================================================

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let state: GameState;
let keys: { [key: string]: boolean } = {};

// Lane positions
let lanePositions: number[] = [];

// ============================================================================
// INITIALIZATION
// ============================================================================

async function loadSnippets(): Promise<void> {
    try {
        // Try loading the new trend pack first
        const response = await fetch('code-invaders-trend-pack.json');
        if (!response.ok) {
            throw new Error('Failed to load code-invaders-trend-pack.json');
        }
        const trendPack: TrendPackData = await response.json();
        
        // Extract snippets from the trend pack format
        SNIPPETS.insecure = trendPack.insecure.map(item => item.snippet);
        SNIPPETS.malware = trendPack.malware.map(item => item.snippet);
        
        // Add secure code examples (not in trend pack, so we define them here)
        SNIPPETS.secure = [
            'stmt = conn.prepareStatement("SELECT * FROM users WHERE id=?")',
            'const result = await db.query("SELECT * FROM posts WHERE id=$1", [postId])',
            'cursor.execute("SELECT * FROM accounts WHERE email=?", (email,))',
            'PreparedStatement ps = conn.prepareStatement("SELECT * FROM files WHERE id=?")',
            'const safe = DOMPurify.sanitize(userInput)',
            'User.where(id: params[:id]).first',
            'password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt())',
            'const token = jwt.sign(payload, secret, {expiresIn: "1h"})',
            'if (!validator.isEmail(email)) throw new Error("Invalid")',
            'db.collection.findOne({_id: new ObjectId(id)})',
            'const escaped = escapeHtml(userInput)',
            'crypto.randomBytes(32).toString("hex")',
        ];
        
        console.log('✓ Loaded Code Invaders Trend Pack:', {
            secure: SNIPPETS.secure.length,
            insecure: SNIPPETS.insecure.length,
            malware: SNIPPETS.malware.length,
            total: SNIPPETS.secure.length + SNIPPETS.insecure.length + SNIPPETS.malware.length
        });
        console.log('  Pack:', trendPack.meta.name);
        console.log('  Generated:', trendPack.meta.generated_on);
    } catch (error) {
        console.error('Error loading trend pack:', error);
        console.log('Attempting to load fallback snippets.json...');
        
        // Try the old format as fallback
        try {
            const fallbackResponse = await fetch('snippets.json');
            if (fallbackResponse.ok) {
                SNIPPETS = await fallbackResponse.json();
                console.log('✓ Loaded fallback snippets.json');
            } else {
                throw new Error('Fallback also failed');
            }
        } catch (fallbackError) {
            console.error('Fallback failed, using minimal snippets');
            // Use minimal snippets as last resort
            SNIPPETS = {
                secure: ['PreparedStatement ps = conn.prepareStatement(?)'],
                insecure: ['query = "SELECT * FROM users WHERE id=" + userId'],
                malware: ['eval(atob("dmFyIGE9ZG9jdW1lbnQuY29va2ll"))'],
            };
        }
    }
}

async function init() {
    canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    canvas.width = CONFIG.canvas.width;
    canvas.height = CONFIG.canvas.height;
    ctx = canvas.getContext('2d')!;

    // Load snippets from JSON file
    await loadSnippets();

    calculateLanePositions();
    resetGame();
    setupEventListeners();
    gameLoop(0);
}

function calculateLanePositions() {
    const laneWidth = CONFIG.canvas.width / CONFIG.lanes.count;
    lanePositions = [];
    for (let i = 0; i < CONFIG.lanes.count; i++) {
        lanePositions.push(laneWidth * i + laneWidth / 2);
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
    };
    updateHUD();
    hideOverlay();
}

function setupEventListeners() {
    window.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true;

        if (e.key.toLowerCase() === 'p') {
            togglePause();
        } else if (e.key.toLowerCase() === 'r' && state.status === GameStatus.GameOver) {
            resetGame();
        } else if (e.key === ' ') {
            e.preventDefault();
            if (state.status === GameStatus.Playing) {
                shoot();
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
    });
}

// ============================================================================
// GAME LOOP
// ============================================================================

let lastTime = 0;

function gameLoop(timestamp: number) {
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

function update(dt: number) {
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

        state.spawnInterval = Math.max(
            CONFIG.spawn.minInterval,
            state.spawnInterval - CONFIG.spawn.intervalDecrement
        );

        state.blockSpeed = Math.min(
            CONFIG.block.maxSpeed,
            state.blockSpeed + CONFIG.block.speedIncrement
        );

        state.malwareChance = Math.min(
            CONFIG.difficulty.malwareChanceMax,
            state.malwareChance + CONFIG.difficulty.malwareChanceIncrement
        );
    }
}

function updatePlayer(dt: number) {
    state.player.vel.x = 0;

    if (keys['arrowleft'] || keys['a']) {
        state.player.vel.x = -CONFIG.player.speed;
    }
    if (keys['arrowright'] || keys['d']) {
        state.player.vel.x = CONFIG.player.speed;
    }

    state.player.pos.x += state.player.vel.x * dt;

    state.player.pos.x = Math.max(
        state.player.width / 2,
        Math.min(CONFIG.canvas.width - state.player.width / 2, state.player.pos.x)
    );
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

function updateBullets(dt: number) {
    for (const bullet of state.bullets) {
        if (!bullet.active) continue;

        bullet.pos.y += bullet.vel.y * dt;

        if (bullet.pos.y < -bullet.height) {
            bullet.active = false;
        }
    }

    state.bullets = state.bullets.filter((b) => b.active);
}

function updateBlocks(dt: number) {
    const baseLineY = CONFIG.canvas.height - 40;

    for (const block of state.blocks) {
        if (!block.active) continue;

        block.pos.y += state.blockSpeed * dt;

        if (block.pos.y - block.height / 2 > baseLineY) {
            block.active = false;
            handleBlockReachedBase(block);
        }
    }

    state.blocks = state.blocks.filter((b) => b.active);
}

function updateParticles(dt: number) {
    for (const particle of state.particles) {
        particle.pos.x += particle.vel.x * dt;
        particle.pos.y += particle.vel.y * dt;
        particle.life -= dt;
    }

    state.particles = state.particles.filter((p) => p.life > 0);
}

function updateSpawning(dt: number) {
    state.spawnTimer -= dt;

    for (let i = 0; i < state.laneCooldowns.length; i++) {
        state.laneCooldowns[i] -= dt;
    }

    if (state.spawnTimer <= 0) {
        spawnBlock();
        state.spawnTimer = state.spawnInterval;
    }
}

function updateEffects(dt: number) {
    if (state.screenShake > 0) {
        state.screenShake -= dt * 5;
        if (state.screenShake < 0) state.screenShake = 0;
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

    if (availableLanes.length === 0) return;

    const lane = availableLanes[Math.floor(Math.random() * availableLanes.length)];
    const type = determineBlockType();
    const snippet = getRandomSnippet(type);

    state.blocks.push({
        pos: {
            x: lanePositions[lane],
            y: -CONFIG.block.height / 2,
        },
        vel: { x: 0, y: state.blockSpeed },
        width: CONFIG.block.width,
        height: CONFIG.block.height,
        type,
        snippet,
        lane,
        active: true,
    });

    state.laneCooldowns[lane] = CONFIG.spawn.laneBuffer / state.blockSpeed;
}

function determineBlockType(): BlockType {
    const rand = Math.random();

    if (rand < state.malwareChance) {
        return BlockType.Malware;
    } else if (rand < state.malwareChance + CONFIG.difficulty.insecureChance) {
        return BlockType.Insecure;
    } else {
        return BlockType.Secure;
    }
}

function getRandomSnippet(type: BlockType): string {
    const snippets = SNIPPETS[type];
    return snippets[Math.floor(Math.random() * snippets.length)];
}

// ============================================================================
// COLLISION DETECTION
// ============================================================================

function checkCollisions() {
    for (const bullet of state.bullets) {
        if (!bullet.active) continue;

        for (const block of state.blocks) {
            if (!block.active) continue;

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

function checkAABB(a: Entity, b: Entity): boolean {
    return (
        a.pos.x - a.width / 2 < b.pos.x + b.width / 2 &&
        a.pos.x + a.width / 2 > b.pos.x - b.width / 2 &&
        a.pos.y - a.height / 2 < b.pos.y + b.height / 2 &&
        a.pos.y + a.height / 2 > b.pos.y - b.height / 2
    );
}

// ============================================================================
// SCORING & FEEDBACK
// ============================================================================

function handleBlockHit(block: CodeBlock) {
    let points = 0;
    let correctHit = false;

    switch (block.type) {
        case BlockType.Secure:
            points = CONFIG.scoring.hitSecure;
            state.stats.secureHits++;
            state.stats.streak = 0;
            state.flashEffect = { alpha: 0.5, color: 'rgba(255, 0, 0, ' };
            
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
    if (state.stats.score < 0) state.stats.score = 0;
}

function handleBlockReachedBase(block: CodeBlock) {
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
            
            // Check if too many vulnerabilities missed
            if (state.stats.missedVulnerabilities >= MAX_MISSED_VULNERABILITIES) {
                gameOver('Too many vulnerabilities reached production!');
                return;
            }
            break;
    }

    state.stats.score += points;
    if (state.stats.score < 0) state.stats.score = 0;
}

// ============================================================================
// PARTICLE EFFECTS
// ============================================================================

function createExplosion(pos: Vector2, color: string) {
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

function drawBullets() {
    ctx.fillStyle = '#00ff41';

    for (const bullet of state.bullets) {
        if (!bullet.active) continue;

        ctx.fillRect(
            bullet.pos.x - bullet.width / 2,
            bullet.pos.y - bullet.height / 2,
            bullet.width,
            bullet.height
        );

        ctx.shadowBlur = 5;
        ctx.shadowColor = '#00ff41';
        ctx.fillRect(
            bullet.pos.x - bullet.width / 2,
            bullet.pos.y - bullet.height / 2,
            bullet.width,
            bullet.height
        );
        ctx.shadowBlur = 0;
    }
}

function getTokenColor(token: string, prevToken: string = ''): string {
    // Keywords - purple/blue
    const keywords = ['const', 'let', 'var', 'function', 'if', 'else', 'for', 'while', 'return', 
                     'import', 'from', 'export', 'class', 'new', 'this', 'true', 'false', 'null',
                     'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'def', 'async', 'await'];
    if (keywords.includes(token)) return '#c792ea';
    
    // Dangerous keywords - bright red
    const dangerous = ['eval', 'exec', 'execute', 'system', 'shell', 'atob', 'btoa', 'decode', 
                      'DownloadString', 'IEX', 'curl', 'wget', 'bash'];
    if (dangerous.some(d => token.includes(d))) return '#ff5370';
    
    // Strings - green/yellow
    if (token.startsWith('"') || token.startsWith("'") || token.startsWith('`')) return '#c3e88d';
    
    // Numbers - orange
    if (/^\d+$/.test(token)) return '#f78c6c';
    
    // Function calls - yellow
    if (token.endsWith('(') || prevToken.endsWith('(')) return '#ffcb6b';
    
    // Methods/properties after dot - cyan
    if (prevToken === '.') return '#89ddff';
    
    // Special operators - cyan
    if (['=', '+', '-', '*', '/', '==', '===', '!=', '!==', '=>', '&&', '||'].includes(token)) return '#89ddff';
    
    // Default - white
    return '#ffffff';
}

function drawSyntaxHighlightedText(line: string, x: number, y: number, maxWidth: number) {
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
        if (!block.active) continue;

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
            drawSyntaxHighlightedText(
                line,
                textStartX,
                textStartY + (i * CONFIG.block.lineHeight),
                maxTextWidth
            );
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

function getBlockColor(type: BlockType): string {
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
    document.getElementById('score')!.textContent = state.stats.score.toString();
    document.getElementById('level')!.textContent = state.level.toString();
    document.getElementById('streak')!.textContent = state.stats.streak.toString();

    const accuracy =
        state.stats.totalShots > 0
            ? Math.round(
                  ((state.stats.insecureHits + state.stats.malwareHits) / state.stats.totalShots) * 100
              )
            : 0;
    document.getElementById('accuracy')!.textContent = accuracy + '%';

    // Top row - destroyed
    document.getElementById('secure-destroyed')!.textContent = state.stats.secureHits.toString();
    document.getElementById('insecure-hits')!.textContent = state.stats.insecureHits.toString();
    document.getElementById('malware-hits')!.textContent = state.stats.malwareHits.toString();
    
    // Bottom row - passed/missed
    document.getElementById('secure-passed')!.textContent = state.stats.secureReached.toString();
    document.getElementById('insecure-missed')!.textContent = state.stats.insecureReached.toString();
    document.getElementById('malware-missed')!.textContent = state.stats.malwareReached.toString();
}

function togglePause() {
    if (state.status === GameStatus.Playing) {
        state.status = GameStatus.Paused;
        showOverlay('GAME PAUSED', 'Press P to continue');
    } else if (state.status === GameStatus.Paused) {
        state.status = GameStatus.Playing;
        hideOverlay();
    }
}

function gameOver(reason: string = 'Game Over') {
    state.status = GameStatus.GameOver;

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
    `;

    showOverlay('GAME OVER', 'Press R to restart', finalStats);
}

function showOverlay(title: string, message: string, stats: string = '') {
    document.getElementById('overlayTitle')!.textContent = title;
    document.getElementById('overlayMessage')!.textContent = message;
    document.getElementById('finalStats')!.innerHTML = stats;
    document.getElementById('gameOverlay')!.classList.remove('hidden');
}

function hideOverlay() {
    document.getElementById('gameOverlay')!.classList.add('hidden');
}

// ============================================================================
// START GAME
// ============================================================================

window.addEventListener('DOMContentLoaded', init);
