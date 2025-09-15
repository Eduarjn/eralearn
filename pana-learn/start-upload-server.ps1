# Script para iniciar o servidor de upload local
Write-Host "🚀 Iniciando servidor de upload local..." -ForegroundColor Green
Write-Host ""
Write-Host "📁 Diretório: $(Get-Location)" -ForegroundColor Cyan
Write-Host "🌐 Porta: 3001" -ForegroundColor Cyan
Write-Host "📹 Endpoint: http://localhost:3001/api/videos/upload-local" -ForegroundColor Cyan
Write-Host ""

# Verificar se o Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado. Instale o Node.js primeiro." -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Verificar se o arquivo do servidor existe
if (Test-Path "local-upload-server.js") {
    Write-Host "✅ Arquivo do servidor encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ Arquivo local-upload-server.js não encontrado" -ForegroundColor Red
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Iniciar o servidor
Write-Host "🚀 Iniciando servidor..." -ForegroundColor Yellow
Write-Host ""
node local-upload-server.js











