import { useState } from "react";

import { FaPlus } from "react-icons/fa6";

import PageTitle from "../../components/PageTitle";
import ActivityIndicator from "../../components/ActivityIndicator";
import Button from "../../components/Button";
import FichaCard from "../../components/Card/FichaCard";

import PopupNovaFicha from "../../components/Popup/PopupNovaFicha";
import PopupFicha from "../../components/Popup/PopupFicha";

import { Ficha } from "../../services/fichaService";
import useFichas from "../../hooks/useFichas";

import "./styles.scss";

export default function FichasPage() {
  const [popupCreateVisible, setPopupCreateVisible] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedFicha, setSelectedFicha] = useState<Ficha>();

  const {
    fichas,
    fetching,
    updateStateFicha,
    insertStateFicha,
    removeStateFicha,
  } = useFichas();

  const fichasAtivas = fichas?.length || 0;
  const fichasSemSaldo =
    fichas?.filter((ficha) => ficha.saldo <= 0).length || 0;
  const proximoNumeroFicha =
    fichas && fichas.length > 0
      ? Math.max(...fichas.map((ficha) => ficha.numero)) + 1
      : 1;

  function onRecarga(ficha: Ficha) {
    setSelectedFicha(ficha);
    updateStateFicha(ficha);
  }

  function onCreate(ficha: Ficha) {
    insertStateFicha(ficha);
    setSelectedFicha(ficha);
    setPopupCreateVisible(false);
    setPopupVisible(true);
  }

  function onDelete(id: number) {
    removeStateFicha(id);
    setPopupVisible(false);
    setSelectedFicha(undefined);
  }

  return (
    <div id="fichas-page">
      <PageTitle title="Fichas" subtitle="Escolha a ficha a ser recarregada" />

      {fetching ? (
        <ActivityIndicator margin />
      ) : (
        <>
          <section className="caixa-summary" aria-label="Resumo de fichas">
            <div>
              <span>Fichas ativas</span>
              <strong>{fichasAtivas}</strong>
            </div>
            <div>
              <span>Sem saldo</span>
              <strong>{fichasSemSaldo}</strong>
            </div>
          </section>

          <section className="fichas">
            <>
              <Button
                className="nova-ficha"
                opacity
                onClick={() => setPopupCreateVisible(true)}
              >
                <p>Criar nova ficha</p>
                <FaPlus />
                <span>Com saldo inicial ou reserva</span>
              </Button>
              <PopupNovaFicha
                visible={popupCreateVisible}
                setVisible={setPopupCreateVisible}
                onCreate={onCreate}
                nextNumero={proximoNumeroFicha}
              />
            </>
            {fichas?.map((ficha) => (
              <FichaCard
                key={ficha.id}
                ficha={ficha}
                onClick={() => {
                  setSelectedFicha(ficha);
                  setPopupVisible(true);
                }}
              />
            ))}
          </section>
          <PopupFicha
            visible={popupVisible}
            setVisible={setPopupVisible}
            ficha={selectedFicha}
            onRecarga={onRecarga}
            onDelete={onDelete}
          />
        </>
      )}
    </div>
  );
}
