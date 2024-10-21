import { MouseEventHandler } from "react"
import {
    FaBoxOpen
} from "react-icons/fa6"

import { Produto } from "../../../services/produtoService"

import Card from '..'

import './styles.scss'
export type ProdutoCardProps = {
    onClick?: MouseEventHandler<HTMLDivElement>
    produto: Produto
}

export default function ProdutoCard(props: ProdutoCardProps) {
    return (
        <Card
            as={'tr'}
            className={'produto-card'}
            // lowOpacity={props.produto.estoque <= 0}
            // color={props.produto.estoque <= 0 ? "var(--color-red)" : undefined}
            onClick={props.onClick}
        >
            <td className="nome">{props.produto.nome}</td>
            <td className="medida">{props.produto.unidade}</td>
            <td className="estoque">
                <span>
                    <FaBoxOpen />
                    <p>{props.produto.estoque}</p>
                </span>
            </td>
            <td className="preco">R${Number(props.produto.preco).toFixed(2)}</td>
        </Card>
    )
}
