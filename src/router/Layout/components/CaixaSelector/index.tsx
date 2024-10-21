import { useState } from "react"

import Select from '../../../../components/Select'

import './styles.scss'

export default function CaixaSelector() {
    const [selectedCaixa, setSelectedCaixa] = useState('')

    const Options = [
        {
            value: 1,
            content: "Juliana"
        },
        {
            value: 2,
            content: "Jorge"
        }
    ]

    return (
        <div id='caixa-selector'>
            <p className="title">CAIXA</p>

            <Select
                className={
                    "caixa-select"
                    + (!selectedCaixa ? ' off' : '')
                }
                disabled="Escolha um caixa"
                options={Options}
                setValue={setSelectedCaixa}
            />
        </div>
    )
}
