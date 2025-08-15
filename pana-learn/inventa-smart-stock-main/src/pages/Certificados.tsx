
import { ERALayout } from '@/components/ERALayout';

const Certificados = () => {
  return (
    <ERALayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Certificados</h1>
          <p className="text-gray-600">Gerencie certificados e conquistas dos usuários</p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Área de Certificados
          </h3>
          <p className="text-gray-600">
            Esta seção será desenvolvida para gerenciar certificados, badges e gamificação.
          </p>
        </div>
      </div>
    </ERALayout>
  );
};

export default Certificados;
