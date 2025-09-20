// ========================================
// TESTE ESPECÍFICO PARA ADMINISTRADORES
// ========================================
// Execute este script no console do navegador (F12)
// para testar especificamente o acesso de administradores aos certificados

console.log('🔧 Teste específico para administradores - Certificados');
console.log('====================================================');

// Função para verificar se o usuário é admin
async function verificarUsuarioAdmin() {
    try {
        console.log('👤 Verificando se o usuário é administrador...');
        
        const { data: { session }, error } = await window.supabase.auth.getSession();
        
        if (error) {
            console.error('❌ Erro ao obter sessão:', error);
            return null;
        }
        
        if (!session) {
            console.log('⚠️ Nenhuma sessão ativa - usuário não está logado');
            return null;
        }
        
        console.log('✅ Usuário logado:', session.user.email);
        
        // Buscar perfil do usuário
        const { data: userProfile, error: profileError } = await window.supabase
            .from('usuarios')
            .select('*')
            .eq('id', session.user.id)
            .single();
        
        if (profileError) {
            console.error('❌ Erro ao buscar perfil do usuário:', profileError);
            return null;
        }
        
        console.log('👤 Perfil do usuário:', userProfile);
        console.log('🔑 Tipo de usuário:', userProfile.tipo_usuario);
        
        const isAdmin = userProfile.tipo_usuario === 'admin' || userProfile.tipo_usuario === 'admin_master';
        console.log('👑 É administrador:', isAdmin);
        
        return { userProfile, isAdmin, session };
    } catch (error) {
        console.error('❌ Erro ao verificar usuário admin:', error);
        return null;
    }
}

// Função para testar acesso aos certificados como admin
async function testarAcessoCertificadosAdmin() {
    try {
        console.log('🔍 Testando acesso aos certificados como administrador...');
        
        // Teste 1: Buscar todos os certificados (sem filtros)
        console.log('📋 Teste 1: Buscar todos os certificados...');
        const { data: allCerts, error: allError } = await window.supabase
            .from('certificados')
            .select('*')
            .order('data_emissao', { ascending: false });
        
        if (allError) {
            console.error('❌ Erro ao buscar todos os certificados:', allError);
        } else {
            console.log('✅ Certificados encontrados (todos):', allCerts);
            console.log('📊 Total de certificados:', allCerts.length);
        }
        
        // Teste 2: Buscar com joins (como no código da aplicação)
        console.log('📋 Teste 2: Buscar com joins...');
        const { data: certsWithJoins, error: joinsError } = await window.supabase
            .from('certificados')
            .select(`
                *,
                usuario:usuarios(nome, email),
                curso:cursos(nome, descricao)
            `)
            .order('data_emissao', { ascending: false });
        
        if (joinsError) {
            console.error('❌ Erro ao buscar certificados com joins:', joinsError);
        } else {
            console.log('✅ Certificados com joins:', certsWithJoins);
            console.log('📊 Total com joins:', certsWithJoins.length);
        }
        
        // Teste 3: Verificar políticas RLS
        console.log('📋 Teste 3: Verificar se as políticas RLS estão funcionando...');
        
        // Simular o que a aplicação faz
        const { data: { session } } = await window.supabase.auth.getSession();
        if (session) {
            const { data: userProfile } = await window.supabase
                .from('usuarios')
                .select('tipo_usuario')
                .eq('id', session.user.id)
                .single();
            
            if (userProfile && (userProfile.tipo_usuario === 'admin' || userProfile.tipo_usuario === 'admin_master')) {
                console.log('✅ Usuário é admin - deve conseguir ver todos os certificados');
            } else {
                console.log('⚠️ Usuário não é admin - pode ter acesso limitado');
            }
        }
        
        return { allCerts, certsWithJoins, allError, joinsError };
    } catch (error) {
        console.error('❌ Erro ao testar acesso aos certificados:', error);
        return null;
    }
}

// Função para verificar estrutura da tabela
async function verificarEstruturaTabela() {
    try {
        console.log('🏗️ Verificando estrutura da tabela certificados...');
        
        // Buscar um certificado para ver a estrutura
        const { data: sampleCert, error } = await window.supabase
            .from('certificados')
            .select('*')
            .limit(1);
        
        if (error) {
            console.error('❌ Erro ao buscar amostra da tabela:', error);
            return null;
        }
        
        if (sampleCert && sampleCert.length > 0) {
            console.log('✅ Estrutura da tabela (amostra):', sampleCert[0]);
            console.log('📋 Campos disponíveis:', Object.keys(sampleCert[0]));
        } else {
            console.log('⚠️ Tabela vazia - não é possível verificar estrutura');
        }
        
        return sampleCert;
    } catch (error) {
        console.error('❌ Erro ao verificar estrutura da tabela:', error);
        return null;
    }
}

// Função para criar certificado de teste
async function criarCertificadoTeste() {
    try {
        console.log('🧪 Criando certificado de teste...');
        
        const { data: { session } } = await window.supabase.auth.getSession();
        if (!session) {
            console.log('⚠️ Usuário não está logado - não é possível criar certificado de teste');
            return null;
        }
        
        const { data, error } = await window.supabase
            .from('certificados')
            .insert({
                usuario_id: session.user.id,
                categoria: 'teste_admin',
                categoria_nome: 'Teste de Administrador',
                nota: 100,
                data_conclusao: new Date().toISOString(),
                data_emissao: new Date().toISOString(),
                numero_certificado: 'TEST-ADMIN-' + Date.now(),
                status: 'ativo'
            })
            .select()
            .single();
        
        if (error) {
            console.error('❌ Erro ao criar certificado de teste:', error);
        } else {
            console.log('✅ Certificado de teste criado:', data);
        }
        
        return { data, error };
    } catch (error) {
        console.error('❌ Erro ao criar certificado de teste:', error);
        return null;
    }
}

// Função principal para executar todos os testes
async function executarTestesAdmin() {
    console.log('🚀 Executando testes específicos para administradores...');
    console.log('====================================================');
    
    // Teste 1: Verificar se é admin
    const userInfo = await verificarUsuarioAdmin();
    if (!userInfo) {
        console.log('❌ Não foi possível verificar o usuário - teste interrompido');
        return;
    }
    
    if (!userInfo.isAdmin) {
        console.log('⚠️ Usuário não é administrador - alguns testes podem não funcionar');
    }
    
    console.log('====================================================');
    
    // Teste 2: Verificar estrutura da tabela
    await verificarEstruturaTabela();
    console.log('====================================================');
    
    // Teste 3: Testar acesso aos certificados
    const accessResult = await testarAcessoCertificadosAdmin();
    console.log('====================================================');
    
    // Teste 4: Criar certificado de teste (se for admin)
    if (userInfo.isAdmin) {
        await criarCertificadoTeste();
        console.log('====================================================');
        
        // Teste 5: Verificar se o certificado foi criado
        console.log('🔍 Verificando se o certificado de teste foi criado...');
        const { data: newCerts, error: newError } = await window.supabase
            .from('certificados')
            .select('*')
            .eq('categoria', 'teste_admin')
            .order('data_emissao', { ascending: false });
        
        if (newError) {
            console.error('❌ Erro ao verificar certificado de teste:', newError);
        } else {
            console.log('✅ Certificados de teste encontrados:', newCerts);
        }
    }
    
    console.log('====================================================');
    console.log('🎉 Testes de administrador concluídos!');
    console.log('📋 Verifique os resultados acima para identificar problemas');
}

// Executar testes automaticamente
executarTestesAdmin();

// Exportar funções para uso manual
window.testarAdminCertificados = {
    verificarUsuarioAdmin,
    testarAcessoCertificadosAdmin,
    verificarEstruturaTabela,
    criarCertificadoTeste,
    executarTestesAdmin
};

console.log('🛠️ Funções de teste de admin disponíveis em window.testarAdminCertificados');
