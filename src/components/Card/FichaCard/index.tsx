import { MouseEventHandler } from "react"

import Card from '..'

import { Ficha } from "../../../services/fichaService"

import './styles.scss'
export type FichaCardProps = {
    onClick?: MouseEventHandler<HTMLDivElement>
    ficha: Ficha
}

export default function FichaCard(props: FichaCardProps) {
    return (
        <Card
            className={'ficha-card'}
            lowOpacity={props.ficha.saldo <= 0}
            color={props.ficha.saldo <= 0 ? 'var(--color-red)' : undefined}
            onClick={props.onClick}
        >
            <p className="numero">{props.ficha.numero}</p>
            <p className="saldo">R${props.ficha.saldo.toFixed(2)}</p>
        </Card>
    )
}
