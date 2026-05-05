import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";

import Layout from "./Layout";

import HomePage from "../pages/HomePage";
import VendasPage from "../pages/VendasPage";
import FichasPage from "../pages/FichasPage";
import AdminLoginPage from "../pages/AdminLoginPage";
import CaixaLoginPage from "../pages/CaixaLoginPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import ReservaPublicaPage from "../pages/ReservaPublicaPage";
import ReservasAdminPage from "../pages/ReservasAdminPage";
import CaixasAdminPage from "../pages/CaixasAdminPage";
import ProdutosAdminPage from "../pages/ProdutosAdminPage";
import FichasAdminPage from "../pages/FichasAdminPage";
import MovimentacoesAdminPage from "../pages/MovimentacoesAdminPage";

import { useAdmin } from "../contexts/AdminContext";
import { CaixaProvider } from "../contexts/CaixaContext";
import { useContext } from "react";
import CaixaContext from "../contexts/CaixaContext";
import { useLocation } from "react-router-dom";

function ProtectedRoute({ element }: { element: JSX.Element }) {
  const { isAdmin } = useAdmin();
  return isAdmin ? element : <Navigate to="/admin-login" replace />;
}

function ProtectedCaixaRoute({ element }: { element: JSX.Element }) {
  const caixaContext = useContext(CaixaContext.Context);

  if (!caixaContext?.hasChecked) {
    // Aguardando verificação
    return <div>Carregando...</div>;
  }

  if (caixaContext.isLoggedIn) {
    return element;
  }

  return <Navigate to="/caixa-login" replace />;
}

function CatchAllRedirect() {
  const location = useLocation();

  // Se for rota admin (exceto /admin-login), redireciona para /admin-login
  if (
    location.pathname.startsWith("/admin-") &&
    location.pathname !== "/admin-login"
  ) {
    return <Navigate to="/admin-login" replace />;
  }

  // Para qualquer outra rota, redireciona para /caixa-login
  return <Navigate to="/caixa-login" replace />;
}

// Layout with CaixaProvider and protected routes
function LayoutWithCaixaProtected() {
  return (
    <CaixaProvider>
      <Layout />
    </CaixaProvider>
  );
}

const router = createBrowserRouter([
  {
    // Public routes - caixa-login needs CaixaProvider for login functionality
    element: <LayoutWithCaixaProtected />,
    children: [{ path: "/caixa-login", element: <CaixaLoginPage /> }],
  },
  {
    // Public routes - admin-login needs CaixaProvider to logout caixa on admin login
    element: <LayoutWithCaixaProtected />,
    children: [{ path: "/admin-login", element: <AdminLoginPage /> }],
  },
  {
    // Routes that require Caixa login
    element: <LayoutWithCaixaProtected />,
    children: [
      {
        path: "/",
        element: <ProtectedCaixaRoute element={<HomePage />} />,
      },
      {
        path: "/vendas",
        element: <ProtectedCaixaRoute element={<VendasPage />} />,
      },
      {
        path: "/fichas",
        element: <ProtectedCaixaRoute element={<FichasPage />} />,
      },
    ],
  },
  {
    // Routes that require Admin login - use CaixaProvider to allow logout caixa on admin access
    element: <LayoutWithCaixaProtected />,
    children: [
      {
        path: "/admin-dashboard",
        element: <ProtectedRoute element={<AdminDashboardPage />} />,
      },
      {
        path: "/admin-reservas",
        element: <ProtectedRoute element={<ReservasAdminPage />} />,
      },
      {
        path: "/admin-caixas",
        element: <ProtectedRoute element={<CaixasAdminPage />} />,
      },
      {
        path: "/admin-produtos",
        element: <ProtectedRoute element={<ProdutosAdminPage />} />,
      },
      {
        path: "/admin-fichas",
        element: <ProtectedRoute element={<FichasAdminPage />} />,
      },
      {
        path: "/admin-movimentacoes",
        element: <ProtectedRoute element={<MovimentacoesAdminPage />} />,
      },
    ],
  },
  {
    // Public reservation page (no layout)
    path: "/reservas/:qrCode",
    element: <ReservaPublicaPage />,
  },
  {
    // Catch-all route - redireciona para /caixa-login (exceto se for rota admin)
    path: "*",
    element: <Layout />,
    children: [
      {
        path: "*",
        element: <CatchAllRedirect />,
      },
    ],
  },
]);

export default function RouterWrapper() {
  return <RouterProvider router={router} />;
}
