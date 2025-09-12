# 🚀 ERA Learn - Instalação Automática Completa

## 🎯 **O que Você Vai Ter**

Após executar os scripts, você terá:

- ✅ **PostgreSQL** instalado e configurado
- ✅ **HeidiSQL** instalado e conectado automaticamente
- ✅ **Banco eralearn** com dados completos
- ✅ **13 tabelas** da ERA Learn criadas
- ✅ **Usuários de exemplo** já cadastrados
- ✅ **Atalhos** na área de trabalho

---

## 🚀 **INSTALAÇÃO EM 1 CLIQUE**

### **Execute APENAS um arquivo:**

```bash
🔥 INSTALAR_TUDO_AUTOMATICO.bat
```

**Este script faz TUDO sozinho:**
- Baixa PostgreSQL
- Baixa HeidiSQL  
- Instala ambos
- Cria banco eralearn
- Carrega estrutura completa
- Configura conexão automática
- Cria atalhos

**⚠️ IMPORTANTE: Execute como ADMINISTRADOR**
- Clique direito no arquivo
- Selecione "Executar como administrador"

---

## 🛠️ **Scripts Auxiliares**

### **Se algo der errado:**

| Script | Função |
|--------|--------|
| `VERIFICAR_INSTALACAO.bat` | Verifica se tudo está funcionando |
| `CORRIGIR_BANCO.bat` | Corrige problemas do PostgreSQL |
| `CONFIGURAR_HEIDISQL.bat` | Reconfigura conexão HeidiSQL |

---

## 📊 **Dados de Conexão**

### **Após a instalação:**

```
🌐 Host: localhost
👤 Usuário: eralearn
🔐 Senha: eralearn2024!
🗄️ Database: eralearn
📡 Porta: 5432
```

### **Usuários de Teste Criados:**

| Email | Senha | Tipo |
|-------|-------|------|
| admin@eralearn.com | admin123 | admin_master |
| admin@local.com | admin123 | admin |
| cliente@test.com | cliente123 | cliente |

---

## 🗄️ **Estrutura do Banco**

### **Tabelas Criadas (13 total):**

#### **👥 Usuários e Autenticação:**
- `usuarios` - Dados dos usuários
- `sessoes` - Sessões ativas
- `domains` - Múltiplos domínios

#### **📚 Cursos e Conteúdo:**
- `cursos` - Informações dos cursos
- `modulos` - Módulos dos cursos
- `videos` - Vídeos das aulas
- `video_progress` - Progresso dos usuários

#### **📝 Avaliações:**
- `quizzes` - Avaliações disponíveis
- `quiz_perguntas` - Perguntas dos quizzes
- `progresso_quiz` - Progresso nas avaliações

#### **🏆 Certificados:**
- `certificados` - Certificados emitidos

#### **🎨 Configurações:**
- `branding_config` - Personalização visual
- `uploads` - Arquivos enviados

---

## 🎯 **Como Usar o HeidiSQL**

### **Passo a passo:**

1. **Abrir HeidiSQL**
   - Clique no ícone da área de trabalho
   - Ou vá em: Programas > HeidiSQL

2. **Conectar ao Banco**
   - Clique duas vezes em "ERA_Learn_Local"
   - Conexão automática (já configurada!)

3. **Explorar Dados**
   - À esquerda: lista de tabelas
   - Clique em qualquer tabela para ver os dados
   - Use a aba "Data" para visualizar registros

### **Consultas Úteis:**

#### **Ver Todos os Usuários:**
```sql
SELECT id, email, nome, tipo_usuario, ativo, created_at 
FROM usuarios 
ORDER BY created_at;
```

#### **Ver Todos os Cursos:**
```sql
SELECT id, nome, categoria, ativo, ordem 
FROM cursos 
ORDER BY ordem;
```

#### **Ver Estrutura Completa:**
```sql
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
ORDER BY table_name, ordinal_position;
```

---

## 🔍 **Dados de Exemplo Incluídos**

### **Usuários Pré-criados:**
- ✅ **3 usuários** (admin_master, admin, cliente)
- ✅ **Senhas funcionais** para teste

### **Cursos de Exemplo:**
- ✅ **Fundamentos de PABX**
- ✅ **Configurações Avançadas PABX**  
- ✅ **OMNICHANNEL para Empresas**
- ✅ **Fundamentos CALLCENTER**

### **Quizzes Configurados:**
- ✅ **Quiz para cada categoria** de curso
- ✅ **Perguntas técnicas** específicas
- ✅ **Sistema de pontuação** funcionando

### **Configurações:**
- ✅ **Branding padrão** da ERA Learn
- ✅ **Domínio principal** configurado
- ✅ **Estrutura multi-tenant** pronta

---

## 🐛 **Solução de Problemas**

### **❌ "PostgreSQL não instalou"**
```bash
# Execute manualmente:
1. VERIFICAR_INSTALACAO.bat
2. Se precisar: INSTALAR_TUDO_AUTOMATICO.bat (como admin)
```

### **❌ "Erro de conexão"**
```bash
# Execute na ordem:
1. VERIFICAR_INSTALACAO.bat
2. CORRIGIR_BANCO.bat
3. CONFIGURAR_HEIDISQL.bat
```

### **❌ "HeidiSQL não conecta"**
```bash
# Verificar:
1. PostgreSQL está rodando?
2. Firewall bloqueando porta 5432?
3. Execute: CONFIGURAR_HEIDISQL.bat
```

### **❌ "Tabelas vazias"**
```bash
# Recarregar dados:
1. CORRIGIR_BANCO.bat
2. Ou execute manualmente: database/init/02-dados-iniciais.sql
```

---

## 📁 **Arquivos Importantes**

### **Scripts de Instalação:**
- `INSTALAR_TUDO_AUTOMATICO.bat` - **Principal**
- `VERIFICAR_INSTALACAO.bat` - Diagnóstico
- `CORRIGIR_BANCO.bat` - Correções
- `CONFIGURAR_HEIDISQL.bat` - Configurar HeidiSQL

### **Banco de Dados:**
- `database/init/01-schema.sql` - Estrutura completa
- `database/init/02-dados-iniciais.sql` - Dados de exemplo
- `load-database-manual.sql` - Script manual

### **Configurações:**
- `setup-postgres-windows.bat` - Instalação manual PostgreSQL
- Atalhos automáticos na área de trabalho

---

## 🎉 **Resultado Final**

### **Você terá acesso completo a:**

- 🗄️ **Banco PostgreSQL** local funcionando
- 🔗 **HeidiSQL** conectado automaticamente  
- 📊 **13 tabelas** da ERA Learn com dados
- 👥 **Usuários de teste** prontos para usar
- 📚 **Cursos de exemplo** completos
- 🏆 **Sistema de certificados** funcional

### **Interface HeidiSQL:**
- ✅ **Visualização gráfica** de todas as tabelas
- ✅ **Edição direta** dos dados
- ✅ **Execução de queries** SQL
- ✅ **Export/Import** de dados
- ✅ **Backup automático** disponível

---

## 📞 **Suporte**

### **Se precisar de ajuda:**

1. **Execute primeiro:** `VERIFICAR_INSTALACAO.bat`
2. **Se houver erros:** `CORRIGIR_BANCO.bat`
3. **Para reconfigurar:** `CONFIGURAR_HEIDISQL.bat`

### **Contatos:**
- 📧 Documentação completa nos arquivos `.md`
- 🔧 Scripts de correção automática incluídos
- 📋 Logs detalhados em cada execução

---

## 🎯 **Próximos Passos**

1. **Execute:** `INSTALAR_TUDO_AUTOMATICO.bat`
2. **Aguarde** a instalação completa (5-10 minutos)
3. **Abra** HeidiSQL pelo atalho
4. **Conecte** clicando em "ERA_Learn_Local"  
5. **Explore** as tabelas da ERA Learn!

**🔥 Tudo pronto em poucos cliques!**


















