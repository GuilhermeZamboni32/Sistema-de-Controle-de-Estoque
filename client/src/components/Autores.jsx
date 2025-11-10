import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

function Autores() {
  const [autores, setAutores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    nacionalidade: ''
  });

  useEffect(() => {
    loadAutores();
  }, []);

  const loadAutores = async () => {
    try {
      const data = await api.getAutores();
      setAutores(data);
    } catch (error) {
      console.error('Erro ao carregar autores:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createAutor(formData);
      setShowModal(false);
      setFormData({ nome: '', nacionalidade: '' });
      loadAutores();
    } catch (error) {
      console.error('Erro ao salvar autor:', error);
      alert('Erro ao salvar autor');
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Autores</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Novo Autor
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Nacionalidade</th>
          </tr>
        </thead>
        <tbody>
          {autores.map(autor => (
            <tr key={autor.id}>
              <td>{autor.id}</td>
              <td>{autor.nome}</td>
              <td>{autor.nacionalidade || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Novo Autor</h3>
              <span className="close" onClick={() => { setShowModal(false); setFormData({ nome: '', nacionalidade: '' }); }}>&times;</span>
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
                <label>Nacionalidade</label>
                <input
                  type="text"
                  value={formData.nacionalidade}
                  onChange={(e) => setFormData({ ...formData, nacionalidade: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-success">Salvar</button>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setFormData({ nome: '', nacionalidade: '' }); }}>
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Autores;

