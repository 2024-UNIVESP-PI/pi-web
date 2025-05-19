import { useState, FormEvent } from 'react'
import { FaPlus } from 'react-icons/fa6'

import PageTitle from '../../components/PageTitle'
import SearchBar from '../../components/SearchBar'
import Button from '../../components/Button'
import ActivityIndicator from '../../components/ActivityIndicator'
import Notice from '../../components/Notice'
import ProdutoCard from '../../components/Card/ProdutoCard'

import PopupNovoProduto from '../../components/Popup/PopupNovoProduto'
import PopupProduto from '../../components/Popup/PopupProduto'

import { Produto } from '../../services/produtoService'
import useProdutos from '../../hooks/useProdutos'

import './styles.scss'

export default function ProdutosPage() {
    const [search, setSearch] = useState('')
    const [popupNovoProdutoVisible, setPopupNovoProdutoVisible] = useState(false)
    const [popupProdutoVisible, setPopupProdutoVisible] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Produto>()

    const {
        produtos,
        fetching,
        readProdutos,
        removeStateProduto,
        updateStateProduto,
        insertStateProduto,
    } = useProdutos()

    function onSubmit(e: FormEvent) {
        e.preventDefault()
        console.log(search)
        readProdutos(search)
    }

    function onCreate(produto: Produto) {
        insertStateProduto(produto)
        setSelectedProduct(produto)
        setPopupNovoProdutoVisible(false)
        setPopupProdutoVisible(true)
    }

    function onUpdate(produtoAtualizado: Produto) {
        updateStateProduto(produtoAtualizado)
        setSelectedProduct(produtoAtualizado)
    }

    function onEntradaEstoque(produto: Produto, quantidade: number) {
        produto.estoque += quantidade
        setSelectedProduct(produto)
        updateStateProduto(produto)
    }

    function onDelete(id: number) {
        removeStateProduto(id)
        setPopupProdutoVisible(false)
        setSelectedProduct(undefined)
    }

    return (
        <div id='produtos-page'>
            <PageTitle
                title="Produtos"
            />

            <div className='options'>
                <SearchBar
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onSubmit={onSubmit}
                />
                <>
                    <Button onClick={() => setPopupNovoProdutoVisible(true)}>
                        <p className='mobile-hide'>Novo produto</p>
                        <FaPlus />
                    </Button>
                    <PopupNovoProduto
                        visible={popupNovoProdutoVisible}
                        setVisible={setPopupNovoProdutoVisible}
                        onCreate={onCreate}
                    />
                </>
            </div>

            {
                fetching ?
                    <ActivityIndicator margin />
                    :
                    (produtos && produtos.length > 0) ?
                        <>
                            <section className='produtos'>
                                <div className='list-header'>
                                    <p className='nome'>Nome</p>
                                    <p className='medida mobile-hide'>Medida</p>
                                    <p className='estoque'>Estoque</p>
                                    <p className='preco'>Preço</p>
                                </div>
                                <ul>
                                    {
                                        produtos?.map(produto => (
                                            <ProdutoCard
                                                key={produto.id}
                                                produto={produto}
                                                onClick={() => {
                                                    setSelectedProduct(produto)
                                                    setPopupProdutoVisible(true)
                                                }}
                                            />
                                        ))
                                    }
                                </ul>
                            </section>
                            <PopupProduto
                                visible={popupProdutoVisible}
                                setVisible={setPopupProdutoVisible}
                                produto={selectedProduct}
                                onEntradaEstoque={onEntradaEstoque}
                                onDelete={onDelete}
                                onUpdate={onUpdate}
                            />
                        </>
                        :
                        <Notice margin>
                            <p>Não há produtos cadastrados</p>
                        </Notice>
            }
        </div>
    )
}
