import { ReactNode } from "react"
import { Link, useLocation } from "react-router-dom"
import {
    FaCashRegister,
    FaBoxOpen,
    FaMoneyCheckDollar,
    FaChartBar,
    FaUserShield,
} from "react-icons/fa6"

import { useAdmin } from "../../../../contexts/AdminContext"

import './styles.scss'

export type MenuItemProps = {
    to: string
    icon: ReactNode
    text: string
}

function MenuItem(props: MenuItemProps) {
    const location = useLocation()
    const isOnRoute = location.pathname.includes(props.to)

    return (
        <Link
            to={props.to}
            className={'menu-item' + (isOnRoute ? ' on' : '')}
        >
            {props.icon}
            {props.text}
        </Link>
    )
}

export default function Menu() {
    const { isAdmin } = useAdmin()

    return (
        <nav id='menu'>
            <p className="title">MENU</p>

            {!isAdmin ? (
                <>
                    <MenuItem text='Vendas' to='/vendas' icon={<FaCashRegister />} />
                    <MenuItem text='Produtos' to='/produtos' icon={<FaBoxOpen />} />
                    <MenuItem text='Fichas' to='/fichas' icon={<FaMoneyCheckDollar />} />
                    <MenuItem text='Logar como Admin' to='/admin-login' icon={<FaUserShield />} />
                </>
            ) : (
                <MenuItem text='Dashboard' to='/admin-dashboard' icon={<FaChartBar />} />
            )}
        </nav>
    )
}
