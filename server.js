const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Middleware de logging de requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Armazenamento simples de sessões
const sessions = new Map();

// Configuração do PostgreSQL
const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'senai',
  database: 'estoque_db',
  port: 5432,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 20
});

// Função para criar tabelas se não existirem
async function initializeDatabase() {
  try {
    console.log('🔄 Verificando/Criando tabelas...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        senha VARCHAR(100) NOT NULL,
        tipo VARCHAR(20) DEFAULT 'usuario',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS fornecedores (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        telefone VARCHAR(20),
        email VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ferramentas (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(200) NOT NULL,
        codigo VARCHAR(50) UNIQUE NOT NULL,
        descricao TEXT,
        fornecedor_id INTEGER REFERENCES fornecedores(id),
        quantidade INTEGER DEFAULT 0,
        estoque_minimo INTEGER DEFAULT 1,
        preco_custo DECIMAL(10,2),
        preco_venda DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS movimentacoes (
        id SERIAL PRIMARY KEY,
        ferramenta_id INTEGER NOT NULL REFERENCES ferramentas(id),
        tipo_movimentacao VARCHAR(10) NOT NULL CHECK (tipo_movimentacao IN ('entrada', 'saida')),
        quantidade INTEGER NOT NULL,
        valor_unitario DECIMAL(10,2),
        cliente_fornecedor VARCHAR(100),
        observacao TEXT,
        usuario_id INTEGER REFERENCES usuarios(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Inserir usuário admin
    await pool.query(`
      INSERT INTO usuarios (nome, email, senha, tipo) 
      VALUES ('Administrador', 'admin@estoque.com', 'admin123', 'admin')
      ON CONFLICT (email) DO NOTHING
    `);

    console.log('✅ Banco de dados inicializado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error.message);
  }
}

// Rota de teste de conexão
app.get('/api/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT 1 as test');
    res.json({ 
      success: true, 
      message: '✅ Conectado ao PostgreSQL!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message
    });
  }
});

// Middleware de autenticação
const requireAuth = (req, res, next) => {
  const sessionId = req.headers['authorization']?.replace('Bearer ', '');
  
  if (!sessionId || !sessions.has(sessionId)) {
    return res.status(401).json({ error: 'Não autorizado' });
  }
  
  req.user = sessions.get(sessionId);
  next();
};

// Rotas de Autenticação
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const result = await pool.query(
      'SELECT id, nome, email, tipo FROM usuarios WHERE email = $1 AND senha = $2',
      [email, senha]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    const user = result.rows[0];
    const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessions.set(sessionId, user);
    
    res.json({ 
      token: sessionId, 
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        tipo: user.tipo
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/logout', (req, res) => {
  const sessionId = req.headers['authorization']?.replace('Bearer ', '');
  if (sessionId) {
    sessions.delete(sessionId);
  }
  res.json({ message: 'Logout realizado com sucesso' });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    const result = await pool.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING id',
      [nome, email, senha]
    );
    
    res.status(201).json({ message: 'Usuário criado com sucesso', id: result.rows[0].id });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Rotas para Ferramentas
app.get('/api/ferramentas', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT f.*, forn.nome as fornecedor_nome FROM ferramentas f LEFT JOIN fornecedores forn ON f.fornecedor_id = forn.id ORDER BY f.nome'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/ferramentas', requireAuth, async (req, res) => {
  try {
    const { nome, codigo, descricao, fornecedor_id, quantidade, estoque_minimo, preco_custo, preco_venda } = req.body;
    
    if (!nome || !codigo) {
      return res.status(400).json({ error: 'Nome e código são obrigatórios' });
    }

    const result = await pool.query(
      'INSERT INTO ferramentas (nome, codigo, descricao, fornecedor_id, quantidade, estoque_minimo, preco_custo, preco_venda) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      [nome, codigo, descricao || null, fornecedor_id || null, quantidade || 0, estoque_minimo || 1, preco_custo || null, preco_venda || null]
    );
    
    res.status(201).json({ id: result.rows[0].id, ...req.body });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Código já cadastrado' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Rotas para Fornecedores
app.get('/api/fornecedores', requireAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM fornecedores ORDER BY nome');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/fornecedores', requireAuth, async (req, res) => {
  try {
    const { nome, telefone, email } = req.body;
    
    if (!nome) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    const result = await pool.query(
      'INSERT INTO fornecedores (nome, telefone, email) VALUES ($1, $2, $3) RETURNING id',
      [nome, telefone || null, email || null]
    );
    
    res.status(201).json({ id: result.rows[0].id, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/// Rotas para Movimentações - GET (LISTAR)
app.get('/api/movimentacoes', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*, f.nome as ferramenta_nome, f.codigo as ferramenta_codigo 
       FROM movimentacoes m 
       LEFT JOIN ferramentas f ON m.ferramenta_id = f.id 
       ORDER BY m.created_at DESC`
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar movimentações:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rotas para Movimentações - POST (CRIAR) - JÁ EXISTE NO SEU CÓDIGO
app.post('/api/movimentacoes', requireAuth, async (req, res) => {
  let client;
  try {
    const { ferramenta_id, tipo_movimentacao, quantidade, valor_unitario, cliente_fornecedor, observacao, usuario_id } = req.body;
    
    if (!ferramenta_id || !tipo_movimentacao || !quantidade) {
      return res.status(400).json({ error: 'Ferramenta, tipo e quantidade são obrigatórios' });
    }

    console.log('📥 Recebendo movimentação:', { ferramenta_id, tipo_movimentacao, quantidade });

    // ✅ INICIAR TRANSACTION para garantir consistência
    client = await pool.connect();
    await client.query('BEGIN');

    // Buscar informações da ferramenta
    const ferramentaResult = await client.query(
      'SELECT quantidade, estoque_minimo FROM ferramentas WHERE id = $1',
      [ferramenta_id]
    );

    if (ferramentaResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Ferramenta não encontrada' });
    }

    const quantidadeAtual = ferramentaResult.rows[0].quantidade;
    const estoqueMinimo = ferramentaResult.rows[0].estoque_minimo || 1;
    const quantidadeMov = parseInt(quantidade);

    console.log('📊 Estoque atual:', quantidadeAtual, 'Quantidade mov:', quantidadeMov);

    // Calcular novo estoque
    let novoEstoque;
    if (tipo_movimentacao === 'entrada') {
      novoEstoque = quantidadeAtual + quantidadeMov;
    } else {
      novoEstoque = quantidadeAtual - quantidadeMov;
      
      // Validar estoque
      if (novoEstoque < 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          error: 'Estoque insuficiente para esta venda.',
          estoqueAtual: quantidadeAtual,
          quantidadeSolicitada: quantidadeMov
        });
      }
    }

    // ✅ ATUALIZAR ESTOQUE DA FERRAMENTA
    console.log('🔄 Atualizando estoque para:', novoEstoque);
    await client.query(
      'UPDATE ferramentas SET quantidade = $1 WHERE id = $2',
      [novoEstoque, ferramenta_id]
    );

    // ✅ CRIAR MOVIMENTAÇÃO
    const movimentacaoResult = await client.query(
      'INSERT INTO movimentacoes (ferramenta_id, tipo_movimentacao, quantidade, valor_unitario, cliente_fornecedor, observacao, usuario_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [ferramenta_id, tipo_movimentacao, quantidadeMov, valor_unitario || null, cliente_fornecedor || null, observacao || null, usuario_id || null]
    );

    // ✅ COMMIT DA TRANSACTION
    await client.query('COMMIT');

    // Verificar se ficará abaixo do estoque mínimo (apenas para alerta)
    let alerta = null;
    if (tipo_movimentacao === 'saida' && novoEstoque < estoqueMinimo) {
      alerta = `ALERTA: Após esta movimentação, o estoque (${novoEstoque}) ficará abaixo do mínimo (${estoqueMinimo}).`;
    }

    console.log('✅ Movimentação criada com sucesso. Novo estoque:', novoEstoque);

    res.status(201).json({ 
      id: movimentacaoResult.rows[0].id,
      alerta: alerta,
      estoqueAtual: novoEstoque,
      estoqueMinimo: estoqueMinimo,
      message: 'Movimentação registrada com sucesso'
    });

  } catch (error) {
    // ✅ ROLLBACK em caso de erro
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error('❌ Erro ao criar movimentação:', error);
    res.status(500).json({ error: error.message });
  } finally {
    // ✅ LIBERAR CONEXÃO
    if (client) {
      client.release();
    }
  }
});

// Rota para dashboard - CORRIGIDA
app.get('/api/dashboard', requireAuth, async (req, res) => {
  try {
    // Total de ferramentas
    const totalFerramentas = await pool.query('SELECT COUNT(*) as total FROM ferramentas');
    
    // Total em valor de estoque
    const valorEstoque = await pool.query('SELECT SUM(quantidade * COALESCE(preco_custo, 0)) as total FROM ferramentas');
    
    // Ferramentas com estoque baixo
    const estoqueBaixo = await pool.query('SELECT COUNT(*) as total FROM ferramentas WHERE quantidade <= estoque_minimo');
    
    // Movimentações recentes
    const movimentacoesRecentes = await pool.query(
      `SELECT m.*, f.nome as ferramenta_nome 
       FROM movimentacoes m 
       LEFT JOIN ferramentas f ON m.ferramenta_id = f.id 
       ORDER BY m.created_at DESC LIMIT 5`
    );

    res.json({
      totalFerramentas: parseInt(totalFerramentas.rows[0].total),
      valorEstoque: parseFloat(valorEstoque.rows[0].total) || 0,
      estoqueBaixo: parseInt(estoqueBaixo.rows[0].total),
      movimentacoesRecentes: movimentacoesRecentes.rows
    });
  } catch (error) {
    console.error('Erro no dashboard:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rota para inicializar o banco
app.get('/api/init', async (req, res) => {
  try {
    await initializeDatabase();
    res.json({ message: '✅ Banco de dados inicializado com sucesso!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Inicializar servidor
async function startServer() {
  console.log('🔄 Inicializando sistema...');
  
  await initializeDatabase();
  
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📦 Sistema de Controle de Estoque (PostgreSQL)`);
    console.log(`📝 API disponível em http://localhost:${PORT}/api`);
    console.log(`🔍 Teste a conexão: http://localhost:${PORT}/api/test`);
    console.log(`👤 Login: admin@estoque.com | Senha: admin123`);
  });
}

startServer().catch(console.error);