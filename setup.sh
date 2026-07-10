#!/bin/bash

echo "🚀 Setting up Spendly — Smart Expense Tracker..."
echo ""

# Check Node
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Please install Node.js v18+ from https://nodejs.org"
  exit 1
fi

echo "✅ Node.js $(node -v) found"

# Setup backend
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ ! -f .env ]; then
  cp .env.example .env
  echo "📝 Created backend/.env from .env.example"
  echo "⚠️  Please edit backend/.env with your MongoDB URI before starting!"
fi
cd ..

# Setup frontend
echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Edit backend/.env with your MONGODB_URI"
echo "  2. Run backend: cd backend && npm run dev"
echo "  3. Run frontend: cd frontend && npm run dev"
echo "  4. Open http://localhost:5173"
echo ""
echo "💡 Quick start with 2 terminals:"
echo "   Terminal 1: cd backend && npm run dev"
echo "   Terminal 2: cd frontend && npm run dev"
