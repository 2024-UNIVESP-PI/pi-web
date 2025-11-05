import { useState, useEffect, useMemo } from "react";
import {
  FaBoxOpen,
  FaPlus,
  FaTrash,
  FaPen,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa6";
import caixaService, { Caixa, NovoCaixa } from "../../services/caixaService";
import PageTitle from "../../components/PageTitle";
import Button from "../../components/Button";
import Popup from "../../components/Popup";
import Input from "../../components/Input";
import AdminFilters from "../../components/AdminFilters";
import Pagination from "../../components/Pagination";
import "./styles.scss";

type SortOption = "nome" | "nome_desc" | "usuario" | "usuario_desc";

export default function CaixasAdminPage() {
  const [caixas, setCaixas] = useState<(Caixa & { senha?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedCaixa, setSelectedCaixa] = useState<Caixa | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("nome");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [showPasswords, setShowPasswords] = useState<{
    [key: number]: boolean;
  }>({});
  const [showPasswordConfirm, setShowPasswordConfirm] = useState<{
    [key: number]: boolean;
  }>({});
  const [formData, setFormData] = useState<NovoCaixa>({
    nome: "",
    usuario: "",
    senha: "",
  });

  useEffect(() => {
    carregarCaixas();
  }, []);

  async function carregarCaixas() {
    try {
      setLoading(true);
      const response = await caixaService.getCaixas();
      // Carregar senhas individualmente
      const caixasComSenhas = await Promise.all(
        response.data.map(async (caixa: Caixa) => {
          try {
            const caixaDetalhe = await caixaService.getCaixa(caixa.id);
            return { ...caixa, senha: caixaDetalhe.data.senha };
          } catch {
            return { ...caixa, senha: undefined };
          }
        })
      );
      setCaixas(caixasComSenhas);
    } catch (error) {
      console.error("Erro ao carregar caixas:", error);
      alert("Erro ao carregar caixas");
    } finally {
      setLoading(false);
    }
  }

  function abrirPopupCriar() {
    setSelectedCaixa(null);
    setFormData({
      nome: "",
      usuario: "",
      senha: "",
    });
    setShowPopup(true);
  }

  function abrirPopupEditar(caixa: Caixa) {
    setSelectedCaixa(caixa);
    setFormData({
      nome: caixa.nome,
      usuario: caixa.usuario,
      senha: "", // Não preenche senha para edição
    });
    setShowPopup(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.nome.trim() || !formData.usuario.trim()) {
      alert("Nome e usuário são obrigatórios");
      return;
    }

    if (!selectedCaixa && !formData.senha.trim()) {
      alert("Senha é obrigatória ao criar caixa");
      return;
    }

    try {
      if (selectedCaixa) {
        // Editar
        const updateData: Partial<NovoCaixa> = {
          nome: formData.nome,
          usuario: formData.usuario,
        };
        if (formData.senha.trim()) {
          updateData.senha = formData.senha;
        }
        await caixaService.updateCaixa(selectedCaixa.id, updateData);
      } else {
        // Criar
        await caixaService.createCaixa(formData);
      }
      await carregarCaixas();
      setShowPopup(false);
    } catch (error: unknown) {
      console.error("Erro ao salvar caixa:", error);
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { error?: string } } }).response
              ?.data?.error
          : undefined;
      alert(errorMessage || "Erro ao salvar caixa");
    }
  }

  async function handleDeletar(id: number) {
    if (!confirm("Tem certeza que deseja excluir este caixa?")) return;

    try {
      await caixaService.deleteCaixa(id);
      await carregarCaixas();
    } catch (error) {
      console.error("Erro ao deletar caixa:", error);
      alert("Erro ao deletar caixa");
    }
  }

  function togglePassword(id: number) {
    // Se ainda não mostrou, pede confirmação
    if (!showPasswords[id] && !showPasswordConfirm[id]) {
      setShowPasswordConfirm((prev) => ({
        ...prev,
        [id]: true,
      }));
      return;
    }

    // Se confirmou, mostra/esconde
    setShowPasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
    setShowPasswordConfirm((prev) => ({
      ...prev,
      [id]: false,
    }));
  }

  function confirmShowPassword(id: number) {
    setShowPasswords((prev) => ({
      ...prev,
      [id]: true,
    }));
    setShowPasswordConfirm((prev) => ({
      ...prev,
      [id]: false,
    }));
  }

  function cancelShowPassword(id: number) {
    setShowPasswordConfirm((prev) => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  }

  // Filtros e ordenação
  const filteredAndSortedCaixas = useMemo(() => {
    let filtered = [...caixas];

    // Busca por nome ou usuário
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (c) =>
          c.nome.toLowerCase().includes(search) ||
          c.usuario?.toLowerCase().includes(search)
      );
    }

    // Ordenação
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "nome":
          return a.nome.localeCompare(b.nome);
        case "nome_desc":
          return b.nome.localeCompare(a.nome);
        case "usuario":
          return (a.usuario || "").localeCompare(b.usuario || "");
        case "usuario_desc":
          return (b.usuario || "").localeCompare(a.usuario || "");
        default:
          return 0;
      }
    });

    return filtered;
  }, [caixas, searchTerm, sortBy]);

  // Paginação
  const paginatedCaixas = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedCaixas.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedCaixas, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedCaixas.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCurrentPage(1);
  }

  function clearFilters() {
    setSearchTerm("");
    setSortBy("nome");
    setCurrentPage(1);
  }

  if (loading) {
    return (
      <div className="caixas-admin-page">
        <PageTitle title="Carregando..." subtitle="Aguarde..." />
      </div>
    );
  }

  return (
    <div className="caixas-admin-page">
      <div className="page-header">
        <PageTitle
          title="Gerenciar Caixas"
          subtitle="Crie e gerencie caixas com usuário e senha"
        />
        <Button
          onClick={abrirPopupCriar}
          color="var(--color-green)"
          className="new-caixa-button"
        >
          <FaPlus /> Novo Caixa
        </Button>
      </div>

      <AdminFilters
        searchValue={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        onSearchSubmit={handleSearchSubmit}
        searchPlaceholder="Buscar por nome ou usuário..."
        sortOptions={[
          { value: "nome", label: "Nome (A-Z)" },
          { value: "nome_desc", label: "Nome (Z-A)" },
          { value: "usuario", label: "Usuário (A-Z)" },
          { value: "usuario_desc", label: "Usuário (Z-A)" },
        ]}
        sortValue={sortBy}
        onSortChange={(e) => setSortBy(e.target.value as SortOption)}
        onClearFilters={clearFilters}
      />

      <div className="caixas-table-container">
        <table className="caixas-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Usuário</th>
              <th>Senha</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCaixas.map((caixa) => (
              <tr key={caixa.id}>
                <td className="nome-cell">
                  <strong>{caixa.nome}</strong>
                </td>
                <td>{caixa.usuario}</td>
                <td className="senha-cell">
                  {showPasswordConfirm[caixa.id] ? (
                    <div className="password-confirm-inline">
                      <p>Deseja exibir a senha?</p>
                      <div className="confirm-buttons">
                        <Button
                          onClick={() => confirmShowPassword(caixa.id)}
                          color="var(--color-green)"
                          className="small"
                        >
                          Sim
                        </Button>
                        <Button
                          onClick={() => cancelShowPassword(caixa.id)}
                          color="var(--color-gray)"
                          className="small"
                        >
                          Não
                        </Button>
                      </div>
                    </div>
                  ) : showPasswords[caixa.id] && caixa.senha ? (
                    <div className="senha-visible-inline">
                      <span className="senha-value">{caixa.senha}</span>
                      <Button
                        onClick={() => togglePassword(caixa.id)}
                        color="var(--color-gray)"
                        className="small"
                      >
                        <FaEyeSlash /> Ocultar
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => togglePassword(caixa.id)}
                      color="var(--color-blue)"
                      className="small"
                    >
                      <FaEye /> Mostrar Senha
                    </Button>
                  )}
                </td>
                <td className="actions-cell">
                  <div className="caixa-actions">
                    <Button
                      onClick={() => abrirPopupEditar(caixa)}
                      color="var(--color-blue)"
                      className="small"
                    >
                      <FaPen /> Editar
                    </Button>
                    <Button
                      onClick={() => handleDeletar(caixa.id)}
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

      {filteredAndSortedCaixas.length === 0 && (
        <div className="empty-state">
          <FaBoxOpen size={64} />
          <p>
            {caixas.length === 0
              ? "Nenhum caixa criado ainda"
              : "Nenhum caixa encontrado com os filtros aplicados"}
          </p>
          {caixas.length === 0 && (
            <Button onClick={abrirPopupCriar} color="var(--color-blue)">
              Criar Primeiro Caixa
            </Button>
          )}
        </div>
      )}

      {filteredAndSortedCaixas.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filteredAndSortedCaixas.length}
        />
      )}

      {showPopup && (
        <Popup
          visible={showPopup}
          setVisible={setShowPopup}
          id="popup-caixa"
          icon={<FaBoxOpen />}
          title={selectedCaixa ? "Editar Caixa" : "Criar Caixa"}
        >
          <form onSubmit={handleSubmit} className="caixa-form">
            <Input
              id="nome"
              type="text"
              label="Nome do Caixa"
              value={formData.nome}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
              placeholder="Ex: Caixa 1"
              required
            />

            <Input
              id="usuario"
              type="text"
              label="Usuário"
              value={formData.usuario}
              onChange={(e) =>
                setFormData({ ...formData, usuario: e.target.value })
              }
              placeholder="Ex: caixa1"
              required
            />

            <Input
              id="senha"
              type="password"
              label={
                selectedCaixa ? "Nova Senha (deixe vazio para manter)" : "Senha"
              }
              value={formData.senha}
              onChange={(e) =>
                setFormData({ ...formData, senha: e.target.value })
              }
              placeholder="Digite a senha"
              required={!selectedCaixa}
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
                {selectedCaixa ? "Salvar" : "Criar"}
              </Button>
            </div>
          </form>
        </Popup>
      )}
    </div>
  );
}
