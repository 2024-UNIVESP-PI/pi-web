import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import CaixaContext from '../../contexts/CaixaContext'
import {
    FaCashRegister,
    FaBoxOpen,
    FaMoneyCheckDollar,
} from "react-icons/fa6"

import PageTitle from '../../components/PageTitle'
import HomeCard from '../../components/Card/HomeCard'

import './styles.scss'

export default function HomePage() {
    const caixaContext = useContext(CaixaContext.Context)

    const navigate = useNavigate()

    return (
        <div id='home-page'>
            <PageTitle
                title={caixaContext?.caixaData?.nome ? `Olá, ${caixaContext.caixaData.nome}!` : undefined}
                subtitle="Bem-vindo de volta 👋"
            />

            <section className="cards">
                <HomeCard
                    icon={<FaCashRegister />}
                    title='Vendas'
                    onClick={() => navigate('vendas')}
                    />
                <HomeCard
                    icon={<FaBoxOpen />}
                    title='Produtos'
                    onClick={() => navigate('produtos')}
                    />
                <HomeCard
                    icon={<FaMoneyCheckDollar />}
                    title='Fichas'
                    onClick={() => navigate('fichas')}
                />
            </section>
        </div>
    )
}
