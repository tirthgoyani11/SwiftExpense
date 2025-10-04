# SwiftExpense Development Setup Script
# Run this script to set up the development environment

Write-Host "🚀 Setting up SwiftExpense Development Environment..." -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check for package managers
$hasYarn = Get-Command yarn -ErrorAction SilentlyContinue
$hasPnpm = Get-Command pnpm -ErrorAction SilentlyContinue
$hasBun = Get-Command bun -ErrorAction SilentlyContinue

if ($hasYarn) {
    Write-Host "✅ Yarn available" -ForegroundColor Green
    $packageManager = "yarn"
} elseif ($hasPnpm) {
    Write-Host "✅ PNPM available" -ForegroundColor Green
    $packageManager = "pnpm"
} elseif ($hasBun) {
    Write-Host "✅ Bun available" -ForegroundColor Green
    $packageManager = "bun"
} else {
    Write-Host "⚠️  Using NPM (consider installing Yarn, PNPM, or Bun for better performance)" -ForegroundColor Yellow
    $packageManager = "npm"
}

# Setup Backend
Write-Host "`n📦 Setting up Backend..." -ForegroundColor Cyan
Set-Location -Path "backend"

if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "⚠️  Please edit backend/.env with your database credentials!" -ForegroundColor Yellow
}

Write-Host "📦 Installing backend dependencies..." -ForegroundColor Cyan
if ($packageManager -eq "npm") {
    npm install
} elseif ($packageManager -eq "yarn") {
    yarn install
} elseif ($packageManager -eq "pnpm") {
    pnpm install
} else {
    bun install
}

# Setup Frontend
Write-Host "`n🎨 Setting up Frontend..." -ForegroundColor Cyan
Set-Location -Path "../frontend"

Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Cyan
if ($packageManager -eq "npm") {
    npm install
} elseif ($packageManager -eq "yarn") {
    yarn install
} elseif ($packageManager -eq "pnpm") {
    pnpm install
} else {
    bun install
}

Set-Location -Path ".."

Write-Host "`n✅ Setup Complete!" -ForegroundColor Green
Write-Host "`n🚀 To start development:" -ForegroundColor Cyan
Write-Host "1. Setup your database and update backend/.env" -ForegroundColor White
Write-Host "2. Start backend: cd backend && $packageManager run dev" -ForegroundColor White
Write-Host "3. Start frontend: cd frontend && $packageManager run dev" -ForegroundColor White
Write-Host "`n📖 Check README.md for detailed instructions" -ForegroundColor Yellow