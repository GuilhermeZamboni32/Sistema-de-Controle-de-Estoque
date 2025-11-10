-- Script de migração para adicionar campos necessários
-- Execute apenas se o banco já existe e precisa ser atualizado

USE biblioteca_db;

-- Adicionar campo estoque_minimo se não existir
ALTER TABLE livros 
ADD COLUMN IF NOT EXISTS estoque_minimo INT DEFAULT 1 AFTER quantidade;

-- Adicionar campos de movimentação se não existirem
ALTER TABLE emprestimos 
ADD COLUMN IF NOT EXISTS tipo_movimentacao ENUM('entrada', 'saida') DEFAULT 'saida' AFTER nome_usuario;

ALTER TABLE emprestimos 
ADD COLUMN IF NOT EXISTS quantidade_movimentada INT DEFAULT 1 AFTER tipo_movimentacao;

-- Atualizar registros antigos sem quantidade_movimentada
UPDATE emprestimos 
SET quantidade_movimentada = 1 
WHERE quantidade_movimentada IS NULL;

UPDATE emprestimos 
SET tipo_movimentacao = 'saida' 
WHERE tipo_movimentacao IS NULL;

-- Atualizar livros sem estoque_minimo
UPDATE livros 
SET estoque_minimo = 1 
WHERE estoque_minimo IS NULL;

