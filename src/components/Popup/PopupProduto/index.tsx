import { Dispatch, FormEvent, SetStateAction, useContext, useState, useEffect } from 'react'
import { FaBoxOpen, FaTrash, FaPen, FaCheck, FaXmark } from 'react-icons/fa6'

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
    onUpdate?: (produtoAtualizado: Produto) => void
}

export default function PopupProduto(props: PopupProdutoProps) {
    const caixaContext = useContext(CaixaContext.Context)

    const [entradaEstoque, setEntradaEstoque] = useState(0)
    const [editando, setEditando] = useState(false)

    // Estados para edição
    const [nomeEdit, setNomeEdit] = useState('')
    const [precoEdit, setPrecoEdit] = useState('')
    const [medidaEdit, setMedidaEdit] = useState('')

    const estoqueColor = (estoque: number) => {
        if (estoque >= 10) return 'var(--color-green)'
        if (estoque > 0) return 'var(--color-yellow)'
        return 'var(--color-red)'
    }

    const {
        deleteProduto,
        fetchingDelete,
        createMovimentacaoEstoque,
        fetchingMovimentacaoEstoque,
        patchProduto,
    } = useProduto()

    // Quando o produto mudar, resetar os campos editáveis
    useEffect(() => {
        if (props.produto) {
            setEntradaEstoque(0)
            setNomeEdit(props.produto.nome)
            setPrecoEdit(String(props.produto.preco))
            setMedidaEdit(props.produto.medida)
            setEditando(false)
        }
    }, [props.produto])

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
            if (response && response.status === 201) {
                props.onEntradaEstoque(props.produto, entradaEstoque)
                setEntradaEstoque(0)
            }
        }
    }

    async function handleDeleteProduto(id: number) {
        const response = await deleteProduto(id)
        if (response && response.status === 204) {
            props.onDelete(id)
        }
    }

    async function handleSaveEdicao() {
        if (!props.produto) return

        const precoNumber = Number(precoEdit)
        if (isNaN(precoNumber) || precoNumber < 0) {
            alert('Preço inválido')
            return
        }
        if (!nomeEdit.trim()) {
            alert('Nome não pode ser vazio')
            return
        }
        if (!medidaEdit.trim()) {
            alert('Medida não pode ser vazia')
            return
        }

        try {
            const dadosParciais: Partial<Produto> = {
                nome: nomeEdit.trim(),
                preco: precoNumber,
                medida: medidaEdit.trim(),
            }

            const response = await patchProduto(props.produto.id, dadosParciais)
            if (response && response.status === 200 && response.data) {
                setEditando(false)
                // Atualiza localmente (callback opcional)
                if (props.onUpdate) {
                    props.onUpdate(response.data)
                }
            } else {
                alert('Erro ao salvar edição')
            }
        } catch (error) {
            alert('Erro ao salvar edição')
            console.error(error)
        }
    }

    return (
        <Popup
            visible={props.visible}
            setVisible={props.setVisible}
            id='popup-produto'
            icon={<FaBoxOpen />}
            title='Produto'
        >
            {
                !props.produto ? (
                    <Notice><p>Selecione um produto para visualizar</p></Notice>
                ) : (
                    <>
                        <div className="produto-infos">
                            {
                                editando ? (
                                    <>
                                        <Input
                                            id="nome-produto-edit"
                                            label="Nome"
                                            value={nomeEdit}
                                            onChange={(e) => setNomeEdit(e.target.value)}
                                            required
                                        />
                                        <Input
                                            id="preco-produto-edit"
                                            label="Preço"
                                            type="number"
                                            step={0.01}
                                            min={0}
                                            value={precoEdit}
                                            onChange={(e) => setPrecoEdit(e.target.value)}
                                            required
                                        />
                                        <Input
                                            id="medida-produto-edit"
                                            label="Medida"
                                            value={medidaEdit}
                                            onChange={(e) => setMedidaEdit(e.target.value)}
                                            required
                                        />
                                    </>
                                ) : (
                                    <>
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
                                    </>
                                )
                            }
                        </div>

                        <div className="line">
                            {
                                editando ? (
                                    <>
                                        <Button
                                            color='var(--color-green)'
                                            onClick={handleSaveEdicao}
                                        >
                                            <FaCheck />
                                            <span>Salvar</span>
                                        </Button>
                                        <Button
                                            color='var(--color-gray)'
                                            onClick={() => setEditando(false)}
                                        >
                                            <FaXmark />
                                            <span>Cancelar</span>
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <form
                                            className="line close"
                                            onSubmit={handlePostEntradaEstoque}
                                        >
                                            <Input
                                                type='number'
                                                inputMode='numeric'
                                                id={'entrada-estoque'}
                                                value={String(entradaEstoque)}
                                                onChange={(e) => setEntradaEstoque(Number(e.target.value))}
                                                required
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
                                        <Button
                                            color='var(--color-blue)'
                                            onClick={() => setEditando(true)}
                                        >
                                            <FaPen />
                                        </Button>
                                    </>
                                )
                            }
                        </div>
                    </>
                )
            }
        </Popup>
    )
}