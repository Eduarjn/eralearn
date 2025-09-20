"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "../hooks/useAuth.tsx"
import { useBranding } from "../context/BrandingContext.tsx"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Eye, EyeOff, Mail, User, Lock } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"

const SENHA_ADMIN = "admin123"

export function AuthForm() {
    const { signIn, signUp } = useAuth()
    const { branding } = useBranding()
    const [activeTab, setActiveTab] = useState<"login" | "register" | "forgot">("login")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")
    const [logoLoaded, setLogoLoaded] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [tipoUsuario, setTipoUsuario] = useState<"admin" | "cliente">("cliente")
    const [senhaValidacao, setSenhaValidacao] = useState("")
    const [resetEmail, setResetEmail] = useState("")
    const [resetMessage, setResetMessage] = useState("")
    const [resetError, setResetError] = useState("")

    const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        setMessage("")

        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        try {
            const { error } = await signIn(email, password)

            if (error) {
                setError(error.message || "Erro ao fazer login")
                console.log("Login error occurred")
            } else {
                setMessage("Login realizado com sucesso!")
                console.log("Login successful")
            }
        } catch (err) {
            setError("Erro inesperado no sistema")
            console.log("Unexpected system error during login")
        }

        setLoading(false)
    }

    const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setResetError("")
        setResetMessage("")

        const formData = new FormData(e.currentTarget)
        const email = formData.get("reset-email") as string

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })

            if (error) {
                setResetError(error.message || "Erro ao enviar email de recuperação")
                console.log("Password reset error occurred")
            } else {
                setResetMessage("Email de recuperação enviado! Verifique sua caixa de entrada.")
                setResetEmail("")
                console.log("Password reset email sent successfully")
            }
        } catch (err) {
            setResetError("Erro inesperado no sistema")
            console.log("Unexpected system error during password reset")
        }

        setLoading(false)
    }

    const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        setMessage("")

        const formData = new FormData(e.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string
        const nome = formData.get("nome") as string
        const tipoUsuario = formData.get("tipo_usuario") as "admin" | "cliente"
        const senhaValidacao = formData.get("senha_validacao") as string

        if (!nome || nome.trim() === "") {
            setError("Nome é obrigatório")
            setLoading(false)
            return
        }

        if (!email || email.trim() === "") {
            setError("Email é obrigatório")
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setError("Senha deve ter pelo menos 6 caracteres")
            setLoading(false)
            return
        }

        if (tipoUsuario === "admin" && senhaValidacao !== SENHA_ADMIN) {
            setError("Senha de validação para administrador incorreta!")
            setLoading(false)
            return
        }

        try {
            const { error } = await signUp(
                email,
                password,
                nome.trim(),
                tipoUsuario,
                tipoUsuario === "admin" ? senhaValidacao : null,
            )

            if (error) {
                setError(error.message || "Erro ao criar conta")
                console.log("Registration error occurred")
            } else {
                setMessage("Conta criada com sucesso! Verifique seu e-mail para finalizar o cadastro antes de fazer login.")
                ;(e.target as HTMLFormElement).reset()
                console.log("Registration successful")
            }
        } catch (err) {
            setError("Erro inesperado no sistema")
            console.log("Unexpected system error during registration")
        }

        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            <div
                className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800"
                style={{
                    backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.1) 0%, transparent 50%),
            linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #475569 75%, #64748b 100%)
          `,
                }}
            >
                <div className="absolute inset-0 bg-black/30"></div>
            </div>

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute top-1/4 left-1/4 w-40 h-40 rounded-full opacity-10 animate-pulse"
                    style={{
                        background: "linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(59, 130, 246, 0.2))",
                        backdropFilter: "blur(40px) saturate(180%)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        boxShadow: "0 8px 32px rgba(34, 197, 94, 0.15)",
                    }}
                ></div>
                <div
                    className="absolute top-3/4 right-1/4 w-32 h-32 rounded-full opacity-8 animate-pulse delay-1000"
                    style={{
                        background: "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))",
                        backdropFilter: "blur(40px) saturate(180%)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        boxShadow: "0 8px 32px rgba(59, 130, 246, 0.15)",
                    }}
                ></div>
            </div>

            {/* Container principal */}
            <div className="relative z-10 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <img
                            src="/images/era-learn-logo.png"
                            alt="ERA Learn Logo"
                            id="login-logo"
                            className="w-48 h-20 object-contain cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
                            style={{
                                borderRadius: "8px",
                                filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))",
                            }}
                            onClick={() => {
                                window.open("https://era.com.br/", "_blank")
                            }}
                            onError={(e) => {
                                e.currentTarget.src = "/logo/eralearn.png" // fallback
                            }}
                            title="Clique para visitar o site ERA"
                        />
                    </div>
                    <p className="text-white/90 text-sm font-medium">Plataforma de Ensino Online</p>
                </div>

                <div
                    className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 transition-all duration-300 hover:bg-white/15"
                    style={{
                        boxShadow: `
              0 25px 50px -12px rgba(0, 0, 0, 0.7),
              0 0 0 1px rgba(255, 255, 255, 0.15),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `,
                        background: `
              linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%),
              rgba(255, 255, 255, 0.05)
            `,
                    }}
                >
                    <div className="flex mb-8 bg-black/30 rounded-2xl p-1.5 border border-white/10">
                        <button
                            onClick={() => setActiveTab("login")}
                            className={`flex-1 py-3.5 px-6 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                activeTab === "login"
                                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-xl transform scale-[1.02] border border-green-400/30"
                                    : "text-white/90 hover:text-white hover:bg-white/10"
                            }`}
                        >
                            Entrar
                        </button>
                        <button
                            onClick={() => setActiveTab("register")}
                            className={`flex-1 py-3.5 px-6 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                activeTab === "register"
                                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-xl transform scale-[1.02] border border-green-400/30"
                                    : "text-white/90 hover:text-white hover:bg-white/10"
                            }`}
                        >
                            Cadastrar
                        </button>
                    </div>

                    {/* Título do formulário */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white mb-3">
                            {activeTab === "login" ? "Fazer Login" : activeTab === "register" ? "Criar Conta" : "Recuperar Senha"}
                        </h2>
                        <p className="text-white/80 text-sm leading-relaxed">
                            {activeTab === "login"
                                ? "Entre com suas credenciais para acessar a plataforma"
                                : activeTab === "register"
                                    ? "Preencha os dados para criar sua conta"
                                    : "Digite seu email para receber instruções"}
                        </p>
                    </div>

                    {/* Alertas */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-2xl backdrop-blur-sm">
                            <p className="text-red-100 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {message && (
                        <div className="mb-6 p-4 bg-green-500/20 border border-green-400/30 rounded-2xl backdrop-blur-sm">
                            <p className="text-green-100 text-sm font-medium">{message}</p>
                        </div>
                    )}

                    {/* Formulário de Login */}
                    {activeTab === "login" && (
                        <form onSubmit={handleSignIn} className="space-y-6">
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/80 h-5 w-5 z-10" />
                                <Input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full bg-white/25 border-white/30 text-white placeholder-white/70 rounded-2xl pl-12 pr-4 py-4 focus:bg-white/35 focus:border-white/50 focus:ring-2 focus:ring-green-400/50 transition-all duration-300 font-medium backdrop-blur-sm"
                                    style={{
                                        background: "rgba(255, 255, 255, 0.25)",
                                        backdropFilter: "blur(10px) saturate(180%)",
                                        border: "1px solid rgba(255, 255, 255, 0.3)",
                                    }}
                                    placeholder="seu@email.com"
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/80 h-5 w-5 z-10" />
                                <Input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full bg-white/25 border-white/30 text-white placeholder-white/70 rounded-2xl pl-12 pr-12 py-4 focus:bg-white/35 focus:border-white/50 focus:ring-2 focus:ring-green-400/50 transition-all duration-300 font-medium backdrop-blur-sm"
                                    style={{
                                        background: "rgba(255, 255, 255, 0.25)",
                                        backdropFilter: "blur(10px) saturate(180%)",
                                        border: "1px solid rgba(255, 255, 255, 0.3)",
                                    }}
                                    placeholder="Sua senha"
                                />
                                <button
                                    type="button"
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white transition-colors duration-200 z-10"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] border border-green-400/30"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Entrando...
                                    </>
                                ) : (
                                    "Entrar"
                                )}
                            </Button>

                            {/* Link para recuperação de senha */}
                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("forgot")}
                                    className="text-white/80 hover:text-white text-sm underline underline-offset-4 transition-colors duration-200"
                                >
                                    Esqueci minha senha
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Formulário de Recuperação de Senha */}
                    {activeTab === "forgot" && (
                        <form onSubmit={handleForgotPassword} className="space-y-6">
                            <div className="text-center mb-8">
                                <Mail className="h-16 w-16 text-green-400 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">Recuperar Senha</h3>
                                <p className="text-white/70 text-sm">Digite seu email para receber instruções de recuperação</p>
                            </div>

                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/80 h-5 w-5 z-10" />
                                <Input
                                    name="reset-email"
                                    type="email"
                                    required
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    className="w-full bg-white/25 border-white/30 text-white placeholder-white/70 rounded-2xl pl-12 pr-4 py-4 focus:bg-white/35 focus:border-white/50 focus:ring-2 focus:ring-green-400/50 transition-all duration-300 font-medium backdrop-blur-sm"
                                    style={{
                                        background: "rgba(255, 255, 255, 0.25)",
                                        backdropFilter: "blur(10px) saturate(180%)",
                                        border: "1px solid rgba(255, 255, 255, 0.3)",
                                    }}
                                    placeholder="seu@email.com"
                                    disabled={loading}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] border border-green-400/30"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    "Enviar link de recuperação"
                                )}
                            </Button>

                            {resetMessage && (
                                <div className="p-4 bg-green-500/20 border border-green-400/30 rounded-2xl backdrop-blur-sm">
                                    <p className="text-green-100 text-sm font-medium">{resetMessage}</p>
                                </div>
                            )}

                            {resetError && (
                                <div className="p-4 bg-red-500/20 border border-red-400/30 rounded-2xl backdrop-blur-sm">
                                    <p className="text-red-100 text-sm font-medium">{resetError}</p>
                                </div>
                            )}

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("login")}
                                    className="text-white/80 hover:text-white text-sm underline underline-offset-4 transition-colors duration-200"
                                >
                                    Voltar para login
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Formulário de Cadastro */}
                    {activeTab === "register" && (
                        <form onSubmit={handleSignUp} className="space-y-6">
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/80 h-5 w-5 z-10" />
                                <Input
                                    name="nome"
                                    type="text"
                                    required
                                    className="w-full bg-white/25 border-white/30 text-white placeholder-white/70 rounded-2xl pl-12 pr-4 py-4 focus:bg-white/35 focus:border-white/50 focus:ring-2 focus:ring-green-400/50 transition-all duration-300 font-medium backdrop-blur-sm"
                                    style={{
                                        background: "rgba(255, 255, 255, 0.25)",
                                        backdropFilter: "blur(10px) saturate(180%)",
                                        border: "1px solid rgba(255, 255, 255, 0.3)",
                                    }}
                                    placeholder="Seu nome completo"
                                />
                            </div>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/80 h-5 w-5 z-10" />
                                <Input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full bg-white/25 border-white/30 text-white placeholder-white/70 rounded-2xl pl-12 pr-4 py-4 focus:bg-white/35 focus:border-white/50 focus:ring-2 focus:ring-green-400/50 transition-all duration-300 font-medium backdrop-blur-sm"
                                    style={{
                                        background: "rgba(255, 255, 255, 0.25)",
                                        backdropFilter: "blur(10px) saturate(180%)",
                                        border: "1px solid rgba(255, 255, 255, 0.3)",
                                    }}
                                    placeholder="seu@email.com"
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/80 h-5 w-5 z-10" />
                                <Input
                                    name="password"
                                    type="password"
                                    required
                                    minLength={6}
                                    className="w-full bg-white/25 border-white/30 text-white placeholder-white/70 rounded-2xl pl-12 pr-4 py-4 focus:bg-white/35 focus:border-white/50 focus:ring-2 focus:ring-green-400/50 transition-all duration-300 font-medium backdrop-blur-sm"
                                    style={{
                                        background: "rgba(255, 255, 255, 0.25)",
                                        backdropFilter: "blur(10px) saturate(180%)",
                                        border: "1px solid rgba(255, 255, 255, 0.3)",
                                    }}
                                    placeholder="Mínimo 6 caracteres"
                                />
                            </div>
                            <div>
                                <select
                                    name="tipo_usuario"
                                    value={tipoUsuario}
                                    onChange={(e) => setTipoUsuario(e.target.value as "admin" | "cliente")}
                                    className="w-full bg-white/25 border-white/30 text-white rounded-2xl px-4 py-4 focus:bg-white/35 focus:border-white/50 focus:ring-2 focus:ring-green-400/50 transition-all duration-300 font-medium backdrop-blur-sm"
                                    style={{
                                        background: "rgba(255, 255, 255, 0.25)",
                                        backdropFilter: "blur(10px) saturate(180%)",
                                        border: "1px solid rgba(255, 255, 255, 0.3)",
                                    }}
                                >
                                    <option value="cliente" className="bg-gray-800 text-white">
                                        Cliente
                                    </option>
                                    <option value="admin" className="bg-gray-800 text-white">
                                        Administrador
                                    </option>
                                </select>
                            </div>
                            {tipoUsuario === "admin" && (
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/80 h-5 w-5 z-10" />
                                    <Input
                                        name="senha_validacao"
                                        type="password"
                                        required={tipoUsuario === "admin"}
                                        value={senhaValidacao}
                                        onChange={(e) => setSenhaValidacao(e.target.value)}
                                        className="w-full bg-white/25 border-white/30 text-white placeholder-white/70 rounded-2xl pl-12 pr-4 py-4 focus:bg-white/35 focus:border-white/50 focus:ring-2 focus:ring-green-400/50 transition-all duration-300 font-medium backdrop-blur-sm"
                                        style={{
                                            background: "rgba(255, 255, 255, 0.25)",
                                            backdropFilter: "blur(10px) saturate(180%)",
                                            border: "1px solid rgba(255, 255, 255, 0.3)",
                                        }}
                                        placeholder="Digite a senha de validação"
                                    />
                                </div>
                            )}
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] border border-green-400/30"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Criando conta...
                                    </>
                                ) : (
                                    "Criar conta"
                                )}
                            </Button>
                        </form>
                    )}
                </div>

                <div className="text-center mt-6">
                    <p className="text-white/70 text-xs">
                        {activeTab === "login"
                            ? 'Não tem uma conta? Clique em "Cadastrar" acima'
                            : activeTab === "register"
                                ? 'Já tem uma conta? Clique em "Entrar" acima'
                                : "Lembrou sua senha? Volte para o login"}
                    </p>
                </div>
            </div>
        </div>
    )
}