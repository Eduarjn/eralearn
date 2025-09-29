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

interface RetryState {
    canRetry: boolean
    nextRetryTime: Date | null
    attemptsCount: number
    maxAttempts: number
}

export function useQuiz(userId: string | undefined, courseId: string | undefined) {
    const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isQuizAvailable, setIsQuizAvailable] = useState(false)
    const [userProgress, setUserProgress] = useState<any>(null)
    const [certificate, setCertificate] = useState<CertificateData | null>(null)
    const [retryState, setRetryState] = useState<RetryState>({
        canRetry: true,
        nextRetryTime: null,
        attemptsCount: 0,
        maxAttempts: 3,
    })

    const checkQuizAvailability = useCallback(async () => {
        if (!userId || !courseId) {
            console.log("Missing userId or courseId for quiz check")
            setIsLoading(false)
            return
        }

        try {
            setIsLoading(true)
            setError(null)
            console.log("🎯 Checking quiz availability for:", { userId, courseId })

            // First check if all videos are completed
            const { data: videos, error: videosError } = await supabase.from("videos").select("id").eq("curso_id", courseId)

            if (videosError) {
                console.error("Error fetching videos:", videosError)
                setError("Erro ao verificar vídeos do curso")
                setIsLoading(false)
                return
            }

            if (!videos || videos.length === 0) {
                console.log("No videos found for course")
                setIsQuizAvailable(false)
                setIsLoading(false)
                return
            }

            // Check video completion
            const videoIds = videos.map((v) => v.id)
            const { data: progressData, error: progressError } = await supabase
                .from("video_progress")
                .select("video_id, concluido, percentual_assistido")
                .eq("user_id", userId)
                .in("video_id", videoIds)

            if (progressError) {
                console.error("Error checking video progress:", progressError)
                setError("Erro ao verificar progresso dos vídeos")
                setIsLoading(false)
                return
            }

            const completedVideos =
                progressData?.filter((p) => p.concluido === true || (p.percentual_assistido && p.percentual_assistido >= 90))
                    .length || 0

            const allVideosCompleted = completedVideos === videos.length
            console.log("🎯 Video completion check:", {
                completedVideos,
                totalVideos: videos.length,
                allCompleted: allVideosCompleted,
            })

            if (!allVideosCompleted) {
                console.log("Not all videos completed, quiz not available")
                setIsQuizAvailable(false)
                setError(`Complete todos os vídeos primeiro. Progresso: ${completedVideos}/${videos.length} vídeos concluídos.`)
                setIsLoading(false)
                return
            }

            let quizId: string | null = null
            let quizFound = false

            // Method 1: Direct course mapping
            try {
                console.log("🎯 Method 1: Checking direct course mapping...")
                const { data: mappingData, error: mappingError } = await supabase
                    .from("curso_quiz_mapping")
                    .select("quiz_id")
                    .eq("curso_id", courseId)
                    .maybeSingle()

                if (mappingError) {
                    console.log("Mapping table error:", mappingError)
                } else if (mappingData?.quiz_id) {
                    const { data: quizData, error: quizError } = await supabase
                        .from("quizzes")
                        .select("id, ativo, titulo")
                        .eq("id", mappingData.quiz_id)
                        .eq("ativo", true)
                        .maybeSingle()

                    if (quizError) {
                        console.log("Quiz validation error:", quizError)
                    } else if (quizData) {
                        quizId = quizData.id
                        quizFound = true
                        console.log("🎯 Found quiz via direct mapping:", { id: quizId, title: quizData.titulo })
                    }
                }
            } catch (error) {
                console.log("Method 1 failed:", error)
            }

            // Method 2: By course category
            if (!quizFound) {
                try {
                    console.log("🎯 Method 2: Checking by course category...")
                    const { data: courseData, error: courseError } = await supabase
                        .from("cursos")
                        .select("categoria, nome")
                        .eq("id", courseId)
                        .maybeSingle()

                    if (courseError) {
                        console.log("Course data error:", courseError)
                    } else if (courseData?.categoria) {
                        console.log("Course category:", courseData.categoria)

                        const { data: quizData, error: quizError } = await supabase
                            .from("quizzes")
                            .select("id, ativo, titulo, categoria")
                            .eq("categoria", courseData.categoria)
                            .eq("ativo", true)
                            .maybeSingle()

                        if (quizError) {
                            console.log("Category quiz error:", quizError)
                        } else if (quizData) {
                            quizId = quizData.id
                            quizFound = true
                            console.log("🎯 Found quiz via category:", {
                                id: quizId,
                                title: quizData.titulo,
                                category: quizData.categoria,
                            })
                        }
                    }
                } catch (error) {
                    console.log("Method 2 failed:", error)
                }
            }

            // Method 3: By course name similarity
            if (!quizFound) {
                try {
                    console.log("🎯 Method 3: Checking by course name similarity...")
                    const { data: courseData, error: courseError } = await supabase
                        .from("cursos")
                        .select("nome")
                        .eq("id", courseId)
                        .maybeSingle()

                    if (courseError) {
                        console.log("Course name error:", courseError)
                    } else if (courseData?.nome) {
                        console.log("Course name:", courseData.nome)

                        // Try exact match first
                        const { data: exactQuizData, error: exactError } = await supabase
                            .from("quizzes")
                            .select("id, ativo, titulo")
                            .ilike("titulo", `%${courseData.nome}%`)
                            .eq("ativo", true)
                            .maybeSingle()

                        if (exactError) {
                            console.log("Exact name match error:", exactError)
                        } else if (exactQuizData) {
                            quizId = exactQuizData.id
                            quizFound = true
                            console.log("🎯 Found quiz via name similarity:", { id: quizId, title: exactQuizData.titulo })
                        }
                    }
                } catch (error) {
                    console.log("Method 3 failed:", error)
                }
            }

            // Method 4: Generic fallback - get any active quiz
            if (!quizFound) {
                try {
                    console.log("🎯 Method 4: Using fallback - any active quiz...")
                    const { data: quizData, error: quizError } = await supabase
                        .from("quizzes")
                        .select("id, ativo, titulo")
                        .eq("ativo", true)
                        .limit(1)
                        .maybeSingle()

                    if (quizError) {
                        console.log("Fallback quiz error:", quizError)
                    } else if (quizData) {
                        quizId = quizData.id
                        quizFound = true
                        console.log("🎯 Found quiz via fallback method:", { id: quizId, title: quizData.titulo })
                    }
                } catch (error) {
                    console.log("Method 4 failed:", error)
                }
            }

            if (quizFound && quizId) {
                console.log("🎯 Quiz found, loading configuration...")
                await loadQuizConfig(quizId)
                setIsQuizAvailable(true)
                console.log("🎯 Quiz is available!")
            } else {
                console.log("🎯 No quiz found for this course")
                setIsQuizAvailable(false)
                setError("Nenhum quiz encontrado para este curso. Entre em contato com o administrador.")
            }
        } catch (err) {
            console.error("Error checking quiz availability:", err)
            setError("Erro ao verificar disponibilidade do quiz")
        } finally {
            setIsLoading(false)
        }
    }, [userId, courseId])

    const loadQuizConfig = useCallback(
        async (quizId: string) => {
            try {
                console.log("🎯 Loading quiz config for:", quizId)

                // Buscar dados do quiz
                const { data: quizData, error: quizError } = await supabase
                    .from("quizzes")
                    .select("*")
                    .eq("id", quizId)
                    .single()

                if (quizError) {
                    console.error("Error loading quiz:", quizError)
                    throw new Error(`Erro ao carregar quiz: ${quizError.message}`)
                }

                console.log("🎯 Quiz data loaded:", quizData)

                // Buscar perguntas do quiz
                const { data: questionsData, error: questionsError } = await supabase
                    .from("quiz_perguntas")
                    .select("*")
                    .eq("quiz_id", quizId)
                    .order("ordem")

                if (questionsError) {
                    console.error("Error loading questions:", questionsError)
                    throw new Error(`Erro ao carregar perguntas: ${questionsError.message}`)
                }

                console.log("🎯 Questions loaded:", questionsData?.length || 0, "questions")

                if (!questionsData || questionsData.length === 0) {
                    throw new Error("Nenhuma pergunta encontrada para este quiz. Entre em contato com o administrador.")
                }

                const validQuestions = questionsData.filter((q) => {
                    if (!q.pergunta || !q.opcoes || !Array.isArray(q.opcoes) || q.opcoes.length < 2) {
                        console.warn("Invalid question format:", q)
                        return false
                    }
                    return true
                })

                if (validQuestions.length === 0) {
                    throw new Error("Nenhuma pergunta válida encontrada para este quiz.")
                }

                if (validQuestions.length !== questionsData.length) {
                    console.warn(`${questionsData.length - validQuestions.length} perguntas inválidas foram filtradas`)
                }

                // Buscar progresso do usuário (se existir)
                let progressData = null
                try {
                    const { data: progressResult, error: progressError } = await supabase
                        .from("progresso_quiz")
                        .select("*")
                        .eq("usuario_id", userId)
                        .eq("quiz_id", quizId)
                        .maybeSingle()

                    if (progressError) {
                        console.error("Error fetching progress:", progressError)
                    } else {
                        progressData = progressResult
                        console.log("🎯 User progress:", progressData)
                    }
                } catch (progressErr) {
                    console.error("Error fetching quiz progress:", progressErr)
                }

                // Buscar certificado (se existir)
                let certData = null
                try {
                    const { data: certResult, error: certError } = await supabase
                        .from("certificados")
                        .select("*")
                        .eq("usuario_id", userId)
                        .eq("curso_id", courseId)
                        .maybeSingle()

                    if (certError) {
                        console.error("Error fetching certificate:", certError)
                    } else {
                        certData = certResult
                        console.log("🎯 Certificate:", certData)
                    }
                } catch (certErr) {
                    console.error("Error fetching certificate:", certErr)
                }

                // Montar configuração do quiz
                const config: QuizConfig = {
                    id: quizData.id,
                    titulo: quizData.titulo || "Quiz do Curso",
                    descricao: quizData.descricao || "Avalie seus conhecimentos sobre o curso",
                    categoria: quizData.categoria || "Geral",
                    nota_minima: quizData.nota_minima || 70,
                    perguntas: validQuestions.map((q) => ({
                        id: q.id,
                        pergunta: q.pergunta,
                        opcoes: Array.isArray(q.opcoes) ? q.opcoes : [],
                        resposta_correta: q.resposta_correta || 0,
                        explicacao: q.explicacao,
                        ordem: q.ordem || 0,
                    })),
                    mensagem_sucesso: "Parabéns! Você concluiu o curso com sucesso!",
                    mensagem_reprova: "Continue estudando e tente novamente.",
                }

                setQuizConfig(config)
                setUserProgress(progressData)
                setCertificate(certData)
                console.log("🎯 Quiz config set successfully with", config.perguntas.length, "questions")
            } catch (err) {
                console.error("Error loading quiz config:", err)
                const errorMessage = err instanceof Error ? err.message : "Erro ao carregar configuração do quiz"
                setError(errorMessage)
                setQuizConfig(null)
            }
        },
        [userId, courseId],
    )

    const checkRetryCooldown = useCallback(async () => {
        if (!userId || !quizConfig?.id) return

        try {
            const { data: attempts, error } = await supabase
                .from("progresso_quiz")
                .select("data_conclusao, aprovado")
                .eq("usuario_id", userId)
                .eq("quiz_id", quizConfig.id)
                .order("data_conclusao", { ascending: false })

            if (error) {
                console.error("Error checking retry attempts:", error)
                return
            }

            const failedAttempts = attempts?.filter((a) => !a.aprovado) || []
            const attemptsCount = failedAttempts.length

            if (attemptsCount > 0) {
                const lastFailedAttempt = failedAttempts[0]
                const lastAttemptTime = new Date(lastFailedAttempt.data_conclusao)
                const cooldownTime = new Date(lastAttemptTime.getTime() + 30 * 60 * 1000) // 30 minutes
                const now = new Date()

                const canRetry = now >= cooldownTime || attemptsCount < retryState.maxAttempts

                setRetryState({
                    canRetry,
                    nextRetryTime: canRetry ? null : cooldownTime,
                    attemptsCount,
                    maxAttempts: retryState.maxAttempts,
                })
            }
        } catch (err) {
            console.error("Error checking retry cooldown:", err)
        }
    }, [userId, quizConfig?.id, retryState.maxAttempts])

    // Submeter respostas do quiz
    const submitQuiz = useCallback(
        async (respostas: Record<string, number>) => {
            if (!userId || !quizConfig) {
                console.error("Missing userId or quizConfig for quiz submission")
                return null
            }

            if (!retryState.canRetry && retryState.nextRetryTime) {
                const timeRemaining = Math.ceil((retryState.nextRetryTime.getTime() - new Date().getTime()) / (1000 * 60))
                setError(`Você deve aguardar ${timeRemaining} minutos antes de tentar novamente.`)
                return null
            }

            try {
                setIsLoading(true)
                setError(null)
                console.log("🎯 Submitting quiz with answers:", respostas)

                const answeredQuestions = Object.keys(respostas).length
                const totalQuestions = quizConfig.perguntas.length

                if (answeredQuestions !== totalQuestions) {
                    throw new Error(`Responda todas as perguntas. ${answeredQuestions}/${totalQuestions} respondidas.`)
                }

                // Calcular nota
                let acertos = 0

                quizConfig.perguntas.forEach((pergunta) => {
                    const respostaUsuario = respostas[pergunta.id]
                    if (respostaUsuario === pergunta.resposta_correta) {
                        acertos++
                    }
                })

                const nota = Math.round((acertos / totalQuestions) * 100)
                const aprovado = nota >= quizConfig.nota_minima

                console.log("🎯 Quiz results:", { acertos, totalQuestions, nota, aprovado, notaMinima: quizConfig.nota_minima })

                // Salvar progresso do quiz with proper conflict resolution
                const { error: progressError } = await supabase.from("progresso_quiz").upsert(
                    {
                        usuario_id: userId,
                        quiz_id: quizConfig.id,
                        respostas: respostas,
                        nota: nota,
                        aprovado: aprovado,
                        data_conclusao: new Date().toISOString(),
                    },
                    {
                        onConflict: "usuario_id,quiz_id",
                    },
                )

                if (progressError) {
                    console.error("Error saving quiz progress:", progressError)
                    throw new Error(`Erro ao salvar progresso: ${progressError.message}`)
                }

                if (!aprovado) {
                    const newAttemptsCount = retryState.attemptsCount + 1
                    const cooldownTime = new Date(new Date().getTime() + 30 * 60 * 1000) // 30 minutes from now

                    setRetryState({
                        canRetry: newAttemptsCount < retryState.maxAttempts,
                        nextRetryTime: newAttemptsCount < retryState.maxAttempts ? cooldownTime : null,
                        attemptsCount: newAttemptsCount,
                        maxAttempts: retryState.maxAttempts,
                    })
                }

                // Se aprovado, gerar certificado
                if (aprovado && courseId) {
                    console.log("🎯 User approved, generating certificate...")
                    try {
                        const { data: certId, error: certError } = await supabase.rpc("gerar_certificado_curso", {
                            p_usuario_id: userId,
                            p_curso_id: courseId,
                            p_quiz_id: quizConfig.id,
                            p_nota: nota,
                        })

                        if (certError) {
                            console.error("Error generating certificate:", certError)
                        } else if (certId) {
                            // Buscar certificado gerado
                            const { data: certData, error: fetchCertError } = await supabase
                                .from("certificados")
                                .select("*")
                                .eq("id", certId)
                                .maybeSingle()

                            if (fetchCertError) {
                                console.error("Error fetching generated certificate:", fetchCertError)
                            } else {
                                setCertificate(certData)
                                console.log("🎯 Certificate generated successfully")
                            }
                        }
                    } catch (certErr) {
                        console.error("Certificate generation failed:", certErr)
                    }
                }

                // Atualizar progresso local
                const newProgress = {
                    usuario_id: userId,
                    quiz_id: quizConfig.id,
                    respostas: respostas,
                    nota: nota,
                    aprovado: aprovado,
                    data_conclusao: new Date().toISOString(),
                }

                setUserProgress(newProgress)
                console.log("🎯 Quiz submitted successfully")

                return { nota, aprovado }
            } catch (err) {
                console.error("Error submitting quiz:", err)
                const errorMessage = err instanceof Error ? err.message : "Erro ao submeter respostas do quiz"
                setError(errorMessage)
                return null
            } finally {
                setIsLoading(false)
            }
        },
        [userId, quizConfig, courseId, retryState],
    )

    const resetQuizForRetry = useCallback(() => {
        setError(null)
        setUserProgress(null)
        // Check cooldown when resetting
        checkRetryCooldown()
    }, [checkRetryCooldown])

    useEffect(() => {
        if (userId && courseId) {
            console.log("🎯 Auto-checking quiz availability...")
            checkQuizAvailability()
        }
    }, [userId, courseId, checkQuizAvailability])

    useEffect(() => {
        if (quizConfig && userId) {
            checkRetryCooldown()
        }
    }, [quizConfig, userId, checkRetryCooldown])

    return {
        quizConfig,
        isLoading,
        error,
        isQuizAvailable,
        userProgress,
        certificate,
        submitQuiz,
        checkQuizAvailability,
        retryState,
        resetQuizForRetry,
        checkRetryCooldown,
    }
}
