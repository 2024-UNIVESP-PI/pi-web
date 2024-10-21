import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom"

import Layout from "./Layout"

import VendasPage from "../pages/VendasPage"
import ProdutosPage from "../pages/ProdutosPage"

const router = createBrowserRouter([
    {
        element: <Layout/>,
        children: [
            {
                path: "/",
                element: <div>Hello world!</div>,
            },
            {
                path: "/vendas",
                element: <VendasPage/>,
            },
            {
                path: "/produtos",
                element: <ProdutosPage/>,
            },
            {
                path: "/fichas",
                element: <div>Fichas</div>,
            },
        ]
    }
])

export default function Router() {
    return (
        <RouterProvider router={router} />
    )
}

