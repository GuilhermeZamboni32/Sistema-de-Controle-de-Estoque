import React, { useState } from 'react';
import { api } from '../services/api';
import './Login.css';

function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const response = await api.login(formData.email, formData.senha);
        if (response.error) {
          setError(response.error);
        } else {
          onLogin(response.user, response.token);
        }
      } else {
        const response = await api.register(formData.nome, formData.email, formData.senha);
        if (response.error) {
          setError(response.error);
        } else {
          setError('');
          alert('Usuário criado com sucesso! Faça login.');
          setIsLogin(true);
          setFormData({ nome: '', email: '', senha: '' });
        }
      }
    } catch (error) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>🛠️ Controle de Estoque</h2>
        <p className="subtitle">Sistema de Gestão de Ferramentas</p>
       
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Nome</label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required={!isLogin}
              />
            </div>
          )}
         
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
         
          <div className="form-group">
            <label>Senha</label>
            <input
              type="password"
              value={formData.senha}
              onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Cadastrar')}
          </button>
        </form>

        <div className="login-footer">
          <button
            type="button"
            className="link-button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({ nome: '', email: '', senha: '' });
            }}
          >
            {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
          </button>
        </div>

        <div className="login-info">
          <p><strong>Credenciais de teste:</strong></p>
          <p>Email: admin@estoque.com</p>
          <p>Senha: admin123</p>
        </div>
      </div>
    </div>
  );
}

export default Login;