import React, { useState, useEffect, createContext, useContext } from 'react';
import './App.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Ferramentas from './components/Ferramentas';
import Fornecedores from './components/Fornecedores';
import Movimentacoes from './components/Movimentacoes';
import { api } from './services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardUpdate, setDashboardUpdate] = useState(0); // ✅ Estado para forçar atualização do dashboard

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.setToken(token);
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const data = await api.getMe();
      setUser(data.user);
    } catch (error) {
      localStorage.removeItem('token');
      api.setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    api.setToken(token);
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      api.setToken(null);
    }
  };

  // ✅ Função para forçar atualização do dashboard
  const handleMovimentacaoCriada = () => {
    console.log('🔄 Atualizando dashboard após nova movimentação...');
    setDashboardUpdate(prev => prev + 1);
  };

  // ✅ Função para forçar atualização quando ferramentas são alteradas
  const handleFerramentaAlterada = () => {
    console.log('🔄 Atualizando dashboard após alteração em ferramentas...');
    setDashboardUpdate(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="App" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div>🔄 Carregando...</div>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
            Inicializando sistema de estoque
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <AuthContext.Provider value={{ user, logout: handleLogout }}>
      <div className="App">
        <header className="App-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <h1>🛠️ Sistema de Controle de Estoque</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <span style={{ 
                background: 'rgba(255,255,255,0.1)', 
                padding: '8px 12px', 
                borderRadius: '6px',
                fontSize: '14px'
              }}>
                👋 Olá, <strong>{user.nome}</strong>
              </span>
              <button className="btn btn-secondary" onClick={handleLogout}>
                🚪 Sair
              </button>
            </div>
          </div>
          <nav>
            <button 
              className={activeTab === 'dashboard' ? 'active' : ''} 
              onClick={() => setActiveTab('dashboard')}
            >
              📊 Dashboard
            </button>
            <button 
              className={activeTab === 'ferramentas' ? 'active' : ''} 
              onClick={() => setActiveTab('ferramentas')}
            >
              🛠️ Ferramentas
            </button>
            <button 
              className={activeTab === 'fornecedores' ? 'active' : ''} 
              onClick={() => setActiveTab('fornecedores')}
            >
              👥 Fornecedores
            </button>
            <button 
              className={activeTab === 'movimentacoes' ? 'active' : ''} 
              onClick={() => setActiveTab('movimentacoes')}
            >
              📦 Movimentações
            </button>
          </nav>
        </header>
        
        <main className="App-main">
          {activeTab === 'dashboard' && (
            <Dashboard key={dashboardUpdate} /> // ✅ Key força re-render quando muda
          )}
          {activeTab === 'ferramentas' && (
            <Ferramentas onFerramentaAlterada={handleMovimentacaoCriada} /> // ✅ Notifica alterações
          )}
          {activeTab === 'fornecedores' && <Fornecedores />}
          {activeTab === 'movimentacoes' && (
            <Movimentacoes onMovimentacaoCriada={handleMovimentacaoCriada} /> // ✅ Notifica novas movimentações
          )}
        </main>

        {/* ✅ Footer com informações do sistema */}
        <footer style={{
          background: '#f8f9fa',
          padding: '10px 20px',
          textAlign: 'center',
          fontSize: '12px',
          color: '#666',
          borderTop: '1px solid #dee2e6'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🛠️ Sistema de Controle de Estoque v1.0</span>
            <span>
              Última atualização: {new Date().toLocaleTimeString()} | 
              Usuário: {user.nome} | 
              <button 
                onClick={handleMovimentacaoCriada}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#007bff',
                  cursor: 'pointer',
                  marginLeft: '10px',
                  fontSize: '12px'
                }}
                title="Forçar atualização de todos os dados"
              >
                🔄 Atualizar Dados
              </button>
            </span>
          </div>
        </footer>
      </div>
    </AuthContext.Provider>
  );
}

export default App;