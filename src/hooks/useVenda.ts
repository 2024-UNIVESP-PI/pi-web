import { useState } from "react"

import vendaServices, { NovaVenda } from "../services/vendaServices"

export default function useVenda() {
    const [fetchingCreate, setFetchingCreate] = useState(false)

    async function createVenda(venda: NovaVenda) {
        if (venda) {
            setFetchingCreate(true)
            return vendaServices.postVenda(venda)
                .then(response => response)
                .catch(error => error.response)
                .finally(() => setFetchingCreate(false))
        }
        return false
    }

    return {
        createVenda,
        fetchingCreate,
    }
}