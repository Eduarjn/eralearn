"use client"

import React, { useState, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useCourseModules, useCourses } from "@/hooks/useCourses"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/integrations/supabase/client"
import type { Module, Course } from "@/hooks/useCourses"
import type { Database } from "@/integrations/supabase/types"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle, Play, Clock, PlusCircle, Video, FileText, Award, BookOpen, Lock } from "lucide-react"
import { VideoPlayerWithProgress } from "@/components/VideoPlayerWithProgress"
import { Progress } from "@/components/ui/progress"
import CommentsSection from "@/components/CommentsSection"
import { useOptionalQuiz } from "@/hooks/useOptionalQuiz"
import { useCertificates } from "@/hooks/useCertificates"
import { useToast } from "@/components/ui/use-toast"
import VideoUpload from "@/components/VideoUpload"
import { VideoInfo } from "@/components/VideoInfo"
import { EnhancedQuizModal } from "@/components/EnhancedQuizModal"
import { QuizCompletionNotification } from "@/components/QuizCompletionNotification"
import { useEnhancedQuiz } from "@/hooks/useEnhancedQuiz"
import { GlossaryModule } from "@/components/GlossaryModule"

type VideoWithModulo = Database["public"]["Tables"]["videos"]["Row"] & {
    modulo_id?: string
    categoria?: string
}

type VideoProgressRow = Database["public"]["Tables"]["video_progress"]["Row"]

const ModuleEditForm = ({ modulo, onSaved }: { modulo: Module; onSaved: () => void }) => {
    const [link, setLink] = React.useState(modulo.link_video || "")
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState("")

    const handleSave = async () => {
        setLoading(true)
        setError("")
        const { error } = await supabase.from("modulos").update({ link_video: link }).eq("id", modulo.id)
        setLoading(false)
        if (error) {
            setError("Erro ao salvar")
        } else {
            onSaved()
        }
    }

    return (
        <div className="p-2 border rounded mb-2 bg-gray-50">
            <label className="block mb-1 font-semibold">Link do vídeo</label>
            <input
                className="border px-2 py-1 w-full mb-2"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://youtu.be/..."
            />
            <button
                className="bg-era-green text-era-black px-3 py-1 rounded font-bold"
                onClick={handleSave}
                disabled={loading}
            >
                {loading ? "Salvando..." : "Salvar"}
            </button>
            {error && <div className="text-red-50 mt-2">{error}</div>}
        </div>
    )
}

function getVideoUrl(item: Module | { url_video?: string; link_video?: string }) {
    if ("link_video" in item && item.link_video) return item.link_video
    if ("url_video" in item && item.url_video) return item.url_video
    return ""
}

function getModuleTitle(item: Module | { titulo?: string; nome_modulo?: string }) {
    if ("nome_modulo" in item && item.nome_modulo) return item.nome_modulo
    if ("titulo" in item && item.titulo) return item.titulo
    return ""
}

const CursoDetalhe = () => {
    const { toast } = useToast()
    const { id } = useParams()
    const { userProfile } = useAuth()
    const isAdmin = userProfile?.tipo_usuario === "admin" || userProfile?.tipo_usuario === "admin_master"
    const userId = userProfile?.id
    const navigate = useNavigate()

    if (process.env.NODE_ENV === "development") {
        console.log("🎯 CursoDetalhe - Componente carregado")
        console.log("🎯 CursoDetalhe - ID recebido:", id)
        console.log("🎯 CursoDetalhe - IsAdmin:", isAdmin)
    }

    const [videos, setVideos] = React.useState<VideoWithModulo[]>([])
    const [progress, setProgress] = React.useState<Record<string, Partial<VideoProgressRow>>>({})

    const [loading, setLoading] = useState(true)
    const [selectedVideo, setSelectedVideo] = React.useState<VideoWithModulo | null>(null)
    const [isChangingVideo, setIsChangingVideo] = React.useState(false) // NOVO: Trava de transição de vídeo
    const [selectedModule, setSelectedModule] = React.useState<Module | null>(null)
    const [showUploadModal, setShowUploadModal] = React.useState(false)
    const [showQuizNotification, setShowQuizNotification] = React.useState(false)
    const [showQuizModal, setShowQuizModal] = React.useState(false)
    const [refresh, setRefresh] = React.useState(0)
    const [progressRefresh, setProgressRefresh] = React.useState(0)
    const [hasShownIntroduction, setHasShownIntroduction] = React.useState(false)
    const [manualQuizCheck, setManualQuizCheck] = React.useState(false)

    // 🎓 ADMIN - CONFIGURAÇÃO DE QUIZ DO CURSO
    const [linkedQuiz, setLinkedQuiz] = React.useState<any>(null)
    const [allQuizzes, setAllQuizzes] = React.useState<any[]>([])
    const [selectedQuizId, setSelectedQuizId] = React.useState("")
    const [loadingQuizConfig, setLoadingQuizConfig] = React.useState(true)

    const [editingModuleId, setEditingModuleId] = React.useState<string | null>(null)
    const [editTitle, setEditTitle] = React.useState("")
    const [editDesc, setEditDesc] = React.useState("")
    const [currentCourse, setCurrentCourse] = React.useState<Course | null>(null)
    const [totalVideos, setTotalVideos] = React.useState(0)
    const [completedVideos, setCompletedVideos] = React.useState(0)
    const [quizCompleted, setQuizCompleted] = React.useState(false)
    const [quizShown, setQuizShown] = React.useState(false)
    const [showVideoUpload, setShowVideoUpload] = React.useState(false)
    const { data: allCourses = [] } = useCourses()
    const currentCourseData = allCourses.find((c) => c.id === id)
    const currentCategory = currentCourseData?.categoria
    const { data: modules = [] } = useCourseModules(id || "")

    const { quizState, loading: quizLoading, checkCourseCompletion, lastCheckTime } = useOptionalQuiz(id || "")

    const {
        quizConfig,
        certificate,
        isQuizAvailable,
        userProgress,
        canRetry,
        remainingAttempts,
        quizSettings,
        checkQuizAvailability,
    } = useEnhancedQuiz(userId, id)

    const { generateCertificate, getCertificateByCourse } = useCertificates(userId)

    // Revalidar quiz quando houver mudanças no progresso
    React.useEffect(() => {
        if (lastCheckTime && quizState.courseCompleted && !quizState.quizAlreadyCompleted) {
            console.log("🔄 Course completed, showing quiz notification")
            setShowQuizNotification(true)
        }
    }, [lastCheckTime, quizState.courseCompleted, quizState.quizAlreadyCompleted])

    const [glossaryCompleted, setGlossaryCompleted] = React.useState(false)
    const [checkingGlossary, setCheckingGlossary] = React.useState(true)

    // Check if this is an NVIDIA course that requires glossary first
    const isNVIDIACourse =
        currentCourseData?.nome?.toLowerCase().includes("nvidia") ||
        currentCourseData?.nome?.toLowerCase().includes("rdma") ||
        currentCourseData?.categoria?.toLowerCase().includes("nvidia")

    const checkGlossaryCompletion = async () => {
        if (!userId || !id || !isNVIDIACourse) {
            setGlossaryCompleted(true)
            setCheckingGlossary(false)
            return
        }

        try {
            const { data, error } = await supabase
                .from("video_progress")
                .select("concluido")
                .eq("user_id", userId)
                .eq("video_id", `glossary-${id}`)
                .eq("concluido", true)
                .maybeSingle()

            if (error && error.code !== "PGRST116") {
                console.error("Error checking glossary completion:", error)
            }

            setGlossaryCompleted(!!data)
        } catch (error) {
            console.error("Error checking glossary:", error)
            setGlossaryCompleted(false)
        } finally {
            setCheckingGlossary(false)
        }
    }

    React.useEffect(() => {
        if (userId && id) {
            checkGlossaryCompletion()
        }
    }, [userId, id, isNVIDIACourse])

    const handleGlossaryComplete = () => {
        setGlossaryCompleted(true)
        setTimeout(() => {
            fetchVideosAndProgress()
        }, 1000)
    }

    const calculateCourseProgress = useCallback(async () => {
        if (!id || !userId) return

        try {
            console.log("  Calculating course progress:", { courseId: id, userId })

            const { data: allVideos } = await supabase
                .from("videos")
                .select("id, titulo, duracao")
                .eq("curso_id", id)
                .order("data_criacao")

            if (!allVideos || allVideos.length === 0) {
                console.log("No videos found for course")
                setTotalVideos(0)
                setCompletedVideos(0)
                return
            }

            const total = allVideos.length
            setTotalVideos(total)
            console.log(`Total videos in course: ${total}`)

            const videoIds = allVideos.map((v) => v.id)
            const { data: progressData } = await supabase
                .from("video_progress")
                .select("video_id, concluido, percentual_assistido")
                .eq("user_id", userId)
                .in("video_id", videoIds)

            if (progressData) {
                const completedCount = progressData.filter((p) => {
                    return p.concluido === true || p.percentual_assistido >= 100
                }).length

                setCompletedVideos(completedCount)
                console.log(`  Videos completed: ${completedCount}/${total}`)

                setProgressRefresh((prev) => prev + 1)

                if (completedCount === total && total > 0) {
                    console.log("All videos completed! Checking quiz...")
                    setTimeout(() => {
                        checkCourseCompletion()
                    }, 2000)
                }
            }
        } catch (error) {
            console.error("Error calculating course progress:", error)
        }
    }, [id, userId, checkCourseCompletion])

    const fetchVideosAndProgress = async () => {
        setLoading(true)

        if (process.env.NODE_ENV === "development") {
            console.log("🔍 CursoDetalhe - Starting load:", {
                cursoId: id,
                userId: userId,
                isAdmin: isAdmin,
            })
        }

        let finalVideos: VideoWithModulo[] = []

        try {
            const { data: videosData, error: videosError } = await supabase
                .from("videos")
                .select("*")
                .eq("curso_id", id)
                .order("data_criacao", { ascending: false })

            if (videosError) {
                console.error("❌ Error fetching videos by curso_id:", videosError)
            }

            if (videosData && videosData.length > 0) {
                finalVideos = videosData
            } else {
                const { data: cursoData, error: cursoError } = await supabase
                    .from("cursos")
                    .select("categoria")
                    .eq("id", id)
                    .single()

                if (cursoData?.categoria) {
                    const { data: videosByCategory, error: categoryError } = await supabase
                        .from("videos")
                        .select("*")
                        .eq("categoria", cursoData.categoria)
                        .is("curso_id", null)
                        .order("ordem", { ascending: true })

                    if (videosByCategory && videosByCategory.length > 0) {
                        for (const video of videosByCategory) {
                            await supabase.from("videos").update({ curso_id: id }).eq("id", video.id)
                        }

                        const { data: updatedVideos } = await supabase
                            .from("videos")
                            .select("*")
                            .eq("curso_id", id)
                            .order("data_criacao", { ascending: false })

                        if (updatedVideos) {
                            finalVideos = updatedVideos
                        }
                    }
                }
            }
        } catch (error) {
            console.error("❌ Unexpected error fetching videos:", error)
        }

        if (finalVideos.length > 0) {
            setVideos(finalVideos)
        } else {
            setVideos([])
        }

        const { data: progressData, error: progressError } = await supabase
            .from("video_progress")
            .select("*")
            .eq("user_id", userId)
            .in(
                "video_id",
                finalVideos.map((v) => v.id),
            )

        const progressMap: Record<string, Partial<VideoProgressRow>> = {}
        ;(progressData || []).forEach((p) => {
            if (p.video_id) progressMap[p.video_id] = p
        })
        setProgress(progressMap)

        setTimeout(() => {
            calculateCourseProgress()
        }, 500)

        setLoading(false)
    }

    // NOVO: Função super protegida para lidar com seleção de vídeos (Evita re-render hell)
    const handleVideoSelect = useCallback((video: VideoWithModulo) => {
        if (isChangingVideo) return; // Proteção: ignora cliques múltiplos rápidos
        if (selectedVideo?.id === video.id) return; // Ignora se clicou no vídeo que já está tocando

        setIsChangingVideo(true);
        setSelectedVideo(null); // Força a desmontagem do player atual imediatamente, abortando requisições

        // Aguarda 300ms para a memória limpar e monta o novo player
        setTimeout(() => {
            setSelectedVideo(video);
            setIsChangingVideo(false);
        }, 300);
    }, [isChangingVideo, selectedVideo]);

    const getNextVideo = useCallback(
        (currentVideoId: string) => {
            const currentIndex = videos.findIndex((v) => v.id === currentVideoId)
            if (currentIndex >= 0 && currentIndex < videos.length - 1) {
                const nextVideo = videos[currentIndex + 1]
                return {
                    id: nextVideo.id,
                    titulo: nextVideo.titulo,
                }
            }
            return null
        },
        [videos],
    )

    const handleNextVideo = useCallback(
        (currentVideoId: string) => {
            const nextVideo = getNextVideo(currentVideoId)
            if (nextVideo) {
                const nextVideoData = videos.find((v) => v.id === nextVideo.id)
                if (nextVideoData) {
                    handleVideoSelect(nextVideoData) // Modificado para usar o sistema de transição segura
                }
            }
        },
        [videos, getNextVideo, handleVideoSelect],
    )

    const handleVideoProgressChange = useCallback(
        (videoId: string, progressPercent: number) => {
            setProgress((prev) => {
                const next = { ...prev }

                if (next[videoId]) {
                    next[videoId] = {
                        ...next[videoId],
                        percentual_assistido: progressPercent,
                        concluido: progressPercent >= 100 ? true : Boolean(next[videoId]?.concluido),
                        data_ultimo_acesso: new Date().toISOString(),
                        data_atualizacao: new Date().toISOString(),
                    }
                } else {
                    const base: Partial<VideoProgressRow> = {
                        id: `temp-${videoId}`,
                        user_id: userId || "",
                        video_id: videoId,
                        curso_id: id || "",
                        modulo_id: (typeof selectedModule?.id === "string" ? selectedModule.id : "") as any,
                        tempo_assistido: 0,
                        tempo_total: 0,
                        percentual_assistido: progressPercent,
                        concluido: progressPercent >= 100,
                        data_primeiro_acesso: new Date().toISOString(),
                        data_ultimo_acesso: new Date().toISOString(),
                        data_criacao: new Date().toISOString(),
                        data_atualizacao: new Date().toISOString(),
                    }

                    if (progressPercent >= 100) {
                        base.data_conclusao = new Date().toISOString()
                    }

                    next[videoId] = base satisfies Partial<VideoProgressRow>
                }
                return next
            })

            if (progressPercent >= 100) {
                setTimeout(() => {
                    calculateCourseProgress()
                }, 500)
            }
        },
        [calculateCourseProgress, userId, id, selectedModule?.id],
    )

    const handleCourseComplete = useCallback(
        async (courseId: string) => {
            if (!userId || !id) return

            try {
                console.log("handleCourseComplete called for:", courseId)

                await calculateCourseProgress()

                const { data: allVideos } = await supabase.from("videos").select("id").eq("curso_id", id)

                const { data: progressData } = await supabase
                    .from("video_progress")
                    .select("video_id, concluido, percentual_assistido")
                    .eq("user_id", userId)
                    .in("video_id", allVideos?.map((v) => v.id) || [])

                const completedCount =
                    progressData?.filter((p) => p.concluido === true || p.percentual_assistido >= 100).length || 0
                const totalCount = allVideos?.length || 0

                console.log(`Final verification: ${completedCount}/${totalCount} videos completed`)

                if (completedCount === totalCount && totalCount > 0) {
                    console.log("Course 100% completed! Checking quiz availability...")

                    if (manualQuizCheck) {
                        await checkQuizAvailability()

                        if (certificate || userProgress?.aprovado) {
                            console.log("User already has certificate or completed quiz, skipping quiz notification")
                            return
                        }

                        setTimeout(() => {
                            if (!certificate && !userProgress?.aprovado) {
                                console.log("  Showing quiz notification...")
                                setShowQuizNotification(true)
                                setQuizShown(true)
                            } else {
                                console.log("  Quiz already completed or certificate exists")
                            }
                        }, 1500)
                    }
                }
            } catch (error) {
                console.error("Error verifying course completion:", error)
            }
        },
        [userId, id, certificate, userProgress, checkQuizAvailability, calculateCourseProgress, manualQuizCheck],
    )

    const handleQuizComplete = useCallback(() => {
        setQuizCompleted(true)
        setTimeout(() => {
            checkQuizAvailability()
            calculateCourseProgress()
        }, 1000)

        toast({
            title: "Quiz concluído!",
            description: "Parabéns, você completou o quiz!",
        })
    }, [checkQuizAvailability, calculateCourseProgress, toast])

    const createDefaultModules = async () => {
        if (!isAdmin && modules.length === 0 && videos.length > 0) {
            try {
                const { data: introModule, error: introError } = await supabase
                    .from("modulos")
                    .insert({
                        curso_id: id,
                        nome_modulo: "Introdução",
                        descricao: "Vídeos introdutórios do curso",
                        ordem: 1,
                    })
                    .select()
                    .single()
            } catch (error) {
                console.error("❌ Error creating default modules:", error)
            }
        }
    }

    React.useEffect(() => {
        if (!id || !userId) return
        fetchVideosAndProgress()
    }, [id, userId, refresh])

    React.useEffect(() => {
        if (!userId || !id) return

        const subscription = supabase
            .channel(`course_progress_${id}_${userId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "video_progress",
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    if (payload.eventType === "UPDATE" || payload.eventType === "INSERT") {
                        const newProgress = payload.new as VideoProgressRow
                        setProgress((prev) => ({
                            ...prev,
                            [newProgress.video_id]: newProgress,
                        }))
                        setTimeout(() => {
                            calculateCourseProgress()
                        }, 500)
                    }
                },
            )
            .subscribe()

        return () => {
            supabase.removeChannel(subscription)
        }
    }, [userId, id])

    React.useEffect(() => {
        calculateCourseProgress()
    }, [calculateCourseProgress])

    // 🎓 ADMIN - CARREGAR QUIZ VINCULADO AO CURSO
    React.useEffect(() => {
        if (!id || !isAdmin) return

        const loadQuizConfig = async () => {
            try {
                setLoadingQuizConfig(true)

                const { data: mapping } = await supabase
                    .from("curso_quiz_mapping")
                    .select("quiz_id, quizzes(*)")
                    .eq("curso_id", id)
                    .maybeSingle()

                if (mapping?.quizzes) {
                    setLinkedQuiz(mapping.quizzes)
                    setSelectedQuizId(mapping.quiz_id)
                }

                const { data: quizzes } = await supabase
                    .from("quizzes")
                    .select("*")
                    .eq("ativo", true)
                    .order("titulo")

                if (quizzes) setAllQuizzes(quizzes)

            } catch (err) {
                console.error("Erro carregando quiz config:", err)
            } finally {
                setLoadingQuizConfig(false)
            }
        }

        loadQuizConfig()
    }, [id, isAdmin, supabase])

    React.useEffect(() => {
        if (quizState.shouldShowQuiz && !quizCompleted && !quizShown) {
            setShowQuizNotification(true)
            setQuizShown(true)
        }
    }, [quizState.shouldShowQuiz, quizCompleted, quizShown])

    React.useEffect(() => {
        if (!isAdmin && modules.length === 0 && videos.length > 0 && !loading) {
            createDefaultModules()
        }
    }, [isAdmin, modules.length, videos.length, loading, id])

    React.useEffect(() => {
        if (videos.length > 0 && Object.keys(progress).length > 0) {
            const completedVideos = videos.filter((video) => {
                const videoProgress = progress[video.id]
                const isCompleted = videoProgress?.concluido === true || videoProgress?.percentual_assistido >= 100
                return isCompleted
            })

            const allCompleted = completedVideos.length === videos.length
            setCompletedVideos(completedVideos.length)

            if (allCompleted && videos.length > 0 && !quizState.quizAlreadyCompleted && !quizShown && manualQuizCheck) {
                handleCourseComplete(id || "")
            }
        }
    }, [videos, progress, quizState.quizAlreadyCompleted, quizShown, handleCourseComplete, id, manualQuizCheck])

    React.useEffect(() => {
        if (videos.length > 0 && !selectedVideo) {
            setHasShownIntroduction(true)
        }
    }, [videos, selectedVideo])

    React.useEffect(() => {
        const handleVideoCompleted = (event: CustomEvent) => {
            setTimeout(() => {
                calculateCourseProgress()
                fetchVideosAndProgress()
            }, 500)
        }

        window.addEventListener("videoCompleted", handleVideoCompleted as EventListener)

        return () => {
            window.removeEventListener("videoCompleted", handleVideoCompleted as EventListener)
        }
    }, [calculateCourseProgress])

    const filteredVideos = videos.filter((v) => {
        return v.curso_id === id
    })

    const totalProgress = Object.values(progress).reduce((acc, p) => acc + (p.percentual_assistido || 0), 0)
    const averageProgress = videos.length > 0 ? totalProgress / videos.length : 0

    const isCourseComplete =
        videos.length > 0 &&
        videos.every((video) => {
            const videoProgress = progress[video.id]
            const isCompleted = videoProgress?.concluido === true || videoProgress?.percentual_assistido >= 100
            return isCompleted
        })

    const handleViewCertificate = () => {
        if (certificate) {
            window.open(`/certificado/${certificate.id}`, "_blank")
        }
    }

    const handleStartQuizCheck = () => {
        setManualQuizCheck(true)
        if (isCourseComplete) {
            handleCourseComplete(id || "")
        }
    }

    const handleSaveQuizLink = async () => {
        if (!selectedQuizId || !id) {
            toast({
                title: "Selecione um quiz",
                description: "Escolha um quiz antes de salvar.",
            })
            return
        }

        try {
            setLoadingQuizConfig(true)

            await supabase
                .from("curso_quiz_mapping")
                .delete()
                .eq("curso_id", id)

            const { error } = await supabase
                .from("curso_quiz_mapping")
                .insert({
                    curso_id: id,
                    quiz_id: selectedQuizId
                })

            if (error) throw error

            toast({
                title: "Quiz vinculado!",
                description: "Este curso agora possui prova final 🎉",
            })

            setRefresh(prev => prev + 1)

        } catch (err) {
            toast({
                title: "Erro ao salvar",
                description: "Não foi possível vincular o quiz.",
            })
        } finally {
            setLoadingQuizConfig(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Voltar
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{currentCourseData?.nome || "Carregando..."}</h1>
                            <p className="text-gray-600">{currentCourseData?.categoria || "Categoria não definida"}</p>
                        </div>
                    </div>

                    {isAdmin && (
                        <div className="flex gap-2">
                            <Button
                                onClick={() => setShowVideoUpload(true)}
                                className="bg-era-green hover:bg-era-green/90 text-era-black"
                            >
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Adicionar Vídeo
                            </Button>
                        </div>
                    )}
                </div>

                {/* 🎓 ADMIN - CONFIGURAR QUIZ DO CURSO */}
                {isAdmin && (
                    <div className="mb-8 bg-white rounded-2xl shadow-lg p-6 border border-era-green/20">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            Configuração da Prova Final
                        </h2>

                        {loadingQuizConfig ? (
                            <p className="text-gray-500">Carregando quizzes...</p>
                        ) : (
                            <div className="flex flex-col md:flex-row gap-4 items-center">
                                
                                <select
                                    className="border rounded-lg px-4 py-2 w-full md:w-96"
                                    value={selectedQuizId}
                                    onChange={(e) => setSelectedQuizId(e.target.value)}
                                >
                                    <option value="">Selecione um quiz</option>
                                    {allQuizzes.map((quiz) => (
                                        <option key={quiz.id} value={quiz.id}>
                                            {quiz.titulo}
                                        </option>
                                    ))}
                                </select>

                                <Button
                                    onClick={handleSaveQuizLink}
                                    className="bg-era-green text-era-black"
                                >
                                    Salvar vínculo
                                </Button>
                            </div>
                        )}

                        {linkedQuiz && (
                            <p className="text-sm text-green-600 mt-4">
                                Quiz atualmente vinculado: <strong>{linkedQuiz.titulo}</strong>
                            </p>
                        )}
                    </div>
                )}

                {/* NVIDIA Course Glossary Requirement */}
                {isNVIDIACourse && !glossaryCompleted && !checkingGlossary && (
                    <div className="mb-8">
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <BookOpen className="h-5 w-5 text-blue-600" />
                                <h3 className="font-semibold text-blue-900">Pré-requisito: Glossário</h3>
                            </div>
                            <p className="text-blue-800 text-sm">
                                Este curso requer que você estude o glossário de termos técnicos antes de acessar os vídeos.
                            </p>
                        </div>
                        <GlossaryModule
                            courseId={id || ""}
                            userId={userId}
                            onComplete={handleGlossaryComplete}
                            isCompleted={glossaryCompleted}
                        />
                    </div>
                )}

                {/* Show loading for glossary check */}
                {isNVIDIACourse && checkingGlossary && (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-era-green mx-auto mb-4"></div>
                            <p className="text-gray-600">Verificando pré-requisitos...</p>
                        </div>
                    </div>
                )}

                {/* Show locked message for NVIDIA course without glossary */}
                {isNVIDIACourse && !glossaryCompleted && !checkingGlossary && videos.length > 0 && (
                    <div className="mb-6 bg-amber-50 border border-amber-200 p-6 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                            <Lock className="h-6 w-6 text-amber-600" />
                            <h3 className="text-lg font-semibold text-amber-900">Vídeos Bloqueados</h3>
                        </div>
                        <p className="text-amber-800 mb-4">
                            Os vídeos deste curso estarão disponíveis após você concluir o glossário de termos técnicos. Isso garante
                            que você tenha o conhecimento base necessário para aproveitar melhor o conteúdo.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-amber-700">
                            <span>📚 {videos.length} vídeos aguardando</span>
                            <span>•</span>
                            <span>🔒 Desbloqueie completando o glossário acima</span>
                        </div>
                    </div>
                )}

                {/* Regular course introduction */}
                {(!isNVIDIACourse || glossaryCompleted) && videos.length > 0 && !selectedVideo && !isChangingVideo && hasShownIntroduction && (
                    <div className="mb-6 bg-white rounded-2xl shadow-lg p-8">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-era-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Play className="h-10 w-10 text-era-green" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Bem-vindo ao Curso</h2>
                            <h3 className="text-xl font-semibold text-era-green mb-4">{currentCourseData?.nome}</h3>
                            <p className="text-gray-600 mb-6 max-w-3xl mx-auto text-lg leading-relaxed">
                                {isNVIDIACourse && glossaryCompleted ? (
                                    <>
                                        Excelente! Você concluiu o glossário e agora pode <strong>clicar em um dos vídeos</strong> para
                                        continuar seus estudos. Com o conhecimento dos termos técnicos, você aproveitará melhor o conteúdo
                                        avançado.
                                    </>
                                ) : (
                                    <>
                                        Para começar seus estudos, <strong>clique em um dos vídeos</strong> disponíveis na lista ao lado.
                                        Você pode assistir aos vídeos em qualquer ordem e seu progresso será salvo automaticamente. Após
                                        concluir todos os vídeos, você poderá fazer o quiz final para obter seu certificado.
                                    </>
                                )}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                                    <Video className="h-8 w-8 text-era-green mb-2" />
                                    <span className="font-medium text-gray-900">{videos.length} vídeos</span>
                                    <span className="text-sm text-gray-500">disponíveis</span>
                                </div>
                                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                                    <Clock className="h-8 w-8 text-era-green mb-2" />
                                    <span className="font-medium text-gray-900">Progresso</span>
                                    <span className="text-sm text-gray-500">salvo automaticamente</span>
                                </div>
                                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                                    <Award className="h-8 w-8 text-era-green mb-2" />
                                    <span className="font-medium text-gray-900">Certificado</span>
                                    <span className="text-sm text-gray-500">após conclusão</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Progress Bar */}
                {(!isNVIDIACourse || glossaryCompleted) && videos.length > 0 && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Progresso do Curso</span>
                            <span className="text-sm text-gray-500">{Math.round(averageProgress)}% completo</span>
                        </div>
                        <Progress value={averageProgress} className="h-2" />
                    </div>
                )}

                {/* Loading State Master */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-era-green mx-auto mb-4"></div>
                            <p className="text-gray-600">Carregando curso...</p>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                {!loading && (!isNVIDIACourse || glossaryCompleted) && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Player e Comentários */}
                        <div className="lg:col-span-2 flex flex-col gap-6">
                            {isChangingVideo ? (
                                <div className="bg-white rounded-2xl shadow-lg p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-era-green mb-4"></div>
                                    <p className="text-gray-600">Preparando vídeo...</p>
                                </div>
                            ) : selectedVideo ? (
                                <div className="bg-white rounded-2xl shadow-lg p-6 mb-2">
                                    {/* Player de Vídeo */}
                                    <VideoPlayerWithProgress
                                        video={selectedVideo}
                                        cursoId={id || ""}
                                        moduloId={selectedModule?.id}
                                        userId={userId}
                                        onCourseComplete={handleCourseComplete}
                                        totalVideos={totalVideos}
                                        completedVideos={completedVideos}
                                        className="mb-6"
                                        nextVideo={getNextVideo(selectedVideo.id)}
                                        onNextVideo={() => handleNextVideo(selectedVideo.id)}
                                        onProgressChange={(progress) => handleVideoProgressChange(selectedVideo.id, progress)}
                                    />

                                    {/* Informações do Vídeo */}
                                    <VideoInfo
                                        titulo={selectedVideo.titulo}
                                        descricao={selectedVideo.descricao}
                                        duracao={selectedVideo.duracao}
                                        progresso={{
                                            percentual_assistido: progress[selectedVideo.id]?.percentual_assistido ?? 0,
                                            concluido: Boolean(progress[selectedVideo.id]?.concluido),
                                        }}
                                    />

                                    {isCourseComplete && (
                                        <div className="mt-6 p-4 bg-gradient-to-r from-era-green/10 to-era-green/20 rounded-lg border border-era-green/30">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-era-black mb-1">🎯 Prova Final Disponível</h3>
                                                    <p className="text-sm text-gray-600">
                                                        Parabéns! Você concluiu todos os vídeos. Agora pode fazer o quiz para obter seu certificado.
                                                    </p>
                                                </div>
                                                <Button
                                                    onClick={handleStartQuizCheck}
                                                    className="bg-era-green hover:bg-era-green/90 text-era-black"
                                                >
                                                    <FileText className="h-4 w-4 mr-2" />
                                                    Começar Quiz
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                !hasShownIntroduction && (
                                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                                        <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione um vídeo para começar</h3>
                                        <p className="text-gray-600">Clique em um vídeo da lista ao lado para iniciar seus estudos.</p>
                                    </div>
                                )
                            )}

                            {/* Comentários */}
                            {selectedVideo && !isChangingVideo && <CommentsSection videoId={selectedVideo.id} />}
                        </div>

                        {/* Sidebar de Vídeos */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Video className="h-5 w-5 text-era-green" />
                                    Vídeos do Curso
                                    {isNVIDIACourse && !glossaryCompleted && <Lock className="h-4 w-4 text-amber-500" />}
                                </h3>

                                {filteredVideos.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Video className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-600 text-sm">Nenhum vídeo disponível para este curso.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {videos.map((video, index) => {
                                            const videoProgress = progress[video.id]
                                            const isCompleted = videoProgress?.concluido === true || videoProgress?.percentual_assistido >= 100
                                            const isSelected = selectedVideo?.id === video.id
                                            const isLocked = isNVIDIACourse && !glossaryCompleted

                                            return (
                                                <div
                                                    key={video.id}
                                                    className={`p-3 rounded-lg transition-all duration-200 ${
                                                        isLocked
                                                            ? "bg-gray-100 cursor-not-allowed opacity-60"
                                                            : isChangingVideo 
                                                                ? "opacity-50 cursor-wait" 
                                                                : isSelected
                                                                ? "bg-era-green/20 border border-era-green/30 cursor-pointer"
                                                                : "bg-gray-50 hover:bg-gray-100 border border-transparent cursor-pointer"
                                                    }`}
                                                    onClick={() => !isLocked && !isChangingVideo && handleVideoSelect(video)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex-shrink-0">
                                                            {isLocked ? (
                                                                <Lock className="h-5 w-5 text-gray-400" />
                                                            ) : isCompleted ? (
                                                                <CheckCircle className="h-5 w-5 text-era-green" />
                                                            ) : (
                                                                <Play className="h-5 w-5 text-gray-400" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-sm font-medium text-gray-900 truncate">{video.titulo}</h4>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <Clock className="h-3 w-3 text-gray-400" />
                                                                <span className="text-xs text-gray-500">
                                                                    {video.duracao ? `${Math.round(video.duracao / 60)} min` : "Duração não definida"}
                                                                </span>
                                                                {videoProgress && !isLocked && (
                                                                    <span className="text-xs text-era-black font-medium">
                                                                        {Math.round(videoProgress.percentual_assistido || 0)}% completo
                                                                    </span>
                                                                )}
                                                                {isLocked && <span className="text-xs text-amber-600 font-medium">Bloqueado</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Estatísticas */}
                            {(!isNVIDIACourse || glossaryCompleted) && videos.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Award className="h-5 w-5 text-era-green" />
                                        Estatísticas
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Total de vídeos</span>
                                            <span className="text-sm font-medium">{videos.length}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Vídeos concluídos</span>
                                            <span className="text-sm font-medium text-era-green">
                                                {videos.filter((v) => {
                                                    const videoProgress = progress[v.id]
                                                    return videoProgress?.concluido === true || videoProgress?.percentual_assistido >= 100
                                                }).length}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Progresso geral</span>
                                            <span className="text-sm font-medium">{Math.round(averageProgress)}%</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Certificado */}
                            {certificate && (
                                <div className="bg-white rounded-2xl shadow-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-era-green" />
                                        Certificado
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-4">Parabéns! Você concluiu este curso com sucesso.</p>
                                    <Button
                                        onClick={handleViewCertificate}
                                        className="w-full bg-era-green hover:bg-era-green/90 text-era-black"
                                    >
                                        <FileText className="h-4 w-4 mr-2" />
                                        Ver Certificado
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Notificação de Quiz */}
                <QuizCompletionNotification
                    courseId={id || ""}
                    courseName={currentCourseData?.nome || ""}
                    isVisible={showQuizNotification}
                    onClose={() => setShowQuizNotification(false)}
                    onStartQuiz={() => {
                        setShowQuizNotification(false)
                        setShowQuizModal(true)
                    }}
                    totalQuestions={quizSettings.MAX_QUESTIONS}
                    timeLimit={quizSettings.TIME_LIMIT_MINUTES}
                    passPercentage={quizSettings.PASS_PERCENTAGE}
                />

                <EnhancedQuizModal
                    courseId={id || ""}
                    courseName={currentCourseData?.nome || ""}
                    isOpen={showQuizModal}
                    onClose={() => setShowQuizModal(false)}
                    onQuizComplete={handleQuizComplete}
                />

                {/* Upload Modal */}
                {showVideoUpload && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <VideoUpload
                            onClose={() => setShowVideoUpload(false)}
                            onSuccess={() => {
                                setShowVideoUpload(false)
                                setRefresh((prev) => prev + 1)
                            }}
                            preSelectedCourseId={id}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

export default CursoDetalhe