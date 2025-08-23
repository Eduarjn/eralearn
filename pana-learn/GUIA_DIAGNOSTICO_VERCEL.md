# 🔍 **Guia de Diagnóstico - Problemas no Vercel**

## **📋 Problemas Comuns no Deploy Vercel**

### **1. 🚨 Variáveis de Ambiente**
O problema mais comum é a falta de variáveis de ambiente no Vercel.

#### **Verificar no Vercel Dashboard:**
1. Acesse: https://vercel.com/dashboard
2. Selecione seu projeto
3. Vá para **Settings** → **Environment Variables**
4. Verifique se estas variáveis estão configuradas:

```bash
# Supabase (Obrigatórias)
VITE_SUPABASE_URL=https://oqoxhavdhrgdjvxvajze.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xb3hoYXZkaHJnZGp2eHZhanplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNzg3NTQsImV4cCI6MjA2NTc1NDc1NH0.m5r7W5hzL1x8pA0nqRQXRpFLTqM1sUIJuSCh00uFRgM

# Opcionais (se usar IA)
FEATURE_AI=true
OPENAI_API_KEY=sk-...
```

### **2. 🔧 Configuração do Supabase**

#### **URLs de Redirecionamento:**
1. Acesse: https://supabase.com/dashboard/project/oqoxhavdhrgdjvxvajze
2. Vá para **Authentication** → **URL Configuration**
3. Adicione suas URLs do Vercel:

```bash
# Site URL
https://seu-projeto.vercel.app

# Redirect URLs
https://seu-projeto.vercel.app/auth/callback
https://seu-projeto.vercel.app/login
https://seu-projeto.vercel.app/register
```

### **3. 🏗️ Problemas de Build**

#### **Verificar Logs de Build:**
1. No Vercel Dashboard, vá para **Deployments**
2. Clique no último deploy
3. Verifique se há erros no build

#### **Problemas Comuns:**
```bash
# Erro: Module not found
npm install --legacy-peer-deps

# Erro: TypeScript
npm run build --verbose

# Erro: Dependências
rm -rf node_modules package-lock.json
npm install
```

### **4. 🌐 Problemas de CORS**

#### **Configurar CORS no Supabase:**
1. Vá para **Settings** → **API**
2. Adicione seu domínio Vercel:

```bash
# Allowed Origins
https://seu-projeto.vercel.app
https://*.vercel.app
```

### **5. 📱 Problemas de Roteamento**

#### **Verificar vercel.json:**
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## **🔍 Diagnóstico Passo a Passo**

### **Passo 1: Verificar Console do Navegador**
1. Abra sua aplicação no Vercel
2. Pressione **F12** → **Console**
3. Procure por erros como:
   - `Failed to fetch`
   - `CORS error`
   - `Module not found`
   - `Authentication error`

### **Passo 2: Verificar Network Tab**
1. **F12** → **Network**
2. Recarregue a página
3. Verifique se as requisições para o Supabase estão funcionando
4. Procure por status 401, 403, 500

### **Passo 3: Testar Autenticação**
1. Tente fazer login
2. Verifique se o token está sendo salvo
3. Teste se as requisições autenticadas funcionam

### **Passo 4: Verificar Build Local**
```bash
# Testar build localmente
npm run build
npm run preview

# Se funcionar local, o problema é no Vercel
```

## **🛠️ Soluções Específicas**

### **Solução 1: Reconfigurar Variáveis de Ambiente**
```bash
# No Vercel Dashboard
Settings → Environment Variables

# Adicionar/Atualizar:
VITE_SUPABASE_URL=https://oqoxhavdhrgdjvxvajze.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xb3hoYXZkaHJnZGp2eHZhanplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNzg3NTQsImV4cCI6MjA2NTc1NDc1NH0.m5r7W5hzL1x8pA0nqRQXRpFLTqM1sUIJuSCh00uFRgM
```

### **Solução 2: Atualizar Configuração do Supabase**
```sql
-- Execute no SQL Editor do Supabase
-- Verificar se as policies estão corretas
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

### **Solução 3: Forçar Rebuild**
```bash
# No Vercel Dashboard
Deployments → Redeploy
# Ou
git commit --allow-empty -m "Force redeploy"
git push
```

### **Solução 4: Verificar Dependências**
```bash
# Atualizar package.json se necessário
npm update
npm audit fix
```

## **📊 Checklist de Verificação**

### **✅ Pré-Deploy:**
- [ ] Variáveis de ambiente configuradas
- [ ] URLs de redirecionamento no Supabase
- [ ] CORS configurado
- [ ] Build funcionando localmente
- [ ] vercel.json configurado

### **✅ Pós-Deploy:**
- [ ] Console sem erros
- [ ] Autenticação funcionando
- [ ] Requisições ao Supabase funcionando
- [ ] Roteamento funcionando
- [ ] Assets carregando

### **✅ Testes:**
- [ ] Login/Registro
- [ ] Navegação entre páginas
- [ ] Upload de arquivos
- [ ] Funcionalidades específicas
- [ ] Responsividade

## **🚨 Problemas Específicos**

### **Problema: "Failed to fetch"**
**Causa:** CORS ou variáveis de ambiente
**Solução:** Verificar CORS no Supabase e variáveis no Vercel

### **Problema: "Authentication error"**
**Causa:** URLs de redirecionamento incorretas
**Solução:** Atualizar URLs no Supabase Dashboard

### **Problema: "Module not found"**
**Causa:** Dependências não instaladas
**Solução:** Verificar package.json e node_modules

### **Problema: "Build failed"**
**Causa:** Erro no código ou dependências
**Solução:** Verificar logs de build e corrigir erros

## **📞 Suporte**

### **Logs Úteis para Debug:**
```javascript
// Adicionar no código para debug
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Environment:', import.meta.env.MODE);
console.log('Build Time:', import.meta.env.BUILD_TIME);
```

### **Comandos de Debug:**
```bash
# Verificar build local
npm run build

# Verificar dependências
npm ls

# Verificar variáveis de ambiente
echo $VITE_SUPABASE_URL
```

---

**🎯 Resultado:** Aplicação funcionando perfeitamente no Vercel! 🚀

**📅 Última Atualização:** Janeiro 2025
**👨‍💻 Desenvolvido por:** Assistente AI
