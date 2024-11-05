import { MouseEventHandler } from "react"

import Card from '..'
import Estoque from "../../Estoque"

import { Produto } from "../../../services/produtoService"

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
                <Estoque number={props.produto.estoque}/>
                <p className="preco">R${Number(props.produto.preco).toFixed(2)}</p>
            </div>
        </Card>
    )
}
