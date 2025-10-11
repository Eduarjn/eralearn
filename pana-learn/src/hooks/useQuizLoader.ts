"use client"

import { useState, useCallback } from "react"
import { supabase } from "@/lib/supabaseClient"

interface QuizQuestion {
    id: string
    pergunta: string
    tipo: "multipla_escolha" | "verdadeiro_falso"
    alternativas: string[]
    resposta_correta: number
    explicacao?: string
}

interface QuizConfig {
    id: string
    categoria_id: string
    nota_minima: number
    perguntas: QuizQuestion[]
    mensagem_sucesso: string
    mensagem_reprova: string
}

export function useQuizLoader() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const loadQuizForCourse = useCallback(async (courseId: string): Promise<QuizConfig | null> => {
        if (!courseId) return null

        try {
            setLoading(true)
            setError(null)

            console.log("Carregando quiz para curso:", courseId)

            // Method 1: Try course-specific mapping
            let quizId: string | null = null

            const { data: mappingData } = await supabase
                .from("curso_quiz_mapping")
                .select("quiz_id")
                .eq("curso_id", courseId)
                .maybeSingle()

            if (mappingData?.quiz_id) {
                quizId = mappingData.quiz_id
                console.log("Quiz encontrado via mapeamento:", quizId)
            } else {
                // Method 2: Try by course category
                const { data: courseData } = await supabase
                    .from("cursos")
                    .select("categoria, nome")
                    .eq("id", courseId)
                    .maybeSingle()

                if (courseData?.categoria) {
                    const { data: quizData } = await supabase
                        .from("quizzes")
                        .select("id")
                        .eq("categoria", courseData.categoria)
                        .eq("ativo", true)
                        .maybeSingle()

                    if (quizData) {
                        quizId = quizData.id
                        console.log("Quiz encontrado via categoria:", quizId)
                    }
                }
            }

            if (!quizId) {
                console.log("Nenhum quiz encontrado para o curso")
                return null
            }

            // Load quiz details
            const { data: quiz, error: quizError } = await supabase
                .from("quizzes")
                .select("*")
                .eq("id", quizId)
                .eq("ativo", true)
                .single()

            if (quizError || !quiz) {
                console.error("Erro ao carregar quiz:", quizError)
                return null
            }

            // Load quiz questions
            const { data: questions, error: questionsError } = await supabase
                .from("quiz_perguntas")
                .select("*")
                .eq("quiz_id", quizId)
                .order("ordem")

            if (questionsError) {
                console.error("Erro ao carregar perguntas:", questionsError)
                return null
            }

            // Transform questions to expected format
            const transformedQuestions: QuizQuestion[] = (questions || []).map((q) => ({
                id: q.id,
                pergunta: q.pergunta,
                tipo: "multipla_escolha",
                alternativas: Array.isArray(q.opcoes) ? q.opcoes : [],
                resposta_correta: q.resposta_correta || 0,
                explicacao: q.explicacao || undefined,
            }))

            const quizConfig: QuizConfig = {
                id: quiz.id,
                categoria_id: quiz.categoria || "",
                nota_minima: quiz.nota_minima || 70,
                perguntas: transformedQuestions,
                mensagem_sucesso: "Parabéns! Você foi aprovado no quiz!",
                mensagem_reprova: "Não foi dessa vez. Estude mais e tente novamente.",
            }

            console.log("Quiz carregado com sucesso:", quizConfig)
            return quizConfig
        } catch (error) {
            console.error("Erro ao carregar quiz:", error)
            setError("Erro ao carregar quiz")
            return null
        } finally {
            setLoading(false)
        }
    }, [])

    return {
        loadQuizForCourse,
        loading,
        error,
    }
}