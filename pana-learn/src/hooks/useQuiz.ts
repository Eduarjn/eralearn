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

export function useQuiz(userId: string | undefined, courseId: string | undefined) {
    const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isQuizAvailable, setIsQuizAvailable] = useState(false)
    const [userProgress, setUserProgress] = useState<any>(null)
    const [certificate, setCertificate] = useState<CertificateData | null>(null)

    const checkQuizAvailability = useCallback(async () => {
        if (!userId || !courseId) {
            console.log("Missing userId or courseId for quiz check")
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
                return
            }

            if (!videos || videos.length === 0) {
                console.log("No videos found for course")
                setIsQuizAvailable(false)
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
                return
            }

            // Try multiple methods to find quiz
            let quizId: string | null = null

            // Method 1: Direct course mapping
            try {
                const { data: mappingData } = await supabase
                    .from("curso_quiz_mapping")
                    .select("quiz_id")
                    .eq("curso_id", courseId)
                    .maybeSingle()

                if (mappingData?.quiz_id) {
                    const { data: quizData } = await supabase
                        .from("quizzes")
                        .select("id, ativo")
                        .eq("id", mappingData.quiz_id)
                        .eq("ativo", true)
                        .maybeSingle()

                    if (quizData) {
                        quizId = quizData.id
                        console.log("🎯 Found quiz via direct mapping:", quizId)
                    }
                }
            } catch (error) {
                console.log("Method 1 failed, trying method 2...")
            }

            // Method 2: By course category
            if (!quizId) {
                try {
                    const { data: courseData } = await supabase
                        .from("cursos")
                        .select("categoria, nome")
                        .eq("id", courseId)
                        .maybeSingle()

                    if (courseData?.categoria) {
                        const { data: quizData } = await supabase
                            .from("quizzes")
                            .select("id, ativo")
                            .eq("categoria", courseData.categoria)
                            .eq("ativo", true)
                            .maybeSingle()

                        if (quizData) {
                            quizId = quizData.id
                            console.log("🎯 Found quiz via category:", quizId)
                        }
                    }
                } catch (error) {
                    console.log("Method 2 failed, trying method 3...")
                }
            }

            // Method 3: By course name similarity
            if (!quizId) {
                try {
                    const { data: courseData } = await supabase.from("cursos").select("nome").eq("id", courseId).maybeSingle()

                    if (courseData?.nome) {
                        const { data: quizData } = await supabase
                            .from("quizzes")
                            .select("id, ativo")
                            .ilike("titulo", `%${courseData.nome}%`)
                            .eq("ativo", true)
                            .maybeSingle()

                        if (quizData) {
                            quizId = quizData.id
                            console.log("🎯 Found quiz via name similarity:", quizId)
                        }
                    }
                } catch (error) {
                    console.log("Method 3 failed, trying method 4...")
                }
            }

            // Method 4: Generic fallback - get any active quiz
            if (!quizId) {
                try {
                    const { data: quizData } = await supabase
                        .from("quizzes")
                        .select("id, ativo")
                        .eq("ativo", true)
                        .limit(1)
                        .maybeSingle()

                    if (quizData) {
                        quizId = quizData.id
                        console.log("🎯 Found quiz via fallback method:", quizId)
                    }
                } catch (error) {
                    console.log("All methods failed to find quiz")
                }
            }

            if (quizId) {
                await loadQuizConfig(quizId)
                setIsQuizAvailable(true)
                console.log("🎯 Quiz is available!")
            } else {
                console.log("🎯 No quiz found for this course")
                setIsQuizAvailable(false)
                setError("Nenhum quiz encontrado para este curso")
            }
        } catch (err) {
            console.error("Error checking quiz availability:", err)
            setError("Erro ao verificar disponibilidade do quiz")
        } finally {
            setIsLoading(false)
        }
    }, [userId, courseId])

    // Carregar configuração do quiz
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
                    throw quizError
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
                    throw questionsError
                }

                console.log("🎯 Questions loaded:", questionsData?.length || 0, "questions")

                if (!questionsData || questionsData.length === 0) {
                    throw new Error("Nenhuma pergunta encontrada para este quiz")
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
                    titulo: quizData.titulo,
                    descricao: quizData.descricao,
                    categoria: quizData.categoria,
                    nota_minima: quizData.nota_minima || 70,
                    perguntas: questionsData.map((q) => ({
                        id: q.id,
                        pergunta: q.pergunta,
                        opcoes: q.opcoes,
                        resposta_correta: q.resposta_correta,
                        explicacao: q.explicacao,
                        ordem: q.ordem,
                    })),
                    mensagem_sucesso: "Parabéns! Você concluiu o curso com sucesso!",
                    mensagem_reprova: "Continue estudando e tente novamente.",
                }

                setQuizConfig(config)
                setUserProgress(progressData)
                setCertificate(certData)
                console.log("🎯 Quiz config set successfully")
            } catch (err) {
                console.error("Error loading quiz config:", err)
                setError(err instanceof Error ? err.message : "Erro ao carregar configuração do quiz")
            }
        },
        [userId, courseId],
    )

    // Submeter respostas do quiz
    const submitQuiz = useCallback(
        async (respostas: Record<string, number>) => {
            if (!userId || !quizConfig) {
                console.error("Missing userId or quizConfig for quiz submission")
                return null
            }

            try {
                setIsLoading(true)
                setError(null)
                console.log("🎯 Submitting quiz with answers:", respostas)

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
                const aprovado = nota >= quizConfig.nota_minima

                console.log("🎯 Quiz results:", { acertos, totalPerguntas, nota, aprovado })

                // Salvar progresso do quiz
                const { error: progressError } = await supabase.from("progresso_quiz").upsert({
                    usuario_id: userId,
                    quiz_id: quizConfig.id,
                    respostas: respostas,
                    nota: nota,
                    aprovado: aprovado,
                    data_conclusao: new Date().toISOString(),
                })

                if (progressError) {
                    console.error("Error saving quiz progress:", progressError)
                    throw progressError
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
                setError(err instanceof Error ? err.message : "Erro ao submeter respostas do quiz")
                return null
            } finally {
                setIsLoading(false)
            }
        },
        [userId, quizConfig, courseId],
    )

    useEffect(() => {
        if (userId && courseId) {
            console.log("🎯 Auto-checking quiz availability...")
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
        submitQuiz,
        checkQuizAvailability,
    }
}
