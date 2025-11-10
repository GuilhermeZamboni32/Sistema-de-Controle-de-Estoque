-- Criar tabelas para o sistema de estoque

CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) DEFAULT 'usuario',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fornecedores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
);

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
);

-- Inserir usuário admin padrão
INSERT INTO usuarios (nome, email, senha, tipo) 
VALUES ('Administrador', 'admin@estoque.com', 'admin123', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Inserir alguns fornecedores de exemplo
INSERT INTO fornecedores (nome, telefone, email) VALUES 
('Fornecedor A', '(11) 9999-9999', 'contato@fornecedora.com'),
('Fornecedor B', '(11) 8888-8888', 'vendas@fornecedorb.com')
ON CONFLICT DO NOTHING;