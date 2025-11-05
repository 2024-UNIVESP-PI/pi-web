import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { FaCashRegister } from "react-icons/fa6";
import CaixaContext from "../../contexts/CaixaContext";
import Input from "../../components/Input";
import Button from "../../components/Button";
import "./styles.scss";

export default function CaixaLoginPage() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const caixaContext = useContext(CaixaContext.Context);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!usuario.trim() || !senha.trim()) {
      setError("Usuário e senha são obrigatórios.");
      setLoading(false);
      return;
    }

    if (caixaContext?.login) {
      const success = await caixaContext.login(usuario.trim(), senha.trim());
      if (success) {
        navigate("/");
      } else {
        setError("Usuário ou senha inválidos.");
      }
    } else {
      setError("Erro ao inicializar sistema de login.");
    }
    setLoading(false);
  };

  return (
    <div id="caixa-login-page">
      <div className="login-container">
        <div className="login-header">
          <FaCashRegister size={48} />
          <h2>Login do Caixa</h2>
          <p>Faça login para acessar o sistema</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <Input
            id="usuario"
            type="text"
            label="Usuário"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            placeholder="Digite seu usuário"
            required
          />

          <Input
            id="senha"
            type="password"
            label="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Digite sua senha"
            required
          />

          <Button
            type="submit"
            color="var(--color-green)"
            loading={loading}
            className="login-button"
          >
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
