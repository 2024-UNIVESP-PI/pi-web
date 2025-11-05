import { useState, useEffect, useMemo } from "react";
import { FaMoneyCheckDollar, FaEye, FaPlus, FaTrash } from "react-icons/fa6";
import fichaService, { Ficha, NovaFicha } from "../../services/fichaService";
import PageTitle from "../../components/PageTitle";
import Button from "../../components/Button";
import Popup from "../../components/Popup";
import Input from "../../components/Input";
import AdminFilters from "../../components/AdminFilters";
import Pagination from "../../components/Pagination";
import "./styles.scss";

export type Venda = {
  id: number;
  produto_nome: string;
  caixa_nome: string;
  quantidade: number;
  preco_total: number;
  data: string;
  ficha: {
    numero: number;
    saldo: number;
  };
};

export type Recarga = {
  id: number;
  ficha: number;
  ficha_numero: number;
  produto?: number;
  produto_nome?: string;
  caixa: number;
  caixa_nome: string;
  valor: number;
  data: string;
  observacoes?: string;
};

export type FichaHistorico = {
  ficha: Ficha & { deleted_at?: string; deleted_by_caixa_nome?: string };
  vendas: Venda[];
  recargas: Recarga[];
};

type SortOption =
  | "numero"
  | "numero_desc"
  | "saldo"
  | "saldo_desc"
  | "deleted"
  | "active";
type FilterStatus = "all" | "active" | "deleted";

export default function FichasAdminPage() {
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFicha, setSelectedFicha] = useState<Ficha | null>(null);
  const [historico, setHistorico] = useState<FichaHistorico | null>(null);
  const [showHistorico, setShowHistorico] = useState(false);
  const [showPopupNovo, setShowPopupNovo] = useState(false);
  const [showPopupDeletar, setShowPopupDeletar] = useState(false);
  const [fichaParaDeletar, setFichaParaDeletar] = useState<Ficha | null>(null);
  const [senhaAdmin, setSenhaAdmin] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("numero");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [formDataNovaFicha, setFormDataNovaFicha] = useState<{
    numero: string;
    saldo: string;
  }>({
    numero: "",
    saldo: "",
  });

  useEffect(() => {
    carregarFichas();
  }, []);

  async function carregarFichas() {
    try {
      setLoading(true);
      const response = await fichaService.getFichas();
      setFichas(response.data);
    } catch (error) {
      console.error("Erro ao carregar fichas:", error);
      alert("Erro ao carregar fichas");
    } finally {
      setLoading(false);
    }
  }

  async function carregarHistorico(ficha: Ficha) {
    try {
      const response = await fichaService.getFichaHistorico(ficha.id);
      setHistorico(response.data);
      setSelectedFicha(ficha);
      setShowHistorico(true);
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
      alert("Erro ao carregar histórico da ficha");
    }
  }

  function abrirPopupNovo() {
    setFormDataNovaFicha({ numero: "", saldo: "" });
    setShowPopupNovo(true);
  }

  async function handleCreateFicha(e: React.FormEvent) {
    e.preventDefault();

    // Converte strings para números
    const numeroNum = Number(formDataNovaFicha.numero);
    const saldoNum = Number(formDataNovaFicha.saldo);

    if (!formDataNovaFicha.numero || numeroNum <= 0) {
      alert("Número da ficha é obrigatório e deve ser maior que zero");
      return;
    }

    if (!formDataNovaFicha.saldo || saldoNum < 0) {
      alert("Saldo não pode ser negativo");
      return;
    }

    try {
      const novaFicha: NovaFicha = {
        numero: numeroNum,
        saldo: saldoNum,
      };
      await fichaService.postFicha(novaFicha);
      await carregarFichas();
      setShowPopupNovo(false);
      setFormDataNovaFicha({ numero: "", saldo: "" });
    } catch (error: unknown) {
      console.error("Erro ao criar ficha:", error);
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { detail?: string } } }).response
              ?.data?.detail
          : undefined;
      alert(errorMessage || "Erro ao criar ficha");
    }
  }

  function abrirPopupDeletar(ficha: Ficha) {
    setFichaParaDeletar(ficha);
    setSenhaAdmin("");
    setShowPopupDeletar(true);
  }

  async function handleDeletarFicha(e: React.FormEvent) {
    e.preventDefault();

    if (!senhaAdmin.trim()) {
      alert("Senha de administrador é obrigatória");
      return;
    }

    if (!fichaParaDeletar) return;

    try {
      await fichaService.deleteFicha(fichaParaDeletar.id, senhaAdmin);
      await carregarFichas();
      setShowPopupDeletar(false);
      setFichaParaDeletar(null);
      setSenhaAdmin("");
    } catch (error: unknown) {
      console.error("Erro ao deletar ficha:", error);
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { detail?: string } } }).response
              ?.data?.detail
          : undefined;
      alert(errorMessage || "Erro ao deletar ficha");
    }
  }

  function formatarData(data: string) {
    if (!data) return "-";
    const date = new Date(data);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Filtros e ordenação
  const filteredAndSortedFichas = useMemo(() => {
    let filtered = [...fichas];

    // Busca por número
    if (searchTerm.trim()) {
      const search = searchTerm.trim();
      filtered = filtered.filter((f) => String(f.numero).includes(search));
    }

    // Filtro por status
    if (filterStatus === "active") {
      filtered = filtered.filter((f) => f.is_active);
    } else if (filterStatus === "deleted") {
      filtered = filtered.filter((f) => !f.is_active);
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "numero":
          return a.numero - b.numero;
        case "numero_desc":
          return b.numero - a.numero;
        case "saldo":
          return Number(a.saldo) - Number(b.saldo);
        case "saldo_desc":
          return Number(b.saldo) - Number(a.saldo);
        case "deleted":
          // Deletadas primeiro
          if (a.is_active && !b.is_active) return 1;
          if (!a.is_active && b.is_active) return -1;
          return a.numero - b.numero;
        case "active":
          // Ativas primeiro
          if (!a.is_active && b.is_active) return 1;
          if (a.is_active && !b.is_active) return -1;
          return a.numero - b.numero;
        default:
          return 0;
      }
    });

    return filtered;
  }, [fichas, searchTerm, sortBy, filterStatus]);

  // Paginação
  const paginatedFichas = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedFichas.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedFichas, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedFichas.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, filterStatus]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCurrentPage(1);
  }

  function clearFilters() {
    setSearchTerm("");
    setSortBy("numero");
    setFilterStatus("all");
    setCurrentPage(1);
  }

  if (loading) {
    return (
      <div className="fichas-admin-page">
        <PageTitle title="Carregando..." subtitle="Aguarde..." />
      </div>
    );
  }

  return (
    <div className="fichas-admin-page">
      <div className="page-header">
        <PageTitle
          title="Gerenciar Fichas (Admin)"
          subtitle="Visualize o histórico completo de movimentações de cada ficha"
        />
        <Button
          onClick={abrirPopupNovo}
          color="var(--color-green)"
          className="new-ficha-button"
        >
          <FaPlus /> Nova Ficha
        </Button>
      </div>

      <AdminFilters
        searchValue={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        onSearchSubmit={handleSearchSubmit}
        searchPlaceholder="Buscar por número da ficha..."
        sortOptions={[
          { value: "numero", label: "Número (Menor)" },
          { value: "numero_desc", label: "Número (Maior)" },
          { value: "saldo", label: "Saldo (Menor)" },
          { value: "saldo_desc", label: "Saldo (Maior)" },
          { value: "active", label: "Ativas Primeiro" },
          { value: "deleted", label: "Deletadas Primeiro" },
        ]}
        sortValue={sortBy}
        onSortChange={(e) => setSortBy(e.target.value as SortOption)}
        filterOptions={[
          {
            label: "Status",
            value: filterStatus,
            onChange: (e) => setFilterStatus(e.target.value as FilterStatus),
            options: [
              { value: "all", label: "Todas" },
              { value: "active", label: "Ativas" },
              { value: "deleted", label: "Deletadas" },
            ],
          },
        ]}
        onClearFilters={clearFilters}
      />

      <div className="fichas-table-container">
        <table className="fichas-table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Saldo</th>
              <th>Status</th>
              <th>Deletada em</th>
              <th>Deletada por</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {paginatedFichas.map((ficha) => (
              <tr
                key={ficha.id}
                className={!ficha.is_active ? "deleted-row" : ""}
              >
                <td className="numero-cell">
                  <strong>#{ficha.numero}</strong>
                </td>
                <td>R$ {Number(ficha.saldo).toFixed(2)}</td>
                <td>
                  {ficha.is_active ? (
                    <span className="status-active">Ativa</span>
                  ) : (
                    <span className="status-deleted">Deletada</span>
                  )}
                </td>
                <td>
                  {ficha.deleted_at ? formatarData(ficha.deleted_at) : "-"}
                </td>
                <td>{ficha.deleted_by_caixa_nome || "-"}</td>
                <td className="actions-cell">
                  <div className="ficha-actions">
                    <Button
                      onClick={() => carregarHistorico(ficha)}
                      color="var(--color-blue)"
                      className="small"
                    >
                      <FaEye /> Ver Histórico
                    </Button>
                    {ficha.is_active && (
                      <Button
                        onClick={() => abrirPopupDeletar(ficha)}
                        color="var(--color-red)"
                        className="small"
                      >
                        <FaTrash /> Deletar
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedFichas.length === 0 && (
        <div className="empty-state">
          <FaMoneyCheckDollar size={64} />
          <p>
            {fichas.length === 0
              ? "Nenhuma ficha cadastrada"
              : "Nenhuma ficha encontrada com os filtros aplicados"}
          </p>
        </div>
      )}

      {filteredAndSortedFichas.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filteredAndSortedFichas.length}
        />
      )}

      {showHistorico && historico && selectedFicha && (
        <Popup
          visible={showHistorico}
          setVisible={setShowHistorico}
          id="popup-historico-ficha"
          icon={<FaMoneyCheckDollar />}
          title={`Histórico - Ficha #${historico.ficha.numero}`}
        >
          <div className="historico-content">
            <div className="ficha-info">
              <h4>Informações da Ficha</h4>
              <p>
                <strong>Número:</strong> {historico.ficha.numero}
              </p>
              <p>
                <strong>Saldo Atual:</strong> R${" "}
                {Number(historico.ficha.saldo).toFixed(2)}
              </p>
              {historico.ficha.deleted_at && (
                <>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span className="deleted-badge">DELETADA</span>
                  </p>
                  <p>
                    <strong>Deletada em:</strong>{" "}
                    {formatarData(historico.ficha.deleted_at)}
                  </p>
                  {historico.ficha.deleted_by_caixa_nome && (
                    <p>
                      <strong>Deletada por:</strong>{" "}
                      {historico.ficha.deleted_by_caixa_nome}
                    </p>
                  )}
                </>
              )}
            </div>

            <div className="vendas-section">
              <h4>Histórico de Vendas</h4>
              {historico.vendas && historico.vendas.length > 0 ? (
                <div className="vendas-table">
                  <div className="table-header">
                    <span>Data/Hora</span>
                    <span>Produto</span>
                    <span>Quantidade</span>
                    <span>Caixa</span>
                    <span>Total</span>
                  </div>
                  {historico.vendas.map((venda) => (
                    <div key={venda.id} className="table-row">
                      <span>{formatarData(venda.data)}</span>
                      <span>{venda.produto_nome}</span>
                      <span>{venda.quantidade}</span>
                      <span>{venda.caixa_nome}</span>
                      <span>R$ {Number(venda.preco_total).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">Nenhuma venda registrada</p>
              )}
            </div>

            <div className="recargas-section">
              <h4>Histórico de Recargas</h4>
              {historico.recargas && historico.recargas.length > 0 ? (
                <table className="historico-table">
                  <thead>
                    <tr>
                      <th>Data/Hora</th>
                      <th>Produto</th>
                      <th>Caixa</th>
                      <th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historico.recargas.map((recarga) => (
                      <tr key={recarga.id}>
                        <td>{formatarData(recarga.data)}</td>
                        <td>{recarga.produto_nome || "-"}</td>
                        <td>{recarga.caixa_nome}</td>
                        <td>R$ {Number(recarga.valor).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="no-data">Nenhuma recarga registrada</p>
              )}
            </div>
          </div>
        </Popup>
      )}

      {showPopupNovo && (
        <Popup
          visible={showPopupNovo}
          setVisible={setShowPopupNovo}
          id="popup-nova-ficha"
          icon={<FaMoneyCheckDollar />}
          title="Nova Ficha"
        >
          <form onSubmit={handleCreateFicha} className="ficha-form">
            <Input
              id="numero"
              type="intenger"
              inputMode="numeric"
              label="Número da Ficha"
              value={formDataNovaFicha.numero}
              onChange={(e) => {
                // Permite campo vazio e apenas números
                const value = e.target.value.replace(/\D/g, "");
                setFormDataNovaFicha({
                  ...formDataNovaFicha,
                  numero: value,
                });
              }}
              placeholder="Ex: 1"
              min={1}
              required
            />

            <Input
              id="saldo"
              type="number"
              inputMode="decimal"
              label="Saldo Inicial"
              value={formDataNovaFicha.saldo}
              onChange={(e) => {
                // Permite campo vazio ou valor numérico válido
                const value = e.target.value;
                if (value === "" || value === ".") {
                  setFormDataNovaFicha({
                    ...formDataNovaFicha,
                    saldo: value,
                  });
                } else {
                  // Remove caracteres não numéricos exceto ponto decimal
                  const cleaned = value.replace(/[^0-9.]/g, "");
                  // Garante apenas um ponto decimal
                  const parts = cleaned.split(".");
                  const finalValue =
                    parts.length > 2
                      ? parts[0] + "." + parts.slice(1).join("")
                      : cleaned;
                  setFormDataNovaFicha({
                    ...formDataNovaFicha,
                    saldo: finalValue === "0" ? "" : finalValue,
                  });
                }
              }}
              placeholder="0.00"
              step={0.01}
              min={0}
              required
            />

            <div className="form-actions">
              <Button
                type="button"
                onClick={() => setShowPopupNovo(false)}
                color="var(--color-gray)"
              >
                Cancelar
              </Button>
              <Button type="submit" color="var(--color-green)">
                Criar Ficha
              </Button>
            </div>
          </form>
        </Popup>
      )}

      {showPopupDeletar && fichaParaDeletar && (
        <Popup
          visible={showPopupDeletar}
          setVisible={setShowPopupDeletar}
          id="popup-deletar-ficha"
          icon={<FaTrash />}
          title="Deletar Ficha"
        >
          <form onSubmit={handleDeletarFicha} className="ficha-form">
            <p>
              Tem certeza que deseja deletar a ficha{" "}
              <strong>#{fichaParaDeletar.numero}</strong>?
            </p>
            <p className="warning">
              Esta ação requer senha de administrador e não pode ser desfeita.
            </p>

            <Input
              id="senha-admin"
              type="password"
              label="Senha de Administrador"
              value={senhaAdmin}
              onChange={(e) => setSenhaAdmin(e.target.value)}
              placeholder="Digite a senha de administrador"
              required
            />

            <div className="form-actions">
              <Button
                type="button"
                onClick={() => {
                  setShowPopupDeletar(false);
                  setFichaParaDeletar(null);
                  setSenhaAdmin("");
                }}
                color="var(--color-gray)"
              >
                Cancelar
              </Button>
              <Button type="submit" color="var(--color-red)">
                Deletar Ficha
              </Button>
            </div>
          </form>
        </Popup>
      )}
    </div>
  );
}
