import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

function Ferramentas() {
  const [ferramentas, setFerramentas] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingFerramenta, setEditingFerramenta] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    codigo: '',
    descricao: '',
    fornecedor_id: '',
    quantidade: 0,
    estoque_minimo: 1,
    preco_custo: '',
    preco_venda: ''
  });

  useEffect(() => {
    loadFerramentas();
    loadFornecedores();
  }, []);

  const loadFerramentas = async () => {
    try {
      const data = await api.getFerramentas();
      setFerramentas(data);
    } catch (error) {
      console.error('Erro ao carregar ferramentas:', error);
    }
  };

  const loadFornecedores = async () => {
    try {
      const data = await api.getFornecedores();
      setFornecedores(data);
    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        quantidade: parseInt(formData.quantidade),
        estoque_minimo: parseInt(formData.estoque_minimo),
        preco_custo: formData.preco_custo ? parseFloat(formData.preco_custo) : null,
        preco_venda: formData.preco_venda ? parseFloat(formData.preco_venda) : null
      };

      if (editingFerramenta) {
        await api.updateFerramenta(editingFerramenta.id, data);
      } else {
        await api.createFerramenta(data);
      }
     
      setShowModal(false);
      resetForm();
      loadFerramentas();
    } catch (error) {
      console.error('Erro ao salvar ferramenta:', error);
      alert(error.error || 'Erro ao salvar ferramenta');
    }
  };

  const handleEdit = (ferramenta) => {
    setEditingFerramenta(ferramenta);
    setFormData({
      nome: ferramenta.nome,
      codigo: ferramenta.codigo,
      descricao: ferramenta.descricao || '',
      fornecedor_id: ferramenta.fornecedor_id || '',
      quantidade: ferramenta.quantidade || 0,
      estoque_minimo: ferramenta.estoque_minimo || 1,
      preco_custo: ferramenta.preco_custo || '',
      preco_venda: ferramenta.preco_venda || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta ferramenta?')) {
      try {
        await api.deleteFerramenta(id);
        loadFerramentas();
      } catch (error) {
        console.error('Erro ao deletar ferramenta:', error);
        alert('Erro ao deletar ferramenta');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      codigo: '',
      descricao: '',
      fornecedor_id: '',
      quantidade: 0,
      estoque_minimo: 1,
      preco_custo: '',
      preco_venda: ''
    });
    setEditingFerramenta(null);
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>🛠️ Ferramentas</h2>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          Nova Ferramenta
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Nome</th>
            <th>Fornecedor</th>
            <th>Estoque</th>
            <th>Mínimo</th>
            <th>Preço Custo</th>
            <th>Preço Venda</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {ferramentas.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                Nenhuma ferramenta cadastrada.
              </td>
            </tr>
          ) : (
            ferramentas.map(ferramenta => (
              <tr key={ferramenta.id}>
                <td>{ferramenta.codigo}</td>
                <td>{ferramenta.nome}</td>
                <td>{ferramenta.fornecedor_nome || '-'}</td>
                <td>
                  <span style={{
                    color: ferramenta.quantidade <= ferramenta.estoque_minimo ? '#c33' : '#333',
                    fontWeight: ferramenta.quantidade <= ferramenta.estoque_minimo ? 'bold' : 'normal'
                  }}>
                    {ferramenta.quantidade}
                    {ferramenta.quantidade <= ferramenta.estoque_minimo && ' ⚠️'}
                  </span>
                </td>
                <td>{ferramenta.estoque_minimo}</td>
                <td>
                  {ferramenta.preco_custo ? 
                    `R$ ${ferramenta.preco_custo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 
                    '-'
                  }
                </td>
                <td>
                  {ferramenta.preco_venda ? 
                    `R$ ${ferramenta.preco_venda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 
                    '-'
                  }
                </td>
                <td>
                  <button className="btn btn-secondary" onClick={() => handleEdit(ferramenta)}>
                    Editar
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(ferramenta.id)}>
                    Excluir
                  </button>
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
              <h3>{editingFerramenta ? 'Editar Ferramenta' : 'Nova Ferramenta'}</h3>
              <span className="close" onClick={() => { setShowModal(false); resetForm(); }}>&times;</span>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nome *</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Código *</label>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Fornecedor</label>
                <select
                  value={formData.fornecedor_id}
                  onChange={(e) => setFormData({ ...formData, fornecedor_id: e.target.value })}
                >
                  <option value="">Selecione um fornecedor</option>
                  {fornecedores.map(fornecedor => (
                    <option key={fornecedor.id} value={fornecedor.id}>{fornecedor.nome}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Quantidade</label>
                  <input
                    type="number"
                    value={formData.quantidade}
                    onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Estoque Mínimo</label>
                  <input
                    type="number"
                    value={formData.estoque_minimo}
                    onChange={(e) => setFormData({ ...formData, estoque_minimo: e.target.value })}
                    min="1"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Preço de Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.preco_custo}
                    onChange={(e) => setFormData({ ...formData, preco_custo: e.target.value })}
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Preço de Venda (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.preco_venda}
                    onChange={(e) => setFormData({ ...formData, preco_venda: e.target.value })}
                    min="0"
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-success">Salvar</button>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Ferramentas;