import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900 p-5">
          <div className="max-w-md w-full rounded-3xl shadow-2xl p-8 bg-white dark:bg-gray-800 border border-border">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 m-0 mb-2">
              Ocurrió un error inesperado
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 m-0 mb-4">
              La aplicación falló al renderizar. Recarga la página o reinicia el servidor de desarrollo.
            </p>
            <pre className="text-xs whitespace-pre-wrap break-words bg-slate-50 dark:bg-gray-900 rounded-xl p-3 text-red-600 dark:text-red-400 m-0">
              {this.state.error.message}
            </pre>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 bg-purple-500 dark:bg-purple-400 text-white font-semibold rounded-xl px-4 py-3 text-sm cursor-pointer border-none hover:bg-purple-600 dark:hover:bg-purple-500 transition-colors"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}