import api from "."

// TYPE
export type NovaFicha = {
    numero: number
    saldo: number
}
export type Ficha = NovaFicha & {
    id: number
}

// POST
export const postFicha = async (nF: NovaFicha) => await api.post('movimentacao/fichas/', nF)
export const postRecarga = async (id: number, recarga: number) => await api.post(
    `movimentacao/fichas/${id}/recarga/`,
    { valor: recarga }
)

// GET
export const getFichas = async () => await api.get('movimentacao/fichas/')
export const getFicha = async (id: number) => await api.get(`movimentacao/fichas/${id}/`)

// PUT PATCH


// DELETE
export const deleteFicha = async (id: number) => await api.delete(`movimentacao/fichas/${id}/`)


const fichaService = {
    postFicha,
    postRecarga,
    getFichas,
    getFicha,
    deleteFicha,
}
export default fichaService