"use client"

import type React from "react"
import { useState } from "react"

interface ImportCursosModalProps {
    isOpen: boolean
    onClose: () => void
    onImport: (data: any) => void
}

const ImportCursosModal: React.FC<ImportCursosModalProps> = ({ isOpen, onClose, onImport }) => {
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)

    if (!isOpen) return null

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
        }
    }

    const handleImport = async () => {
        if (!file) return

        setLoading(true)
        try {
            const formData = new FormData()
            formData.append("file", file)

            // tem q chamar uma apii aq provavel
            // const response = await fetch('/api/import-cursos', {
            //   method: 'POST',
            //   body: formData
            // });

            onImport({ file: file.name, status: "success" })
            onClose()
        } catch (error) {
            console.error("Erro ao importar cursos:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Importar Cursos</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        ✕
                    </button>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Selecione o arquivo</label>
                    <input
                        type="file"
                        accept=".csv,.xlsx,.json"
                        onChange={handleFileChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    <p className="text-xs text-gray-500 mt-1">Formatos aceitos: CSV, XLSX, JSON</p>
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={!file || loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Importando..." : "Importar"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ImportCursosModal
