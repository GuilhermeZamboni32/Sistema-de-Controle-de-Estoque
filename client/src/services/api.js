const API_URL = 'http://localhost:3001/api';

export const api = {
  setToken(token) {
    this.token = token;
  },

  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      ...options,
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw data;
    }

    return data;
  },

  // Autenticação
  async login(email, senha) {
    return this.request('/auth/login', {
      method: 'POST',
      body: { email, senha },
    });
  },

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  },

  async getMe() {
    return this.request('/auth/me');
  },

  async register(nome, email, senha) {
    return this.request('/auth/register', {
      method: 'POST',
      body: { nome, email, senha },
    });
  },

  // Ferramentas
  async getFerramentas() {
    return this.request('/ferramentas');
  },

  async getFerramenta(id) {
    return this.request(`/ferramentas/${id}`);
  },

  async createFerramenta(data) {
    return this.request('/ferramentas', {
      method: 'POST',
      body: data,
    });
  },

  async updateFerramenta(id, data) {
    return this.request(`/ferramentas/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  async deleteFerramenta(id) {
    return this.request(`/ferramentas/${id}`, {
      method: 'DELETE',
    });
  },

  // Fornecedores
  async getFornecedores() {
    return this.request('/fornecedores');
  },

  async createFornecedor(data) {
    return this.request('/fornecedores', {
      method: 'POST',
      body: data,
    });
  },

  // Movimentações
  async getMovimentacoes() {
    return this.request('/movimentacoes');
  },

  async createMovimentacao(data) {
    return this.request('/movimentacoes', {
      method: 'POST',
      body: data,
    });
  },

  // Dashboard
  async getDashboard() {
    return this.request('/dashboard');
  },
};