#!/bin/bash

# ShadowNews File Commenting Automation Script
# This script helps you systematically add detailed comments to all files

echo "🚀 ShadowNews File Commenting Assistant"
echo "======================================"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

echo "📁 Current directory: $(pwd)"
echo "📊 Analyzing project structure..."

# Count files by type
echo ""
echo "📈 File Statistics:"
echo "JavaScript files: $(find . -name "*.js" -not -path "./node_modules/*" | wc -l)"
echo "TypeScript files: $(find . -name "*.ts" -o -name "*.tsx" -not -path "./node_modules/*" | wc -l)"
echo "CSS files: $(find . -name "*.css" -o -name "*.scss" -not -path "./node_modules/*" | wc -l)"
echo "Markdown files: $(find . -name "*.md" -not -path "./node_modules/*" | wc -l)"

echo ""
echo "🔧 Available options:"
echo "1. Run automated commenting (dry-run)"
echo "2. Run automated commenting (with changes)"
echo "3. Run automated commenting (with backups)"
echo "4. Comment specific folder"
echo "5. Comment specific file"
echo "6. Show commenting guide"
echo "7. Generate file list for manual review"

read -p "Choose an option (1-7): " choice

case $choice in
    1)
        echo "🧪 Running dry-run (no files will be changed)..."
        node auto-comment-script.js --dry-run
        ;;
    2)
        echo "⚠️  This will modify your files. Make sure you have a backup!"
        read -p "Continue? (y/N): " confirm
        if [[ $confirm == [yY] ]]; then
            node auto-comment-script.js
        else
            echo "❌ Cancelled."
        fi
        ;;
    3)
        echo "💾 Running with automatic backups..."
        node auto-comment-script.js --backup
        ;;
    4)
        read -p "Enter folder path: " folder
        if [ -d "$folder" ]; then
            echo "📁 Processing folder: $folder"
            node auto-comment-script.js --folder="$folder"
        else
            echo "❌ Folder not found: $folder"
        fi
        ;;
    5)
        read -p "Enter file path: " file
        if [ -f "$file" ]; then
            echo "📄 Processing file: $file"
            node auto-comment-script.js --file="$file"
        else
            echo "❌ File not found: $file"
        fi
        ;;
    6)
        echo "📖 Opening commenting guide..."
        if [ -f "COMMENTING_GUIDE.md" ]; then
            cat COMMENTING_GUIDE.md
        else
            echo "❌ Commenting guide not found. Please run the setup first."
        fi
        ;;
    7)
        echo "📋 Generating file list..."
        find . -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.jsx" | grep -v node_modules | sort > file-list.txt
        echo "✅ File list saved to file-list.txt"
        echo "📊 Found $(wc -l < file-list.txt) files"
        ;;
    *)
        echo "❌ Invalid option"
        ;;
esac

echo ""
echo "✨ Done! Check commenting-log.txt for details."
