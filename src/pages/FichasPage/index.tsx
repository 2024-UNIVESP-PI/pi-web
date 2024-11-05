import { useState } from 'react'

import { FaPlus } from 'react-icons/fa6'

import PageTitle from '../../components/PageTitle'
import ActivityIndicator from '../../components/ActivityIndicator'
import Button from '../../components/Button'
import FichaCard from '../../components/Card/FichaCard'

import PopupNovaFicha from '../../components/Popup/PopupNovaFicha'
import PopupFicha from '../../components/Popup/PopupFicha'

import { Ficha } from '../../services/fichaService'
import useFichas from '../../hooks/useFichas'

import './styles.scss'

export default function FichasPage() {
    const [popupCreateVisible, setPopupCreateVisible] = useState(false)
    const [popupVisible, setPopupVisible] = useState(false)
    const [selectedFicha, setSelectedFicha] = useState<Ficha>()

    const {
        fichas,
        fetching,
        updateStateFicha,
    } = useFichas()

    function onRecarga(ficha: Ficha) {
        setSelectedFicha(ficha)
        updateStateFicha(ficha)
    }

    return (
        <div id='fichas-page'>
            <PageTitle
                title="Fichas"
                subtitle="Escolha a ficha a ser recarregada"
            />

            {
                fetching ?
                    <ActivityIndicator margin />
                    :
                    <>
                        <section className='fichas'>
                            <>
                                <Button
                                    className='nova-ficha'
                                    opacity
                                    onClick={() => setPopupCreateVisible(true)}
                                >
                                    <p>Nova ficha</p>
                                    <FaPlus />
                                </Button>
                                <PopupNovaFicha
                                    visible={popupCreateVisible}
                                    setVisible={setPopupCreateVisible}
                                // ficha={selectedFicha}
                                // onRecarga={onRecarga}
                                />
                            </>
                            {
                                fichas?.map(ficha => (
                                    <FichaCard
                                        key={ficha.id}
                                        ficha={ficha}
                                        onClick={() => {
                                            setSelectedFicha(ficha)
                                            setPopupVisible(true)
                                        }}
                                    />
                                ))
                            }
                        </section>
                        <PopupFicha
                            visible={popupVisible}
                            setVisible={setPopupVisible}
                            ficha={selectedFicha}
                            onRecarga={onRecarga}
                        />
                    </>
            }
        </div>
    )
}
