import { ReactNode, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaCashRegister,
  FaMoneyCheckDollar,
  FaChartBar,
  FaUserShield,
  FaRightFromBracket,
  FaQrcode,
  FaStore,
  FaUsers,
  FaMoneyBillTransfer,
} from "react-icons/fa6";

import { useAdmin } from "../../../../contexts/AdminContext";
import CaixaContext from "../../../../contexts/CaixaContext";

import "./styles.scss";

export type MenuItemProps = {
  to?: string;
  icon: ReactNode;
  text: string;
  onClick?: () => void;
  className?: string;
};

function MenuItem(props: MenuItemProps) {
  const location = useLocation();
  const isOnRoute = props.to && location.pathname.includes(props.to);

  const baseClass =
    "menu-item" +
    (isOnRoute ? " on" : "") +
    (props.className ? ` ${props.className}` : "");

  // Para items com onClick (como logout), não precisa de delay
  const handleClick = props.onClick
    ? () => {
        // Para logout, não precisa esperar
        props.onClick?.();
      }
    : undefined;

  return props.to ? (
    <Link to={props.to} className={baseClass}>
      {props.icon}
      {props.text}
    </Link>
  ) : (
    <div className={baseClass} onClick={handleClick}>
      {props.icon}
      {props.text}
    </div>
  );
}

export default function Menu() {
  const { isAdmin, logout: logoutAdmin } = useAdmin();
  const caixaContext = useContext(CaixaContext.Context);
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginRoute =
    location.pathname === "/caixa-login" || location.pathname === "/admin-login";

  // Verifica se o caixa está realmente logado - verificações diretas no JSX

  const handleLogoutAdmin = () => {
    logoutAdmin();
    caixaContext?.logout();
    navigate("/admin-login", { replace: true });
  };

  const handleLogoutCaixa = () => {
    caixaContext?.logout();
    logoutAdmin();
    navigate("/caixa-login", { replace: true });
  };

  if (isLoginRoute) {
    return (
      <nav id="menu" className="login-menu">
        <MenuItem
          text="Logar como Caixa"
          to="/caixa-login"
          icon={<FaCashRegister />}
        />
        <MenuItem
          text="Logar como Admin"
          to="/admin-login"
          icon={<FaUserShield />}
        />
      </nav>
    );
  }

  return (
    <nav id="menu">
      <p className="title">MENU</p>

      {/* Informação do caixa no topo do menu - só mostra se realmente estiver logado */}
      {/* Verificação rigorosa: DEVE estar logado E ter caixaData */}
      {!isAdmin &&
        caixaContext &&
        caixaContext.hasChecked === true &&
        caixaContext.isLoggedIn === true &&
        caixaContext.caixaData &&
        caixaContext.caixaData.nome && (
          <div className="caixa-info">
            <p className="caixa-label">Caixa</p>
            <p className="caixa-name">{caixaContext.caixaData.nome}</p>
          </div>
        )}

      {!isAdmin ? (
        <>
          {/* Só mostra Vendas e Fichas se o caixa estiver realmente logado */}
          {/* Verificação rigorosa: DEVE estar logado */}
          {caixaContext &&
            caixaContext.hasChecked === true &&
            caixaContext.isLoggedIn === true && (
              <>
                <MenuItem
                  text="Vendas"
                  to="/vendas"
                  icon={<FaCashRegister />}
                />
                <MenuItem
                  text="Fichas"
                  to="/fichas"
                  icon={<FaMoneyCheckDollar />}
                />
              </>
            )}

          {/* Só mostra Sair se o caixa estiver realmente logado */}
          {/* Verificação rigorosa: DEVE estar logado */}
          {caixaContext &&
            caixaContext.hasChecked === true &&
            caixaContext.isLoggedIn === true && (
              <MenuItem
                text="Sair"
                icon={<FaRightFromBracket />}
                onClick={handleLogoutCaixa}
                className="logout"
              />
            )}
        </>
      ) : (
        <>
          <MenuItem
            text="Dashboard"
            to="/admin-dashboard"
            icon={<FaChartBar />}
          />
          <MenuItem
            text="Reservas Antecipadas"
            to="/admin-reservas"
            icon={<FaQrcode />}
          />
          <MenuItem
            text="Gerenciar Caixas"
            to="/admin-caixas"
            icon={<FaUsers />}
          />
          <MenuItem
            text="Gerenciar Produtos"
            to="/admin-produtos"
            icon={<FaStore />}
          />
          <MenuItem
            text="Gerenciar Fichas"
            to="/admin-fichas"
            icon={<FaMoneyCheckDollar />}
          />
          <MenuItem
            text="Movimentações"
            to="/admin-movimentacoes"
            icon={<FaMoneyBillTransfer />}
          />
          <MenuItem
            text="Sair do Dashboard"
            icon={<FaRightFromBracket />}
            onClick={handleLogoutAdmin}
            className="logout"
          />
        </>
      )}
    </nav>
  );
}
