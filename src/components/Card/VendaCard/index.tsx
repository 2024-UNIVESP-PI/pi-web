import { MouseEventHandler } from "react"
import {
    FaBoxOpen
} from "react-icons/fa6"

import { Produto } from "../../../services/produtoService"

import Card from '..'

import './styles.scss'
export type VendaCardProps = {
    onClick?: MouseEventHandler<HTMLDivElement>
    produto: Produto
}

export default function VendaCard(props: VendaCardProps) {
    return (
        <Card
            className={'venda-card'}
            lowOpacity={props.produto.estoque <= 0}
            color={props.produto.estoque <= 0 ? "var(--color-red)" : undefined}
            onClick={props.onClick}
        >
            <p className="produto">{props.produto.nome}</p>

            <div className="produto-data">
                <span className="estoque">
                    <FaBoxOpen />
                    <p>{props.produto.estoque}</p>
                </span>

                <p className="preco">R${Number(props.produto.preco).toFixed(2)}</p>
            </div>
        </Card>
    )
}
