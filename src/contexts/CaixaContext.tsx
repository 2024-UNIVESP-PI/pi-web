import { Dispatch, SetStateAction, ReactNode, createContext, useState } from "react"

import { Caixa } from "../services/caixaService"
type CaixaContextType = {
    caixa: number | undefined
    setCaixa: Dispatch<SetStateAction<number | undefined>>
    caixaData: Caixa | undefined
    setCaixaData: Dispatch<SetStateAction<Caixa | undefined>>
    hasChecked: boolean
    setHasChecked: Dispatch<SetStateAction<boolean>>
}
type CaixaProviderType = {
    children: ReactNode | ReactNode[],
}

export const CaixaContext = createContext<CaixaContextType | undefined>(undefined)

export const CaixaProvider = (props: CaixaProviderType) => {
    const [caixa, setCaixa] = useState<number>()
    const [caixaData, setCaixaData] = useState<Caixa>()
    const [hasChecked, setHasChecked] = useState(false)

    return (
        <CaixaContext.Provider
            value={{
                caixa,
                setCaixa,
                caixaData,
                setCaixaData,
                hasChecked,
                setHasChecked,
            }}
        >
            {props.children}
        </CaixaContext.Provider>
    )
}

export default {
    Context: CaixaContext,
    Provider: CaixaProvider,
}