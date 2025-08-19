# 🔧 **SOLUÇÃO RÁPIDA - Upload de Imagens**

## 🎯 **PROBLEMA IDENTIFICADO**

Vejo que você está tentando fazer upload de imagens e há erros no console relacionados ao carregamento do logo da sidebar. Vou ajudar a resolver esses problemas.

## ✅ **SOLUÇÃO PASSO A PASSO**

### **🔄 1. EXECUTAR SCRIPT SQL NO SUPABASE**

Primeiro, execute este script no **Supabase SQL Editor**:

```sql
-- ========================================
-- CONFIGURAÇÃO DO STORAGE PARA BRANDING
-- ========================================

-- Criar bucket para branding se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'branding',
  'branding',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
) ON CONFLICT (id) DO NOTHING;

-- Configurar políticas RLS para o bucket branding
CREATE POLICY "Branding bucket public access" ON storage.objects
FOR SELECT USING (bucket_id = 'branding');

-- Permitir upload para admins
CREATE POLICY "Branding bucket admin upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'branding' AND 
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id = auth.uid() 
    AND tipo_usuario IN ('admin', 'admin_master')
  )
);

-- Permitir update para admins
CREATE POLICY "Branding bucket admin update" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'branding' AND 
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id = auth.uid() 
    AND tipo_usuario IN ('admin', 'admin_master')
  )
);

-- Permitir delete para admins
CREATE POLICY "Branding bucket admin delete" ON storage.objects
FOR DELETE USING (
  bucket_id = 'branding' AND 
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.usuarios 
    WHERE id = auth.uid() 
    AND tipo_usuario IN ('admin', 'admin_master')
  )
);

-- Verificar se a tabela branding_config existe e tem a coluna background_url
DO $$
BEGIN
    -- Adicionar coluna background_url se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'branding_config' 
        AND column_name = 'background_url'
    ) THEN
        ALTER TABLE public.branding_config 
        ADD COLUMN background_url TEXT DEFAULT '/lovable-uploads/aafcc16a-d43c-4f66-9fa4-70da46d38ccb.png';
        
        RAISE NOTICE 'Coluna background_url adicionada à tabela branding_config';
    END IF;
END $$;

-- Atualizar configuração padrão com background_url
UPDATE public.branding_config 
SET background_url = '/lovable-uploads/aafcc16a-d43c-4f66-9fa4-70da46d38ccb.png'
WHERE background_url IS NULL;

-- Verificar configuração
SELECT 
  'Storage configurado com sucesso!' as status,
  'Bucket: branding' as bucket,
  'Público: true' as public_access,
  'Limite: 10MB' as file_limit;
```

### **🔄 2. TESTAR UPLOAD LOCALMENTE**

Execute estes comandos no terminal:

```bash
# Navegar para o projeto
cd pana-learn

# Instalar dependências (se necessário)
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

### **🔄 3. TESTAR UPLOAD DE IMAGENS**

1. **Acesse:** `http://localhost:5173/teste-upload-imagens.html`
2. **Configure** URL e chave do Supabase
3. **Teste** a conexão
4. **Faça upload** de uma imagem de teste

### **🔄 4. TESTAR WHITE-LABEL**

1. **Acesse:** `http://localhost:5173`
2. **Faça login** como administrador
3. **Vá para:** Configurações → White-Label
4. **Teste upload** de:
   - Logo principal
   - Sublogo
   - Favicon
   - Imagem de fundo

## 🔍 **DIAGNÓSTICO DE PROBLEMAS**

### **❌ Erro: "Bucket não encontrado"**
**Solução:** Execute o script SQL novamente

### **❌ Erro: "Permissão negada"**
**Solução:** Verifique se está logado como admin

### **❌ Erro: "Arquivo muito grande"**
**Solução:** Reduza o tamanho da imagem (máximo 10MB)

### **❌ Erro: "Tipo de arquivo não suportado"**
**Solução:** Use apenas PNG, JPG, GIF, WebP ou SVG

## 🧪 **TESTE AUTOMATIZADO**

Execute o script de teste local:

```bash
# Executar testes automatizados
npm run test:local
```

Este script vai verificar:
- ✅ Node.js e NPM
- ✅ Dependências instaladas
- ✅ TypeScript
- ✅ ESLint
- ✅ Build de produção
- ✅ Servidor de desenvolvimento

## 📋 **CHECKLIST DE VERIFICAÇÃO**

### **✅ Backend (Supabase):**
- [ ] Bucket `branding` criado
- [ ] Políticas RLS configuradas
- [ ] Tabela `branding_config` existe
- [ ] Coluna `background_url` adicionada

### **✅ Frontend (Local):**
- [ ] Servidor rodando em `localhost:5173`
- [ ] Página de teste carregando
- [ ] Conexão com Supabase funcionando
- [ ] Upload de imagens funcionando

### **✅ White-Label:**
- [ ] Upload de logo principal
- [ ] Upload de sublogo
- [ ] Upload de favicon
- [ ] Upload de imagem de fundo
- [ ] Configuração de cores
- [ ] Informações da empresa

## 🚀 **PRÓXIMOS PASSOS**

### **✅ Após testar localmente:**

1. **Se tudo funcionar:**
   ```bash
   git add .
   git commit -m "feat: upload de imagens funcionando"
   git push origin master
   ```

2. **Se houver problemas:**
   - Verificar logs do console
   - Verificar logs do Supabase
   - Corrigir problemas identificados
   - Testar novamente

## 📞 **SUPORTE**

Se ainda houver problemas:

1. **Verificar console** do navegador para erros
2. **Verificar logs** do Supabase
3. **Executar script SQL** novamente
4. **Testar conexão** com Supabase
5. **Verificar permissões** de usuário

**Lembre-se: Sempre teste localmente antes de fazer deploy!** 🚀
