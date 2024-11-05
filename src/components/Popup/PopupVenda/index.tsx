import { Dispatch, SetStateAction, useContext, useState, useEffect, FormEvent } from 'react'
import { FaCashRegister } from 'react-icons/fa6'

import CaixaContext from '../../../contexts/CaixaContext'

import Popup from '..'
import Notice from '../../Notice'
import Tag from '../../Tag'
import Estoque from '../../Estoque'
import Input from '../../Input'
import Button from '../../Button'

import { Produto } from '../../../services/produtoService'
import { Ficha } from '../../../services/fichaService'
import { NovaVenda, Venda } from '../../../services/vendaServices'
import useFichas from '../../../hooks/useFichas'
import useVenda from '../../../hooks/useVenda'

export type PopupVendaProps = {
    visible: boolean
    setVisible: Dispatch<SetStateAction<boolean>>
    produto?: Produto
    onVenda: (produto: Produto, quantidade: number) => void
}

export default function PopupVenda(props: PopupVendaProps) {
    const caixaContext = useContext(CaixaContext.Context)

    const [ficha, setFicha] = useState<number>(0)
    const [selectedFichaData, setSelectedFichaData] = useState<Ficha>()
    const [quantidade, setQuantidade] = useState<number>(0)
    const [precoFinal, setPrecoFinal] = useState<number>()
    const [quantidadeMax, setQuantidadeMax] = useState<number>(0)

    const [ultimaVenda, setUltimaVenda] = useState<Venda>()
    const [hasError, setHasError] = useState(false)

    const { fichas, readFichas } = useFichas()

    const {
        createVenda,
        fetchingCreate,
    } = useVenda()

    async function handleCreateVenda(e: FormEvent) {
        e.preventDefault()
        if (caixaContext?.caixa && props.produto && ficha) {
            setUltimaVenda(undefined)
            setHasError(false)
            const venda: NovaVenda = {
                movimentacao: {
                    caixa: caixaContext.caixa,
                    produto: props.produto.id,
                    quantidade: quantidade
                },
                ficha: ficha
            }
            const response = await createVenda(venda)
            if (response.status == 201) {
                setUltimaVenda(response.data)
                props.onVenda(props.produto, quantidade)
                setQuantidade(0)
                await readFichas()
            } else {
                setHasError(true)
            }
        }
    }

    useEffect(() => {
        if (props.produto) {
            setQuantidade(0)
            if (selectedFichaData && selectedFichaData?.saldo < props.produto.preco) setFicha(0)
        }
    }, [props.produto])

    useEffect(() => {
        if (fichas) setSelectedFichaData(fichas.find(fichaAux => fichaAux.id == ficha))
    }, [ficha, fichas])

    useEffect(() => {
        if (props.produto) setPrecoFinal(props.produto.preco * quantidade)
        else setPrecoFinal(undefined)
    }, [props.produto, quantidade])

    useEffect(() => {
        if (props.produto && selectedFichaData) {
            const maxCompraFicha = Math.trunc(selectedFichaData.saldo / props.produto.preco)
            if (maxCompraFicha == 0) {
                setFicha(0)
                setQuantidade(0)
            } else {
                setQuantidadeMax(Math.min(
                    maxCompraFicha,
                    props.produto.estoque
                ))
            }
        }
    }, [props.produto, selectedFichaData])

    useEffect(() => {
        if (ultimaVenda) setUltimaVenda(undefined)
        if (hasError) setHasError(false)
    }, [props.visible])

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
                    <Notice><p>Selecione um produto para realizar uma venda</p></Notice>
                    :
                    <>
                        <Tag
                            className='medium'
                            color={props.produto.estoque > 0 ? 'var(--color-blue)' : 'var(--color-red)'}
                        >
                            <p className='title flex-1'>{props.produto.nome}</p>
                            <Estoque number={props.produto.estoque} />
                            <p>R${Number(props.produto.preco).toFixed(2)}</p>
                        </Tag>

                        {
                            props.produto.estoque > 0 ?
                                <form onSubmit={!fetchingCreate ? handleCreateVenda : undefined}>
                                    <div className="line responsive">
                                        <Input
                                            id='ficha'
                                            type='select'
                                            label='Ficha'
                                            placeholder='Selecione a ficha'
                                            options={fichas?.map(
                                                ficha => ({
                                                    value: ficha.id,
                                                    content: `${ficha.numero} - R$${ficha.saldo.toFixed(2)}`,
                                                    disabled: props.produto && ficha.saldo < props.produto.preco
                                                })
                                            )}
                                            disabledValue={0}
                                            value={ficha}
                                            onChange={(e) => setFicha(Number(e.target.value))}
                                            required
                                        />
                                        <Input
                                            id='quantidade'
                                            type='intenger'
                                            inputMode='numeric'
                                            label='Quantidade'
                                            placeholder='Insira a quantidade'
                                            value={String(quantidade)}
                                            onChange={(e) => setQuantidade(Number(e.target.value))}
                                            required
                                            min={1}
                                            max={quantidadeMax}
                                        />
                                    </div>
                                    <div className="line">
                                        <Tag className='medium flex-1 center' color='var(--color-green)'>
                                            <p>{precoFinal ? <>R${precoFinal.toFixed(2)}</> : <>-</>}</p>
                                        </Tag>

                                        <Button
                                            type='submit'
                                            className='flex-2'
                                            color='var(--color-green)'
                                            loading={fetchingCreate}
                                        >
                                            <p>Registrar</p>
                                        </Button>
                                    </div>
                                </form>
                                : <Notice><p>Produto sem estoque</p></Notice>
                        }

                        {
                            hasError &&
                            < Tag color='var(--color-red)' className='column'>
                                <p className='title center'>Erro ao realizar venda</p>
                            </Tag>
                        }
                        {
                            ultimaVenda &&
                            < Tag color='var(--color-green)' className='column'>
                                <p className='title center'>Venda realizada com sucesso</p>
                                <p className='center'>
                                    <b>R${ultimaVenda.preco_total.toFixed(2)}</b> cobrado na ficha <b>{ultimaVenda.ficha.numero}</b>
                                </p>
                            </Tag>
                        }
                    </>
            }
        </Popup >
    )
}
