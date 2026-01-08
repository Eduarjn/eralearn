"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "../hooks/useAuth"
import { useBranding } from "../context/BrandingContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Eye, EyeOff, Mail, User, Lock } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
// Importante: Adicionei este import para garantir que as imagens carreguem corretamente
import { resolveLogoPath, resolveBackgroundPath } from "@/utils/imageUtils"

const SENHA_ADMIN = "admin123"

export function AuthForm() {
    const { signIn, signUp } = useAuth()
    const { branding } = useBranding()
    const [activeTab, setActiveTab] = useState<"login" | "register" | "forgot">("login")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [tipoUsuario, setTipoUsuario] = useState<"admin" | "cliente">("cliente")
    const [senhaValidacao, setSenhaValidacao] = useState("")
    const [resetEmail, setResetEmail] = useState("")
    const [resetMessage, setResetMessage] = useState("")
    const [resetError, setResetError] = useState("")
    const [backgroundLoaded, setBackgroundLoaded] = useState(false)

    // Efeito para carregar a imagem de fundo suavemente
    useEffect(() => {
        if (branding?.background_url) {
            const img = new Image()
            img.onload = () => setBackgroundLoaded(true)
            img.src = resolveBackgroundPath(branding.background_url)
        }
    }, [branding?.background_url])

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
            } else {
                setMessage("Login realizado com sucesso!")
            }
        } catch (err) {
            setError("Erro inesperado no sistema")
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
            } else {
                setResetMessage("Email de recuperação enviado! Verifique sua caixa de entrada.")
                setResetEmail("")
            }
        } catch (err) {
            setResetError("Erro inesperado no sistema")
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
            } else {
                setMessage("Conta criada com sucesso! Verifique seu e-mail para finalizar o cadastro.")
                ;(e.target as HTMLFormElement).reset()
            }
        } catch (err) {
            setError("Erro inesperado no sistema")
        }

        setLoading(false)
    }

    // --- AQUI COMEÇA O NOVO VISUAL ---
    return (
        <div 
            className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black"
            style={{
                backgroundImage: `
                    radial-gradient(at 0% 0%, hsla(120,30%,10%,1) 0, transparent 50%), 
                    radial-gradient(at 50% 0%, hsla(140,60%,20%,1) 0, transparent 50%), 
                    radial-gradient(at 100% 0%, hsla(145,80%,30%,1) 0, transparent 50%)
                `
            }}
        >
            {/* Background Image com blend suave (se configurada) */}
            <div 
                className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 ${
                    backgroundLoaded ? 'opacity-30' : 'opacity-0'
                }`}
                style={{
                    backgroundImage: backgroundLoaded 
                        ? `url(${resolveBackgroundPath(branding.background_url)})`
                        : undefined,
                    mixBlendMode: 'overlay' 
                }}
            />

            {/* Bolhas Animadas de Fundo (Verde/Emerald) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20 animate-pulse"
                    style={{
                        background: "linear-gradient(135deg, rgba(16, 185, 129, 0.4), rgba(5, 150, 105, 0.2))",
                        backdropFilter: "blur(60px) saturate(180%)",
                        boxShadow: "0 8px 32px rgba(34, 197, 94, 0.15)",
                    }}
                ></div>
                <div
                    className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 animate-pulse delay-1000"
                    style={{
                        background: "linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(16, 185, 129, 0.1))",
                        backdropFilter: "blur(80px) saturate(180%)",
                        boxShadow: "0 8px 32px rgba(16, 185, 129, 0.1)",
                    }}
                ></div>
            </div>

            {/* Container principal */}
            <div className="relative z-10 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <img
                            src={resolveLogoPath(branding.logo_url) || "/images/era-learn-logo.png"}
                            alt="Logo"
                            id="login-logo"
                            className="w-52 h-auto object-contain cursor-pointer transition-all duration-300 hover:scale-105 drop-shadow-2xl"
                            style={{ filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5))" }}
                            onClick={() => window.open("https://era.com.br/", "_blank")}
                            onError={(e) => { e.currentTarget.src = "/logo/eralearn.png" }}
                        />
                    </div>
                    <p className="text-white/60 text-sm font-medium tracking-wide">Plataforma de Ensino Online</p>
                </div>

                {/* Card com Glassmorphism Escuro */}
                <div
                    className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-3xl shadow-2xl p-8 transition-all duration-300"
                    style={{
                        boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)`
                    }}
                >
                    <div className="flex mb-8 bg-black/40 rounded-2xl p-1.5 border border-white/5">
                        <button
                            onClick={() => setActiveTab("login")}
                            className={`flex-1 py-3.5 px-6 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                activeTab === "login"
                                    ? "bg-white/10 text-white shadow-lg border border-white/10"
                                    : "text-white/50 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            Entrar
                        </button>
                        {/* Botão Cadastrar removido da UI conforme solicitado, mas a lógica existe */}
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
                            {activeTab === "login" ? "Fazer Login" : activeTab === "register" ? "Criar Conta" : "Recuperar Senha"}
                        </h2>
                        <p className="text-white/50 text-sm leading-relaxed">
                            {activeTab === "login"
                                ? "Entre com suas credenciais para acessar"
                                : activeTab === "register"
                                    ? "Preencha os dados para criar sua conta"
                                    : "Digite seu email para receber instruções"}
                        </p>
                    </div>

                    {/* Alertas */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl backdrop-blur-sm">
                            <p className="text-red-200 text-sm font-medium text-center">{error}</p>
                        </div>
                    )}

                    {message && (
                        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl backdrop-blur-sm">
                            <p className="text-emerald-200 text-sm font-medium text-center">{message}</p>
                        </div>
                    )}

                    {/* Formulário de Login */}
                    {activeTab === "login" && (
                        <form onSubmit={handleSignIn} className="space-y-6">
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 h-5 w-5 z-10" />
                                <Input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full bg-black/30 border-white/10 text-white placeholder-white/30 rounded-2xl pl-12 pr-4 py-6 focus:bg-black/50 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 font-medium"
                                    placeholder="seu@email.com"
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 h-5 w-5 z-10" />
                                <Input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full bg-black/30 border-white/10 text-white placeholder-white/30 rounded-2xl pl-12 pr-12 py-6 focus:bg-black/50 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 font-medium"
                                    placeholder="Sua senha"
                                />
                                <button
                                    type="button"
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white transition-colors duration-200 z-10"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            <Button
                                type="submit"
                                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/40 transform hover:scale-[1.02] border-0"
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

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("forgot")}
                                    className="text-white/40 hover:text-emerald-400 text-sm transition-colors duration-200"
                                >
                                    Esqueci minha senha
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Formulário de Recuperação de Senha */}
                    {activeTab === "forgot" && (
                        <form onSubmit={handleForgotPassword} className="space-y-6">
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 h-5 w-5 z-10" />
                                <Input
                                    name="reset-email"
                                    type="email"
                                    required
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    className="w-full bg-black/30 border-white/10 text-white placeholder-white/30 rounded-2xl pl-12 pr-4 py-6 focus:bg-black/50 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300 font-medium"
                                    placeholder="seu@email.com"
                                    disabled={loading}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    "Enviar link"
                                )}
                            </Button>

                            {resetMessage && (
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                                    <p className="text-emerald-200 text-sm font-medium text-center">{resetMessage}</p>
                                </div>
                            )}

                            {resetError && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                                    <p className="text-red-200 text-sm font-medium text-center">{resetError}</p>
                                </div>
                            )}

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab("login")}
                                    className="text-white/40 hover:text-white text-sm transition-colors duration-200"
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
                                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 h-5 w-5 z-10" />
                                <Input
                                    name="nome"
                                    type="text"
                                    required
                                    className="w-full bg-black/30 border-white/10 text-white placeholder-white/30 rounded-2xl pl-12 pr-4 py-6 focus:bg-black/50 focus:border-emerald-500/50"
                                    placeholder="Seu nome completo"
                                />
                            </div>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 h-5 w-5 z-10" />
                                <Input
                                    name="email"
                                    type="email"
                                    required
                                    className="w-full bg-black/30 border-white/10 text-white placeholder-white/30 rounded-2xl pl-12 pr-4 py-6 focus:bg-black/50 focus:border-emerald-500/50"
                                    placeholder="seu@email.com"
                                />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 h-5 w-5 z-10" />
                                <Input
                                    name="password"
                                    type="password"
                                    required
                                    minLength={6}
                                    className="w-full bg-black/30 border-white/10 text-white placeholder-white/30 rounded-2xl pl-12 pr-4 py-6 focus:bg-black/50 focus:border-emerald-500/50"
                                    placeholder="Mínimo 6 caracteres"
                                />
                            </div>
                            <div>
                                <select
                                    name="tipo_usuario"
                                    value={tipoUsuario}
                                    onChange={(e) => setTipoUsuario(e.target.value as "admin" | "cliente")}
                                    className="w-full bg-black/30 border-white/10 text-white rounded-2xl px-4 py-4 focus:bg-black/50 focus:border-emerald-500/50 appearance-none cursor-pointer"
                                >
                                    <option value="cliente" className="bg-zinc-900 text-white">Cliente</option>
                                    <option value="admin" className="bg-zinc-900 text-white">Administrador</option>
                                </select>
                            </div>
                            {tipoUsuario === "admin" && (
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 h-5 w-5 z-10" />
                                    <Input
                                        name="senha_validacao"
                                        type="password"
                                        required={tipoUsuario === "admin"}
                                        value={senhaValidacao}
                                        onChange={(e) => setSenhaValidacao(e.target.value)}
                                        className="w-full bg-black/30 border-emerald-500/30 text-white placeholder-white/30 rounded-2xl pl-12 pr-4 py-6 focus:bg-black/50 focus:border-emerald-500/50"
                                        placeholder="Digite a senha de validação"
                                    />
                                </div>
                            )}
                            <Button
                                type="submit"
                                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-2xl mt-2 transition-all duration-300 shadow-lg"
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

                <div className="text-center mt-8">
                    <p className="text-white/30 text-xs">
                        {activeTab === "login"
                            ? 'Não tem uma conta? Clique em "Entrar" e mude a aba para cadastrar (se habilitado).'
                            : activeTab === "register"
                                ? 'Já tem uma conta? Clique em "Entrar" acima'
                                : "Lembrou sua senha? Volte para o login"}
                    </p>
                </div>
            </div>
        </div>
    )
}