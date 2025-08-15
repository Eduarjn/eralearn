# Guia de Configuração de Logo e Branding da Empresa

## Visão Geral

Este guia explica como configurar o logo da sua empresa na plataforma ERA Learn, incluindo:
- Upload do logo principal
- Configuração do favicon (ícone das abas)
- Personalização das cores da marca
- Nome da empresa

## Funcionalidades Implementadas

### 1. Sistema de Branding Dinâmico
- **Logo Principal**: Aparece no cabeçalho, sidebar e tela de login
- **Favicon**: Ícone que aparece nas abas do navegador
- **Cores Personalizadas**: Cor primária e secundária da marca
- **Nome da Empresa**: Nome que aparece na plataforma

### 2. Upload de Imagens
- **Formatos Aceitos**: PNG, JPG, SVG
- **Tamanho Máximo Logo**: 5MB
- **Tamanho Máximo Favicon**: 1MB
- **Validação Automática**: Tipo e tamanho de arquivo

### 3. Armazenamento Seguro
- **Supabase Storage**: Imagens armazenadas no bucket 'branding'
- **URLs Públicas**: Acesso direto às imagens
- **Organização**: Logos em `/logos/` e favicons em `/favicons/`

## Como Configurar

### Passo 1: Acessar Configurações
1. Faça login na plataforma
2. Vá para **Configurações** no menu lateral
3. Clique na aba **"Personalização da Marca"**

### Passo 2: Upload do Logo
1. Clique em **"Selecionar Imagem"** na seção "Logo da Empresa"
2. Escolha uma imagem do seu computador
3. Visualize o preview
4. Clique em **"Salvar Logo"**

### Passo 3: Configurar Favicon
1. Clique em **"Selecionar Imagem"** na seção "Favicon"
2. Escolha uma imagem pequena (recomendado: 32x32px)
3. Visualize o preview
4. Clique em **"Salvar Favicon"**

### Passo 4: Personalizar Cores
1. Use o seletor de cores ou digite o código hexadecimal
2. Configure cor primária e secundária
3. Clique em **"Salvar Cores"**

### Passo 5: Definir Nome da Empresa
1. Digite o nome da sua empresa
2. Clique em **"Salvar"**

## Estrutura do Banco de Dados

### Tabela `empresas`
```sql
-- Colunas adicionadas para branding
logo_url TEXT                    -- URL do logo da empresa
favicon_url TEXT                 -- URL do favicon da empresa
cor_primaria VARCHAR(7)          -- Cor primária (ex: #3B82F6)
cor_secundaria VARCHAR(7)        -- Cor secundária (ex: #10B981)
```

### Bucket de Storage
```
branding/
├── logos/
│   └── {empresa_id}-logo.{ext}
└── favicons/
    └── {empresa_id}-favicon.{ext}
```

## Componentes Atualizados

### 1. BrandingContext
- Gerencia estado global do branding
- Funções para upload de logo e favicon
- Atualização automática do favicon na página

### 2. ERALayout
- Usa logo dinâmico do branding
- Fallback para logo padrão se não configurado

### 3. ERASidebar
- Logo dinâmico na sidebar
- Integração com sistema de branding

### 4. Página de Configurações
- Interface completa para upload
- Preview em tempo real
- Validação de arquivos

## Scripts SQL Necessários

### 1. Adicionar Colunas
Execute o script `add-branding-columns.sql` para adicionar as colunas necessárias:

```sql
-- Adicionar colunas de branding
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS favicon_url TEXT;
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS cor_primaria VARCHAR(7) DEFAULT '#3B82F6';
ALTER TABLE empresas ADD COLUMN IF NOT EXISTS cor_secundaria VARCHAR(7) DEFAULT '#10B981';
```

### 2. Criar Bucket de Storage
No painel do Supabase:
1. Vá para **Storage**
2. Clique em **"New Bucket"**
3. Nome: `branding`
4. Marque como **Public**

## Configuração de Políticas RLS

### Política para Empresas
```sql
-- Permitir que usuários vejam dados da sua empresa
CREATE POLICY "Users can view their company branding" ON empresas
FOR SELECT USING (auth.uid() IN (
  SELECT id FROM usuarios WHERE empresa_id = empresas.id
));

-- Permitir que admins atualizem branding da sua empresa
CREATE POLICY "Admins can update their company branding" ON empresas
FOR UPDATE USING (auth.uid() IN (
  SELECT id FROM usuarios WHERE empresa_id = empresas.id AND tipo_usuario IN ('admin', 'admin_master')
));
```

### Política para Storage
```sql
-- Permitir upload de imagens para usuários autenticados
CREATE POLICY "Authenticated users can upload branding files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'branding' AND auth.role() = 'authenticated'
);

-- Permitir visualização de arquivos públicos
CREATE POLICY "Public can view branding files" ON storage.objects
FOR SELECT USING (bucket_id = 'branding');
```

## Melhores Práticas

### 1. Formatos de Imagem
- **Logo**: PNG ou SVG (recomendado SVG para escalabilidade)
- **Favicon**: PNG ou ICO (32x32px ou 16x16px)
- **Qualidade**: Alta resolução para logo, otimizada para favicon

### 2. Tamanhos Recomendados
- **Logo**: 200x80px ou proporcional
- **Favicon**: 32x32px ou 16x16px
- **Aspect Ratio**: Mantenha proporções adequadas

### 3. Cores
- **Formato**: Hexadecimal (#RRGGBB)
- **Contraste**: Garanta boa legibilidade
- **Consistência**: Use cores da identidade visual da empresa

## Troubleshooting

### Problema: Logo não aparece
**Solução:**
1. Verifique se o arquivo foi uploadado corretamente
2. Confirme se a URL está sendo salva no banco
3. Verifique as políticas RLS

### Problema: Favicon não atualiza
**Solução:**
1. Limpe o cache do navegador
2. Verifique se o arquivo é válido
3. Confirme se a URL está correta

### Problema: Erro de upload
**Solução:**
1. Verifique o tamanho do arquivo (máx 5MB)
2. Confirme o formato (PNG, JPG, SVG)
3. Verifique as políticas de storage

## Exemplo de Uso

```typescript
// Usando o contexto de branding
import { useBranding } from '@/context/BrandingContext';

function MyComponent() {
  const { branding, updateLogo } = useBranding();
  
  const handleLogoUpload = async (file: File) => {
    try {
      await updateLogo(file);
      // Logo atualizado com sucesso
    } catch (error) {
      // Tratar erro
    }
  };
  
  return (
    <div>
      <img src={branding.logo_url || '/default-logo.png'} alt="Logo" />
    </div>
  );
}
```

## Próximos Passos

1. **Execute o script SQL** para adicionar as colunas
2. **Configure o bucket de storage** no Supabase
3. **Teste o upload** de logo e favicon
4. **Personalize as cores** da sua marca
5. **Verifique a aplicação** em todas as páginas

## Suporte

Para dúvidas ou problemas:
- Verifique os logs do console do navegador
- Confirme as políticas RLS no Supabase
- Teste com arquivos menores primeiro
- Verifique a conectividade com o storage 