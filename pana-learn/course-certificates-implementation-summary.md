# ✅ Implementação - Certificados por Curso

## 🎯 **Funcionalidade Implementada:**
Refatoração da página `/certificados` para listar um card para cada curso existente, agregando dados do certificado configurado para aquele curso.

## 🔧 **Componentes Criados:**

### **1. CourseCertificateCard.tsx (NOVO)**
```typescript
// Card que exibe estatísticas de certificados por curso
interface Course {
  id: string;
  nome: string;
  categoria: string;
  certificados: Certificate[];
}
```

**Funcionalidades:**
- ✅ **Título do Curso** (`course.nome`)
- ✅ **Total de Certificados** (`course.certificados.length`)
- ✅ **Média de Nota** (calculada por reduce)
- ✅ **Status dos Certificados** (contagem por status)
- ✅ **Última Emissão** (máximo de data_emissao)
- ✅ **Botão de Edição** (apenas para admins)
- ✅ **Layout responsivo** (grid 3/2/1 colunas)

### **2. CourseCertConfigModal.tsx (NOVO)**
```typescript
// Modal para editar configurações de certificado por curso
interface CertificateConfig {
  curso_id: string;
  validade_dias?: number;
  qr_code_enabled?: boolean;
  assinatura_enabled?: boolean;
  logo_url?: string;
  cor_primaria?: string;
  fonte?: string;
  alinhamento?: 'left' | 'center' | 'right';
  template_html?: string;
  layout_config?: Record<string, unknown>;
}
```

**Funcionalidades:**
- ✅ **Fetch automático** da configuração do curso
- ✅ **Formulário completo** com todos os campos
- ✅ **Validação** e tratamento de erros
- ✅ **Loading states** durante operações
- ✅ **Responsivo** para mobile
- ✅ **Trap de foco** e ESC para fechar

## 📊 **Nova Query Supabase:**

### **Estrutura de Dados:**
```typescript
// Buscar todos os cursos com seus certificados
const { data: courses, error } = await supabase
  .from('cursos')
  .select(`
    id,
    nome,
    categoria,
    certificados:certificados(
      id,
      numero_certificado,
      nota_final,
      status,
      data_emissao
    )
  `);
```

### **Resultado:**
```typescript
interface Course {
  id: string;
  nome: string;
  categoria: string;
  certificados: Certificate[]; // Array de certificados do curso
}
```

## 📋 **Campos Exibidos no Card:**

### **✅ Informações do Curso:**
- **Nome do Curso** (`course.nome`)
- **Categoria** (`course.categoria`)
- **Total de Certificados** (`course.certificados.length`)

### **✅ Estatísticas Calculadas:**
- **Média de Nota:** `Math.round(certificados.reduce((sum, cert) => sum + cert.nota_final, 0) / total)`
- **Status Breakdown:** Contagem de ativos, revogados, expirados
- **Última Emissão:** `Math.max(...certificados.map(c => new Date(c.data_emissao).getTime()))`

## 🔐 **Segurança e Permissões:**

### **✅ Visibilidade Condicional:**
```typescript
const isAdmin = userProfile?.tipo_usuario === 'admin' || userProfile?.tipo_usuario === 'admin_master';

{isAdmin && (
  <Button onClick={() => onEditConfig(course)}>
    <Settings className="h-4 w-4" />
  </Button>
)}
```

### **✅ Validações Implementadas:**
- **Campos obrigatórios:** Nome do curso, categoria
- **Validação de dados:** Nota 0-100%, status válidos
- **Sanitização:** Dados limpos antes de salvar

## 📱 **UX/UI Implementada:**

### **✅ Grid Responsivo:**
- **Desktop (lg):** 3 colunas
- **Tablet (md):** 2 colunas  
- **Mobile (sm):** 1 coluna

### **✅ Estados Visuais:**
- **Loading:** Spinner durante fetch/save
- **Success:** Toast verde ao salvar
- **Error:** Toast vermelho em caso de erro
- **Disabled:** Formulário desabilitado durante save

### **✅ Feedback Visual:**
- **Botão de configuração:** Hover state e tooltip
- **Campos:** Validação em tempo real
- **Botões:** Estados de loading e disabled

## 🧪 **Como Testar:**

### **1. Teste Básico:**
1. Login como admin
2. Acesse `/certificados`
3. Verifique se os cards de cursos aparecem
4. Clique no ícone de configuração (⚙️) em qualquer card
5. Edite alguma configuração e salve
6. Verifique se as mudanças são aplicadas

### **2. Teste de Permissões:**
1. Login como cliente
2. Verifique se o botão de configuração não aparece
3. Login como admin
4. Verifique se o botão aparece

### **3. Teste de Responsividade:**
1. Abra a página em mobile viewport
2. Verifique se o grid se adapta (1 coluna)
3. Teste o modal de configuração em mobile

## 🎉 **Resultado:**
**Funcionalidade completa implementada! A página `/certificados` agora exibe cards por curso com estatísticas agregadas e permite edição inline das configurações de certificado para cada curso.** 