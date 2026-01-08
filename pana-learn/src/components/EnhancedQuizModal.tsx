"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useQuiz } from "@/hooks/useQuiz"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    CheckCircle,
    XCircle,
    ArrowLeft,
    ArrowRight,
    Award,
    BookOpen,
    Target,
    Clock,
    AlertTriangle,
    Trophy,
    RotateCcw,
} from "lucide-react"
import { QuizRetryCooldownPopup } from "./QuizRetryCooldownPopup"

interface EnhancedQuizModalProps {
    courseId: string
    courseName: string
    isOpen: boolean
    onClose: () => void
    onQuizComplete: (passed: boolean, score: number) => void
}

interface QuizResult {
    nota: number
    aprovado: boolean
    acertos: number
    erros: number
    totalPerguntas: number
    tentativa: number
}

export function EnhancedQuizModal({ courseId, courseName, isOpen, onClose, onQuizComplete }: EnhancedQuizModalProps) {
    const { user, userProfile } = useAuth()
    const { toast } = useToast()
    const {
        quizConfig,
        isLoading,
        error,
        isQuizAvailable,
        userProgress,
        certificate,
        submitQuiz,
        checkQuizAvailability,
        retryState,
        resetQuizForRetry,
    } = useQuiz(userProfile?.id, courseId)

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, number>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showResults, setShowResults] = useState(false)
    const [quizResult, setQuizResult] = useState<QuizResult | null>(null)
    const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
    const [quizStartTime, setQuizStartTime] = useState<Date | null>(null)
    const [cooldownTimeRemaining, setCooldownTimeRemaining] = useState<number | null>(null)
    const [showRetryCooldownPopup, setShowRetryCooldownPopup] = useState(false)

    const QUIZ_CONFIG = {
        MAX_QUESTIONS: 20,
        PASS_PERCENTAGE: 80, // 16 out of 20 questions
        TIME_LIMIT_MINUTES: 30,
        MAX_ATTEMPTS: 3,
    }

    useEffect(() => {
        if (retryState.nextRetryTime && !retryState.canRetry) {
            const updateCooldown = () => {
                const now = new Date()
                const timeLeft = Math.max(0, Math.ceil((retryState.nextRetryTime!.getTime() - now.getTime()) / 1000))
                setCooldownTimeRemaining(timeLeft)

                if (timeLeft <= 0) {
                    setCooldownTimeRemaining(null)
                    resetQuizForRetry()
                }
            }

            updateCooldown()
            const interval = setInterval(updateCooldown, 1000)
            return () => clearInterval(interval)
        } else {
            setCooldownTimeRemaining(null)
        }
    }, [retryState.nextRetryTime, retryState.canRetry, resetQuizForRetry])

    useEffect(() => {
        if (quizStartTime && timeRemaining !== null && timeRemaining > 0) {
            const timer = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev === null || prev <= 1) {
                        handleTimeUp()
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)

            return () => clearInterval(timer)
        }
    }, [quizStartTime, timeRemaining])

    const handleTimeUp = useCallback(() => {
        if (!showResults) {
            toast({
                title: "Tempo esgotado!",
                description: "O quiz foi enviado automaticamente.",
                variant: "destructive",
            })
            handleSubmitQuiz()
        }
    }, [showResults])

    const startQuiz = useCallback(() => {
        setQuizStartTime(new Date())
        setTimeRemaining(QUIZ_CONFIG.TIME_LIMIT_MINUTES * 60)
    }, [])

    useEffect(() => {
        if (isOpen && userProfile?.id && courseId) {
            console.log("🎯 Modal opened, checking quiz availability...")
            checkQuizAvailability()
        }
    }, [isOpen, userProfile?.id, courseId, checkQuizAvailability])

    useEffect(() => {
        if (!isOpen) {
            setCurrentQuestionIndex(0)
            setAnswers({})
            setShowResults(false)
            setQuizResult(null)
            setTimeRemaining(null)
            setQuizStartTime(null)
        }
    }, [isOpen])

    useEffect(() => {
        if (userProgress && !showResults) {
            const acertos = Math.round((userProgress.nota / 100) * (quizConfig?.perguntas.length || 20))
            const erros = (quizConfig?.perguntas.length || 20) - acertos

            setShowResults(true)
            setQuizResult({
                nota: userProgress.nota,
                aprovado: userProgress.aprovado,
                acertos,
                erros,
                totalPerguntas: quizConfig?.perguntas.length || 20,
                tentativa: 1,
            })
        }
    }, [userProgress, showResults, quizConfig])

    const handleAnswerSelect = (questionId: string, answerIndex: number) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: answerIndex,
        }))
    }

    const handleNextQuestion = () => {
        if (currentQuestionIndex < (quizConfig?.perguntas.length || 0) - 1) {
            setCurrentQuestionIndex((prev) => prev + 1)
        }
    }

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1)
        }
    }

    const handleSubmitQuiz = async () => {
        if (!quizConfig) {
            console.error("No quiz config available for submission")
            return
        }

        setIsSubmitting(true)
        try {
            console.log("🎯 Submitting quiz answers...")
            const result = await submitQuiz(answers)
            if (result) {
                const totalPerguntas = quizConfig.perguntas.length
                const acertos = Math.round((result.nota / 100) * totalPerguntas)
                const erros = totalPerguntas - acertos

                const detailedResult: QuizResult = {
                    nota: result.nota,
                    aprovado: result.aprovado,
                    acertos,
                    erros,
                    totalPerguntas,
                    tentativa: 1,
                }

                setQuizResult(detailedResult)
                setShowResults(true)
                onQuizComplete(result.aprovado, result.nota)

                if (!result.aprovado && retryState.nextRetryTime) {
                    setTimeout(() => {
                        setShowRetryCooldownPopup(true)
                    }, 2000)
                }

                toast({
                    title: result.aprovado ? "🎉 Parabéns!" : "📚 Continue estudando",
                    description: result.aprovado
                        ? `Você foi aprovado com ${result.nota}% (${acertos}/${totalPerguntas} acertos)!`
                        : `Você precisa de pelo menos ${quizConfig?.nota_minima}% para ser aprovado. Você obteve ${result.nota}% (${acertos}/${totalPerguntas} acertos).`,
                    variant: result.aprovado ? "default" : "destructive",
                })
            }
        } catch (err) {
            console.error("Erro ao submeter quiz:", err)
            toast({
                title: "Erro",
                description: "Erro ao submeter respostas do quiz. Tente novamente.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    const currentQuestion = quizConfig?.perguntas[currentQuestionIndex]
    const totalQuestions = Math.min(quizConfig?.perguntas.length || 0, QUIZ_CONFIG.MAX_QUESTIONS)
    const progress = totalQuestions > 0 ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0
    const allQuestionsAnswered = totalQuestions > 0 && Object.keys(answers).length === totalQuestions
    const answeredCount = Object.keys(answers).length

    const handleStartQuiz = useCallback(() => {
        console.log("🎯 User clicked to start quiz")
        setQuizStartTime(new Date())
        setTimeRemaining(QUIZ_CONFIG.TIME_LIMIT_MINUTES * 60)
    }, [])

    if (isLoading) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Carregando quiz...</DialogTitle>
                    </DialogHeader>
                    <div className="text-center py-6">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Preparando suas perguntas...</p>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    if (error) {
        const isRetryError = error.includes("aguardar") || error.includes("minutos")

        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {isRetryError ? (
                                <Clock className="h-5 w-5 text-amber-500" />
                            ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                            )}
                            {isRetryError ? "Aguarde para tentar novamente" : "Erro ao carregar quiz"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="text-center py-6">
                        {isRetryError ? (
                            <Clock className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                        ) : (
                            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        )}
                        <p className={`mb-4 ${isRetryError ? "text-amber-600" : "text-red-600"}`}>{error}</p>

                        {cooldownTimeRemaining !== null && cooldownTimeRemaining > 0 && (
                            <div className="bg-amber-50 p-4 rounded-lg mb-4">
                                <p className="text-sm text-amber-800 mb-2">Tempo restante:</p>
                                <p className="text-2xl font-bold text-amber-600">
                                    {Math.floor(cooldownTimeRemaining / 60)}:{(cooldownTimeRemaining % 60).toString().padStart(2, "0")}
                                </p>
                                <p className="text-xs text-amber-600 mt-1">
                                    Tentativa {retryState.attemptsCount}/{retryState.maxAttempts}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-2 justify-center">
                            {!isRetryError && (
                                <Button
                                    onClick={() => {
                                        console.log("🎯 Retrying quiz availability check...")
                                        checkQuizAvailability()
                                    }}
                                    variant="outline"
                                >
                                    Tentar novamente
                                </Button>
                            )}
                            <Button onClick={onClose}>Fechar</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    if (!isQuizAvailable && !quizConfig) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Quiz não disponível
                        </DialogTitle>
                    </DialogHeader>
                    <div className="text-center py-6">
                        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">
                            Para acessar o quiz, você precisa concluir todos os vídeos do curso primeiro.
                        </p>
                        <div className="flex gap-2 justify-center">
                            <Button
                                onClick={() => {
                                    console.log("🎯 Rechecking quiz availability...")
                                    checkQuizAvailability()
                                }}
                                variant="outline"
                            >
                                Verificar novamente
                            </Button>
                            <Button onClick={onClose}>Entendi</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    if (!quizConfig || !quizConfig.perguntas || quizConfig.perguntas.length === 0) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Quiz não encontrado</DialogTitle>
                    </DialogHeader>
                    <div className="text-center py-6">
                        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">
                            Não foi possível carregar as perguntas do quiz. Tente novamente.
                        </p>
                        <div className="flex gap-2 justify-center">
                            <Button
                                onClick={() => {
                                    console.log("🎯 Reloading quiz config...")
                                    checkQuizAvailability()
                                }}
                                variant="outline"
                            >
                                Recarregar
                            </Button>
                            <Button onClick={onClose}>Fechar</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    if (certificate) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-green-600" />
                            Certificado já emitido
                        </DialogTitle>
                    </DialogHeader>
                    <div className="text-center py-6">
                        <div className="mb-4">
                            <Trophy className="h-12 w-12 text-green-600 mx-auto mb-2" />
                            <p className="font-semibold">Parabéns!</p>
                            <p className="text-sm text-muted-foreground">Você já concluiu este curso e possui um certificado.</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg mb-4">
                            <p className="text-sm">
                                <strong>Nota:</strong> {certificate.nota}%
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Concluído em: {new Date(certificate.data_conclusao).toLocaleDateString()}
                            </p>
                        </div>
                        <Button onClick={onClose}>Fechar</Button>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    if (isQuizAvailable && quizConfig && !showResults && !userProgress && !quizStartTime) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-green-600" />
                            Prova Final Disponível
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Parabéns!</h3>
                            <p className="text-muted-foreground mb-4">
                                Você concluiu todos os vídeos. Agora pode fazer o quiz para obter seu certificado!
                            </p>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="grid grid-cols-3 gap-4 text-sm text-center">
                                <div>
                                    <div className="flex items-center justify-center mb-1">
                                        <Target className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div className="font-semibold text-green-800">
                                        {Math.min(quizConfig.perguntas.length, QUIZ_CONFIG.MAX_QUESTIONS)}
                                    </div>
                                    <div className="text-green-600">Perguntas</div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-center mb-1">
                                        <Clock className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div className="font-semibold text-green-800">{QUIZ_CONFIG.TIME_LIMIT_MINUTES} min</div>
                                    <div className="text-green-600">Tempo limite</div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-center mb-1">
                                        <Award className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div className="font-semibold text-green-800">{quizConfig.nota_minima}%</div>
                                    <div className="text-green-600">Para passar</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                            <h4 className="font-semibold text-amber-800 mb-2">Regras importantes:</h4>
                            <ul className="text-sm text-amber-700 space-y-1">
                                <li>
                                    • Você precisa acertar pelo menos{" "}
                                    {Math.ceil(
                                        (quizConfig.nota_minima / 100) * Math.min(quizConfig.perguntas.length, QUIZ_CONFIG.MAX_QUESTIONS),
                                    )}{" "}
                                    de {Math.min(quizConfig.perguntas.length, QUIZ_CONFIG.MAX_QUESTIONS)} perguntas
                                </li>
                                <li>• Tempo limite de {QUIZ_CONFIG.TIME_LIMIT_MINUTES} minutos</li>
                                <li>• Se não passar, você pode tentar novamente</li>
                                <li>• Não será mostrado quais respostas estão corretas</li>
                            </ul>
                        </div>

                        <div className="flex gap-3">
                            <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
                                Fazer Depois
                            </Button>
                            <Button onClick={handleStartQuiz} className="flex-1 bg-green-600 hover:bg-green-700">
                                <Trophy className="h-4 w-4 mr-2" />
                                Começar Quiz
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    if (showResults && quizResult) {
        const canRetryQuiz = !quizResult.aprovado && retryState.canRetry && cooldownTimeRemaining === null

        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {quizResult.aprovado ? (
                                <Trophy className="h-5 w-5 text-green-600" />
                            ) : (
                                <Target className="h-5 w-5 text-red-600" />
                            )}
                            {quizResult.aprovado ? "🎉 Quiz Aprovado!" : "📚 Quiz não aprovado"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                        <div className="text-center">
                            <div
                                className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                                    quizResult.aprovado ? "bg-green-100" : "bg-red-100"
                                }`}
                            >
                                {quizResult.aprovado ? (
                                    <CheckCircle className="h-8 w-8 text-green-600" />
                                ) : (
                                    <XCircle className="h-8 w-8 text-red-600" />
                                )}
                            </div>

                            <h3 className="text-xl font-bold mb-2">{quizResult.aprovado ? "Parabéns!" : "Continue estudando"}</h3>

                            <p className="text-muted-foreground mb-4">
                                {quizResult.aprovado
                                    ? "Você foi aprovado no quiz e seu certificado foi gerado!"
                                    : `Você precisa de pelo menos ${quizConfig?.nota_minima}% para ser aprovado.`}
                            </p>

                            {!quizResult.aprovado && (
                                <div className="bg-red-50 p-4 rounded-lg mb-4">
                                    <p className="text-sm text-red-800 mb-2">
                                        {retryState.attemptsCount < retryState.maxAttempts
                                            ? "Você pode tentar novamente em 30 minutos."
                                            : "Você atingiu o limite máximo de tentativas."}
                                    </p>
                                    <p className="text-xs text-red-600">
                                        Tentativas: {retryState.attemptsCount}/{retryState.maxAttempts}
                                    </p>
                                    {cooldownTimeRemaining !== null && cooldownTimeRemaining > 0 && (
                                        <p className="text-sm font-bold text-red-600 mt-2">
                                            Próxima tentativa em: {Math.floor(cooldownTimeRemaining / 60)}:
                                            {(cooldownTimeRemaining % 60).toString().padStart(2, "0")}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Card>
                                <CardContent className="p-4 text-center">
                                    <div className="text-2xl font-bold text-green-600">{quizResult.acertos}</div>
                                    <div className="text-sm text-muted-foreground">Acertos</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4 text-center">
                                    <div className="text-2xl font-bold text-red-600">{quizResult.erros}</div>
                                    <div className="text-sm text-muted-foreground">Erros</div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Sua nota:</span>
                                <Badge variant={quizResult.aprovado ? "default" : "destructive"} className="text-lg px-3 py-1">
                                    {quizResult.nota}%
                                </Badge>
                            </div>

                            <Progress
                                value={quizResult.nota}
                                className={`h-3 ${quizResult.aprovado ? "bg-green-100" : "bg-red-100"}`}
                            />

                            <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {quizResult.acertos}/{quizResult.totalPerguntas} corretas
                </span>
                                <span>
                  Mínimo: {Math.ceil(((quizConfig?.nota_minima || 0) / 100) * quizResult.totalPerguntas)}/
                                    {quizResult.totalPerguntas}
                </span>
                            </div>
                        </div>

                        <div className="bg-muted/50 p-4 rounded-lg">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Total de perguntas:</span>
                                    <div className="font-medium">{quizResult.totalPerguntas}</div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Tentativa:</span>
                                    <div className="font-medium">
                                        {retryState.attemptsCount}/{QUIZ_CONFIG.MAX_ATTEMPTS}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            {canRetryQuiz && (
                                <Button
                                    onClick={() => {
                                        setShowResults(false)
                                        setQuizResult(null)
                                        setCurrentQuestionIndex(0)
                                        setAnswers({})
                                        resetQuizForRetry()
                                        startQuiz()
                                    }}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Tentar Novamente
                                </Button>
                            )}

                            <Button onClick={onClose} className="flex-1">
                                {quizResult.aprovado ? "Ver Certificado" : "Continuar Estudando"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                {quizConfig?.titulo}
                            </div>
                            {timeRemaining !== null && (
                                <Badge variant={timeRemaining < 300 ? "destructive" : "secondary"} className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatTime(timeRemaining)}
                                </Badge>
                            )}
                        </DialogTitle>
                        {quizConfig?.descricao && <p className="text-sm text-muted-foreground">{quizConfig.descricao}</p>}
                    </DialogHeader>

                    <div className="space-y-6">
                        <div className="bg-muted/50 p-4 rounded-lg">
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div className="text-center">
                                    <div className="font-semibold">{totalQuestions}</div>
                                    <div className="text-muted-foreground">Perguntas</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-semibold">{quizConfig?.nota_minima}%</div>
                                    <div className="text-muted-foreground">Nota mínima</div>
                                </div>
                                <div className="text-center">
                                    <div className="font-semibold">{QUIZ_CONFIG.TIME_LIMIT_MINUTES} min</div>
                                    <div className="text-muted-foreground">Tempo limite</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                <span>
                  Questão {currentQuestionIndex + 1} de {totalQuestions}
                </span>
                                <span>
                  {answeredCount}/{totalQuestions} respondidas
                </span>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>

                        {currentQuestion && (
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="mb-4">
                                        <Badge variant="outline" className="mb-3">
                                            Questão {currentQuestionIndex + 1}
                                        </Badge>
                                        <h3 className="text-lg font-semibold leading-relaxed">{currentQuestion.pergunta}</h3>
                                    </div>

                                    <div className="space-y-3">
                                        {currentQuestion.opcoes.map((opcao, index) => {
                                            const isSelected = answers[currentQuestion.id] === index
                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                                                    className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                                                        isSelected
                                                            ? "border-primary bg-primary/5 shadow-sm"
                                                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                                                isSelected ? "border-primary bg-primary" : "border-muted-foreground"
                                                            }`}
                                                        >
                                                            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                                        </div>
                                                        <span className="flex-1">{opcao}</span>
                                                    </div>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="flex justify-between items-center">
                            <Button variant="outline" onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Anterior
                            </Button>

                            <div className="text-sm text-muted-foreground">
                                {answeredCount < totalQuestions && (
                                    <span className="text-amber-600">{totalQuestions - answeredCount} pergunta(s) restante(s)</span>
                                )}
                            </div>

                            {currentQuestionIndex === totalQuestions - 1 ? (
                                <Button
                                    onClick={handleSubmitQuiz}
                                    disabled={!allQuestionsAnswered || isSubmitting}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {isSubmitting ? "Enviando..." : "Finalizar Quiz"}
                                    <CheckCircle className="h-4 w-4 ml-2" />
                                </Button>
                            ) : (
                                <Button onClick={handleNextQuestion} disabled={answers[currentQuestion?.id] === undefined}>
                                    Próxima
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <QuizRetryCooldownPopup
                isVisible={showRetryCooldownPopup}
                onClose={() => setShowRetryCooldownPopup(false)}
                retryTime={retryState.nextRetryTime || new Date()}
                attemptsCount={retryState.attemptsCount}
                maxAttempts={retryState.maxAttempts}
                courseName={courseName}
                score={quizResult?.nota || 0}
                requiredScore={quizConfig?.nota_minima || 70}
            />
        </>
    )
}
