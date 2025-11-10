-- Criar banco de dados (se não existir)
CREATE DATABASE IF NOT EXISTS biblioteca_db;
USE biblioteca_db;

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  tipo ENUM('admin', 'bibliotecario', 'usuario') DEFAULT 'usuario',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Autores
CREATE TABLE IF NOT EXISTS autores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  nacionalidade VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Livros
CREATE TABLE IF NOT EXISTS livros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  isbn VARCHAR(50) UNIQUE NOT NULL,
  autor_id INT,
  quantidade INT DEFAULT 1,
  estoque_minimo INT DEFAULT 1,
  ano_publicacao INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (autor_id) REFERENCES autores(id) ON DELETE SET NULL
);

-- Tabela de Empréstimos (também funciona como movimentações de estoque)
CREATE TABLE IF NOT EXISTS emprestimos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  livro_id INT NOT NULL,
  nome_usuario VARCHAR(255) NOT NULL,
  tipo_movimentacao ENUM('entrada', 'saida') DEFAULT 'saida',
  quantidade_movimentada INT DEFAULT 1,
  data_emprestimo DATE NOT NULL,
  data_devolucao_prevista DATE,
  data_devolucao DATE,
  status VARCHAR(50) DEFAULT 'ativo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (livro_id) REFERENCES livros(id) ON DELETE CASCADE
);

-- Inserir dados de exemplo
INSERT INTO autores (nome, nacionalidade) VALUES
('Machado de Assis', 'Brasileiro'),
('Clarice Lispector', 'Brasileiro'),
('Jorge Amado', 'Brasileiro');

INSERT INTO livros (titulo, isbn, autor_id, quantidade, estoque_minimo, ano_publicacao) VALUES
('Dom Casmurro', '978-85-359-0277-0', 1, 5, 2, 1899),
('A Hora da Estrela', '978-85-359-0278-1', 2, 3, 1, 1977),
('Capitães da Areia', '978-85-359-0279-2', 3, 4, 2, 1937);

-- Inserir usuário padrão (senha: admin123)
INSERT INTO usuarios (nome, email, senha, tipo) VALUES
('Administrador', 'admin@biblioteca.com', 'admin123', 'admin'),
('Bibliotecário', 'biblioteca@biblioteca.com', 'bib123', 'bibliotecario');

