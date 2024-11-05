import { Dispatch, FormEvent, SetStateAction, useContext, useState, useEffect } from 'react'
import { FaBoxOpen, FaTrash } from 'react-icons/fa6'

import CaixaContext from '../../../contexts/CaixaContext'

import Popup from '..'
import Notice from '../../Notice'
import Tag from '../../Tag'
import Estoque from '../../Estoque'
import Input from '../../Input'
import Button from '../../Button'

import { Produto } from '../../../services/produtoService'
import { NovaMovimentacaoEstoque } from '../../../services/estoqueService'
import useProduto from '../../../hooks/useProduto'

import './styles.scss'
export type PopupProdutoProps = {
    visible: boolean
    setVisible: Dispatch<SetStateAction<boolean>>
    produto?: Produto
    onEntradaEstoque: (produto: Produto, quantidade: number) => void
    onDelete: (id: number) => void
}

export default function PopupProduto(props: PopupProdutoProps) {
    const caixaContext = useContext(CaixaContext.Context)
    
    const [entradaEstoque, setEntradaEstoque] = useState(0)

    const estoqueColor = (estoque: number) => {
        if (estoque >= 10) return 'var(--color-green)'
        if (estoque > 0) return 'var(--color-yellow)'
        return 'var(--color-red)'
    }

    const {
        deleteProduto,
        fetchingDelete,
        createMovimentacaoEstoque,
        fetchingMovimentacaoEstoque
    } = useProduto()

    async function handlePostEntradaEstoque(e: FormEvent) {
        e.preventDefault()
        if (caixaContext?.caixa && props.produto?.id) {
            const mE: NovaMovimentacaoEstoque = {
                quantidade: entradaEstoque,
                tipo: 'E',
                caixa: caixaContext.caixa,
                produto: props.produto.id
            }
            const response = await createMovimentacaoEstoque(mE)
            if (response.status == 201) {
                props.onEntradaEstoque(props.produto, entradaEstoque)
                setEntradaEstoque(0)
            }
        }
    }

    async function handleDeleteProduto(id: number) {
        const response = await deleteProduto(id)
        if (response.status == 204) props.onDelete(id)
    }

    useEffect(() => {
        if (props.produto) setEntradaEstoque(0)
    }, [props.produto])

    return (
        <Popup
            visible={props.visible}
            setVisible={props.setVisible}
            id='popup-produto'
            icon={<FaBoxOpen />}
            title='Produto'
        >
            {
                !props.produto ?
                    <Notice><p>Selecione um produto para visualizar</p></Notice>
                    :
                    <>
                        <div className="produto-infos">
                            <p className='nome'>{props.produto.nome}</p>
                            <div className="line close">
                                <Tag color='var(--color-blue)'>
                                    <p>R${Number(props.produto.preco).toFixed(2)}</p>
                                </Tag>
                                <Tag color={estoqueColor(props.produto.estoque)}>
                                    <Estoque number={props.produto.estoque} />
                                </Tag>
                                <Tag><p>{props.produto.medida}</p></Tag>
                            </div>
                        </div>

                        <div className="line">
                            <form
                                className="line close"
                                onSubmit={handlePostEntradaEstoque}
                            >
                                <Input
                                    type='intenger'
                                    id={'entrada-estoque'}
                                    value={entradaEstoque}
                                    onChange={(e) => setEntradaEstoque(Number(e.target.value))}
                                    min={1}
                                />
                                <Button
                                    className='flex-2'
                                    color='var(--color-green)'
                                    type='submit'
                                    loading={fetchingMovimentacaoEstoque}
                                >
                                    <p>Adicionar</p>
                                </Button>
                            </form>
                            <Button
                                color='var(--color-red)'
                                loading={fetchingDelete}
                                onClick={() => {
                                    if (props.produto?.id && confirm("Essa operação irá deletar também as movimentações de estoque e vendas desse produto. Deletar produto?"))
                                        handleDeleteProduto(props.produto.id)
                                }}
                            >
                                <FaTrash />
                            </Button>
                        </div>
                    </>
            }
        </Popup>
    )
}
