import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    force: true,
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'lucide-react',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
      'sonner',
      'next-themes',
      'react-beautiful-dnd',
      '@radix-ui/react-dropdown-menu'
    ],
    exclude: [
      'lovable-tagger'
    ]
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['lucide-react', 'class-variance-authority', 'clsx', 'tailwind-merge'],
          radix: ['@radix-ui/react-dropdown-menu']
        }
      }
    },
    // Garantir que assets estáticos sejam copiados
    assetsInlineLimit: 0,
    // Configurar diretório de assets
    assetsDir: 'assets'
  },
  // Configurar servidor de desenvolvimento
  publicDir: 'public'
}));
