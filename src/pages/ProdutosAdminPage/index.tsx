import { useState, useEffect, useMemo } from "react";
import { FaBoxOpen, FaTrash, FaPen, FaPlus, FaQrcode } from "react-icons/fa6";
import produtoService, { Produto } from "../../services/produtoService";
import PageTitle from "../../components/PageTitle";
import Button from "../../components/Button";
import Popup from "../../components/Popup";
import Input from "../../components/Input";
import AdminFilters from "../../components/AdminFilters";
import Pagination from "../../components/Pagination";
import useCaixas from "../../hooks/useCaixas";
import PopupNovoProduto from "../../components/Popup/PopupNovoProduto";
import PopupReservasProduto from "../../components/Popup/PopupReservasProduto";
import "./styles.scss";
import "../admin-tables.scss";

type SortOption =
  | "nome"
  | "preco"
  | "estoque"
  | "nome_desc"
  | "preco_desc"
  | "estoque_desc";
type FilterReserva = "all" | "sim" | "nao";
type FilterEstoque = "all" | "baixo" | "medio" | "alto";
type FilterCategoria = "all" | string;

const CATEGORIA_LABELS: Record<string, string> = {
  doce: "Doce",
  doces: "Doces",
  salgado: "Salgado",
  salgados: "Salgados",
  bebida: "Bebida",
  bebidas: "Bebidas",
  jogo: "Jogo",
  jogos: "Jogos",
};

function getCategoriaLabel(categoria?: string) {
  if (!categoria) return "Sem categoria";
  return CATEGORIA_LABELS[categoria] || categoria;
}

export default function ProdutosAdminPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("nome");
  const [filterReserva, setFilterReserva] = useState<FilterReserva>("all");
  const [filterEstoque, setFilterEstoque] = useState<FilterEstoque>("all");
  const [filterCategoria, setFilterCategoria] =
    useState<FilterCategoria>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [formData, setFormData] = useState<{
    nome: string;
    preco: string;
    medida: string;
    categoria: string;
    estoque: string;
  }>({
    nome: "",
    preco: "",
    medida: "",
    categoria: "doces",
    estoque: "",
  });

  const [showPopupNovo, setShowPopupNovo] = useState(false);
  const [showPopupReservas, setShowPopupReservas] = useState(false);
  const [produtoReservas, setProdutoReservas] = useState<Produto | null>(null);
  const { caixas } = useCaixas();

  const CATEGORIA_CHOICES = [
    ["doces", "Doces"],
    ["salgados", "Salgados"],
    ["bebidas", "Bebidas"],
    ["jogos", "Jogos"],
  ];

  const MEDIDA_CHOICES = [
    ["UN", "Unidade"],
    ["PCT", "Pacote"],
    ["L", "Litro"],
    ["KG", "Quilograma"],
  ];

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function carregarProdutos() {
    try {
      setLoading(true);
      const response = await produtoService.getProdutos();
      // Mostra todos os produtos, incluindo os sem estoque
      setProdutos(response.data);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      alert("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  }

  function abrirPopupEditar(produto: Produto) {
    setSelectedProduto(produto);
    setFormData({
      nome: produto.nome,
      preco: String(produto.preco),
      medida: produto.medida,
      categoria: produto.categoria || "doces",
      estoque: String(produto.estoque),
    });
    setShowPopup(true);
  }

  function abrirPopupReservas(produto: Produto) {
    setProdutoReservas(produto);
    setShowPopupReservas(true);
  }

  function abrirPopupNovo() {
    setSelectedProduto(null);
    setFormData({
      nome: "",
      preco: "",
      medida: "UN",
      categoria: "doces",
      estoque: "",
    });
    setShowPopupNovo(true);
  }

  async function handleCreateProduto() {
    await carregarProdutos();
    setShowPopupNovo(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validações
    if (!formData.nome.trim()) {
      alert("Nome é obrigatório");
      return;
    }

    const precoNumber = Number(formData.preco);
    if (!formData.preco || isNaN(precoNumber) || precoNumber < 0) {
      alert("Preço inválido");
      return;
    }

    if (!formData.medida.trim()) {
      alert("Medida é obrigatória");
      return;
    }

    // Valida estoque
    if (formData.estoque === "") {
      alert("Estoque é obrigatório");
      return;
    }
    const estoqueNumber = Number(formData.estoque);
    if (isNaN(estoqueNumber) || estoqueNumber < 0) {
      alert("Estoque deve ser um número válido (≥ 0)");
      return;
    }

    try {
      if (selectedProduto) {
        // Editar
        const updateData: Partial<Produto> = {
          nome: formData.nome.trim(),
          preco: precoNumber,
          medida: formData.medida.trim(),
          categoria: formData.categoria,
          estoque: estoqueNumber,
        };
        await produtoService.patchProduto(selectedProduto.id, updateData);
      } else {
        // Criar - não deve chegar aqui, pois criação usa PopupNovoProduto
        alert("Para criar produtos, use o botão 'Novo Produto'");
        return;
      }
      await carregarProdutos();
      setShowPopup(false);
    } catch (error: unknown) {
      console.error("Erro ao salvar produto:", error);
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { error?: string } } }).response
              ?.data?.error
          : undefined;
      alert(errorMessage || "Erro ao salvar produto");
    }
  }

  async function handleDeletar(id: number) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    try {
      await produtoService.deleteProduto(id);
      await carregarProdutos();
    } catch (error) {
      console.error("Erro ao deletar produto:", error);
      alert("Erro ao deletar produto");
    }
  }

  // Filtros e ordenação
  const filteredAndSortedProdutos = useMemo(() => {
    let filtered = [...produtos];

    // Busca por nome
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((p) => p.nome.toLowerCase().includes(search));
    }

    // Filtro por disponível para reserva
    if (filterReserva === "sim") {
      filtered = filtered.filter((p) => p.disponivel_reserva);
    } else if (filterReserva === "nao") {
      filtered = filtered.filter((p) => !p.disponivel_reserva);
    }

    // Filtro por categoria
    if (filterCategoria !== "all") {
      filtered = filtered.filter((p) => p.categoria === filterCategoria);
    }

    // Filtro por estoque
    if (filterEstoque !== "all") {
      filtered = filtered.filter((p) => {
        if (filterEstoque === "baixo") return p.estoque < 50;
        if (filterEstoque === "medio")
          return p.estoque >= 50 && p.estoque < 200;
        if (filterEstoque === "alto") return p.estoque >= 200;
        return true;
      });
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "nome":
          return a.nome.localeCompare(b.nome);
        case "nome_desc":
          return b.nome.localeCompare(a.nome);
        case "preco":
          return a.preco - b.preco;
        case "preco_desc":
          return b.preco - a.preco;
        case "estoque":
          return a.estoque - b.estoque;
        case "estoque_desc":
          return b.estoque - a.estoque;
        default:
          return 0;
      }
    });

    return filtered;
  }, [
    produtos,
    searchTerm,
    sortBy,
    filterReserva,
    filterEstoque,
    filterCategoria,
  ]);

  // Paginação
  const paginatedProdutos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedProdutos.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [filteredAndSortedProdutos, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedProdutos.length / itemsPerPage);
  const produtosComEstoqueBaixo = produtos.filter((p) => p.estoque < 50).length;
  const produtosParaReserva = produtos.filter((p) => p.disponivel_reserva).length;
  const categoriaFilterOptions = useMemo(() => {
    const categorias = Array.from(
      new Set(
        produtos
          .map((produto) => produto.categoria)
          .filter((categoria): categoria is string => Boolean(categoria))
      )
    ).sort((a, b) => getCategoriaLabel(a).localeCompare(getCategoriaLabel(b)));

    return categorias.map((categoria) => ({
      value: categoria,
      label: getCategoriaLabel(categoria),
    }));
  }, [produtos]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, filterReserva, filterEstoque, filterCategoria]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCurrentPage(1);
  }

  function clearFilters() {
    setSearchTerm("");
    setSortBy("nome");
    setFilterReserva("all");
    setFilterEstoque("all");
    setFilterCategoria("all");
    setCurrentPage(1);
  }

  if (loading) {
    return (
      <div className="produtos-admin-page">
        <PageTitle title="Carregando..." subtitle="Aguarde..." />
      </div>
    );
  }

  return (
    <div className="produtos-admin-page">
      <div className="page-header">
        <PageTitle
          title="Gerenciar Produtos (Admin)"
          subtitle="Configure produtos e disponibilidade para reservas antecipadas"
        />
        <Button
          onClick={abrirPopupNovo}
          color="var(--color-green)"
          className="new-product-button"
        >
          <FaPlus /> Novo Produto
        </Button>
      </div>

      <section className="admin-summary" aria-label="Resumo de produtos">
        <div className="summary-item">
          <span className="summary-label">Produtos</span>
          <strong>{produtos.length}</strong>
        </div>
        <div className="summary-item">
          <span className="summary-label">Estoque baixo</span>
          <strong>{produtosComEstoqueBaixo}</strong>
        </div>
        <div className="summary-item">
          <span className="summary-label">Com reserva</span>
          <strong>{produtosParaReserva}</strong>
        </div>
        <div className="summary-item">
          <span className="summary-label">Exibindo</span>
          <strong>{filteredAndSortedProdutos.length}</strong>
        </div>
      </section>

      <AdminFilters
        searchValue={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        onSearchSubmit={handleSearchSubmit}
        searchPlaceholder="Buscar por nome do produto..."
        sortOptions={[
          { value: "nome", label: "Nome (A-Z)" },
          { value: "nome_desc", label: "Nome (Z-A)" },
          { value: "preco", label: "Preço (Menor)" },
          { value: "preco_desc", label: "Preço (Maior)" },
          { value: "estoque", label: "Estoque (Menor)" },
          { value: "estoque_desc", label: "Estoque (Maior)" },
        ]}
        sortValue={sortBy}
        onSortChange={(e) => setSortBy(e.target.value as SortOption)}
        filterOptions={[
          {
            label: "Reserva",
            value: filterReserva,
            onChange: (e) => setFilterReserva(e.target.value as FilterReserva),
            options: [
              { value: "all", label: "Todos" },
              { value: "sim", label: "Disponível" },
              { value: "nao", label: "Indisponível" },
            ],
          },
          {
            label: "Categoria",
            value: filterCategoria,
            onChange: (e) =>
              setFilterCategoria(e.target.value as FilterCategoria),
            options: [
              { value: "all", label: "Todas" },
              ...categoriaFilterOptions,
            ],
          },
          {
            label: "Estoque",
            value: filterEstoque,
            onChange: (e) => setFilterEstoque(e.target.value as FilterEstoque),
            options: [
              { value: "all", label: "Todos" },
              { value: "baixo", label: "Baixo (< 50)" },
              { value: "medio", label: "Médio (50-199)" },
              { value: "alto", label: "Alto (≥ 200)" },
            ],
          },
        ]}
        onClearFilters={clearFilters}
      />

      <div className="produtos-table-container">
        <table className="produtos-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Preço</th>
              <th>Medida</th>
              <th>Estoque</th>
              <th>Reserva</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProdutos.map((produto) => (
              <tr key={produto.id}>
                <td className="nome-cell" data-label="Nome">
                  <strong>{produto.nome}</strong>
                </td>
                <td className="categoria-cell" data-label="Categoria">
                  <span className={`category-tag category-${produto.categoria || "sem-categoria"}`}>
                    {getCategoriaLabel(produto.categoria)}
                  </span>
                </td>
                <td className="numeric-cell" data-label="Preço">
                  R$ {produto.preco.toFixed(2)}
                </td>
                <td data-label="Medida">{produto.medida}</td>
                <td className="numeric-cell" data-label="Estoque">
                  {produto.estoque}
                </td>
                <td className="reserva-cell" data-label="Reserva">
                  {produto.disponivel_reserva ? (
                    <div className="reserva-info-inline">
                      <span className="disponivel">Disponível</span>
                      <span className="limite">
                        Limite: {produto.limite_reserva || 2}
                      </span>
                      {produto.quantidade_reserva_disponivel !== undefined &&
                        produto.quantidade_reserva_disponivel > 0 && (
                          <span>
                            Disponível: {produto.quantidade_reserva_disponivel}
                          </span>
                        )}
                      {produto.total_reservas_antecipadas !== undefined &&
                        produto.total_reservas_antecipadas > 0 && (
                          <span className="reservas-total">
                            {produto.total_reservas_antecipadas} reserva
                            {produto.total_reservas_antecipadas > 1 ? "s" : ""}
                          </span>
                        )}
                    </div>
                  ) : (
                    <span className="nao-disponivel">Não disponível</span>
                  )}
                </td>
                <td className="actions-cell" data-label="Ações">
                  <div className="produto-actions">
                    <Button
                      onClick={() => abrirPopupReservas(produto)}
                      color="#9333ea"
                      className="small"
                    >
                      <FaQrcode /> Reservas
                    </Button>
                    <Button
                      onClick={() => abrirPopupEditar(produto)}
                      color="var(--color-blue)"
                      className="small"
                    >
                      <FaPen /> Editar
                    </Button>
                    <Button
                      onClick={() => handleDeletar(produto.id)}
                      color="var(--color-red)"
                      className="small"
                    >
                      <FaTrash /> Excluir
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedProdutos.length === 0 && (
        <div className="empty-state">
          <FaBoxOpen size={64} />
          <p>
            {produtos.length === 0
              ? "Nenhum produto cadastrado"
              : "Nenhum produto encontrado com os filtros aplicados"}
          </p>
        </div>
      )}

      {filteredAndSortedProdutos.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filteredAndSortedProdutos.length}
        />
      )}

      {showPopup && selectedProduto && (
        <Popup
          visible={showPopup}
          setVisible={setShowPopup}
          id="popup-produto-admin"
          icon={<FaBoxOpen />}
          title="Editar Produto"
        >
          <form onSubmit={handleSubmit} className="produto-form">
            <Input
              id="nome"
              type="text"
              label="Nome do Produto"
              value={formData.nome}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
              placeholder="Ex: Bolo"
              required
            />

            <Input
              id="preco"
              type="number"
              label="Preço"
              value={formData.preco}
              onChange={(e) =>
                setFormData({ ...formData, preco: e.target.value })
              }
              placeholder="0.00"
              step={0.01}
              min={0}
              required
            />

            <Input
              id="medida"
              type="select"
              label="Medida"
              value={formData.medida}
              onChange={(e) =>
                setFormData({ ...formData, medida: e.target.value })
              }
              options={MEDIDA_CHOICES.map(([value, content]) => ({
                value,
                content,
              }))}
              placeholder="Selecione a medida"
              required
            />

            <Input
              id="categoria"
              type="select"
              label="Categoria"
              value={formData.categoria}
              onChange={(e) =>
                setFormData({ ...formData, categoria: e.target.value })
              }
              options={CATEGORIA_CHOICES.map(([value, content]) => ({
                value,
                content,
              }))}
              placeholder="Selecione a categoria"
              required
            />

            <Input
              id="estoque"
              type="intenger"
              inputMode="numeric"
              label="Estoque"
              value={formData.estoque}
              onChange={(e) => {
                // Permite campo vazio e apenas números
                const value = e.target.value.replace(/\D/g, "");
                setFormData({ ...formData, estoque: value });
              }}
              placeholder="Ex: 0"
              required
              min={0}
            />

            <div className="form-actions">
              <Button
                type="button"
                onClick={() => setShowPopup(false)}
                color="var(--color-gray)"
              >
                Cancelar
              </Button>
              <Button type="submit" color="var(--color-green)">
                Salvar
              </Button>
            </div>
          </form>
        </Popup>
      )}

      {showPopupNovo && caixas && caixas.length > 0 && (
        <PopupNovoProduto
          visible={showPopupNovo}
          setVisible={setShowPopupNovo}
          onCreate={() => handleCreateProduto()}
        />
      )}

      {showPopupReservas && produtoReservas && (
        <PopupReservasProduto
          visible={showPopupReservas}
          setVisible={setShowPopupReservas}
          produto={produtoReservas}
          onUpdate={carregarProdutos}
        />
      )}
    </div>
  );
}
