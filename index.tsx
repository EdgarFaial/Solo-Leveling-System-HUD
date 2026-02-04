import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './ErrorBoundary';
import './index.css';

// Remove tela de loading
const loading = document.getElementById('loading');
if (loading) {
  setTimeout(() => {
    loading.style.opacity = '0';
    setTimeout(() => {
      if (loading.parentNode) {
        loading.parentNode.removeChild(loading);
      }
    }, 300);
  }, 500);
}

// Função para renderização segura
const safeRender = () => {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    // Criar root se não existir
    const newRoot = document.createElement('div');
    newRoot.id = 'root';
    document.body.appendChild(newRoot);
    return newRoot;
  }
  
  return rootElement;
};

try {
  const rootElement = safeRender();
  const root = ReactDOM.createRoot(rootElement);
  
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
} catch (error) {
  console.error('Falha crítica ao renderizar:', error);
  
  // Fallback extremo
  document.body.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #010a12;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-family: monospace;
      padding: 20px;
      text-align: center;
    ">
      <div>
        <h1 style="color: #ff5555; margin-bottom: 20px;">ERRO CRÍTICO DO SISTEMA</h1>
        <p>${error instanceof Error ? error.message : 'Erro desconhecido'}</p>
        <button onclick="window.location.reload()" style="
          margin-top: 20px;
          padding: 10px 20px;
          background: #ff5555;
          border: none;
          color: white;
          cursor: pointer;
        ">
          RECARREGAR
        </button>
      </div>
    </div>
  `;
}