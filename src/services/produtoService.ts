import api from "."

// TYPE
export type Produto = {
    id: number
    nome: string
    unidade: string
    preco: string
    estoque: number
    data_criacao: string
    caixa: number
}

// CRUD

// CREATE


// READ
export const getProdutos = async () => await api.get('movimentacao/produtos/')

// UPDATE


// DELETE



const produtoService = {
    getProdutos,
}
export default produtoService