import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  FaArrowUp,
  FaMagnifyingGlass,
  FaMoneyBillTransfer,
  FaReceipt,
  FaTriangleExclamation,
  FaWallet,
} from "react-icons/fa6";

import PageTitle from "../../components/PageTitle";
import ActivityIndicator from "../../components/ActivityIndicator";
import Button from "../../components/Button";
import {
  formatCurrency,
  formatInteger,
} from "../../functions/formatters";
import movimentacaoFinanceiraService, {
  MovimentacaoFinanceira,
  MovimentacaoFinanceiraTipo,
  MovimentacoesFinanceirasSummary,
} from "../../services/movimentacaoFinanceiraService";
import "./styles.scss";

type TipoFiltro = "all" | MovimentacaoFinanceiraTipo;

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const emptySummary: MovimentacoesFinanceirasSummary = {
  entradas: 0,
  saidas: 0,
  receita_reconhecida: 0,
  saldo_movimentado: 0,
  saldo_fichas: 0,
  caixa_disponivel: 0,
  diferenca_conciliacao: 0,
  total_movimentacoes: 0,
};

export default function MovimentacoesAdminPage() {
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoFinanceira[]>(
    []
  );
  const [summary, setSummary] =
    useState<MovimentacoesFinanceirasSummary>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<TipoFiltro>("all");

  async function carregarMovimentacoes() {
    try {
      setLoading(true);
      setError(false);
      const response =
        await movimentacaoFinanceiraService.getMovimentacoesFinanceiras();
      setMovimentacoes(response.data.movimentacoes);
      setSummary(response.data.summary);
    } catch (err) {
      console.error("Erro ao carregar movimentações:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarMovimentacoes();
  }, []);

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
  }

  const filteredMovimentacoes = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return movimentacoes.filter((movimentacao) => {
      if (tipoFiltro !== "all" && movimentacao.tipo !== tipoFiltro) {
        return false;
      }

      if (!searchText) return true;

      return [
        movimentacao.descricao,
        movimentacao.caixa_nome,
        movimentacao.produto_nome || "",
        String(movimentacao.ficha_numero),
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchText);
    });
  }, [movimentacoes, search, tipoFiltro]);

  if (loading) {
    return (
      <div id="movimentacoes-admin-page">
        <PageTitle title="Movimentações" subtitle="Carregando extrato..." />
        <ActivityIndicator margin />
      </div>
    );
  }

  if (error) {
    return (
      <div id="movimentacoes-admin-page">
        <div className="movimentacoes-state error">
          <FaTriangleExclamation />
          <strong>Não foi possível carregar as movimentações</strong>
          <Button onClick={carregarMovimentacoes} color="var(--color-blue)">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div id="movimentacoes-admin-page">
      <div className="page-header">
        <PageTitle
          title="Movimentações"
          subtitle="Visão econômica de caixa, receita reconhecida e saldo ainda carregado em fichas"
        />
        <Button onClick={carregarMovimentacoes} color="var(--color-blue)">
          Atualizar
        </Button>
      </div>

      <section className="money-summary" aria-label="Resumo financeiro">
        <div className="summary-card entradas">
          <span>
            <FaArrowUp /> Caixa recebido
          </span>
          <strong>{formatCurrency(summary.entradas)}</strong>
          <small>Recargas feitas nas fichas</small>
        </div>
        <div className="summary-card receita">
          <span>
            <FaReceipt /> Receita reconhecida
          </span>
          <strong>
            {formatCurrency(summary.receita_reconhecida ?? summary.saidas)}
          </strong>
          <small>Vendas consumidas nas fichas</small>
        </div>
        <div className="summary-card saldo-fichas">
          <span>
            <FaWallet /> Saldo em fichas
          </span>
          <strong>{formatCurrency(summary.saldo_fichas)}</strong>
          <small>Obrigação com clientes</small>
        </div>
        <div className="summary-card saldo">
          <span>
            <FaMoneyBillTransfer /> Caixa disponível
          </span>
          <strong>
            {formatCurrency(
              summary.caixa_disponivel ?? summary.saldo_movimentado
            )}
          </strong>
          <small>Caixa recebido menos saldo em fichas</small>
        </div>
        <div className="summary-card">
          <span>
            <FaReceipt /> Movimentações
          </span>
          <strong>{formatInteger(summary.total_movimentacoes)}</strong>
        </div>
      </section>

      <section className="ledger-tools">
        <form onSubmit={handleSearchSubmit} className="ledger-search">
          <FaMagnifyingGlass />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por ficha, caixa, produto ou descrição"
          />
        </form>

        <div className="tipo-filter" aria-label="Filtrar por tipo">
          <button
            type="button"
            className={tipoFiltro === "all" ? "active" : ""}
            onClick={() => setTipoFiltro("all")}
          >
            Todas
          </button>
          <button
            type="button"
            className={tipoFiltro === "recarga" ? "active" : ""}
            onClick={() => setTipoFiltro("recarga")}
          >
            Recargas
          </button>
          <button
            type="button"
            className={tipoFiltro === "venda" ? "active" : ""}
            onClick={() => setTipoFiltro("venda")}
          >
            Vendas
          </button>
        </div>
      </section>

      <section className="ledger-panel">
        <div className="ledger-header">
          <div>
            <FaMoneyBillTransfer />
            <strong>Extrato</strong>
          </div>
          <span>{filteredMovimentacoes.length} registro(s)</span>
        </div>

        <div className="ledger-table">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Ficha</th>
                <th>Descrição</th>
                <th>Caixa</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovimentacoes.map((movimentacao) => (
                <tr key={movimentacao.id}>
                  <td data-label="Data">{formatDateTime(movimentacao.data)}</td>
                  <td data-label="Tipo">
                    <span className={`type-pill ${movimentacao.tipo}`}>
                      {movimentacao.tipo === "recarga" ? "Recarga" : "Receita"}
                    </span>
                  </td>
                  <td data-label="Ficha">#{movimentacao.ficha_numero}</td>
                  <td data-label="Descrição">
                    <strong>{movimentacao.descricao}</strong>
                    {movimentacao.quantidade && movimentacao.produto_nome && (
                      <small>
                        {movimentacao.quantidade}x {movimentacao.produto_nome}
                      </small>
                    )}
                  </td>
                  <td data-label="Caixa">{movimentacao.caixa_nome}</td>
                  <td
                    data-label="Valor"
                    className={`money-value ${movimentacao.direcao}`}
                  >
                    {movimentacao.direcao === "entrada" ? "+" : ""}
                    {formatCurrency(movimentacao.valor)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMovimentacoes.length === 0 && (
          <div className="movimentacoes-state">
            <FaReceipt />
            <strong>Nenhuma movimentação encontrada</strong>
            <p>Ajuste os filtros para ver outros registros.</p>
          </div>
        )}
      </section>
    </div>
  );
}
