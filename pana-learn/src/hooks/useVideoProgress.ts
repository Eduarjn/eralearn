"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { supabase } from "@/lib/supabaseClient"
import type { Database } from "@/integrations/supabase/types"

type VideoProgress = Database["public"]["Tables"]["video_progress"]["Row"]

export interface VideoProgressState {
    tempoAssistido: number
    tempoTotal: number
    percentualAssistido: number
    concluido: boolean
    dataConclusao: string | null
    loading: boolean
    error: string | null
}

export function useVideoProgress(
    userId: string | undefined,
    videoId: string | undefined,
    cursoId: string | undefined,
    moduloId?: string,
) {
    const [progress, setProgress] = useState<VideoProgressState>({
        tempoAssistido: 0,
        tempoTotal: 0,
        percentualAssistido: 0,
        concluido: false,
        dataConclusao: null,
        loading: true,
        error: null,
    })

    const [videoProgressId, setVideoProgressId] = useState<string | null>(null)
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const lastSaveTimeRef = useRef<number>(0)

    // Carregar progresso existente
    useEffect(() => {
        if (!userId || !videoId || !cursoId) {
            setProgress((prev) => ({ ...prev, loading: false }))
            return
        }

        const loadProgress = async () => {
            try {
                console.log("Carregando progresso para:", { userId, videoId, cursoId })

                const { data, error } = await supabase
                    .from("video_progress")
                    .select("*")
                    .eq("user_id", userId)
                    .eq("video_id", videoId)
                    .single()

                if (error && error.code !== "PGRST116") {
                    console.error("Erro ao carregar progresso:", error)
                    setProgress((prev) => ({ ...prev, error: error.message, loading: false }))
                    return
                }

                if (data) {
                    console.log("Progresso carregado:", data)
                    setVideoProgressId(data.id)
                    setProgress({
                        tempoAssistido: data.tempo_assistido || 0,
                        tempoTotal: data.tempo_total || 0,
                        percentualAssistido: data.percentual_assistido || 0,
                        concluido: data.concluido || false,
                        dataConclusao: data.data_conclusao,
                        loading: false,
                        error: null,
                    })
                } else {
                    console.log("Nenhum progresso encontrado, criando novo...")
                    setProgress((prev) => ({ ...prev, loading: false }))
                }
            } catch (error) {
                console.error("Erro ao carregar progresso:", error)
                setProgress((prev) => ({ ...prev, error: "Erro ao carregar progresso", loading: false }))
            }
        }

        loadProgress()
    }, [userId, videoId, cursoId])

    // Salvar progresso do vídeo
    const saveProgress = useCallback(
        async (tempoAssistido: number, tempoTotal: number, concluido?: boolean) => {
            if (!userId || !videoId || !cursoId) {
                console.log("Dados insuficientes para salvar progresso:", { userId, videoId, cursoId })
                return
            }

            const validTempoAssistido = Number.isFinite(tempoAssistido) ? tempoAssistido : 0
            const validTempoTotal = Number.isFinite(tempoTotal) && tempoTotal > 0 ? tempoTotal : 1

            const percentualCalculado = validTempoTotal > 0 ? Math.min((validTempoAssistido / validTempoTotal) * 100, 100) : 0
            const isCompleted = concluido ?? percentualCalculado >= 90

            setProgress((prev) => ({
                ...prev,
                tempoAssistido: Math.round(validTempoAssistido),
                tempoTotal: Math.round(validTempoTotal),
                percentualAssistido: Math.round(percentualCalculado),
                concluido: isCompleted,
                dataConclusao: isCompleted ? new Date().toISOString() : prev.dataConclusao,
            }))

            // Debounce: salvar no máximo a cada 2 segundos
            const now = Date.now()
            if (now - lastSaveTimeRef.current < 2000 && !concluido) {
                if (saveTimeoutRef.current) {
                    clearTimeout(saveTimeoutRef.current)
                }

                saveTimeoutRef.current = setTimeout(() => {
                    saveProgressToDatabase(validTempoAssistido, validTempoTotal, isCompleted)
                }, 2000)
                return
            }

            lastSaveTimeRef.current = now
            await saveProgressToDatabase(validTempoAssistido, validTempoTotal, isCompleted)
        },
        [userId, videoId, cursoId],
    )

    const saveProgressToDatabase = useCallback(
        async (tempoAssistido: number, tempoTotal: number, concluido: boolean) => {
            try {
                console.log("Salvando progresso no banco:", {
                    tempoAssistido,
                    tempoTotal,
                    concluido,
                })

                const progressData = {
                    user_id: userId!,
                    video_id: videoId!,
                    curso_id: cursoId!,
                    tempo_assistido: Math.round(tempoAssistido),
                    tempo_total: Math.round(tempoTotal),
                    percentual_assistido: Math.round((tempoAssistido / tempoTotal) * 100),
                    concluido,
                    data_conclusao: concluido ? new Date().toISOString() : null,
                }

                const result = await supabase
                    .from("video_progress")
                    .upsert(progressData, {
                        onConflict: "user_id,video_id",
                        ignoreDuplicates: false,
                    })
                    .select()
                    .single()

                if (result.error) {
                    console.error("Erro ao salvar progresso:", result.error)
                    return
                }

                console.log("Progresso salvo com sucesso:", result.data)
                setVideoProgressId(result.data.id)
            } catch (error) {
                console.error("Erro ao salvar progresso:", error)
            }
        },
        [userId, videoId, cursoId],
    )

    // Marcar vídeo como concluído
    const markAsCompleted = useCallback(async () => {
        if (!userId || !videoId || !cursoId) return

        try {
            console.log("Marcando vídeo como concluído")

            const result = await supabase
                .from("video_progress")
                .upsert(
                    {
                        user_id: userId,
                        video_id: videoId,
                        curso_id: cursoId,
                        concluido: true,
                        percentual_assistido: 100,
                        data_conclusao: new Date().toISOString(),
                    },
                    {
                        onConflict: "user_id,video_id",
                        ignoreDuplicates: false,
                    },
                )
                .select()
                .single()

            if (result.error) {
                console.error("Erro ao marcar como concluído:", result.error)
                return
            }

            if (result.data) {
                console.log("Vídeo marcado como concluído:", result.data)
                setProgress((prev) => ({
                    ...prev,
                    concluido: true,
                    percentualAssistido: 100,
                    dataConclusao: result.data.data_conclusao,
                }))
            }
        } catch (error) {
            console.error("Erro ao marcar como concluído:", error)
        }
    }, [userId, videoId, cursoId])

    // Limpar timeout ao desmontar
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current)
            }
        }
    }, [])

    return {
        progress,
        saveProgress,
        markAsCompleted,
        loading: progress.loading,
        error: progress.error,
    }
}
