import {
    createBrowserRouter,
    Navigate,
    RouterProvider,
} from "react-router-dom"

import Layout from "./Layout"

import HomePage from "../pages/HomePage"
import VendasPage from "../pages/VendasPage"
import ProdutosPage from "../pages/ProdutosPage"
import FichasPage from "../pages/FichasPage"
import AdminLoginPage from "../pages/AdminPage"
import AdminDashboardPage from "../pages/AdminDashboardPage"

import { useAdmin } from "../contexts/AdminContext"
import { CaixaProvider } from "../contexts/CaixaContext"

function ProtectedRoute({ element }: { element: JSX.Element }) {
    const { isAdmin } = useAdmin()
    return isAdmin ? element : <Navigate to="/admin-login" replace />
}

// Layout with CaixaProvider wrapper
function LayoutWithCaixa() {
    return (
        <CaixaProvider>
            <Layout />
        </CaixaProvider>
    )
}

const router = createBrowserRouter([
    {
        // Routes that require CaixaProvider
        element: <LayoutWithCaixa />,
        children: [
            { path: "/", element: <HomePage /> },
            { path: "/vendas", element: <VendasPage /> },
            { path: "/produtos", element: <ProdutosPage /> },
            { path: "/fichas", element: <FichasPage /> },
            { path: "/admin-login", element: <AdminLoginPage /> },
        ],
    },
    {
        // Routes that do NOT use CaixaProvider
        element: <Layout />,
        children: [
            {
                path: "/admin-dashboard",
                element: <ProtectedRoute element={<AdminDashboardPage />} />,
            },
        ],
    },
    {
        // Catch-all route
        path: "*",
        element: <Navigate to="/" replace />,
    },
])

export default function RouterWrapper() {
    return <RouterProvider router={router} />
}