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
    const semEstoque = props.produto.estoque <= 0

    return (
        <Card
            className={'venda-card' + (semEstoque ? ' sem-estoque' : '')}
            lowOpacity={semEstoque}
            color={semEstoque ? "var(--color-red)" : undefined}
            onClick={props.onClick}
        >
            <span className="card-kicker">{semEstoque ? 'Indisponível' : 'Vender'}</span>
            <p className="produto">{props.produto.nome}</p>

            <div className="produto-data">
                <Estoque number={props.produto.estoque}/>
                <p className="preco">R${Number(props.produto.preco).toFixed(2)}</p>
            </div>
            <span className="action-hint">
                {semEstoque ? 'Sem estoque' : 'Abrir venda'}
            </span>
        </Card>
    )
}
