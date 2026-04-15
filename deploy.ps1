Write-Host "=========================================="
Write-Host "   Bouut Music cPanel Deploy Builder"
Write-Host "=========================================="
Write-Host ""

$baseDir = "d:\SaliqBanday"
$tempDir = Join-Path $baseDir "deploy_temp"
$zipBuilder = Join-Path $baseDir "create-source-zip.py"

function Copy-DeployItems {
    param(
        [string]$SourceRoot,
        [string]$DestinationRoot,
        [string[]]$Paths
    )

    foreach ($relativePath in $Paths) {
        $sourcePath = Join-Path $SourceRoot $relativePath
        if (Test-Path $sourcePath) {
            Copy-Item -LiteralPath $sourcePath -Destination $DestinationRoot -Recurse -Force
        }
    }
}

function New-SourceZip {
    param(
        [string]$SourceRoot,
        [string]$ZipPath,
        [string[]]$Paths
    )

    & python $zipBuilder $SourceRoot $ZipPath $Paths
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to create zip package: $ZipPath"
    }
}

# Cleanup old zips
if (Test-Path "$baseDir\frontend-deploy.zip") { Remove-Item "$baseDir\frontend-deploy.zip" -Force }
if (Test-Path "$baseDir\backend-deploy.zip") { Remove-Item "$baseDir\backend-deploy.zip" -Force }
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null


# ----------------------------------------------------
# 1. FRONTEND VALIDATION & SOURCE ZIP
# ----------------------------------------------------
Write-Host ">>> 1. Validating Frontend build (Next.js)..." -ForegroundColor Cyan
Set-Location "$baseDir\frontend"
if (Test-Path ".next") { Remove-Item ".next" -Recurse -Force }
npm run build

Write-Host ">>> Packaging Frontend files for cPanel/Namecheap..." -ForegroundColor Cyan
$frontendTemp = Join-Path $tempDir "frontend"
New-Item -ItemType Directory -Force -Path $frontendTemp | Out-Null

Copy-DeployItems -SourceRoot "$baseDir\frontend" -DestinationRoot $frontendTemp -Paths @(
    ".next",
    "src",
    "public",
    "package.json",
    "package-lock.json",
    "server.js",
    "next.config.js",
    "postcss.config.mjs",
    "eslint.config.mjs",
    "tsconfig.json",
    "next-env.d.ts",
    ".env.example",
    ".env.namecheap.example"
)

# Compress
New-SourceZip -SourceRoot $frontendTemp -ZipPath "$baseDir\frontend-deploy.zip" -Paths @(
    ".next",
    "src",
    "public",
    "package.json",
    "package-lock.json",
    "server.js",
    "next.config.js",
    "postcss.config.mjs",
    "eslint.config.mjs",
    "tsconfig.json",
    "next-env.d.ts",
    ".env.example",
    ".env.namecheap.example"
)
Write-Host "==> frontend-deploy.zip created successfully!`n" -ForegroundColor Green


# ----------------------------------------------------
# 2. BACKEND VALIDATION & SOURCE ZIP
# ----------------------------------------------------
Write-Host ">>> 2. Validating Backend build (Node.js/TS)..." -ForegroundColor Cyan
Set-Location "$baseDir\backend"
npm run build

Write-Host ">>> Packaging Backend files for cPanel/Namecheap..." -ForegroundColor Cyan
$backendTemp = Join-Path $tempDir "backend"
New-Item -ItemType Directory -Force -Path $backendTemp | Out-Null

Copy-DeployItems -SourceRoot "$baseDir\backend" -DestinationRoot $backendTemp -Paths @(
    "dist",
    "scripts",
    "src",
    "prisma",
    "package.json",
    "package-lock.json",
    "server.js",
    "tsconfig.json",
    ".env.example",
    ".env.namecheap.example"
)

# Compress
New-SourceZip -SourceRoot $backendTemp -ZipPath "$baseDir\backend-deploy.zip" -Paths @(
    "dist",
    "scripts",
    "src",
    "prisma",
    "package.json",
    "package-lock.json",
    "server.js",
    "tsconfig.json",
    ".env.example",
    ".env.namecheap.example"
)
Write-Host "==> backend-deploy.zip created successfully!`n" -ForegroundColor Green

# Cleanup
Set-Location $baseDir
if (Test-Path $tempDir) {
    try {
        Remove-Item $tempDir -Recurse -Force -ErrorAction Stop
    } catch {
        Write-Warning "Temporary build folder could not be fully removed: $tempDir"
    }
}

Write-Host "=========================================="
Write-Host "   DEPLOYMENT PACKAGES READY"
Write-Host "=========================================="
Write-Host "Files generated: "
Write-Host " - d:\SaliqBanday\frontend-deploy.zip"
Write-Host " - d:\SaliqBanday\backend-deploy.zip"
Write-Host "You can now upload these to your cPanel host such as Namecheap."
Write-Host "=========================================="
