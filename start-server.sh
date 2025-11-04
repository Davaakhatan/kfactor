#!/bin/bash
# XFactor API Server Startup Script

echo "🚀 Starting XFactor API Server..."
echo ""

# Kill any existing server on port 3001
lsof -ti:3001 | xargs kill -9 2>/dev/null

# Start the server
npm run server

