# Sistema de Certificados ERA Learn

Sistema completo de geração de certificados usando templates SVG originais, com persistência 100% no sistema de arquivos local (sem banco de dados).

## 🎯 Características

- ✅ **Templates SVG imutáveis** - Mantém width/height/viewBox originais
- ✅ **Persistência local** - Tudo salvo no sistema de arquivos
- ✅ **Sem banco de dados** - Zero dependência de SQLite/Supabase
- ✅ **Gravação atômica** - Operações seguras com locks
- ✅ **Verificação de integridade** - SHA-256 de todos os arquivos
- ✅ **API REST completa** - Geração, consulta e download
- ✅ **Página de verificação** - Validação pública de certificados

## 📁 Estrutura de Arquivos

```
pana-learn/
├── certificates/                    # Templates SVG (imutáveis)
│   ├── Configurações Avançadas OMNI.svg
│   ├── Configurações Avançadas PABX.svg
│   ├── Fundamentos CALLCENTER.svg
│   ├── Fundamentos de PABX.svg
│   └── OMNICHANNEL para Empresas.svg
├── src/
│   ├── utils/
│   │   └── certificateUtils.ts     # Funções utilitárias
│   └── app/
│       ├── api/certificates/       # APIs REST
│       └── verify/[id]/            # Página de verificação
└── data/                           # Dados persistentes (configurável)
    ├── manifests/                  # Índices e manifestos
    │   ├── index.jsonl            # Índice principal
    │   └── {YYYY}/{MM}/{ID}.json  # Manifesto por certificado
    ├── files/                      # Arquivos gerados
    │   └── {YYYY}/{MM}/{ID}/      # Certificados por data
    │       ├── certificate.svg
    │       ├── certificate.png
    │       └── certificate.pdf
    └── locks/                      # Lockfiles para concorrência
```

## 🔧 Configuração

### Variáveis de Ambiente

```bash
# Diretório de dados (padrão: ./data)
CERT_DATA_DIR=./data
```

### Mapeamento de Templates

```typescript
const TEMPLATE_MAPPING = {
  'omni_avancado': 'Configurações Avançadas OMNI.svg',
  'pabx_avancado': 'Configurações Avançadas PABX.svg',
  'callcenter_fundamentos': 'Fundamentos CALLCENTER.svg',
  'pabx_fundamentos': 'Fundamentos de PABX.svg',
  'omnichannel_empresas': 'OMNICHANNEL para Empresas.svg'
};
```

## 🚀 API Endpoints

### 1. Gerar Certificado

```http
POST /api/certificates/generate
Content-Type: application/json

{
  "templateKey": "pabx_fundamentos",
  "format": "svg|png|pdf",
  "tokens": {
    "NOME_COMPLETO": "Eduarjose Fajardo",
    "CURSO": "Fundamentos de PABX",
    "DATA_CONCLUSAO": "2025-01-09",
    "CARGA_HORARIA": "8h",
    "CERT_ID": "FUP-2025-000123",
    "QR_URL": "https://meudominio.com/verify/FUP-2025-000123"
  },
  "overwrite": false
}
```

**Resposta:**
```json
{
  "id": "FUP-2025-000123",
  "templateKey": "pabx_fundamentos",
  "format": "svg",
  "paths": {
    "manifest": "/api/certificates/FUP-2025-000123/manifest",
    "file": "/api/certificates/FUP-2025-000123/file?format=svg",
    "verify": "/verify/FUP-2025-000123"
  }
}
```

### 2. Listar Templates

```http
GET /api/certificates/templates
```

**Resposta:**
```json
{
  "templates": [
    {
      "key": "pabx_fundamentos",
      "name": "Fundamentos de PABX",
      "fileName": "Fundamentos de PABX.svg",
      "tokens": ["NOME_COMPLETO", "CURSO", "DATA_CONCLUSAO", "CARGA_HORARIA", "CERT_ID", "QR_URL"],
      "dimensions": { "width": 800, "height": 600, "unit": "px" }
    }
  ],
  "total": 5
}
```

### 3. Buscar Manifesto

```http
GET /api/certificates/{id}/manifest
```

### 4. Download de Arquivo

```http
GET /api/certificates/{id}/file?format=svg|png|pdf
```

### 5. Verificação Pública

```http
GET /verify/{id}
```

## 🔒 Segurança e Integridade

### Validações

- ✅ **Tokens obrigatórios** - Verifica se todos os tokens do template foram fornecidos
- ✅ **Tokens extras** - Rejeita tokens que não existem no template
- ✅ **Escape XML** - Escapa caracteres perigosos (& < > " ')
- ✅ **Formato válido** - Aceita apenas svg, png, pdf
- ✅ **Template válido** - Verifica se o template existe

### Integridade

- ✅ **SHA-256** - Calcula hash de todos os arquivos
- ✅ **Gravação atômica** - tmp + rename para evitar corrupção
- ✅ **Locks** - Evita concorrência na geração
- ✅ **Manifesto completo** - Metadados de cada certificado

### Estrutura do Manifesto

```json
{
  "id": "FUP-2025-000123",
  "templateKey": "pabx_fundamentos",
  "tokens": { ... },
  "createdAt": "2025-01-09T10:30:00.000Z",
  "createdBy": "system",
  "hashes": {
    "templateSvgSha256": "...",
    "finalSvgSha256": "...",
    "pngSha256": "...",
    "pdfSha256": "..."
  },
  "dimensions": { "width": 800, "height": 600, "unit": "px" },
  "fonts": ["Arial"],
  "engine": { "svgToPng": "resvg/sharp", "svgToPdf": "resvg/pdfkit" },
  "version": 1
}
```

## 🧪 Testes

### Executar Testes

```bash
# Instalar dependências de teste
npm install node-fetch

# Executar todos os testes
node test-certificate-system.js
```

### Testes Incluídos

- ✅ **Existência de templates** - Verifica se todos os SVGs existem
- ✅ **Extração de tokens** - Testa detecção automática de tokens
- ✅ **Dimensões originais** - Confirma que width/height/viewBox não foram alterados
- ✅ **Substituição de tokens** - Testa substituição correta
- ✅ **Estrutura de arquivos** - Verifica diretórios necessários
- ✅ **Endpoints da API** - Testa todas as rotas
- ✅ **Idempotência** - Confirma que overwrite=false funciona

## 📋 Tokens Suportados

Todos os templates suportam os seguintes tokens:

- `NOME_COMPLETO` - Nome completo do aluno
- `CURSO` - Nome do curso
- `DATA_CONCLUSAO` - Data de conclusão (YYYY-MM-DD)
- `CARGA_HORARIA` - Carga horária (ex: "8h")
- `CERT_ID` - ID único do certificado
- `QR_URL` - URL para verificação

## 🎨 Templates SVG

### Características dos Templates

- **Dimensões**: 800×600 pixels
- **ViewBox**: 0 0 800 600
- **Fontes**: Arial (fallback para sans-serif)
- **Formato**: SVG 1.1
- **Encoding**: UTF-8

### Estrutura Visual

1. **Header** - Título "CERTIFICADO DE CONCLUSÃO"
2. **Subtítulo** - Nome do curso específico
3. **Conteúdo** - Nome do aluno e curso
4. **Detalhes** - Data, carga horária, ID
5. **QR Code** - Área para código de verificação
6. **Footer** - "ERA Learn - Plataforma de Ensino Online"

## 🔄 Fluxo de Geração

1. **Validação** - Verifica template, formato e tokens
2. **Lock** - Adquire lock para evitar concorrência
3. **Carregamento** - Lê template SVG original
4. **Tokenização** - Substitui tokens no SVG
5. **Persistência** - Salva arquivos e manifesto
6. **Índice** - Atualiza índice principal
7. **Resposta** - Retorna URLs de acesso
8. **Unlock** - Libera lock

## 🚨 Tratamento de Erros

### Códigos de Status HTTP

- `200` - Sucesso
- `400` - Dados inválidos (template, formato, tokens)
- `404` - Certificado não encontrado
- `409` - Certificado já existe (overwrite=false)
- `500` - Erro interno do servidor
- `503` - Lock não disponível

### Mensagens de Erro

- `Template inválido: {key}` - Template não existe
- `Formato inválido: {format}` - Formato não suportado
- `Tokens inválidos ou incompletos` - Tokens obrigatórios ausentes
- `Tokens ausentes no template: {tokens}` - Tokens do template não fornecidos
- `Tokens fornecidos não existem no template: {tokens}` - Tokens extras
- `Certificado já existe: {id}` - ID duplicado
- `Não foi possível adquirir lock` - Concorrência

## 📊 Monitoramento

### Logs

O sistema gera logs detalhados para:
- Geração de certificados
- Erros de validação
- Operações de arquivo
- Locks e concorrência

### Métricas

- Total de certificados gerados
- Templates mais utilizados
- Formatos preferidos
- Erros por tipo

## 🔧 Manutenção

### Limpeza de Locks

```bash
# Remover locks expirados
find ./data/locks -name "*.lock" -mtime +1 -delete
```

### Backup

```bash
# Backup completo
tar -czf certificates-backup-$(date +%Y%m%d).tar.gz data/
```

### Verificação de Integridade

```bash
# Verificar hashes
node -e "
const fs = require('fs');
const crypto = require('crypto');
// Script de verificação de integridade
"
```

## 🚀 Deploy

### Produção

1. **Configurar CERT_DATA_DIR** para diretório persistente
2. **Configurar permissões** de escrita
3. **Configurar backup** automático
4. **Monitorar logs** de erro
5. **Configurar CDN** para arquivos estáticos

### Docker

```dockerfile
# Exemplo de Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
ENV CERT_DATA_DIR=/app/data
VOLUME /app/data
EXPOSE 8080
CMD ["npm", "start"]
```

## 📝 Changelog

### v1.0.0
- ✅ Sistema completo de certificados
- ✅ Templates SVG imutáveis
- ✅ Persistência local
- ✅ API REST completa
- ✅ Página de verificação
- ✅ Testes automatizados
- ✅ Documentação completa

---

**Desenvolvido para ERA Learn - Plataforma de Ensino Online**





