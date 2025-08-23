# 🖼️ **Guia Completo - Caminhos das Imagens na Plataforma**

## **🔍 Como a Plataforma Consulta as Imagens**

### **1. Sistema de Branding (Principal)**
A plataforma usa um sistema de branding que consulta as imagens do banco de dados:

#### **Tabela: `branding_config`**
```sql
-- Configurações de branding no Supabase
SELECT * FROM branding_config ORDER BY created_at DESC LIMIT 1;
```

#### **Campos de Imagem:**
- `logo_url` - Logo principal da empresa
- `background_url` - Imagem de fundo da tela de login
- `favicon_url` - Ícone das abas do navegador

### **2. Caminhos Padrão (Fallbacks)**
Se não houver configuração no banco, usa estes caminhos:

```typescript
// Caminhos padrão no BrandingContext
const defaultBranding: BrandingConfig = {
  logo_url: '/logotipoeralearn.png',
  background_url: '/lovable-uploads/aafcc16a-d43c-4f66-9fa4-70da46d38ccb.png',
  favicon_url: '/favicon.ico'
};
```

## **📁 Estrutura de Arquivos**

### **Pasta `public/` (Arquivos Estáticos)**
```
public/
├── logotipoeralearn.png          # Logo principal
├── logotipoeralearn.svg          # Logo em SVG
├── favicon.ico                   # Ícone das abas
├── placeholder.svg               # Imagem placeholder
└── lovable-uploads/
    └── aafcc16a-d43c-4f66-9fa4-70da46d38ccb.png  # Background
```

## **🎯 Caminhos Corretos para Vercel**

### **1. Logo Principal**
```typescript
// Caminho correto para Vercel
const logoPath = "https://eralearn-94hi.vercel.app/logotipoeralearn.png";

// Fallback local
const logoFallback = "/logotipoeralearn.png";
```

### **2. Imagem de Fundo**
```typescript
// Caminho correto para Vercel
const backgroundPath = "https://eralearn-94hi.vercel.app/lovable-uploads/aafcc16a-d43c-4f66-9fa4-70da46d38ccb.png";

// Fallback local
const backgroundFallback = "/lovable-uploads/aafcc16a-d43c-4f66-9fa4-70da46d38ccb.png";
```

### **3. Favicon**
```typescript
// Caminho correto para Vercel
const faviconPath = "https://eralearn-94hi.vercel.app/favicon.ico";

// Fallback local
const faviconFallback = "/favicon.ico";
```

## **🔧 Como Implementar Corretamente**

### **1. Atualizar BrandingContext**
```typescript
// Em src/context/BrandingContext.tsx
const defaultBranding: BrandingConfig = {
  logo_url: 'https://eralearn-94hi.vercel.app/logotipoeralearn.png',
  background_url: 'https://eralearn-94hi.vercel.app/lovable-uploads/aafcc16a-d43c-4f66-9fa4-70da46d38ccb.png',
  favicon_url: 'https://eralearn-94hi.vercel.app/favicon.ico'
};
```

### **2. Atualizar AuthForm**
```typescript
// Em src/components/AuthForm.tsx
<img 
  src="https://eralearn-94hi.vercel.app/logotipoeralearn.png" 
  alt="ERA Learn Logo" 
  onError={(e) => {
    e.currentTarget.src = "/logotipoeralearn.png";
  }}
/>

// Background
<div 
  style={{
    backgroundImage: `url(https://eralearn-94hi.vercel.app/lovable-uploads/aafcc16a-d43c-4f66-9fa4-70da46d38ccb.png)`
  }}
/>
```

### **3. Atualizar Banco de Dados**
```sql
-- Atualizar configuração de branding
UPDATE branding_config 
SET 
  logo_url = 'https://eralearn-94hi.vercel.app/logotipoeralearn.png',
  background_url = 'https://eralearn-94hi.vercel.app/lovable-uploads/aafcc16a-d43c-4f66-9fa4-70da46d38ccb.png',
  favicon_url = 'https://eralearn-94hi.vercel.app/favicon.ico'
WHERE id = (SELECT id FROM branding_config ORDER BY created_at DESC LIMIT 1);
```

## **🚀 Solução Completa**

### **1. Verificar se os arquivos existem**
```bash
# Testar URLs diretamente no navegador
https://eralearn-94hi.vercel.app/logotipoeralearn.png
https://eralearn-94hi.vercel.app/lovable-uploads/aafcc16a-d43c-4f66-9fa4-70da46d38ccb.png
https://eralearn-94hi.vercel.app/favicon.ico
```

### **2. Se as URLs não funcionarem**
```typescript
// Usar caminhos relativos com fallbacks
const getImageUrl = (path: string) => {
  const isVercel = window.location.hostname.includes('vercel.app');
  if (isVercel) {
    return `https://eralearn-94hi.vercel.app${path}`;
  }
  return path;
};
```

### **3. Atualizar todos os componentes**
- `AuthForm.tsx` - Logo e background
- `ERASidebar.tsx` - Logo na sidebar
- `ERALayout.tsx` - Logo no header
- `BrandingContext.tsx` - Configurações padrão

## **📊 Checklist de Verificação**

### **✅ Arquivos na pasta public/**
- [ ] `logotipoeralearn.png` existe
- [ ] `lovable-uploads/aafcc16a-d43c-4f66-9fa4-70da46d38ccb.png` existe
- [ ] `favicon.ico` existe

### **✅ URLs acessíveis**
- [ ] `https://eralearn-94hi.vercel.app/logotipoeralearn.png` carrega
- [ ] `https://eralearn-94hi.vercel.app/lovable-uploads/aafcc16a-d43c-4f66-9fa4-70da46d38ccb.png` carrega
- [ ] `https://eralearn-94hi.vercel.app/favicon.ico` carrega

### **✅ Configuração no banco**
- [ ] Tabela `branding_config` existe
- [ ] Configuração com URLs corretas
- [ ] Políticas RLS configuradas

---

**🎯 Resultado:** Imagens carregando corretamente no Vercel! 🚀
