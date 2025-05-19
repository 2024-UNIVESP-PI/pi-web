import { useContext } from "react"
import { Outlet, useLocation } from "react-router-dom"

import CaixaContext, { CaixaProvider } from "../../contexts/CaixaContext"

import Header from "./components/Header"
import ActivityIndicator from "../../components/ActivityIndicator"
import Notice from "../../components/Notice"

import './styles.scss'

export default function Layout() {
    const location = useLocation()
    const isDashboard = location.pathname.startsWith("/admin-dashboard")

    if (isDashboard) {
        // For admin dashboard routes, render layout *without* CaixaProvider
        return (
            <div id="layout">
                <Header />

                <main>
                    <Outlet />
                </main>
            </div>
        )
    }

    // For other routes, wrap with CaixaProvider and use CaxaContext
    return (
        <CaixaProvider>
            <LayoutContent />
        </CaixaProvider>
    )
}

function LayoutContent() {
    const caixaContext = useContext(CaixaContext.Context)

    return (
        <div id="layout">
            <Header />

            <main>
                {
                    !caixaContext?.hasChecked ?
                        <ActivityIndicator margin />
                        :
                        caixaContext?.caixa ?
                            <Outlet />
                            :
                            <Notice margin>
                                <p className="title">Caixa não definido</p>
                                <p>Selecione o caixa no <b>menu de navegação</b> antes de operar no sistema.</p>
                            </Notice>
                }
            </main>
        </div>
    )
}