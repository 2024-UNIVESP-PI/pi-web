import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../../contexts/AdminContext";

import "./styles.scss";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useAdmin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const success = login(username, password);
    if (success) {
      navigate("/admin-dashboard");
    } else {
      setError("Usuário ou senha inválidos.");
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
            placeholder="admin"
          />
        </div>
        <div>
          <label>Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="admin123"
          />
        </div>
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}