import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../../contexts/AdminContext";
import CaixaContext from "../../contexts/CaixaContext";

import "./styles.scss";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAdmin();
  const caixaContext = useContext(CaixaContext.Context);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      const success = await login(username.trim(), password);
      if (success) {
        caixaContext?.logout();
        navigate("/admin-dashboard", { replace: true });
      } else {
        setError("Usuário ou senha inválidos.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="admin-login-page">
      <form onSubmit={handleSubmit}>
        <h2>Login do Administrador</h2>
        {error && <p className="error">{error}</p>}
        <div>
          <label>Usuário</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Digite o usuário"
          />
        </div>
        <div>
          <label>Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite a senha"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
