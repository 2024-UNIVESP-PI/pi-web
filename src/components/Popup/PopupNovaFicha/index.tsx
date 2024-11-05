import { Dispatch, SetStateAction, useState } from 'react'
import { FaMoneyCheckDollar } from 'react-icons/fa6'

import Popup from ".."
import Input from "../../Input"
import Button from "../../Button"

import cleanDecimal from '../../../functions/cleanDecimal'

// import './styles.scss'
export type PopupNovaFichaProps = {
    visible: boolean
    setVisible: Dispatch<SetStateAction<boolean>>
    // onCreate: (produto: Produto) => void
}

export default function PopupNovaFicha(props: PopupNovaFichaProps) {
    const [numero, setNumero] = useState(0)
    const [saldo, setSaldo] = useState(0)

    return (
        <Popup
            visible={props.visible}
            setVisible={props.setVisible}
            id='popup-nova-ficha'
            icon={<FaMoneyCheckDollar />}
            title='Nova ficha'
        >
            <div className="line">
                <Input
                    id='numero'
                    type='intenger'
                    inputMode='numeric'
                    label='Número'
                    value={numero}
                    onChange={(e) => setNumero(Number(e.target.value))}
                    required
                    min={0}
                    step={0.01}
                    // errors={formErrors?.preco}
                />
                <Input
                    id='saldo'
                    type='number'
                    inputMode='decimal'
                    label='Saldo'
                    value={saldo.toFixed(2)}
                    onChange={(e) => setSaldo(cleanDecimal(e.target.value))}
                    // errors={formErrors?.estoque}
                />
            </div>
                <Button
                    type='submit'
                    color='var(--color-green)'
                    // loading={fetchingCreate}
                >
                    <p>Criar</p>
                </Button>
        </Popup>
    )
}

