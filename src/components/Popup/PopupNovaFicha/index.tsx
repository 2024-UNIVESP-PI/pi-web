import {
  Dispatch,
  SetStateAction,
  useState,
  FormEvent,
  useEffect,
  useContext,
} from "react";
import { FaMoneyCheckDollar, FaCircleCheck } from "react-icons/fa6";
import { FaSearch, FaTimes } from "react-icons/fa";

import Popup from "..";
import Input from "../../Input";
import Button from "../../Button";
import Tag from "../../Tag";

import { Errors } from "../../../services";
import cleanDecimal from "../../../functions/cleanDecimal";
import useFicha from "../../../hooks/useFicha";
import { Ficha, NovaFicha } from "../../../services/fichaService";
import reservaService, {
  ReservasPendentesResponse,
} from "../../../services/reservaService";
import CaixaContext from "../../../contexts/CaixaContext";

import "./styles.scss";
export type PopupNovaFichaProps = {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  onCreate: (ficha: Ficha) => void;
  nextNumero?: number;
};

export default function PopupNovaFicha(props: PopupNovaFichaProps) {
  const { createFicha, fetchingCreate } = useFicha();
  const caixaContext = useContext(CaixaContext.Context);

  const [numero, setNumero] = useState<string>("");
  const [saldo, setSaldo] = useState<string>("");
  const [cpfReserva, setCpfReserva] = useState("");
  const [reservasPendentes, setReservasPendentes] =
    useState<ReservasPendentesResponse | null>(null);
  const [loadingReservas, setLoadingReservas] = useState(false);
  const [reservaError, setReservaError] = useState<string | null>(null);
  const [lastSearchedCpf, setLastSearchedCpf] = useState("");

  const [formErrors, setFormErrors] = useState<Errors>();
  const [fichaCriada, setFichaCriada] = useState<Ficha>();
  const [isClosing, setIsClosing] = useState(false);

  function setupForm() {
    setNumero(String(props.nextNumero || 1));
    setSaldo("");
    setCpfReserva("");
    setReservasPendentes(null);
    setReservaError(null);
    setLastSearchedCpf("");
  }

  async function buscarReservas(cpf = cpfReserva) {
    if (!cpf || cpf.length !== 11) {
      setReservaError("CPF deve ter 11 dígitos");
      setReservasPendentes(null);
      return;
    }

    setLoadingReservas(true);
    setReservaError(null);
    setLastSearchedCpf(cpf);

    try {
      const data = await reservaService.getReservasPendentesPorCPF(cpf);
      setReservasPendentes(data);
      // Define o saldo mínimo como o valor total das reservas
      const saldoNum = Number(saldo) || 0;
      if (saldoNum < data.valor_total) {
        setSaldo(data.valor_total.toFixed(2));
      }
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { status?: number; data?: { detail?: string } };
      };
      if (axiosError.response?.status === 404) {
        setReservaError("Nenhuma reserva pendente encontrada para este CPF");
      } else {
        setReservaError(
          axiosError.response?.data?.detail || "Erro ao buscar reservas"
        );
      }
      setReservasPendentes(null);
    } finally {
      setLoadingReservas(false);
    }
  }

  function limparReservas() {
    setCpfReserva("");
    setReservasPendentes(null);
    setReservaError(null);
    setLastSearchedCpf("");
    setSaldo("");
  }

  async function handleCreateFicha(e: FormEvent) {
    e.preventDefault();
    setFormErrors(undefined);
    setFichaCriada(undefined);
    setIsClosing(false);

    // Converte strings para números
    const numeroNum = Number(numero || props.nextNumero || 1);
    const saldoNum = Number(saldo);

    // Validações
    if (!numeroNum || numeroNum <= 0) {
      setFormErrors({
        numero: ["Não foi possível definir o número da ficha"],
      });
      return;
    }

    if (!saldo || saldoNum <= 0) {
      setFormErrors({
        saldo: ["Saldo deve ser maior que zero"],
      });
      return;
    }

    // Valida se há reservas e se o saldo é suficiente
    if (reservasPendentes && saldoNum < reservasPendentes.valor_total) {
      setFormErrors({
        saldo: [
          `O saldo deve ser no mínimo R$ ${reservasPendentes.valor_total.toFixed(
            2
          )} (valor total das reservas)`,
        ],
      });
      return;
    }

    const nF: NovaFicha = {
      numero: numeroNum,
      saldo: saldoNum,
      caixa_id: caixaContext?.caixa,
      cpf_reserva: reservasPendentes ? cpfReserva : undefined,
    };

    const response = await createFicha(nF);
    if (response.status == 201) {
      setFichaCriada(response.data);
      setupForm();
      // Aguarda um momento para mostrar a mensagem de sucesso antes de fechar
      setIsClosing(true);
      setTimeout(() => {
        props.onCreate(response.data);
        setIsClosing(false);
      }, 2000);
    } else {
      setFormErrors(response.data);
    }
  }

  useEffect(() => {
    // Limpa mensagem de sucesso quando o popup é fechado (mas não durante o processo de fechamento após criação)
    if (!props.visible && !isClosing) {
      setFichaCriada(undefined);
      // Limpa os campos quando o popup é fechado
      setupForm();
    }
  }, [props.visible, isClosing]);

  useEffect(() => {
    if (props.visible) {
      setNumero(String(props.nextNumero || 1));
    }
  }, [props.visible, props.nextNumero]);

  useEffect(() => {
    if (
      props.visible &&
      cpfReserva.length === 11 &&
      cpfReserva !== lastSearchedCpf &&
      !loadingReservas
    ) {
      buscarReservas(cpfReserva);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cpfReserva, props.visible, lastSearchedCpf, loadingReservas]);

  return (
    <Popup
      visible={props.visible}
      setVisible={props.setVisible}
      id="popup-nova-ficha"
      icon={<FaMoneyCheckDollar />}
      title="Nova ficha"
    >
      <form onSubmit={handleCreateFicha}>
        <div className="reserva-section">
          <div className="reserva-header">
            <h4>Reserva antecipada</h4>
            <p className="reserva-subtitle">
              Digite ou cole o CPF para vincular reservas pendentes.
            </p>
          </div>

          <div className="reserva-search-row">
            <Input
              id="cpf-reserva"
              type="text"
              inputMode="numeric"
              label="CPF"
              value={cpfReserva}
              onPaste={(e) => {
                e.preventDefault();
                const pastedText = e.clipboardData.getData("text");
                const digitsOnly = pastedText.replace(/\D/g, "");
                const cpfDigits = digitsOnly.slice(0, 11);
                setCpfReserva(cpfDigits);
                setReservaError(null);
                if (cpfDigits.length !== 11) {
                  setReservasPendentes(null);
                }
              }}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 11);
                setCpfReserva(value);
                setReservaError(null);
                if (value.length !== 11) {
                  setReservasPendentes(null);
                }
              }}
              placeholder="00000000000"
              maxLength={18}
            />
            <div className="reserva-actions">
              <Button
                type="button"
                onClick={() => buscarReservas()}
                color="var(--color-blue)"
                opacity={loadingReservas || cpfReserva.length !== 11}
              >
                <FaSearch />
                <span>{loadingReservas ? "Buscando..." : "Buscar"}</span>
              </Button>
              {reservasPendentes && (
                <Button
                  type="button"
                  onClick={limparReservas}
                  color="var(--color-red)"
                >
                  <FaTimes />
                  <p>Limpar</p>
                </Button>
              )}
            </div>
          </div>

          {reservaError && (
            <Tag color="var(--color-red)" className="reserva-error">
              {reservaError}
            </Tag>
          )}

          {reservasPendentes && (
            <div className="reserva-info">
              <div className="reserva-cliente">
                <span>Reserva encontrada</span>
                <strong>{reservasPendentes.nome_completo}</strong>
                <small>{reservasPendentes.cpf}</small>
              </div>

              <div className="reserva-itens">
                <p className="reserva-itens-title">Itens reservados</p>
                <ul>
                  {reservasPendentes.itens.map((item) => (
                    <li key={item.id}>
                      <span>
                        {item.quantidade}x {item.produto}
                      </span>
                      <strong>R$ {item.preco_total.toFixed(2)}</strong>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="reserva-total">
                <span>Total reservado</span>
                <strong>R$ {reservasPendentes.valor_total.toFixed(2)}</strong>
              </div>
            </div>
          )}
        </div>

        <div className="ficha-create-row">
          <div className="generated-number">
            <span>Número da ficha</span>
            <strong>#{numero || props.nextNumero || 1}</strong>
          </div>
          <Input
            id="saldo"
            type="number"
            inputMode="decimal"
            label="Saldo inicial"
            value={saldo}
            onChange={(e) => {
              // Permite campo vazio e processa decimal
              const value = e.target.value;
              // Permite campo vazio ou valor numérico válido
              if (value === "" || value === ".") {
                setSaldo(value);
              } else {
                const cleaned = cleanDecimal(value);
                setSaldo(cleaned === 0 ? "" : String(cleaned));
              }
              setFichaCriada(undefined);
            }}
            required
            min={reservasPendentes ? reservasPendentes.valor_total : 0}
            step={0.01}
            errors={formErrors?.saldo}
          />
        </div>

        {reservasPendentes &&
          saldo &&
          Number(saldo) > reservasPendentes.valor_total && (
            <Tag color="var(--color-info)" className="reserva-saldo-restante">
              Saldo restante após processar reservas: R${" "}
              {(Number(saldo) - reservasPendentes.valor_total).toFixed(2)}
            </Tag>
          )}

        <Button
          type="submit"
          color="var(--color-green)"
          loading={fetchingCreate}
        >
          <p>{reservasPendentes ? "Criar ficha vinculada" : "Criar"}</p>
        </Button>
      </form>

      {fichaCriada && (
        <Tag color="var(--color-green)" className="column success-message">
          <div className="success-header">
            <div className="success-icon">
              <FaCircleCheck />
            </div>
            <p className="success-title">Ficha criada com sucesso!</p>
          </div>
          <div className="success-details">
            <p className="detail-line">
              Ficha <b>#{fichaCriada.numero}</b> criada com saldo inicial de{" "}
              <b>R${fichaCriada.saldo.toFixed(2)}</b>
              {reservasPendentes && (
                <>
                  {" "}
                  vinculada a <b>{reservasPendentes.quantidade_itens}</b>{" "}
                  reserva(s) totalizando{" "}
                  <b>R${reservasPendentes.valor_total.toFixed(2)}</b>
                  {saldo && Number(saldo) > reservasPendentes.valor_total && (
                    <>
                      {" "}
                      com saldo restante de{" "}
                      <b>
                        R$
                        {(
                          Number(saldo) - reservasPendentes.valor_total
                        ).toFixed(2)}
                      </b>
                    </>
                  )}
                </>
              )}
            </p>
          </div>
        </Tag>
      )}
    </Popup>
  );
}
