import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'react-router-dom';

export const DebugPanel: React.FC = () => {
  const location = useLocation();
  
  // Tentar usar useAuth com tratamento de erro
  let user = null;
  let userProfile = null;
  let loading = false;
  
  try {
    const auth = useAuth();
    user = auth.user;
    userProfile = auth.userProfile;
    loading = auth.loading;
  } catch (error) {
    // Se useAuth não estiver disponível, não mostrar o debug panel
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50 max-w-xs">
      <h3 className="font-bold mb-2">🔍 Debug Info</h3>
      <div className="space-y-1">
        <div>📍 Path: {location.pathname}</div>
        <div>👤 User: {user?.email || 'null'}</div>
        <div>📋 Profile: {userProfile?.nome || 'null'}</div>
        <div>🔄 Loading: {loading ? 'true' : 'false'}</div>
        <div>🎭 Type: {userProfile?.tipo_usuario || 'null'}</div>
      </div>
    </div>
  );
};

export default DebugPanel; 