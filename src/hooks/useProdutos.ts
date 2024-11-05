import { useState, useEffect } from "react"

import { AxiosError } from "axios"
import produtoService, { Produto } from "../services/produtoService"

export default function useProdutos() {
    const [produtos, setProdutos] = useState<Produto[]>()
    const [fetching, setFetching] = useState<boolean>()
    const [error, setError] = useState<AxiosError>()

    async function readProdutos(search?: string) {
        setFetching(true)
        await produtoService.getProdutos(search)
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

    function removeStateProduto(id: number) {
        if (produtos) setProdutos(produtos.filter(produto => produto.id !== id))
    }

    function updateStateProduto(updatedProduto: Produto) {
        if (produtos) {
            const produtosAux = [...produtos]
            const index = produtosAux.findIndex(produto => produto.id === updatedProduto.id)
            produtosAux[index] = updatedProduto
            setProdutos(produtosAux)
        }
    }

    function insertStateProduto(produto: Produto) {
        if (produtos) {
            const produtosAux = [...produtos]
            const pos = produtosAux.findIndex(p => p.nome.toLowerCase() > produto.nome.toLowerCase())
            if (pos == -1) produtosAux.push(produto)
            else produtosAux.splice(pos, 0, produto)
            setProdutos(produtosAux)
        }
    }

    useEffect(() => {
        readProdutos()
    }, [])

    return {
        produtos,
        fetching,
        error,
        readProdutos,
        removeStateProduto,
        updateStateProduto,
        insertStateProduto,
    }
}