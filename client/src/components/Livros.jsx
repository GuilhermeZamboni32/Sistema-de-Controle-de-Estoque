import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

function Livros() {
  const [livros, setLivros] = useState([]);
  const [livrosFiltrados, setLivrosFiltrados] = useState([]);
  const [busca, setBusca] = useState('');
  const [autores, setAutores] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingLivro, setEditingLivro] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    isbn: '',
    autor_id: '',
    quantidade: 1,
    estoque_minimo: 1,
    ano_publicacao: ''
  });

  useEffect(() => {
    loadLivros();
    loadAutores();
  }, []);

  useEffect(() => {
    // Filtrar livros baseado na busca
    if (busca.trim() === '') {
      setLivrosFiltrados(livros);
    } else {
      const termo = busca.toLowerCase();
      const filtrados = livros.filter(livro => 
        livro.titulo.toLowerCase().includes(termo) ||
        livro.isbn.toLowerCase().includes(termo) ||
        (livro.autor_nome && livro.autor_nome.toLowerCase().includes(termo))
      );
      setLivrosFiltrados(filtrados);
    }
  }, [busca, livros]);

  const loadLivros = async () => {
    try {
      const data = await api.getLivros();
      setLivros(data);
      setLivrosFiltrados(data);
    } catch (error) {
      console.error('Erro ao carregar livros:', error);
    }
  };

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
      const data = {
        ...formData,
        autor_id: formData.autor_id || null,
        quantidade: parseInt(formData.quantidade),
        estoque_minimo: parseInt(formData.estoque_minimo) || 1,
        ano_publicacao: formData.ano_publicacao ? parseInt(formData.ano_publicacao) : null
      };

      if (editingLivro) {
        await api.updateLivro(editingLivro.id, data);
      } else {
        await api.createLivro(data);
      }
      
      setShowModal(false);
      resetForm();
      loadLivros();
    } catch (error) {
      console.error('Erro ao salvar livro:', error);
      alert('Erro ao salvar livro');
    }
  };

  const handleEdit = (livro) => {
    setEditingLivro(livro);
    setFormData({
      titulo: livro.titulo,
      isbn: livro.isbn,
      autor_id: livro.autor_id || '',
      quantidade: livro.quantidade || 1,
      estoque_minimo: livro.estoque_minimo || 1,
      ano_publicacao: livro.ano_publicacao || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este livro?')) {
      try {
        await api.deleteLivro(id);
        loadLivros();
      } catch (error) {
        console.error('Erro ao deletar livro:', error);
        alert('Erro ao deletar livro');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      isbn: '',
      autor_id: '',
      quantidade: 1,
      estoque_minimo: 1,
      ano_publicacao: ''
    });
    setEditingLivro(null);
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Livros</h2>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          Novo Livro
        </button>
      </div>

      <div className="form-group" style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Buscar por título, ISBN ou autor..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ddd' }}
        />
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Título</th>
            <th>ISBN</th>
            <th>Autor</th>
            <th>Quantidade</th>
            <th>Estoque Mínimo</th>
            <th>Ano</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {livrosFiltrados.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                {busca ? 'Nenhum livro encontrado com os critérios de busca.' : 'Nenhum livro cadastrado.'}
              </td>
            </tr>
          ) : (
            livrosFiltrados.map(livro => (
              <tr key={livro.id}>
                <td>{livro.id}</td>
                <td>{livro.titulo}</td>
                <td>{livro.isbn}</td>
                <td>{livro.autor_nome || '-'}</td>
                <td>{livro.quantidade}</td>
                <td>
                  <span style={{
                    color: (livro.quantidade || 0) < (livro.estoque_minimo || 1) ? '#c33' : '#666'
                  }}>
                    {livro.estoque_minimo || 1}
                    {(livro.quantidade || 0) < (livro.estoque_minimo || 1) && ' ⚠️'}
                  </span>
                </td>
                <td>{livro.ano_publicacao || '-'}</td>
                <td>
                  <button className="btn btn-secondary" onClick={() => handleEdit(livro)}>
                    Editar
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(livro.id)}>
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
              <h3>{editingLivro ? 'Editar Livro' : 'Novo Livro'}</h3>
              <span className="close" onClick={() => { setShowModal(false); resetForm(); }}>&times;</span>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Título *</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>ISBN *</label>
                <input
                  type="text"
                  value={formData.isbn}
                  onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Autor</label>
                <select
                  value={formData.autor_id}
                  onChange={(e) => setFormData({ ...formData, autor_id: e.target.value })}
                >
                  <option value="">Selecione um autor</option>
                  {autores.map(autor => (
                    <option key={autor.id} value={autor.id}>{autor.nome}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Quantidade</label>
                <input
                  type="number"
                  value={formData.quantidade}
                  onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Estoque Mínimo</label>
                <input
                  type="number"
                  value={formData.estoque_minimo}
                  onChange={(e) => setFormData({ ...formData, estoque_minimo: e.target.value })}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label>Ano de Publicação</label>
                <input
                  type="number"
                  value={formData.ano_publicacao}
                  onChange={(e) => setFormData({ ...formData, ano_publicacao: e.target.value })}
                />
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

export default Livros;

