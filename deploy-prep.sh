#!/bin/bash

# Code Invaders - Deployment Preparation Script
# This script prepares your game for deployment

echo "🚀 Code Invaders - Deployment Preparation"
echo "=========================================="
echo ""

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed! Please fix errors and try again."
    exit 1
fi

echo ""
echo "📋 Deployment Checklist:"
echo "✅ index.html exists"
echo "✅ styles.css exists"
echo "✅ snippets.json exists"
echo "✅ dist/main.js exists"
echo ""

echo "🎯 Your game is ready to deploy!"
echo ""
echo "Choose your deployment method:"
echo ""
echo "1️⃣  NETLIFY (Easiest - Drag & Drop):"
echo "   → Go to netlify.com"
echo "   → Drag the 'code-invaders' folder"
echo "   → Done in 30 seconds!"
echo ""
echo "2️⃣  GITHUB PAGES:"
echo "   → Run: git add ."
echo "   → Run: git commit -m 'Deploy game'"
echo "   → Run: git push"
echo "   → Enable GitHub Pages in repo settings"
echo ""
echo "3️⃣  VERCEL:"
echo "   → Go to vercel.com"
echo "   → Import your GitHub repo"
echo "   → Auto-deploys on every push!"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT-GUIDE.md"
echo ""
