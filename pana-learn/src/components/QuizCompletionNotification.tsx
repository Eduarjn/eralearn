"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Target, Clock, BookOpen, X, Sparkles, CheckCircle } from "lucide-react"

interface QuizCompletionNotificationProps {
    courseId: string
    courseName: string
    isVisible: boolean
    onClose: () => void
    onStartQuiz: () => void
    totalQuestions?: number
    timeLimit?: number
    passPercentage?: number
}

export function QuizCompletionNotification({
                                               courseId,
                                               courseName,
                                               isVisible,
                                               onClose,
                                               onStartQuiz,
                                               totalQuestions = 20,
                                               timeLimit = 30,
                                               passPercentage = 80,
                                           }: QuizCompletionNotificationProps) {
    const [isAnimating, setIsAnimating] = useState(false)

    useEffect(() => {
        if (isVisible) {
            setIsAnimating(true)
        }
    }, [isVisible])

    if (!isVisible) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card
                className={`max-w-lg w-full transform transition-all duration-500 ${
                    isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
                }`}
            >
                <CardContent className="p-0">
                    {/* Header com gradiente */}
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-t-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2">
                            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20 h-8 w-8 p-0">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                            <div className="bg-white/20 p-2 rounded-full">
                                <Trophy className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">🎉 Parabéns!</h3>
                                <p className="text-green-100">Você concluiu todos os vídeos!</p>
                            </div>
                        </div>

                        <div className="bg-white/10 p-3 rounded-lg">
                            <p className="text-sm font-medium mb-1">Curso concluído:</p>
                            <p className="text-lg font-bold">{courseName}</p>
                        </div>

                        {/* Efeito de brilho */}
                        <div className="absolute -top-2 -right-2 text-yellow-300 animate-pulse">
                            <Sparkles className="h-8 w-8" />
                        </div>
                    </div>

                    {/* Conteúdo principal */}
                    <div className="p-6 space-y-6">
                        {/* Mensagem principal */}
                        <div className="text-center">
                            <div className="bg-green-50 p-4 rounded-lg mb-4">
                                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                <p className="text-green-800 font-medium">
                                    Agora você pode fazer o quiz final para obter seu certificado!
                                </p>
                            </div>
                        </div>

                        {/* Informações do quiz */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <Target className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                                <div className="text-sm font-semibold">{totalQuestions}</div>
                                <div className="text-xs text-muted-foreground">Perguntas</div>
                            </div>

                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <Clock className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                                <div className="text-sm font-semibold">{timeLimit} min</div>
                                <div className="text-xs text-muted-foreground">Tempo limite</div>
                            </div>

                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                                <Trophy className="h-5 w-5 text-green-600 mx-auto mb-1" />
                                <div className="text-sm font-semibold">{passPercentage}%</div>
                                <div className="text-xs text-muted-foreground">Para passar</div>
                            </div>
                        </div>

                        {/* Regras do quiz */}
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                            <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                Regras importantes:
                            </h4>
                            <ul className="text-sm text-amber-700 space-y-1">
                                <li>
                                    • Você precisa acertar pelo menos {Math.ceil((passPercentage / 100) * totalQuestions)} de{" "}
                                    {totalQuestions} perguntas
                                </li>
                                <li>• Tempo limite de {timeLimit} minutos</li>
                                <li>• Se não passar, você pode tentar novamente</li>
                                <li>• Não será mostrado quais respostas estão corretas</li>
                            </ul>
                        </div>

                        {/* Botões de ação */}
                        <div className="flex gap-3">
                            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                                Fazer Depois
                            </Button>

                            <Button onClick={onStartQuiz} className="flex-1 bg-green-600 hover:bg-green-700">
                                <Trophy className="h-4 w-4 mr-2" />
                                Começar Quiz
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
