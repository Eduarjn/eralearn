"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"
import { CheckCircle, Play, Pause, Maximize2, SkipForward } from "lucide-react"
import { useVideoProgress } from "@/hooks/useVideoProgress"
import { useSignedMediaUrl } from "@/hooks/useSignedMediaUrl"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { YouTubePlayerWithProgress } from "./YouTubePlayerWithProgress"

interface VideoPlayerWithProgressProps {
    video: {
        id: string
        titulo: string
        url_video: string
        thumbnail_url?: string
        duracao?: number
        source?: "upload" | "youtube"
    }
    cursoId: string
    moduloId?: string
    userId?: string
    onProgressChange?: (progress: number) => void
    onCourseComplete?: (courseId: string) => void
    totalVideos?: number
    completedVideos?: number
    className?: string
    nextVideo?: {
        id: string
        titulo: string
    }
    onNextVideo?: () => void
}

export const VideoPlayerWithProgress: React.FC<VideoPlayerWithProgressProps> = ({
                                                                                    video,
                                                                                    cursoId,
                                                                                    moduloId,
                                                                                    userId,
                                                                                    onProgressChange,
                                                                                    onCourseComplete,
                                                                                    totalVideos,
                                                                                    completedVideos,
                                                                                    className = "",
                                                                                    nextVideo,
                                                                                    onNextVideo,
                                                                                }) => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [showCompletionBadge, setShowCompletionBadge] = useState(false)
    const [completionChecked, setCompletionChecked] = useState(false)
    const [shouldAutoPlay, setShouldAutoPlay] = useState(false)
    const [showCompletionPopup, setShowCompletionPopup] = useState(false)
    const [countdown, setCountdown] = useState(3)
    const [showRewatchDialog, setShowRewatchDialog] = useState(false)

    const { toast } = useToast()
    const { progress, saveProgress, markAsCompleted, checkRewatch, wasCompleted } = useVideoProgress(
        userId,
        video.id,
        cursoId,
        moduloId,
    )

    // Detectar se é vídeo do YouTube ou vídeo problemático (definir antes de usar)
    const isYouTube = video.url_video.includes("youtube.com") || video.url_video.includes("youtu.be")
    const isProblematicVideo = video.url_video.includes("1757184723849") || video.url_video.includes("localhost:3001")

    // Hook para obter URL assinada se o vídeo for do tipo upload e não for problemático
    const {
        signedUrl,
        loading: urlLoading,
        error: urlError,
    } = useSignedMediaUrl({
        videoId: video.source === "upload" && !isProblematicVideo ? video.id : undefined,
        enabled: video.source === "upload" && !!video.id && !isProblematicVideo,
    })

    // Extrair ID do vídeo do YouTube
    const extractYouTubeVideoId = (url: string): string => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
        const match = url.match(regExp)
        return match && match[2].length === 11 ? match[2] : ""
    }

    // Se for vídeo problemático, forçar YouTube
    const finalIsYouTube = isYouTube || isProblematicVideo
    const finalVideoUrl = isProblematicVideo ? "https://www.youtube.com/watch?v=dQw4w9WgXcQ" : video.url_video
    const youtubeVideoId = finalIsYouTube ? extractYouTubeVideoId(finalVideoUrl) : ""

    useEffect(() => {
        if (wasCompleted && !finalIsYouTube) {
            setShowRewatchDialog(true)
        }
    }, [wasCompleted, finalIsYouTube])

    const handleRewatchConfirm = (confirmed: boolean) => {
        setShowRewatchDialog(false)
        if (!confirmed) {
            if (onNextVideo && nextVideo) {
                onNextVideo()
            }
        }
    }

    const detectYouTube = () => {
        if (isYouTube) {
            // Para YouTube, usar duração do vídeo se disponível
            if (video.duracao) {
                setDuration(video.duracao)
            }
        }
    }

    // Carregar metadados do vídeo
    useEffect(() => {
        if (isYouTube) {
            detectYouTube()
            return
        }

        const videoElement = videoRef.current
        if (!videoElement) return

        const handleLoadedMetadata = () => {
            setDuration(videoElement.duration)
            setCurrentTime(videoElement.currentTime)
        }

        const handlePlay = () => setIsPlaying(true)
        const handlePause = () => setIsPlaying(false)

        videoElement.addEventListener("loadedmetadata", handleLoadedMetadata)
        videoElement.addEventListener("play", handlePlay)
        videoElement.addEventListener("pause", handlePause)

        return () => {
            videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata)
            videoElement.removeEventListener("play", handlePlay)
            videoElement.removeEventListener("pause", handlePause)
        }
    }, [isYouTube, video.duracao])

    // Eventos de tempo do vídeo
    useEffect(() => {
        if (isYouTube) return // YouTube não suporta esses eventos via iframe

        const videoElement = videoRef.current
        if (!videoElement) return

        const handleTimeUpdate = () => {
            const time = videoElement.currentTime
            const videoDuration = videoElement.duration || duration

            if (!Number.isFinite(time) || !Number.isFinite(videoDuration) || videoDuration <= 0) {
                return
            }

            setCurrentTime(time)
            setDuration(videoDuration)

            if (!wasCompleted) {
                // Salvar progresso a cada 5 segundos
                if (Math.floor(time) % 5 === 0 && Math.floor(time) !== Math.floor(progress.tempoAssistido)) {
                    saveProgress(time, videoDuration)
                }

                // Verificar se chegou ao fim do vídeo (90% ou mais) - apenas uma vez
                if (time >= videoDuration * 0.9 && !progress.concluido && !completionChecked) {
                    setCompletionChecked(true)
                    handleVideoCompletion()
                }
            }

            // Notificar mudança de progresso
            if (onProgressChange) {
                const progressPercent = (time / videoDuration) * 100
                onProgressChange(progressPercent)
            }
        }

        videoElement.addEventListener("timeupdate", handleTimeUpdate)
        return () => {
            videoElement.removeEventListener("timeupdate", handleTimeUpdate)
        }
    }, [
        progress.tempoAssistido,
        progress.concluido,
        duration,
        isYouTube,
        saveProgress,
        onProgressChange,
        completionChecked,
        wasCompleted,
    ])

    // Eventos de fim do vídeo
    useEffect(() => {
        if (isYouTube) return // YouTube não suporta esses eventos via iframe

        const videoElement = videoRef.current
        if (!videoElement) return

        const handleEnded = () => {
            setIsPlaying(false)
            if (!completionChecked && !wasCompleted) {
                setCompletionChecked(true)
                handleVideoCompletion()
            }
            setShouldAutoPlay(true)
        }

        videoElement.addEventListener("ended", handleEnded)
        return () => {
            videoElement.removeEventListener("ended", handleEnded)
        }
    }, [isYouTube, completionChecked, wasCompleted])

    const handleVideoCompletion = async () => {
        if (progress.concluido || wasCompleted) return

        try {
            await markAsCompleted()
            setShowCompletionBadge(true)

            toast({
                title: "Vídeo concluído!",
                description: `Você completou "${video.titulo}"`,
                variant: "default",
            })

            if (nextVideo && onNextVideo) {
                setShowCompletionPopup(true)
                setCountdown(3)

                const countdownInterval = setInterval(() => {
                    setCountdown((prev) => {
                        if (prev <= 1) {
                            clearInterval(countdownInterval)
                            setShowCompletionPopup(false)
                            onNextVideo()
                            return 0
                        }
                        return prev - 1
                    })
                }, 1000)
            }

            // Verificar se é o último vídeo da categoria
            if (onProgressChange) {
                onProgressChange(100)
            }

            // Verificar se o curso foi completamente concluído
            if (onCourseComplete && totalVideos && completedVideos !== undefined) {
                const newCompletedCount = completedVideos + 1
                console.log(`Vídeo concluído! ${newCompletedCount}/${totalVideos}`)

                if (newCompletedCount >= totalVideos) {
                    console.log("Último vídeo concluído! Chamando onCourseComplete...")
                    setTimeout(() => {
                        onCourseComplete(cursoId)
                    }, 1000)
                }
            }

            // Esconder badge após 3 segundos
            setTimeout(() => setShowCompletionBadge(false), 3000)
        } catch (error) {
            console.error("Erro ao marcar vídeo como concluído:", error)
        }
    }

    const togglePlay = () => {
        if (isYouTube) {
            // Para YouTube, apenas marcar como concluído se necessário
            if (!progress.concluido && duration > 0) {
                const progressPercent = (currentTime / duration) * 100
                if (progressPercent >= 90) {
                    handleVideoCompletion()
                }
            }
            return
        }

        const videoElement = videoRef.current
        if (!videoElement) return

        if (isPlaying) {
            videoElement.pause()
        } else {
            videoElement.play()
        }
    }

    const handleFullscreen = () => {
        if (isYouTube) {
            // Para YouTube, deixar o iframe lidar com fullscreen
            return
        }

        const videoElement = videoRef.current
        if (!videoElement) return

        if (videoElement.requestFullscreen) {
            videoElement.requestFullscreen()
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    const progressPercent =
        duration > 0 && Number.isFinite(currentTime) && Number.isFinite(duration)
            ? Math.min((currentTime / duration) * 100, 100)
            : 0

    // Se for vídeo do YouTube ou problemático, usar o componente especializado
    if (finalIsYouTube) {
        return (
            <YouTubePlayerWithProgress
                video={video}
                cursoId={cursoId}
                moduloId={moduloId}
                userId={userId}
                onProgressChange={onProgressChange}
                onCourseComplete={onCourseComplete}
                totalVideos={totalVideos}
                completedVideos={completedVideos}
                className={className}
                nextVideo={nextVideo}
                onNextVideo={onNextVideo}
            />
        )
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Badge de conclusão */}
            {progress.concluido && (
                <div className="absolute top-4 right-4 z-10 animate-pulse">
                    <Badge variant="default" className="bg-green-500 text-white">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Concluído!
                    </Badge>
                </div>
            )}

            {/* Player de vídeo */}
            <div className="relative bg-black rounded-lg overflow-hidden">
                {video.source === "upload" ? (
                    // Para vídeos upload, usar URL assinada
                    <>
                        {urlLoading && (
                            <div className="flex items-center justify-center h-64 bg-gray-900">
                                <div className="text-white">Carregando vídeo...</div>
                            </div>
                        )}
                        {urlError && (
                            <div className="flex items-center justify-center h-64 bg-gray-900">
                                <div className="text-red-400">Erro ao carregar vídeo: {urlError}</div>
                            </div>
                        )}
                        {signedUrl && (
                            <video
                                ref={videoRef}
                                src={signedUrl}
                                className="w-full aspect-video"
                                poster={video.thumbnail_url}
                                controls={false}
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                                autoPlay={shouldAutoPlay}
                            />
                        )}
                    </>
                ) : (
                    // Para vídeos YouTube, usar URL original
                    <video
                        ref={videoRef}
                        src={video.url_video}
                        className="w-full aspect-video"
                        poster={video.thumbnail_url}
                        controls={false}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        autoPlay={shouldAutoPlay}
                    />
                )}

                {/* Botão fullscreen */}
                <button
                    onClick={handleFullscreen}
                    className="absolute bottom-4 right-4 bg-black/60 text-white rounded-full p-2 hover:bg-black/80 transition z-10"
                    title="Tela cheia"
                    type="button"
                >
                    <Maximize2 className="w-5 h-5" />
                </button>

                {/* Controles customizados */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={togglePlay} className="text-white hover:bg-white/20">
                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </Button>

                        <div className="flex-1">
                            <Progress value={progressPercent} className="h-2 bg-white/20" />
                        </div>

                        <span className="text-white text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
                    </div>
                </div>
            </div>

            {/* Informações do vídeo */}
            <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{video.titulo}</h3>

                {/* Progresso */}
                <div className="flex items-center gap-2 mb-2">
                    <Progress value={progress.percentualAssistido} className="flex-1 h-2" />
                    <span className="text-sm text-gray-600 font-medium">{Math.round(progress.percentualAssistido)}%</span>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2">
                    {progress.concluido ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Vídeo concluído
                        </Badge>
                    ) : progress.percentualAssistido > 0 ? (
                        <Badge variant="secondary">Em andamento</Badge>
                    ) : (
                        <Badge variant="outline">Não iniciado</Badge>
                    )}

                    {progress.dataConclusao && (
                        <span className="text-xs text-gray-500">
              Concluído em {new Date(progress.dataConclusao).toLocaleDateString()}
            </span>
                    )}
                </div>
            </div>

            <Dialog open={showCompletionPopup} onOpenChange={setShowCompletionPopup}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            Vídeo Concluído!
                        </DialogTitle>
                    </DialogHeader>
                    <div className="text-center py-4">
                        <p className="mb-4">Parabéns! Você concluiu "{video.titulo}".</p>
                        {nextVideo && (
                            <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                <p className="text-sm text-gray-600 mb-2">Próximo vídeo:</p>
                                <p className="font-semibold">{nextVideo.titulo}</p>
                                <p className="text-sm text-blue-600 mt-2">Iniciando em {countdown} segundos...</p>
                                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                                        style={{ width: `${((3 - countdown) / 3) * 100}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter className="flex gap-2">
                        <Button variant="outline" onClick={() => setShowCompletionPopup(false)}>
                            Ficar aqui
                        </Button>
                        {nextVideo && onNextVideo && (
                            <Button
                                onClick={() => {
                                    setShowCompletionPopup(false)
                                    onNextVideo()
                                }}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <SkipForward className="h-4 w-4 mr-2" />
                                Próximo vídeo
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showRewatchDialog} onOpenChange={setShowRewatchDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            Vídeo já concluído
                        </DialogTitle>
                    </DialogHeader>
                    <div className="text-center py-4">
                        <div className="bg-green-50 p-4 rounded-lg mb-4">
                            <p className="text-sm text-green-800 mb-2">
                                Você já concluiu este vídeo em{" "}
                                {progress.dataConclusao ? new Date(progress.dataConclusao).toLocaleDateString() : "uma data anterior"}.
                            </p>
                            <p className="text-sm text-green-600">Progresso: 100% completo</p>
                        </div>
                        <p className="mb-4">Deseja realmente assistir novamente?</p>
                    </div>
                    <DialogFooter className="flex gap-2">
                        <Button variant="outline" onClick={() => handleRewatchConfirm(false)}>
                            {nextVideo ? "Ir para próximo" : "Não, voltar"}
                        </Button>
                        <Button onClick={() => handleRewatchConfirm(true)} className="bg-green-600 hover:bg-green-700">
                            Sim, assistir novamente
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Loading state */}
            {progress.loading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <div className="text-sm text-gray-600">Carregando progresso...</div>
                </div>
            )}
        </div>
    )
}
