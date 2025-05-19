import { ReactNode } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
    FaCashRegister,
    FaBoxOpen,
    FaMoneyCheckDollar,
    FaChartBar,
    FaUserShield,
    FaRightFromBracket,
} from "react-icons/fa6"

import { useAdmin } from "../../../../contexts/AdminContext"

import './styles.scss'

export type MenuItemProps = {
    to?: string
    icon: ReactNode
    text: string
    onClick?: () => void
    className?: string
}

function MenuItem(props: MenuItemProps) {
    const location = useLocation()
    const isOnRoute = props.to && location.pathname.includes(props.to)

    const baseClass = 'menu-item' + (isOnRoute ? ' on' : '') + (props.className ? ` ${props.className}` : '')

    return props.to ? (
        <Link to={props.to} className={baseClass}>
            {props.icon}
            {props.text}
        </Link>
    ) : (
        <div className={baseClass} onClick={props.onClick}>
            {props.icon}
            {props.text}
        </div>
    )
}

export default function Menu() {
    const { isAdmin, logout } = useAdmin()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate("/")
    }

    return (
        <nav id='menu'>
            <p className="title">MENU</p>

            {!isAdmin ? (
                <>
                    <MenuItem
                        text='Logar como Admin'
                        to='/admin-login'
                        icon={<FaUserShield />}
                    />
                    <div style={{ marginBottom: '16px' }} />
                    <MenuItem text='Vendas' to='/vendas' icon={<FaCashRegister />} />
                    <MenuItem text='Produtos' to='/produtos' icon={<FaBoxOpen />} />
                    <MenuItem text='Fichas' to='/fichas' icon={<FaMoneyCheckDollar />} />
                </>
            ) : (
                <>
                    <MenuItem text='Dashboard' to='/admin-dashboard' icon={<FaChartBar />} />
                    <MenuItem
                        text='Sair do Dashboard'
                        icon={<FaRightFromBracket />}
                        onClick={handleLogout}
                        className='logout'
                    />
                </>
            )}
        </nav>
    )
}