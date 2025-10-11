export const debugEnvironment = () => {
    const env = {
        NODE_ENV: import.meta.env.NODE_ENV,
        MODE: import.meta.env.MODE,
        DEV: import.meta.env.DEV,
        PROD: import.meta.env.PROD,
        VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
        VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? "Configured" : "Not configured",
        FEATURE_AI: import.meta.env.FEATURE_AI,
        BUILD_TIME: import.meta.env.BUILD_TIME,
        BASE_URL: import.meta.env.BASE_URL,
    }

    if (import.meta.env.DEV) {
        console.log("Debug Environment Variables:", env)
    }

    // Verificar se as variáveis essenciais estão configuradas
    const requiredVars = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"]

    const missingVars = requiredVars.filter((varName) => !import.meta.env[varName])

    if (missingVars.length > 0) {
        console.error("Missing environment variables:", missingVars)
        return false
    }

    return true
}

// Função para testar conexão com Supabase
export const testSupabaseConnection = async () => {
    try {
        const { supabase } = await import("@/integrations/supabase/client")

        // Teste simples de conexão
        const { data, error } = await supabase.from("usuarios").select("count").limit(1)

        if (error) {
            console.error("Supabase connection error:", error)
            return false
        }

        return true
    } catch (error) {
        console.error("Supabase test error:", error)
        return false
    }
}

// Função para verificar autenticação
export const testAuthentication = async () => {
    try {
        const { supabase } = await import("@/integrations/supabase/client")

        const {
            data: { session },
            error,
        } = await supabase.auth.getSession()

        if (error) {
            console.error("Authentication error:", error)
            return false
        }

        if (session && import.meta.env.DEV) {
            console.log("User authenticated:", session.user.email)
        }

        return true
    } catch (error) {
        console.error("Authentication test error:", error)
        return false
    }
}

// Função completa de diagnóstico
export const runDiagnostics = async () => {
    if (!import.meta.env.DEV) return true

    console.log("Running diagnostics...")

    // 1. Verificar variáveis de ambiente
    const envOk = debugEnvironment()

    // 2. Testar conexão com Supabase
    const supabaseOk = await testSupabaseConnection()

    // 3. Testar autenticação
    const authOk = await testAuthentication()

    // Resumo apenas em desenvolvimento
    console.log("Diagnostics Summary:")
    console.log(`- Environment variables: ${envOk ? "OK" : "ERROR"}`)
    console.log(`- Supabase connection: ${supabaseOk ? "OK" : "ERROR"}`)
    console.log(`- Authentication: ${authOk ? "OK" : "ERROR"}`)

    const allOk = envOk && supabaseOk && authOk

    if (!allOk) {
        console.log("Diagnostics: ISSUES FOUND")
    }

    return allOk
}