# Cria um atalho na pasta Inicializar do Windows para subir a API ao fazer login.
$root = Split-Path $PSScriptRoot -Parent
$startup = [Environment]::GetFolderPath('Startup')
$shell = New-Object -ComObject WScript.Shell
$lnk = $shell.CreateShortcut((Join-Path $startup 'Ice Cream Shop API.lnk'))
$lnk.TargetPath = Join-Path $PSScriptRoot 'start-api.bat'
$lnk.WorkingDirectory = $root
$lnk.WindowStyle = 7 # minimizada
$lnk.Save()
Write-Host "Atalho criado em $startup"
