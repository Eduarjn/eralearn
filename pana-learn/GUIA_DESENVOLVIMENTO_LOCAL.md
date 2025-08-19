# 🖥️ **GUIA DE DESENVOLVIMENTO LOCAL**

## 🎯 **OBJETIVO**
Testar todas as funcionalidades no localhost antes de fazer deploy para produção.

## 🚀 **CONFIGURAÇÃO DO AMBIENTE LOCAL**

### **✅ 1. VERIFICAR DEPENDÊNCIAS**

```bash
# Navegar para o diretório do projeto
cd pana-learn

# Verificar se o Node.js está instalado
node --version
npm --version

# Instalar dependências
npm install
```

### **✅ 2. CONFIGURAR VARIÁVEIS DE AMBIENTE**

Criar arquivo `.env.local` na raiz do projeto:

```env
# Supabase Configuration
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase

# Ambiente
VITE_ENVIRONMENT=development
VITE_APP_URL=http://localhost:5173

# Configurações de Debug
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
```

### **✅ 3. CONFIGURAR SUPABASE LOCAL (OPCIONAL)**

Para desenvolvimento completo, você pode usar Supabase local:

```bash
# Instalar Supabase CLI
npm install -g supabase

# Inicializar Supabase local
supabase init

# Iniciar Supabase local
supabase start
```

## 🧪 **PROCESSO DE TESTE LOCAL**

### **✅ 1. INICIAR SERVIDOR DE DESENVOLVIMENTO**

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Acessar no navegador
# http://localhost:5173
```

### **✅ 2. CHECKLIST DE TESTES**

#### **🔐 Autenticação:**
- [ ] **Login** - Testar login com diferentes tipos de usuário
- [ ] **Registro** - Testar cadastro de novos usuários
- [ ] **Recuperação de Senha** - Testar fluxo de recuperação
- [ ] **Logout** - Verificar se o logout funciona

#### **🎨 White-Label:**
- [ ] **Upload de Logo** - Testar upload de logo principal
- [ ] **Upload de Sublogo** - Testar upload de sublogo
- [ ] **Upload de Favicon** - Testar upload de favicon
- [ ] **Upload de Imagem de Fundo** - Testar upload de background
- [ ] **Configuração de Cores** - Testar mudança de cores
- [ ] **Informações da Empresa** - Testar nome e slogan
- [ ] **Preview em Tempo Real** - Verificar se as mudanças aparecem

#### **📚 Cursos e Vídeos:**
- [ ] **Listagem de Cursos** - Verificar se os cursos aparecem
- [ ] **Reprodução de Vídeos** - Testar player de vídeo
- [ ] **Progresso de Vídeos** - Verificar se o progresso é salvo
- [ ] **Quizzes** - Testar sistema de quizzes
- [ ] **Certificados** - Testar geração de certificados

#### **👥 Usuários:**
- [ ] **Listagem de Usuários** - Verificar se a lista aparece
- [ ] **Criação de Usuários** - Testar criação de novos usuários
- [ ] **Edição de Usuários** - Testar edição de perfis
- [ ] **Permissões** - Verificar se as permissões funcionam

#### **🔧 Configurações:**
- [ ] **Preferências** - Testar configurações de usuário
- [ ] **Conta** - Testar alteração de senha e avatar
- [ ] **Integrações** - Verificar configurações de API
- [ ] **Segurança** - Testar configurações de segurança

## 🐛 **DEBUGGING LOCAL**

### **✅ 1. LOGS DO CONSOLE**

```javascript
// Adicionar logs para debugging
console.log('🔍 Debug:', data);
console.error('❌ Erro:', error);
console.warn('⚠️ Aviso:', warning);
```

### **✅ 2. FERRAMENTAS DE DESENVOLVIMENTO**

- **React Developer Tools** - Para debug de componentes
- **Redux DevTools** - Para debug de estado (se usar Redux)
- **Network Tab** - Para verificar requisições
- **Console** - Para logs e erros

### **✅ 3. TESTES AUTOMATIZADOS**

```bash
# Executar testes unitários
npm run test

# Executar testes de integração
npm run test:integration

# Executar testes E2E
npm run test:e2e
```

## 📋 **CHECKLIST DE QUALIDADE**

### **✅ Funcionalidade:**
- [ ] Todas as funcionalidades principais funcionam
- [ ] Não há erros no console
- [ ] Performance está adequada
- [ ] Responsividade funciona em diferentes telas

### **✅ UX/UI:**
- [ ] Interface está intuitiva
- [ ] Feedback visual está claro
- [ ] Loading states funcionam
- [ ] Error states são informativos

### **✅ Segurança:**
- [ ] Autenticação está funcionando
- [ ] Permissões estão sendo aplicadas
- [ ] Dados sensíveis não estão expostos
- [ ] Validações estão funcionando

### **✅ Performance:**
- [ ] Carregamento inicial é rápido
- [ ] Imagens estão otimizadas
- [ ] Não há memory leaks
- [ ] Bundle size está adequado

## 🚀 **PROCESSO DE DEPLOY**

### **✅ 1. TESTE COMPLETO**

Antes de fazer deploy:

```bash
# Executar todos os testes
npm run test:all

# Verificar build de produção
npm run build

# Testar build localmente
npm run preview
```

### **✅ 2. CHECKLIST FINAL**

- [ ] Todos os testes passaram
- [ ] Build de produção foi gerado com sucesso
- [ ] Variáveis de ambiente estão configuradas
- [ ] Banco de dados está atualizado
- [ ] Storage está configurado

### **✅ 3. DEPLOY PARA PRODUÇÃO**

```bash
# Fazer commit das mudanças
git add .
git commit -m "feat: nova funcionalidade testada localmente"
git push origin master

# Aguardar deploy automático no Vercel
# Verificar se tudo está funcionando em produção
```

## 🔧 **FERRAMENTAS ÚTEIS**

### **✅ Desenvolvimento:**
- **VS Code** - Editor principal
- **ESLint** - Linting de código
- **Prettier** - Formatação de código
- **TypeScript** - Tipagem estática

### **✅ Debugging:**
- **React Developer Tools**
- **Supabase Dashboard**
- **Vercel Dashboard**
- **GitHub Actions**

### **✅ Testes:**
- **Jest** - Testes unitários
- **React Testing Library** - Testes de componentes
- **Cypress** - Testes E2E
- **Playwright** - Testes de browser

## 📞 **SUPORTE LOCAL**

### **✅ Problemas Comuns:**

#### **❌ Erro: "Module not found"**
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

#### **❌ Erro: "Supabase connection failed"**
- Verificar variáveis de ambiente
- Verificar se o Supabase está online
- Verificar se as chaves estão corretas

#### **❌ Erro: "Port already in use"**
```bash
# Encontrar processo usando a porta
lsof -i :5173
# Matar processo
kill -9 <PID>
```

#### **❌ Erro: "Build failed"**
```bash
# Limpar cache
npm run clean
# Reinstalar dependências
npm install
# Tentar build novamente
npm run build
```

## 🎯 **RESULTADO ESPERADO**

Após seguir este guia, você terá:

- ✅ **Ambiente local** configurado e funcionando
- ✅ **Todos os testes** passando
- ✅ **Funcionalidades** validadas
- ✅ **Código** pronto para produção
- ✅ **Deploy** seguro e confiável

**Lembre-se: Sempre teste localmente antes de fazer deploy!** 🚀
