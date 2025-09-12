-- Script para configurar email de recuperação de senha
-- Data: 2025-01-29
-- Este script configura as configurações de email no Supabase para funcionar com a recuperação de senha

-- ========================================
-- 1. VERIFICAR CONFIGURAÇÕES ATUAIS
-- ========================================

-- Verificar se há configurações de email existentes
SELECT '=== CONFIGURAÇÕES DE EMAIL ATUAIS ===' as info;

-- Nota: As configurações de email são feitas via Dashboard do Supabase
-- Este script serve como guia para as configurações necessárias

-- ========================================
-- 2. CONFIGURAÇÕES NECESSÁRIAS NO DASHBOARD
-- ========================================

/*
PASSO A PASSO PARA CONFIGURAR EMAIL DE RECUPERAÇÃO:

1. Acesse o Dashboard do Supabase (https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para "Authentication" > "Email Templates"
4. Configure os templates de email:

A) TEMPLATE DE RECUPERAÇÃO DE SENHA:
   - Subject: "Redefinir sua senha - ERA LEARN"
   - Content HTML:
   <!DOCTYPE html>
   <html>
   <head>
     <meta charset="utf-8">
     <title>Redefinir Senha - ERA LEARN</title>
   </head>
   <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
     <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
       <div style="text-align: center; margin-bottom: 30px;">
         <h1 style="color: #10b981; margin: 0;">ERA LEARN</h1>
         <p style="color: #666; margin: 10px 0;">Plataforma de Ensino Online</p>
       </div>
       
       <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
         <h2 style="color: #333; margin-top: 0;">Redefinir sua senha</h2>
         <p>Olá!</p>
         <p>Você solicitou a redefinição da sua senha na plataforma ERA LEARN.</p>
         <p>Clique no botão abaixo para criar uma nova senha:</p>
         
         <div style="text-align: center; margin: 30px 0;">
           <a href="{{ .ConfirmationURL }}" 
              style="background: linear-gradient(135deg, #10b981, #059669); 
                     color: white; 
                     padding: 12px 30px; 
                     text-decoration: none; 
                     border-radius: 5px; 
                     display: inline-block; 
                     font-weight: bold;">
             Redefinir Senha
           </a>
         </div>
         
         <p style="font-size: 14px; color: #666;">
           Se você não solicitou esta redefinição, pode ignorar este email.
         </p>
       </div>
       
       <div style="text-align: center; color: #666; font-size: 12px;">
         <p>Este link expira em 24 horas.</p>
         <p>© 2025 ERA LEARN. Todos os direitos reservados.</p>
       </div>
     </div>
   </body>
   </html>

B) TEMPLATE DE CONFIRMAÇÃO DE EMAIL:
   - Subject: "Confirme seu email - ERA LEARN"
   - Content HTML:
   <!DOCTYPE html>
   <html>
   <head>
     <meta charset="utf-8">
     <title>Confirmar Email - ERA LEARN</title>
   </head>
   <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
     <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
       <div style="text-align: center; margin-bottom: 30px;">
         <h1 style="color: #10b981; margin: 0;">ERA LEARN</h1>
         <p style="color: #666; margin: 10px 0;">Plataforma de Ensino Online</p>
       </div>
       
       <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
         <h2 style="color: #333; margin-top: 0;">Confirme seu email</h2>
         <p>Olá!</p>
         <p>Obrigado por se cadastrar na plataforma ERA LEARN.</p>
         <p>Para ativar sua conta, clique no botão abaixo:</p>
         
         <div style="text-align: center; margin: 30px 0;">
           <a href="{{ .ConfirmationURL }}" 
              style="background: linear-gradient(135deg, #10b981, #059669); 
                     color: white; 
                     padding: 12px 30px; 
                     text-decoration: none; 
                     border-radius: 5px; 
                     display: inline-block; 
                     font-weight: bold;">
             Confirmar Email
           </a>
         </div>
         
         <p style="font-size: 14px; color: #666;">
           Se você não criou uma conta, pode ignorar este email.
         </p>
       </div>
       
       <div style="text-align: center; color: #666; font-size: 12px;">
         <p>© 2025 ERA LEARN. Todos os direitos reservados.</p>
       </div>
     </div>
   </body>
   </html>

5. CONFIGURAÇÕES DE SMTP (OPCIONAL):
   - Vá para "Settings" > "Auth" > "SMTP Settings"
   - Configure um servidor SMTP personalizado se desejar
   - Ou use o SMTP padrão do Supabase

6. CONFIGURAÇÕES DE REDIRECIONAMENTO:
   - Vá para "Settings" > "Auth" > "URL Configuration"
   - Site URL: https://seu-dominio.com
   - Redirect URLs: 
     * https://seu-dominio.com/reset-password
     * https://seu-dominio.com/auth/callback
*/

-- ========================================
-- 3. VERIFICAR FUNCIONALIDADE
-- ========================================

-- Verificar se a funcionalidade está funcionando
SELECT '=== TESTE DE FUNCIONALIDADE ===' as info;

-- Para testar:
-- 1. Acesse a página de login
-- 2. Clique em "Esqueci minha senha"
-- 3. Digite um email válido
-- 4. Verifique se o email é enviado
-- 5. Clique no link do email
-- 6. Teste a redefinição de senha

-- ========================================
-- 4. CONFIGURAÇÕES ADICIONAIS
-- ========================================

-- Verificar se há usuários para testar
SELECT '=== USUÁRIOS PARA TESTE ===' as info;
SELECT 
  id,
  email,
  nome,
  tipo_usuario,
  status
FROM usuarios 
WHERE status = 'ativo'
ORDER BY data_criacao DESC
LIMIT 5;

-- ========================================
-- 5. MENSAGEM DE SUCESSO
-- ========================================

DO $$
BEGIN
  RAISE NOTICE 'Configuração de email de recuperação de senha concluída!';
  RAISE NOTICE 'Lembre-se de configurar os templates de email no Dashboard do Supabase.';
  RAISE NOTICE 'Teste a funcionalidade com um usuário existente.';
END $$;

























