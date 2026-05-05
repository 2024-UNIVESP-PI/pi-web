import {
  Dispatch,
  SetStateAction,
  useContext,
  useState,
  useEffect,
  FormEvent,
  useMemo,
} from "react";
import {
  FaCashRegister,
  FaCircleCheck,
  FaMinus,
  FaPlus,
} from "react-icons/fa6";

import CaixaContext from "../../../contexts/CaixaContext";

import Popup from "..";
import Notice from "../../Notice";
import Tag from "../../Tag";
import Estoque from "../../Estoque";
import Button from "../../Button";

import { Produto } from "../../../services/produtoService";
import { Ficha } from "../../../services/fichaService";
import { NovaVenda, Venda } from "../../../services/vendaServices";
import useFichas from "../../../hooks/useFichas";
import useVenda from "../../../hooks/useVenda";
import "./styles.scss";

export type PopupVendaProps = {
  visible: boolean;
  setVisible: Dispatch<SetStateAction<boolean>>;
  produto?: Produto;
  onVenda: (produto: Produto, quantidade: number) => void;
};

export default function PopupVenda(props: PopupVendaProps) {
  const caixaContext = useContext(CaixaContext.Context);

  const [ficha, setFicha] = useState<number>(0);
  const [fichaSearch, setFichaSearch] = useState("");
  const [selectedFichaData, setSelectedFichaData] = useState<Ficha>();
  const [quantidade, setQuantidade] = useState(1);
  const [precoFinal, setPrecoFinal] = useState<number>();
  const [quantidadeMax, setQuantidadeMax] = useState<number>(0);

  const [ultimaVenda, setUltimaVenda] = useState<Venda>();
  const [hasError, setHasError] = useState(false);

  const { fichas, readFichas } = useFichas();

  const { createVenda, fetchingCreate } = useVenda();
  const produtoPreco = props.produto ? Number(props.produto.preco) : 0;
  const saldoDepoisDaVenda =
    selectedFichaData && precoFinal !== undefined
      ? selectedFichaData.saldo - precoFinal
      : undefined;
  const vendaInvalida =
    !ficha || !selectedFichaData || quantidade < 1 || quantidade > quantidadeMax;

  const filteredFichas = useMemo(() => {
    const search = fichaSearch.trim().toLowerCase();
    if (!fichas) return [];

    return fichas.filter((fichaItem) => {
      if (!search) return true;
      return (
        String(fichaItem.numero).includes(search) ||
        fichaItem.saldo.toFixed(2).includes(search)
      );
    });
  }, [fichas, fichaSearch]);

  async function handleCreateVenda(e: FormEvent) {
    e.preventDefault();
    if (
      caixaContext?.caixa &&
      props.produto &&
      ficha &&
      quantidade >= 1 &&
      quantidade <= quantidadeMax
    ) {
      setUltimaVenda(undefined);
      setHasError(false);
      const venda: NovaVenda = {
        movimentacao: {
          caixa: caixaContext.caixa,
          produto: props.produto.id,
          quantidade: quantidade,
        },
        ficha: ficha,
      };
      const response = await createVenda(venda);
      if (response.status == 201) {
        setUltimaVenda(response.data);
        props.onVenda(props.produto, quantidade);
        setQuantidade(1);
        await readFichas();
      } else {
        setHasError(true);
      }
    }
  }

  // Limpa mensagem de sucesso quando produto muda
  useEffect(() => {
    if (props.produto) {
      // Se o produto mudou, limpa a mensagem de sucesso
      setUltimaVenda(undefined);
      setFichaSearch("");
    }
  }, [props.produto]);

  useEffect(() => {
    if (props.produto) {
      setQuantidade(1);
      if (selectedFichaData && selectedFichaData?.saldo < props.produto.preco)
        setFicha(0);
    }
  }, [props.produto, selectedFichaData]);

  useEffect(() => {
    if (fichas)
      setSelectedFichaData(fichas.find((fichaAux) => fichaAux.id == ficha));
  }, [ficha, fichas]);

  useEffect(() => {
    if (props.produto) setPrecoFinal(props.produto.preco * quantidade);
    else setPrecoFinal(undefined);
  }, [props.produto, quantidade]);

  useEffect(() => {
    if (props.produto && selectedFichaData) {
      const maxCompraFicha =
        produtoPreco > 0
          ? Math.trunc(selectedFichaData.saldo / produtoPreco)
          : props.produto.estoque;
      if (maxCompraFicha == 0) {
        setFicha(0);
        setQuantidade(1);
      } else {
        const nextQuantidadeMax = Math.min(maxCompraFicha, props.produto.estoque);
        setQuantidadeMax(nextQuantidadeMax);
        setQuantidade((currentQuantidade) =>
          Math.min(Math.max(currentQuantidade, 1), nextQuantidadeMax)
        );
      }
    } else {
      setQuantidadeMax(0);
    }
  }, [props.produto, selectedFichaData, produtoPreco]);

  useEffect(() => {
    // Limpa mensagem de erro quando o popup é fechado
    if (hasError && !props.visible) setHasError(false);
    // Mantém mensagem de sucesso visível mesmo quando o popup é fechado
  }, [props.visible, hasError]);

  return (
    <Popup
      visible={props.visible}
      setVisible={props.setVisible}
      id="popup-nova-venda"
      icon={<FaCashRegister />}
      title="Nova venda"
    >
      {!props.produto ? (
        <Notice>
          <p>Selecione um produto para realizar uma venda</p>
        </Notice>
      ) : (
        <>
          <Tag
            className="medium"
            color={
              props.produto.estoque > 0
                ? "var(--color-blue)"
                : "var(--color-red)"
            }
          >
            <p className="title flex-1">{props.produto.nome}</p>
            <Estoque number={props.produto.estoque} />
            <p>R${Number(props.produto.preco).toFixed(2)}</p>
          </Tag>

          {props.produto.estoque > 0 ? (
            <form onSubmit={!fetchingCreate ? handleCreateVenda : undefined}>
              <div className="transaction-panel">
                <div className="panel-header">
                  <h4>Dados da venda</h4>
                  <p>Busque a ficha e ajuste a quantidade.</p>
                </div>
                <div className="sale-controls">
                  <div className="ficha-picker">
                    <label htmlFor="ficha-search">Ficha</label>
                    <input
                      id="ficha-search"
                      type="search"
                      value={fichaSearch}
                      onChange={(e) => setFichaSearch(e.target.value)}
                      placeholder="Buscar por número ou saldo"
                    />
                    <div className="ficha-options">
                      {filteredFichas.length > 0 ? (
                        filteredFichas.map((fichaItem) => {
                          const maxPorSaldo =
                            produtoPreco > 0
                              ? Math.trunc(fichaItem.saldo / produtoPreco)
                              : props.produto?.estoque || 0;
                          const disabled = maxPorSaldo < 1;
                          const selected = fichaItem.id === ficha;

                          return (
                            <button
                              key={fichaItem.id}
                              type="button"
                              className={
                                "ficha-option" +
                                (selected ? " selected" : "") +
                                (disabled ? " disabled" : "")
                              }
                              onClick={() => {
                                if (!disabled) setFicha(fichaItem.id);
                              }}
                              aria-pressed={selected}
                            >
                              <span>
                                <strong>#{fichaItem.numero}</strong>
                                <small>
                                  R${fichaItem.saldo.toFixed(2)}
                                </small>
                              </span>
                              <span className="ficha-capacity">
                                {disabled
                                  ? "Insuficiente"
                                  : `Até ${Math.min(
                                      maxPorSaldo,
                                      props.produto?.estoque || 0
                                    )} un.`}
                              </span>
                            </button>
                          );
                        })
                      ) : (
                        <p className="no-fichas">Nenhuma ficha encontrada</p>
                      )}
                    </div>
                  </div>

                  <div className="quantity-column">
                    {selectedFichaData && (
                      <div
                        className={
                          "affordability-message" +
                          (saldoDepoisDaVenda !== undefined &&
                          saldoDepoisDaVenda < 0
                            ? " error"
                            : "")
                        }
                      >
                        <span>Ficha #{selectedFichaData.numero}</span>
                        <strong>
                          {quantidadeMax > 0
                            ? `Até ${quantidadeMax} unidade${
                                quantidadeMax > 1 ? "s" : ""
                              }`
                            : "Saldo insuficiente"}
                        </strong>
                      </div>
                    )}

                    <div className="quantity-stepper" aria-label="Quantidade">
                      <span>Quantidade</span>
                      <div className="stepper-controls">
                        <Button
                          type="button"
                          color="var(--color-blue)"
                          opacity={quantidade <= 1}
                          onClick={() =>
                            setQuantidade((current) => Math.max(1, current - 1))
                          }
                        >
                          <FaMinus />
                        </Button>
                        <strong>{quantidade}</strong>
                        <Button
                          type="button"
                          color="var(--color-blue)"
                          opacity={quantidade >= quantidadeMax}
                          onClick={() =>
                            setQuantidade((current) =>
                              quantidadeMax > 0
                                ? Math.min(quantidadeMax, current + 1)
                                : current
                            )
                          }
                        >
                          <FaPlus />
                        </Button>
                      </div>
                      <small>
                        Máx. {quantidadeMax || 0} por saldo e estoque
                      </small>
                    </div>
                  </div>
                </div>
                <div className="checkout-summary">
                  <div>
                    <span>Total</span>
                    <strong>
                      {precoFinal ? <>R${precoFinal.toFixed(2)}</> : <>-</>}
                    </strong>
                  </div>
                  {selectedFichaData && saldoDepoisDaVenda !== undefined && (
                    <div>
                      <span>Saldo depois</span>
                      <strong
                        className={saldoDepoisDaVenda < 0 ? "danger" : ""}
                      >
                        R${saldoDepoisDaVenda.toFixed(2)}
                      </strong>
                    </div>
                  )}

                  <Button
                    type={vendaInvalida ? "button" : "submit"}
                    color="var(--color-green)"
                    loading={fetchingCreate}
                    opacity={vendaInvalida}
                  >
                    <p>Registrar venda</p>
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <Notice>
              <p>Produto sem estoque</p>
            </Notice>
          )}

          {hasError && (
            <Tag color="var(--color-red)" className="column">
              <p className="title center">Erro ao realizar venda</p>
            </Tag>
          )}
          {ultimaVenda && (
            <Tag color="var(--color-green)" className="column success-message">
              <div className="success-header">
                <div className="success-icon">
                  <FaCircleCheck />
                </div>
                <p className="success-title">Venda realizada com sucesso!</p>
              </div>
              <div className="success-details">
                <p className="detail-line">
                  <b>R${ultimaVenda.preco_total.toFixed(2)}</b> cobrado na ficha{" "}
                  <b>#{ultimaVenda.ficha.numero}</b>
                </p>
              </div>
            </Tag>
          )}
        </>
      )}
    </Popup>
  );
}
