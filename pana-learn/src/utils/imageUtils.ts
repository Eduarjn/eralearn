/**
 * Utilitários para gerenciar caminhos de imagens
 * Funciona tanto no localhost quanto no Vercel
 */

// Detectar ambiente
const getEnvironment = () => {
    if (typeof window === "undefined") return "server"

    const hostname = window.location.hostname

    if (hostname.includes("vercel.app")) {
        return "vercel"
    } else if (
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname.includes("192.168.") ||
        hostname.includes("10.0.")
    ) {
        return "localhost"
    } else {
        return "production"
    }
}

// Base URL para imagens
const getBaseUrl = () => {
    if (typeof window === "undefined") return ""

    const environment = getEnvironment()

    switch (environment) {
        case "vercel":
            if (import.meta.env.DEV) {
                console.log("Detected Vercel environment:", window.location.origin)
            }
            return window.location.origin
        case "production":
            if (import.meta.env.DEV) {
                console.log("Detected production environment:", window.location.origin)
            }
            return window.location.origin
        case "localhost":
            if (import.meta.env.DEV) {
                console.log("Detected localhost environment")
            }
            return ""
        default:
            if (import.meta.env.DEV) {
                console.log("Unknown environment, using relative path")
            }
            return ""
    }
}

/**
 * Resolve o caminho de uma imagem
 * @param path - Caminho da imagem (ex: '/logotipoeralearn.png')
 * @returns URL completa da imagem
 */
export const resolveImagePath = (path: string): string => {
    if (!path) return ""

    // Se já é uma URL completa, retornar como está
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path
    }

    // Se é um caminho relativo, adicionar base URL
    const baseUrl = getBaseUrl()
    const fullPath = `${baseUrl}${path}`

    if (import.meta.env.DEV) {
        console.log("Resolving image:", { path, baseUrl, fullPath })
    }

    return fullPath
}

/**
 * Resolve o caminho do logo principal
 * @param customLogoUrl - URL customizada do logo (opcional)
 * @returns URL do logo
 */
export const resolveLogoPath = (customLogoUrl?: string): string => {
    // Se há uma URL customizada, usar ela
    if (customLogoUrl) {
        return resolveImagePath(customLogoUrl)
    }

    // Fallback para o logo padrão (SVG primeiro)
    return resolveImagePath("/logotipoeralearn.svg")
}

/**
 * Resolve o caminho do favicon
 * @param customFaviconUrl - URL customizada do favicon (opcional)
 * @returns URL do favicon
 */
export const resolveFaviconPath = (customFaviconUrl?: string): string => {
    if (customFaviconUrl) {
        return resolveImagePath(customFaviconUrl)
    }

    return resolveImagePath("/favicon.ico")
}

/**
 * Resolve o caminho da imagem de fundo
 * @param customBackgroundUrl - URL customizada da imagem de fundo (opcional)
 * @returns URL da imagem de fundo
 */
export const resolveBackgroundPath = (customBackgroundUrl?: string): string => {
    if (customBackgroundUrl) {
        return resolveImagePath(customBackgroundUrl)
    }

    return resolveImagePath("/lovable-uploads/aafcc16a-d43c-4f66-9fa4-70da46d38ccb.png")
}

/**
 * Testa se uma imagem carrega corretamente
 * @param url - URL da imagem
 * @returns Promise<boolean>
 */
export const testImageLoad = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
        if (!url) {
            resolve(false)
            return
        }

        const img = new Image()
        img.onload = () => {
            if (import.meta.env.DEV) {
                console.log("Image loaded successfully:", url)
            }
            resolve(true)
        }
        img.onerror = () => {
            console.error("Error loading image:", url)
            resolve(false)
        }
        img.src = url
    })
}

/**
 * Lista de fallbacks para imagens
 */
export const imageFallbacks = {
    logo: ["/logotipoeralearn.svg", "/logotipoeralearn.png", "/placeholder.svg"],
    favicon: ["/favicon.ico", "/logotipoeralearn.png"],
    background: ["/lovable-uploads/aafcc16a-d43c-4f66-9fa4-70da46d38ccb.png", "/placeholder.svg"],
}

/**
 * Tenta carregar uma imagem com fallbacks
 * @param primaryUrl - URL principal
 * @param fallbacks - Lista de URLs de fallback
 * @returns Promise<string> - Primeira URL que carrega com sucesso
 */
export const loadImageWithFallbacks = async (primaryUrl: string, fallbacks: string[] = []): Promise<string> => {
    // Testar URL principal primeiro
    if (await testImageLoad(resolveImagePath(primaryUrl))) {
        return primaryUrl
    }

    // Testar fallbacks
    for (const fallback of fallbacks) {
        if (await testImageLoad(resolveImagePath(fallback))) {
            if (import.meta.env.DEV) {
                console.log(`Image loaded with fallback: ${fallback}`)
            }
            return fallback
        }
    }

    // Se nenhuma funcionar, retornar a primeira
    console.warn(`No image loaded, using: ${primaryUrl}`)
    return primaryUrl
}