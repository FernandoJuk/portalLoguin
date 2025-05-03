import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const API_URL =
      window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : 'http://192.168.0.111:5000'; // IP do seu PC para acesso pelo celular
        
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [arquivos, setArquivos] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const nome = localStorage.getItem('nome');

    if (!token) {
      alert("Você precisa estar logado para acessar!");
      navigate('/login');
      return;
    }

    setUsuario({ token, nome });

    // Buscar os arquivos do usuário
    fetch(`${API_URL}/meus-arquivos`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setArquivos(data))
      .catch((err) => {
        console.error(err);
        alert("Erro ao buscar arquivos");
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nome');
    localStorage.removeItem('admin');
    navigate('/login');
  };

  const handleDownload = (id) => {
    const token = localStorage.getItem('token');
    window.open(`${API_URL}/download/${id}?token=${token}`, '_blank');
  };
  return (
    <div style={{ padding: 20 }} className="dashboard">
      <h2>Bem-vindo, {usuario?.nome}!</h2>
      

      <h3>Seus Arquivos</h3>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Arquivo</th>
            <th>Data</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {arquivos.map((arq) => (
            <tr key={arq.id}>
              <td>{arq.tipo}</td>
              <td>{arq.nome_arquivo}</td>
              <td>{new Date(arq.data_envio).toLocaleString()}</td>
              <td>
                <button onClick={() => handleDownload(arq.id)}>Download</button>
              </td>
            </tr>
            
          ))}
        </tbody>
      </table>
      <button onClick={handleLogout}>Sair</button>
    </div>
  );
}

export default Dashboard;