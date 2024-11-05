import api from "."

import { Ficha } from "./fichaService"

// TYPE
export type NovaMovimentacaoVenda = {
    caixa: number
    produto: number
    quantidade: number
}
export type MovimentacaoVenda = NovaMovimentacaoVenda & {
    data: string
}
export type NovaVenda = {
    movimentacao: NovaMovimentacaoVenda
    ficha: number
}
export type Venda = NovaVenda & {
    id: number
    movimentacao: MovimentacaoVenda
    preco_total: number
    ficha: Ficha
}

// POST
export const postVenda = async (venda: NovaVenda) => await api.post('movimentacao/vendas/', venda)

// GET


// PUT PATCH


// DELETE



const vendaServices = {
    postVenda,
}
export default vendaServices