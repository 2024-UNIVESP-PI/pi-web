import { useState } from "react"

// import { Ficha } from "../services/fichaService"
import fichaService from "../services/fichaService"
// import { AxiosError } from "axios"

export default function useFicha() {
    // const [ficha, setFicha] = useState<Ficha>()
    // const [fetching, setFetching] = useState(false)
    // const [error, setError] = useState<AxiosError>()

    const [fetchingRecarga, setFetchingRecarga] = useState(false)
    const [fetchingDelete, setFetchingDelete] = useState(false)

    // function readFicha(id: number) {
    //     if (id) {
    //         setFetching(true)
    //         return fichaService.getFicha(id)
    //             .then(response => {
    //                 setFicha(response.data)
    //                 setError(undefined)
    //                 return response
    //             })
    //             .catch(error => {
    //                 setFicha(undefined)
    //                 setError(error)
    //                 return error.response
    //             })
    //             .finally(() => setFetching(false))
    //     }
    // }

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
        // readFicha,
        // ficha,
        // fetching,
        // error,

        recargaFicha,
        fetchingRecarga,

        deleteFicha,
        fetchingDelete,
    }
}