import { useEffect, useState } from "react";
import { redirect, useNavigate } from "react-router-dom";
import './UploadAdmin.css';

function UploadAdmin() {
  const navigate = useNavigate();
  const [arquivos, setArquivos] = useState([]);
  const [usuarioId, setUsuarioId] = useState("");
  const [tipo, setTipo] = useState("nota");
  const [usuarios, setUsuarios] = useState([]);
  const [usuario, setUsuario] = useState(null);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const isAdmin = localStorage.getItem("admin");
    const nome = localStorage.getItem("nome");

    if (!token || isAdmin !== "true") {
      alert("Acesso não autorizado");
      navigate("/dashboard");
      return;
    }
    setUsuario({ nome });
    fetch("http://localhost:5000/usuarios", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUsuarios(data))
      .catch((err) => {
        console.error(err);
        alert("Erro ao buscar usuários");
      });
  }, [navigate]);

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
  
    arquivos.forEach((file) => {
      formData.append("arquivos", file); // campo plural
    });
  
    formData.append("usuario_id", usuarioId);
    formData.append("tipo", tipo); // se quiser separar depois, podemos permitir múltiplos tipos também
  
    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
  
      const data = await response.json();
      if (response.ok) {
        alert("Upload realizado com sucesso!");
      } else {
        alert("Erro no upload: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar os arquivos");
    }
  };

  // Filtro de usuários por nome digitado
  const usuariosFiltrados = usuarios.filter((u) =>
    u.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nome');
    localStorage.removeItem('admin');
    navigate('/login');
  };

  return (
    <div className="upload-admin" >
      <h2>USÚARIO ADMINISTRADOR</h2>
      <h2>{usuario?.nome} !</h2>
      <form onSubmit={handleUpload}>
        <input
          type="text"
          placeholder="Buscar usuário por nome"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          style={{ marginBottom: 10 }}
        />

        <select
          value={usuarioId}
          onChange={(e) => setUsuarioId(e.target.value)}
          required
        >
          <option value="">Selecione o usuário</option>
          {usuariosFiltrados.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nome} ({u.email})
            </option>
          ))}
        </select>

        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          style={{ marginTop: 10 }}
        >
          <option value="nota">Nota</option>
          <option value="boleto">Boleto</option>
        </select>
          <h3>Permitido selceção de diversos simultaneo</h3>
        <input
          type="file"
          accept="application/pdf"
          multiple
          onChange={(e) => setArquivos(Array.from(e.target.files))}
          required
        />

        <button type="submit">Enviar</button>
      </form>
      <button style={{ backgroundColor: 'red' }} onClick={handleLogout}>Sair</button>
    </div>
  );
}

export default UploadAdmin;




// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";

// function UploadAdmin() {
//   const navigate = useNavigate();
//   const [arquivo, setArquivo] = useState(null);
//   const [usuarioId, setUsuarioId] = useState("");
//   const [tipo, setTipo] = useState("nota");
//   const [usuarios, setUsuarios] = useState([]);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const isAdmin = localStorage.getItem("admin");

//     if (!token || isAdmin !== "true") {
//       alert("Acesso não autorizado");
//       navigate("/dashboard");
//       return;
//     }

//     fetch("http://localhost:5000/usuarios", {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then((res) => res.json())
//       .then((data) => setUsuarios(data))
//       .catch((err) => {
//         console.error(err);
//         alert("Erro ao buscar usuários");
//       });
//   }, [navigate]);

//   const handleUpload = async (e) => {
//     e.preventDefault();
//     const formData = new FormData();
//     formData.append("arquivo", arquivo);
//     formData.append("usuario_id", usuarioId);
//     formData.append("tipo", tipo);

//     try {
//       const response = await fetch("http://localhost:5000/upload", {
//         method: "POST",
//         body: formData,
//       });

//       const data = await response.json();
//       if (response.ok) {
//         alert("Upload realizado com sucesso!");
//       } else {
//         alert("Erro no upload: " + data.message);
//       }
//     } catch (err) {
//       console.error(err);
//       alert("Erro ao enviar o arquivo");
//     }
//   };

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>Upload de Arquivo (Admin)</h2>
//       <form onSubmit={handleUpload}>
//         <select
//           value={usuarioId}
//           onChange={(e) => setUsuarioId(e.target.value)}
//           required
//         >
//           <option value="">Selecione o usuário</option>
//           {usuarios.map((u) => (
//             <option key={u.id} value={u.id}>
//               {u.nome} ({u.email})
//             </option>
//           ))}
//         </select>

//         <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
//           <option value="nota">Nota</option>
//           <option value="boleto">Boleto</option>
//         </select>

//         <input
//           type="file"
//           accept="application/pdf"
//           onChange={(e) => setArquivo(e.target.files[0])}
//           required
//         />
//         <button type="submit">Enviar</button>
//       </form>
//     </div>
//   );
// }

// export default UploadAdmin;