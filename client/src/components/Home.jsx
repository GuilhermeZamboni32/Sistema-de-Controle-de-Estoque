import React from 'react';

function Home() {
  return (
    <div className="container">
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <h1>Bem-vindo ao Sistema de Gestão de Biblioteca</h1>
        <p style={{ fontSize: '18px', color: '#666', marginTop: '20px' }}>
          Gerencie livros, autores e empréstimos de forma simples e eficiente.
        </p>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px', 
          marginTop: '50px' 
        }}>
          <div className="card" style={{ 
            padding: '30px', 
            background: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
          }}>
            <h3>📚 Livros</h3>
            <p>Gerencie o acervo de livros da biblioteca</p>
          </div>
          
          <div className="card" style={{ 
            padding: '30px', 
            background: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
          }}>
            <h3>✍️ Autores</h3>
            <p>Cadastre e gerencie autores</p>
          </div>
          
          <div className="card" style={{ 
            padding: '30px', 
            background: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
          }}>
            <h3>📖 Empréstimos</h3>
            <p>Controle de empréstimos e devoluções</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

