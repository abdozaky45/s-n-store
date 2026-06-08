<#
.SYNOPSIS
  Restore a backup from S3 into a REAL target MongoDB (migration / recovery).

.DESCRIPTION
  Downloads a backup (latest by default) from the S3 backup bucket and restores
  it into the database you point at with -TargetUri. Use this to move the data to
  a new cluster/provider, or to rebuild after a disaster. Asks for confirmation
  before writing (it writes to a real database) — pass -Yes to skip.

  For a SAFE test that touches nothing real, use restore-test.ps1 instead.

  Requires: AWS CLI (read access to the bucket) + mongorestore.

.EXAMPLE
  .\scripts\restore-to-target.ps1 -TargetUri "mongodb+srv://u:p@new.mongodb.net/snlingeri"

.EXAMPLE
  .\scripts\restore-to-target.ps1 -TargetUri "mongodb+srv://u:p@new.mongodb.net/snlingeri" -Drop

.EXAMPLE
  # restore under a different database name
  .\scripts\restore-to-target.ps1 -TargetUri "mongodb+srv://u:p@new.mongodb.net/" `
    -NsFrom "snlingeri.*" -NsTo "snlingeri_recovered.*"
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$TargetUri,  # destination MongoDB URI
  [string]$Key,                       # specific backup file; default = latest
  [string]$Bucket = "snlingeri-db-backups",
  [string]$Prefix = "mongo",
  [string]$Region = "ap-northeast-1",
  [switch]$Drop,                      # drop target collections before restoring
  [string]$NsFrom,                    # e.g. "snlingeri.*" (rename source ns)
  [string]$NsTo,                      # e.g. "newdb.*"     (rename target ns)
  [switch]$Yes,                       # skip the confirmation prompt
  [string]$Aws = "C:\Program Files\Amazon\AWSCLIV2\aws.exe",
  [string]$Mongorestore = "C:\Users\dell\Downloads\mongodb-database-tools-windows-x86_64-100.12.1\bin\mongorestore.exe"
)

$ErrorActionPreference = "Stop"
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

# 2) Download it
$dir = Join-Path $env:TEMP "restore-to-target"
New-Item -ItemType Directory -Force -Path $dir | Out-Null
$local = Join-Path $dir $Key
Write-Host "Downloading $Key ..."
& $Aws s3 cp "s3://$Bucket/$Prefix/$Key" $local --region $Region
if ($LASTEXITCODE -ne 0) { throw "Download failed (exit $LASTEXITCODE)" }

# 3) Confirm — this writes to a REAL database (credentials redacted in the echo)
$safeUri = $TargetUri -replace '://[^@]+@', '://***:***@'
Write-Host ""
Write-Host "About to restore into a real database:" -ForegroundColor Yellow
Write-Host "  Backup : $Key"
Write-Host "  Target : $safeUri"
Write-Host "  Drop   : $([bool]$Drop)"
if ($NsFrom -and $NsTo) { Write-Host "  Rename : $NsFrom  ->  $NsTo" }
if (-not $Yes) {
  $answer = Read-Host "Proceed? (type 'yes' to continue)"
  if ($answer -ne "yes") { Write-Host "Aborted." -ForegroundColor Red; exit 1 }
}

# 4) Build args and restore
$mrArgs = @("--uri=$TargetUri", "--gzip", "--archive=$local")
if ($Drop) { $mrArgs += "--drop" }
if ($NsFrom -and $NsTo) { $mrArgs += "--nsFrom=$NsFrom"; $mrArgs += "--nsTo=$NsTo" }
& $Mongorestore @mrArgs
if ($LASTEXITCODE -ne 0) { throw "mongorestore failed (exit $LASTEXITCODE)" }

Write-Host "`nRestore into target completed." -ForegroundColor Green
Write-Host "If this was a migration, update the app's DB_URL (.env / Elastic Beanstalk) to the new database and restart."
