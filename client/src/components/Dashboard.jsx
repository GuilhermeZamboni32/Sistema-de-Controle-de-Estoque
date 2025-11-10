import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalFerramentas: 0,
    valorEstoque: 0,
    estoqueBaixo: 0,
    movimentacoesRecentes: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Função para carregar os dados do dashboard
  const loadDashboard = async () => {
    try {
      console.log('🔄 Atualizando dashboard...');
      const data = await api.getDashboard();
      setDashboardData(data);
      setError('');
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      setError('Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados quando o componente montar e quando houver atualizações
  useEffect(() => {
    loadDashboard();
  }, [lastUpdate]);

  // Atualizar dashboard a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(Date.now());
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, []);

  // Função para forçar atualização manual
  const handleRefresh = () => {
    setLoading(true);
    setLastUpdate(Date.now());
  };

  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h3>Carregando dashboard...</h3>
          <p>Atualizando dados em tempo real</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div style={{ color: '#c33', padding: '20px', textAlign: 'center' }}>
          <h3>{error}</h3>
          <button className="btn btn-primary" onClick={handleRefresh}>
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>📊 Dashboard</h2>
        <button className="btn btn-secondary" onClick={handleRefresh}>
          🔄 Atualizar
        </button>
      </div>
      
      <div className="dashboard-cards">
        <div className="card">
          <h3>Total de Ferramentas</h3>
          <p className="number">{dashboardData.totalFerramentas}</p>
          <small>Itens cadastrados</small>
        </div>
        
        <div className="card">
          <h3>Valor em Estoque</h3>
          <p className="number">
            R$ {dashboardData.valorEstoque.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <small>Valor total estimado</small>
        </div>
        
        <div className={`card ${dashboardData.estoqueBaixo > 0 ? 'warning' : ''}`}>
          <h3>Estoque Baixo</h3>
          <p className="number">{dashboardData.estoqueBaixo}</p>
          <small>Itens abaixo do mínimo</small>
        </div>

        <div className="card">
          <h3>Movimentações</h3>
          <p className="number">{dashboardData.movimentacoesRecentes.length}</p>
          <small>Últimas 5 transações</small>
        </div>
      </div>

      <div className="recent-movements">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3>📋 Movimentações Recentes</h3>
          <small>Última atualização: {new Date().toLocaleTimeString()}</small>
        </div>
        
        {dashboardData.movimentacoesRecentes.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            background: '#f8f9fa', 
            borderRadius: '8px',
            color: '#666'
          }}>
            <p>Nenhuma movimentação recente.</p>
            <p>As movimentações aparecerão aqui automaticamente.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Data/Hora</th>
                <th>Ferramenta</th>
                <th>Tipo</th>
                <th>Quantidade</th>
                <th>Valor Unit.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.movimentacoesRecentes.map(mov => {
                const total = mov.quantidade * (mov.valor_unitario || 0);
                return (
                  <tr key={mov.id}>
                    <td>
                      <div>{new Date(mov.created_at).toLocaleDateString()}</div>
                      <small style={{ color: '#666' }}>
                        {new Date(mov.created_at).toLocaleTimeString()}
                      </small>
                    </td>
                    <td>
                      <strong>{mov.ferramenta_nome}</strong>
                      {mov.ferramenta_codigo && (
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {mov.ferramenta_codigo}
                        </div>
                      )}
                    </td>
                    <td>
                      <span 
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          backgroundColor: mov.tipo_movimentacao === 'entrada' ? '#d4edda' : '#f8d7da',
                          color: mov.tipo_movimentacao === 'entrada' ? '#155724' : '#721c24'
                        }}
                      >
                        {mov.tipo_movimentacao === 'entrada' ? '📥 Entrada' : '📤 Saída'}
                      </span>
                    </td>
                    <td>
                      <strong>{mov.quantidade}</strong>
                    </td>
                    <td>
                      {mov.valor_unitario ? 
                        `R$ ${mov.valor_unitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 
                        '-'
                      }
                    </td>
                    <td>
                      {mov.valor_unitario ? 
                        `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 
                        '-'
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        background: '#e7f3ff', 
        borderRadius: '8px',
        fontSize: '14px',
        textAlign: 'center'
      }}>
        <p>
          💡 <strong>Dica:</strong> O dashboard atualiza automaticamente a cada 30 segundos. 
          Use o botão "Atualizar" para ver as mudanças imediatamente.
        </p>
      </div>
    </div>
  );
}

export default Dashboard;