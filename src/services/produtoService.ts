import api from "."

import { Map } from "."

// TYPE
export type NovoProduto = {
    nome: string
    medida: string
    preco: number
    estoque: number
    caixa: number
    categoria: string
}
export type Produto = NovoProduto & {
    id: number
    data_criacao: string
}

export const createMap = (produtos: Produto[]) => produtos.reduce(
    (pM: Map, produto, index) => ({...pM, [produto.id]: index}),
    {}
)

// POST
export const postProduto = async (nP: NovoProduto) => await api.post('movimentacao/produtos/', nP)

// GET
export const getProdutos = async (search?: string) => await api.get(
    `movimentacao/produtos/${search ? `?search=${search}` : ''}`
)

// PUT PATCH


// DELETE
export const deleteProduto = async (id: number) => await api.delete(`movimentacao/produtos/${id}/`)


const produtoService = {
    createMap,
    postProduto,
    getProdutos,
    deleteProduto,
}
export default produtoService