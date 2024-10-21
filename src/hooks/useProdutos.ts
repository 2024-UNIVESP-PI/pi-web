import { useState, useEffect } from "react"

import produtoService, { Produto } from "../services/produtoService"
import { AxiosError } from "axios"

export default function useProdutos() {
    const [produtos, setProdutos] = useState<Produto[]>()
    const [fetching, setFetching] = useState<boolean>()
    const [error, setError] = useState<AxiosError>()

    async function readProdutos() {
        setFetching(true)
        await produtoService.getProdutos()
            .then(response => {
                setProdutos(response.data)
                setError(undefined)
            })
            .catch(error => {
                setProdutos(undefined)
                setError(error.response.data)
            })
            .finally(() => {
                setFetching(false)
            })
    }

    useEffect(() => {
        readProdutos()
    }, [])

    return {
        produtos,
        fetching,
        error,
        readProdutos,
    }
}