# Code Invaders 🚀

A retro arcade game for learning to identify secure vs. insecure code patterns. Defend against vulnerable code blocks in this Space Invaders-inspired security training tool!

## 🎮 Game Overview

**Code Invaders** is a browser-based arcade game that helps developers recognize secure coding practices, identify vulnerabilities, and spot malware patterns through engaging gameplay.

### Objective

- **Destroy** insecure and malware code blocks as they fall
- **Avoid hitting** secure code blocks (they're the good guys!)
- Survive as long as possible while maximizing your score

## 🎯 Gameplay

### Controls

- **← → or A/D**: Move spaceship left/right
- **SPACE**: Shoot
- **P**: Pause/Resume
- **R**: Restart (after game over)

### Block Types

1. **🟢 Secure Code (Green)**
   - Best practices: prepared statements, parameterized queries, proper validation
   - **DON'T SHOOT!** Penalty: -15 points

2. **🟡 Insecure Code (Orange)**
   - Vulnerabilities: SQL injection, eval(), unsafe shell execution
   - **DESTROY!** Reward: +10 points

3. **🔴 Malware (Red/Purple)**
   - Obfuscated code, C2 beacons, suspicious patterns
   - **DESTROY!** Reward: +25 points

### Scoring System

| Action | Points |
|--------|--------|
| Hit Insecure Block | +10 |
| Hit Malware Block | +25 |
| Hit Secure Block | -15 |
| Insecure Reaches Base | -20 |
| Malware Reaches Base | -40 |
| Secure Reaches Base | +2 |
| **Combo (3+ streak)** | **1.5x multiplier** |

### Features

- **5 Vertical Lanes**: Code blocks fall along defined lanes
- **Progressive Difficulty**: Spawn rate and speed increase over time
- **Streak System**: Chain correct hits for combo bonuses
- **Level Progression**: Based on survival time
- **Real Code Examples**: Learn from actual secure/insecure patterns
- **Retro Aesthetics**: Neon visuals, screen shake, particle effects

## 🚀 Quick Start

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation & Running

1. **Clone or download this repository**

2. **Install TypeScript compiler** (if not already installed):
   ```bash
   npm install -g typescript
   ```

3. **Compile TypeScript to JavaScript**:
   ```bash
   tsc src/main.ts --outDir dist --target ES6 --lib ES6,DOM
   ```

4. **Serve the game**:
   
   **Option A: Using Python**
   ```bash
   python3 -m http.server 8000
   ```
   
   **Option B: Using Node.js**
   ```bash
   npx http-server -p 8000
   ```
   
   **Option C: Using VS Code Live Server extension**
   - Install "Live Server" extension
   - Right-click `index.html` and select "Open with Live Server"

5. **Open in browser**: Navigate to `http://localhost:8000`

## 📁 Project Structure

```
code-invaders/
│
├── index.html          # Main HTML file
├── styles.css          # Game styling and UI
├── snippets.json       # Code snippets database (EASY TO EDIT!)
├── src/
│   └── main.ts         # TypeScript game source code
├── dist/
│   └── main.js         # Compiled JavaScript (generated)
└── README.md           # This file
```

## 🎨 Architecture

The game follows a clean entity-component architecture:

### Core Systems

1. **Game State Management**
   - Centralized state object
   - Status tracking (playing, paused, game over)
   - Statistics and scoring

2. **Entity System**
   - Player: User-controlled spaceship
   - Bullets: Player projectiles
   - CodeBlocks: Falling code snippets
   - Particles: Explosion effects

3. **Game Loop**
   - 60 FPS target using `requestAnimationFrame`
   - Delta-time based updates for smooth animation
   - Capped delta to prevent large time jumps

4. **Collision Detection**
   - Axis-Aligned Bounding Box (AABB) collision
   - Efficient bullet-block intersection checks

5. **Difficulty Scaling**
   - Level progression every 15 seconds
   - Dynamic spawn rate adjustment
   - Increasing fall speed
   - Growing malware probability

## 🔧 Customization

### Tweaking Gameplay

Edit the `CONFIG` object in `src/main.ts`:

```typescript
const CONFIG = {
    // Adjust player speed
    player: {
        speed: 300,        // Pixels per second
        shootCooldown: 0.25, // Seconds between shots
    },
    
    // Modify block behavior
    block: {
        initialSpeed: 60,  // Starting fall speed
        speedIncrement: 5, // Speed increase per level
    },
    
    // Change scoring
    scoring: {
        hitInsecure: 10,
        hitMalware: 25,
        hitSecure: -15,
        // ... etc
    },
    
    // Adjust difficulty curve
    difficulty: {
        levelDuration: 15,          // Seconds per level
        malwareChanceStart: 0.15,   // 15% initially
        malwareChanceMax: 0.35,     // Max 35%
    },
};
```

### Adding Code Snippets

**Easy!** Just edit `snippets.json` - no coding required:

```json
{
  "secure": [
    "stmt = conn.prepare(\"SELECT * FROM users WHERE id=?\")",
    "bcrypt.hash(password, 12)",
    "Add your new secure example here"
  ],
  "insecure": [
    "query = \"SELECT * FROM users WHERE id=\" + userId",
    "eval(userInput)",
    "Add your new vulnerability example here"
  ],
  "malware": [
    "eval(atob(\"dmFyIGE9ZG9jdW1lbnQuY29va2ll\"))",
    "Add your new malware pattern here"
  ]
}
```

The game automatically loads snippets from this file on startup. Just refresh the browser to see your changes!

## 📚 Educational Value

This game teaches recognition of:

### Secure Patterns
- Parameterized queries
- Input validation
- Proper encoding/escaping
- Secure cryptographic practices
- Safe subprocess execution

### Insecure Patterns
- SQL injection vulnerabilities
- Command injection flaws
- Cross-site scripting (XSS) vectors
- Unsafe deserialization
- Weak authentication

### Malware Indicators
- Base64/hex obfuscation
- Suspicious network beacons
- PowerShell download-execute patterns
- Shellcode execution
- Encrypted payloads with XOR

## 🐛 Troubleshooting

### TypeScript compilation errors
```bash
# Make sure you're in the project root
tsc src/main.ts --outDir dist --target ES6 --lib ES6,DOM
```

### Canvas not rendering
- Check browser console for errors
- Ensure `dist/main.js` exists and is loaded
- Verify canvas element exists in DOM

### Performance issues
- Close other browser tabs
- Check FPS in browser dev tools
- Reduce particle count in code if needed

## 🎓 Learning Tips

1. **Start by observing**: Let blocks fall to learn patterns
2. **Focus on keywords**: `eval()`, `execute()`, `base64`, `+` in SQL
3. **Avoid panic shooting**: Accuracy matters!
4. **Build streaks**: Combo multipliers significantly boost score
5. **Watch the base line**: Don't let malware through!

## 🔮 Future Enhancements

Potential additions:
- Power-ups (slow-mo, multi-shot, shield)
- Boss blocks (large vulnerabilities requiring multiple hits)
- Multiplayer mode
- Leaderboards
- More code languages
- Difficulty settings
- Sound effects and music
- Mobile touch controls

## 🌐 Deploying Live

Want to publish your game online? See **[DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md)** for complete instructions!

**Quick Deploy:**
```bash
./deploy-prep.sh
```

Then choose from:
- **Netlify** (easiest - drag & drop)
- **GitHub Pages** (free hosting)
- **Vercel** (auto-deploy)
- And more!

## 📄 License

This project is provided as-is for educational purposes. Feel free to modify and extend!

## 🙏 Credits

Built as a secure coding training tool combining gaming and education.

---

**Ready to defend against insecure code? Load up and start playing!** 🎮🔐
