"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, ChevronRight, Mail, Phone, MapPin } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useAuth } from "@/hooks/useAuth"
import { AISupportButton } from "./AISupportButton.tsx"
import { Sidebar } from "./layout/Sidebar.tsx"
import { useSidebar } from "@/context/SidebarContext"
import { useResponsive } from "@/hooks/useResponsive"

interface ERALayoutProps {
    children: React.ReactNode
    breadcrumbs?: string[]
    cursoNome?: string
    userNome?: string
}

export function ERALayout({ children, breadcrumbs = [], cursoNome = "", userNome = "Admin" }: ERALayoutProps) {
    const { userProfile } = useAuth()
    const { sidebarWidth, isExpanded } = useSidebar()
    const { isDesktop, isLargeDesktop } = useResponsive()
    const [showContactDialog, setShowContactDialog] = useState(false)

    return (
        <>
            <Sidebar>
                <div className="flex flex-col h-full sidebar-layout">
                    <header
                        className="px-6 py-4 shadow-lg backdrop-blur-sm border-b"
                        style={{
                            background: "linear-gradient(90deg, #1e293b 0%, #0f172a 100%)",
                            borderBottom: "1px solid rgba(204, 255, 0, 0.1)",
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 min-w-0 flex-1">
                                <div className="hidden sm:flex items-center space-x-2 text-sm">
                                    {breadcrumbs.map((crumb, idx) => (
                                        <span
                                            key={idx}
                                            className={`${idx === breadcrumbs.length - 1 ? "font-bold text-[#CCFF00]" : "text-white/60"}`}
                                        >
                      {crumb}
                                            {idx < breadcrumbs.length - 1 && <ChevronRight className="inline mx-1 h-4 w-4 text-white/40" />}
                    </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-shrink-0">
                                <h1 className="text-2xl font-bold text-white">ERA Learn</h1>
                            </div>

                            <div className="flex items-center space-x-4 min-w-0 flex-1 justify-end">
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => setShowContactDialog(true)}
                                    className="bg-[#CCFF00] text-black hover:bg-[#CCFF00]/90 border-0 rounded-full px-6 py-2.5 font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 text-sm"
                                >
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">Fale com um especialista</span>
                                    <span className="sm:hidden">Especialista</span>
                                </Button>
                            </div>
                        </div>
                    </header>

                    <main
                        className="flex-1 p-4 lg:p-6 overflow-y-auto transition-all duration-200 ease-in-out sidebar-content main-content bg-background"
                        style={{
                            marginLeft: isDesktop || isLargeDesktop ? `${sidebarWidth}px` : "0px",
                            width: isDesktop || isLargeDesktop ? `calc(100% - ${sidebarWidth}px)` : "100%",
                        }}
                    >
                        {children}
                    </main>

                    <AISupportButton />
                </div>
            </Sidebar>

            <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
                <DialogContent
                    className="sm:max-w-md border"
                    style={{
                        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                        borderColor: "rgba(204, 255, 0, 0.2)",
                    }}
                >
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2 text-white">
                            <MessageCircle className="h-5 w-5 text-[#CCFF00]" />
                            <span>Fale com um especialista</span>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <Mail className="h-5 w-5 text-[#CCFF00]" />
                            <div>
                                <p className="font-semibold text-white">Email</p>
                                <p className="text-sm text-white/60">contato@eralearn.com</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Phone className="h-5 w-5 text-[#CCFF00]" />
                            <div>
                                <p className="font-semibold text-white">Telefone</p>
                                <p className="text-sm text-white/60">(11) 9999-9999</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <MapPin className="h-5 w-5 text-[#CCFF00]" />
                            <div>
                                <p className="font-semibold text-white">Endereço</p>
                                <p className="text-sm text-white/60">São Paulo, SP</p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={() => setShowContactDialog(false)}
                            className="bg-[#CCFF00] text-black hover:bg-[#CCFF00]/90 font-bold"
                        >
                            Fechar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
