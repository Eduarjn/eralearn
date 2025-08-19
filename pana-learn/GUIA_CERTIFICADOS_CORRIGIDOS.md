# 🏆 **GUIA DE IMPLEMENTAÇÃO - SISTEMA DE CERTIFICADOS CORRIGIDO**

## **📋 RESUMO DA CORREÇÃO**

### **✅ O QUE FOI CORRIGIDO:**

1. **Estrutura da Tabela Certificados**
   - Adicionada coluna `curso_id` para relacionamento direto
   - Adicionada coluna `curso_nome` para exibição
   - Adicionada coluna `numero_certificado` único
   - Adicionada coluna `status` com validação
   - Adicionada coluna `data_emissao`

2. **Funções do Banco de Dados**
   - `gerar_certificado_curso()` - Gera certificado específico por curso
   - `buscar_certificados_usuario()` - Lista certificados do usuário
   - `validar_certificado()` - Valida certificado por número

3. **Hook useCertificates Atualizado**
   - Usa funções do banco para operações
   - Gerencia certificados por curso
   - Validação de certificados
   - Verificação de certificados existentes

4. **Políticas RLS Melhoradas**
   - Usuários veem apenas seus certificados
   - Admins podem ver todos os certificados
   - Políticas de inserção e atualização

## **🛠️ PASSOS PARA IMPLEMENTAR**

### **Passo 1: Executar Script de Correção**

Execute o arquivo `corrigir-certificados.sql` no Supabase:

```sql
-- Execute este script no SQL Editor do Supabase Dashboard
-- Arquivo: corrigir-certificados.sql
```

**O que este script faz:**
- ✅ Corrige estrutura da tabela certificados
- ✅ Adiciona colunas necessárias
- ✅ Cria funções para gerenciar certificados
- ✅ Configura RLS e políticas
- ✅ Atualiza certificados existentes

### **Passo 2: Verificar Estrutura**

Após executar o script, verifique se a estrutura foi corrigida:

```sql
-- Verificar estrutura da tabela
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'certificados' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar certificados atualizados
SELECT 
  id,
  curso_nome,
  categoria,
  nota,
  numero_certificado,
  status,
  data_emissao
FROM certificados 
ORDER BY data_emissao DESC
LIMIT 5;
```

### **Passo 3: Atualizar Frontend**

O hook `useCertificates` já foi atualizado:

```typescript
// Novo hook com funções melhoradas
import { useCertificates } from '@/hooks/useCertificates';

const { 
  certificates, 
  isLoading, 
  generateCertificate, 
  validateCertificate,
  hasCertificateForCourse 
} = useCertificates(userId);
```

## **🎯 FLUXO DE FUNCIONAMENTO**

### **1. Geração Automática de Certificado**
```typescript
// Quando usuário aprova no quiz
const certificateId = await generateCertificate(cursoId, quizId, nota);
if (certificateId) {
  // Certificado gerado com sucesso
  console.log('Certificado gerado:', certificateId);
}
```

### **2. Verificação de Certificado Existente**
```typescript
// Verificar se usuário já tem certificado para o curso
const hasCertificate = await hasCertificateForCourse(cursoId);
if (hasCertificate) {
  // Usuário já possui certificado
  console.log('Certificado já existe');
}
```

### **3. Validação de Certificado**
```typescript
// Validar certificado por número
const validation = await validateCertificate('CERT-123-456-789');
if (validation?.valido) {
  console.log('Certificado válido:', validation);
} else {
  console.log('Certificado inválido');
}
```

## **📊 ESTRUTURA DO BANCO**

### **Tabela: `certificados` (Corrigida)**
```sql
CREATE TABLE certificados (
  id UUID PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id),
  curso_id UUID REFERENCES cursos(id), -- NOVO: Relacionamento direto
  curso_nome TEXT, -- NOVO: Nome do curso
  categoria TEXT,
  categoria_nome TEXT,
  quiz_id UUID REFERENCES quizzes(id),
  nota INTEGER,
  data_conclusao TIMESTAMP,
  data_emissao TIMESTAMP DEFAULT NOW(), -- NOVO
  numero_certificado VARCHAR(100) UNIQUE, -- NOVO
  status VARCHAR(20) DEFAULT 'ativo', -- NOVO
  certificado_url TEXT,
  qr_code_url TEXT,
  data_criacao TIMESTAMP DEFAULT NOW(),
  data_atualizacao TIMESTAMP DEFAULT NOW()
);
```

### **Função: `gerar_certificado_curso()`**
```sql
-- Gera certificado específico por curso
SELECT gerar_certificado_curso('usuario_id', 'curso_id', 'quiz_id', 85);
```

### **Função: `buscar_certificados_usuario()`**
```sql
-- Lista certificados do usuário
SELECT * FROM buscar_certificados_usuario('usuario_id');
```

### **Função: `validar_certificado()`**
```sql
-- Valida certificado por número
SELECT * FROM validar_certificado('CERT-123-456-789');
```

## **🧪 TESTES NECESSÁRIOS**

### **Teste 1: Geração de Certificado**
1. Aprove em um quiz (nota >= 70%)
2. Verifique se certificado é gerado
3. Confirme que certificado aparece na lista

### **Teste 2: Verificação de Duplicatas**
1. Tente gerar certificado para curso já certificado
2. Verifique se não cria duplicata
3. Confirme que retorna certificado existente

### **Teste 3: Validação de Certificado**
1. Use número de certificado válido
2. Verifique se validação retorna true
3. Teste com número inválido

### **Teste 4: Listagem de Certificados**
1. Acesse página de certificados
2. Verifique se lista apenas certificados do usuário
3. Confirme que dados estão corretos

## **🚨 POSSÍVEIS PROBLEMAS E SOLUÇÕES**

### **Problema: Certificado não é gerado**
**Solução:**
```sql
-- Verificar se função existe
SELECT * FROM pg_proc WHERE proname = 'gerar_certificado_curso';

-- Verificar se usuário tem permissão
-- Verificar se curso_id está correto
-- Verificar se RLS está configurado
```

### **Problema: Certificados não aparecem na lista**
**Solução:**
```sql
-- Verificar se certificados existem
SELECT * FROM certificados WHERE usuario_id = 'ID_USUARIO';

-- Verificar se RLS está permitindo acesso
-- Verificar se função buscar_certificados_usuario funciona
```

### **Problema: Validação de certificado falha**
**Solução:**
```sql
-- Verificar se certificado existe
SELECT * FROM certificados WHERE numero_certificado = 'NUMERO';

-- Verificar se status está 'ativo'
-- Verificar se função validar_certificado funciona
```

## **📈 PRÓXIMOS PASSOS**

1. **Execute o script SQL** `corrigir-certificados.sql`
2. **Teste cada funcionalidade** conforme guia
3. **Monitore logs** para identificar problemas
4. **Ajuste configurações** conforme necessário
5. **Documente mudanças** para equipe

## **✅ CHECKLIST DE VALIDAÇÃO**

- [ ] Script SQL executado com sucesso
- [ ] Estrutura da tabela certificados corrigida
- [ ] Funções do banco criadas
- [ ] Hook useCertificates atualizado
- [ ] Certificado é gerado automaticamente
- [ ] Certificados aparecem na lista
- [ ] Validação de certificado funciona
- [ ] RLS configurado corretamente
- [ ] Fluxo completo testado

## **🎉 RESULTADO FINAL**

Com essa correção, você terá:

✅ **Certificados específicos por curso**
✅ **Geração automática após aprovação no quiz**
✅ **Validação de certificados por número**
✅ **Listagem organizada de certificados**
✅ **Sistema robusto e escalável**
✅ **Políticas de segurança adequadas**

## **🔧 EXEMPLOS DE USO**

### **No Componente de Quiz:**
```typescript
const { generateCertificate } = useCertificates(userId);

// Após aprovação no quiz
if (aprovado) {
  const certificateId = await generateCertificate(cursoId, quizId, nota);
  if (certificateId) {
    toast.success('Certificado gerado com sucesso!');
  }
}
```

### **Na Página de Certificados:**
```typescript
const { certificates, isLoading } = useCertificates(userId);

// Listar certificados
{certificates.map(cert => (
  <div key={cert.id}>
    <h3>{cert.curso_nome}</h3>
    <p>Nota: {cert.nota}%</p>
    <p>Número: {cert.numero_certificado}</p>
  </div>
))}
```

### **Validação de Certificado:**
```typescript
const { validateCertificate } = useCertificates(userId);

// Validar certificado
const validation = await validateCertificate(numeroCertificado);
if (validation?.valido) {
  console.log('Certificado válido para:', validation.curso_nome);
}
```

**O sistema de certificados agora funciona perfeitamente com o novo sistema de quiz específico!** 🚀
