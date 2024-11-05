import { useState } from "react"

import { NovaFicha } from "../services/fichaService"
import fichaService from "../services/fichaService"
import { AxiosError } from "axios"

export default function useFicha() {
    const [fetchingCreate, setFetchingCreate] = useState<boolean>()
    const [errorCreate, setErrorCreate] = useState<AxiosError>()

    const [fetchingRecarga, setFetchingRecarga] = useState(false)

    const [fetchingDelete, setFetchingDelete] = useState(false)

    async function createFicha(nF: NovaFicha) {
        if (nF) {
            setFetchingCreate(true)
            setErrorCreate(undefined)
            return await fichaService.postFicha(nF)
                .then(response => response)
                .catch(error => {
                    setErrorCreate(error)
                    return error.response
                })
                .finally(() => setFetchingCreate(false))
        }
        return false
    }

    function recargaFicha(id: number, recarga: number) {
        if (id) {
            setFetchingRecarga(true)
            return fichaService.postRecarga(id, recarga)
                .then(response => response)
                .catch(error => error.response)
                .finally(() => setFetchingRecarga(false))
        }
    }

    function deleteFicha(id: number) {
        if (id) {
            setFetchingDelete(true)
            return fichaService.deleteFicha(id)
                .then(response => response)
                .catch(error => error.response)
                .finally(() => setFetchingDelete(false))
        }
    }

    return {
        createFicha,
        fetchingCreate,
        errorCreate,

        recargaFicha,
        fetchingRecarga,

        deleteFicha,
        fetchingDelete,
    }
}