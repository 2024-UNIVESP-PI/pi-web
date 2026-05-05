import { MouseEventHandler } from "react"

import Card from '..'

import { Ficha } from "../../../services/fichaService"

import './styles.scss'
export type FichaCardProps = {
    onClick?: MouseEventHandler<HTMLDivElement>
    ficha: Ficha
}

export default function FichaCard(props: FichaCardProps) {
    const saldoBaixo = props.ficha.saldo <= 0

    return (
        <Card
            className={'ficha-card' + (saldoBaixo ? ' saldo-baixo' : '')}
            lowOpacity={saldoBaixo}
            color={saldoBaixo ? 'var(--color-red)' : undefined}
            onClick={props.onClick}
        >
            <span className="card-kicker">Ficha</span>
            <p className="numero">{props.ficha.numero}</p>
            <p className="saldo-label">Saldo atual</p>
            <p className="saldo">R${props.ficha.saldo.toFixed(2)}</p>
            <span className="action-hint">Recarregar</span>
        </Card>
    )
}
