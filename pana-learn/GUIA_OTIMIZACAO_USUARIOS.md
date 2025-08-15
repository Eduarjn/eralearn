# 🔧 **Guia de Otimização da Página de Usuários - ERA Learn**

## 🎯 **Objetivos da Otimização**

1. ✅ **Mostrar todos os usuários** cadastrados na plataforma (clientes, admins, admin_masters)
2. ✅ **Adicionar campo de último login** para visualizar quando cada usuário fez login pela última vez
3. ✅ **Melhorar a interface** com informações mais detalhadas
4. ✅ **Implementar sistema de logs** para rastrear tentativas de login

## 🗄️ **1. Atualizações no Banco de Dados**

### **Execute o Script SQL:**
```sql
-- Arquivo: add-last-login-field.sql
```

**O que o script faz:**
- ✅ Adiciona campo `ultimo_login` na tabela `usuarios`
- ✅ Cria tabela `login_logs` para rastrear tentativas de login
- ✅ Implementa triggers para atualizar automaticamente o último login
- ✅ Configura políticas RLS para segurança

## 🔧 **2. Atualizações no Frontend**

### **A. Atualizar Tipos TypeScript:**
```typescript
// src/integrations/supabase/types.ts
// Adicionar campo ultimo_login na interface usuarios
usuarios: {
  Row: {
    // ... campos existentes
    ultimo_login: string | null
  }
}

// Adicionar nova tabela login_logs
login_logs: {
  Row: {
    id: string
    usuario_id: string
    email: string
    ip_address: string | null
    user_agent: string | null
    success: boolean
    error_message: string | null
    created_at: string
  }
}
```

### **B. Atualizar Hook de Autenticação:**
```typescript
// src/hooks/useAuth.tsx
// Na função signIn, adicionar registro de logs:

const signIn = async (email: string, password: string) => {
  try {
    setLoading(true);
    
    // Obter informações do navegador
    const userAgent = navigator.userAgent;
    const ipAddress = null; // Em produção, obter do servidor
    
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      // Registrar tentativa falhada
      await supabase.from('login_logs').insert({
        usuario_id: userData?.id,
        email: email,
        ip_address: ipAddress,
        user_agent: userAgent,
        success: false,
        error_message: error.message
      });
      return { error: { message: errorMessage } };
    }
    
    // Login bem-sucedido - registrar log
    if (data?.user?.id) {
      await supabase.from('login_logs').insert({
        usuario_id: data.user.id,
        email: email,
        ip_address: ipAddress,
        user_agent: userAgent,
        success: true,
        error_message: null
      });
    }
    
    return { error: null };
  } catch (error) {
    return { error: { message: 'Erro interno no sistema' } };
  }
};
```

### **C. Atualizar Página de Usuários:**
```typescript
// src/pages/Usuarios.tsx

// 1. Atualizar interface UserListItem
interface UserListItem {
  id: string;
  nome: string;
  email: string;
  user_id: string;
  tipo_usuario: string;
  status: string;
  data_criacao: string;
  data_atualizacao: string;
  ultimo_login?: string | null;
}

// 2. Atualizar cabeçalho da tabela
<TableHead className="font-medium text-era-black">Último Login</TableHead>

// 3. Atualizar célula da tabela
<TableCell className="text-era-gray-medium">
  {user.ultimo_login 
    ? new Date(user.ultimo_login).toLocaleDateString('pt-BR') + ' ' + 
      new Date(user.ultimo_login).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    : 'Nunca'
  }
</TableCell>

// 4. Atualizar função fetchUsers para incluir todos os usuários
const fetchUsers = async (search = searchTerm) => {
  setLoading(true);
  try {
    // Buscar TODOS os usuários (clientes, admins, admin_masters)
    const { data: usersData, count, error } = await supabase
      .from('usuarios')
      .select('*', { count: 'exact' })
      .order('data_criacao', { ascending: false });

    if (error) {
      console.error('Erro ao buscar usuários:', error);
      toast({ title: 'Erro ao carregar usuários', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }

    const allUsersData = usersData || [];
    setAllUsers(allUsersData);

    // Filtrar localmente se houver termo de busca
    let filteredUsers = allUsersData;
    if (search.trim()) {
      filteredUsers = allUsersData.filter(user => 
        user.nome?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setUsers(filteredUsers);

    // Calcular estatísticas atualizadas
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const stats: UserStats = {
      total: allUsersData.length,
      ativos: allUsersData.filter(user => user.status === 'ativo').length,
      administradores: allUsersData.filter(user => 
        user.tipo_usuario === 'admin' || user.tipo_usuario === 'admin_master'
      ).length,
      novosEstaSemana: allUsersData.filter(user => 
        new Date(user.data_criacao) >= oneWeekAgo
      ).length
    };

    setUserStats(stats);
  } catch (error) {
    console.error('Erro inesperado ao buscar usuários:', error);
    toast({ title: 'Erro ao carregar usuários', description: 'Erro interno do servidor', variant: 'destructive' });
  } finally {
    setLoading(false);
  }
};
```

## 🎨 **3. Melhorias na Interface**

### **A. Cards de Estatísticas Atualizados:**
```typescript
// Mostrar estatísticas mais detalhadas
<Card className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white">
  <CardContent className="p-4 md:p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xl md:text-2xl font-bold text-white">{userStats.total}</p>
        <p className="text-xs md:text-sm text-white/90">
          +{userStats.novosEstaSemana} novos esta semana
        </p>
      </div>
      <div className="p-2 md:p-3 bg-white/20 rounded-full">
        <Users className="h-4 w-4 md:h-6 md:w-6 text-white" />
      </div>
    </div>
    <p className="text-sm md:text-lg font-semibold text-white mt-2">Total de Usuários</p>
  </CardContent>
</Card>
```

### **B. Filtros Melhorados:**
```typescript
// Adicionar filtros por tipo de usuário e status
<div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
  <div className="flex items-center gap-2 flex-1 max-w-md">
    <Search className="h-4 w-4 text-gray-400" />
    <Input
      placeholder="Buscar por nome ou e-mail..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="flex-1"
    />
  </div>
  <div className="flex gap-2">
    <select
      value={filterTipo}
      onChange={(e) => setFilterTipo(e.target.value)}
      className="rounded-md border px-3 py-2"
    >
      <option value="">Todos os tipos</option>
      <option value="cliente">Clientes</option>
      <option value="admin">Administradores</option>
      <option value="admin_master">Admin Master</option>
    </select>
    <Button onClick={() => setShowNewUserForm(true)}>
      <Plus className="h-4 w-4 mr-2" />
      Novo Usuário
    </Button>
  </div>
</div>
```

## 📊 **4. Funcionalidades Adicionais**

### **A. Visualização de Logs de Login:**
```typescript
// Adicionar botão para ver logs de login do usuário
const handleViewLoginLogs = async (userId: string, userName: string) => {
  try {
    const { data: logs, error } = await supabase
      .from('login_logs')
      .select('*')
      .eq('usuario_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      toast({ title: 'Erro ao carregar logs', description: error.message, variant: 'destructive' });
      return;
    }

    setSelectedUserLogs(logs || []);
    setShowLoginLogsModal(true);
  } catch (error) {
    toast({ title: 'Erro ao carregar logs', description: 'Tente novamente.', variant: 'destructive' });
  }
};
```

### **B. Exportação Melhorada:**
```typescript
// Incluir último login na exportação
const exportUsers = (format: 'csv' | 'json') => {
  const data = users.map(user => ({
    Nome: user.nome,
    Email: user.email,
    Tipo: user.tipo_usuario,
    Status: user.status,
    'Data de Criação': new Date(user.data_criacao).toLocaleDateString('pt-BR'),
    'Último Login': user.ultimo_login 
      ? new Date(user.ultimo_login).toLocaleDateString('pt-BR') + ' ' + 
        new Date(user.ultimo_login).toLocaleTimeString('pt-BR')
      : 'Nunca'
  }));

  // ... lógica de exportação
};
```

## 🚀 **5. Como Implementar**

### **Passo 1: Executar Script SQL**
1. Acesse o Supabase Dashboard
2. Vá para SQL Editor
3. Execute o script `add-last-login-field.sql`

### **Passo 2: Atualizar Frontend**
1. Atualize os tipos TypeScript
2. Modifique o hook de autenticação
3. Atualize a página de usuários
4. Teste as funcionalidades

### **Passo 3: Verificar Funcionamento**
1. Faça login com diferentes usuários
2. Verifique se o último login está sendo registrado
3. Confirme se todos os usuários aparecem na lista
4. Teste os filtros e busca

## ✅ **Resultados Esperados**

Após a implementação, você terá:

- ✅ **Lista completa** de todos os usuários (clientes, admins, admin_masters)
- ✅ **Campo de último login** mostrando quando cada usuário fez login pela última vez
- ✅ **Sistema de logs** rastreando todas as tentativas de login
- ✅ **Interface melhorada** com mais informações e filtros
- ✅ **Exportação completa** incluindo dados de último login

## 🔍 **Troubleshooting**

### **Problema: Usuários não aparecem**
- Verifique as políticas RLS no Supabase
- Confirme se o usuário logado tem permissões adequadas

### **Problema: Último login não atualiza**
- Verifique se o trigger foi criado corretamente
- Confirme se a tabela `login_logs` existe

### **Problema: Erros de TypeScript**
- Atualize os tipos conforme especificado
- Remova referências ao campo `login` se não existir no banco

---

**🎯 Esta otimização transformará a página de usuários em uma ferramenta completa de gestão, permitindo visualizar todos os usuários cadastrados e acompanhar suas atividades de login.**
