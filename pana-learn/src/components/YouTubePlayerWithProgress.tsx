"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"
import { CheckCircle, Play, Pause, Maximize2, SkipForward } from "lucide-react"
import { useVideoProgress } from "@/hooks/useVideoProgress"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

declare global {
    interface Window {
        YT: {
            Player: any
            PlayerState: {
                UNSTARTED: number
                ENDED: number
                PLAYING: number
                PAUSED: number
                BUFFERING: number
                CUED: number
            }
        }
        onYouTubeIframeAPIReady: () => void
    }
}

interface YouTubePlayerWithProgressProps {
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

export const YouTubePlayerWithProgress: React.FC<YouTubePlayerWithProgressProps> = ({
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
    const playerRef = useRef<any>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [showCompletionBadge, setShowCompletionBadge] = useState(false)
    const [completionChecked, setCompletionChecked] = useState(false)
    const [playerReady, setPlayerReady] = useState(false)
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

    const extractYouTubeVideoId = (url: string): string => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
        const match = url.match(regExp)
        return match && match[2].length === 11 ? match[2] : ""
    }

    const youtubeVideoId = extractYouTubeVideoId(video.url_video)

    useEffect(() => {
        if (!youtubeVideoId) return

        if (window.YT && window.YT.Player) {
            initializePlayer()
            return
        }

        const tag = document.createElement("script")
        tag.src = "https://www.youtube.com/iframe_api"
        const firstScriptTag = document.getElementsByTagName("script")[0]
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

        window.onYouTubeIframeAPIReady = () => {
            initializePlayer()
        }
    }, [youtubeVideoId])

    const initializePlayer = useCallback(() => {
        if (!containerRef.current || !youtubeVideoId || playerRef.current) return

        playerRef.current = new window.YT.Player(containerRef.current, {
            height: "100%",
            width: "100%",
            videoId: youtubeVideoId,
            playerVars: {
                rel: 0,
                modestbranding: 1,
                showinfo: 0,
                controls: 1,
                enablejsapi: 1,
                origin: window.location.origin,
            },
            events: {
                onReady: (event: any) => {
                    console.log("YouTube Player pronto")
                    setPlayerReady(true)
                    setDuration(event.target.getDuration())
                },
                onStateChange: (event: any) => {
                    handleStateChange(event)
                },
                onError: (event: any) => {
                    console.error("Erro no YouTube Player:", event)
                },
            },
        })
    }, [youtubeVideoId])

    useEffect(() => {
        if (wasCompleted && playerReady) {
            setShowRewatchDialog(true)
        }
    }, [wasCompleted, playerReady])

    const handleRewatchConfirm = (confirmed: boolean) => {
        setShowRewatchDialog(false)
        if (!confirmed) {
            if (onNextVideo && nextVideo) {
                onNextVideo()
            }
        }
    }

    const handleStateChange = useCallback(
        (event: any) => {
            const player = event.target
            const state = event.data

            switch (state) {
                case window.YT.PlayerState.PLAYING:
                    setIsPlaying(true)
                    startProgressTracking()
                    break
                case window.YT.PlayerState.PAUSED:
                    setIsPlaying(false)
                    stopProgressTracking()
                    break
                case window.YT.PlayerState.ENDED:
                    setIsPlaying(false)
                    stopProgressTracking()
                    if (!completionChecked) {
                        setCompletionChecked(true)
                        handleVideoCompletion()
                    }
                    break
                case window.YT.PlayerState.BUFFERING:
                    break
            }
        },
        [completionChecked],
    )

    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

    const startProgressTracking = useCallback(() => {
        if (progressIntervalRef.current) return

        progressIntervalRef.current = setInterval(() => {
            if (playerRef.current && playerReady) {
                try {
                    const currentTime = playerRef.current.getCurrentTime()
                    const duration = playerRef.current.getDuration()

                    setCurrentTime(currentTime)
                    setDuration(duration)

                    if (Math.floor(currentTime) % 5 === 0 && Math.floor(currentTime) !== Math.floor(progress.tempoAssistido)) {
                        saveProgress(currentTime, duration)
                    }

                    if (duration > 0 && currentTime >= duration * 0.9 && !progress.concluido && !completionChecked) {
                        setCompletionChecked(true)
                        handleVideoCompletion()
                    }

                    if (onProgressChange) {
                        const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0
                        onProgressChange(progressPercent)
                    }
                } catch (error) {
                    console.error("Erro ao obter progresso do YouTube:", error)
                }
            }
        }, 1000)
    }, [playerReady, progress.tempoAssistido, progress.concluido, completionChecked, saveProgress, onProgressChange])

    const stopProgressTracking = useCallback(() => {
        if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current)
            progressIntervalRef.current = null
        }
    }, [])

    useEffect(() => {
        return () => {
            stopProgressTracking()
        }
    }, [stopProgressTracking])

    const handleVideoCompletion = async () => {
        if (progress.concluido && !wasCompleted) return

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

            if (onProgressChange) {
                onProgressChange(100)
            }

            if (onCourseComplete && totalVideos && completedVideos !== undefined) {
                const newCompletedCount = completedVideos + 1
                if (newCompletedCount >= totalVideos) {
                    console.log("🎯 Último vídeo do YouTube concluído! Chamando onCourseComplete...")
                    onCourseComplete(cursoId)
                }
            }

            setTimeout(() => setShowCompletionBadge(false), 3000)
        } catch (error) {
            console.error("Erro ao marcar vídeo como concluído:", error)
        }
    }

    const togglePlay = () => {
        if (!playerRef.current || !playerReady) return

        try {
            if (isPlaying) {
                playerRef.current.pauseVideo()
            } else {
                playerRef.current.playVideo()
            }
        } catch (error) {
            console.error("Erro ao controlar player:", error)
        }
    }

    const handleFullscreen = () => {
        if (!playerRef.current || !playerReady) return

        try {
            playerRef.current.requestFullscreen()
        } catch (error) {
            console.error("Erro ao entrar em tela cheia:", error)
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

    return (
        <div className={`space-y-4 ${className}`}>
            {progress.concluido && (
                <div className="absolute top-4 right-4 z-10 animate-pulse">
                    <Badge variant="default" className="bg-green-500 text-white">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Concluído!
                    </Badge>
                </div>
            )}

            <div className="relative bg-black rounded-lg overflow-hidden">
                <div className="relative">
                    <div ref={containerRef} className="w-full aspect-video" />

                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded z-20">YouTube</div>

                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-20">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={togglePlay}
                                className="text-white hover:bg-white/20"
                                disabled={!playerReady}
                            >
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

                <button
                    onClick={handleFullscreen}
                    className="absolute bottom-4 right-4 bg-black/60 text-white rounded-full p-2 hover:bg-black/80 transition z-30"
                    title="Tela cheia"
                    type="button"
                    disabled={!playerReady}
                >
                    <Maximize2 className="w-5 h-5" />
                </button>
            </div>

            <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{video.titulo}</h3>

                <div className="flex items-center gap-2 mb-2">
                    <Progress value={progress.percentualAssistido} className="flex-1 h-2" />
                    <span className="text-sm text-gray-600 font-medium">{Math.round(progress.percentualAssistido)}%</span>
                </div>

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
                        <p className="mb-4">Você já concluiu este vídeo. Deseja realmente assistir novamente?</p>
                    </div>
                    <DialogFooter className="flex gap-2">
                        <Button variant="outline" onClick={() => handleRewatchConfirm(false)}>
                            Não, pular
                        </Button>
                        <Button onClick={() => handleRewatchConfirm(true)} className="bg-green-600 hover:bg-green-700">
                            Sim, assistir novamente
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {progress.loading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <div className="text-sm text-gray-600">Carregando progresso...</div>
                </div>
            )}
        </div>
    )
}
