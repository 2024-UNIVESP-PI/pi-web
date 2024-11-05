import { Dispatch, SetStateAction, useContext, useState, FormEvent } from 'react'
import { FaBoxOpen } from 'react-icons/fa6'
import CaixaContext from '../../../contexts/CaixaContext'

import Popup from '..'
import Input from '../../Input'
import Button from '../../Button'

import { Errors } from '../../../services'
import { NovoProduto, Produto } from '../../../services/produtoService'
import cleanDecimal from '../../../functions/cleanDecimal'
import useProduto from '../../../hooks/useProduto'

// import './styles.scss'
export type PopupNovoProdutoProps = {
    visible: boolean
    setVisible: Dispatch<SetStateAction<boolean>>
    onCreate: (produto: Produto) => void
}

export default function PopupNovoProduto(props: PopupNovoProdutoProps) {
    const MEDIDA_CHOICES = [
        ['UN', 'Unidade'],
        ['PCT', 'Pacote'],
        ['L', 'Litro'],
        ['KG', 'Quilograma'],
    ]

    const caixaContext = useContext(CaixaContext.Context)

    const {
        createProduto,
        fetchingCreate,
    } = useProduto()

    const [nome, setNome] = useState('')
    const [preco, setPreco] = useState(0)
    const [medida, setMedida] = useState(MEDIDA_CHOICES[0][0])
    const [estoqueInicial, setEstoqueInicial] = useState(0)

    const [formErrors, setFormErrors] = useState<Errors>()

    function setupForm() {
        setNome('')
        setPreco(0)
        setMedida(MEDIDA_CHOICES[0][0])
        setEstoqueInicial(0)
    }

    async function handleCreateProduto(e: FormEvent) {
        e.preventDefault()
        setFormErrors(undefined)
        if (caixaContext?.caixa) {
            const nP: NovoProduto = {
                nome: nome,
                preco: preco,
                medida: medida,
                estoque: estoqueInicial,
                caixa: caixaContext?.caixa,
            }
            console.log(nP)
            const response = await createProduto(nP)
            if (response.status == 201) {
                setupForm()
                props.onCreate(response.data)
            } else {
                setFormErrors(response.data)
            }
        }
    }

    return (
        <Popup
            visible={props.visible}
            setVisible={props.setVisible}
            id='popup-novo-produto'
            icon={<FaBoxOpen />}
            title='Novo produto'
        >
            <form onSubmit={handleCreateProduto}>
                <Input
                    id='nome'
                    label='Nome'
                    placeholder='Ex.: Bolo'
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                    errors={formErrors?.nome}
                />
                <Input
                    id='medida'
                    type='select'
                    options={MEDIDA_CHOICES.map(choice => ({ value: choice[0], content: choice[1] }))}
                    label='Medida'
                    placeholder='Selecione a medida'
                    value={medida}
                    onChange={(e) => setMedida(e.target.value)}
                    required
                    errors={formErrors?.medida}
                />
                <div className="line">
                    <Input
                        id='preco'
                        type='number'
                        inputMode='decimal'
                        label='Preço'
                        placeholder='Insira o preço'
                        value={preco.toFixed(2)}
                        onChange={(e) => setPreco(cleanDecimal(e.target.value))}
                        required
                        min={0}
                        step={0.01}
                        errors={formErrors?.preco}
                    />
                    <Input
                        id='estoque-inicial'
                        type='intenger'
                        inputMode='numeric'
                        label='Estoque inicial'
                        placeholder='Opcional'
                        value={String(estoqueInicial)}
                        onChange={(e) => setEstoqueInicial(Number(e.target.value))}
                        errors={formErrors?.estoque}
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
