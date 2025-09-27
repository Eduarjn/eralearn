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
    User,
    ChevronRight,
    Plus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { NavLink, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useBranding } from "@/context/BrandingContext"
import { useState, useRef, useCallback } from "react"
import { useResponsive } from "@/hooks/useResponsive"

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
                className={`group w-full flex items-center justify-between text-left transition-all duration-200 ease-out rounded-lg ${
                    isExpanded ? "p-3" : "p-3 justify-center"
                } ${isAnySubmenuActive ? "bg-era-green/20 text-era-white" : "text-era-white/80 hover:bg-era-white/10 hover:text-era-white"}`}
                onClick={() => {
                    if (isExpanded) {
                        setOpen((v) => !v)
                    } else {
                        onItemClick("/configuracoes")
                    }
                }}
                type="button"
            >
        <span className="flex items-center gap-3">
          <Icon className={`h-5 w-5 ${isAnySubmenuActive ? "text-era-green" : "text-era-white"}`} />
          <span
              className={`font-medium transition-all duration-200 ${
                  isExpanded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 absolute"
              } ${isAnySubmenuActive ? "text-era-green" : "text-era-white"}`}
          >
            {label}
          </span>
        </span>
                {isExpanded && (
                    <ChevronDown
                        className={`transition-all duration-200 ${open ? "rotate-180" : ""} h-4 w-4 ${isAnySubmenuActive ? "text-era-green" : "text-era-white/60"}`}
                    />
                )}
            </button>
            {open && isExpanded && (
                <div className="ml-6 mt-2 space-y-1 bg-era-black/30 rounded-lg p-2">
                    {visibleSubmenu.map((item) => {
                        const isSpecialActive =
                            item.path === "/configuracoes/preferencias" && location.pathname === "/configuracoes"
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `block text-sm p-2 rounded-md transition-all duration-200 ${
                                        isActive || isSpecialActive
                                            ? "text-era-white bg-era-green/20 font-medium"
                                            : "text-era-white/60 hover:text-era-white hover:bg-era-white/10"
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

    const [isExpanded, setIsExpanded] = useState(false)

    const handleSignOut = async () => {
        await signOut()
    }

    const handleItemClick = useCallback(
        (path: string) => {
            navigate(path)
        },
        [navigate],
    )

    const visibleMenuItems = menuItems.filter((item) =>
        userProfile?.tipo_usuario ? item.roles.includes(userProfile.tipo_usuario) : item.roles.includes("cliente"),
    )

    return (
        <div
            ref={sidebarRef}
            className={`fixed left-0 top-0 z-50 flex flex-col h-full min-h-screen transition-all duration-300 ease-out ${
                isExpanded ? "w-80" : "w-20"
            }`}
            style={{
                background: "linear-gradient(180deg, #2b363d 0%, #1a1a1a 100%)",
                backdropFilter: "blur(20px)",
                borderRight: "1px solid rgba(207, 255, 0, 0.1)",
            }}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            aria-expanded={isExpanded}
        >
            <div className="flex gap-2 p-4 mb-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>

            <div className="p-4 border-b border-era-white/10">
                <div className={`flex items-center gap-3 transition-all duration-300 ${!isExpanded && "justify-center"}`}>
                    <div className="w-10 h-10 bg-era-green rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-era-black font-bold text-lg">E</span>
                    </div>
                    {isExpanded && (
                        <div className="flex-1">
                            <p className="text-xs text-era-white/60 uppercase tracking-wide">Plataforma de Ensino</p>
                            <p className="text-era-white font-medium">ERA Learn</p>
                        </div>
                    )}
                    {isExpanded && <ChevronRight className="w-4 h-4 text-era-white/60" />}
                </div>
            </div>

            <div className="flex-1 px-4 py-6 overflow-y-auto">
                {isExpanded && (
                    <div className="mb-4">
                        <p className="text-xs font-semibold text-era-white/60 uppercase tracking-wider mb-2">MAIN</p>
                    </div>
                )}

                <nav className="space-y-2">
                    {visibleMenuItems.map((item) => {
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

                        const isActive = location.pathname === item.path

                        return (
                            <Button
                                key={item.path}
                                variant="ghost"
                                className={`group w-full transition-all duration-200 ease-out rounded-lg ${
                                    isActive
                                        ? "bg-era-green text-era-black font-semibold border border-era-green/30"
                                        : "text-era-white/80 hover:bg-era-white/10 hover:text-era-white"
                                } ${isExpanded ? "justify-start p-3" : "justify-center p-3"}`}
                                onClick={() => handleItemClick(item.path)}
                            >
                                <item.icon className={`h-5 w-5 ${isActive ? "text-era-black" : "text-era-white"}`} />
                                {isExpanded && (
                                    <span className={`ml-3 font-medium ${isActive ? "text-era-black" : "text-era-white"}`}>
                    {item.title}
                  </span>
                                )}
                            </Button>
                        )
                    })}
                </nav>
            </div>

            <div className="p-4 space-y-4 mt-auto">
                {/* User Profile Section */}
                <div className={`flex items-center gap-3 transition-all duration-300 ${!isExpanded && "justify-center"}`}>
                    <div className="w-8 h-8 bg-era-green/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-era-green" />
                    </div>
                    {isExpanded && (
                        <div className="min-w-0 flex-1">
                            <p className="text-xs text-era-white/60 uppercase tracking-wide">
                                {userProfile?.tipo_usuario === "admin" ? "Administrador" : "Cliente"}
                            </p>
                            <p className="text-era-white font-medium truncate">{userProfile?.nome || "Usuário"}</p>
                        </div>
                    )}
                </div>

                {/* Let's start section */}
                {isExpanded && (
                    <div className="bg-era-black/50 rounded-lg p-4 border border-era-white/10">
                        <h3 className="text-era-white font-semibold mb-2">Let's start!</h3>
                        <p className="text-era-white/60 text-sm mb-4">Creating or adding new tasks couldn't be easier</p>
                        <Button
                            className="w-full bg-era-green hover:bg-era-green/90 text-era-black font-semibold"
                            onClick={() => navigate("/treinamentos")}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Task
                        </Button>
                    </div>
                )}

                {/* Collapsed state add button */}
                {!isExpanded && (
                    <div className="flex justify-center">
                        <Button
                            size="sm"
                            className="bg-era-green hover:bg-era-green/90 text-era-black w-10 h-10 p-0"
                            onClick={() => navigate("/treinamentos")}
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                )}

                {/* Exit Button */}
                <Button
                    variant="ghost"
                    className={`group w-full transition-all duration-200 ease-out text-era-white/80 hover:bg-red-500/20 hover:text-red-400 rounded-lg ${
                        isExpanded ? "justify-start p-3" : "justify-center p-3"
                    }`}
                    onClick={handleSignOut}
                >
                    <LogOut className="h-4 w-4" />
                    {isExpanded && <span className="ml-3 font-medium">Sair</span>}
                </Button>
            </div>
        </div>
    )
}