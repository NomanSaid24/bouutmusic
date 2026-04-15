$ErrorActionPreference = 'Stop'

param(
    [string]$Domain = 'mediumblue-kangaroo-976380.hostingersite.com',
    [switch]$UploadFrontendZip
)

$hostIp = '88.223.85.83'
$port = 65002
$username = 'u296458206'

$localFrontendZip = Join-Path $PSScriptRoot 'frontend-deploy.zip'
$remoteHome = "/home/$username"
$domainRoot = "$remoteHome/domains/$domain"
$appRoot = "$domainRoot/public_html"
$sourceDir = "$appRoot/.builds/source"
$nodejsDir = "$domainRoot/nodejs"
$remoteFrontendZip = "$remoteHome/frontend-deploy.zip"

function Assert-CommandExists {
    param([string]$CommandName)

    Get-Command $CommandName -ErrorAction Stop | Out-Null
}

function Invoke-HostingerSSH {
    param([string]$RemoteCommand)

    & ssh -p $port "$username@$hostIp" $RemoteCommand
    if ($LASTEXITCODE -ne 0) {
        throw "SSH command failed with exit code $LASTEXITCODE."
    }
}

function Upload-FrontendZip {
    Assert-CommandExists 'scp'

    if (-not (Test-Path $localFrontendZip)) {
        throw "Local frontend zip not found: $localFrontendZip"
    }

    Write-Host "Uploading frontend zip to $remoteFrontendZip ..." -ForegroundColor Cyan
    & scp -P $port $localFrontendZip "${username}@${hostIp}:$remoteFrontendZip"
    if ($LASTEXITCODE -ne 0) {
        throw "SCP upload failed with exit code $LASTEXITCODE."
    }
}

Assert-CommandExists 'ssh'

$inspectCommand = @'
set -eu
APP_ROOT="__APP_ROOT__"
DOMAIN_ROOT="__DOMAIN_ROOT__"
SOURCE_DIR="__SOURCE_DIR__"
NODEJS_DIR="__NODEJS_DIR__"

echo "App root: $APP_ROOT"
if [ -d "$APP_ROOT" ]; then
  ls -la "$APP_ROOT"
else
  echo "App root not found."
fi

echo
echo "Source dir: $SOURCE_DIR"
if [ -d "$SOURCE_DIR" ]; then
  ls -la "$SOURCE_DIR"
else
  echo "Source dir not found."
fi

echo
echo "Node.js dir: $NODEJS_DIR"
if [ -d "$NODEJS_DIR" ]; then
  ls -la "$NODEJS_DIR"
else
  echo "Node.js dir not found."
fi

echo
if [ -d "$SOURCE_DIR" ]; then
  echo "Current extracted source size:"
  du -sh "$SOURCE_DIR" || true
else
  echo "No extracted source directory found."
fi

echo
if [ -d "$NODEJS_DIR" ]; then
  echo "Current nodejs runtime size:"
  du -sh "$NODEJS_DIR" || true
  echo
  echo "server.js files under domain root:"
  find "$DOMAIN_ROOT" -maxdepth 3 -name "server.js" -print || true
else
  echo "No nodejs runtime directory found."
fi
'@
$inspectCommand = $inspectCommand.Replace('__APP_ROOT__', $appRoot).Replace('__DOMAIN_ROOT__', $domainRoot).Replace('__SOURCE_DIR__', $sourceDir).Replace('__NODEJS_DIR__', $nodejsDir)

$cleanupCommand = @'
set -eu
APP_ROOT="__APP_ROOT__"
DOMAIN_ROOT="__DOMAIN_ROOT__"
SOURCE_DIR="__SOURCE_DIR__"
NODEJS_DIR="__NODEJS_DIR__"

case "$SOURCE_DIR" in
  "$APP_ROOT"/.builds/source) ;;
  *)
    echo "Safety check failed for source target: $SOURCE_DIR" >&2
    exit 1
    ;;
esac

case "$NODEJS_DIR" in
  "$DOMAIN_ROOT"/nodejs) ;;
  *)
    echo "Safety check failed for nodejs target: $NODEJS_DIR" >&2
    exit 1
    ;;
esac

STAMP="$(date +%Y%m%d%H%M%S)"

if [ -d "$SOURCE_DIR" ]; then
  BACKUP_DIR="$SOURCE_DIR.backup.$STAMP"
  mv "$SOURCE_DIR" "$BACKUP_DIR"
  echo "Moved stale extracted source to: $BACKUP_DIR"
else
  echo "No extracted source directory found, nothing to clean."
fi

if [ -d "$NODEJS_DIR" ]; then
  BACKUP_DIR="$NODEJS_DIR.backup.$STAMP"
  mv "$NODEJS_DIR" "$BACKUP_DIR"
  echo "Moved stale nodejs runtime to: $BACKUP_DIR"
else
  echo "No nodejs runtime directory found, nothing to clean."
fi
'@
$cleanupCommand = $cleanupCommand.Replace('__APP_ROOT__', $appRoot).Replace('__DOMAIN_ROOT__', $domainRoot).Replace('__SOURCE_DIR__', $sourceDir).Replace('__NODEJS_DIR__', $nodejsDir)

Write-Host "Inspecting Hostinger frontend directories..." -ForegroundColor Cyan
Invoke-HostingerSSH -RemoteCommand $inspectCommand

Write-Host ""
Write-Host "Cleaning stale .builds/source and nodejs runtime directories..." -ForegroundColor Cyan
Invoke-HostingerSSH -RemoteCommand $cleanupCommand

Write-Host ""
Write-Host "Verifying remote directories after cleanup..." -ForegroundColor Cyan
Invoke-HostingerSSH -RemoteCommand $inspectCommand

if ($UploadFrontendZip) {
    Write-Host ""
    Upload-FrontendZip
    Write-Host "Frontend zip copied to your remote home directory. hPanel redeploy still requires selecting the zip in the deployment UI." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Done." -ForegroundColor Green
Write-Host "Next step in hPanel: Deployments -> Settings and redeploy -> upload frontend-deploy.zip -> Save and redeploy."
