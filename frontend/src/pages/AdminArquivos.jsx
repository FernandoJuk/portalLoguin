import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminArquivos() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [arquivos, setArquivos] = useState([]);
  const [filtroNome, setFiltroNome] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroData, setFiltroData] = useState("");

  useEffect(() => {
    const isAdmin = localStorage.getItem("admin");
    if (!token || isAdmin !== "true") {
      alert("Acesso negado");
      navigate("/dashboard");
      return;
    }

    fetch("http://localhost:5000/admin/arquivos", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setArquivos(data))
      .catch((err) => {
        console.error(err);
        alert("Erro ao carregar arquivos");
      });
  }, [navigate, token]);

  const excluirArquivo = async (id) => {
    if (!window.confirm("Deseja excluir este arquivo?")) return;

    const res = await fetch(`http://localhost:5000/admin/arquivo/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      setArquivos(arquivos.filter((a) => a.id !== id));
      alert("Arquivo excluído");
    } else {
      alert("Erro ao excluir");
    }
  };

  const arquivosFiltrados = arquivos.filter((a) => {
    const nomeMatch = a.nome_usuario.toLowerCase().includes(filtroNome.toLowerCase());
    const tipoMatch = filtroTipo ? a.tipo === filtroTipo : true;
    const dataMatch = filtroData
      ? new Date(a.data_envio).toLocaleDateString("pt-BR").includes(filtroData)
      : true;
    return nomeMatch && tipoMatch && dataMatch;
  });

  return (
    <div style={{ padding: 20 }}>
      <h2>Gerenciar Arquivos - Admin</h2>
      <button onClick={() => navigate("/admin/upload")}>← Voltar para Upload</button>

      {/* Filtros */}
      <div style={{ marginTop: 20, marginBottom: 10, display: "flex", gap: 10 }}>
        <input
          type="text"
          placeholder="Filtrar por nome"
          value={filtroNome}
          onChange={(e) => setFiltroNome(e.target.value)}
        />
        <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
          <option value="">Todos os tipos</option>
          <option value="nota">Nota</option>
          <option value="boleto">Boleto</option>
        </select>
        <input
          type="text"
          placeholder="Filtrar por data (dd/mm/aaaa)"
          value={filtroData}
          onChange={(e) => setFiltroData(e.target.value)}
        />
      </div>

      <table border="1" cellPadding="8" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Usuário</th>
            <th>Email</th>
            <th>Nome do Arquivo</th>
            <th>Tipo</th>
            <th>Data</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {arquivosFiltrados.map((a) => (
            <tr key={a.id}>
              <td>{a.nome_usuario}</td>
              <td>{a.email}</td>
              <td>{a.nome_arquivo}</td>
              <td style={{ textTransform: "capitalize", fontWeight: "bold" }}>
                {a.tipo === "nota" ? "Nota" : "Boleto"}
              </td>
              <td>{new Date(a.data_envio).toLocaleString("pt-BR")}</td>
              <td>
                <button onClick={() => excluirArquivo(a.id)}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminArquivos;
