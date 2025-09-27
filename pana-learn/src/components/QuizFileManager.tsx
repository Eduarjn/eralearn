"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { FileText, Upload, Download } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface QuizQuestion {
    pergunta: string
    opcoes: string[]
    resposta_correta: number
    explicacao?: string
}

interface QuizFileManagerProps {
    courseId: string
    courseName: string
    category: string
}

export const QuizFileManager: React.FC<QuizFileManagerProps> = ({ courseId, courseName, category }) => {
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([])
    const [loading, setLoading] = useState(false)
    const [fileExists, setFileExists] = useState(false)

    // Carregar perguntas do quiz
    const loadQuizQuestions = async () => {
        try {
            setLoading(true)

            // Tentar carregar do banco de dados primeiro
            const { data: quizData, error } = await supabase
                .from("quiz_configuracao")
                .select("perguntas")
                .eq("curso_id", courseId)
                .single()

            if (quizData && quizData.perguntas) {
                setQuizQuestions(quizData.perguntas)
                setFileExists(true)
            } else {
                // Se não existir no banco, tentar carregar do arquivo
                await loadFromFile()
            }
        } catch (error) {
            console.error("Erro ao carregar quiz:", error)
        } finally {
            setLoading(false)
        }
    }

    // Carregar do arquivo de texto/markdown
    const loadFromFile = async () => {
        try {
            // Tentar diferentes formatos de arquivo
            const possiblePaths = [
                `/opt/quiz/${category.toLowerCase()}.txt`,
                `/opt/quiz/${courseName.toLowerCase().replace(/\s+/g, "-")}.txt`,
                `/opt/quiz/${courseId}.txt`,
                `/opt/quiz/${category.toLowerCase()}.md`,
                `/opt/quiz/${courseName.toLowerCase().replace(/\s+/g, "-")}.md`,
                `/opt/quiz/${courseId}.md`,
            ]

            for (const path of possiblePaths) {
                try {
                    const response = await fetch(path)
                    if (response.ok) {
                        const content = await response.text()
                        const questions = parseQuizFile(content)
                        if (questions.length > 0) {
                            setQuizQuestions(questions)
                            setFileExists(true)

                            // Salvar no banco de dados para cache
                            await saveToDatabase(questions)
                            break
                        }
                    }
                } catch (err) {
                    // Continuar tentando outros caminhos
                    continue
                }
            }
        } catch (error) {
            console.error("Erro ao carregar arquivo de quiz:", error)
        }
    }

    // Parse do arquivo de quiz
    const parseQuizFile = (content: string): QuizQuestion[] => {
        const questions: QuizQuestion[] = []
        const lines = content.split("\n").filter((line) => line.trim())

        let currentQuestion: Partial<QuizQuestion> = {}
        let currentOptions: string[] = []
        let questionMode = false

        for (const line of lines) {
            const trimmedLine = line.trim()

            // Detectar início de pergunta
            if (trimmedLine.match(/^\d+\.|^Q\d+:|^Pergunta \d+:/i)) {
                // Salvar pergunta anterior se existir
                if (currentQuestion.pergunta && currentOptions.length > 0) {
                    questions.push({
                        pergunta: currentQuestion.pergunta,
                        opcoes: [...currentOptions],
                        resposta_correta: currentQuestion.resposta_correta || 0,
                        explicacao: currentQuestion.explicacao,
                    })
                }

                // Iniciar nova pergunta
                currentQuestion = {
                    pergunta: trimmedLine.replace(/^\d+\.|^Q\d+:|^Pergunta \d+:/i, "").trim(),
                }
                currentOptions = []
                questionMode = true
            }
            // Detectar opções (a), b), c), d) ou A), B), C), D)
            else if (trimmedLine.match(/^[a-dA-D]\)/)) {
                const option = trimmedLine.replace(/^[a-dA-D]\)/, "").trim()
                currentOptions.push(option)
            }
            // Detectar resposta correta
            else if (trimmedLine.match(/^(Resposta|Gabarito|Correta):/i)) {
                const answer = trimmedLine
                    .replace(/^(Resposta|Gabarito|Correta):/i, "")
                    .trim()
                    .toLowerCase()
                const answerIndex = ["a", "b", "c", "d"].indexOf(answer.charAt(0))
                if (answerIndex !== -1) {
                    currentQuestion.resposta_correta = answerIndex
                }
            }
            // Detectar explicação
            else if (trimmedLine.match(/^(Explicação|Justificativa):/i)) {
                currentQuestion.explicacao = trimmedLine.replace(/^(Explicação|Justificativa):/i, "").trim()
            }
        }

        // Salvar última pergunta
        if (currentQuestion.pergunta && currentOptions.length > 0) {
            questions.push({
                pergunta: currentQuestion.pergunta,
                opcoes: [...currentOptions],
                resposta_correta: currentQuestion.resposta_correta || 0,
                explicacao: currentQuestion.explicacao,
            })
        }

        return questions.slice(0, 20) // Máximo 20 perguntas
    }

    // Salvar no banco de dados
    const saveToDatabase = async (questions: QuizQuestion[]) => {
        try {
            const { error } = await supabase.from("quiz_configuracao").upsert({
                curso_id: courseId,
                perguntas: questions,
                nota_minima: 80,
                tempo_limite: 30,
                max_tentativas: 3,
            })

            if (error) {
                console.error("Erro ao salvar quiz no banco:", error)
            }
        } catch (error) {
            console.error("Erro ao salvar quiz:", error)
        }
    }

    // Gerar arquivo de exemplo
    const generateExampleFile = () => {
        const exampleContent = `1. Qual é a principal função do sistema PABX?
a) Conectar telefones internos
b) Gerenciar chamadas externas
c) Conectar e gerenciar chamadas internas e externas
d) Apenas gravar chamadas
Resposta: c
Explicação: O PABX (Private Automatic Branch Exchange) é responsável por gerenciar tanto chamadas internas quanto externas.

2. O que significa a sigla VoIP?
a) Voice over Internet Protocol
b) Video over Internet Protocol  
c) Virtual over Internet Protocol
d) Voice on Internet Platform
Resposta: a
Explicação: VoIP significa Voice over Internet Protocol, tecnologia que permite transmitir voz pela internet.

3. Qual é a vantagem principal do sistema Omnichannel?
a) Reduzir custos apenas
b) Integrar todos os canais de comunicação
c) Aumentar vendas apenas
d) Melhorar apenas o atendimento telefônico
Resposta: b
Explicação: O Omnichannel integra todos os canais de comunicação para uma experiência unificada.`

        const blob = new Blob([exampleContent], { type: "text/plain" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${category.toLowerCase()}-quiz-exemplo.txt`
        a.click()
        URL.revokeObjectURL(url)

        toast({
            title: "Arquivo de exemplo gerado",
            description: "Baixe o arquivo, edite as perguntas e coloque na pasta /opt/quiz/",
        })
    }

    useEffect(() => {
        loadQuizQuestions()
    }, [courseId])

    return (
        <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    Gerenciador de Quiz
                </h3>
                <div className="flex gap-2">
                    <Button onClick={generateExampleFile} variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Baixar Exemplo
                    </Button>
                    <Button onClick={loadQuizQuestions} variant="outline" size="sm" disabled={loading}>
                        <Upload className="h-4 w-4 mr-2" />
                        Recarregar
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Status do Quiz</h4>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${fileExists ? "bg-green-500" : "bg-red-500"}`} />
                            <span className="text-sm">{fileExists ? "Quiz configurado" : "Quiz não encontrado"}</span>
                        </div>
                        <div className="text-sm text-gray-600">{quizQuestions.length} pergunta(s) carregada(s)</div>
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Como configurar o quiz:</h4>
                    <ol className="text-sm text-gray-700 space-y-1">
                        <li>1. Clique em "Baixar Exemplo" para obter o modelo</li>
                        <li>2. Edite o arquivo com suas perguntas (máximo 20)</li>
                        <li>
                            3. Salve como: <code className="bg-white px-1 rounded">/opt/quiz/{category.toLowerCase()}.txt</code>
                        </li>
                        <li>4. Clique em "Recarregar" para aplicar as mudanças</li>
                    </ol>
                </div>

                {quizQuestions.length > 0 && (
                    <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Perguntas Carregadas:</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {quizQuestions.slice(0, 5).map((q, index) => (
                                <div key={index} className="text-sm">
                                    <strong>{index + 1}.</strong> {q.pergunta.substring(0, 80)}...
                                </div>
                            ))}
                            {quizQuestions.length > 5 && (
                                <div className="text-sm text-gray-500">... e mais {quizQuestions.length - 5} pergunta(s)</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
