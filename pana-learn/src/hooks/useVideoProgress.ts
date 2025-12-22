"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { supabase } from "@/lib/supabaseClient"

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
  const videoRef = useRef<HTMLVideoElement | null>(null)
  
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
  const [wasCompleted, setWasCompleted] = useState(false)
  const isSavingRef = useRef(false)
  const sessionTokenRef = useRef<string | null>(null)
  const listenersAttachedRef = useRef(false)
  const hasRestoredPositionRef = useRef(false)

  // 1. Captura token de sessão para salvar ao sair
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      sessionTokenRef.current = data.session?.access_token || null
    })
  }, [])

  // 2. Carrega o progresso do banco
  useEffect(() => {
    if (!userId || !videoId || !cursoId) {
      setProgress((prev) => ({ ...prev, loading: false }))
      return
    }

    // Reset de estado ao mudar de vídeo
    hasRestoredPositionRef.current = false
    listenersAttachedRef.current = false

    const loadProgress = async () => {
      try {
        const { data, error } = await supabase
          .from("video_progress")
          .select("*")
          .eq("user_id", userId)
          .eq("video_id", videoId)
          .maybeSingle()

        if (error && error.code !== "PGRST116") {
          console.error("Erro ao carregar:", error)
          setProgress((prev) => ({ ...prev, error: error.message, loading: false }))
          return
        }

        if (data) {
          // ✅ ALTERAÇÃO 1: Prioriza 'resume_time' para saber onde parou
          const pontoDeParada = data.resume_time ?? data.tempo_assistido ?? 0;
          console.log("📥 Progresso carregado. Retomar em:", pontoDeParada, "s")
          
          setVideoProgressId(data.id)
          setWasCompleted(data.concluido || false)
          
          setProgress({
            tempoAssistido: pontoDeParada, 
            tempoTotal: data.tempo_total || 0,
            percentualAssistido: data.concluido ? 100 : data.percentual_assistido || 0,
            concluido: data.concluido || false,
            dataConclusao: data.data_conclusao,
            loading: false,
            error: null,
          })
        } else {
          setWasCompleted(false)
          setProgress((prev) => ({ ...prev, loading: false, tempoAssistido: 0 }))
        }
      } catch (error) {
        console.error("Erro inesperado:", error)
        setProgress((prev) => ({ ...prev, loading: false }))
      }
    }

    loadProgress()
  }, [userId, videoId, cursoId])

  // 3. Lógica de Restauração de Tempo com "Buffer"
  useEffect(() => {
    const video = videoRef.current
    if (!video || progress.loading || hasRestoredPositionRef.current) return

    const tryRestore = () => {
        // Só restaura se tiver tempo salvo e ainda não tiver restaurado
        if (progress.tempoAssistido > 0 && !hasRestoredPositionRef.current) {
            // Verifica se o vídeo já carregou metadados suficientes para Seek
            if (video.readyState >= 1) { 
                
                // ✅ ALTERAÇÃO 2: Buffer de Contexto (Volta 3 segundos)
                // Se parou no 60s, volta para 57s para dar contexto.
                const safeResumeTime = Math.max(0, progress.tempoAssistido - 3);

                console.log(`🔄 Restaurando player para: ${safeResumeTime}s (Buffer aplicado)`)
                video.currentTime = safeResumeTime;
                hasRestoredPositionRef.current = true;
            }
        }
    }

    tryRestore()

    video.addEventListener('loadedmetadata', tryRestore)
    video.addEventListener('canplay', tryRestore)

    return () => {
        video.removeEventListener('loadedmetadata', tryRestore)
        video.removeEventListener('canplay', tryRestore)
    }
  }, [progress.loading, progress.tempoAssistido]) 

  // 4. Lógica de Salvamento
  const saveProgressToDatabase = useCallback(
    async (tempoAssistido: number, tempoTotal: number, concluido: boolean) => {
      if (!userId || !videoId || !cursoId) return
      if (isSavingRef.current) return

      isSavingRef.current = true

      try {
        const validTempoTotal = tempoTotal > 0 ? tempoTotal : 1
        const percentualCalculado = Math.round((tempoAssistido / validTempoTotal) * 100)
        const percentualFinal = (wasCompleted || concluido) ? 100 : percentualCalculado

        const progressData = {
          user_id: userId,
          video_id: videoId,
          curso_id: cursoId,
          tempo_assistido: Math.round(tempoAssistido),
          tempo_total: Math.round(validTempoTotal),
          // ✅ ALTERAÇÃO 3: Salva o resume_time explicitamente
          resume_time: Math.floor(tempoAssistido), 
          percentual_assistido: percentualFinal,
          concluido: wasCompleted || concluido,
          updated_at: new Date().toISOString(),
          last_watched: new Date().toISOString(),
          data_conclusao: (wasCompleted || concluido) ? (progress.dataConclusao || new Date().toISOString()) : null,
        }

        const { data, error } = await supabase
          .from("video_progress")
          .upsert(progressData, { onConflict: "user_id,video_id" })
          .select()
          .single()

        if (error) throw error

        if (data) {
          setVideoProgressId(data.id)
          if (data.concluido) setWasCompleted(true)
          
          setProgress((prev) => ({
            ...prev,
            tempoAssistido: progressData.tempo_assistido,
            percentualAssistido: percentualFinal,
            concluido: data.concluido,
            dataConclusao: data.data_conclusao
          }))
        }
      } catch (error) {
        console.error("Erro ao salvar:", error)
      } finally {
        isSavingRef.current = false
      }
    },
    [userId, videoId, cursoId, wasCompleted, progress.dataConclusao]
  )

  const saveProgress = useCallback(
    async (tempoAssistido: number, tempoTotal: number, concluido?: boolean) => {
        // Evita salvar 0s logo após carregar, antes da restauração acontecer
        if (!hasRestoredPositionRef.current && progress.tempoAssistido > 5) return;

        const isFinished = concluido || (tempoAssistido >= tempoTotal - 1 && tempoTotal > 0);
        await saveProgressToDatabase(tempoAssistido, tempoTotal, isFinished || wasCompleted)
    },
    [saveProgressToDatabase, wasCompleted, progress.tempoAssistido]
  )

  // 5. Monitoramento de Eventos (Pause, End, Unload)
  const handlePause = useCallback(() => {
    if (!videoRef.current) return
    saveProgress(videoRef.current.currentTime, videoRef.current.duration)
  }, [saveProgress])

  const handleEnded = useCallback(() => {
    if (!videoRef.current) return
    saveProgress(videoRef.current.duration, videoRef.current.duration, true)
  }, [saveProgress])

  const handleBeforeUnload = useCallback(() => {
    if (!videoRef.current || !userId || !videoId || !sessionTokenRef.current) return
    const video = videoRef.current
    
    // Preparar payload beacon
    const payload = {
        user_id: userId,
        video_id: videoId,
        curso_id: cursoId,
        tempo_assistido: Math.round(video.currentTime),
        tempo_total: Math.round(video.duration || 1),
        // ✅ ALTERAÇÃO 4: Garante resume_time no Beacon também
        resume_time: Math.floor(video.currentTime),
        percentual_assistido: wasCompleted ? 100 : Math.round((video.currentTime / video.duration) * 100),
        concluido: wasCompleted,
        last_watched: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL
    const endpoint = `${supabaseUrl}/rest/v1/video_progress?on_conflict=user_id,video_id`

    fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionTokenRef.current}`,
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '',
            'Prefer': 'return=minimal'
        },
        body: JSON.stringify(payload),
        keepalive: true
    }).catch(console.error)
  }, [userId, videoId, cursoId, wasCompleted])

  useEffect(() => {
    const interval = setInterval(() => {
      const video = videoRef.current
      if (video && !listenersAttachedRef.current) {
        video.addEventListener('pause', handlePause)
        video.addEventListener('ended', handleEnded)
        window.addEventListener('beforeunload', handleBeforeUnload)
        listenersAttachedRef.current = true
        clearInterval(interval)
      }
    }, 1000)

    return () => {
      clearInterval(interval)
      const video = videoRef.current
      if (video) {
        video.removeEventListener('pause', handlePause)
        video.removeEventListener('ended', handleEnded)
      }
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [handlePause, handleEnded, handleBeforeUnload])

  const markAsCompleted = useCallback(async () => {
    const duration = videoRef.current?.duration || 0
    await saveProgressToDatabase(duration, duration, true)
  }, [saveProgressToDatabase])

  const checkRewatch = useCallback(async (): Promise<boolean> => {
    if (!wasCompleted) return true
    return window.confirm("Você já concluiu este vídeo. Deseja assistir novamente?")
  }, [wasCompleted])

  return {
    progress,
    saveProgress,
    markAsCompleted,
    checkRewatch,
    wasCompleted,
    loading: progress.loading,
    error: progress.error,
    videoRef, 
  }
}