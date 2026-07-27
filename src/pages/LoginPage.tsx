import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useAuth';
import { useAuthStore } from '../store/auth.store';

export function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const loginMutation = useLogin();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  if (isAuthenticated) {
    navigate('/', { replace: true });
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await loginMutation.mutateAsync({ username, password });
      navigate('/', { replace: true });
    } catch {
      // error is handled by the store
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-5 font-sans text-gray-600 dark:text-gray-400">
      <header className="flex justify-between items-start gap-4 flex-wrap mb-4">
        <h1 className="text-4xl font-semibold text-gray-900 dark:text-gray-100 mb-1.5">Paqueteria</h1>
      </header>
      {error && <div className="mb-4 p-3.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl">{error}</div>}
      <section className="p-[18px] border border-gray-200 dark:border-gray-700 rounded-xl bg-[#dbdbdb] dark:bg-[#1e1f27] shadow-lg mb-[18px]">
        <h2 className="text-gray-900 dark:text-gray-100 font-semibold m-0 mb-4">Acceso</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 mb-4.5">
          <label className="flex flex-col gap-1.5 font-medium">
            Usuario
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200"
            />
          </label>
          <label className="flex flex-col gap-1.5 font-medium">
            Contrasena
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200"
            />
          </label>
          <button type="submit" disabled={loginMutation.isPending} className="bg-purple-500 dark:bg-purple-400 text-white font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer disabled:opacity-50 border-none hover:bg-purple-600 dark:hover:bg-purple-500 transition-colors">
            {loginMutation.isPending ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </div>
  );
}
