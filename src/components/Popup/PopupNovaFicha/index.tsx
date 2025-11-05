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

// import './styles.scss'
export type PopupNovaFichaProps = {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  onCreate: (ficha: Ficha) => void;
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

  const [formErrors, setFormErrors] = useState<Errors>();
  const [fichaCriada, setFichaCriada] = useState<Ficha>();
  const [isClosing, setIsClosing] = useState(false);

  function setupForm() {
    setNumero("");
    setSaldo("");
    setCpfReserva("");
    setReservasPendentes(null);
    setReservaError(null);
  }

  async function buscarReservas() {
    if (!cpfReserva || cpfReserva.length !== 11) {
      setReservaError("CPF deve ter 11 dígitos");
      setReservasPendentes(null);
      return;
    }

    setLoadingReservas(true);
    setReservaError(null);

    try {
      const data = await reservaService.getReservasPendentesPorCPF(cpfReserva);
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
    setSaldo("");
  }

  async function handleCreateFicha(e: FormEvent) {
    e.preventDefault();
    setFormErrors(undefined);
    setFichaCriada(undefined);
    setIsClosing(false);

    // Converte strings para números
    const numeroNum = Number(numero);
    const saldoNum = Number(saldo);

    // Validações
    if (!numero || numeroNum <= 0) {
      setFormErrors({
        numero: ["Número da ficha deve ser maior que zero"],
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

  return (
    <Popup
      visible={props.visible}
      setVisible={props.setVisible}
      id="popup-nova-ficha"
      icon={<FaMoneyCheckDollar />}
      title="Nova ficha"
    >
      <form onSubmit={handleCreateFicha}>
        {/* Busca de reserva por CPF */}
        <div className="reserva-section">
          <div className="reserva-header">
            <h4>Vincular a reserva (opcional)</h4>
            <p className="reserva-subtitle">
              Busque reservas pendentes por CPF
            </p>
          </div>

          <div className="line">
            <Input
              id="cpf-reserva"
              type="text"
              inputMode="numeric"
              label="CPF (11 dígitos)"
              value={cpfReserva}
              onPaste={(e) => {
                // Permite colar CPF formatado (ex: 456.466.227-76)
                e.preventDefault();
                const pastedText = e.clipboardData.getData("text");
                // Remove todos os caracteres não numéricos (pontos, hífens, espaços)
                const digitsOnly = pastedText.replace(/\D/g, "");
                // Limita a 11 dígitos (garante que pegou todos os dígitos do CPF)
                const cpfDigits = digitsOnly.slice(0, 11);
                setCpfReserva(cpfDigits);
                setReservaError(null);
                if (cpfDigits.length === 11) {
                  // Se tem 11 dígitos, tenta buscar automaticamente
                  buscarReservas();
                } else {
                  setReservasPendentes(null);
                }
              }}
              onChange={(e) => {
                // Remove todos os caracteres não numéricos
                const value = e.target.value.replace(/\D/g, "").slice(0, 11);
                setCpfReserva(value);
                setReservaError(null);
                if (value.length !== 11) {
                  setReservasPendentes(null);
                }
              }}
              placeholder="00000000000 ou 000.000.000-00"
              maxLength={18}
            />
            <div className="reserva-actions">
              <button
                type="button"
                onClick={buscarReservas}
                disabled={loadingReservas || cpfReserva.length !== 11}
                style={{
                  backgroundColor: "var(--color-blue)",
                  opacity:
                    loadingReservas || cpfReserva.length !== 11 ? 0.6 : 1,
                  cursor:
                    loadingReservas || cpfReserva.length !== 11
                      ? "not-allowed"
                      : "pointer",
                  padding: "8px 12px",
                  border: "none",
                  borderRadius: "4px",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                }}
              >
                <FaSearch />
                <span>{loadingReservas ? "Buscando..." : "Buscar"}</span>
              </button>
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
                <p>
                  <strong>Cliente:</strong> {reservasPendentes.nome_completo}
                </p>
                <p>
                  <strong>CPF:</strong> {reservasPendentes.cpf}
                </p>
              </div>

              <div className="reserva-itens">
                <p className="reserva-itens-title">
                  <strong>Itens reservados:</strong>
                </p>
                <ul>
                  {reservasPendentes.itens.map((item) => (
                    <li key={item.id}>
                      {item.produto} - {item.quantidade}x R${" "}
                      {item.preco_unitario.toFixed(2)} = R${" "}
                      {item.preco_total.toFixed(2)}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="reserva-total">
                <p>
                  <strong>Valor total:</strong> R${" "}
                  {reservasPendentes.valor_total.toFixed(2)}
                </p>
                <p className="reserva-minimo">
                  Saldo mínimo necessário: R${" "}
                  {reservasPendentes.valor_total.toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="line">
          <Input
            id="numero"
            type="intenger"
            inputMode="numeric"
            label="Número"
            value={numero}
            onChange={(e) => {
              // Permite campo vazio e apenas números
              const value = e.target.value.replace(/\D/g, "");
              setNumero(value);
              setFichaCriada(undefined);
            }}
            required
            min={0}
            step={1}
            errors={formErrors?.numero}
          />
          <Input
            id="saldo"
            type="number"
            inputMode="decimal"
            label="Saldo"
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
