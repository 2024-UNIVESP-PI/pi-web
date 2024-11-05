import { MouseEventHandler } from "react"

import Card from '..'
import Estoque from "../../Estoque"

import { Produto } from "../../../services/produtoService"

import './styles.scss'
export type ProdutoCardProps = {
    onClick?: MouseEventHandler<HTMLDivElement>
    produto: Produto
}

export default function ProdutoCard(props: ProdutoCardProps) {
    const options = <>
        <p>Teste</p>
    </>

    return (
        <Card
            as={'li'}
            className={'produto-card'}
            onClick={props.onClick}
            options={options}
        >
            <span className="nome">{props.produto.nome}</span>
            <span className="medida mobile-hide">{props.produto.medida}</span>
            <Estoque number={props.produto.estoque}/>
            <span className="preco">R${Number(props.produto.preco).toFixed(2)}</span>
        </Card>
    )
}
