import { useState, useEffect, FormEvent, useCallback } from "react";
import { useParams } from "react-router-dom";
import reservaService, {
  QRCodeProdutosResponse,
  ReservaPublicaResponse,
} from "../../services/reservaService";
import { formatCurrency } from "../../functions/formatters";
import "./styles.scss";

export default function ReservaPublicaPage() {
  const { qrCode } = useParams<{ qrCode: string }>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [dadosQR, setDadosQR] = useState<QRCodeProdutosResponse>();
  const [produtosSelecionados, setProdutosSelecionados] = useState<
    Map<number, number>
  >(new Map());
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [cpf, setCpf] = useState("");
  const [reservaConfirmada, setReservaConfirmada] =
    useState<ReservaPublicaResponse>();
  const [submitting, setSubmitting] = useState(false);

  const carregarProdutos = useCallback(async () => {
    if (!qrCode) return;

    try {
      setLoading(true);
      setError(undefined);
      const dados = await reservaService.getProdutosReserva(qrCode);
      setDadosQR(dados);
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data
              ?.error
          : undefined;
      setError(errorMessage || "Erro ao carregar produtos disponíveis");
    } finally {
      setLoading(false);
    }
  }, [qrCode]);

  useEffect(() => {
    if (qrCode) {
      carregarProdutos();
    } else {
      setError("QR Code não fornecido");
      setLoading(false);
    }
  }, [qrCode, carregarProdutos]);

  function atualizarQuantidade(produtoId: number, quantidade: number) {
    const produto = dadosQR?.produtos.find((p) => p.id === produtoId);
    const quantidadeSegura = produto
      ? Math.min(quantidade, produto.limite_reserva, produto.disponivel)
      : quantidade;
    const novos = new Map(produtosSelecionados);
    if (quantidadeSegura <= 0) {
      novos.delete(produtoId);
    } else {
      novos.set(produtoId, quantidadeSegura);
    }
    setProdutosSelecionados(novos);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!nomeCompleto.trim() || !cpf.trim()) {
      setError("Por favor, preencha nome completo e CPF");
      return;
    }

    if (cpf.length !== 11 || !/^\d+$/.test(cpf)) {
      setError("CPF deve conter exatamente 11 dígitos numéricos");
      return;
    }

    if (produtosSelecionados.size === 0) {
      setError("Selecione pelo menos um produto");
      return;
    }

    for (const [produtoId, quantidade] of produtosSelecionados.entries()) {
      const produto = dadosQR?.produtos.find((item) => item.id === produtoId);
      if (!produto || quantidade > produto.disponivel) {
        setError(
          "Algum produto selecionado não está mais disponível. Atualize a página e tente novamente."
        );
        return;
      }
    }

    try {
      setSubmitting(true);
      setError(undefined);

      const produtos = Array.from(produtosSelecionados.entries()).map(
        ([produto_id, quantidade]) => ({
          produto_id,
          quantidade,
        })
      );

      const resultado = await reservaService.criarReservaPublica({
        nome_completo: nomeCompleto.trim(),
        cpf: cpf.replace(/\D/g, ""),
        produtos,
        qr_code: qrCode,
      });

      setReservaConfirmada(resultado);
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data
              ?.error
          : undefined;
      setError(errorMessage || "Erro ao criar reserva");
    } finally {
      setSubmitting(false);
    }
  }

  function formatarCPF(value: string) {
    const numeros = value.replace(/\D/g, "");
    if (numeros.length <= 3) return numeros;
    if (numeros.length <= 6)
      return `${numeros.slice(0, 3)}.${numeros.slice(3)}`;
    if (numeros.length <= 9)
      return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(
        6
      )}`;
    return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(
      6,
      9
    )}-${numeros.slice(9, 11)}`;
  }

  function calcularTotal() {
    if (!dadosQR) return 0;
    let total = 0;
    produtosSelecionados.forEach((quantidade, produtoId) => {
      const produto = dadosQR.produtos.find((p) => p.id === produtoId);
      if (produto) {
        total += produto.preco * quantidade;
      }
    });
    return total;
  }

  if (loading) {
    return (
      <div className="reserva-publica-page">
        <div className="container">
          <div className="loading">Carregando...</div>
        </div>
      </div>
    );
  }

  if (reservaConfirmada) {
    return (
      <div className="reserva-publica-page">
        <div className="container">
          <div className="reserva-confirmada">
            <div className="success-icon">✓</div>
            <h1>Reserva Confirmada!</h1>
            <p className="nome-cliente">
              Olá, <strong>{reservaConfirmada.nome_completo}</strong>
            </p>

            <div className="resumo-reserva">
              <h2>Resumo da Reserva</h2>
              <div className="itens-reserva">
                {reservaConfirmada.reservas.map((item) => (
                  <div key={item.id} className="item-reserva">
                    <div className="item-info">
                      <span className="item-nome">{item.produto}</span>
                      <span className="item-quantidade">
                        {item.quantidade}x
                      </span>
                    </div>
                    <div className="item-valores">
                      <span className="item-preco-unitario">
                        {formatCurrency(item.preco_unitario)} cada
                      </span>
                      <span className="item-preco-total">
                        {formatCurrency(item.preco_total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="total-reserva">
                <span className="total-label">Total:</span>
                <span className="total-value">{formatCurrency(reservaConfirmada.total)}</span>
              </div>

              <div className="info-importante">
                <p>
                  <strong>Importante:</strong> Capture uma foto desta tela ou
                  faça um screenshot para apresentar ao caixa no dia do evento.
                </p>
                <p className="cpf-info">CPF: {reservaConfirmada.cpf}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reserva-publica-page">
      <div className="container">
        <header className="page-header">
          <h1>Reserva Antecipada</h1>
          {dadosQR?.descricao && (
            <p className="descricao-qr">{dadosQR.descricao}</p>
          )}
          {dadosQR?.data_inicio && (
            <p className="inicio">
              Início: {new Date(dadosQR.data_inicio).toLocaleString("pt-BR")}
            </p>
          )}
          {dadosQR?.data_expiracao && (
            <p className="expiracao">
              Válido até:{" "}
              {new Date(dadosQR.data_expiracao).toLocaleString("pt-BR")}
            </p>
          )}
        </header>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {dadosQR && (
          <form onSubmit={handleSubmit} className="reserva-form">
            <div className="dados-pessoais">
              <h2>Seus Dados</h2>
              <div className="form-group">
                <label htmlFor="nome">Nome Completo *</label>
                <input
                  type="text"
                  id="nome"
                  value={nomeCompleto}
                  onChange={(e) => setNomeCompleto(e.target.value)}
                  required
                  placeholder="Digite seu nome completo"
                />
              </div>
              <div className="form-group">
                <label htmlFor="cpf">CPF *</label>
                <input
                  type="text"
                  id="cpf"
                  value={formatarCPF(cpf)}
                  onChange={(e) => setCpf(e.target.value.replace(/\D/g, ""))}
                  required
                  maxLength={14}
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            <div className="produtos-disponiveis">
              <h2>Produtos Disponíveis</h2>
              <p className="section-helper">
                Escolha os itens que deseja reservar. A quantidade respeita o
                limite por pessoa e a cota disponível.
              </p>
              <div className="produtos-grid">
                {dadosQR.produtos
                  .slice()
                  .sort(
                    (a, b) =>
                      Number(b.disponivel > 0) - Number(a.disponivel > 0)
                  )
                  .map((produto) => {
                  const quantidade = produtosSelecionados.get(produto.id) || 0;
                  const disponivel = produto.disponivel > 0;

                  return (
                    <div
                      key={produto.id}
                      className={`produto-card ${
                        !disponivel ? "indisponivel" : ""
                      }`}
                    >
                      <div className="produto-info">
                        <h3>{produto.nome}</h3>
                        <p className="produto-preco">
                          {formatCurrency(produto.preco)}
                        </p>
                        <p className="produto-disponivel">
                          Disponível: {produto.disponivel} unidades
                        </p>
                        <p className="produto-limite">
                          Limite: {produto.limite_reserva} por pessoa
                        </p>
                        {produto.reservado > 0 && (
                          <p className="produto-reservado">
                            {produto.reservado} já reservado(s)
                          </p>
                        )}
                      </div>

                      {disponivel && (
                        <div className="produto-controle">
                          <button
                            type="button"
                            onClick={() =>
                              atualizarQuantidade(
                                produto.id,
                                Math.max(0, quantidade - 1)
                              )
                            }
                            disabled={quantidade === 0}
                            className="btn-quantidade"
                          >
                            -
                          </button>
                          <span className="quantidade">{quantidade}</span>
                          <button
                            type="button"
                            onClick={() =>
                              atualizarQuantidade(
                                produto.id,
                                Math.min(
                                  produto.limite_reserva,
                                  produto.disponivel,
                                  quantidade + 1
                                )
                              )
                            }
                            disabled={
                              quantidade >= produto.limite_reserva ||
                              quantidade >= produto.disponivel
                            }
                            className="btn-quantidade"
                          >
                            +
                          </button>
                        </div>
                      )}

                      {quantidade > 0 && (
                        <div className="produto-subtotal">
                          Subtotal: {formatCurrency(produto.preco * quantidade)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {produtosSelecionados.size > 0 && (
              <div className="resumo-pedido">
                <h2>Resumo do Pedido</h2>
                <p className="section-helper">
                  {produtosSelecionados.size} produto(s) selecionado(s)
                </p>
                <div className="itens-selecionados">
                  {Array.from(produtosSelecionados.entries()).map(
                    ([produtoId, quantidade]) => {
                      const produto = dadosQR.produtos.find(
                        (p) => p.id === produtoId
                      );
                      if (!produto) return null;

                      return (
                        <div key={produtoId} className="item-selecionado">
                          <span>
                            {produto.nome} x{quantidade}
                          </span>
                          <span>
                            {formatCurrency(produto.preco * quantidade)}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
                <div className="total-pedido">
                  <span>Total:</span>
                  <span>{formatCurrency(calcularTotal())}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || produtosSelecionados.size === 0}
              className="btn-confirmar"
            >
              {submitting ? "Confirmando..." : "Confirmar Reserva"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
