"use client"

import type React from "react"

import {
    Home,
    Award,
    LogOut,
    BookOpen,
    FileText,
    UserCheck,
    Cog,
    ChevronDown,
    Globe,
    Zap,
    Pin,
    PinOff,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { NavLink, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useBranding } from "@/context/BrandingContext"
import { useState, useRef, useEffect, useCallback } from "react"
import { useHoverIntent } from "@/hooks/useHoverIntent"
import { useResponsive } from "@/hooks/useResponsive"
import {
    getSidebarState,
    setSidebarState,
    getSidebarWidth,
    isPointerNear,
    isTouchDevice as isTouchDeviceUtil,
} from "@/lib/sidebar-utils"

const menuItems = [
    { title: "Dashboard", icon: Home, path: "/dashboard", roles: ["admin", "cliente", "admin_master"] },
    { title: "Treinamentos", icon: BookOpen, path: "/treinamentos", roles: ["admin", "cliente", "admin_master"] },
    { title: "Quizzes", icon: FileText, path: "/quizzes", roles: ["admin", "admin_master"] },
    { title: "Certificados", icon: Award, path: "/certificados", roles: ["admin", "cliente", "admin_master"] },
    { title: "Usuários", icon: UserCheck, path: "/usuarios", roles: ["admin", "admin_master"] },
    { title: "Domínios", icon: Globe, path: "/dominios", roles: ["admin_master"] },
    { title: "Tokens IA", icon: Zap, path: "/ai-tokens", roles: ["admin", "admin_master"] },
    {
        title: "Configurações",
        icon: Cog,
        path: "/configuracoes",
        roles: ["admin", "cliente", "admin_master"],
        submenu: [
            { label: "Preferências", path: "/configuracoes/preferencias", roles: ["admin", "cliente", "admin_master"] },
            { label: "Conta", path: "/configuracoes/conta", roles: ["admin", "cliente", "admin_master"] },
            { label: "White-Label", path: "/configuracoes/whitelabel", roles: ["admin", "admin_master"] },
            { label: "Integrações & API", path: "/configuracoes/integracoes", roles: ["admin", "admin_master"] },
            { label: "Segurança", path: "/configuracoes/seguranca", roles: ["admin", "admin_master"] },
        ],
    },
]

function SidebarItem({
                         icon: Icon,
                         label,
                         submenu,
                         userType,
                         isExpanded,
                         onItemClick,
                     }: {
    icon: React.ComponentType<{ className?: string }>
    label: string
    submenu: { label: string; path: string; roles?: string[] }[]
    userType?: string
    isExpanded: boolean
    onItemClick: (path: string) => void
}) {
    const location = useLocation()

    const visibleSubmenu = submenu.filter((item) => !item.roles || item.roles.includes(userType || ""))

    const isAnySubmenuActive = visibleSubmenu.some(
        (item) =>
            location.pathname === item.path ||
            location.pathname.startsWith(item.path + "/") ||
            (item.path === "/configuracoes/preferencias" && location.pathname === "/configuracoes"),
    )

    const [open, setOpen] = useState(isAnySubmenuActive)

    return (
        <div>
            <button
                className={`w-full flex items-center justify-between text-left text-xs lg:text-sm p-2 lg:p-3 rounded-lg transition-all duration-200 ${
                    isAnySubmenuActive ? "text-era-green bg-white/10" : "text-white hover:bg-white/10"
                }`}
                onClick={() => {
                    if (isExpanded) {
                        setOpen((v) => !v)
                    } else {
                        onItemClick("/configuracoes")
                    }
                }}
                type="button"
                style={{ background: "none" }}
            >
        <span className="flex items-center gap-2 lg:gap-3">
          <Icon
              className={`h-4 w-4 lg:h-5 lg:w-5 flex-shrink-0 ${isAnySubmenuActive ? "text-era-green" : "text-white"}`}
          />
          <span
              className={`${isAnySubmenuActive ? "text-era-green" : "text-white"} truncate transition-all duration-200 ${
                  isExpanded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-1"
              }`}
          >
            {label}
          </span>
        </span>
                <ChevronDown
                    className={`transition-transform duration-200 ${open ? "rotate-180" : ""} h-3 w-3 lg:h-4 lg:w-4 ${
                        isAnySubmenuActive ? "text-era-green" : "text-white"
                    } transition-all duration-200 ${isExpanded ? "opacity-100" : "opacity-0"}`}
                />
            </button>
            {open && isExpanded && (
                <div className="pl-6 lg:pl-8 mt-1 space-y-1">
                    {visibleSubmenu.map((item) => {
                        const isSpecialActive =
                            item.path === "/configuracoes/preferencias" && location.pathname === "/configuracoes"
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `w-full block text-left text-xs lg:text-sm p-1.5 lg:p-2 rounded-md transition-all duration-200 ${
                                        isActive || isSpecialActive
                                            ? "text-era-green font-medium bg-white/10"
                                            : "text-white/80 hover:text-era-green hover:bg-white/10"
                                    }`
                                }
                            >
                                {item.label}
                            </NavLink>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export function ERASidebar() {
    const navigate = useNavigate()
    const location = useLocation()
    const { signOut, userProfile } = useAuth()
    const { branding } = useBranding()
    const { isDesktop, isLargeDesktop } = useResponsive()
    const sidebarRef = useRef<HTMLDivElement>(null)

    // Estados da sidebar
    const [sidebarState, setSidebarStateLocal] = useState<"collapsed" | "expanded" | "pinned">(getSidebarState)
    const [isHovering, setIsHovering] = useState(false)
    const [hoveredItem, setHoveredItem] = useState<string | null>(null)
    const [isTouchDevice, setIsTouchDevice] = useState(false)

    // Função para atualizar estado e salvar no localStorage
    const updateSidebarState = useCallback((newState: "collapsed" | "expanded" | "pinned") => {
        setSidebarStateLocal(newState)
        setSidebarState(newState)
    }, [])

    // Hook para detectar intenção de hover (apenas desktop)
    const { isHovered, handleMouseEnter, handleMouseLeave } = useHoverIntent({
        openDelay: 200,
        closeDelay: 500,
        onEnter: () => {
            if (!isTouchDevice && sidebarState === "collapsed" && (isDesktop || isLargeDesktop)) {
                updateSidebarState("expanded")
            }
        },
        onLeave: () => {
            if (!isTouchDevice && sidebarState === "expanded" && (isDesktop || isLargeDesktop)) {
                updateSidebarState("collapsed")
            }
        },
    })

    // Detectar dispositivo touch
    useEffect(() => {
        setIsTouchDevice(isTouchDeviceUtil())
    }, [])

    // Gerenciar estado da sidebar
    useEffect(() => {
        updateSidebarState(getSidebarState())
    }, [updateSidebarState])

    const handleSignOut = async () => {
        await signOut()
    }

    const togglePin = useCallback(() => {
        const newState = sidebarState === "pinned" ? "collapsed" : "pinned"
        updateSidebarState(newState)
    }, [sidebarState, updateSidebarState])

    const handleItemClick = useCallback(
        (path: string) => {
            // Em dispositivos touch ou mobile, não expandir/colapsar automaticamente
            // Apenas navegar
            navigate(path)
        },
        [navigate],
    )

    const handleMouseMove = useCallback(
        (event: MouseEvent) => {
            if (sidebarRef.current && sidebarState === "collapsed") {
                const isNear = isPointerNear(sidebarRef.current, event, 32)
                setIsHovering(isNear)
            }
        },
        [sidebarState],
    )

    useEffect(() => {
        // Apenas adicionar listener de mouse em desktop
        if (!isTouchDevice && (isDesktop || isLargeDesktop)) {
            document.addEventListener("mousemove", handleMouseMove)
            return () => document.removeEventListener("mousemove", handleMouseMove)
        }
    }, [isTouchDevice, isDesktop, isLargeDesktop, handleMouseMove])

    const visibleMenuItems = menuItems.filter((item) =>
        userProfile?.tipo_usuario ? item.roles.includes(userProfile.tipo_usuario) : item.roles.includes("cliente"),
    )

    const sidebarWidth = getSidebarWidth(sidebarState)
    const isExpanded = sidebarState === "expanded" || sidebarState === "pinned"

    return (
        <div
            ref={sidebarRef}
            className={`flex flex-col h-full bg-gray-900 text-white min-h-screen transition-[width] duration-200 ease-in-out ${
                isExpanded ? "shadow-lg" : "shadow-sm"
            }`}
            style={{ width: `${sidebarWidth}px` }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            aria-expanded={isExpanded}
        >
            {/* Logo ERA Learn */}
            <div className="relative">
                <img
                    src="/images/era-learn-logo.png"
                    alt="ERA Learn Logo"
                    id="sidebar-logo"
                    className={`object-contain logo-rounded cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                        isExpanded ? "h-20 lg:h-24" : "h-16"
                    }`}
                    style={{
                        borderRadius: "12px",
                        width: isExpanded ? "100%" : "48px",
                        margin: isExpanded ? "0" : "0 auto",
                    }}
                    onClick={() => window.open("https://era.com.br/", "_blank")}
                    onError={(e) => {
                        const target = e.currentTarget
                        if (target.src.includes("/images/era-learn-logo.png")) {
                            target.src = "/logo/eralearn.png"
                        } else if (target.src.includes("/logo/eralearn.png")) {
                            target.src = "/logotipoeralearn.svg"
                        } else {
                            target.src = "/placeholder.svg?height=80&width=200&text=ERA+LEARN"
                        }
                    }}
                    onLoad={() => {}}
                    title="Clique para visitar o site ERA"
                />

                {/* Botão de fixar */}
                <Button
                    variant="ghost"
                    size="sm"
                    className={`absolute top-2 right-2 p-1 h-6 w-6 text-gray-400 hover:text-white transition-all duration-200 ${
                        isExpanded ? "opacity-100" : "opacity-0"
                    }`}
                    onClick={togglePin}
                    title={sidebarState === "pinned" ? "Desafixar" : "Fixar"}
                >
                    {sidebarState === "pinned" ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
                </Button>

                {isExpanded && (
                    <div className="flex items-center justify-center py-2">
                        <p className="text-xs text-gray-400">Smart Training</p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-2 lg:p-4 space-y-0.5 lg:space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                <ul className="flex flex-col gap-0.5 lg:gap-1">
                    {visibleMenuItems.map((item) => {
                        // Se o item tem submenu, usar SidebarItem
                        if (item.submenu) {
                            return (
                                <SidebarItem
                                    key={item.path}
                                    icon={item.icon}
                                    label={item.title}
                                    userType={userProfile?.tipo_usuario}
                                    submenu={item.submenu}
                                    isExpanded={isExpanded}
                                    onItemClick={handleItemClick}
                                />
                            )
                        }

                        // Se não tem submenu, renderizar normalmente
                        const isActive = location.pathname === item.path

                        return (
                            <li key={item.path} className="relative">
                                <Button
                                    variant="ghost"
                                    className={`w-full justify-start text-left text-xs lg:text-sm p-1.5 lg:p-2.5 rounded-lg transition-all duration-200 ${
                                        isActive ? "bg-era-green text-white font-semibold" : "text-white hover:bg-white/10"
                                    }`}
                                    onClick={() => handleItemClick(item.path)}
                                >
                                    <item.icon
                                        className={`mr-2 lg:mr-3 h-4 w-4 lg:h-5 lg:w-5 flex-shrink-0 ${isActive ? "text-white" : "text-white"}`}
                                    />
                                    <span
                                        className={`${isActive ? "text-white" : "text-white"} truncate transition-all duration-200 ${
                                            isExpanded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-1"
                                        }`}
                                    >
                    {item.title}
                  </span>
                                </Button>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            {/* User section */}
            <div className="p-3 lg:p-4">
                <div
                    className={`flex items-center space-x-2 lg:space-x-3 mb-2 lg:mb-3 ${
                        isExpanded ? "opacity-100" : "opacity-0"
                    } transition-opacity duration-200`}
                >
                    <div className="w-6 h-6 lg:w-8 lg:h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs lg:text-sm font-medium text-white">
              {userProfile?.nome ? userProfile.nome.charAt(0).toUpperCase() : "U"}
            </span>
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-xs lg:text-sm font-medium text-white truncate">{userProfile?.nome || "Usuário"}</p>
                        <p className="text-xs text-gray-400 truncate">
                            {userProfile?.tipo_usuario === "admin" ? "Administrador" : "Cliente"}
                        </p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-white hover:bg-white/10 text-xs lg:text-sm p-2 lg:p-3"
                    onClick={handleSignOut}
                >
                    <LogOut className="mr-2 lg:mr-3 h-3 w-3 lg:h-4 lg:w-4" />
                    <span
                        className={`truncate transition-all duration-200 ${
                            isExpanded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-1"
                        }`}
                    >
            Sair
          </span>
                </Button>
            </div>
        </div>
    )
}
