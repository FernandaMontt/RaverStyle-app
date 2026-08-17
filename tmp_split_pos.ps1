$path = 'C:\Users\ferna\Downloads\Demo-Sistema_RAVER\raver-app\sistema_pos_raver_tienda_de_ropa_urbana.html'
$lines = Get-Content $path
$ranges = @(
  @(900, 1222, 'pos_01.txt'),
  @(1223, 1487, 'pos_02.txt'),
  @(1488, 1749, 'pos_03.txt'),
  @(1750, 2121, 'pos_04.txt'),
  @(2122, 2470, 'pos_05.txt')
)
foreach ($r in $ranges) {
  $start = [int]$r[0]
  $end = [int]$r[1]
  $lines[($start-1)..($end-1)] | Set-Content -Path $r[2] -Encoding UTF8
}
Write-Host 'SPLIT OK'
