import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { api } from '../services/api';

function Movimentacoes({ onMovimentacaoCriada }) {  // ✅ Adicione esta prop
  const { user } = useAuth();
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [ferramentas, setFerramentas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [alerta, setAlerta] = useState('');
  const [formData, setFormData] = useState({
    ferramenta_id: '',
    tipo_movimentacao: 'entrada',
    quantidade: 1,
    valor_unitario: '',
    cliente_fornecedor: '',
    observacao: ''
  });

  useEffect(() => {
    loadMovimentacoes();
    loadFerramentas();
  }, []);

  const loadMovimentacoes = async () => {
    try {
      const data = await api.getMovimentacoes();
      setMovimentacoes(data);
    } catch (error) {
      console.error('Erro ao carregar movimentações:', error);
    }
  };

  const loadFerramentas = async () => {
    try {
      const data = await api.getFerramentas();
      setFerramentas(data);
    } catch (error) {
      console.error('Erro ao carregar ferramentas:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setAlerta('');
   
    const dadosEnviar = {
      ...formData,
      quantidade: parseInt(formData.quantidade),
      valor_unitario: formData.valor_unitario ? parseFloat(formData.valor_unitario) : null,
      usuario_id: user.id
    };
   
    try {
      const response = await api.createMovimentacao(dadosEnviar);
     
      if (response.alerta) {
        setAlerta(response.alerta);
        alert(response.alerta);
      }
     
      setShowModal(false);
      setFormData({
        ferramenta_id: '',
        tipo_movimentacao: 'entrada',
        quantidade: 1,
        valor_unitario: '',
        cliente_fornecedor: '',
        observacao: ''
      });
      
      // ✅ ATUALIZAR LISTAS
      loadMovimentacoes();
      loadFerramentas();
      
      // ✅ NOTIFICAR O APP PARA ATUALIZAR O DASHBOARD
      if (onMovimentacaoCriada) {
        onMovimentacaoCriada();
      }
      
    } catch (error) {
      console.error('Erro ao criar movimentação:', error);
      setError(error.error || 'Erro ao criar movimentação');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError('');
    setAlerta('');
    setFormData({
      ferramenta_id: '',
      tipo_movimentacao: 'entrada',
      quantidade: 1,
      valor_unitario: '',
      cliente_fornecedor: '',
      observacao: ''
    });
  };

  const ferramentaSelecionada = ferramentas.find(f => f.id === parseInt(formData.ferramenta_id));

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>📦 Movimentações</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: '#666' }}>
            Total: {movimentacoes.length} movimentações
          </span>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            ➕ Nova Movimentação
          </button>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Data/Hora</th>
            <th>Ferramenta</th>
            <th>Tipo</th>
            <th>Quantidade</th>
            <th>Valor Unit.</th>
            <th>Cliente/Fornecedor</th>
            <th>Observação</th>
          </tr>
        </thead>
        <tbody>
          {movimentacoes.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ color: '#666' }}>
                  <p>Nenhuma movimentação cadastrada.</p>
                  <p>Clique em "Nova Movimentação" para começar.</p>
                </div>
              </td>
            </tr>
          ) : (
            movimentacoes.map(mov => (
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
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: mov.tipo_movimentacao === 'entrada' ? '#d4edda' : '#f8d7da',
                    color: mov.tipo_movimentacao === 'entrada' ? '#155724' : '#721c24',
                    border: `1px solid ${mov.tipo_movimentacao === 'entrada' ? '#c3e6cb' : '#f5c6cb'}`
                  }}>
                    {mov.tipo_movimentacao === 'entrada' ? '📥 Entrada' : '📤 Saída'}
                  </span>
                </td>
                <td>
                  <strong style={{ 
                    color: mov.tipo_movimentacao === 'entrada' ? '#28a745' : '#dc3545',
                    fontSize: '16px'
                  }}>
                    {mov.tipo_movimentacao === 'entrada' ? '+' : '-'}{mov.quantidade}
                  </strong>
                </td>
                <td>
                  {mov.valor_unitario ? 
                    `R$ ${mov.valor_unitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 
                    <span style={{ color: '#999' }}>-</span>
                  }
                </td>
                <td>
                  {mov.cliente_fornecedor ? 
                    <span style={{ fontWeight: '500' }}>{mov.cliente_fornecedor}</span> : 
                    <span style={{ color: '#999' }}>-</span>
                  }
                </td>
                <td>
                  {mov.observacao ? 
                    <span title={mov.observacao} style={{ 
                      cursor: 'help',
                      fontSize: '12px',
                      color: '#666'
                    }}>
                      📝
                    </span> : 
                    <span style={{ color: '#999' }}>-</span>
                  }
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>➕ Nova Movimentação</h3>
              <span className="close" onClick={handleCloseModal}>&times;</span>
            </div>
            {error && (
              <div className="alert error">
                ❌ {error}
              </div>
            )}
            {alerta && (
              <div className="alert warning">
                ⚠️ {alerta}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Ferramenta *</label>
                <select
                  value={formData.ferramenta_id}
                  onChange={(e) => {
                    setFormData({ ...formData, ferramenta_id: e.target.value });
                    setError('');
                  }}
                  required
                >
                  <option value="">Selecione uma ferramenta</option>
                  {ferramentas.map(ferramenta => (
                    <option key={ferramenta.id} value={ferramenta.id}>
                      {ferramenta.nome} ({ferramenta.codigo}) - Estoque: {ferramenta.quantidade}
                    </option>
                  ))}
                </select>
                {ferramentaSelecionada && (
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#666', 
                    marginTop: '5px',
                    padding: '8px',
                    background: '#f8f9fa',
                    borderRadius: '4px'
                  }}>
                    📊 <strong>Estoque atual:</strong> {ferramentaSelecionada.quantidade} | 
                    <strong> Mínimo:</strong> {ferramentaSelecionada.estoque_minimo}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Tipo de Movimentação *</label>
                <select
                  value={formData.tipo_movimentacao}
                  onChange={(e) => setFormData({ ...formData, tipo_movimentacao: e.target.value })}
                  required
                >
                  <option value="entrada">📥 Entrada (Compra/Devolução)</option>
                  <option value="saida">📤 Saída (Venda/Utilização)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Quantidade *</label>
                <input
                  type="number"
                  value={formData.quantidade}
                  onChange={(e) => setFormData({ ...formData, quantidade: parseInt(e.target.value) || 1 })}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Valor Unitário (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.valor_unitario}
                  onChange={(e) => setFormData({ ...formData, valor_unitario: e.target.value })}
                  min="0"
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>
                  {formData.tipo_movimentacao === 'entrada' ? '👥 Fornecedor' : '👤 Cliente'}
                </label>
                <input
                  type="text"
                  value={formData.cliente_fornecedor}
                  onChange={(e) => setFormData({ ...formData, cliente_fornecedor: e.target.value })}
                  placeholder={formData.tipo_movimentacao === 'entrada' ? 'Nome do fornecedor' : 'Nome do cliente'}
                />
              </div>

              <div className="form-group">
                <label>📝 Observação</label>
                <textarea
                  value={formData.observacao}
                  onChange={(e) => setFormData({ ...formData, observacao: e.target.value })}
                  rows="3"
                  placeholder="Observações adicionais sobre esta movimentação..."
                />
              </div>

              {ferramentaSelecionada && (
                <div className="previsao-estoque">
                  <strong>📈 Previsão após movimentação:</strong><br />
                  <div style={{ marginTop: '8px' }}>
                    Estoque atual: <strong>{ferramentaSelecionada.quantidade}</strong>
                    {formData.tipo_movimentacao === 'entrada' ? ' + ' : ' - '}
                    Quantidade: <strong>{formData.quantidade}</strong> =
                    <strong style={{ 
                      color: formData.tipo_movimentacao === 'entrada' ? '#28a745' : '#dc3545',
                      fontSize: '16px',
                      marginLeft: '5px'
                    }}> {
                      formData.tipo_movimentacao === 'entrada'
                        ? ferramentaSelecionada.quantidade + parseInt(formData.quantidade)
                        : Math.max(0, ferramentaSelecionada.quantidade - parseInt(formData.quantidade))
                    }</strong>
                  </div>
                  {formData.tipo_movimentacao === 'saida' &&
                   Math.max(0, ferramentaSelecionada.quantidade - parseInt(formData.quantidade)) < ferramentaSelecionada.estoque_minimo && (
                    <div style={{ 
                      color: '#dc3545', 
                      marginTop: '8px',
                      padding: '8px',
                      background: '#f8d7da',
                      borderRadius: '4px',
                      fontWeight: 'bold'
                    }}>
                      ⚠️ ALERTA: Estoque ficará abaixo do mínimo ({ferramentaSelecionada.estoque_minimo})!
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn btn-success">
                  💾 Salvar Movimentação
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  ❌ Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Movimentacoes;