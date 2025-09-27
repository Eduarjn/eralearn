"use client"

import { useState, useCallback } from "react"

export interface Toast {
    id: string
    title?: string
    description?: string
    variant?: "default" | "destructive" | "success" | "warning"
    duration?: number
}

interface UseToastReturn {
    toasts: Toast[]
    toast: (props: Omit<Toast, "id">) => void
    dismiss: (toastId: string) => void
    dismissAll: () => void
}

export function useToast(): UseToastReturn {
    const [toasts, setToasts] = useState<Toast[]>([])

    const toast = useCallback((props: Omit<Toast, "id">) => {
        const id = Math.random().toString(36).substr(2, 9)
        const newToast: Toast = {
            id,
            duration: 5000,
            ...props,
        }

        setToasts((prev) => [...prev, newToast])

        // Auto dismiss after duration
        if (newToast.duration && newToast.duration > 0) {
            setTimeout(() => {
                dismiss(id)
            }, newToast.duration)
        }
    }, [])

    const dismiss = useCallback((toastId: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== toastId))
    }, [])

    const dismissAll = useCallback(() => {
        setToasts([])
    }, [])

    return {
        toasts,
        toast,
        dismiss,
        dismissAll,
    }
}

let globalToast: UseToastReturn | null = null

export function getGlobalToast(): UseToastReturn {
    if (!globalToast) {
        globalToast = {
            toasts: [],
            toast: () => {},
            dismiss: () => {},
            dismissAll: () => {},
        }
    }
    return globalToast
}
