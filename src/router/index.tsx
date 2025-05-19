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
import AdminDashboardPage from "../pages/DashboardPage.tsx"

import { useAdmin } from "../contexts/AdminContext"

function ProtectedRoute({ element }: { element: JSX.Element }) {
    const { isAdmin } = useAdmin()

    return isAdmin ? element : <Navigate to="/admin-login" replace />
}

const router = createBrowserRouter([
    {
        element: <Layout />,
        children: [
            { path: "/", element: <HomePage /> },
            { path: "/vendas", element: <VendasPage /> },
            { path: "/produtos", element: <ProdutosPage /> },
            { path: "/fichas", element: <FichasPage /> },
            { path: "/admin-login", element: <AdminLoginPage /> },
            {path: "/admin-dashboard", element: <ProtectedRoute element={<AdminDashboardPage />} />},
            { path: "*", element: <Navigate to="/" replace /> },
        ]
    }
])

export default function Router() {
    return <RouterProvider router={router} />
}
