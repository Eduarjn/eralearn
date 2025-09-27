"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { CheckCircle, Circle, Play, Clock } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Database } from "@/integrations/supabase/types"

type Video = Database["public"]["Tables"]["videos"]["Row"]
type VideoProgress = Database["public"]["Tables"]["video_progress"]["Row"]

interface VideoChecklistProps {
    moduloId: string
    cursoId: string
    userId?: string
    onVideoSelect?: (video: Video) => void
    selectedVideoId?: string
    refreshTrigger?: number
}

interface VideoWithProgress extends Video {
    progress?: VideoProgress
}

export const VideoChecklist: React.FC<VideoChecklistProps> = ({
                                                                  moduloId,
                                                                  cursoId,
                                                                  userId,
                                                                  onVideoSelect,
                                                                  selectedVideoId,
                                                                  refreshTrigger = 0,
                                                              }) => {
    const [videos, setVideos] = useState<VideoWithProgress[]>([])
    const [loading, setLoading] = useState(true)
    const [moduleProgress, setModuleProgress] = useState({
        totalVideos: 0,
        completedVideos: 0,
        totalProgress: 0,
    })

    const loadVideosAndProgress = useCallback(async () => {
        if (!userId) return

        try {
            setLoading(true)

            // Buscar vídeos do módulo
            const { data: videosData, error: videosError } = await supabase
                .from("videos")
                .select("*")
                .eq("modulo_id", moduloId)
                .order("ordem", { ascending: true })

            if (videosError) {
                console.error("Erro ao carregar vídeos:", videosError)
                return
            }

            // Buscar progresso dos vídeos
            const videoIds = videosData?.map((v) => v.id) || []
            let progressData: VideoProgress[] = []

            if (videoIds.length > 0) {
                const { data: progress, error: progressError } = await supabase
                    .from("video_progress")
                    .select("*")
                    .eq("user_id", userId)
                    .eq("curso_id", cursoId)
                    .in("video_id", videoIds)

                if (progressError) {
                    console.error("Erro ao carregar progresso:", progressError)
                } else {
                    progressData = progress || []
                }
            }

            // Combinar vídeos com progresso
            const videosWithProgress = (videosData || []).map((video) => {
                const progress = progressData.find((p) => p.video_id === video.id)
                return { ...video, progress }
            })

            setVideos(videosWithProgress)

            // Calcular progresso do módulo
            const completedVideos = progressData.filter((p) => p.concluido).length
            const totalProgress = videosWithProgress.length > 0 ? (completedVideos / videosWithProgress.length) * 100 : 0

            setModuleProgress({
                totalVideos: videosWithProgress.length,
                completedVideos,
                totalProgress,
            })

            console.log("🔄 VideoChecklist updated:", {
                totalVideos: videosWithProgress.length,
                completedVideos,
                totalProgress: Math.round(totalProgress),
            })
        } catch (error) {
            console.error("Erro ao carregar dados:", error)
        } finally {
            setLoading(false)
        }
    }, [moduloId, cursoId, userId])

    useEffect(() => {
        loadVideosAndProgress()
    }, [loadVideosAndProgress, refreshTrigger])

    useEffect(() => {
        if (!userId || !cursoId) return

        console.log("🔄 Setting up real-time subscription for video progress")

        const subscription = supabase
            .channel("video_progress_changes")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "video_progress",
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    console.log("🔄 Real-time video progress update:", payload)
                    // Reload data when progress changes
                    loadVideosAndProgress()
                },
            )
            .subscribe()

        return () => {
            console.log("🔄 Cleaning up video progress subscription")
            supabase.removeChannel(subscription)
        }
    }, [userId, cursoId, loadVideosAndProgress])

    const formatDuration = (seconds: number | null) => {
        if (!seconds) return "--:--"
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    const getVideoStatus = (video: VideoWithProgress) => {
        if (!video.progress) return "not_started"
        if (video.progress.concluido) return "completed"
        if (video.progress.percentual_assistido > 0) return "in_progress"
        return "not_started"
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
                return <CheckCircle className="w-5 h-5 text-green-500" />
            case "in_progress":
                return <Play className="w-5 h-5 text-blue-500" />
            default:
                return <Circle className="w-5 h-5 text-gray-400" />
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case "completed":
                return "Concluído"
            case "in_progress":
                return "Em andamento"
            default:
                return "Não iniciado"
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800"
            case "in_progress":
                return "bg-blue-100 text-blue-800"
            default:
                return "bg-gray-100 text-gray-600"
        }
    }

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Carregando vídeos...</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-5 h-5 bg-gray-200 rounded-full"></div>
                                <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                    <span>Vídeos do Módulo</span>
                    <Badge variant="outline" className="text-sm">
                        {moduleProgress.completedVideos}/{moduleProgress.totalVideos} concluídos
                    </Badge>
                </CardTitle>

                {/* Progresso geral do módulo */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Progresso geral</span>
                        <span>{Math.round(moduleProgress.totalProgress)}%</span>
                    </div>
                    <Progress value={moduleProgress.totalProgress} className="h-2" />
                </div>
            </CardHeader>

            <CardContent>
                {videos.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Nenhum vídeo disponível neste módulo</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {videos.map((video) => {
                            const status = getVideoStatus(video)
                            const isSelected = selectedVideoId === video.id

                            return (
                                <div
                                    key={video.id}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-gray-50 ${
                                        isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"
                                    }`}
                                    onClick={() => onVideoSelect?.(video)}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 mt-1">{getStatusIcon(status)}</div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="font-medium text-gray-900 truncate">{video.titulo}</h4>
                                                <Badge className={`text-xs ${getStatusColor(status)}`}>{getStatusText(status)}</Badge>
                                            </div>

                                            {video.descricao && <p className="text-sm text-gray-600 mb-2 line-clamp-2">{video.descricao}</p>}

                                            <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                            {formatDuration(video.duracao)}
                        </span>

                                                {video.progress && video.progress.percentual_assistido > 0 && (
                                                    <span>{Math.round(video.progress.percentual_assistido)}% assistido</span>
                                                )}
                                            </div>

                                            {/* Barra de progresso individual */}
                                            {video.progress && video.progress.percentual_assistido > 0 && (
                                                <div className="mt-2">
                                                    <Progress value={video.progress.percentual_assistido} className="h-1" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
