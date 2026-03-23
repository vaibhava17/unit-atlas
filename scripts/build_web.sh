#!/bin/bash
set -e

PROJ_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WEB_DIR="$PROJ_ROOT/web"
STATIC_DIR="$PROJ_ROOT/static"

cd "$WEB_DIR"

echo "Installing dependencies..."
npm install

echo "Running tests..."
npm test

echo "Building Next.js app..."
npm run build

echo "Copying build to static/..."
rm -rf "$STATIC_DIR"
cp -r "$WEB_DIR/out" "$STATIC_DIR"

echo "Done. Static files at $STATIC_DIR"
