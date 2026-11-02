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
        caixaContext?.logout(true);
        navigate("/admin-dashboard", { replace: true });
      } else {
        setError("Usuário ou senha inválidos.");
      }
    } catch {
      setError("Não foi possível realizar o login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main id="admin-login-page">
      <form onSubmit={handleSubmit}>
        <h1>Login do Administrador</h1>
        {error && <p className="error" role="alert">{error}</p>}
        <div>
          <label htmlFor="username">Usuário</label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Digite o usuário"
          />
        </div>
        <div>
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite a senha"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
