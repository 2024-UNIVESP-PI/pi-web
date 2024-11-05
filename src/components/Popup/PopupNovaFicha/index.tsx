import { Dispatch, SetStateAction, useState, FormEvent } from 'react'
import { FaMoneyCheckDollar } from 'react-icons/fa6'

import Popup from ".."
import Input from "../../Input"
import Button from "../../Button"

import { Errors } from '../../../services'
import cleanDecimal from '../../../functions/cleanDecimal'
import useFicha from '../../../hooks/useFicha'
import { Ficha, NovaFicha } from '../../../services/fichaService'

// import './styles.scss'
export type PopupNovaFichaProps = {
    visible: boolean
    setVisible: Dispatch<SetStateAction<boolean>>
    onCreate: (ficha: Ficha) => void
}

export default function PopupNovaFicha(props: PopupNovaFichaProps) {
    const {
        createFicha,
        fetchingCreate,
    } = useFicha()

    const [numero, setNumero] = useState(0)
    const [saldo, setSaldo] = useState(0)

    const [formErrors, setFormErrors] = useState<Errors>()

    function setupForm() {
        setNumero(0)
        setSaldo(0)
    }

    async function handleCreateFicha(e: FormEvent) {
        e.preventDefault()
        setFormErrors(undefined)
        const nF: NovaFicha = {
            numero: numero,
            saldo: saldo

        }
        console.log(nF)
        const response = await createFicha(nF)
        if (response.status == 201) {
            setupForm()
            props.onCreate(response.data)
        } else {
            setFormErrors(response.data)
        }
    }

    return (
        <Popup
            visible={props.visible}
            setVisible={props.setVisible}
            id='popup-nova-ficha'
            icon={<FaMoneyCheckDollar />}
            title='Nova ficha'
        >
            <form onSubmit={handleCreateFicha}>
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
                        errors={formErrors?.numero}
                    />
                    <Input
                        id='saldo'
                        type='number'
                        inputMode='decimal'
                        label='Saldo'
                        value={saldo.toFixed(2)}
                        onChange={(e) => setSaldo(cleanDecimal(e.target.value))}
                        errors={formErrors?.saldo}
                    />
                </div>
                <Button
                    type='submit'
                    color='var(--color-green)'
                    loading={fetchingCreate}
                >
                    <p>Criar</p>
                </Button>
            </form>
        </Popup>
    )
}

