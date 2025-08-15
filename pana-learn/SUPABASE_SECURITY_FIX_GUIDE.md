# Guia para Corrigir Problemas de Segurança do Supabase

## 🔍 Problemas Identificados

Baseado no Security Advisor do Supabase, foram identificados os seguintes problemas:

### 1. **RLS (Row Level Security) Desabilitado**
- `public.usuarios` - RLS desabilitado
- `public.relatorios` - RLS desabilitado  
- `public.badges` - RLS desabilitado
- `public.user_badges` - RLS desabilitado
- `public.empresas` - RLS desabilitado

### 2. **Políticas RLS Inconsistentes**
- `public.profiles` - RLS habilitado mas sem políticas
- Algumas tabelas têm políticas mas RLS está desabilitado

### 3. **Funções com Search Path Mutável**
- `public.update_updated_at_column`
- `public.handle_new_user`
- `public.exportar_dados_usuario`
- `public.deletar_dados_usuario`

## 🛠️ Como Aplicar as Correções

### ⚠️ IMPORTANTE: Execute os scripts em ordem!

Devido ao erro de sintaxe encontrado, dividimos o script em 3 partes para evitar problemas:

### Passo 1: Acessar o SQL Editor
1. Vá para o Supabase Dashboard
2. Clique em "SQL Editor" no menu lateral
3. Crie um novo query

### Passo 2: Executar PARTE 1
1. Copie o conteúdo do arquivo `fix-supabase-security-part1.sql`
2. Cole no SQL Editor
3. Clique em "Run" para executar
4. **Aguarde a execução terminar**

### Passo 3: Executar PARTE 2
1. Crie um novo query no SQL Editor
2. Copie o conteúdo do arquivo `fix-supabase-security-part2.sql`
3. Cole no SQL Editor
4. Clique em "Run" para executar
5. **Aguarde a execução terminar**

### Passo 4: Executar PARTE 3
1. Crie um novo query no SQL Editor
2. Copie o conteúdo do arquivo `fix-supabase-security-part3.sql`
3. Cole no SQL Editor
4. Clique em "Run" para executar

### Passo 5: Verificar as Correções
1. Vá para "Security Advisor" no menu lateral
2. Verifique se os erros foram reduzidos
3. Confirme que as políticas foram criadas corretamente

## 📋 O que Cada Parte Faz

### **PARTE 1** - Políticas Básicas:
- Habilita RLS nas tabelas principais
- Cria políticas para `usuarios`, `relatorios`, `badges`, `user_badges`, `empresas`

### **PARTE 2** - Correção de Funções:
- Corrige funções com search path mutável
- Adiciona `SECURITY DEFINER SET search_path = public`

### **PARTE 3** - Políticas Adicionais:
- Cria políticas para `cursos`, `videos`, `modulos`
- Adiciona políticas para `progresso_usuario`, `certificados`, `video_progress`

## ⚠️ Impacto na Aplicação

### ✅ Benefícios
- **Segurança**: Dados protegidos por RLS
- **Performance**: Consultas mais eficientes
- **Conformidade**: Melhor controle de acesso

### 🔄 Possíveis Ajustes Necessários
- Verificar se todas as consultas funcionam corretamente
- Ajustar queries que dependem de acesso direto às tabelas
- Testar funcionalidades de administrador

## 🧪 Teste Após as Correções

1. **Teste como Cliente**:
   - Faça login como cliente
   - Acesse um curso
   - Verifique se não há mais piscar na tela
   - Teste a navegação entre vídeos

2. **Teste como Administrador**:
   - Faça login como administrador
   - Verifique se pode gerenciar todos os dados
   - Teste importar vídeos

3. **Verificar Console**:
   - Abra o DevTools
   - Verifique se não há erros de permissão
   - Confirme que a performance melhorou

## 📊 Monitoramento

Após aplicar as correções:
1. Monitore o Security Advisor regularmente
2. Verifique se novos problemas não aparecem
3. Teste todas as funcionalidades da aplicação
4. Monitore a performance das consultas

## 🆘 Em Caso de Problemas

Se algo parar de funcionar após aplicar as correções:

1. **Reverter Políticas Específicas**:
```sql
DROP POLICY "Nome da Política" ON public.tabela;
```

2. **Desabilitar RLS Temporariamente**:
```sql
ALTER TABLE public.tabela DISABLE ROW LEVEL SECURITY;
```

3. **Verificar Logs**:
- Console do navegador
- Logs do Supabase
- Network tab do DevTools

## 🎯 Resultado Esperado

Após aplicar todas as correções:
- ✅ Security Advisor com menos erros
- ✅ Aplicação funcionando sem piscar
- ✅ Melhor performance
- ✅ Segurança aprimorada
- ✅ Console limpo sem erros

## 📝 Notas Importantes

- **Execute as partes em ordem**: 1 → 2 → 3
- **Aguarde cada execução terminar** antes de executar a próxima
- **Teste a aplicação** após cada parte se necessário
- **Monitore o Security Advisor** para verificar o progresso 