import { useState } from 'react'

import PageTitle from '../../components/PageTitle'
import ActivityIndicator from '../../components/ActivityIndicator'
import VendaCard from '../../components/Card/VendaCard'
import Notice from '../../components/Notice'

import PopupVenda from '../../components/Popup/PopupVenda'

import { Produto } from '../../services/produtoService'
import useProdutos from '../../hooks/useProdutos'

import './styles.scss'
export type VendasPageProps = {
}

export default function VendasPage(props: VendasPageProps) {
    const [popupVisible, setPopupVisible] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Produto>()

    const { produtos, fetching, updateStateProduto } = useProdutos()

    function onVenda(produto: Produto, quantidade: number) {
        produto.estoque -= quantidade
        updateStateProduto(produto)
    }

    return (
        <div id='vendas-page'>
            <PageTitle
                title="Vendas"
                subtitle="Escolha o produto a ser vendido"
            />

            {
                fetching ?
                    <ActivityIndicator margin />
                    :
                    (produtos && produtos.length > 0) ?
                        <>
                            <section className='produtos'>
                                {
                                    produtos?.map(produto => (
                                        <VendaCard
                                            key={produto.id}
                                            produto={produto}
                                            onClick={() => {
                                                setSelectedProduct(produto)
                                                setPopupVisible(true)
                                            }}
                                        />
                                    ))
                                }
                            </section>
                            <PopupVenda
                                visible={popupVisible}
                                setVisible={setPopupVisible}
                                produto={selectedProduct}
                                onVenda={onVenda}
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
