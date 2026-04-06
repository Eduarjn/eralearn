"use client"
import { BlurText } from '@/ui/BlurText';
import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabaseClient"
import { ERALayout } from "@/components/ERALayout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
    Search,
    Filter,
    Edit,
    Eye,
    Calendar,
    BookOpen,
    CheckCircle,
    FileText,
    HelpCircle,
    Users,
    Target,
    Plus,
    Trash2,
    Save,
    Loader2,
    ArrowLeft,
    Trash, 
    AlertTriangle,
    Wrench,
    Database as DatabaseIcon,
    RefreshCw,
    Download,
    FileJson
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

// ============================================================================
// 📝 INTERFACES E TIPOS
// ============================================================================

interface QuizQuestion {
    id: string
    quiz_id?: string
    pergunta: string
    opcoes: string[]
    resposta_correta: number
    explicacao?: string
    ordem: number
}

interface Quiz {
    id: string
    categoria: string
    titulo: string
    descricao?: string
    nota_minima: number
    ativo: boolean
    data_criacao: string
    data_atualizacao: string
    // Dados calculados/relacionados
    total_perguntas: number
    total_tentativas: number
    media_nota: number
    total_aprovados: number
    curso_vinculado?: string | null // Nome do curso vinculado (para diagnóstico)
}

interface QuizStats {
    total: number
    ativos: number
    inativos: number
    total_perguntas: number
    media_nota_geral: number
    total_tentativas: number
}

// ============================================================================
// 🚀 COMPONENTE PRINCIPAL
// ============================================================================

const Quizzes: React.FC = () => {
    const { userProfile } = useAuth()
    const navigate = useNavigate()
    
    // --- ESTADOS DE DADOS ---
    const [quizzes, setQuizzes] = useState<Quiz[]>([])
    const [filteredQuizzes, setFilteredQuizzes] = useState<Quiz[]>([])
    const [stats, setStats] = useState<QuizStats>({
        total: 0,
        ativos: 0,
        inativos: 0,
        total_perguntas: 0,
        media_nota_geral: 0,
        total_tentativas: 0,
    })
    const [loading, setLoading] = useState(true)
    
    // --- ESTADOS DE FILTRO ---
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("todos")
    const [categoriaFilter, setCategoriaFilter] = useState<string>("todos")

    // --- ESTADOS DO MODAL DE PERGUNTAS ---
    const [showQuestionsModal, setShowQuestionsModal] = useState(false)
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
    const [questions, setQuestions] = useState<QuizQuestion[]>([])
    const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [saving, setSaving] = useState(false)

    // --- ESTADOS PARA CRIAÇÃO DE NOVO QUIZ ---
    const [openCreateQuiz, setOpenCreateQuiz] = useState(false)
    const [courses, setCourses] = useState<any[]>([]) 
    const [selectedCourseId, setSelectedCourseId] = useState("") 
    const [quizTitulo, setQuizTitulo] = useState("")
    const [quizDescricao, setQuizDescricao] = useState("")
    const [quizNotaMinima, setQuizNotaMinima] = useState(70)
    const [savingQuiz, setSavingQuiz] = useState(false)

    // --- ESTADOS DE MANUTENÇÃO (ADMIN) ---
    const [runningMaintenance, setRunningMaintenance] = useState(false)
    const [maintenanceLog, setMaintenanceLog] = useState<string[]>([])

    // Verifica permissões
    const isAdmin = userProfile?.tipo_usuario === "admin" || userProfile?.tipo_usuario === "admin_master"

    // ============================================================================
    // 🔄 EFEITOS (USE EFFECT)
    // ============================================================================

    // 1. Carregar lista de cursos para o dropdown (apenas uma vez)
    useEffect(() => {
        const loadCourses = async () => {
            const { data } = await supabase
                .from("cursos")
                .select("id, nome, categoria")
                .order("nome")

            if (data) setCourses(data)
        }
        loadCourses()
    }, [])

    // 2. Carregar quizzes quando o usuário estiver autenticado
    useEffect(() => {
        if (userProfile) {
            loadQuizzes()
        }
    }, [userProfile])

    // 3. Filtrar quizzes localmente sempre que os dados ou filtros mudarem
    useEffect(() => {
        filterQuizzes()
    }, [quizzes, searchTerm, statusFilter, categoriaFilter])

    // ============================================================================
    // 🛠️ FERRAMENTAS DE MANUTENÇÃO E DIAGNÓSTICO (ADMIN TOOLS)
    // ============================================================================
    // Estas funções garantem a integridade do banco de dados e ajudam a debugar problemas

    const logMaintenance = (msg: string) => {
        console.log(`[MANUTENÇÃO] ${msg}`);
        setMaintenanceLog(prev => [...prev, msg]);
    }

    // Diagnóstico Completo: Verifica integridade entre Cursos <-> Mappings <-> Quizzes
    const runFullDiagnostics = async () => {
        if (!isAdmin) return;
        setRunningMaintenance(true);
        logMaintenance("Iniciando diagnóstico completo...");
        
        try {
            // 1. Verificar Quizzes sem Perguntas
            const emptyQuizzes = quizzes.filter(q => q.total_perguntas === 0);
            if (emptyQuizzes.length > 0) {
                toast({
                    title: "Aviso de Integridade",
                    description: `${emptyQuizzes.length} quizzes não possuem perguntas cadastradas.`,
                    variant: "default"
                });
            }

            // 2. Verificar Mapeamento (Órfãos)
            const { data: mappings } = await supabase.from('curso_quiz_mapping').select('*');
            const { data: allQuizzes } = await supabase.from('quizzes').select('id');
            
            if (mappings && allQuizzes) {
                const mappedIds = mappings.map(m => m.quiz_id);
                const orphans = allQuizzes.filter(q => !mappedIds.includes(q.id));
                
                if (orphans.length > 0) {
                    toast({
                        title: "Quizzes Órfãos Detectados",
                        description: `${orphans.length} quizzes não estão vinculados a nenhum curso. Use a ferramenta de correção.`,
                        variant: "destructive"
                    });
                }
            }

            // 3. Verificar Sincronia de Categorias
            let categoryMismatch = 0;
            if (mappings) {
                const { data: coursesDB } = await supabase.from('cursos').select('id, categoria');
                
                for (const map of mappings) {
                    const quiz = quizzes.find(q => q.id === map.quiz_id);
                    const course = coursesDB?.find(c => c.id === map.curso_id);
                    
                    if (quiz && course && quiz.categoria !== course.categoria) {
                        categoryMismatch++;
                    }
                }
            }

            if (categoryMismatch > 0) {
                toast({
                    title: "Categorias Dessincronizadas",
                    description: `${categoryMismatch} quizzes têm categorias diferentes dos seus cursos.`,
                });
            }

            logMaintenance("Diagnóstico finalizado.");
            
        } catch (error) {
            console.error("Erro no diagnóstico:", error);
            toast({ title: "Erro", description: "Falha ao executar diagnóstico.", variant: "destructive" });
        } finally {
            setRunningMaintenance(false);
        }
    };

    // Correção Automática: Sincroniza a categoria do Quiz com a do Curso vinculado
    const syncCategories = async () => {
        if (!isAdmin) return;
        setRunningMaintenance(true);
        try {
            const { data: mappings } = await supabase.from('curso_quiz_mapping').select('*');
            const { data: coursesDB } = await supabase.from('cursos').select('id, categoria');
            
            let updatedCount = 0;
            
            if (mappings && coursesDB) {
                for (const map of mappings) {
                    const course = coursesDB.find(c => c.id === map.curso_id);
                    if (course) {
                        // Atualiza o quiz para ter a mesma categoria do curso
                        const { error } = await supabase
                            .from('quizzes')
                            .update({ categoria: course.categoria })
                            .eq('id', map.quiz_id)
                            .neq('categoria', course.categoria); // Só atualiza se for diferente
                        
                        if (!error) updatedCount++; // Contagem aproximada (API não retorna count em update simples)
                    }
                }
            }
            
            toast({ title: "Sincronização Concluída", description: "Categorias verificadas e atualizadas." });
            loadQuizzes();
        } catch (error) {
            toast({ title: "Erro", description: "Falha na sincronização.", variant: "destructive" });
        } finally {
            setRunningMaintenance(false);
        }
    }

    // Exportação: Gera um JSON com todos os quizzes e perguntas (Backup)
    const exportQuizzesData = async () => {
        if (!isAdmin) return;
        try {
            const { data: allData, error } = await supabase
                .from('quizzes')
                .select(`
                    *,
                    quiz_perguntas (*)
                `);
            
            if (error) throw error;

            const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup_quizzes_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            toast({ title: "Exportação Concluída", description: "Arquivo JSON gerado com sucesso." });
        } catch (error) {
            toast({ title: "Erro", description: "Falha ao exportar dados.", variant: "destructive" });
        }
    }

    // ============================================================================
    // 📡 CARREGAMENTO DE DADOS (LOAD QUIZZES)
    // ============================================================================

    const loadQuizzes = async () => {
        try {
            setLoading(true)
            
            let quizzesData: any[] = []
            let quizzesError

            // ESTE BLOCO FOI CORRIGIDO PARA TRAZER QUIZZES MESMO SEM PERGUNTAS (REMOVIDO !inner)
            if (isAdmin) {
                // ADMIN: Busca TUDO
                const { data, error } = await supabase
                    .from("quizzes")
                    .select(`
                        *,
                        quiz_perguntas(id), 
                        progresso_quiz(id)
                    `)
                    .order("data_criacao", { ascending: false })

                quizzesData = data || []
                quizzesError = error
            } else {
                // CLIENTE: Busca apenas quizzes vinculados a cursos existentes
                // 1. Busca IDs de cursos
                const { data: cursosData, error: cursosError } = await supabase.from("cursos").select("id")
                if (cursosError) throw cursosError

                const cursoIds = cursosData?.map((c) => c.id) || []

                if (cursoIds.length === 0) { setQuizzes([]); setLoading(false); return }

                // 2. Busca IDs de quizzes na tabela de mapping
                const { data: mappingData, error: mappingError } = await supabase
                    .from("curso_quiz_mapping")
                    .select("quiz_id")
                    .in("curso_id", cursoIds)
                
                if (mappingError) throw mappingError
                
                const validQuizIds = mappingData?.map(m => m.quiz_id) || []

                // 3. Busca os quizzes finais
                if (validQuizIds.length > 0) {
                    const { data, error } = await supabase
                        .from("quizzes")
                        .select(`
                            *,
                            quiz_perguntas(id),
                            progresso_quiz(id)
                        `)
                        .in("id", validQuizIds)
                        .eq("ativo", true) // Apenas ativos para clientes
                        .order("data_criacao", { ascending: false })
                    
                    quizzesData = data || []
                    quizzesError = error
                }
            }

            if (quizzesError) throw quizzesError

            // Mapeamento e Cálculo de Estatísticas
            const quizzesWithStats = quizzesData.map((quiz) => {
                const totalPerguntas = Array.isArray(quiz.quiz_perguntas) ? quiz.quiz_perguntas.length : 0
                const totalTentativas = Array.isArray(quiz.progresso_quiz) ? quiz.progresso_quiz.length : 0

                return {
                    ...quiz,
                    categoria: quiz.categoria || "Geral",
                    total_perguntas: totalPerguntas,
                    total_tentativas: totalTentativas,
                    media_nota: 0, // Poderia ser calculado via API se necessário
                    total_aprovados: 0,
                }
            })

            setQuizzes(quizzesWithStats)
            calculateStats(quizzesWithStats)
        } catch (error) {
            console.error("❌ Erro ao carregar quizzes:", error)
            toast({
                title: "Erro de Carregamento",
                description: "Não foi possível carregar a lista de quizzes.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const calculateStats = (data: Quiz[]) => {
        setStats({
            total: data.length,
            ativos: data.filter(q => q.ativo).length,
            inativos: data.filter(q => !q.ativo).length,
            total_perguntas: data.reduce((acc, q) => acc + q.total_perguntas, 0),
            media_nota_geral: 0, 
            total_tentativas: data.reduce((acc, q) => acc + q.total_tentativas, 0),
        })
    }

    const filterQuizzes = () => {
        let filtered = quizzes

        if (searchTerm) {
            const lower = searchTerm.toLowerCase()
            filtered = filtered.filter(q => 
                q.titulo.toLowerCase().includes(lower) || 
                q.categoria.toLowerCase().includes(lower) || 
                (q.descricao && q.descricao.toLowerCase().includes(lower))
            )
        }

        if (statusFilter !== "todos") {
            filtered = filtered.filter(q => (statusFilter === "ativo" ? q.ativo : !q.ativo))
        }

        if (categoriaFilter !== "todos") {
            filtered = filtered.filter(q => q.categoria === categoriaFilter)
        }

        setFilteredQuizzes(filtered)
    }

    // ============================================================================
    // 🎮 FUNÇÕES DE CRUD DO QUIZ (CRIAR / DELETAR)
    // ============================================================================

    const handleCreateQuiz = async () => {
        try {
            if (!selectedCourseId) {
                toast({ title: "Atenção", description: "Selecione um curso para vincular.", variant: "destructive" })
                return
            }
            
            if (!quizTitulo) {
                toast({ title: "Atenção", description: "O título do quiz é obrigatório.", variant: "destructive" })
                return
            }
        
            setSavingQuiz(true)
        
            // 1. Buscar categoria do curso selecionado
            const { data: curso } = await supabase
              .from("cursos")
              .select("categoria")
              .eq("id", selectedCourseId)
              .single()

            if (!curso) throw new Error("Curso não encontrado")
        
            // 2. Criar o Quiz
            const { data: quiz, error } = await supabase
              .from("quizzes")
              .insert({
                titulo: quizTitulo,
                descricao: quizDescricao,
                categoria: curso.categoria, // Usa a mesma categoria do curso
                nota_minima: quizNotaMinima,
                ativo: true
              })
              .select()
              .single()
        
            if (error) throw error
        
            // 3. Criar o Vínculo (Mapping)
            await supabase.from("curso_quiz_mapping").insert({
              curso_id: selectedCourseId,
              quiz_id: quiz.id
            })
        
            toast({ title: "Sucesso! 🎉", description: "Quiz criado e vinculado ao curso." })
            setOpenCreateQuiz(false)
            
            // Limpa form
            setQuizTitulo("")
            setQuizDescricao("")
            setSelectedCourseId("")
            
            // Recarrega
            loadQuizzes()
        
          } catch (err) {
            console.error(err)
            toast({ title: "Erro", description: "Falha ao criar quiz.", variant: "destructive" })
          } finally {
            setSavingQuiz(false)
          }
    }

    const handleDeleteQuiz = async (quizId: string, quizTitle: string) => {
        if (!isAdmin) return
        if (!confirm(`ATENÇÃO: Deseja excluir o quiz "${quizTitle}"?\n\nIsso apagará:\n- O Quiz\n- Todas as perguntas\n- O histórico de tentativas dos alunos.\n\nEssa ação não pode ser desfeita.`)) return

        try {
            // Remove dependências primeiro (Cascade manual para garantir)
            await supabase.from("curso_quiz_mapping").delete().eq("quiz_id", quizId)
            await supabase.from("quiz_perguntas").delete().eq("quiz_id", quizId)
            await supabase.from("progresso_quiz").delete().eq("quiz_id", quizId)
            
            // Remove o quiz
            const { error } = await supabase.from("quizzes").delete().eq("id", quizId)

            if (error) throw error

            toast({ title: "Quiz excluído", description: "Removido com sucesso." })
            setQuizzes(prev => prev.filter(q => q.id !== quizId))
        } catch (err) {
            console.error(err)
            toast({ title: "Erro", description: "Não foi possível excluir o quiz.", variant: "destructive" })
        }
    }

    // ============================================================================
    // ❓ FUNÇÕES DE CRUD DE PERGUNTAS (ADICIONAR / EDITAR / DELETAR)
    // ============================================================================

    const handleViewQuestions = async (quiz: Quiz) => {
        try {
            setSelectedQuiz(quiz)
            setShowQuestionsModal(true)
            setIsEditing(false)
            setEditingQuestion(null)

            const { data, error } = await supabase
                .from("quiz_perguntas")
                .select("*")
                .eq("quiz_id", quiz.id)
                .order("ordem")

            if (error) throw error

            setQuestions(data || [])
        } catch (error) {
            toast({ title: "Erro", description: "Erro ao carregar perguntas.", variant: "destructive" })
        }
    }

    const handleAddQuestion = () => {
        // Template para nova pergunta
        const newQuestion: QuizQuestion = {
            id: 'new', // ID temporário
            quiz_id: selectedQuiz?.id,
            pergunta: '',
            opcoes: ['', '', '', ''], // 4 opções por padrão
            resposta_correta: 0, // A primeira é a correta por padrão
            explicacao: '',
            ordem: questions.length + 1
        }
        setEditingQuestion(newQuestion)
        setIsEditing(true)
    }

    const handleEditQuestion = (question: QuizQuestion) => {
        setEditingQuestion({ ...question })
        setIsEditing(true)
    }

    const handleDeleteQuestion = async (questionId: string) => {
        if (!confirm("Tem certeza que deseja deletar esta pergunta?")) return
        try {
            await supabase.from("quiz_perguntas").delete().eq("id", questionId)
            setQuestions(prev => prev.filter(q => q.id !== questionId))
            toast({ title: "Pergunta deletada" })
        } catch (e) {
            toast({ title: "Erro", variant: "destructive" })
        }
    }

    const handleSaveQuestion = async () => {
        if (!editingQuestion || !selectedQuiz) return
        
        // Validação básica
        if (!editingQuestion.pergunta.trim()) {
            toast({ title: "Erro", description: "A pergunta não pode estar vazia.", variant: "destructive" })
            return
        }
        if (editingQuestion.opcoes.some(opt => !opt.trim())) {
            toast({ title: "Erro", description: "Todas as opções devem ser preenchidas.", variant: "destructive" })
            return
        }

        try {
            setSaving(true)
            
            const questionData = {
                quiz_id: selectedQuiz.id,
                pergunta: editingQuestion.pergunta,
                opcoes: editingQuestion.opcoes,
                resposta_correta: editingQuestion.resposta_correta,
                explicacao: editingQuestion.explicacao,
                ordem: editingQuestion.ordem,
            }

            if (editingQuestion.id === 'new') {
                // INSERT
                const { data, error } = await supabase.from("quiz_perguntas").insert(questionData).select().single()
                if (error) throw error
                setQuestions(prev => [...prev, data])
                toast({ title: "Pergunta criada!" })
            } else {
                // UPDATE
                const { error } = await supabase.from("quiz_perguntas").update(questionData).eq("id", editingQuestion.id)
                if (error) throw error
                setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? { ...editingQuestion } : q))
                toast({ title: "Pergunta atualizada!" })
            }
            setEditingQuestion(null)
            setIsEditing(false)
            
            // Atualiza contador na lista principal sem reload
            loadQuizzes() 
            
        } catch (error) {
            console.error(error)
            toast({ title: "Erro ao salvar", variant: "destructive" })
        } finally {
            setSaving(false)
        }
    }

    // Auxiliares para manipulação das opções dentro do formulário
    const handleAddOption = () => {
        if (!editingQuestion) return
        setEditingQuestion({ ...editingQuestion, opcoes: [...editingQuestion.opcoes, ""] })
    }
    const handleUpdateOption = (index: number, value: string) => {
        if (!editingQuestion) return
        const newOpts = [...editingQuestion.opcoes]
        newOpts[index] = value
        setEditingQuestion({ ...editingQuestion, opcoes: newOpts })
    }
    const handleRemoveOption = (index: number) => {
        if (!editingQuestion || editingQuestion.opcoes.length <= 2) return // Mínimo 2 opções
        
        const newOpts = editingQuestion.opcoes.filter((_, i) => i !== index)
        // Ajusta o índice da resposta correta se necessário
        let newCorrect = editingQuestion.resposta_correta
        if (index < editingQuestion.resposta_correta) newCorrect--
        if (index === editingQuestion.resposta_correta) newCorrect = 0 // Reseta se apagou a correta
        
        setEditingQuestion({ 
            ...editingQuestion, 
            opcoes: newOpts,
            resposta_correta: Math.min(newCorrect, newOpts.length - 1)
        })
    }

    // ============================================================================
    // 🖼️ RENDERIZAÇÃO (UI)
    // ============================================================================

    const getStatusBadge = (ativo: boolean) => {
        return ativo ? (
            <Badge className="bg-green-100 text-green-800">Ativo</Badge>
        ) : (
            <Badge className="bg-gray-100 text-gray-800">Inativo</Badge>
        )
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        })
    }

    const getUniqueCategories = () => {
        const categories = [...new Set(quizzes.map((q) => q.categoria))]
        return categories.sort()
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando plataforma de avaliação...</p>
                </div>
            </div>
        )
    }

    return (
        <ERALayout>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
                {/* HERO SECTION */}
                <div
                    className="page-hero w-full rounded-xl lg:rounded-2xl flex flex-col md:flex-row justify-between items-center p-4 lg:p-8 mb-6 lg:mb-8 shadow-md"
                    style={{ background: "linear-gradient(135deg, #2b363d 30%, #4A4A4A 60%, #cfff00 100%)" }}
                >
                    <div className="px-4 lg:px-6 py-6 lg:py-8 md:py-12 w-full">
                        <div className="max-w-7xl mx-auto">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 lg:gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-2 h-2 bg-era-green rounded-full animate-pulse"></div>
                                        <BlurText
                                            text="Plataforma de Ensino"
                                            className="text-xs lg:text-sm font-medium text-white/90 m-0 p-0"
                                            delay={20}
                                            animateBy="words"
                                            direction="top"
                                        />
                                    </div>
                                    <div className="mb-2 lg:mb-3">
                                        <BlurText
                                            text="Quizzes"
                                            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white m-0 p-0"
                                            delay={50}
                                            animateBy="letters"
                                            direction="top"
                                        />
                                    </div>
                                    <div className="mb-3 lg:mb-4 max-w-2xl">
                                        <BlurText
                                            text="Visualize e gerencie todos os quizzes de conclusão de cursos"
                                            className="text-sm sm:text-base lg:text-lg md:text-xl text-white/90 m-0 p-0"
                                            delay={30}
                                            animateBy="words"
                                            direction="top"
                                        />
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 lg:gap-4 mt-3 lg:mt-4">
                                        <div className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm text-white/90">
                                            <HelpCircle className="h-3 w-3 lg:h-4 lg:w-4 text-era-green" />
                                            <BlurText text="Avaliações interativas" className="text-white m-0 p-0" delay={20} animateBy="words" />
                                        </div>
                                        <div className="flex items-center gap-1 lg:gap-2 text-xs lg:text-sm text-white/90">
                                            <Target className="h-3 w-3 lg:h-4 lg:w-4 text-era-green" />
                                            <BlurText text="Certificação automática" className="text-white m-0 p-0" delay={20} animateBy="words" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Button
                                        onClick={() => navigate("/dashboard")}
                                        className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green hover:from-era-black/90 hover:via-era-gray-medium/90 hover:to-era-green/90 text-white font-medium px-4 lg:px-6 py-2 lg:py-3 rounded-lg lg:rounded-xl text-sm lg:text-base transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                                    >
                                        <ArrowLeft className="h-4 w-4 lg:h-5 lg:w-5 mr-1 lg:mr-2" />
                                        Voltar
                                    </Button>
                                    
                                    {/* PAINEL DE MANUTENÇÃO (ADMIN) */}
                                    {isAdmin && (
                                        <div className="flex gap-2 mt-2">
                                            <Button onClick={runFullDiagnostics} size="sm" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20" title="Verificar integridade do banco">
                                                {runningMaintenance ? <Loader2 className="h-4 w-4 animate-spin"/> : <Wrench className="h-4 w-4"/>}
                                            </Button>
                                            <Button onClick={syncCategories} size="sm" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20" title="Sincronizar categorias">
                                                <RefreshCw className="h-4 w-4"/>
                                            </Button>
                                            <Button onClick={exportQuizzesData} size="sm" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20" title="Exportar backup JSON">
                                                <Download className="h-4 w-4"/>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-4 lg:px-6 py-6 lg:py-8">
                    <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
                        {/* ESTATÍSTICAS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <Card className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                                <CardContent className="p-6">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <BookOpen className="h-8 w-8 text-white" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-white/90">Total de Quizzes</p>
                                            <p className="text-2xl font-bold text-white">{stats.total}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                                <CardContent className="p-6">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <CheckCircle className="h-8 w-8 text-white" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-white/90">Quizzes Ativos</p>
                                            <p className="text-2xl font-bold text-white">{stats.ativos}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                                <CardContent className="p-6">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <HelpCircle className="h-8 w-8 text-white" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-white/90">Total Perguntas</p>
                                            <p className="text-2xl font-bold text-white">{stats.total_perguntas}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                                <CardContent className="p-6">
                                    <div className="flex items-center">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <Target className="h-8 w-8 text-white" />
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-white/90">Média Geral</p>
                                            <p className="text-2xl font-bold text-white">{stats.media_nota_geral}%</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* BARRA DE AÇÕES E FILTROS */}
                        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                            <CardHeader className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white">
                                <CardTitle className="flex items-center gap-3 text-white font-bold text-xl">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <Filter className="h-6 w-6 text-white" />
                                    </div>
                                    <span>Buscar Quizzes</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                            <Input
                                                placeholder="Buscar por título ou categoria..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 h-10 lg:h-12 text-sm lg:text-base border-2 border-gray-200 focus:border-era-green rounded-lg lg:rounded-xl transition-all duration-300"
                                            />
                                        </div>
                                    </div>

                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-full md:w-48 h-10 lg:h-12 border-2 border-gray-200 focus:border-era-green rounded-lg lg:rounded-xl transition-all duration-300">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="todos">Todos os Status</SelectItem>
                                            <SelectItem value="ativo">Ativo</SelectItem>
                                            <SelectItem value="inativo">Inativo</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
                                        <SelectTrigger className="w-full md:w-48 h-10 lg:h-12 border-2 border-gray-200 focus:border-era-green rounded-lg lg:rounded-xl transition-all duration-300">
                                            <SelectValue placeholder="Categoria" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="todos">Todas as Categorias</SelectItem>
                                            {getUniqueCategories().map((categoria) => (
                                                <SelectItem key={categoria} value={categoria}>
                                                    {categoria}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* LISTAGEM DE QUIZZES (GRID) */}
                        {filteredQuizzes.length === 0 ? (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum quiz encontrado</h3>
                                    <p className="text-gray-600">
                                        {searchTerm || statusFilter !== "todos" || categoriaFilter !== "todos"
                                            ? "Tente ajustar os filtros de busca."
                                            : "Ainda não há quizzes configurados."}
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredQuizzes.map((quiz) => (
                                    <Card
                                        key={quiz.id}
                                        className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/80 backdrop-blur-sm relative group"
                                    >
                                        <CardHeader className="pb-3 bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white rounded-t-lg">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <CardTitle className="text-base lg:text-lg font-bold text-white mb-2 truncate">
                                                        {quiz.titulo}
                                                    </CardTitle>
                                                    <div className="flex flex-wrap items-center gap-1 mb-2">
                                                        <Badge className="text-xs bg-white/20 text-white border-white/30">{quiz.categoria}</Badge>
                                                        {getStatusBadge(quiz.ativo)}
                                                    </div>
                                                </div>
                                                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 ml-2">
                                                    <HelpCircle className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
                                                </div>
                                            </div>

                                            {/* BOTÃO EXCLUIR (SÓ ADMIN) */}
                                            {isAdmin && (
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteQuiz(quiz.id, quiz.titulo);
                                                    }}
                                                    className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/80 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                                                    title="Excluir Quiz"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </CardHeader>

                                        <CardContent className="space-y-3">
                                            <div className="space-y-2">
                                                <div className="flex items-center text-xs lg:text-sm text-era-gray-medium">
                                                    <HelpCircle className="h-3 w-3 lg:h-4 lg:w-4 mr-2 flex-shrink-0" />
                                                    <span className="font-medium">Perguntas:</span>
                                                    <span className="ml-1">{quiz.total_perguntas}</span>
                                                </div>

                                                <div className="flex items-center text-xs lg:text-sm text-era-gray-medium">
                                                    <Target className="h-3 w-3 lg:h-4 lg:w-4 mr-2 flex-shrink-0" />
                                                    <span className="font-medium">Média:</span>
                                                    <span className="ml-1">{quiz.media_nota}%</span>
                                                </div>

                                                <div className="flex items-center text-xs lg:text-sm text-era-gray-medium">
                                                    <Calendar className="h-3 w-3 lg:h-4 lg:w-4 mr-2 flex-shrink-0" />
                                                    <span className="font-medium">Criado:</span>
                                                    <span className="ml-1">{formatDate(quiz.data_criacao)}</span>
                                                </div>
                                            </div>

                                            {quiz.descricao && (
                                                <div className="bg-era-gray-light p-2 lg:p-3 rounded-lg">
                                                    <div className="text-xs lg:text-sm font-medium text-era-black mb-1">Descrição:</div>
                                                    <p className="text-xs lg:text-sm text-era-gray-medium line-clamp-2">{quiz.descricao}</p>
                                                </div>
                                            )}

                                            <div className="pt-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleViewQuestions(quiz)}
                                                    className="w-full bg-gradient-to-r from-era-black via-era-gray-medium to-era-green hover:from-era-black/90 hover:via-era-gray-medium/90 hover:to-era-green/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                                >
                                                    <Eye className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                                                    {isAdmin ? "Gerenciar Perguntas" : "Ver Perguntas"}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* CARD GRANDE DE ADICIONAR NOVO QUIZ */}
                        {isAdmin && (
                            <Card className="hover:shadow-xl transition-all duration-300 border-2 border-dashed border-era-green bg-era-gray-light">
                                <CardContent className="p-6 lg:p-8 text-center">
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <div className="w-12 h-12 lg:w-16 lg:h-16 bg-era-green/20 rounded-full flex items-center justify-center mb-3 lg:mb-4">
                                            <Plus className="h-6 w-6 lg:h-8 lg:w-8 text-era-green" />
                                        </div>
                                        <h3 className="text-sm lg:text-lg font-bold text-era-black mb-2">Adicionar Novo Quiz</h3>
                                        <p className="text-xs lg:text-sm text-era-gray-medium mb-3 lg:mb-4">
                                            Crie um novo quiz e vincule-o a um curso existente
                                        </p>
                                        <Button
                                            onClick={() => setOpenCreateQuiz(true)}
                                            className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green hover:from-era-black/90 hover:via-era-gray-medium/90 hover:to-era-green/90 text-white font-medium px-4 lg:px-6 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                                        >
                                            <Plus className="h-3 w-3 lg:h-4 lg:w-4" />
                                            Novo Quiz
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* =======================================================================
                    MODAL DE GERENCIAMENTO DE PERGUNTAS (Visualização / Edição)
                   ======================================================================= */}
                <Dialog open={showQuestionsModal} onOpenChange={setShowQuestionsModal}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <div className="flex items-center justify-between">
                                <DialogTitle className="flex items-center gap-2 text-era-black">
                                    <div className="p-2 bg-era-green/20 rounded-lg">
                                        <HelpCircle className="h-6 w-6 text-era-green" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span>Perguntas do Quiz: {selectedQuiz?.titulo}</span>
                                        <span className="text-sm font-normal text-gray-500">Gerencie as questões e respostas</span>
                                    </div>
                                </DialogTitle>
                                <div className="flex gap-2">
                                    {/* BOTÃO NOVA PERGUNTA NO HEADER */}
                                    {isAdmin && !isEditing && (
                                        <Button onClick={handleAddQuestion} className="bg-era-green text-black hover:bg-era-green/80">
                                            <Plus className="h-4 w-4 mr-2"/> Nova Pergunta
                                        </Button>
                                    )}
                                    <Button
                                        onClick={() => setShowQuestionsModal(false)}
                                        variant="outline"
                                        className="border-gray-300"
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
                                    </Button>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="space-y-6 mt-4">
                            
                            {/* --- FORMULÁRIO DE EDIÇÃO/CRIAÇÃO DE PERGUNTA --- */}
                            {isEditing && editingQuestion ? (
                                <Card className="border-2 border-era-green/50 bg-green-50/10 animate-in fade-in zoom-in-95 duration-200">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            {editingQuestion.id === 'new' ? <Plus className="h-5 w-5"/> : <Edit className="h-5 w-5"/>}
                                            {editingQuestion.id === 'new' ? 'Criar Nova Pergunta' : 'Editar Pergunta'}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <label className="text-sm font-bold text-gray-700 mb-1 block">Enunciado da Pergunta</label>
                                            <Textarea 
                                                placeholder="Digite a pergunta aqui..." 
                                                value={editingQuestion.pergunta} 
                                                onChange={e => setEditingQuestion({...editingQuestion, pergunta: e.target.value})}
                                                className="min-h-[80px]"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-sm font-bold text-gray-700 block">Opções de Resposta (Selecione a correta)</label>
                                            {editingQuestion.opcoes.map((opt, i) => (
                                                <div key={i} className="flex gap-2 items-center group">
                                                    <input 
                                                        type="radio" 
                                                        name="correct_option" 
                                                        className="w-4 h-4 accent-era-green cursor-pointer"
                                                        checked={editingQuestion.resposta_correta === i} 
                                                        onChange={() => setEditingQuestion({...editingQuestion, resposta_correta: i})}
                                                    />
                                                    <span className="text-sm font-mono w-6 text-gray-500">{String.fromCharCode(65+i)}.</span>
                                                    <Input 
                                                        value={opt} 
                                                        onChange={e => handleUpdateOption(i, e.target.value)} 
                                                        placeholder={`Opção ${i+1}`} 
                                                        className={editingQuestion.resposta_correta === i ? "border-era-green bg-green-50" : ""}
                                                    />
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        onClick={() => handleRemoveOption(i)}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 hover:bg-red-50"
                                                        disabled={editingQuestion.opcoes.length <= 2}
                                                    >
                                                        <Trash className="h-4 w-4"/>
                                                    </Button>
                                                </div>
                                            ))}
                                            <Button variant="outline" size="sm" onClick={handleAddOption} className="w-full border-dashed">
                                                <Plus className="h-3 w-3 mr-1"/> Adicionar Opção
                                            </Button>
                                        </div>

                                        <div>
                                            <label className="text-sm font-bold text-gray-700 mb-1 block">Explicação da Resposta (Opcional)</label>
                                            <Textarea 
                                                placeholder="Explique por que a resposta está correta (aparece após o aluno responder)" 
                                                value={editingQuestion.explicacao || ''} 
                                                onChange={e => setEditingQuestion({...editingQuestion, explicacao: e.target.value})}
                                            />
                                        </div>

                                        <div className="flex gap-3 justify-end pt-4 border-t">
                                            <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancelar</Button>
                                            <Button onClick={handleSaveQuestion} disabled={saving} className="bg-era-green text-black hover:bg-era-green/80 min-w-[120px]">
                                                {saving ? <Loader2 className="animate-spin h-4 w-4"/> : <Save className="mr-2 h-4 w-4"/>} 
                                                Salvar Pergunta
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                // --- LISTA DE PERGUNTAS ---
                                <>
                                    {questions.length === 0 ? (
                                        <div className="text-center py-16 border-2 border-dashed rounded-xl bg-gray-50">
                                            <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4"/>
                                            <h3 className="text-xl font-medium text-gray-600 mb-2">Este quiz ainda não tem perguntas</h3>
                                            <p className="text-gray-500 mb-6 max-w-sm mx-auto">Adicione perguntas para que os alunos possam realizar a avaliação.</p>
                                            {isAdmin && (
                                                <Button onClick={handleAddQuestion} size="lg" className="bg-era-green text-black hover:bg-era-green/90 shadow-md">
                                                    <Plus className="h-5 w-5 mr-2"/> Criar Primeira Pergunta
                                                </Button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {questions.map((q, i) => (
                                                <Card key={q.id} className="relative group border border-gray-200 hover:border-era-green transition-all hover:shadow-md">
                                                    <CardContent className="p-5">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex gap-3">
                                                                <Badge className="h-6 w-6 rounded-full flex items-center justify-center p-0 bg-gray-900 text-white">{i+1}</Badge>
                                                                <h4 className="font-bold text-gray-800 text-lg">{q.pergunta}</h4>
                                                            </div>
                                                            {isAdmin && (
                                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <Button size="sm" variant="ghost" onClick={() => handleEditQuestion(q)} title="Editar">
                                                                        <Edit className="h-4 w-4 text-blue-600"/>
                                                                    </Button>
                                                                    <Button size="sm" variant="ghost" onClick={() => handleDeleteQuestion(q.id)} title="Excluir">
                                                                        <Trash className="h-4 w-4 text-red-500"/>
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <ul className="space-y-2 pl-9">
                                                            {q.opcoes.map((opt, idx) => (
                                                                <li key={idx} className={`text-sm p-2 rounded-md border ${idx === q.resposta_correta ? 'bg-green-50 border-green-200 text-green-800 font-medium' : 'bg-white border-gray-100 text-gray-600'}`}>
                                                                    <span className="inline-block w-6 font-mono text-gray-400">{String.fromCharCode(65+idx)}.</span> 
                                                                    {opt} 
                                                                    {idx === q.resposta_correta && <CheckCircle className="inline h-4 w-4 ml-2 text-green-600 align-text-bottom"/>}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                        {q.explicacao && (
                                                            <div className="mt-3 ml-9 p-3 bg-blue-50 rounded-md border border-blue-100 text-sm text-blue-800">
                                                                <span className="font-bold mr-1">Explicação:</span> {q.explicacao}
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

                {/* =======================================================================
                    MODAL DE CRIAÇÃO DE NOVO QUIZ
                   ======================================================================= */}
                {openCreateQuiz && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                        <div className="bg-white p-6 lg:p-8 rounded-2xl w-full max-w-lg shadow-2xl space-y-6">
                            <div className="flex items-center gap-3 border-b pb-4">
                                <div className="p-3 bg-era-green/20 rounded-full">
                                    <FileText className="h-6 w-6 text-era-green" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Criar Novo Quiz</h2>
                                    <p className="text-sm text-gray-500">Configure os detalhes básicos da avaliação</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Título do Quiz</label>
                                    <Input 
                                        placeholder="Ex: Avaliação Final - Módulo 1" 
                                        value={quizTitulo} 
                                        onChange={e => setQuizTitulo(e.target.value)} 
                                        className="h-11"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Curso Vinculado</label>
                                    <Select onValueChange={setSelectedCourseId} value={selectedCourseId}>
                                        <SelectTrigger className="h-11">
                                            <SelectValue placeholder="Selecione o curso..." />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[200px]">
                                            {courses.map(c => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.nome} <span className="text-gray-400 text-xs ml-2">({c.categoria})</span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-gray-500">O quiz herdará automaticamente a categoria do curso.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Descrição (Opcional)</label>
                                    <Textarea 
                                        placeholder="Breve descrição sobre o que será avaliado..." 
                                        value={quizDescricao} 
                                        onChange={e => setQuizDescricao(e.target.value)}
                                        rows={3}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Nota Mínima para Aprovação (%)</label>
                                    <div className="relative">
                                        <Input 
                                            type="number" 
                                            min="0" 
                                            max="100" 
                                            value={quizNotaMinima} 
                                            onChange={e => setQuizNotaMinima(Number(e.target.value))} 
                                            className="h-11 pl-12"
                                        />
                                        <div className="absolute left-4 top-3 text-gray-400 font-bold">%</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button variant="ghost" onClick={() => setOpenCreateQuiz(false)} className="h-11 px-6">
                                    Cancelar
                                </Button>
                                <Button onClick={handleCreateQuiz} disabled={savingQuiz} className="bg-era-green text-black hover:bg-era-green/90 h-11 px-6 font-bold">
                                    {savingQuiz ? <Loader2 className="animate-spin mr-2"/> : <CheckCircle className="mr-2 h-5 w-5"/>}
                                    Criar Quiz
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ERALayout>
    )
}

export default Quizzes