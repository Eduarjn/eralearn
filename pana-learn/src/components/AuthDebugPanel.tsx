
import { useAuth } from '@/hooks/useAuth';

export function AuthDebugPanel() {
  const { user, userProfile, loading, initialized } = useAuth();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">🔍 Debug Auth</h3>
      <div className="space-y-1">
        <div>User: {user?.email || 'null'}</div>
        <div>Profile: {userProfile?.nome || 'null'}</div>
        <div>Type: {userProfile?.tipo_usuario || 'null'}</div>
        <div>Loading: {loading ? 'true' : 'false'}</div>
        <div>Initialized: {initialized ? 'true' : 'false'}</div>
        <div>Status: {userProfile?.status || 'null'}</div>
      </div>
    </div>
  );
}
