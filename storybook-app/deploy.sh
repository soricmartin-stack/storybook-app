#!/bin/bash

# StoryTime Creator - Quick Deploy Script

echo "🚀 StoryTime Creator - Deployment Script"
echo "=========================================="
echo ""

# Check if user wants to deploy to Vercel
echo "Choose your deployment platform:"
echo "1. Vercel (Recommended - Free, Fast)"
echo "2. Netlify (Alternative - Free, Easy)"
echo "3. Local Preview (View on this computer)"
echo ""

read -p "Enter your choice (1/2/3): " choice

case $choice in
  1)
    echo ""
    echo "📦 Deploying to Vercel..."
    echo ""
    echo "Step 1: Go to https://vercel.com"
    echo "Step 2: Sign in with GitHub"
    echo "Step 3: Click 'Add New Project'"
    echo "Step 4: Select 'soricmartin-stack/storybook-app'"
    echo "Step 5: Use these settings:"
    echo "   - Framework Preset: Expo"
    echo "   - Build Command: npx expo export --platform web"
    echo "   - Output Directory: dist"
    echo "Step 6: Click 'Deploy'"
    echo ""
    echo "✅ Your app will be live at: https://storytime-creator.vercel.app"
    ;;
    
  2)
    echo ""
    echo "📦 Deploying to Netlify..."
    echo ""
    echo "Step 1: Go to https://netlify.com"
    echo "Step 2: Sign in with GitHub"
    echo "Step 3: Click 'Add new site' > 'Import an existing project'"
    echo "Step 4: Select 'soricmartin-stack/storybook-app'"
    echo "Step 5: Use these settings:"
    echo "   - Build command: npx expo export --platform web"
    echo "   - Publish directory: dist"
    echo "Step 6: Click 'Deploy site'"
    echo ""
    echo "✅ Your app will be live at: https://storytime-creator.netlify.app"
    ;;
    
  3)
    echo ""
    echo "📦 Starting local preview..."
    echo ""
    npx serve dist
    ;;
esac

echo ""
echo "🌐 After deployment, share this URL with anyone!"
echo "📱 The web version works on mobile and desktop browsers"
echo ""
