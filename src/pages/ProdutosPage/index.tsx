import { useState, FormEvent } from 'react'
import { FaPlus } from 'react-icons/fa6'

import PageTitle from '../../components/PageTitle'
import SearchBar from '../../components/SearchBar'
import Button from '../../components/Button'
import ActivityIndicator from '../../components/ActivityIndicator'
import Notice from '../../components/Notice'
import ProdutoCard from '../../components/Card/ProdutoCard'

import useProdutos from '../../hooks/useProdutos'

import './styles.scss'
export type ProdutosPageProps = {
}

export default function ProdutosPage(props: ProdutosPageProps) {
    const [searchProduct, setSearchProduct] = useState('')

    function onSubmit(e: FormEvent) {
        e.preventDefault()
        console.log(searchProduct)
    }

    const { produtos, fetching } = useProdutos()

    return (
        <div id='produtos-page'>
            <PageTitle
                title="Produtos"
            />

            <div className='line'>
                <SearchBar
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    onSubmit={onSubmit}
                />
                <Button>
                    <p>Novo produto</p>
                    <FaPlus />
                </Button>
            </div>

            {
                fetching ?
                    <ActivityIndicator margin />
                    :
                    (produtos && produtos.length > 0) ?
                        <>
                            <section className='produtos'>
                                <table>
                                    <thead>
                                        <tr>
                                            <th className='nome'>Nome</th>
                                            <th className='medida'>Medida</th>
                                            <th className='estoque'>Estoque</th>
                                            <th className='preco'>Preço</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            produtos?.map(produto => (
                                                <ProdutoCard
                                                    key={produto.id}
                                                    produto={produto}
                                                // onClick={() => {
                                                //     setSelectedProduct(produto)
                                                //     setPopupVisible(true)
                                                // }}
                                                />
                                            ))
                                        }
                                    </tbody>
                                </table>
                            </section>
                            {/* <PopupVenda
                                visible={popupVisible}
                                setVisible={setPopupVisible}
                                produto={selectedProduct}
                            >
                                <p>teste</p>
                            </PopupVenda> */}
                        </>
                        :
                        <Notice margin>
                            <p>Não há produtos cadastrados</p>
                        </Notice>
            }
        </div>
    )
}
