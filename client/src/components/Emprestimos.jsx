import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

function Emprestimos() {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [livros, setLivros] = useState([]);
  const [livrosOrdenados, setLivrosOrdenados] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [alerta, setAlerta] = useState('');
  const [formData, setFormData] = useState({
    livro_id: '',
    nome_usuario: '',
    tipo_movimentacao: 'saida',
    quantidade_movimentada: 1,
    data_movimentacao: new Date().toISOString().split('T')[0],
    data_devolucao_prevista: ''
  });

  useEffect(() => {
    loadMovimentacoes();
    loadLivros();
  }, []);

  useEffect(() => {
    // Ordenar livros alfabeticamente usando Insertion Sort
    ordenarLivrosAlfabeticamente();
  }, [livros]);

  // Algoritmo de ordenação Insertion Sort para ordenar alfabeticamente
  const ordenarLivrosAlfabeticamente = () => {
    const livrosArray = [...livros];
    
    // Insertion Sort
    for (let i = 1; i < livrosArray.length; i++) {
      const livroAtual = livrosArray[i];
      let j = i - 1;
      
      while (j >= 0 && livrosArray[j].titulo.toLowerCase() > livroAtual.titulo.toLowerCase()) {
        livrosArray[j + 1] = livrosArray[j];
        j--;
      }
      
      livrosArray[j + 1] = livroAtual;
    }
    
    setLivrosOrdenados(livrosArray);
  };

  const loadMovimentacoes = async () => {
    try {
      const data = await api.getEmprestimos();
      console.log('Movimentações carregadas:', data.map(m => ({ id: m.id, quantidade: m.quantidade_movimentada, tipo: m.tipo_movimentacao })));
      setMovimentacoes(data);
    } catch (error) {
      console.error('Erro ao carregar movimentações:', error);
    }
  };

  const loadLivros = async () => {
    try {
      const data = await api.getLivros();
      setLivros(data);
    } catch (error) {
      console.error('Erro ao carregar livros:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setAlerta('');
    
    // Garantir que quantidade_movimentada seja um número
    const quantidade = parseInt(formData.quantidade_movimentada) || 1;
    
    const dadosEnviar = {
      livro_id: formData.livro_id,
      nome_usuario: formData.nome_usuario,
      tipo_movimentacao: formData.tipo_movimentacao,
      quantidade_movimentada: quantidade,
      data_emprestimo: formData.data_movimentacao,
      data_devolucao_prevista: formData.data_devolucao_prevista || null
    };
    
    console.log('Dados sendo enviados:', dadosEnviar);
    
    try {
      const response = await api.createEmprestimo(dadosEnviar);
      
      console.log('Resposta recebida:', response);
      
      // Verificar se há alerta de estoque mínimo
      if (response.alerta) {
        setAlerta(response.alerta);
        alert(response.alerta); // Alerta automático conforme requisito
      }
      
      setShowModal(false);
      setFormData({
        livro_id: '',
        nome_usuario: '',
        tipo_movimentacao: 'saida',
        quantidade_movimentada: 1,
        data_movimentacao: new Date().toISOString().split('T')[0],
        data_devolucao_prevista: ''
      });
      loadMovimentacoes();
      loadLivros(); // Recarregar para atualizar estoque dos livros
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
      livro_id: '',
      nome_usuario: '',
      tipo_movimentacao: 'saida',
      quantidade_movimentada: 1,
      data_movimentacao: new Date().toISOString().split('T')[0],
      data_devolucao_prevista: ''
    });
  };

  const livroSelecionado = livrosOrdenados.find(l => l.id === parseInt(formData.livro_id));

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Gestão de Estoque</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Nova Movimentação
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Livro</th>
            <th>Usuário</th>
            <th>Tipo</th>
            <th>Quantidade</th>
            <th>Data Movimentação</th>
          </tr>
        </thead>
        <tbody>
          {movimentacoes.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                Nenhuma movimentação cadastrada.
              </td>
            </tr>
          ) : (
            movimentacoes.map(mov => (
              <tr key={mov.id}>
                <td>{mov.id}</td>
                <td>{mov.livro_titulo || '-'}</td>
                <td>{mov.nome_usuario}</td>
                <td>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: mov.tipo_movimentacao === 'entrada' ? '#d4edda' : '#f8d7da',
                    color: mov.tipo_movimentacao === 'entrada' ? '#155724' : '#721c24'
                  }}>
                    {mov.tipo_movimentacao === 'entrada' ? 'Entrada' : 'Saída'}
                  </span>
                </td>
                <td>{mov.quantidade_movimentada ?? 1}</td>
                <td>{mov.data_movimentacao || mov.data_emprestimo}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Nova Movimentação de Estoque</h3>
              <span className="close" onClick={handleCloseModal}>&times;</span>
            </div>
            {error && (
              <div style={{ 
                background: '#fee', 
                color: '#c33', 
                padding: '10px', 
                borderRadius: '4px', 
                marginBottom: '15px' 
              }}>
                {error}
              </div>
            )}
            {alerta && (
              <div style={{ 
                background: '#fff3cd', 
                color: '#856404', 
                padding: '10px', 
                borderRadius: '4px', 
                marginBottom: '15px' 
              }}>
                ⚠️ {alerta}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Produto (Livro) *</label>
                <select
                  value={formData.livro_id}
                  onChange={(e) => {
                    setFormData({ ...formData, livro_id: e.target.value });
                    setError('');
                  }}
                  required
                >
                  <option value="">Selecione um livro</option>
                  {livrosOrdenados.map(livro => (
                    <option key={livro.id} value={livro.id}>
                      {livro.titulo} (Estoque: {livro.quantidade || 0}, Mínimo: {livro.estoque_minimo || 1})
                    </option>
                  ))}
                </select>
                {livroSelecionado && (
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                    Estoque atual: {livroSelecionado.quantidade || 0} | Estoque mínimo: {livroSelecionado.estoque_minimo || 1}
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
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                </select>
              </div>

              <div className="form-group">
                <label>Quantidade *</label>
                <input
                  type="number"
                  value={formData.quantidade_movimentada}
                  onChange={(e) => setFormData({ ...formData, quantidade_movimentada: parseInt(e.target.value) || 1 })}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Data da Movimentação *</label>
                <input
                  type="date"
                  value={formData.data_movimentacao}
                  onChange={(e) => setFormData({ ...formData, data_movimentacao: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Responsável/Usuário *</label>
                <input
                  type="text"
                  value={formData.nome_usuario}
                  onChange={(e) => setFormData({ ...formData, nome_usuario: e.target.value })}
                  required
                />
              </div>

              {formData.tipo_movimentacao === 'saida' && (
                <div className="form-group">
                  <label>Data Devolução Prevista</label>
                  <input
                    type="date"
                    value={formData.data_devolucao_prevista}
                    onChange={(e) => setFormData({ ...formData, data_devolucao_prevista: e.target.value })}
                  />
                </div>
              )}

              {livroSelecionado && (
                <div style={{ 
                  padding: '10px', 
                  background: '#e7f3ff', 
                  borderRadius: '4px', 
                  marginBottom: '15px',
                  fontSize: '14px'
                }}>
                  <strong>Previsão após movimentação:</strong><br />
                  Estoque atual: {livroSelecionado.quantidade || 0}
                  {formData.tipo_movimentacao === 'entrada' ? ' + ' : ' - '}
                  Quantidade: {formData.quantidade_movimentada} = 
                  <strong> {
                    formData.tipo_movimentacao === 'entrada' 
                      ? (livroSelecionado.quantidade || 0) + formData.quantidade_movimentada
                      : Math.max(0, (livroSelecionado.quantidade || 0) - formData.quantidade_movimentada)
                  }</strong>
                  {formData.tipo_movimentacao === 'saida' && 
                   Math.max(0, (livroSelecionado.quantidade || 0) - formData.quantidade_movimentada) < (livroSelecionado.estoque_minimo || 1) && (
                    <div style={{ color: '#c33', marginTop: '5px' }}>
                      ⚠️ Estoque ficará abaixo do mínimo ({livroSelecionado.estoque_minimo || 1})!
                    </div>
                  )}
                </div>
              )}

              <button type="submit" className="btn btn-success">Salvar</button>
              <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Emprestimos;
