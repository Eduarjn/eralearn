import React, { useState } from "react";
import { useCourses } from '../hooks/useCourses';
import { useUserProgress } from '../hooks/useUserProgress';
import { useAuth } from '../hooks/useAuth';
import { ERALayout } from '../components/ERALayout';
import { Button } from "../components/ui/button";
import { ImportCursosModal } from "../components/ImportCursosModal";
import { CloudUpload } from "lucide-react";

export default function Treinamentos() {
  const { userProfile } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const isAdmin = userProfile?.tipo_usuario === 'admin' || userProfile?.tipo_usuario === 'admin_master';

  return (
    <ERALayout>
      <div className="flex items-center gap-4 mb-6">
        {isAdmin && (
          <Button variant="default" className="flex items-center gap-2" onClick={() => setModalOpen(true)}>
            <CloudUpload className="h-5 w-5" />
            Importar Cursos
          </Button>
        )}
        {/* ...Botão Cursos Disponíveis existente... */}
      </div>
      <ImportCursosModal open={modalOpen} onOpenChange={setModalOpen} />
      {/* ...restante da página... */}
    </ERALayout>
  );
}
 