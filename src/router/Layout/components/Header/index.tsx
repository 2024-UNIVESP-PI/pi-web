import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"

import { Link } from "react-router-dom"
import { FaBars } from "react-icons/fa6"

import Menu from "../Menu"
import CaixaSelector from "../CaixaSelector"
import Button from "../../../../components/Button"

import './styles.scss'

export default function Header() {
    const [optionsVisible, setOptionsVisible] = useState(false)

    const location = useLocation()

    useEffect(() => {
        if (optionsVisible) setOptionsVisible(false)
    }, [location.pathname])

    return (
        <header>
            <Link to='/'>
                <h1 className='arraia-tech'><strong>Arraiá</strong>Tech</h1>
            </Link>

            <button
                className="open-options"
                onClick={() => setOptionsVisible(true)}
            >
                <FaBars />
            </button>
            <div className={"options" + (optionsVisible ? ' visible' : '')}>
                <Menu />

                <CaixaSelector />

                <Button
                    className="close-options"
                    color="var(--color-red)"
                    onClick={() => setOptionsVisible(false)}
                >
                    Fechar
                </Button>
            </div>
        </header>
    )
}
