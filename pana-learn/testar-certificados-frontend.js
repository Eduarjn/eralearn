// ========================================
// TESTE DE CERTIFICADOS NO FRONTEND
// ========================================
// Execute este script no console do navegador (F12)
// para testar se os certificados estão sendo carregados corretamente

console.log('🧪 Iniciando teste de certificados...');

// Função para testar a API de certificados
async function testarAPICertificados() {
    try {
        console.log('📡 Testando API de certificados...');
        
        const response = await fetch('/api/certificates/index');
        const data = await response.json();
        
        console.log('✅ Resposta da API:', data);
        console.log('📊 Total de certificados:', data.total);
        console.log('📋 Certificados:', data.certificates);
        
        return data;
    } catch (error) {
        console.error('❌ Erro ao testar API:', error);
        return null;
    }
}

// Função para testar conexão com Supabase
async function testarSupabase() {
    try {
        console.log('🔗 Testando conexão com Supabase...');
        
        // Verificar se o objeto supabase está disponível
        if (typeof window.supabase !== 'undefined') {
            console.log('✅ Supabase disponível no window');
        } else {
            console.log('⚠️ Supabase não encontrado no window');
        }
        
        // Verificar se há sessão ativa
        const { data: { session }, error } = await window.supabase.auth.getSession();
        
        if (error) {
            console.error('❌ Erro ao obter sessão:', error);
            return null;
        }
        
        console.log('👤 Sessão atual:', session);
        
        if (session) {
            console.log('✅ Usuário logado:', session.user.email);
            
            // Testar query de certificados
            const { data: certificados, error: certError } = await window.supabase
                .from('certificados')
                .select('*')
                .limit(5);
            
            if (certError) {
                console.error('❌ Erro ao buscar certificados:', certError);
            } else {
                console.log('✅ Certificados encontrados:', certificados);
                console.log('📊 Total:', certificados.length);
            }
        } else {
            console.log('⚠️ Nenhuma sessão ativa');
        }
        
        return session;
    } catch (error) {
        console.error('❌ Erro ao testar Supabase:', error);
        return null;
    }
}

// Função para verificar estado da aplicação
function verificarEstadoApp() {
    console.log('🔍 Verificando estado da aplicação...');
    
    // Verificar se estamos na página de certificados
    const currentPath = window.location.pathname;
    console.log('📍 Caminho atual:', currentPath);
    
    // Verificar se há elementos da página de certificados
    const certificadosElements = document.querySelectorAll('[data-testid*="certificado"], .certificado, #certificados');
    console.log('🎯 Elementos de certificados encontrados:', certificadosElements.length);
    
    // Verificar se há mensagens de erro
    const errorElements = document.querySelectorAll('.error, .alert-error, [class*="error"]');
    console.log('⚠️ Elementos de erro encontrados:', errorElements.length);
    
    // Verificar console por erros
    console.log('📝 Verifique o console acima por erros relacionados a certificados');
}

// Função para simular carregamento de certificados
async function simularCarregamentoCertificados() {
    console.log('🔄 Simulando carregamento de certificados...');
    
    try {
        // Simular o que a página de certificados faz
        const response = await fetch('/api/certificates/index');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        console.log('✅ Simulação bem-sucedida:');
        console.log('📊 Total de certificados:', data.total);
        console.log('📋 Dados dos certificados:', data.certificates);
        
        // Verificar se os dados estão no formato esperado
        if (data.certificates && Array.isArray(data.certificates)) {
            console.log('✅ Formato dos dados está correto');
            
            data.certificates.forEach((cert, index) => {
                console.log(`📄 Certificado ${index + 1}:`, {
                    id: cert.id,
                    templateKey: cert.templateKey,
                    tokensResumo: cert.tokensResumo,
                    createdAt: cert.createdAt
                });
            });
        } else {
            console.log('⚠️ Formato dos dados pode estar incorreto');
        }
        
        return data;
    } catch (error) {
        console.error('❌ Erro na simulação:', error);
        return null;
    }
}

// Executar todos os testes
async function executarTodosTestes() {
    console.log('🚀 Executando todos os testes...');
    console.log('=====================================');
    
    // Teste 1: Estado da aplicação
    verificarEstadoApp();
    console.log('=====================================');
    
    // Teste 2: API de certificados
    await testarAPICertificados();
    console.log('=====================================');
    
    // Teste 3: Supabase
    await testarSupabase();
    console.log('=====================================');
    
    // Teste 4: Simulação de carregamento
    await simularCarregamentoCertificados();
    console.log('=====================================');
    
    console.log('🎉 Todos os testes concluídos!');
    console.log('📋 Verifique os resultados acima para identificar problemas');
}

// Executar testes automaticamente
executarTodosTestes();

// Exportar funções para uso manual
window.testarCertificados = {
    testarAPICertificados,
    testarSupabase,
    verificarEstadoApp,
    simularCarregamentoCertificados,
    executarTodosTestes
};

console.log('🛠️ Funções de teste disponíveis em window.testarCertificados');
