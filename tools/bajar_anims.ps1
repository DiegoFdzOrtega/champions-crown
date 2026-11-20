# =====================================================================
#  Champions Crown - baja ANIMACIONES EXTRA de los Pokemon de PMD Sprite Repository
#  (https://sprites.pmdcollab.org - github.com/PMDCollab/SpriteCollab) para darles mas vida en combate (js/anims.js).
#  Para cada carpeta assets\pokemon\<numero>\ lee su AnimData.xml y baja las animaciones de $quiero que tenga,
#  como assets\pokemon\<numero>\<Animacion>.png (mismo formato que Idle.png, Walk.png...).
#  Tambien arregla los Walk.png que eran una copia de Idle.png (el Pokemon no "andaba").
#  Al final escribe assets\pokemon\anims.json con lo que tiene cada Pokemon (el juego solo pide lo que existe).
#  Se puede ejecutar las veces que haga falta: lo que ya esta bajado no se vuelve a bajar.
#  Uso (en la carpeta del proyecto):   powershell -ExecutionPolicy Bypass -File tools\bajar_anims.ps1
# =====================================================================
$ErrorActionPreference = 'SilentlyContinue'
Add-Type -AssemblyName System.Net.Http
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$root  = Split-Path -Parent $PSScriptRoot
$poke  = Join-Path $root 'assets\pokemon'
$quiero = 'Hop','Sleep','Pose','Strike','Swing','Kick','Double','Head','Rotate','Tumble','Pain','Cringe','DeepBreath','LookUp','Nod','Sit','Float','Twirl','Ricochet','Emit','Withdraw','RearUp','LeapForth','HitGround','Wake','LostBalance','Trip'
# 3a tanda (20-11-2026): las que aun no teniamos. Si un Pokemon no tiene alguna (o el nombre no existe en su AnimData.xml), simplemente se salta.
$quiero += 'Sink','TumbleBack','Dance','Appeal','Shock','Laying','EventSleep','Eat','Pull','Shake','Bump','Gas','Special0','Special1','Special2','Special3','Special4','Special5','Special6','Special7'
$base  = 'https://raw.githubusercontent.com/PMDCollab/SpriteCollab/master/sprite'
$http  = New-Object System.Net.Http.HttpClient
$http.Timeout = [TimeSpan]::FromSeconds(30)

$dexes = Get-ChildItem $poke -Directory | Where-Object { $_.Name -match '^\d+$' } | ForEach-Object { [int]$_.Name } | Sort-Object
Write-Host "Pokemon encontrados: $($dexes.Count). Leyendo que animaciones tiene cada uno..." -ForegroundColor Cyan

# 1) AnimData.xml de cada Pokemon (en lotes)
$xmls = @{}; $i = 0; $lote = 40
while($i -lt $dexes.Count){
  $part = @($dexes[$i..([Math]::Min($i + $lote, $dexes.Count) - 1)])
  $tasks = @($part | ForEach-Object { $http.GetStringAsync(('{0}/{1:D4}/AnimData.xml' -f $base, $_)) })
  try { [System.Threading.Tasks.Task]::WaitAll($tasks) } catch {}
  for($k = 0; $k -lt $part.Count; $k++){ if($tasks[$k].Status -eq 'RanToCompletion'){ $xmls[$part[$k]] = $tasks[$k].Result } }
  $i += $lote
  Write-Progress -Activity 'Leyendo AnimData.xml' -Status "$i / $($dexes.Count)" -PercentComplete ([Math]::Min(100, $i * 100 / [Math]::Max(1, $dexes.Count)))
}

# 2) Lista de archivos a bajar
$jobs = New-Object System.Collections.ArrayList
$tiene = @{}
foreach($d in $dexes){
  $dir = Join-Path $poke "$d"
  $lista = New-Object System.Collections.ArrayList
  if(-not $xmls.ContainsKey($d)){ $tiene["$d"] = @(); continue }
  [xml]$x = $xmls[$d]
  $copia = @{}; $nombres = @{}
  foreach($a in $x.AnimData.Anims.Anim){ $n = [string]$a.Name; $nombres[$n] = 1; if($a.CopyOf){ $copia[$n] = [string]$a.CopyOf } }
  $fuente = { param($n) $s = $n; $v = 0; while($copia.ContainsKey($s) -and $v -lt 5){ $s = $copia[$s]; $v++ }; $s }
  foreach($n in $quiero){
    if(-not $nombres.ContainsKey($n)){ continue }
    $src = & $fuente $n
    if($src -eq 'Idle' -or $src -eq 'Walk'){ continue }            # es una copia de quieto/andar: no aporta nada
    [void]$lista.Add($n)
    $out = Join-Path $dir "$n.png"
    if(Test-Path $out){ continue }
    [void]$jobs.Add(@{url = ('{0}/{1:D4}/{2}-Anim.png' -f $base, $d, $src); out = $out})
  }
  # Walk.png igual que Idle.png: se baja el de verdad (si existe)
  $w = Join-Path $dir 'Walk.png'; $id = Join-Path $dir 'Idle.png'
  if((Test-Path $w) -and (Test-Path $id) -and ((Get-FileHash $w).Hash -eq (Get-FileHash $id).Hash) -and $nombres.ContainsKey('Walk')){
    $src = & $fuente 'Walk'
    if($src -ne 'Idle'){ [void]$jobs.Add(@{url = ('{0}/{1:D4}/{2}-Anim.png' -f $base, $d, $src); out = $w}) }
  }
  $tiene["$d"] = @($lista)
}
Write-Host "Archivos por bajar: $($jobs.Count)"

# 3) Bajar
$ok = 0; $no = 0; $i = 0
while($i -lt $jobs.Count){
  $part = @($jobs[$i..([Math]::Min($i + $lote, $jobs.Count) - 1)])
  $tasks = @($part | ForEach-Object { $http.GetAsync($_.url) })
  try { [System.Threading.Tasks.Task]::WaitAll($tasks) } catch {}
  for($k = 0; $k -lt $part.Count; $k++){
    $r = $tasks[$k].Result
    if($r -and $r.IsSuccessStatusCode){ [IO.File]::WriteAllBytes($part[$k].out, $r.Content.ReadAsByteArrayAsync().Result); $ok++ } else { $no++ }
  }
  $i += $lote
  Write-Progress -Activity 'Bajando animaciones' -Status "$i / $($jobs.Count)  (bajadas: $ok)" -PercentComplete ([Math]::Min(100, $i * 100 / [Math]::Max(1, $jobs.Count)))
}

# 4) anims.json: solo lo que de verdad esta en la carpeta
$man = [ordered]@{}
foreach($d in $dexes){ $l = @($tiene["$d"] | Where-Object { Test-Path (Join-Path $poke "$d\$_.png") }); if($l.Count){ $man["$d"] = $l } }
($man | ConvertTo-Json -Compress -Depth 3) | Set-Content -Encoding UTF8 (Join-Path $poke 'anims.json')
Write-Host ""
Write-Host "Hecho. Bajadas: $ok  -  Fallidas: $no  -  Pokemon con animaciones extra: $($man.Count)" -ForegroundColor Green
Write-Host "Creditos: PMD Sprite Repository (sprites.pmdcollab.org) y sus artistas."
