param(
    [int]$BackendPort = 5000,
    [int]$FrontendPort = 3001,
    [switch]$CompleteTestsWithResults
)

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendPath = Join-Path $Root "Backend"
$FrontendPath = Join-Path $Root "Frontend"
$VercelFrontendUrl = "https://online-examination-frontend-one.vercel.app"
$VercelBackendUrl = "https://online-examination-backend.vercel.app"
$LocalIp = (
    Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object {
        $_.IPAddress -notlike "127.*" -and
        $_.IPAddress -notlike "169.254.*" -and
        $_.PrefixOrigin -ne "WellKnown" -and
        $_.InterfaceAlias -notmatch "VirtualBox|VMware|Hyper-V|Loopback|vEthernet"
    } |
    Sort-Object @{ Expression = { if ($_.PrefixOrigin -eq "Dhcp") { 0 } else { 1 } } } |
    Select-Object -First 1 -ExpandProperty IPAddress
)
if (-not $LocalIp) {
    $LocalIp = "localhost"
}
$FrontendBase = "http://$LocalIp`:$FrontendPort"
$ApiBase = "http://localhost:$BackendPort"

if ($CompleteTestsWithResults) {
    $mongoCommand = @"
const resultTestIds = db.resultmodels.distinct('testid');
db.testpapermodels.updateMany(
  { _id: { `$in: resultTestIds }, testconducted: false },
  { `$set: { testbegins: false, testconducted: true, isResultgenerated: true } }
);
"@
    mongosh mongodb://localhost:27017/OnlineExaminationSystem --eval $mongoCommand
}

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd `"$BackendPath`"; `$env:PORT=$BackendPort; `$env:FRONTEND_URL=`"$FrontendBase`"; npm start"
)

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd `"$FrontendPath`"; `$env:PORT=$FrontendPort; `$env:HOST=`"0.0.0.0`"; `$env:REACT_APP_API_BASE=`"$ApiBase`"; npm start"
)

Write-Host "Backend API used by frontend: $ApiBase"
Write-Host "Frontend: $FrontendBase"
