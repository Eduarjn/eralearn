# Script PowerShell para configurar SSL no Windows
# Execute como Administrador

Write-Host "🚀 Configurando SSL para ERA Learn no Windows..." -ForegroundColor Green

# Verificar se está rodando como Administrador
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ Execute como Administrador!" -ForegroundColor Red
    exit 1
}

# 1. Instalar Nginx (se não estiver instalado)
Write-Host "📦 Verificando Nginx..." -ForegroundColor Yellow
if (!(Get-Command nginx -ErrorAction SilentlyContinue)) {
    Write-Host "Instalando Nginx via Chocolatey..." -ForegroundColor Yellow
    if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
        Write-Host "Instalando Chocolatey..." -ForegroundColor Yellow
        Set-ExecutionPolicy Bypass -Scope Process -Force
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
        iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    }
    choco install nginx -y
}

# 2. Criar diretórios para certificados
Write-Host "📁 Criando diretórios..." -ForegroundColor Yellow
$certDir = "C:\nginx\ssl\certs\eralearn"
$keyDir = "C:\nginx\ssl\private\eralearn"
New-Item -ItemType Directory -Force -Path $certDir
New-Item -ItemType Directory -Force -Path $keyDir

# 3. Instruções para certificados
Write-Host "🔐 INSTRUÇÕES PARA CERTIFICADOS:" -ForegroundColor Cyan
Write-Host "1. Copie seu arquivo .crt para: $certDir\certificate.crt" -ForegroundColor White
Write-Host "2. Copie seu arquivo .key para: $keyDir\private.key" -ForegroundColor White
Write-Host "3. Execute os comandos abaixo:" -ForegroundColor White
Write-Host ""
Write-Host "   Copy-Item 'seu-certificado.crt' '$certDir\certificate.crt'" -ForegroundColor Gray
Write-Host "   Copy-Item 'sua-chave-privada.key' '$keyDir\private.key'" -ForegroundColor Gray
Write-Host ""

# 4. Configurar Nginx
Write-Host "⚙️ Configurando Nginx..." -ForegroundColor Yellow
$nginxConfig = @"
server {
    listen 80;
    server_name _;
    
    # Redirecionar HTTP para HTTPS
    return 301 https://`$server_name`$request_uri;
}

server {
    listen 443 ssl http2;
    server_name _;

    # Certificados SSL
    ssl_certificate $certDir/certificate.crt;
    ssl_certificate_key $keyDir/private.key;

    # Configurações SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Headers de segurança
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # Configuração da aplicação
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
        proxy_cache_bypass `$http_upgrade;
        proxy_read_timeout 86400;
    }

    # Configuração para uploads grandes
    client_max_body_size 100M;
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
}
"@

# Salvar configuração
$configPath = "C:\nginx\conf\sites-available\eralearn.conf"
New-Item -ItemType Directory -Force -Path "C:\nginx\conf\sites-available"
$nginxConfig | Out-File -FilePath $configPath -Encoding UTF8

Write-Host "✅ Configuração salva em: $configPath" -ForegroundColor Green

# 5. Instruções finais
Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "1. Copie seus certificados para os diretórios indicados" -ForegroundColor White
Write-Host "2. Edite $configPath e substitua '_' pelo seu domínio" -ForegroundColor White
Write-Host "3. Inicie Nginx: nginx" -ForegroundColor White
Write-Host "4. Teste: https://seudominio.com" -ForegroundColor White

Write-Host "🎉 Script concluído!" -ForegroundColor Green






















