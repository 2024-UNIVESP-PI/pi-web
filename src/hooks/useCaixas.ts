import { useState, useEffect } from "react"

import caixaService, { Caixa } from "../services/caixaService"
import { AxiosError } from "axios"

export default function useCaixas() {
    const [caixas, setCaixas] = useState<Caixa[]>()
    const [fetching, setFetching] = useState(true)
    const [error, setError] = useState<AxiosError>()

    async function readCaixas() {
        setFetching(true)
        return caixaService.getCaixas()
            .then(response => {
                setCaixas(response.data)
                setError(undefined)
                return response
            })
            .catch(error => {
                setCaixas(undefined)
                setError(error)
                return error.response
            })
            .finally(() => setFetching(false))
    }

    useEffect(() => {
        readCaixas()
    }, [])

    return {
        caixas,
        fetching,
        error,
    }
}