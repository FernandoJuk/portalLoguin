// src/pages/Signup.jsx

import React, { useState } from 'react';
import './Signup.css'; // Para estilização, crie esse arquivo CSS também

function Signup() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha }),
      });
  
      if (response.ok) {
        alert("Cadastro realizado com sucesso!");
        // Redirecionar para a página de login ou dashboard
        window.location.href = "/login"; // ou use o react-router-dom para redirecionar
      } else {
        const text = await response.text();
        alert("Erro ao cadastrar: " + text);
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão com o servidor");
    }
  };

  return (
    <div className="signup">
      <div className="container">
        <h2>Cadastro</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
          <button type="submit">Cadastrar</button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
