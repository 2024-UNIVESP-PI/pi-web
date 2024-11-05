import api from "."

// TYPE
export type NovaMovimentacaoEstoque = {
    quantidade: number
    tipo: 'E' | 'S'
    caixa: number
    produto: number
}
export type MovimentacaoEstoque = NovaMovimentacaoEstoque & {
    id: number
    data: string
}

// POST
export const postMovimentaçãoEstoque = async (mE: NovaMovimentacaoEstoque) => await api.post(
    `movimentacao/movimentacoes-estoque/`,
    mE
)

// GET


// PUT PATCH


// DELETE



const estoqueServices = {
    postMovimentaçãoEstoque,
}
export default estoqueServices