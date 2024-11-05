import { Dispatch, FormEvent, SetStateAction, useState, useEffect } from 'react'
import { FaMoneyCheckDollar, FaTrash } from 'react-icons/fa6'

import Popup from '..'
import Notice from '../../Notice'
import Tag from '../../Tag'
import Input from '../../Input'
import Button from '../../Button'

import { Ficha } from '../../../services/fichaService'
import useFicha from '../../../hooks/useFicha'

import './styles.scss'
export type PopupFichaProps = {
    visible: boolean
    setVisible: Dispatch<SetStateAction<boolean>>
    ficha?: Ficha
    onRecarga: (ficha: Ficha) => void
    // onDelete: (id: number) => void
}

export default function PopupFicha(props: PopupFichaProps) {
    const [recarga, setRecarga] = useState(0)

    // const estoqueColor = (estoque: number) => {
    //     if (estoque >= 10) return 'var(--color-green)'
    //     if (estoque > 0) return 'var(--color-yellow)'
    //     return 'var(--color-red)'
    // }

    const {
        recargaFicha,
        fetchingRecarga,
        // deleteFicha,
        // fetchingDelete,
    } = useFicha()

    async function handleRecargaFicha(e: FormEvent) {
        e.preventDefault()
        if (props.ficha?.id && recarga) {
            const response = await recargaFicha(props.ficha?.id, recarga)
            if (response.status == 200) {
                props.onRecarga(response.data)
                setRecarga(0)
            }
        }
    }

    // async function handleDeleteFicha() {
    //     if (props.ficha) {
    //         const response = await deleteFicha()
    //         if (response.status == 204) props.onDelete(props.ficha.id)
    //     }
    // }

    useEffect(() => {
        if (props.ficha) setRecarga(0)
    }, [props.ficha])

    return (
        <Popup
            visible={props.visible}
            setVisible={props.setVisible}
            id='popup-ficha'
            icon={<FaMoneyCheckDollar />}
            title='Ficha'
        >
            {
                !props.ficha ?
                    <Notice><p>Selecione uma ficha para visualizar</p></Notice>
                    :
                    <>
                        <div className="ficha-infos line">
                            <p className='numero'>{props.ficha.numero}</p>
                            <Tag
                                className='saldo'
                                color={props.ficha.saldo <= 0 ? 'var(--color-red)' : undefined}
                            >
                                <p>R${props.ficha.saldo.toFixed(2)}</p>
                            </Tag>
                        </div>

                        <div className="line">
                            <form
                                className="line close"
                                onSubmit={handleRecargaFicha}
                            >
                                <Input
                                    type='number'
                                    id={'credito-adicional'}
                                    value={recarga}
                                    onChange={(e) => setRecarga(Number(e.target.value))}
                                    min={1}
                                />
                                <Button
                                    className='flex-2'
                                    color='var(--color-green)'
                                    type='submit'
                                    loading={fetchingRecarga}
                                >
                                    <p>Recarregar</p>
                                </Button>
                            </form>
                            {/* <Button
                                color='var(--color-red)'
                                loading={fetchingDelete}
                                onClick={() => {
                                    if (props.ficha?.id && confirm("Deletar ficha?")) handleDeleteFicha()
                                }}
                            >
                                <FaTrash />
                            </Button> */}
                        </div>
                    </>
            }
        </Popup>
    )
}
