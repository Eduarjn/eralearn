import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award, Calendar, User, BookOpen, CheckCircle } from "lucide-react"

interface CertificateDesignProps {
    certificateData: {
        id: string
        usuario_nome: string
        curso_nome: string
        categoria: string
        nota: number
        data_conclusao: string
        numero_certificado?: string
    }
    className?: string
}

export const CertificateDesign: React.FC<CertificateDesignProps> = ({ certificateData, className = "" }) => {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        })
    }

    return (
        <Card
            className={`relative overflow-hidden bg-gradient-to-br from-white via-blue-50 to-green-50 border-2 border-gray-200 shadow-2xl ${className}`}
        >
            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-green-600"></div>
                <div className="absolute top-4 left-4 w-32 h-32 border-2 border-blue-300 rounded-full opacity-20"></div>
                <div className="absolute bottom-4 right-4 w-24 h-24 border-2 border-green-300 rounded-full opacity-20"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-purple-300 rounded-full opacity-10"></div>
            </div>

            <CardContent className="relative z-10 p-8 lg:p-12">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                            <Award className="w-8 h-8 text-white" />
                        </div>
                    </div>

                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-2">CERTIFICADO DE CONCLUSÃO</h1>

                    <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-green-600 mx-auto rounded-full"></div>
                </div>

                {/* Main content */}
                <div className="text-center space-y-6">
                    <p className="text-lg text-gray-600 leading-relaxed">Certificamos que</p>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200">
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">{certificateData.usuario_nome}</h2>
                        <div className="flex items-center justify-center gap-2 text-gray-600">
                            <User className="w-4 h-4" />
                            <span className="text-sm">Aluno Certificado</span>
                        </div>
                    </div>

                    <p className="text-lg text-gray-600 leading-relaxed px-4">concluiu com êxito o curso</p>

                    <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <BookOpen className="w-6 h-6" />
                            <h3 className="text-xl lg:text-2xl font-bold">{certificateData.curso_nome}</h3>
                        </div>

                        <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                            {certificateData.categoria}
                        </Badge>
                    </div>

                    {/* Achievement details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="font-semibold text-gray-800">Nota Final</span>
                            </div>
                            <p className="text-2xl font-bold text-green-600">{certificateData.nota}%</p>
                        </div>

                        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                <span className="font-semibold text-gray-800">Data de Conclusão</span>
                            </div>
                            <p className="text-sm font-medium text-gray-700">{formatDate(certificateData.data_conclusao)}</p>
                        </div>

                        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Award className="w-5 h-5 text-purple-600" />
                                <span className="font-semibold text-gray-800">Certificado Nº</span>
                            </div>
                            <p className="text-xs font-mono text-gray-600 break-all">
                                {certificateData.numero_certificado || certificateData.id}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <div className="text-center">
                        <p className="text-sm text-gray-500 mb-2">
                            Este certificado é válido e pode ser verificado através do código acima
                        </p>
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span>Certificado Digital Verificável</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default CertificateDesign
