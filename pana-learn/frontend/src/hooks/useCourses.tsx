"use client"

import { useState, useEffect } from "react"

interface Course {
    id: string
    title: string
    description: string
    thumbnail?: string
    duration?: number
    lessons?: number
    category?: string
    status: "active" | "inactive" | "draft"
    createdAt: string
    updatedAt: string
}

interface UseCoursesReturn {
    courses: Course[]
    loading: boolean
    error: string | null
    refetch: () => void
    createCourse: (course: Partial<Course>) => Promise<void>
    updateCourse: (id: string, updates: Partial<Course>) => Promise<void>
    deleteCourse: (id: string) => Promise<void>
}

export function useCourses(): UseCoursesReturn {
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchCourses = async () => {
        try {
            setLoading(true)
            setError(null)

            // Replace with actual API call
            const response = await fetch("/api/courses")
            if (!response.ok) {
                throw new Error("Failed to fetch courses")
            }

            const data = await response.json()
            setCourses(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
            console.error("Error fetching courses:", err)
        } finally {
            setLoading(false)
        }
    }

    const createCourse = async (courseData: Partial<Course>) => {
        try {
            const response = await fetch("/api/courses", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(courseData),
            })

            if (!response.ok) {
                throw new Error("Failed to create course")
            }

            const newCourse = await response.json()
            setCourses((prev) => [...prev, newCourse])
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create course")
            throw err
        }
    }

    const updateCourse = async (id: string, updates: Partial<Course>) => {
        try {
            const response = await fetch(`/api/courses/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updates),
            })

            if (!response.ok) {
                throw new Error("Failed to update course")
            }

            const updatedCourse = await response.json()
            setCourses((prev) => prev.map((course) => (course.id === id ? updatedCourse : course)))
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update course")
            throw err
        }
    }

    const deleteCourse = async (id: string) => {
        try {
            const response = await fetch(`/api/courses/${id}`, {
                method: "DELETE",
            })

            if (!response.ok) {
                throw new Error("Failed to delete course")
            }

            setCourses((prev) => prev.filter((course) => course.id !== id))
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete course")
            throw err
        }
    }

    useEffect(() => {
        fetchCourses()
    }, [])

    return {
        courses,
        loading,
        error,
        refetch: fetchCourses,
        createCourse,
        updateCourse,
        deleteCourse,
    }
}
