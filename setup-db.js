const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    multipleStatements: true,
    connectTimeout: 10000,
    timeout: 10000
  };
  
  console.log('Configuração:', {
    host: config.host,
    user: config.user,
    password: config.password ? '***' : '(vazio)'
  });

  let connection;
  
  try {
    console.log('Conectando ao MySQL...');
    connection = await mysql.createConnection(config);
    console.log('✅ Conectado ao MySQL');

    console.log('Lendo script SQL...');
    const sql = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');

    console.log('Executando script SQL...');
    await connection.query(sql);

    console.log('✅ Banco de dados criado com sucesso!');
    console.log('\nUsuários padrão:');
    console.log('Email: admin@biblioteca.com');
    console.log('Senha: admin123');
    
    if (connection) {
      await connection.end();
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar banco de dados:', error.message);
    console.error('Código do erro:', error.code);
    
    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('\n💡 Dica: O MySQL pode estar ainda inicializando.');
      console.error('💡 Aguarde alguns segundos e tente novamente.');
      console.error('💡 Verifique: docker-compose logs mysql');
    }
    
    if (connection) {
      try {
        await connection.end();
      } catch (e) {
        // Ignorar
      }
    }
    
    process.exit(1);
  }
}

setupDatabase();

