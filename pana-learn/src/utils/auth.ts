import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Criar cliente Supabase para uso no servidor com cookies
export async function getServerSupabaseClient() {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseAnonKey) {
		throw new Error('Supabase não configurado');
	}

	const cookieStore = await cookies();
	const supabase = createClient(supabaseUrl, supabaseAnonKey, {
		cookies: {
			getAll: () => cookieStore.getAll(),
			setAll: (cookiesToSet) => {
				cookiesToSet.forEach(({ name, value, options }) =>
					cookieStore.set(name, value, options)
				);
			},
		},
	});

	return supabase;
}

// Verificar se o usuário está autenticado e é admin
export async function checkAdminAuth() {
	try {
		const supabase = await getServerSupabaseClient();
		
		// Verificar autenticação
		const { data: { user }, error: authError } = await supabase.auth.getUser();

		if (authError || !user) {
			console.log('[AUTH DEBUG] Usuário não autenticado:', authError?.message);
			return { isAdmin: false, user: null, error: 'Não autenticado' };
		}

		console.log('[AUTH DEBUG] Verificando usuário:', { id: user.id, email: user.email });

		// Verificar se o usuário é admin
		// Tentar múltiplas tabelas e campos possíveis
		let isAdmin = false;
		let profileData: any = null;

		// PRIMEIRO: Tentar tabela 'usuarios' (tabela principal do sistema)
		const { data: usuariosProfile, error: usuariosError } = await supabase
			.from('usuarios')
			.select('*')
			.eq('id', user.id)
			.single();

		if (!usuariosError && usuariosProfile) {
			profileData = usuariosProfile;
			console.log('[AUTH DEBUG] Encontrado em tabela usuarios:', {
				id: usuariosProfile.id,
				email: usuariosProfile.email,
				tipo_usuario: usuariosProfile.tipo_usuario,
				// Log de todos os campos para debug
				allFields: Object.keys(usuariosProfile)
			});
			
			// Verificar campo tipo_usuario
			isAdmin = usuariosProfile.tipo_usuario === 'admin';
			
			console.log('[AUTH DEBUG] Verificação de admin em usuarios:', {
				tipo_usuario: usuariosProfile.tipo_usuario,
				resultado: isAdmin
			});
		} else {
			console.log('[AUTH DEBUG] Não encontrado em usuarios:', usuariosError?.message);
		}

		// Se não encontrou em usuarios, tentar tabela 'users'
		if (!isAdmin) {
			const { data: usersProfile, error: usersError } = await supabase
				.from('users')
				.select('*')
				.eq('id', user.id)
				.single();

			if (!usersError && usersProfile) {
				profileData = usersProfile;
				console.log('[AUTH DEBUG] Encontrado em tabela users:', {
					id: usersProfile.id,
					email: usersProfile.email,
					is_admin: usersProfile.is_admin,
					role: usersProfile.role,
					admin: usersProfile.admin,
					user_role: usersProfile.user_role,
					tipo_usuario: usersProfile.tipo_usuario,
					// Log de todos os campos para debug
					allFields: Object.keys(usersProfile)
				});
				
				// Verificar múltiplos campos possíveis para admin
				isAdmin = 
					usersProfile.tipo_usuario === 'admin' ||
					usersProfile.is_admin === true || 
					usersProfile.is_admin === 1 ||
					usersProfile.role === 'admin' ||
					usersProfile.role === 'administrator' ||
					usersProfile.admin === true ||
					usersProfile.admin === 1 ||
					usersProfile.user_role === 'admin' ||
					usersProfile.user_role === 'administrator' ||
					usersProfile.type === 'admin' ||
					usersProfile.account_type === 'admin';
				
				console.log('[AUTH DEBUG] Verificação de admin em users:', {
					tipo_usuario: usersProfile.tipo_usuario,
					is_admin: usersProfile.is_admin,
					role: usersProfile.role,
					admin: usersProfile.admin,
					user_role: usersProfile.user_role,
					resultado: isAdmin
				});
			} else {
				console.log('[AUTH DEBUG] Não encontrado em users:', usersError?.message);
			
			// Tentar tabela 'profiles'
			const { data: profilesData, error: profilesError } = await supabase
				.from('profiles')
				.select('*')
				.eq('id', user.id)
				.single();

			if (!profilesError && profilesData) {
				profileData = profilesData;
				console.log('[AUTH DEBUG] Encontrado em tabela profiles:', {
					id: profilesData.id,
					email: profilesData.email,
					is_admin: profilesData.is_admin,
					role: profilesData.role,
					admin: profilesData.admin,
					user_role: profilesData.user_role,
					// Log de todos os campos para debug
					allFields: Object.keys(profilesData)
				});
				
				// Verificar múltiplos campos possíveis para admin
				isAdmin = 
					profilesData.is_admin === true || 
					profilesData.is_admin === 1 ||
					profilesData.role === 'admin' ||
					profilesData.role === 'administrator' ||
					profilesData.admin === true ||
					profilesData.admin === 1 ||
					profilesData.user_role === 'admin' ||
					profilesData.user_role === 'administrator' ||
					profilesData.type === 'admin' ||
					profilesData.account_type === 'admin';
				
				console.log('[AUTH DEBUG] Verificação de admin em profiles:', {
					is_admin: profilesData.is_admin,
					role: profilesData.role,
					admin: profilesData.admin,
					user_role: profilesData.user_role,
					resultado: isAdmin
				});
			} else {
				console.log('[AUTH DEBUG] Não encontrado em profiles:', profilesError?.message);
			}
		}

		// Verificar metadata do usuário
		if (!isAdmin && user.user_metadata) {
			console.log('[AUTH DEBUG] Verificando user_metadata:', user.user_metadata);
			if (user.user_metadata.role === 'admin' || user.user_metadata.is_admin === true) {
				isAdmin = true;
				console.log('[AUTH DEBUG] Admin encontrado em user_metadata');
			}
		}

		// Verificar lista de emails de admin
		if (!isAdmin) {
			const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
			if (adminEmails.length > 0 && user.email && adminEmails.includes(user.email)) {
				isAdmin = true;
				console.log('[AUTH DEBUG] Admin encontrado na lista de emails');
			}
		}

		console.log('[AUTH DEBUG] Resultado final:', { isAdmin, userId: user.id, email: user.email });

		return { 
			isAdmin, 
			user, 
			profileData,
			error: null 
		};
	} catch (error: any) {
		console.error('[AUTH DEBUG] Erro ao verificar autenticação:', error);
		return { isAdmin: false, user: null, error: error.message };
	}
}

