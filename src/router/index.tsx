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

const router = createBrowserRouter([
    {
        element: <Layout />,
        children: [
            {
                path: "/",
                element: <HomePage />,
            },
            {
                path: "/vendas",
                element: <VendasPage />,
            },
            {
                path: "/produtos",
                element: <ProdutosPage />,
            },
            {
                path: "/fichas",
                element: <FichasPage />,
            },
            {
                path: "*",
                element: <Navigate to="/" replace />,
            },
        ]
    }
])

export default function Router() {
    return (
        <RouterProvider router={router} />
    )
}

