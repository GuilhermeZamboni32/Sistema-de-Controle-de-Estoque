import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

function Fornecedores() {
  const [fornecedores, setFornecedores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: ''
  });

  useEffect(() => {
    loadFornecedores();
  }, []);

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
      await api.createFornecedor(formData);
      setShowModal(false);
      setFormData({ nome: '', telefone: '', email: '' });
      loadFornecedores();
    } catch (error) {
      console.error('Erro ao salvar fornecedor:', error);
      alert('Erro ao salvar fornecedor');
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>👥 Fornecedores</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Novo Fornecedor
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Telefone</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {fornecedores.map(fornecedor => (
            <tr key={fornecedor.id}>
              <td>{fornecedor.id}</td>
              <td>{fornecedor.nome}</td>
              <td>{fornecedor.telefone || '-'}</td>
              <td>{fornecedor.email || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Novo Fornecedor</h3>
              <span className="close" onClick={() => { setShowModal(false); setFormData({ nome: '', telefone: '', email: '' }); }}>&times;</span>
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
                <label>Telefone</label>
                <input
                  type="text"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-success">Salvar</button>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setFormData({ nome: '', telefone: '', email: '' }); }}>
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Fornecedores;