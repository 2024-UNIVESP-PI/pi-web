import { useState } from "react"

import { AxiosError } from "axios"
import produtoService from "../services/produtoService"
import estoqueServices, { NovaMovimentacaoEstoque } from "../services/estoqueService"
import { NovoProduto } from "../services/produtoService"

export default function useProduto() {
    // const [error, setError] = useState<AxiosError>()
    const [fetchingCreate, setFetchingCreate] = useState<boolean>()
    const [errorCreate, setErrorCreate] = useState<AxiosError>()

    const [fetchingDelete, setFetchingDelete] = useState<boolean>()

    const [fetchingMovimentacaoEstoque, setFetchingMovimentacaoEstoque] = useState<boolean>()

    async function createProduto(nP: NovoProduto) {
        if (nP) {
            setFetchingCreate(true)
            setErrorCreate(undefined)
            return await produtoService.postProduto(nP)
                .then(response => response)
                .catch(error => {
                    setErrorCreate(error)
                    return error.response
                })
                .finally(() => setFetchingCreate(false))
        }
        return false
    }

    async function deleteProduto(id: number) {
        if (id) {
            setFetchingDelete(true)
            return await produtoService.deleteProduto(id)
                .then(response => response)
                .catch(error => error.response)
                .finally(() => setFetchingDelete(false))
        }
        return false
    }

    async function createMovimentacaoEstoque(mE: NovaMovimentacaoEstoque) {
        if (mE) {
            setFetchingMovimentacaoEstoque(true)
            return await estoqueServices.postMovimentaçãoEstoque(mE)
                .then(response => response)
                .catch(error => error.response)
                .finally(() => setFetchingMovimentacaoEstoque(false))
        }
        return false
    }

    return {
        createProduto,
        fetchingCreate,
        errorCreate,

        deleteProduto,
        fetchingDelete,

        createMovimentacaoEstoque,
        fetchingMovimentacaoEstoque,
    }
}