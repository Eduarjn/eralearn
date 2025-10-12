"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, XCircle, RotateCcw, X } from "lucide-react"

interface QuizRetryCooldownPopupProps {
    isVisible: boolean
    onClose: () => void
    retryTime: Date
    attemptsCount: number
    maxAttempts: number
    courseName: string
    score: number
    requiredScore: number
}

export function QuizRetryCooldownPopup({
                                           isVisible,
                                           onClose,
                                           retryTime,
                                           attemptsCount,
                                           maxAttempts,
                                           courseName,
                                           score,
                                           requiredScore,
                                       }: QuizRetryCooldownPopupProps) {
    const [timeRemaining, setTimeRemaining] = useState<number>(0)
    const [isAnimating, setIsAnimating] = useState(false)

    useEffect(() => {
        if (isVisible) {
            setIsAnimating(true)
        }
    }, [isVisible])

    useEffect(() => {
        if (!isVisible) return

        const updateTimer = () => {
            const now = new Date()
            const remaining = Math.max(0, Math.ceil((retryTime.getTime() - now.getTime()) / 1000))
            setTimeRemaining(remaining)

            if (remaining <= 0) {
                onClose()
            }
        }

        updateTimer()
        const interval = setInterval(updateTimer, 1000)

        return () => clearInterval(interval)
    }, [isVisible, retryTime, onClose])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    if (!isVisible) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card
                className={`max-w-lg w-full transform transition-all duration-500 ${
                    isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
                }`}
            >
                <CardContent className="p-0">
                    {/* Header com gradiente vermelho */}
                    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2">
                            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20 h-8 w-8 p-0">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                            <div className="bg-white/20 p-2 rounded-full">
                                <XCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">Quiz não aprovado</h3>
                                <p className="text-red-100">Continue estudando e tente novamente</p>
                            </div>
                        </div>

                        <div className="bg-white/10 p-3 rounded-lg">
                            <p className="text-sm font-medium mb-1">Curso:</p>
                            <p className="text-lg font-bold">{courseName}</p>
                        </div>
                    </div>

                    {/* Conteúdo principal */}
                    <div className="p-6 space-y-6">
                        {/* Resultado do quiz */}
                        <div className="text-center">
                            <div className="bg-red-50 p-4 rounded-lg mb-4">
                                <div className="flex items-center justify-center gap-4 mb-3">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-red-600">{score}%</div>
                                        <div className="text-xs text-red-500">Sua nota</div>
                                    </div>
                                    <div className="text-gray-400">vs</div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-600">{requiredScore}%</div>
                                        <div className="text-xs text-gray-500">Necessário</div>
                                    </div>
                                </div>
                                <p className="text-red-800 font-medium">
                                    Você precisa de pelo menos {requiredScore}% para ser aprovado.
                                </p>
                            </div>
                        </div>

                        {/* Tempo de espera */}
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                            <div className="flex items-center gap-3 mb-3">
                                <Clock className="h-5 w-5 text-amber-600" />
                                <h4 className="font-semibold text-amber-800">Tempo de espera para nova tentativa</h4>
                            </div>

                            <div className="text-center mb-4">
                                <div className="text-4xl font-bold text-amber-600 mb-2">{formatTime(timeRemaining)}</div>
                                <p className="text-sm text-amber-700">Você poderá tentar novamente quando o tempo acabar</p>
                            </div>

                            <div className="bg-amber-100 p-3 rounded-lg">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-amber-700">Tentativas:</span>
                                    <span className="font-medium text-amber-800">
                    {attemptsCount}/{maxAttempts}
                  </span>
                                </div>
                                {attemptsCount < maxAttempts && (
                                    <p className="text-xs text-amber-600 mt-1">
                                        Você ainda tem {maxAttempts - attemptsCount} tentativa(s) restante(s)
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Dicas de estudo */}
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                                <RotateCcw className="h-4 w-4" />
                                Dicas para melhorar:
                            </h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• Revise os vídeos do curso novamente</li>
                                <li>• Preste atenção aos pontos principais de cada módulo</li>
                                <li>• Faça anotações durante o estudo</li>
                                <li>• Use o tempo de espera para reforçar o aprendizado</li>
                            </ul>
                        </div>

                        {/* Botão de fechar */}
                        <div className="flex justify-center">
                            <Button onClick={onClose} className="bg-gray-600 hover:bg-gray-700">
                                Continuar Estudando
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}