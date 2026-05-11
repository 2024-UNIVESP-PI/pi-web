import { useContext, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import CaixaContext from "../../contexts/CaixaContext";

import Header from "./components/Header";
import ActivityIndicator from "../../components/ActivityIndicator";

import "./styles.scss";

export default function Layout() {
  const location = useLocation();
  const isPublicRoute =
    location.pathname === "/admin-login" ||
    location.pathname === "/caixa-login";

  if (isPublicRoute) {
    return (
      <div id="layout">
        <Header />

        <main>
          <Outlet />
        </main>
      </div>
    );
  }

  return <LayoutContent />;
}

function LayoutContent() {
  const caixaContext = useContext(CaixaContext.Context);
  const navigate = useNavigate();
  const location = useLocation();

  // Redireciona para /caixa-login se não estiver logado e não estiver em rota pública ou admin
  const isAdminRoute = location.pathname.startsWith("/admin-");
  const isPublicRoute =
    location.pathname === "/caixa-login" ||
    location.pathname === "/admin-login";

  useEffect(() => {
    if (
      caixaContext?.hasChecked &&
      !caixaContext?.isLoggedIn &&
      !isPublicRoute &&
      !isAdminRoute
    ) {
      navigate("/caixa-login", { replace: true });
    }
  }, [
    caixaContext?.hasChecked,
    caixaContext?.isLoggedIn,
    location.pathname,
    navigate,
    isPublicRoute,
    isAdminRoute,
  ]);

  // Permite que as páginas de login sejam renderizadas mesmo sem estar logado
  const isLoginPage =
    location.pathname === "/caixa-login" ||
    location.pathname === "/admin-login";

  if (!caixaContext?.hasChecked) {
    return (
      <div id="layout">
        <Header />
        <main>
          <ActivityIndicator margin />
        </main>
      </div>
    );
  }

  // Se estiver na página de login ou rota admin, sempre renderiza (não precisa estar logado como caixa)
  if (isLoginPage || isAdminRoute) {
    return (
      <div id="layout">
        <Header />
        <main>
          <Outlet />
        </main>
      </div>
    );
  }

  // Para outras rotas, precisa estar logado como caixa
  if (!caixaContext?.isLoggedIn) {
    // Ainda renderiza enquanto o redirect acontece
    return (
      <div id="layout">
        <Header />
        <main>
          <ActivityIndicator margin />
        </main>
      </div>
    );
  }

  return (
    <div id="layout">
      <Header />

      <main>
        <Outlet />
      </main>
    </div>
  );
}
