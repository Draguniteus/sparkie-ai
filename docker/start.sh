#!/bin/bash
# Sparkie AI - Unified Start Script
# This script builds the frontend (if needed) and starts the FastAPI backend
# FastAPI serves both the API and the Next.js frontend

set -e

echo "🐝 Sparkie Hive starting up..."

# Navigate to project root
cd /workspace/sparkie-ai

# Check if Next.js needs to be built
if [ ! -d "frontend/.next" ] || [ -z "$(ls -A frontend/.next/server/app 2>/dev/null)" ]; then
    echo "Building Next.js frontend..."
    cd frontend
    npm install
    npm run build
    cd ..
fi

# Copy built frontend files to expected location for FastAPI
echo "Preparing frontend files..."

# Ensure FastAPI can find the frontend
export FRONTEND_DIR="${PWD}/frontend/.next/server/app"

# Start FastAPI
echo "Starting FastAPI backend..."
exec uvicorn backend.app.main:app --host 0.0.0.0 --port 8080 --workers 1
