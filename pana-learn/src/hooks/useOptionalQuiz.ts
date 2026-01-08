"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "./useAuth"

export interface OptionalQuizState {
    shouldShowQuiz: boolean
    courseCompleted: boolean
    quizAvailable: boolean
    quizAlreadyCompleted: boolean
}

export function useOptionalQuiz(courseId: string) {
    const { userProfile } = useAuth()
    const [quizState, setQuizState] = useState<OptionalQuizState>({
        shouldShowQuiz: false,
        courseCompleted: false,
        quizAvailable: false,
        quizAlreadyCompleted: false,
    })
    const [loading, setLoading] = useState(false)
    const [lastCheckTime, setLastCheckTime] = useState<number>(Date.now())

    // Verificar se curso foi concluído e se quiz já foi completado
    const checkCourseCompletion = useCallback(async () => {
        if (!courseId || !userProfile?.id) return

        try {
            setLoading(true)

            // Buscar vídeos do curso
            const { data: videos, error: videosError } = await supabase.from("videos").select("id").eq("curso_id", courseId)

            if (videosError || !videos || videos.length === 0) {
                console.log("Nenhum vídeo encontrado para o curso:", courseId)
                setQuizState((prev) => ({ ...prev, quizAvailable: false }))
                return
            }

            // Buscar progresso dos vídeos
            const videoIds = videos.map((v) => v.id)
            const { data: progress, error: progressError } = await supabase
                .from("video_progress")
                .select("video_id, concluido, percentual_assistido")
                .eq("user_id", userProfile.id)
                .in("video_id", videoIds)

            if (progressError) {
                console.error("Erro ao verificar progresso:", progressError)
                return
            }

            // Verificar se todos os vídeos foram concluídos
            const totalVideos = videos.length
            const completedVideos = progress?.filter((p) => p.concluido)?.length || 0
            const courseCompleted = completedVideos === totalVideos && totalVideos > 0

            console.log("Verificação de conclusão:", { totalVideos, completedVideos, courseCompleted })

            let quizAvailable = false
            let quizAlreadyCompleted = false
            let quizId: string | null = null

            // Method 1: Try course-specific mapping
            try {
                const { data: mappingData } = await supabase
                    .from("curso_quiz_mapping")
                    .select("quiz_id")
                    .eq("curso_id", courseId)
                    .maybeSingle()

                if (mappingData?.quiz_id) {
                    const { data: quizData } = await supabase
                        .from("quizzes")
                        .select("id")
                        .eq("id", mappingData.quiz_id)
                        .eq("ativo", true)
                        .maybeSingle()

                    if (quizData) {
                        quizAvailable = true
                        quizId = quizData.id
                    }
                }
            } catch (error) {
                console.log("Método 1 falhou, tentando método 2...")
            }

            // Method 2: Try by course category
            if (!quizAvailable) {
                try {
                    const { data: courseData } = await supabase
                        .from("cursos")
                        .select("categoria, nome")
                        .eq("id", courseId)
                        .maybeSingle()

                    if (courseData?.categoria) {
                        const { data: quizData } = await supabase
                            .from("quizzes")
                            .select("id")
                            .eq("categoria", courseData.categoria)
                            .eq("ativo", true)
                            .maybeSingle()

                        if (quizData) {
                            quizAvailable = true
                            quizId = quizData.id
                        }
                    }
                } catch (error) {
                    console.log("Método 2 falhou, tentando método 3...")
                }
            }

            // Method 3: Try by course name
            if (!quizAvailable) {
                try {
                    const { data: courseData } = await supabase.from("cursos").select("nome").eq("id", courseId).maybeSingle()

                    if (courseData?.nome) {
                        const { data: quizData } = await supabase
                            .from("quizzes")
                            .select("id")
                            .ilike("titulo", `%${courseData.nome}%`)
                            .eq("ativo", true)
                            .maybeSingle()

                        if (quizData) {
                            quizAvailable = true
                            quizId = quizData.id
                        }
                    }
                } catch (error) {
                    console.log("Método 3 falhou, quiz não disponível")
                }
            }

            // Verificar se o usuário já completou o quiz para este curso
            if (quizId) {
                try {
                    const { data: quizProgress } = await supabase
                        .from("progresso_quiz")
                        .select("id, aprovado")
                        .eq("usuario_id", userProfile.id)
                        .eq("quiz_id", quizId)
                        .maybeSingle()

                    quizAlreadyCompleted = !!quizProgress
                } catch (error) {
                    console.log("Erro ao verificar progresso do quiz:", error)
                }
            }

            // Verificar se já existe certificado para este curso
            let existingCertificate = false
            try {
                const { data: certData } = await supabase
                    .from("certificados")
                    .select("id")
                    .eq("usuario_id", userProfile.id)
                    .eq("curso_id", courseId)
                    .maybeSingle()

                existingCertificate = !!certData
            } catch (error) {
                console.log("Erro ao verificar certificado:", error)
            }

            const shouldShowQuiz = courseCompleted && quizAvailable && !quizAlreadyCompleted && !existingCertificate

            console.log("Verificação de Quiz:", {
                courseCompleted,
                quizAvailable,
                quizAlreadyCompleted,
                hasCertificate: existingCertificate,
                shouldShowQuiz,
            })

            setQuizState({
                shouldShowQuiz,
                courseCompleted,
                quizAvailable,
                quizAlreadyCompleted,
            })
        } catch (error) {
            console.error("Erro ao verificar conclusão do curso:", error)
        } finally {
            setLoading(false)
        }
    }, [courseId, userProfile?.id])

    useEffect(() => {
        checkCourseCompletion()
    }, [checkCourseCompletion])

    // Realtime subscription para mudanças no progresso dos vídeos
    useEffect(() => {
        if (!courseId || !userProfile?.id) return

        const channel = supabase
            .channel(`video-progress-${courseId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "video_progress",
                    filter: `user_id=eq.${userProfile.id}`,
                },
                (payload) => {
                    console.log("📡 Realtime: Video progress changed", payload)
                    setLastCheckTime(Date.now())
                    setTimeout(() => {
                        checkCourseCompletion()
                    }, 1000)
                },
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [courseId, userProfile?.id, checkCourseCompletion])

    useEffect(() => {
        const interval = setInterval(() => {
            const timeSinceLastCheck = Date.now() - lastCheckTime
            if (timeSinceLastCheck < 30000) {
                checkCourseCompletion()
            }
        }, 10000)

        return () => clearInterval(interval)
    }, [lastCheckTime, checkCourseCompletion])

    return {
        quizState,
        loading,
        checkCourseCompletion,
        lastCheckTime,
    }
}
