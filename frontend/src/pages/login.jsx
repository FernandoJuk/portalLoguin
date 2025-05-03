import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // ⬅ importando useNavigate
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate(); // ⬅ inicializando o hook

  const handleLogin = async (e) => {
    e.preventDefault();

    const API_URL =
      window.location.hostname === 'localhost'
        ? 'http://localhost:5000'
        : 'http://192.168.0.111:5000'; // IP do seu PC para acesso pelo celular

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha: password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        localStorage.setItem("nome", data.usuario.nome);
        localStorage.setItem("admin", data.usuario.admin); // salva status de admin

        alert("Login realizado com sucesso!");

        // Redireciona para rota específica
        if (data.usuario.admin === true) {
          navigate("/admin/upload");
        } else {
          navigate("/dashboard");
        }
      } else if (response.status === 401) {
        const msg = await response.text();
        alert(msg);
      } else {
        const msg = await response.text();
        alert("Erro: " + msg);
      }
    } catch (err) {
      console.error(err);
      alert("Erro de conexão com o servidor");
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Entrar</button>
      </form>
      <p>Não tem uma conta? <Link to="/signup">Cadastre-se</Link></p>
    </div>
  );
};

export default Login;