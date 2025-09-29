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
import { toast } from "@/components/ui/use-toast"
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
            {error && <div className="text-red-500 mt-2">{error}</div>}
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
    const [progress, setProgress] = React.useState<Record<string, Database["public"]["Tables"]["video_progress"]["Row"]>>(
        {},
    )
    const [loading, setLoading] = useState(true)
    const [selectedVideo, setSelectedVideo] = React.useState<VideoWithModulo | null>(null)
    const [selectedModule, setSelectedModule] = React.useState<Module | null>(null)
    const [showUploadModal, setShowUploadModal] = React.useState(false)
    const [showQuizNotification, setShowQuizNotification] = React.useState(false)
    const [showQuizModal, setShowQuizModal] = React.useState(false)
    const [refresh, setRefresh] = React.useState(0)
    const [progressRefresh, setProgressRefresh] = React.useState(0)
    const [hasShownIntroduction, setHasShownIntroduction] = React.useState(false)
    const [manualQuizCheck, setManualQuizCheck] = React.useState(false)

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

    const { quizState, loading: quizLoading, checkCourseCompletion } = useOptionalQuiz(id || "")

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

    const { generateCertificate } = useCertificates(userId)

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
        // Refresh videos after glossary completion
        setTimeout(() => {
            fetchVideosAndProgress()
        }, 1000)
    }

    const calculateCourseProgress = useCallback(async () => {
        if (!id || !userId) return

        try {
            console.log("🔄 Calculating course progress:", { courseId: id, userId })

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
                const completed = progressData.filter(
                    (p) => p.concluido === true || (p.percentual_assistido && p.percentual_assistido >= 90),
                ).length
                setCompletedVideos(completed)
                console.log(`🔄 Videos completed: ${completed}/${total}`)

                setProgressRefresh((prev) => prev + 1)

                if (completed === total && total > 0) {
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
            } else {
                console.log("🔍 CursoDetalhe - Videos found by curso_id:", videosData)
            }

            if (videosData && videosData.length > 0) {
                console.log("✅ Videos found specifically for this course:", videosData)
                finalVideos = videosData
            } else {
                console.log("🔍 CursoDetalhe - No videos found by curso_id, checking by category...")

                const { data: cursoData, error: cursoError } = await supabase
                    .from("cursos")
                    .select("categoria")
                    .eq("id", id)
                    .single()

                if (cursoError) {
                    console.error("❌ Error fetching course:", cursoError)
                } else if (cursoData?.categoria) {
                    console.log("🔍 CursoDetalhe - Course category:", cursoData.categoria)

                    const { data: videosByCategory, error: categoryError } = await supabase
                        .from("videos")
                        .select("*")
                        .eq("categoria", cursoData.categoria)
                        .is("curso_id", null)
                        .order("ordem", { ascending: true })

                    if (categoryError) {
                        console.error("❌ Error fetching videos by category:", categoryError)
                    } else {
                        console.log("🔍 CursoDetalhe - Videos found by category (without curso_id):", videosByCategory)

                        if (videosByCategory && videosByCategory.length > 0) {
                            console.log("🔧 CursoDetalhe - Associating orphan videos to current course...")

                            for (const video of videosByCategory) {
                                const { error: updateError } = await supabase.from("videos").update({ curso_id: id }).eq("id", video.id)

                                if (updateError) {
                                    console.error(`❌ Error associating video ${video.titulo}:`, updateError)
                                } else {
                                    console.log(`✅ Video "${video.titulo}" associated to course ${id}`)
                                }
                            }

                            const { data: updatedVideos, error: reloadError } = await supabase
                                .from("videos")
                                .select("*")
                                .eq("curso_id", id)
                                .order("data_criacao", { ascending: false })

                            if (reloadError) {
                                console.error("❌ Error reloading videos:", reloadError)
                            } else {
                                console.log("✅ Videos reloaded after association:", updatedVideos)
                                finalVideos = updatedVideos || []
                            }
                        } else {
                            console.log("📋 No orphan videos found for this category")
                            finalVideos = []
                        }
                    }
                } else {
                    console.log("📋 No videos found for this specific course")
                    finalVideos = []
                }
            }
        } catch (error) {
            console.error("❌ Unexpected error fetching videos:", error)
        }

        if (finalVideos.length > 0) {
            console.log("✅ Videos loaded successfully:", finalVideos)
            setVideos(finalVideos)
        } else {
            console.log("📋 No videos found for this course")
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

        console.log("🔍 CursoDetalhe - Progress query result:", {
            progressData: progressData,
            progressError: progressError,
            totalProgress: progressData?.length || 0,
        })

        if (progressError) {
            console.error("❌ Error loading progress:", progressError)
        } else {
            console.log("✅ Progress loaded successfully:", progressData)
        }

        const progressMap: Record<string, Database["public"]["Tables"]["video_progress"]["Row"]> = {}
        ;(progressData || []).forEach((p) => {
            if (p.video_id) progressMap[p.video_id] = p
        })
        setProgress(progressMap)

        setTimeout(() => {
            calculateCourseProgress()
        }, 500)

        setLoading(false)
    }

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
                    setSelectedVideo(nextVideoData)
                }
            }
        },
        [videos, getNextVideo],
    )

    const handleVideoProgressChange = useCallback(
        (videoId: string, progressPercent: number) => {
            console.log(`🔄 Video progress changed: ${videoId} - ${progressPercent}%`)

            setProgress((prevProgress) => {
                const updatedProgress = { ...prevProgress }
                if (updatedProgress[videoId]) {
                    updatedProgress[videoId] = {
                        ...updatedProgress[videoId],
                        percentual_assistido: progressPercent,
                        concluido: progressPercent >= 90 ? true : updatedProgress[videoId].concluido,
                    }
                } else {
                    // Create new progress entry if it doesn't exist
                    updatedProgress[videoId] = {
                        id: `temp-${videoId}`,
                        user_id: userId || "",
                        video_id: videoId,
                        percentual_assistido: progressPercent,
                        concluido: progressPercent >= 90,
                        tempo_assistido: 0,
                        data_inicio: new Date().toISOString(),
                        data_conclusao: progressPercent >= 90 ? new Date().toISOString() : null,
                    }
                }
                return updatedProgress
            })

            // Trigger immediate progress recalculation for completed videos
            if (progressPercent >= 90) {
                setTimeout(() => {
                    calculateCourseProgress()
                }, 500)
            }
        },
        [calculateCourseProgress, userId],
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
                    progressData?.filter((p) => p.concluido === true || (p.percentual_assistido && p.percentual_assistido >= 90))
                        .length || 0
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
                                console.log("Showing quiz notification...")
                                setShowQuizNotification(true)
                                setQuizShown(true)
                            } else {
                                console.log("Quiz already completed or certificate exists")
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
    }, [checkQuizAvailability, calculateCourseProgress])

    const createDefaultModules = async () => {
        if (!isAdmin && modules.length === 0 && videos.length > 0) {
            try {
                console.log("🔧 Creating default modules for course...")

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

                if (introError) {
                    console.error("❌ Error creating Introduction module:", introError)
                } else {
                    console.log("✅ Introduction module created:", introModule)
                }
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

        console.log("🔄 Setting up real-time subscription for course progress")

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
                    console.log("🔄 Real-time course progress update:", payload)
                    setTimeout(() => {
                        calculateCourseProgress()
                        // Also refresh the videos and progress data
                        fetchVideosAndProgress()
                    }, 500)
                },
            )
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "progresso_quiz",
                    filter: `usuario_id=eq.${userId}`,
                },
                (payload) => {
                    console.log("🔄 Real-time quiz progress update:", payload)
                    setTimeout(() => {
                        checkQuizAvailability()
                    }, 500)
                },
            )
            .subscribe((status) => {
                console.log("🔄 Subscription status:", status)
            })

        return () => {
            console.log("🔄 Cleaning up course progress subscription")
            supabase.removeChannel(subscription)
        }
    }, [userId, id])

    React.useEffect(() => {
        calculateCourseProgress()
    }, [calculateCourseProgress])

    React.useEffect(() => {
        if (quizState.shouldShowQuiz && !quizCompleted && !quizShown) {
            console.log("🎯 Course completed! Showing quiz notification...")
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
                const isCompleted =
                    videoProgress?.concluido === true ||
                    (videoProgress?.percentual_assistido && videoProgress.percentual_assistido >= 90)
                return isCompleted
            })

            const allCompleted = completedVideos.length === videos.length

            console.log(`Progress monitoring: ${completedVideos.length}/${videos.length} videos completed`)

            setCompletedVideos(completedVideos.length)

            // Only trigger if manually requested
            if (allCompleted && videos.length > 0 && !quizState.quizAlreadyCompleted && !quizShown && manualQuizCheck) {
                console.log("All videos completed detected! Forcing quiz check...")
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
            console.log("🔄 Video completion event received:", event.detail)
            // Immediately refresh progress and video list
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

    if (process.env.NODE_ENV === "development") {
        console.log("🔍 CursoDetalhe - Filtered videos:", {
            totalVideos: videos.length,
            filteredVideosCount: filteredVideos.length,
            currentCourseId: id,
            currentCategory: currentCategory,
        })
    }

    const totalProgress = Object.values(progress).reduce((acc, p) => acc + (p.percentual_assistido || 0), 0)
    const averageProgress = videos.length > 0 ? totalProgress / videos.length : 0

    const isCourseComplete =
        videos.length > 0 &&
        videos.every((video) => {
            const videoProgress = progress[video.id]
            return (
                videoProgress?.concluido === true ||
                (videoProgress?.percentual_assistido && videoProgress.percentual_assistido >= 90)
            )
        })

    // React.useEffect(() => {
    //   if (isCourseComplete && !certificate && quizConfig) {
    //     setShowQuizModal(true)
    //   }
    // }, [isCourseComplete, certificate, quizConfig])

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
                                onClick={() => {
                                    console.log("🎯 Add Video button clicked!")
                                    console.log("🎯 showVideoUpload before:", showVideoUpload)
                                    setShowVideoUpload(true)
                                    console.log("🎯 showVideoUpload after:", true)
                                }}
                                className="bg-era-green hover:bg-era-green/90 text-era-black"
                            >
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Adicionar Vídeo
                            </Button>
                        </div>
                    )}
                </div>

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

                {/* Regular course introduction for non-NVIDIA or completed glossary */}
                {(!isNVIDIACourse || glossaryCompleted) && videos.length > 0 && !selectedVideo && hasShownIntroduction && (
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

                {/* Progress Bar - only show if glossary is completed or not NVIDIA course */}
                {(!isNVIDIACourse || glossaryCompleted) && videos.length > 0 && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Progresso do Curso</span>
                            <span className="text-sm text-gray-500">{Math.round(averageProgress)}% completo</span>
                        </div>
                        <Progress value={averageProgress} className="h-2" />
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-era-green mx-auto mb-4"></div>
                            <p className="text-gray-600">Carregando curso...</p>
                        </div>
                    </div>
                )}

                {/* Main Content - only show if glossary is completed or not NVIDIA course */}
                {!loading && (!isNVIDIACourse || glossaryCompleted) && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Player e Comentários */}
                        <div className="lg:col-span-2 flex flex-col gap-6">
                            {selectedVideo ? (
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
                                        progresso={progress[selectedVideo.id]}
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
                                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                                    <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione um vídeo para começar</h3>
                                    <p className="text-gray-600">Clique em um vídeo da lista ao lado para iniciar seus estudos.</p>
                                </div>
                            )}

                            {/* Comentários */}
                            {selectedVideo && <CommentsSection videoId={selectedVideo.id} />}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Lista de Vídeos */}
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
                                            const isCompleted =
                                                videoProgress?.concluido === true ||
                                                (videoProgress?.percentual_assistido && videoProgress.percentual_assistido >= 90)
                                            const isSelected = selectedVideo?.id === video.id
                                            const isLocked = isNVIDIACourse && !glossaryCompleted

                                            return (
                                                <div
                                                    key={video.id}
                                                    className={`p-3 rounded-lg transition-all duration-200 ${
                                                        isLocked
                                                            ? "bg-gray-100 cursor-not-allowed opacity-60"
                                                            : isSelected
                                                                ? "bg-era-green/20 border border-era-green/30 cursor-pointer"
                                                                : "bg-gray-50 hover:bg-gray-100 border border-transparent cursor-pointer"
                                                    }`}
                                                    onClick={() => !isLocked && setSelectedVideo(video)}
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
                                                                    <span className="text-xs text-era-green font-medium">
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

                            {/* Estatísticas - only show if not locked */}
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
                        {
                            videos.filter((v) => {
                                const videoProgress = progress[v.id]
                                return (
                                    videoProgress?.concluido === true ||
                                    (videoProgress?.percentual_assistido && videoProgress.percentual_assistido >= 90)
                                )
                            }).length
                        }
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

                {/* Notificação de Quiz (Não-intrusiva) */}
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

                {/* Modal de Quiz */}
                <EnhancedQuizModal
                    courseId={id || ""}
                    courseName={currentCourseData?.nome || ""}
                    isOpen={showQuizModal}
                    onClose={() => setShowQuizModal(false)}
                    onQuizComplete={handleQuizComplete}
                />

                {/* Video Upload Modal */}
                {showVideoUpload && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <VideoUpload
                            onClose={() => {
                                console.log("🎯 Closing VideoUpload modal")
                                setShowVideoUpload(false)
                            }}
                            onSuccess={() => {
                                console.log("🎯 Upload success, closing modal")
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
