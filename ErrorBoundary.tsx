import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Atualiza o estado para que a próxima renderização mostre a UI alternativa
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Você também pode registrar o erro em um serviço de relatórios
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Você pode renderizar qualquer UI alternativa
      return (
        <div className="h-[100dvh] w-full bg-[#010a12] flex items-center justify-center p-6">
          <div className="w-full max-w-sm system-panel border-red-500 cut-corners p-8 bg-red-950/20 space-y-6">
            <h1 className="text-2xl font-black system-font text-center text-red-500 glow-text italic">
              ERRO DO SISTEMA
            </h1>
            <p className="text-sm text-gray-300 font-mono text-center">
              {this.state.error?.message || 'Erro durante a renderização'}
            </p>
            <p className="text-xs text-gray-500 text-center">
              Recarregue a página ou tente novamente
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => window.location.reload()}
                className="w-full bg-red-500 text-white font-black py-4 uppercase italic tracking-widest hover:bg-red-600 transition-colors"
              >
                RECARREGAR SISTEMA
              </button>
              <button 
                onClick={() => this.setState({ hasError: false, error: null })}
                className="w-full bg-gray-800 text-gray-400 font-black py-4 uppercase italic tracking-widest hover:bg-gray-700 transition-colors"
              >
                TENTAR NOVAMENTE
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;