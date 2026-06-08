<#
.SYNOPSIS
  Disaster-recovery drill: download a backup from S3 and restore it into a
  throwaway local MongoDB container — WITHOUT ever touching production.

.DESCRIPTION
  Proves a backup is actually restorable (not silently corrupt/incomplete).
  By default it grabs the LATEST backup, restores it, prints document counts,
  then tears everything down. Use -Keep to leave the container running so you
  can browse the data visually in MongoDB Compass.

  Requires: Docker + AWS CLI (admin creds via `aws configure`) + mongorestore.

.EXAMPLE
  .\scripts\restore-test.ps1
  # restore the latest backup, verify counts, clean up

.EXAMPLE
  .\scripts\restore-test.ps1 -Keep
  # restore latest, leave it running, then open Compass on mongodb://localhost:27018

.EXAMPLE
  .\scripts\restore-test.ps1 -Key backup-2026-06-01_020000.gz
  # restore a specific older backup
#>
[CmdletBinding()]
param(
  [string]$Bucket = "snlingeri-db-backups",
  [string]$Prefix = "mongo",
  [string]$Region = "ap-northeast-1",
  [string]$Key,                       # specific backup file; default = latest
  [int]$Port = 27018,
  [string]$DbName = "snlingeri",
  [switch]$Keep,                      # leave container up for Compass inspection
  [string]$Aws = "C:\Program Files\Amazon\AWSCLIV2\aws.exe",
  [string]$Mongorestore = "C:\Users\dell\Downloads\mongodb-database-tools-windows-x86_64-100.12.1\bin\mongorestore.exe"
)

$ErrorActionPreference = "Stop"
$container = "mongo-restore-test"

# Remove the container only if it already exists — avoids `docker rm` writing to
# stderr (which PowerShell 5.1 turns into a terminating error under -Stop).
function Remove-ContainerIfExists {
  param([string]$Name)
  $id = docker ps -aq -f "name=^$Name$"
  if ($id) { docker rm -f $Name | Out-Null }
}

if (-not (Test-Path $Aws)) { $Aws = "aws" }
if (-not (Test-Path $Mongorestore)) {
  throw "mongorestore not found at '$Mongorestore'. Pass -Mongorestore <path> to its location."
}

# 1) Pick the latest backup if no key was given
if (-not $Key) {
  Write-Host "Finding latest backup in s3://$Bucket/$Prefix/ ..."
  $list = & $Aws s3 ls "s3://$Bucket/$Prefix/" --region $Region
  if ($LASTEXITCODE -ne 0) { throw "aws s3 ls failed (exit $LASTEXITCODE)" }
  $Key = $list | Where-Object { $_ -match '\.gz$' } |
         ForEach-Object { ($_ -split '\s+')[-1] } | Sort-Object | Select-Object -Last 1
  if (-not $Key) { throw "No .gz backups found in s3://$Bucket/$Prefix/" }
}
Write-Host "Backup under test: $Key`n"

# 2) Download it
$dir = Join-Path $env:TEMP "restore-test"
New-Item -ItemType Directory -Force -Path $dir | Out-Null
$local = Join-Path $dir $Key
& $Aws s3 cp "s3://$Bucket/$Prefix/$Key" $local --region $Region
if ($LASTEXITCODE -ne 0) { throw "Download failed (exit $LASTEXITCODE)" }

# 3) Spin up an isolated throwaway MongoDB
Remove-ContainerIfExists $container
docker run -d --name $container -p "${Port}:27017" mongo:7 | Out-Null
if ($LASTEXITCODE -ne 0) { throw "docker run failed (exit $LASTEXITCODE)" }

# 4) Wait until it answers (startup pings are expected to fail, so quiet them)
$ready = $false
$savedEap = $ErrorActionPreference; $ErrorActionPreference = "SilentlyContinue"
for ($i = 0; $i -lt 45; $i++) {
  $r = docker exec $container mongosh --quiet --eval "db.runCommand({ping:1}).ok" 2>$null
  if ("$r".Trim() -eq "1") { $ready = $true; break }
  Start-Sleep -Seconds 2
}
$ErrorActionPreference = $savedEap
if (-not $ready) { Remove-ContainerIfExists $container; throw "Container never became ready" }

# 5) Restore (host tool -> container port). --drop makes re-runs clean.
& $Mongorestore --uri="mongodb://localhost:$Port" --gzip --archive=$local --drop
if ($LASTEXITCODE -ne 0) { Remove-ContainerIfExists $container; throw "mongorestore failed (exit $LASTEXITCODE)" }

# 6) Independent verification: count documents per collection
Write-Host "`n=== Document counts in restored '$DbName' ==="
docker exec $container mongosh --quiet --eval "const d=db.getSiblingDB('$DbName'); d.getCollectionNames().sort().forEach(c=>print('  '+c+': '+d.getCollection(c).countDocuments()))"

# 7) Keep for inspection, or tear down
if ($Keep) {
  Write-Host "`nRestore OK. Container left running for inspection." -ForegroundColor Green
  Write-Host "  Open MongoDB Compass and connect to:  mongodb://localhost:$Port"
  Write-Host "  Browse database:                      $DbName"
  Write-Host "  When finished, remove it with:        docker rm -f $container"
} else {
  Remove-ContainerIfExists $container
  Remove-Item $dir -Recurse -Force -ErrorAction SilentlyContinue
  Write-Host "`nRestore test PASSED. Container + temp files cleaned up." -ForegroundColor Green
}
