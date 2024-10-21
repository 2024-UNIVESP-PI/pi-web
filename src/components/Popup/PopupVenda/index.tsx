import { Dispatch, SetStateAction, ReactNode, useState } from 'react'
import { FaCashRegister, FaBoxOpen } from 'react-icons/fa6'

import Popup from '..'
import Notice from '../../Notice'
import Tag from '../../Tag'
import Input from '../../Input'
import Button from '../../Button'

import { Produto } from '../../../services/produtoService'

export type PopupVendaProps = {
    visible: boolean
    setVisible: Dispatch<SetStateAction<boolean>>
    produto?: Produto
    children: ReactNode | ReactNode[]
}

export default function PopupVenda(props: PopupVendaProps) {
    const [ficha, setFicha] = useState<number>()
    const [quantidade, setQuantidade] = useState<number>(0)

    return (
        <Popup
            visible={props.visible}
            setVisible={props.setVisible}
            id='popup-nova-venda'
            icon={<FaCashRegister />}
            title='Nova venda'
        >
            {
                !props.produto ?
                    <p>teste</p>
                    :
                    props.produto.estoque > 0 ?
                        <>
                            <Tag className='medium'>
                                <p className='title flex-1'>{props.produto.nome}</p>
                                <span>
                                    <FaBoxOpen />
                                    <p>{props.produto.estoque}</p>
                                </span>
                                <p>R${Number(props.produto.preco).toFixed(2)}</p>
                            </Tag>

                            <form>
                                <div className="line">
                                    <Input
                                        id='ficha'
                                        type='number'
                                        label='Ficha'
                                        placeholder='Insira a ficha'
                                        value={ficha}
                                        onChange={(e) => setFicha(Number(e.target.value))}
                                        required
                                    />
                                    <Input
                                        id='quantidade'
                                        type='number'
                                        label='Quantidade'
                                        placeholder='Insira a quantidade'
                                        value={String(quantidade)}
                                        onChange={(e) => setQuantidade(Number(e.target.value))}
                                        required
                                        min={1}
                                        max={props.produto.estoque}
                                    />
                                </div>
                                <div className="line fixed">
                                    <Tag className='medium flex-1 center' color='var(--color-green)'>
                                        <p>R${(Number(props.produto.preco) * quantidade).toFixed(2)}</p>
                                    </Tag>

                                    <Button
                                        type='submit'
                                        className='flex-2'
                                        color='var(--color-green)'
                                    >
                                        Registrar
                                    </Button>
                                </div>
                            </form>
                        </>
                        : <Notice><p>Produto sem estoque</p></Notice>
            }
        </Popup>
    )
}
