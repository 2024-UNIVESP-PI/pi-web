import { ReactNode } from "react"

import { Link, useLocation } from "react-router-dom"
import {
    FaCashRegister,
    FaBoxOpen,
    FaMoneyCheckDollar,
} from "react-icons/fa6"

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
            className={
                'menu-item'
                + (isOnRoute ? ' on' : '')
            }
        >
            {props.icon}
            {props.text}
        </Link>
    )
}

export default function Menu() {

    return (
        <nav id='menu'>
            <p className="title">MENU</p>
            <MenuItem text='Vendas' to='/vendas' icon={<FaCashRegister />} />
            <MenuItem text='Produtos' to='/produtos' icon={<FaBoxOpen />} />
            <MenuItem text='Fichas' to='/fichas' icon={<FaMoneyCheckDollar />} />
        </nav>
    )
}
