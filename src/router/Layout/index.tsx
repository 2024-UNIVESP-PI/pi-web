import { useContext } from "react"
import { Outlet } from "react-router-dom"

import CaixaContext from "../../contexts/CaixaContext"

import Header from "./components/Header"
import ActivityIndicator from "../../components/ActivityIndicator"
import Notice from "../../components/Notice"

import './styles.scss'

export default function Layout() {
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