# 🚀 Instruções Pós-Update - ERA Learn

## ✅ **Configurações Aplicadas:**

1. **vite.config.ts** - Configurado para aceitar conexões de qualquer IP na porta 8080
2. **nginx.conf** - Configurado para múltiplos hosts (IP e DNS)
3. **backend/supabase/config.toml** - URLs de redirecionamento atualizadas
4. **fix-upload-function.sql** - Script SQL criado para corrigir função ausente
5. **configuracao-ambiente.env** - Modelo de configuração de ambiente

## 🔧 **Próximos Passos Obrigatórios:**

### **1. Configurar Variáveis de Ambiente**
Copie o conteúdo de `configuracao-ambiente.env` para `.env.local`:

```bash
# No Windows (PowerShell)
Copy-Item configuracao-ambiente.env .env.local

# Depois edite .env.local e substitua:
# sua_chave_anon_aqui_do_supabase -> pela chave real do Supabase
```

### **2. Executar Script SQL no Supabase**
1. Acesse: https://supabase.com/dashboard/project/oqoxhavdhrgd/sql
2. Copie e execute o conteúdo do arquivo `fix-upload-function.sql`
3. Verifique se aparece "Função obter_proxima_ordem_video criada com sucesso!"

### **3. Iniciar o Servidor**
```bash
npm run dev
```

## 🌐 **URLs de Acesso:**

Após as configurações, a plataforma estará acessível em:

- **IP com porta:** http://138.59.144.162:8080
- **DNS:** http://eralearn.sobreip.com.br
- **Local:** http://localhost:8080

## 🧪 **Testar Funcionalidades:**

### **Teste 1: Acesso por IP**
```bash
curl -I http://138.59.144.162:8080
```

### **Teste 2: Upload de Vídeos**
1. Acesse a plataforma
2. Vá em "Fundamentos de PABX"
3. Clique em "Adicionar Vídeo"
4. Tente fazer upload de um vídeo pequeno

## 🔍 **Verificações:**

### **Se o upload ainda falhar:**
1. Verifique se executou o SQL no Supabase
2. Confirme se a chave do Supabase está correta no .env.local
3. Verifique o console do navegador (F12) para erros específicos

### **Se não conseguir acessar por IP:**
1. Verifique se o servidor está rodando: `npm run dev`
2. Confirme se está na porta 8080
3. Teste localmente primeiro: http://localhost:8080

## 🎯 **Resultado Esperado:**

✅ **Upload de vídeos funcionando**  
✅ **Acesso por IP: http://138.59.144.162:8080**  
✅ **Função SQL corrigida no Supabase**  
✅ **Configurações de CORS habilitadas**  

## 🆘 **Suporte:**

Se houver problemas:
1. Verifique os logs do console (F12)
2. Confirme que todas as configurações foram aplicadas
3. Teste primeiro localmente, depois por IP
4. Verifique se o firewall não está bloqueando a porta 8080

---

**Versão atualizada em:** $(date)  
**Configurações aplicadas:** Upload de vídeos + Acesso por IP
