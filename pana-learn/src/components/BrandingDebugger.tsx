import React from 'react';
import { useBranding } from '@/context/BrandingContext';

export const BrandingDebugger: React.FC = () => {
  const { branding, loading } = useBranding();

  if (loading) {
    return (
      <div className="fixed top-4 right-4 bg-blue-100 border border-blue-300 rounded-lg p-4 z-50 max-w-md">
        <h3 className="font-bold text-blue-800 mb-2">🔄 Carregando Branding...</h3>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-gray-100 border border-gray-300 rounded-lg p-4 z-50 max-w-md">
      <h3 className="font-bold text-gray-800 mb-2">🔍 Debug Branding</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Logo URL:</strong> 
          <span className={`ml-2 ${branding.logo_url ? 'text-green-600' : 'text-red-600'}`}>
            {branding.logo_url || 'NÃO DEFINIDO'}
          </span>
        </div>
        
        <div>
          <strong>Background URL:</strong> 
          <span className={`ml-2 ${branding.background_url ? 'text-green-600' : 'text-red-600'}`}>
            {branding.background_url || 'NÃO DEFINIDO'}
          </span>
        </div>
        
        <div>
          <strong>Favicon URL:</strong> 
          <span className={`ml-2 ${branding.favicon_url ? 'text-green-600' : 'text-red-600'}`}>
            {branding.favicon_url || 'NÃO DEFINIDO'}
          </span>
        </div>
        
        <div>
          <strong>Company Name:</strong> 
          <span className="ml-2 text-gray-700">
            {branding.company_name || 'NÃO DEFINIDO'}
          </span>
        </div>
        
        <div>
          <strong>Primary Color:</strong> 
          <span className="ml-2 text-gray-700">
            {branding.primary_color || 'NÃO DEFINIDO'}
          </span>
        </div>
        
        <div>
          <strong>Secondary Color:</strong> 
          <span className="ml-2 text-gray-700">
            {branding.secondary_color || 'NÃO DEFINIDO'}
          </span>
        </div>
      </div>
      
      <div className="mt-4 pt-2 border-t border-gray-300">
        <h4 className="font-semibold text-gray-700 mb-2">Teste de URLs:</h4>
        <div className="space-y-1 text-xs">
          <div>
            <strong>Logo Resolvido:</strong> 
            <span className="ml-2 text-blue-600 break-all">
              {branding.logo_url ? `https://eralearn-94hi.vercel.app${branding.logo_url}` : 'N/A'}
            </span>
          </div>
          <div>
            <strong>Background Resolvido:</strong> 
            <span className="ml-2 text-blue-600 break-all">
              {branding.background_url ? `https://eralearn-94hi.vercel.app${branding.background_url}` : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
