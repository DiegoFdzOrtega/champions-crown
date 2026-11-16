# =====================================================================
#  Champions Crown - baja los RETRATOS CON EXPRESIONES de PMD Sprite Repository
#  (https://sprites.pmdcollab.org - github.com/PMDCollab/SpriteCollab) para el HUD de combate (js/caras.js).
#  Para cada carpeta assets\pokemon\<numero>\ baja las expresiones que existan a assets\pokemon\<numero>\caras\<Expresion>.png
#  Se puede ejecutar las veces que haga falta: lo que ya esta bajado no se vuelve a bajar.
#  Uso (en la carpeta del proyecto):   powershell -ExecutionPolicy Bypass -File tools\bajar_caras.ps1
# =====================================================================
$ErrorActionPreference = 'SilentlyContinue'
Add-Type -AssemblyName System.Net.Http
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$root  = Split-Path -Parent $PSScriptRoot
$poke  = Join-Path $root 'assets\pokemon'
$emos  = 'Normal','Happy','Pain','Angry','Worried','Determined','Joyous','Shouting','Dizzy','Surprised'
$base  = 'https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master/portrait'
$http  = New-Object System.Net.Http.HttpClient
$http.Timeout = [TimeSpan]::FromSeconds(30)

$dexes = Get-ChildItem $poke -Directory | Where-Object { $_.Name -match '^\d+$' } | ForEach-Object { [int]$_.Name } | Sort-Object
Write-Host "Pokemon encontrados: $($dexes.Count). Bajando expresiones..." -ForegroundColor Cyan

$jobs = New-Object System.Collections.ArrayList
foreach($d in $dexes){
  $dir = Join-Path $poke "$d\caras"
  if(-not (Test-Path $dir)){ New-Item -ItemType Directory -Path $dir | Out-Null }
  foreach($e in $emos){
    $out = Join-Path $dir "$e.png"
    if(Test-Path $out){ continue }
    [void]$jobs.Add(@{url = ('{0}/{1:D4}/{2}.png' -f $base, $d, $e); out = $out})
  }
}
Write-Host "Archivos por mirar: $($jobs.Count)"

$ok = 0; $no = 0; $i = 0; $lote = 40
while($i -lt $jobs.Count){
  $part = @($jobs[$i..([Math]::Min($i + $lote, $jobs.Count) - 1)])
  $tasks = @($part | ForEach-Object { $http.GetAsync($_.url) })
  try { [System.Threading.Tasks.Task]::WaitAll($tasks) } catch {}
  for($k = 0; $k -lt $part.Count; $k++){
    $r = $tasks[$k].Result
    if($r -and $r.IsSuccessStatusCode){ [IO.File]::WriteAllBytes($part[$k].out, $r.Content.ReadAsByteArrayAsync().Result); $ok++ } else { $no++ }
  }
  $i += $lote
  Write-Progress -Activity 'Bajando caras' -Status "$i / $($jobs.Count)  (bajadas: $ok)" -PercentComplete ([Math]::Min(100, $i * 100 / [Math]::Max(1, $jobs.Count)))
}
# carpetas vacias (Pokemon sin retratos) fuera
Get-ChildItem $poke -Directory | ForEach-Object { $c = Join-Path $_.FullName 'caras'; if((Test-Path $c) -and -not (Get-ChildItem $c)){ Remove-Item $c } }
Write-Host ""
Write-Host "Hecho. Bajadas: $ok  -  No existen en el repositorio: $no" -ForegroundColor Green
Write-Host "Creditos: PMD Sprite Repository (sprites.pmdcollab.org) y sus artistas."
