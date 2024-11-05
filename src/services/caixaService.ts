import api from "."

// TYPE
export type Caixa = {
    id: number
    nome: string
}

// POST


// GET
export const getCaixas = async () => await api.get('movimentacao/caixas/')

// PUT PATCH


// DELETE



const caixaService = {
    getCaixas,
}
export default caixaService