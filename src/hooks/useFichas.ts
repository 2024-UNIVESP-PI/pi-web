import { useState, useEffect } from "react"

import fichaService, { Ficha } from "../services/fichaService"
import { AxiosError } from "axios"

export default function useFichas() {
    const [fichas, setFichas] = useState<Ficha[]>()
    const [fetching, setFetching] = useState(false)
    const [error, setError] = useState<AxiosError>()

    async function readFichas() {
        setFetching(true)
        return await fichaService.getFichas()
            .then(response => {
                setFichas(response.data)
                setError(undefined)
                return response
            })
            .catch(error => {
                setFichas(undefined)
                setError(error)
                return error.response
            })
            .finally(() => setFetching(false))
    }

    // function removeStateProduto(id: number) {
    //     if (produtos) setProdutos(produtos.filter(produto => produto.id !== id))
    // }

    function updateStateFicha(updatedFicha: Ficha) {
        if (fichas) {
            const fichasAux = [...fichas]
            const index = fichasAux.findIndex(ficha => ficha.id === updatedFicha.id)
            fichasAux[index] = updatedFicha
            setFichas(fichasAux)
        }
    }

    useEffect(() => {
        readFichas()
    }, [])

    return {
        fichas,
        fetching,
        error,
        readFichas,
        
        updateStateFicha,
    }
}