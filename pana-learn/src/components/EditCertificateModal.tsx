import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';

interface EditCertificateModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  date: string;
  templateFile: File | null;
  onChange: (data: { title: string; date: string; templateFile: File | null }) => void;
  onSave: () => void;
}

export const EditCertificateModal: React.FC<EditCertificateModalProps> = ({ open, onClose, title, date, templateFile, onChange, onSave }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-auto relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={onClose} aria-label="Fechar">&times;</button>
        <h2 className="text-xl font-bold mb-4 text-era-black">Editar Certificado</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título do Curso</label>
            <input
              type="text"
              className="border rounded px-3 py-2 w-full"
              value={title}
              onChange={e => onChange({ title: e.target.value, date, templateFile })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data de Conclusão</label>
            <input
              type="date"
              className="border rounded px-3 py-2 w-full"
              value={date}
              onChange={e => onChange({ title, date: e.target.value, templateFile })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Template (PNG/PDF)</label>
            <input
              type="file"
              accept=".png,.pdf"
              ref={fileInputRef}
              className="border rounded px-3 py-2 w-full"
              onChange={e => onChange({ title, date, templateFile: e.target.files?.[0] || null })}
            />
          </div>
          {/* Preview do certificado (mock) */}
          <div className="mt-4">
            <div className="font-semibold mb-2">Preview:</div>
            {templateFile ? (
              <div className="border rounded p-2 bg-gray-50 text-center">
                {templateFile.type === 'application/pdf' ? (
                  <span>PDF selecionado: {templateFile.name}</span>
                ) : (
                  <img src={URL.createObjectURL(templateFile)} alt="Preview" className="max-h-40 mx-auto" />
                )}
              </div>
            ) : (
              <div className="border rounded p-2 bg-gray-50 text-gray-400 text-center">Nenhum template selecionado</div>
            )}
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <Button className="bg-era-green text-era-black font-bold flex-1" onClick={onSave}>Salvar</Button>
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
        </div>
      </div>
    </div>
  );
}; 