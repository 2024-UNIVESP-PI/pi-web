import { useState } from "react"
import { AxiosError } from "axios"
import produtoService from "../services/produtoService"
import estoqueServices, { NovaMovimentacaoEstoque } from "../services/estoqueService"
import { NovoProduto, Produto } from "../services/produtoService"

function isAxiosError(error: unknown): error is AxiosError {
  return typeof error === 'object' && error !== null && 'isAxiosError' in error && (error as any).isAxiosError === true
}

export default function useProduto() {
    const [fetchingCreate, setFetchingCreate] = useState<boolean>(false)
    const [errorCreate, setErrorCreate] = useState<AxiosError | undefined>(undefined)

    const [fetchingDelete, setFetchingDelete] = useState<boolean>(false)
    const [fetchingPatchProduto, setFetchingPatchProduto] = useState<boolean>(false)
    const [fetchingMovimentacaoEstoque, setFetchingMovimentacaoEstoque] = useState<boolean>(false)

    async function createProduto(nP: NovoProduto) {
        if (!nP) return false

        setFetchingCreate(true)
        setErrorCreate(undefined)

        try {
            const response = await produtoService.postProduto(nP)
            return response
        } catch (error: unknown) {
            if (isAxiosError(error)) {
                setErrorCreate(error)
                return error.response
            }
            console.error('Erro inesperado:', error)
            return undefined
        } finally {
            setFetchingCreate(false)
        }
    }

    async function deleteProduto(id: number) {
        if (!id) return false

        setFetchingDelete(true)
        try {
            const response = await produtoService.deleteProduto(id)
            return response
        } catch (error: unknown) {
            if (isAxiosError(error)) {
                return error.response
            }
            console.error('Erro inesperado:', error)
            return undefined
        } finally {
            setFetchingDelete(false)
        }
    }

    async function patchProduto(id: number, dadosParciais: Partial<Produto>) {
        if (!id) return false

        setFetchingPatchProduto(true)
        try {
            const response = await produtoService.patchProduto(id, dadosParciais)
            return response
        } catch (error: unknown) {
            if (isAxiosError(error)) {
                console.error('Erro ao editar produto:', error)
                return error.response
            }
            console.error('Erro inesperado:', error)
            return undefined
        } finally {
            setFetchingPatchProduto(false)
        }
    }

    async function createMovimentacaoEstoque(mE: NovaMovimentacaoEstoque) {
        if (!mE) return false

        setFetchingMovimentacaoEstoque(true)
        try {
            const response = await estoqueServices.postMovimentaçãoEstoque(mE)
            return response
        } catch (error: unknown) {
            if (isAxiosError(error)) {
                return error.response
            }
            console.error('Erro inesperado:', error)
            return undefined
        } finally {
            setFetchingMovimentacaoEstoque(false)
        }
    }

    return {
        createProduto,
        fetchingCreate,
        errorCreate,

        patchProduto,
        fetchingPatchProduto,

        deleteProduto,
        fetchingDelete,

        createMovimentacaoEstoque,
        fetchingMovimentacaoEstoque,
    }
}