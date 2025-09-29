"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useNavigate } from "react-router-dom"
import { ERALayout } from "@/components/ERALayout"
import { supabase } from "@/integrations/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Eye, Trophy, CheckCircle, Clock, FileText, Target, Award, Filter, Plus } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface CertificateStats {
    total: number
    ativos: number
    revogados: number
    expirados: number
    mediaNota: number
}

interface CertificateManifest {
    id: string
    templateKey: string
    tokens: {
        NOME_COMPLETO: string
        CURSO: string
        DATA_CONCLUSAO: string
        CARGA_HORARIA: string
        CERT_ID: string
        QR_URL: string
    }
    createdAt: string
    createdBy: string
    hashes: {
        templateSvgSha256: string
        finalSvgSha256: string
        pngSha256?: string
        pdfSha256?: string
    }
    dimensions: {
        width: number
        height: number
        unit: string
    }
    fonts: string[]
    engine: {
        svgToPng: string
        svgToPdf: string
    }
    version: number
}

interface CertificateIndexEntry {
    id: string
    templateKey: string
    createdAt: string
    tokensResumo: {
        NOME_COMPLETO: string
        CURSO: string
    }
    pathRelativo: string
}

const Certificados: React.FC = () => {
    const { userProfile } = useAuth()
    const navigate = useNavigate()
    const [certificates, setCertificates] = useState<CertificateIndexEntry[]>([])
    const [filteredCertificates, setFilteredCertificates] = useState<CertificateIndexEntry[]>([])
    const [stats, setStats] = useState<CertificateStats>({
        total: 0,
        ativos: 0,
        revogados: 0,
        expirados: 0,
        mediaNota: 0,
    })
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("todos")
    const [categoriaFilter, setCategoriaFilter] = useState<string>("todos")
    const [showGenerateForm, setShowGenerateForm] = useState(false)

    useEffect(() => {
        loadCertificates()
    }, [])

    useEffect(() => {
        filterCertificates()
    }, [certificates, searchTerm, statusFilter, categoriaFilter])

    const loadCertificates = async () => {
        try {
            setLoading(true)
            console.log("🔍 Iniciando carregamento de certificados...")
            console.log("👤 UserProfile:", userProfile)

            // Verificar se é admin
            const isAdmin = userProfile?.tipo_usuario === "admin" || userProfile?.tipo_usuario === "admin_master"
            console.log("👤 Tipo de usuário:", userProfile?.tipo_usuario, "É admin:", isAdmin)

            if (isAdmin) {
                // Para administradores: buscar TODOS os certificados do Supabase
                console.log("🔍 Buscando certificados do Supabase (admin)...")

                try {
                    // Primeiro, tentar buscar sem joins para ver se há dados básicos
                    const { data: basicData, error: basicError } = await supabase
                        .from("certificados")
                        .select("*")
                        .order("data_emissao", { ascending: false })

                    console.log("🔍 Dados básicos:", basicData)
                    console.log("🔍 Erro básico:", basicError)

                    if (basicError) {
                        console.error("❌ Erro ao buscar certificados básicos:", basicError)
                        setCertificates([])
                        calculateStats([])
                        return
                    }

                    if (!basicData || basicData.length === 0) {
                        console.log("⚠️ Nenhum certificado encontrado na tabela")
                        setCertificates([])
                        calculateStats([])
                        return
                    }

                    // Se há dados básicos, tentar buscar com joins
                    const { data, error } = await supabase
                        .from("certificados")
                        .select(`
              *,
              usuario:usuarios(nome, email),
              curso:cursos(nome, descricao)
            `)
                        .order("data_emissao", { ascending: false })

                    if (error) {
                        console.error("❌ Erro ao buscar certificados com joins:", error)
                        // Usar dados básicos se os joins falharem
                        const formattedCertificates = basicData.map((cert) => ({
                            id: cert.id,
                            tokensResumo: {
                                NOME_COMPLETO: cert.usuario_nome || "Usuário",
                                CURSO: cert.categoria_nome || cert.categoria || "Curso",
                            },
                            templateKey: cert.categoria || "Geral",
                            createdAt: cert.data_emissao || cert.data_criacao,
                            status: cert.status || "ativo",
                        }))

                        console.log("✅ Usando dados básicos formatados:", formattedCertificates)
                        setCertificates(formattedCertificates)
                        calculateStats(formattedCertificates)
                    } else {
                        console.log("✅ Certificados encontrados (admin):", data?.length || 0)
                        console.log("✅ Dados brutos:", data)

                        const formattedCertificates =
                            data?.map((cert) => ({
                                id: cert.id,
                                tokensResumo: {
                                    NOME_COMPLETO: cert.usuario?.nome || cert.usuario_nome || "Usuário",
                                    CURSO: cert.curso?.nome || cert.curso_nome || cert.categoria_nome || "Curso",
                                },
                                templateKey: cert.categoria || "Geral",
                                createdAt: cert.data_emissao || cert.data_criacao,
                                status: cert.status || "ativo",
                            })) || []

                        console.log("✅ Certificados formatados:", formattedCertificates)
                        setCertificates(formattedCertificates)
                        calculateStats(formattedCertificates)
                    }
                } catch (error) {
                    console.error("❌ Erro ao buscar certificados:", error)
                    setCertificates([])
                    calculateStats([])
                }
            } else if (userProfile?.id) {
                // Para clientes: buscar certificados do usuário do Supabase
                console.log("🔍 Buscando certificados do usuário (cliente)...")
                console.log("🆔 ID do usuário:", userProfile.id)

                try {
                    const { data, error } = await supabase
                        .from("certificados")
                        .select(`
              *,
              usuario:usuarios(nome, email),
              curso:cursos(nome, descricao)
            `)
                        .eq("usuario_id", userProfile.id)
                        .order("data_emissao", { ascending: false })

                    if (error) {
                        console.error("❌ Erro ao buscar certificados:", error)
                        console.error("❌ Detalhes do erro:", error)
                        setCertificates([])
                        calculateStats([])
                    } else {
                        console.log("✅ Certificados encontrados (cliente):", data?.length || 0)
                        console.log("✅ Dados brutos:", data)

                        const formattedCertificates =
                            data?.map((cert) => ({
                                id: cert.id,
                                tokensResumo: {
                                    NOME_COMPLETO: cert.usuario?.nome || "Usuário",
                                    CURSO: cert.curso?.nome || cert.curso_nome || cert.categoria_nome || "Curso",
                                },
                                templateKey: cert.categoria || "Geral",
                                createdAt: cert.data_emissao || cert.data_criacao,
                                status: cert.status || "ativo",
                            })) || []

                        console.log("✅ Certificados formatados:", formattedCertificates)
                        setCertificates(formattedCertificates)
                        calculateStats(formattedCertificates)
                    }
                } catch (error) {
                    console.error("❌ Erro ao buscar certificados:", error)
                    setCertificates([])
                    calculateStats([])
                }
            } else {
                console.log("⚠️ Usuário não autenticado ou sem ID")
                setCertificates([])
                calculateStats([])
            }
        } catch (error) {
            console.error("❌ Erro geral ao carregar certificados:", error)
            toast({
                title: "Erro",
                description: "Erro ao carregar certificados. Tente novamente.",
                variant: "destructive",
            })
            setCertificates([])
            calculateStats([])
        } finally {
            setLoading(false)
        }
    }

    const calculateStats = (certs: CertificateIndexEntry[]) => {
        const total = certs.length
        const ativos = total // Todos os certificados do novo sistema são considerados ativos
        const revogados = 0 // Novo sistema não tem revogação
        const expirados = 0 // Novo sistema não tem expiração
        const mediaNota = 100 // Novo sistema assume 100% de aprovação

        setStats({
            total,
            ativos,
            revogados,
            expirados,
            mediaNota,
        })
    }

    const filterCertificates = () => {
        console.log("🔍 Filtrando certificados...")
        console.log("📊 Certificados originais:", certificates.length)
        console.log("🔍 Termo de busca:", searchTerm)
        console.log("🔍 Filtro de status:", statusFilter)
        console.log("🔍 Filtro de categoria:", categoriaFilter)

        let filtered = certificates

        // Filtro por busca
        if (searchTerm) {
            filtered = filtered.filter(
                (cert) =>
                    cert.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    cert.tokensResumo.NOME_COMPLETO.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    cert.tokensResumo.CURSO.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    cert.templateKey.toLowerCase().includes(searchTerm.toLowerCase()),
            )
        }

        // Filtro por status (novo sistema sempre ativo)
        if (statusFilter !== "todos") {
            filtered = filtered.filter((cert) => statusFilter === "ativo")
        }

        if (categoriaFilter !== "todos") {
            filtered = filtered.filter((cert) => {
                const certCategory = cert.templateKey.toLowerCase()
                const filterCategory = categoriaFilter.toLowerCase()

                // Handle specific mappings
                if (filterCategory === "omnichannel_empresas" || filterCategory === "omnichannel") {
                    return certCategory.includes("omnichannel") || certCategory.includes("omni")
                }

                if (filterCategory === "callcenter_fundamentos" || filterCategory === "callcenter") {
                    return certCategory.includes("callcenter") || certCategory.includes("call")
                }

                if (filterCategory === "pabx_fundamentos" || filterCategory === "pabx") {
                    return certCategory.includes("pabx")
                }

                // Default exact match
                return certCategory === filterCategory
            })
        }

        console.log("✅ Certificados filtrados:", filtered.length)
        setFilteredCertificates(filtered)
    }

    const handleDownload = async (certificate: CertificateIndexEntry, format: "svg" | "png" | "pdf" = "pdf") => {
        try {
            console.log("📥 Iniciando download do certificado:", certificate.id)

            toast({
                title: "Download",
                description: `Baixando ${format.toUpperCase()} para: ${certificate.tokensResumo.CURSO}`,
            })

            const response = await fetch(`/api/certificates/${certificate.id}/file?format=${format}`)

            if (response.ok) {
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = `certificado-${certificate.id}.${format}`
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)

                toast({
                    title: "Sucesso",
                    description: `Certificado ${certificate.id} baixado com sucesso!`,
                })
            } else {
                throw new Error("Falha no download")
            }
        } catch (error) {
            console.error("❌ Erro ao fazer download:", error)
            toast({
                title: "Erro",
                description: "Erro ao fazer download do certificado. Tente novamente.",
                variant: "destructive",
            })
        }
    }

    const handleView = async (certificate: CertificateIndexEntry) => {
        try {
            console.log("👁️ Visualizando certificado:", certificate.id)

            toast({
                title: "Visualizar",
                description: `Abrindo certificado: ${certificate.tokensResumo.CURSO}`,
            })

            // Abrir página de verificação em nova aba
            window.open(`/verify/${certificate.id}`, "_blank")
        } catch (error) {
            console.error("❌ Erro ao visualizar certificado:", error)
            toast({
                title: "Erro",
                description: "Erro ao visualizar certificado. Tente novamente.",
                variant: "destructive",
            })
        }
    }

    const createTestCertificate = async () => {
        try {
            console.log("🧪 Criando certificado de teste...")

            if (!userProfile?.id) {
                toast({
                    title: "Erro",
                    description: "Usuário não autenticado.",
                    variant: "destructive",
                })
                return
            }

            // Generate a unique certificate number
            const certificateNumber = `TEST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

            const { data, error } = await supabase
                .from("certificados")
                .insert({
                    usuario_id: userProfile.id,
                    usuario_nome: userProfile.nome || "Usuário Teste",
                    categoria: "OMNICHANNEL",
                    categoria_nome: "OMNICHANNEL para Empresas",
                    curso_nome: "Curso de Teste - Certificados",
                    nota: 95,
                    data_conclusao: new Date().toISOString().split("T")[0],
                    data_emissao: new Date().toISOString(),
                    numero_certificado: certificateNumber,
                    status: "ativo",
                })
                .select()
                .single()

            if (error) {
                console.error("❌ Erro ao criar certificado de teste:", error)
                toast({
                    title: "Erro",
                    description: `Erro ao criar certificado de teste: ${error.message}`,
                    variant: "destructive",
                })
            } else {
                console.log("✅ Certificado de teste criado:", data)
                toast({
                    title: "Sucesso",
                    description: "Certificado de teste criado com sucesso!",
                })

                // Recarregar lista de certificados
                await loadCertificates()
            }
        } catch (err) {
            console.error("❌ Erro inesperado:", err)
            toast({
                title: "Erro",
                description: "Erro inesperado ao criar certificado de teste.",
                variant: "destructive",
            })
        }
    }

    const handleGenerateCertificate = async (templateKey: string, nomeCompleto: string, curso: string) => {
        try {
            if (!userProfile?.id) {
                toast({
                    title: "Erro",
                    description: "Usuário não autenticado.",
                    variant: "destructive",
                })
                return
            }

            const certificateNumber = `${templateKey.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

            const { data, error } = await supabase
                .from("certificados")
                .insert({
                    usuario_id: userProfile.id,
                    usuario_nome: nomeCompleto,
                    categoria: templateKey.toUpperCase(),
                    categoria_nome: curso,
                    curso_nome: curso,
                    nota: 100,
                    data_conclusao: new Date().toISOString().split("T")[0],
                    data_emissao: new Date().toISOString(),
                    numero_certificado: certificateNumber,
                    status: "ativo",
                })
                .select()
                .single()

            if (error) {
                console.error("❌ Erro ao gerar certificado:", error)
                toast({
                    title: "Erro",
                    description: `Erro ao gerar certificado: ${error.message}`,
                    variant: "destructive",
                })
            } else {
                console.log("✅ Certificado gerado:", data)
                toast({
                    title: "Sucesso",
                    description: `Certificado ${data.numero_certificado} gerado com sucesso!`,
                })

                // Recarregar lista de certificados
                await loadCertificates()
                setShowGenerateForm(false)
            }
        } catch (error) {
            console.error("❌ Erro ao gerar certificado:", error)
            toast({
                title: "Erro",
                description: "Erro ao gerar certificado. Tente novamente.",
                variant: "destructive",
            })
        }
    }

    if (loading) {
        return (
            <ERALayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-lg">Carregando certificados...</p>
                    </div>
                </div>
            </ERALayout>
        )
    }

    return (
        <ERALayout>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
                {/* Hero Section com gradiente */}
                <div
                    className="page-hero w-full rounded-xl lg:rounded-2xl flex flex-col md:flex-row justify-between items-center p-4 lg:p-8 mb-6 lg:mb-8 shadow-md"
                    style={{ background: "linear-gradient(90deg, #000000 0%, #4A4A4A 40%, #34C759 100%)" }}
                >
                    <div className="px-4 lg:px-6 py-6 lg:py-8 md:py-12 w-full">
                        <div className="max-w-7xl mx-auto">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 lg:gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 bg-era-green rounded-full animate-pulse"></div>
                                        <span className="text-xs lg:text-sm font-medium text-white/90">Sistema de Certificação</span>
                                    </div>
                                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 lg:mb-3 text-white">
                                        Certificados
                                    </h1>
                                    <p className="text-sm sm:text-base lg:text-lg md:text-xl text-white/90 max-w-2xl">
                                        Visualize e gerencie todos os certificados emitidos pela plataforma
                                    </p>
                                    <div className="flex flex-wrap items-center gap-2 lg:gap-4 mt-3 lg:mt-4">
                                        <div className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm text-white/90">
                                            <Award className="h-3 w-3 lg:h-4 lg:w-4 text-era-green" />
                                            <span>{stats.total} certificados emitidos</span>
                                        </div>
                                        <div className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm text-white/90">
                                            <CheckCircle className="h-3 w-3 lg:h-4 lg:w-4 text-era-green" />
                                            <span>{stats.ativos} certificados ativos</span>
                                        </div>
                                        <div className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm text-white/90">
                                            <Target className="h-3 w-3 lg:h-4 lg:w-4 text-era-green" />
                                            <span>{stats.mediaNota}% média geral</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-4 lg:px-6 py-6 lg:py-8">
                    <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
                        {/* Filtros com design melhorado */}
                        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                            <CardContent className="p-4 lg:p-6">
                                <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 lg:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 lg:h-5 lg:w-5" />
                                        <Input
                                            placeholder="Pesquisar certificados..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 lg:pl-12 h-10 lg:h-12 text-sm lg:text-base border-2 border-gray-200 focus:border-blue-500 rounded-lg lg:rounded-xl transition-all duration-300"
                                        />
                                    </div>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-full sm:w-48 lg:w-56 h-10 lg:h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg lg:rounded-xl transition-all duration-300">
                                            <Filter className="h-4 w-4 lg:h-5 lg:w-5 mr-2 text-gray-400" />
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="todos">Todos os Status</SelectItem>
                                            <SelectItem value="ativo">Ativo</SelectItem>
                                            <SelectItem value="revogado">Revogado</SelectItem>
                                            <SelectItem value="expirado">Expirado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
                                        <SelectTrigger className="w-full sm:w-48 lg:w-56 h-10 lg:h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg lg:rounded-xl transition-all duration-300">
                                            <Filter className="h-4 w-4 lg:h-5 lg:w-5 mr-2 text-gray-400" />
                                            <SelectValue placeholder="Categoria" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="todos">Todas as Categorias</SelectItem>
                                            <SelectItem value="pabx_fundamentos">PABX Fundamentos</SelectItem>
                                            <SelectItem value="pabx_avancado">PABX Avançado</SelectItem>
                                            <SelectItem value="callcenter_fundamentos">CALLCENTER</SelectItem>
                                            <SelectItem value="omnichannel">OMNICHANNEL</SelectItem>
                                            <SelectItem value="omni_avancado">OMNI Avançado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={createTestCertificate}
                                            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-10 lg:h-12 px-4 lg:px-6"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Criar Teste
                                        </Button>
                                        {(userProfile?.tipo_usuario === "admin" || userProfile?.tipo_usuario === "admin_master") && (
                                            <Button
                                                onClick={() => setShowGenerateForm(true)}
                                                className="flex items-center gap-2 bg-gradient-to-r from-era-black via-era-gray-medium to-era-green hover:from-era-black/90 hover:via-era-gray-medium/90 hover:to-era-green/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-10 lg:h-12 px-4 lg:px-6"
                                            >
                                                <Plus className="h-4 w-4" />
                                                Gerar Certificado
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Formulário de Geração de Certificado */}
                        {showGenerateForm && (
                            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Plus className="h-5 w-5" />
                                        Gerar Novo Certificado
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <GenerateCertificateForm
                                        onGenerate={handleGenerateCertificate}
                                        onCancel={() => setShowGenerateForm(false)}
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {/* Lista de Certificados */}
                        <div className="space-y-4 lg:space-y-6">
                            {filteredCertificates.length === 0 ? (
                                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                                    <CardContent className="flex flex-col items-center justify-center py-12">
                                        <FileText className="h-16 w-16 text-gray-400 mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum certificado encontrado</h3>
                                        <p className="text-gray-600 text-center">
                                            {searchTerm || statusFilter !== "todos" || categoriaFilter !== "todos"
                                                ? "Tente ajustar os filtros de busca."
                                                : "Você ainda não possui certificados emitidos."}
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                filteredCertificates.map((certificate) => (
                                    <Card
                                        key={certificate.id}
                                        className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300"
                                    >
                                        <CardContent className="p-6">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-lg font-semibold text-gray-900">{certificate.tokensResumo.CURSO}</h3>
                                                        <Badge variant="default" className="bg-green-500/20 text-green-500">
                                                            Ativo
                                                        </Badge>
                                                    </div>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                                        <div>
                                                            <span className="font-medium text-gray-900">ID:</span>
                                                            <p className="font-mono text-gray-900">{certificate.id}</p>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-gray-900">Template:</span>
                                                            <p className="text-gray-900">{certificate.templateKey}</p>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-gray-900">Aluno:</span>
                                                            <p className="text-gray-900">{certificate.tokensResumo.NOME_COMPLETO}</p>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium text-gray-900">Emissão:</span>
                                                            <p className="text-gray-900">
                                                                {new Date(certificate.createdAt).toLocaleDateString("pt-BR")}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleView(certificate)}
                                                        className="flex items-center gap-2 border-2 border-gray-200 hover:border-blue-500 text-gray-700 hover:text-blue-600 transition-all duration-300"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        Visualizar
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleDownload(certificate)}
                                                        className="flex items-center gap-2 bg-gradient-to-r from-era-black via-era-gray-medium to-era-green hover:from-era-black/90 hover:via-era-gray-medium/90 hover:to-era-green/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                        Download
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>

                        {/* Estatísticas com design melhorado */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                            <Card className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                                <CardContent className="p-4 lg:p-6 text-center">
                                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
                                        <Trophy className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                                    </div>
                                    <div className="text-2xl lg:text-3xl font-bold text-white mb-1 lg:mb-2">{stats.total}</div>
                                    <p className="text-white/90 font-medium text-sm lg:text-base">Total de Certificados</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                                <CardContent className="p-4 lg:p-6 text-center">
                                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
                                        <CheckCircle className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                                    </div>
                                    <div className="text-2xl lg:text-3xl font-bold text-white mb-1 lg:mb-2">{stats.ativos}</div>
                                    <p className="text-white/90 font-medium text-sm lg:text-base">Certificados Ativos</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                                <CardContent className="p-4 lg:p-6 text-center">
                                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
                                        <Target className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                                    </div>
                                    <div className="text-2xl lg:text-3xl font-bold text-white mb-1 lg:mb-2">{stats.mediaNota}%</div>
                                    <p className="text-white/90 font-medium text-sm lg:text-base">Média Geral</p>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                                <CardContent className="p-4 lg:p-6 text-center">
                                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
                                        <Clock className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                                    </div>
                                    <div className="text-2xl lg:text-3xl font-bold text-white mb-1 lg:mb-2">
                                        {certificates && certificates.length > 0
                                            ? new Date(certificates[0].data_emissao).toLocaleDateString("pt-BR")
                                            : "0"}
                                    </div>
                                    <p className="text-white/90 font-medium text-sm lg:text-base">Última Emissão</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </ERALayout>
    )
}

// Componente para formulário de geração de certificados
const GenerateCertificateForm: React.FC<{
    onGenerate: (templateKey: string, nomeCompleto: string, curso: string) => void
    onCancel: () => void
}> = ({ onGenerate, onCancel }) => {
    const [templateKey, setTemplateKey] = useState("")
    const [nomeCompleto, setNomeCompleto] = useState("")
    const [curso, setCurso] = useState("")
    const [loading, setLoading] = useState(false)

    const templates = [
        { key: "pabx_fundamentos", name: "Fundamentos de PABX" },
        { key: "pabx_avancado", name: "Configurações Avançadas PABX" },
        { key: "callcenter_fundamentos", name: "Fundamentos CALLCENTER" },
        { key: "omnichannel_empresas", name: "OMNICHANNEL para Empresas" },
        { key: "omni_avancado", name: "Configurações Avançadas OMNI" },
    ]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!templateKey || !nomeCompleto || !curso) {
            toast({
                title: "Erro",
                description: "Todos os campos são obrigatórios.",
                variant: "destructive",
            })
            return
        }

        setLoading(true)
        try {
            await onGenerate(templateKey, nomeCompleto, curso)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Template do Certificado</label>
                    <Select value={templateKey} onValueChange={setTemplateKey}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione o template" />
                        </SelectTrigger>
                        <SelectContent>
                            {templates.map((template) => (
                                <SelectItem key={template.key} value={template.key}>
                                    {template.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
                    <Input
                        value={nomeCompleto}
                        onChange={(e) => setNomeCompleto(e.target.value)}
                        placeholder="Digite o nome completo"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Curso</label>
                <Input value={curso} onChange={(e) => setCurso(e.target.value)} placeholder="Digite o nome do curso" required />
            </div>

            <div className="flex gap-2 pt-4">
                <Button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-gradient-to-r from-era-black via-era-gray-medium to-era-green hover:from-era-black/90 hover:via-era-gray-medium/90 hover:to-era-green/90 text-white"
                >
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Gerando...
                        </>
                    ) : (
                        <>
                            <Plus className="h-4 w-4" />
                            Gerar Certificado
                        </>
                    )}
                </Button>
                <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                    Cancelar
                </Button>
            </div>
        </form>
    )
}

export default Certificados
