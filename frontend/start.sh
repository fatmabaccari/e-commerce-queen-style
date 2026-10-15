#!/bin/sh
# Startup script for Next.js on Railway
# This ensures next is found and PORT is handled correctly

# Use PORT from Railway or default to 3001
PORT=${PORT:-3001}

# Start Next.js - try direct path first, then npx as fallback
if [ -f "node_modules/.bin/next" ]; then
  exec node_modules/.bin/next start -p $PORT -H 0.0.0.0
else
  exec npx next start -p $PORT -H 0.0.0.0
fi

