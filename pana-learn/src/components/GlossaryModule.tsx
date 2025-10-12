"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, BookOpen, ArrowRight } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface GlossaryTerm {
    id: string
    term: string
    definition: string
    category?: string
}

interface GlossaryModuleProps {
    courseId: string
    userId?: string
    onComplete: () => void
    isCompleted: boolean
}

const NVIDIA_GLOSSARY_TERMS: GlossaryTerm[] = [
    {
        id: "1",
        term: "SR - Send Request",
        definition: "Uma operação RDMA que envia dados de um nó para outro sem intervenção da CPU do receptor.",
        category: "Operations",
    },
    {
        id: "2",
        term: "RR - Receive Request",
        definition: "Uma operação RDMA que prepara um buffer para receber dados de outro nó.",
        category: "Operations",
    },
    {
        id: "3",
        term: "RDMA",
        definition:
            "Remote Direct Memory Access - tecnologia que permite acesso direto à memória de um computador remoto sem envolver o processador.",
        category: "Core Concepts",
    },
    {
        id: "4",
        term: "QP - Queue Pair",
        definition: "Par de filas (send e receive) usado para comunicação RDMA entre dois endpoints.",
        category: "Architecture",
    },
    {
        id: "5",
        term: "CQ - Completion Queue",
        definition: "Fila que contém notificações de conclusão de operações RDMA.",
        category: "Architecture",
    },
    {
        id: "6",
        term: "WR - Work Request",
        definition: "Solicitação de trabalho submetida para uma fila de envio ou recebimento.",
        category: "Operations",
    },
    {
        id: "7",
        term: "WC - Work Completion",
        definition: "Notificação de que uma Work Request foi processada.",
        category: "Operations",
    },
    {
        id: "8",
        term: "InfiniBand",
        definition: "Padrão de comunicação de alta performance usado em computação de alto desempenho.",
        category: "Protocols",
    },
]

export function GlossaryModule({ courseId, userId, onComplete, isCompleted }: GlossaryModuleProps) {
    const [currentTermIndex, setCurrentTermIndex] = useState(0)
    const [studiedTerms, setStudiedTerms] = useState<Set<string>>(new Set())
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()

    const currentTerm = NVIDIA_GLOSSARY_TERMS[currentTermIndex]
    const progress = (studiedTerms.size / NVIDIA_GLOSSARY_TERMS.length) * 100
    const allTermsStudied = studiedTerms.size === NVIDIA_GLOSSARY_TERMS.length

    useEffect(() => {
        if (isCompleted) {
            setStudiedTerms(new Set(NVIDIA_GLOSSARY_TERMS.map((t) => t.id)))
        }
    }, [isCompleted])

    const handleStudyTerm = () => {
        const newStudiedTerms = new Set(studiedTerms)
        newStudiedTerms.add(currentTerm.id)
        setStudiedTerms(newStudiedTerms)

        if (currentTermIndex < NVIDIA_GLOSSARY_TERMS.length - 1) {
            setCurrentTermIndex(currentTermIndex + 1)
        }
    }

    const handleCompleteGlossary = async () => {
        if (!userId || !allTermsStudied) return

        setIsLoading(true)
        try {
            // Save glossary completion to database
            const { error } = await supabase.from("video_progress").upsert({
                usuario_id: userId,
                video_id: `glossary-${courseId}`,
                curso_id: courseId,
                tempo_assistido: NVIDIA_GLOSSARY_TERMS.length * 30, // 30 seconds per term
                tempo_total: NVIDIA_GLOSSARY_TERMS.length * 30,
                percentual_assistido: 100,
                concluido: true,
            })

            if (error) {
                console.error("Error saving glossary progress:", error)
                throw error
            }

            toast({
                title: "Glossário concluído!",
                description: "Agora você pode acessar os vídeos do curso.",
                variant: "default",
            })

            onComplete()
        } catch (error) {
            console.error("Error completing glossary:", error)
            toast({
                title: "Erro",
                description: "Erro ao salvar progresso do glossário.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handlePreviousTerm = () => {
        if (currentTermIndex > 0) {
            setCurrentTermIndex(currentTermIndex - 1)
        }
    }

    const handleNextTerm = () => {
        if (currentTermIndex < NVIDIA_GLOSSARY_TERMS.length - 1) {
            setCurrentTermIndex(currentTermIndex + 1)
        }
    }

    if (isCompleted) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Glossário Concluído
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-4">
                        <div className="bg-green-50 p-4 rounded-lg mb-4">
                            <p className="text-green-800 font-medium">Você já concluiu o glossário deste curso!</p>
                            <p className="text-sm text-green-600 mt-1">Agora você pode acessar todos os vídeos do curso.</p>
                        </div>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 w-3 mr-1" />
                            {NVIDIA_GLOSSARY_TERMS.length} termos estudados
                        </Badge>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        Glossário RDMA - Fundamentos
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Antes de assistir aos vídeos, estude os termos fundamentais do RDMA Programming.
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Progresso do Glossário</span>
                            <span className="text-sm text-muted-foreground">
                {studiedTerms.size}/{NVIDIA_GLOSSARY_TERMS.length} termos
              </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>
                </CardContent>
            </Card>

            {/* Current Term */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <Badge variant="outline">
                            Termo {currentTermIndex + 1} de {NVIDIA_GLOSSARY_TERMS.length}
                        </Badge>
                        <Badge variant={studiedTerms.has(currentTerm.id) ? "default" : "secondary"}>
                            {studiedTerms.has(currentTerm.id) ? "Estudado" : "Novo"}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center space-y-4">
                        <div className="bg-blue-50 p-6 rounded-lg">
                            <h3 className="text-2xl font-bold text-blue-900 mb-2">{currentTerm.term}</h3>
                            {currentTerm.category && (
                                <Badge variant="outline" className="mb-4">
                                    {currentTerm.category}
                                </Badge>
                            )}
                            <p className="text-blue-800 leading-relaxed">{currentTerm.definition}</p>
                        </div>

                        {!studiedTerms.has(currentTerm.id) && (
                            <Button onClick={handleStudyTerm} className="bg-blue-600 hover:bg-blue-700">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Marcar como Estudado
                            </Button>
                        )}
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between items-center pt-4 border-t">
                        <Button variant="outline" onClick={handlePreviousTerm} disabled={currentTermIndex === 0}>
                            Anterior
                        </Button>

                        <span className="text-sm text-muted-foreground">
              {currentTermIndex + 1} / {NVIDIA_GLOSSARY_TERMS.length}
            </span>

                        <Button
                            variant="outline"
                            onClick={handleNextTerm}
                            disabled={currentTermIndex === NVIDIA_GLOSSARY_TERMS.length - 1}
                        >
                            Próximo
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Complete Glossary */}
            {allTermsStudied && (
                <Card className="border-green-200 bg-green-50">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-green-900">Parabéns! Você estudou todos os termos</h3>
                                <p className="text-green-700 mt-1">Agora você pode prosseguir para os vídeos do curso.</p>
                            </div>
                            <Button onClick={handleCompleteGlossary} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                                {isLoading ? "Salvando..." : "Concluir Glossário"}
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}