# Remove o atalho criado por install-startup.ps1.
$lnk = Join-Path ([Environment]::GetFolderPath('Startup')) 'Ice Cream Shop API.lnk'
if (Test-Path $lnk) {
  Remove-Item $lnk
  Write-Host "Atalho removido: $lnk"
} else {
  Write-Host "Nenhum atalho encontrado em $lnk"
}
