import { Outlet } from "react-router-dom"

import Header from "./components/Header"

import './styles.scss'
export type LayoutProps = {
}

export default function Layout(props: LayoutProps) {
    return (
        <div id="layout">
            <Header />

            <main>
                <Outlet />
            </main>
        </div>
    )
}