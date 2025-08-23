# 🚨 **Principais Problemas no Vercel - Resumo Rápido**

## **🔍 Diagnóstico Rápido**

### **1. Abra o Console do Navegador (F12)**
Procure por estes erros:
- ❌ `Failed to fetch`
- ❌ `CORS error`
- ❌ `Module not found`
- ❌ `Authentication error`

### **2. Verifique as Variáveis de Ambiente**
No Vercel Dashboard → Settings → Environment Variables:

```bash
# OBRIGATÓRIAS:
VITE_SUPABASE_URL=https://oqoxhavdhrgdjvxvajze.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xb3hoYXZkaHJnZGp2eHZhanplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNzg3NTQsImV4cCI6MjA2NTc1NDc1NH0.m5r7W5hzL1x8pA0nqRQXRpFLTqM1sUIJuSCh00uFRgM
```

### **3. Configure URLs no Supabase**
Acesse: https://supabase.com/dashboard/project/oqoxhavdhrgdjvxvajze

**Authentication → URL Configuration:**
```bash
Site URL: https://seu-projeto.vercel.app
Redirect URLs: 
- https://seu-projeto.vercel.app/auth/callback
- https://seu-projeto.vercel.app/login
- https://seu-projeto.vercel.app/register
```

## **🛠️ Soluções por Problema**

### **❌ Problema: "Failed to fetch"**
**Causa:** CORS ou variáveis de ambiente
**Solução:**
1. Verificar variáveis no Vercel
2. Configurar CORS no Supabase
3. Verificar URLs de redirecionamento

### **❌ Problema: "Authentication error"**
**Causa:** URLs de redirecionamento incorretas
**Solução:**
1. Atualizar URLs no Supabase Dashboard
2. Verificar se o domínio está correto

### **❌ Problema: "Module not found"**
**Causa:** Dependências não instaladas
**Solução:**
1. Verificar package.json
2. Forçar rebuild no Vercel
3. Limpar cache se necessário

### **❌ Problema: "Build failed"**
**Causa:** Erro no código
**Solução:**
1. Verificar logs de build
2. Testar build local: `npm run build`
3. Corrigir erros de TypeScript

## **🚀 Checklist Rápido**

### **✅ Pré-Deploy:**
- [ ] Variáveis de ambiente configuradas
- [ ] URLs de redirecionamento no Supabase
- [ ] Build funcionando localmente
- [ ] vercel.json configurado

### **✅ Pós-Deploy:**
- [ ] Console sem erros
- [ ] Autenticação funcionando
- [ ] Requisições ao Supabase funcionando
- [ ] Roteamento funcionando

## **🔧 Comandos Úteis**

### **Testar Build Local:**
```bash
npm run build
npm run preview
```

### **Forçar Rebuild no Vercel:**
```bash
git commit --allow-empty -m "Force redeploy"
git push
```

### **Verificar Dependências:**
```bash
npm ls
npm audit fix
```

## **📞 Debug Rápido**

### **1. Adicione este código temporariamente:**
```javascript
// No console do navegador
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Environment:', import.meta.env.MODE);
```

### **2. Verifique Network Tab:**
- F12 → Network
- Recarregue a página
- Procure por requisições com erro

### **3. Teste Autenticação:**
- Tente fazer login
- Verifique se o token é salvo
- Teste uma requisição autenticada

## **🎯 Solução Mais Comum**

**90% dos problemas são variáveis de ambiente!**

1. **Vercel Dashboard** → **Settings** → **Environment Variables**
2. **Adicione/Atualize:**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. **Redeploy** a aplicação
4. **Teste** novamente

## **📋 URLs Importantes**

### **Vercel:**
- Dashboard: https://vercel.com/dashboard
- Deployments: https://vercel.com/dashboard/[projeto]/deployments

### **Supabase:**
- Dashboard: https://supabase.com/dashboard/project/oqoxhavdhrgdjvxvajze
- Auth Settings: https://supabase.com/dashboard/project/oqoxhavdhrgdjvxvajze/auth/url-configuration

---

**🎯 Resultado:** Aplicação funcionando no Vercel! 🚀

**💡 Dica:** Se ainda não funcionar, verifique os logs de build no Vercel Dashboard.
