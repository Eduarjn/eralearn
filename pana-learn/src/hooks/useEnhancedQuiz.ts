"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/integrations/supabase/client"

interface QuizQuestion {
    id: string
    pergunta: string
    opcoes: string[]
    resposta_correta: number
    explicacao?: string
    ordem: number
}

interface QuizConfig {
    id: string
    titulo: string
    descricao?: string
    categoria: string
    nota_minima: number
    perguntas: QuizQuestion[]
    mensagem_sucesso: string
    mensagem_reprova: string
}

interface QuizAttempt {
    id: string
    usuario_id: string
    quiz_id: string
    respostas: Record<string, number>
    nota: number
    aprovado: boolean
    tentativa: number
    data_conclusao: string
}

interface CertificateData {
    id: string
    usuario_id: string
    curso_id: string
    curso_nome: string
    nota: number
    data_conclusao: string
    certificado_url?: string
    qr_code_url?: string
}

export function useEnhancedQuiz(userId: string | undefined, courseId: string | undefined) {
    const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isQuizAvailable, setIsQuizAvailable] = useState(false)
    const [userProgress, setUserProgress] = useState<QuizAttempt | null>(null)
    const [certificate, setCertificate] = useState<CertificateData | null>(null)
    const [attempts, setAttempts] = useState<QuizAttempt[]>([])

    const QUIZ_SETTINGS = {
        MAX_QUESTIONS: 20,
        PASS_PERCENTAGE: 80,
        MAX_ATTEMPTS: 3,
        TIME_LIMIT_MINUTES: 30,
    }

    // Verificar se o quiz está disponível para o usuário
    const checkQuizAvailability = useCallback(async () => {
        if (!userId || !courseId) return

        try {
            setIsLoading(true)
            setError(null)

            // Verificar se todos os vídeos do curso foram concluídos
            const { data: videos, error: videosError } = await supabase.from("videos").select("id").eq("curso_id", courseId)

            if (videosError) {
                throw new Error("Erro ao verificar vídeos do curso")
            }

            if (!videos || videos.length === 0) {
                setIsQuizAvailable(false)
                return
            }

            // Verificar progresso dos vídeos
            const videoIds = videos.map((v) => v.id)
            const { data: progress, error: progressError } = await supabase
                .from("video_progress")
                .select("video_id, concluido, percentual_assistido")
                .eq("user_id", userId)
                .in("video_id", videoIds)

            if (progressError) {
                throw new Error("Erro ao verificar progresso dos vídeos")
            }

            // Verificar se todos os vídeos foram concluídos
            const totalVideos = videos.length
            const completedVideos = progress?.filter((p) => p.concluido === true || p.percentual_assistido >= 90).length || 0

            const allVideosCompleted = completedVideos === totalVideos

            if (allVideosCompleted) {
                // Buscar quiz para este curso
                await loadQuizForCourse(courseId)
                setIsQuizAvailable(true)
            } else {
                setIsQuizAvailable(false)
            }
        } catch (err) {
            console.error("Erro ao verificar disponibilidade:", err)
            setError(err instanceof Error ? err.message : "Erro ao verificar disponibilidade do quiz")
        } finally {
            setIsLoading(false)
        }
    }, [userId, courseId])

    // Carregar quiz para o curso
    const loadQuizForCourse = useCallback(
        async (courseId: string) => {
            try {
                // Primeiro, tentar buscar quiz mapeado diretamente
                const { data: mappingData, error: mappingError } = await supabase
                    .from("curso_quiz_mapping")
                    .select("quiz_id")
                    .eq("curso_id", courseId)
                    .maybeSingle()

                let quizId: string | null = null

                if (mappingData?.quiz_id) {
                    quizId = mappingData.quiz_id
                } else {
                    // Fallback: buscar por categoria do curso
                    const { data: courseData, error: courseError } = await supabase
                        .from("cursos")
                        .select("categoria")
                        .eq("id", courseId)
                        .single()

                    if (courseError) throw courseError

                    if (courseData?.categoria) {
                        const { data: quizData, error: quizError } = await supabase
                            .from("quizzes")
                            .select("id")
                            .eq("categoria", courseData.categoria)
                            .eq("ativo", true)
                            .maybeSingle()

                        if (quizError) throw quizError
                        quizId = quizData?.id || null
                    }
                }

                if (quizId) {
                    await loadQuizConfig(quizId)
                    await loadUserAttempts(quizId)
                    await loadCertificate(courseId)
                }
            } catch (err) {
                console.error("Erro ao carregar quiz do curso:", err)
                setError("Erro ao carregar quiz do curso")
            }
        },
        [userId],
    )

    // Carregar configuração do quiz
    const loadQuizConfig = useCallback(async (quizId: string) => {
        try {
            // Buscar dados do quiz
            const { data: quizData, error: quizError } = await supabase.from("quizzes").select("*").eq("id", quizId).single()

            if (quizError) throw quizError

            // Buscar perguntas do quiz (limitado a 20)
            const { data: questionsData, error: questionsError } = await supabase
                .from("quiz_perguntas")
                .select("*")
                .eq("quiz_id", quizId)
                .order("ordem")
                .limit(QUIZ_SETTINGS.MAX_QUESTIONS)

            if (questionsError) throw questionsError

            // Montar configuração do quiz
            const config: QuizConfig = {
                id: quizData.id,
                titulo: quizData.titulo,
                descricao: quizData.descricao,
                categoria: quizData.categoria,
                nota_minima: QUIZ_SETTINGS.PASS_PERCENTAGE, // Forçar 80%
                perguntas: questionsData.map((q) => ({
                    id: q.id,
                    pergunta: q.pergunta,
                    opcoes: q.opcoes,
                    resposta_correta: q.resposta_correta,
                    explicacao: q.explicacao,
                    ordem: q.ordem,
                })),
                mensagem_sucesso: "Parabéns! Você foi aprovado no quiz!",
                mensagem_reprova: "Continue estudando e tente novamente.",
            }

            setQuizConfig(config)
        } catch (err) {
            console.error("Erro ao carregar configuração do quiz:", err)
            setError("Erro ao carregar configuração do quiz")
        }
    }, [])

    // Carregar tentativas do usuário
    const loadUserAttempts = useCallback(
        async (quizId: string) => {
            if (!userId) return

            try {
                const { data: attemptsData, error: attemptsError } = await supabase
                    .from("progresso_quiz")
                    .select("*")
                    .eq("usuario_id", userId)
                    .eq("quiz_id", quizId)
                    .order("data_conclusao", { ascending: false })

                if (attemptsError) throw attemptsError

                setAttempts(attemptsData || [])

                // Definir progresso atual (última tentativa)
                if (attemptsData && attemptsData.length > 0) {
                    setUserProgress(attemptsData[0])
                }
            } catch (err) {
                console.error("Erro ao carregar tentativas:", err)
            }
        },
        [userId],
    )

    // Carregar certificado
    const loadCertificate = useCallback(
        async (courseId: string) => {
            if (!userId) return

            try {
                const { data: certData, error: certError } = await supabase
                    .from("certificados")
                    .select("*")
                    .eq("usuario_id", userId)
                    .eq("curso_id", courseId)
                    .maybeSingle()

                if (certError && certError.code !== "PGRST116") {
                    throw certError
                }

                setCertificate(certData)
            } catch (err) {
                console.error("Erro ao carregar certificado:", err)
            }
        },
        [userId],
    )

    // Submeter respostas do quiz
    const submitQuiz = useCallback(
        async (respostas: Record<string, number>) => {
            if (!userId || !quizConfig || !courseId) return null

            try {
                setIsLoading(true)
                setError(null)

                // Calcular nota
                let acertos = 0
                const totalPerguntas = quizConfig.perguntas.length

                quizConfig.perguntas.forEach((pergunta) => {
                    const respostaUsuario = respostas[pergunta.id]
                    if (respostaUsuario === pergunta.resposta_correta) {
                        acertos++
                    }
                })

                const nota = Math.round((acertos / totalPerguntas) * 100)
                const aprovado = nota >= QUIZ_SETTINGS.PASS_PERCENTAGE
                const tentativaAtual = attempts.length + 1

                // Salvar tentativa do quiz
                const { data: progressData, error: progressError } = await supabase
                    .from("progresso_quiz")
                    .insert({
                        usuario_id: userId,
                        quiz_id: quizConfig.id,
                        respostas: respostas,
                        nota: nota,
                        aprovado: aprovado,
                        tentativa: tentativaAtual,
                        data_conclusao: new Date().toISOString(),
                    })
                    .select()
                    .single()

                if (progressError) throw progressError

                // Se aprovado, gerar certificado
                if (aprovado && courseId) {
                    const { data: certId, error: certError } = await supabase.rpc("gerar_certificado_curso", {
                        p_usuario_id: userId,
                        p_curso_id: courseId,
                        p_quiz_id: quizConfig.id,
                        p_nota: nota,
                    })

                    if (certError) {
                        console.error("Erro ao gerar certificado:", certError)
                    } else {
                        // Recarregar certificado
                        await loadCertificate(courseId)
                    }
                }

                // Atualizar estado local
                setUserProgress(progressData)
                setAttempts((prev) => [progressData, ...prev])

                return { nota, aprovado, acertos, erros: totalPerguntas - acertos }
            } catch (err) {
                console.error("Erro ao submeter quiz:", err)
                setError("Erro ao submeter respostas do quiz")
                return null
            } finally {
                setIsLoading(false)
            }
        },
        [userId, quizConfig, courseId, attempts.length],
    )

    // Verificar disponibilidade periodicamente
    useEffect(() => {
        if (userId && courseId) {
            checkQuizAvailability()
        }
    }, [userId, courseId, checkQuizAvailability])

    return {
        quizConfig,
        isLoading,
        error,
        isQuizAvailable,
        userProgress,
        certificate,
        attempts,
        submitQuiz,
        checkQuizAvailability,
        canRetry: attempts.length < QUIZ_SETTINGS.MAX_ATTEMPTS && (!userProgress || !userProgress.aprovado),
        remainingAttempts: QUIZ_SETTINGS.MAX_ATTEMPTS - attempts.length,
        quizSettings: QUIZ_SETTINGS,
    }
}
