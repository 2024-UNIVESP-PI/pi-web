import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useState,
  useEffect,
  useContext,
} from "react";
import { FaMoneyCheckDollar, FaTrash, FaCircleCheck } from "react-icons/fa6";

import Popup from "..";
import Notice from "../../Notice";
import Tag from "../../Tag";
import Input from "../../Input";
import Button from "../../Button";

import { Ficha } from "../../../services/fichaService";
import useFicha from "../../../hooks/useFicha";
import CaixaContext from "../../../contexts/CaixaContext";

import "./styles.scss";
export type PopupFichaProps = {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  ficha?: Ficha;
  onRecarga: (ficha: Ficha) => void;
  onDelete?: (id: number) => void;
};

export default function PopupFicha(props: PopupFichaProps) {
  const caixaContext = useContext(CaixaContext.Context);
  const [recarga, setRecarga] = useState(0);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [senhaAdmin, setSenhaAdmin] = useState("");
  const [recargaSucesso, setRecargaSucesso] = useState(false);
  const [valorRecarga, setValorRecarga] = useState(0);
  const [fichaAtualizada, setFichaAtualizada] = useState<Ficha>();

  const { recargaFicha, fetchingRecarga, deleteFicha, fetchingDelete } =
    useFicha();

  async function handleRecargaFicha(e: FormEvent) {
    e.preventDefault();
    if (props.ficha?.id && recarga) {
      const caixaId = caixaContext?.caixa;
      const response = await recargaFicha(props.ficha?.id, recarga, caixaId);
      if (response.status == 200) {
        // Define a mensagem de sucesso primeiro
        setValorRecarga(recarga);
        setFichaAtualizada(response.data);
        setRecargaSucesso(true);
        setRecarga(0);

        // Aguarda um momento para garantir que o estado foi atualizado
        // antes de atualizar o estado pai (que pode disparar o useEffect)
        await new Promise((resolve) => setTimeout(resolve, 50));

        // Atualiza a ficha no estado pai
        props.onRecarga(response.data);
      }
    }
  }

  async function handleDeleteFicha(e: FormEvent) {
    e.preventDefault();
    if (props.ficha?.id && senhaAdmin) {
      const response = await deleteFicha(props.ficha.id, senhaAdmin);
      if (response.status == 204) {
        if (props.onDelete) {
          props.onDelete(props.ficha.id);
        }
        setShowDeletePopup(false);
        setSenhaAdmin("");
        props.setVisible(false);
      } else {
        alert(response.data?.detail || "Erro ao deletar ficha");
      }
    }
  }

  useEffect(() => {
    if (props.ficha) {
      // Se a mensagem de sucesso está visível e a ficha atualizada tem o mesmo ID,
      // significa que é uma atualização após recarga, então não limpa a mensagem
      if (
        recargaSucesso &&
        fichaAtualizada &&
        fichaAtualizada.id === props.ficha.id
      ) {
        // Atualiza a ficha atualizada com os novos dados, mas mantém a mensagem
        setFichaAtualizada(props.ficha);
        // Não limpa os outros campos para evitar resetar durante a recarga
        return;
      }

      // Se não é a mesma ficha ou não há mensagem de sucesso, limpa tudo
      // Só limpa se não estiver no meio de uma recarga bem-sucedida
      if (
        !recargaSucesso ||
        !fichaAtualizada ||
        fichaAtualizada.id !== props.ficha.id
      ) {
        setRecarga(0);
        setShowDeletePopup(false);
        setSenhaAdmin("");
        setRecargaSucesso(false);
        setValorRecarga(0);
        setFichaAtualizada(undefined);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.ficha]);

  return (
    <Popup
      visible={props.visible}
      setVisible={props.setVisible}
      id="popup-ficha"
      icon={<FaMoneyCheckDollar />}
      title="Ficha"
    >
      {!props.ficha ? (
        <Notice>
          <p>Selecione uma ficha para visualizar</p>
        </Notice>
      ) : (
        <>
          <div className="ficha-infos line">
            <div>
              <span className="info-label">Ficha selecionada</span>
              <p className="numero">{props.ficha.numero}</p>
            </div>
            <Tag
              className="saldo"
              color={props.ficha.saldo <= 0 ? "var(--color-red)" : undefined}
            >
              <p>R${props.ficha.saldo.toFixed(2)}</p>
            </Tag>
          </div>

          <section className="transaction-panel">
            <div className="panel-header">
              <h4>Adicionar saldo</h4>
              <p>Informe o crédito recebido para esta ficha.</p>
            </div>
            <form className="recarga-form" onSubmit={handleRecargaFicha}>
              <Input
                type="intenger"
                inputMode="numeric"
                id={"credito-adicional"}
                label="Valor da recarga"
                value={String(recarga)}
                onChange={(e) => setRecarga(Number(e.target.value))}
                min={1}
              />
              <div className="recarga-preview">
                <span>Novo saldo</span>
                <strong>
                  R${(props.ficha.saldo + Number(recarga || 0)).toFixed(2)}
                </strong>
              </div>
              <Button
                color="var(--color-green)"
                type="submit"
                loading={fetchingRecarga}
              >
                <p>Recarregar</p>
              </Button>
            </form>
          </section>

          <div className="danger-row">
            <div>
              <strong>Remover ficha</strong>
              <p>Exige senha de administrador.</p>
            </div>
            <Button
              color="var(--color-red)"
              onClick={() => setShowDeletePopup(true)}
            >
              <FaTrash /> Deletar
            </Button>
          </div>

          {recargaSucesso && fichaAtualizada && (
            <Tag color="var(--color-green)" className="column success-message">
              <div className="success-header">
                <div className="success-icon">
                  <FaCircleCheck />
                </div>
                <p className="success-title">Recarga realizada com sucesso!</p>
              </div>
              <div className="success-details">
                <p className="detail-line">
                  <b>R${valorRecarga.toFixed(2)}</b> adicionados à ficha{" "}
                  <b>#{fichaAtualizada.numero}</b>
                </p>
                <p className="detail-line">
                  Novo saldo: <b>R${fichaAtualizada.saldo.toFixed(2)}</b>
                </p>
              </div>
            </Tag>
          )}

          {showDeletePopup && (
            <form onSubmit={handleDeleteFicha} className="delete-form">
              <p className="delete-warning">
                Para deletar esta ficha, insira a senha de administrador:
              </p>
              <Input
                type="password"
                id="senha-admin-delete"
                label="Senha de Administrador"
                value={senhaAdmin}
                onChange={(e) => setSenhaAdmin(e.target.value)}
                required
              />
              <div className="delete-actions">
                <Button
                  type="button"
                  color="var(--color-gray)"
                  onClick={() => {
                    setShowDeletePopup(false);
                    setSenhaAdmin("");
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  color="var(--color-red)"
                  loading={fetchingDelete}
                >
                  Confirmar Exclusão
                </Button>
              </div>
            </form>
          )}
        </>
      )}
    </Popup>
  );
}
