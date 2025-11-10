-- Script para verificar e corrigir estrutura da tabela emprestimos
-- Execute este script se o banco já existe

USE biblioteca_db;

-- Verificar e adicionar campos se não existirem
SET @dbname = DATABASE();
SET @tablename = "emprestimos";
SET @columnname = "quantidade_movimentada";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  "SELECT 'Column already exists.';",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname, " INT DEFAULT 1 AFTER tipo_movimentacao;")
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @columnname2 = "tipo_movimentacao";
SET @preparedStatement2 = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname2)
  ) > 0,
  "SELECT 'Column already exists.';",
  CONCAT("ALTER TABLE ", @tablename, " ADD COLUMN ", @columnname2, " ENUM('entrada', 'saida') DEFAULT 'saida' AFTER nome_usuario;")
));
PREPARE alterIfNotExists2 FROM @preparedStatement2;
EXECUTE alterIfNotExists2;
DEALLOCATE PREPARE alterIfNotExists2;

-- Atualizar registros antigos
UPDATE emprestimos SET quantidade_movimentada = 1 WHERE quantidade_movimentada IS NULL OR quantidade_movimentada = 0;
UPDATE emprestimos SET tipo_movimentacao = 'saida' WHERE tipo_movimentacao IS NULL;

