import { useAuth } from '@/hooks/useAuth';
import { Users, BookOpen, Award, GraduationCap } from 'lucide-react';

const menuItems = [
  { title: 'Dashboard', icon: Users },
  { title: 'Treinamentos', icon: BookOpen },
  { title: 'Certificados', icon: Award },
  { title: 'Relatórios', icon: Award },
  { title: 'Usuários', icon: Users },
  { title: 'Configurações', icon: Award },
];

export default function Dashboard() {
  const { userProfile, loading } = useAuth();
  if (loading) return null;
  const userName = userProfile?.nome || 'João Silva';
  const cursosEmAndamento = 3;
  return (
    <div className="flex min-h-screen bg-primary">
      {/* Sidebar */}
      <aside className="bg-primary w-20 md:w-60 flex flex-col py-6 px-2 fixed h-full">
        <div className="mb-8 flex items-center justify-center">
          <GraduationCap className="h-10 w-10 text-accent" />
        </div>
        <nav className="flex-1 space-y-2">
          {menuItems.map(item => (
            <button
              key={item.title}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-contrast hover:bg-neutral hover:text-accent transition-colors duration-200"
            >
              <item.icon className="h-6 w-6" />
              <span className="hidden md:inline text-base">{item.title}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-20 md:ml-60">
        {/* Header */}
        <header className="bg-primary h-16 flex items-center justify-between px-8 shadow">
          <h1 className="text-accent text-2xl font-bold">ERA Learn</h1>
          <div className="flex items-center gap-4">
            <button className="bg-accent text-primary px-4 py-2 rounded-lg font-semibold hover:bg-accent/80 transition-colors duration-200">
              Fale Conosco
            </button>
            <span className="text-surface">Bem-vindo, {userName}</span>
          </div>
        </header>

        {/* Hero Card */}
        <section className="page-hero w-full rounded-2xl flex justify-between items-center p-6 mt-6 shadow-md">
          <div>
            <h2 className="text-2xl font-bold">Bem-vindo de volta!</h2>
            <p className="mt-2 text-lg">Você tem <span className="font-bold">{cursosEmAndamento} cursos</span> em andamento.</p>
            <button className="mt-4 bg-surface text-accent px-6 py-2 rounded-lg font-semibold hover:bg-neutral transition-colors duration-200">
              Ver meus cursos
            </button>
          </div>
          <GraduationCap className="h-16 w-16 opacity-80 text-primary" />
        </section>

        {/* Métricas */}
      </div>
    </div>
  );
}
 