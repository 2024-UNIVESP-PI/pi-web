import { useState, useEffect } from "react";
import {
  FaQrcode,
  FaPlus,
  FaDownload,
  FaTrash,
  FaPen,
  FaEye,
} from "react-icons/fa6";
import reservaService, {
  QRCodeReserva,
  ReservaDetalhada,
} from "../../services/reservaService";
import produtoService, { Produto } from "../../services/produtoService";
import PageTitle from "../../components/PageTitle";
import Button from "../../components/Button";
import Popup from "../../components/Popup";
import Input from "../../components/Input";
import "./styles.scss";

export default function ReservasAdminPage() {
  const [qrCodes, setQrCodes] = useState<QRCodeReserva[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedQRCode, setSelectedQRCode] = useState<QRCodeReserva | null>(
    null
  );
  const [reservasDetalhadas, setReservasDetalhadas] = useState<
    Record<number, ReservaDetalhada[]>
  >({});
  const [loadingReservas, setLoadingReservas] = useState<
    Record<number, boolean>
  >({});
  const [reservasVisiveis, setReservasVisiveis] = useState<
    Record<number, boolean>
  >({});
  const [formData, setFormData] = useState({
    codigo: "",
    descricao: "",
    produtos_ids: [] as number[],
    dias_expiracao: 7,
  });

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    try {
      setLoading(true);
      const [qrCodesData, produtosData] = await Promise.all([
        reservaService.getQRCodesReserva(),
        produtoService.getProdutos(),
      ]);
      setQrCodes(qrCodesData);
      setProdutos(produtosData.data);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }

  function abrirPopupCriar() {
    setSelectedQRCode(null);
    setFormData({
      codigo: "",
      descricao: "",
      produtos_ids: [],
      dias_expiracao: 7,
    });
    setShowPopup(true);
  }

  function abrirPopupEditar(qrCode: QRCodeReserva) {
    setSelectedQRCode(qrCode);
    setFormData({
      codigo: qrCode.codigo,
      descricao: qrCode.descricao,
      produtos_ids: qrCode.produtos_disponiveis?.map((p) => p.id) || [],
      dias_expiracao: qrCode.data_expiracao
        ? Math.ceil(
            (new Date(qrCode.data_expiracao).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 7,
    });
    setShowPopup(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (selectedQRCode) {
        // Editar
        await reservaService.atualizarQRCodeReserva(
          selectedQRCode.id,
          formData
        );
      } else {
        // Criar
        await reservaService.criarQRCodeReserva(formData);
      }
      await carregarDados();
      setShowPopup(false);
    } catch (error: unknown) {
      console.error("Erro ao salvar QR code:", error);
      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { error?: string } } }).response
              ?.data?.error
          : undefined;
      alert(errorMessage || "Erro ao salvar QR code");
    }
  }

  async function handleGerarPDF(id: number) {
    try {
      const blob = await reservaService.gerarPDFQRCode(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qr_code_reserva_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF");
    }
  }

  async function handleDeletar(id: number) {
    if (!confirm("Tem certeza que deseja excluir este QR code?")) return;

    try {
      await reservaService.deletarQRCodeReserva(id);
      await carregarDados();
    } catch (error) {
      console.error("Erro ao deletar QR code:", error);
      alert("Erro ao deletar QR code");
    }
  }

  async function toggleReservas(qrCode: QRCodeReserva) {
    const qrCodeId = qrCode.id;
    const estaVisivel = reservasVisiveis[qrCodeId];

    // Se já está visível, apenas oculta
    if (estaVisivel) {
      setReservasVisiveis((prev) => ({ ...prev, [qrCodeId]: false }));
      return;
    }

    // Se não está visível e já tem dados carregados, apenas mostra
    if (reservasDetalhadas[qrCodeId]) {
      setReservasVisiveis((prev) => ({ ...prev, [qrCodeId]: true }));
      return;
    }

    // Se não tem dados, carrega
    setLoadingReservas((prev) => ({ ...prev, [qrCodeId]: true }));
    setReservasVisiveis((prev) => ({ ...prev, [qrCodeId]: true }));

    try {
      const reservas = await reservaService.getReservasPorQRCode(qrCodeId);
      setReservasDetalhadas((prev) => ({ ...prev, [qrCodeId]: reservas }));
    } catch (error) {
      console.error("Erro ao carregar reservas:", error);
      alert("Erro ao carregar reservas");
      setReservasDetalhadas((prev) => ({ ...prev, [qrCodeId]: [] }));
      setReservasVisiveis((prev) => ({ ...prev, [qrCodeId]: false }));
    } finally {
      setLoadingReservas((prev) => ({ ...prev, [qrCodeId]: false }));
    }
  }

  function formatarData(data: string) {
    return new Date(data).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function formatarCPF(cpf: string) {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }

  function toggleProduto(id: number) {
    setFormData((prev) => {
      const ids = prev.produtos_ids.includes(id)
        ? prev.produtos_ids.filter((pid) => pid !== id)
        : [...prev.produtos_ids, id];
      return { ...prev, produtos_ids: ids };
    });
  }

  if (loading) {
    return (
      <div className="reservas-admin-page">
        <PageTitle title="Carregando..." subtitle="Aguarde..." />
      </div>
    );
  }

  return (
    <div className="reservas-admin-page">
      <PageTitle
        title="Gerenciar Reservas Antecipadas"
        subtitle="Crie e gerencie QR codes para reservas antecipadas"
      />

      <div className="actions-bar">
        <Button onClick={abrirPopupCriar} color="var(--color-blue)">
          <FaPlus /> Criar QR Code
        </Button>
      </div>

      <div className="qr-codes-container">
        {qrCodes.map((qrCode) => (
          <div key={qrCode.id} className="qr-code-wrapper">
            <div className="qr-code-card">
              <div className="qr-code-header">
                <div className="qr-code-info">
                  <h3>{qrCode.descricao || qrCode.codigo}</h3>
                  <p className="codigo">Código: {qrCode.codigo}</p>
                  {qrCode.data_expiracao && (
                    <p className="expiracao">
                      Expira em:{" "}
                      {new Date(qrCode.data_expiracao).toLocaleString("pt-BR")}
                    </p>
                  )}
                  <p className={`status ${qrCode.ativo ? "ativo" : "inativo"}`}>
                    {qrCode.ativo ? "✓ Ativo" : "✗ Inativo"}
                  </p>
                </div>
                {qrCode.qr_image && (
                  <div className="qr-code-image">
                    <img src={qrCode.qr_image} alt="QR Code" />
                  </div>
                )}
              </div>

              <div className="qr-code-produtos">
                <strong>Produtos disponíveis:</strong>
                <ul>
                  {qrCode.produtos_disponiveis?.map((produto) => (
                    <li key={produto.id}>{produto.nome}</li>
                  ))}
                  {(!qrCode.produtos_disponiveis ||
                    qrCode.produtos_disponiveis.length === 0) && (
                    <li className="sem-produtos">Nenhum produto selecionado</li>
                  )}
                </ul>
              </div>

              <div className="qr-code-actions">
                <Button
                  onClick={() => toggleReservas(qrCode)}
                  color="var(--color-blue)"
                  className="small"
                >
                  <FaEye />{" "}
                  {reservasVisiveis[qrCode.id]
                    ? "Ocultar Reservas"
                    : "Ver Reservas"}
                </Button>
                <Button
                  onClick={() => handleGerarPDF(qrCode.id)}
                  color="var(--color-green)"
                  className="small"
                >
                  <FaDownload /> PDF
                </Button>
                <Button
                  onClick={() => abrirPopupEditar(qrCode)}
                  color="var(--color-blue)"
                  className="small"
                >
                  <FaPen /> Editar
                </Button>
                <Button
                  onClick={() => handleDeletar(qrCode.id)}
                  color="var(--color-red)"
                  className="small"
                >
                  <FaTrash /> Excluir
                </Button>
              </div>

              <div className="qr-code-url">
                <strong>URL:</strong>{" "}
                <code>
                  {window.location.origin}/reservas/{qrCode.codigo}
                </code>
              </div>
            </div>

            {reservasVisiveis[qrCode.id] && (
              <div className="reservas-table-container">
                {loadingReservas[qrCode.id] ? (
                  <p className="loading-reservas">Carregando reservas...</p>
                ) : reservasDetalhadas[qrCode.id] &&
                  reservasDetalhadas[qrCode.id].length > 0 ? (
                  <table className="reservas-table">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>CPF</th>
                        <th>Produto</th>
                        <th>Quantidade</th>
                        <th>Preço Unit.</th>
                        <th>Subtotal</th>
                        <th>Status</th>
                        <th>Data/Hora</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservasDetalhadas[qrCode.id].map((reserva) => (
                        <tr key={reserva.id}>
                          <td className="nome-cell">{reserva.nome_completo}</td>
                          <td className="cpf-cell">
                            {formatarCPF(reserva.cpf)}
                          </td>
                          <td className="produto-cell">{reserva.produto}</td>
                          <td className="quantidade-cell">
                            {reserva.quantidade}
                          </td>
                          <td className="preco-unit-cell">
                            R$ {reserva.preco_unitario.toFixed(2)}
                          </td>
                          <td className="subtotal-cell">
                            R$ {reserva.preco_total.toFixed(2)}
                          </td>
                          <td className="status-cell">
                            <span
                              className={`status-badge status-${reserva.status}`}
                            >
                              {reserva.status === "pendente"
                                ? "Pendente"
                                : reserva.status === "confirmada"
                                ? "Confirmada"
                                : reserva.status === "cancelada"
                                ? "Cancelada"
                                : "Finalizada"}
                            </span>
                          </td>
                          <td className="data-cell">
                            {formatarData(reserva.data_reserva)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={4} className="total-label">
                          <strong>Total Geral:</strong>
                        </td>
                        <td colSpan={4} className="total-value">
                          <strong>
                            R${" "}
                            {reservasDetalhadas[qrCode.id]
                              .reduce((sum, r) => sum + r.preco_total, 0)
                              .toFixed(2)}
                          </strong>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                ) : (
                  <p className="no-reservas">
                    Nenhuma reserva encontrada para este QR code.
                  </p>
                )}
              </div>
            )}
          </div>
        ))}

        {qrCodes.length === 0 && (
          <div className="empty-state">
            <FaQrcode size={64} />
            <p>Nenhum QR code criado ainda</p>
            <Button onClick={abrirPopupCriar} color="var(--color-blue)">
              Criar Primeiro QR Code
            </Button>
          </div>
        )}
      </div>

      {showPopup && (
        <Popup
          visible={showPopup}
          setVisible={setShowPopup}
          id="popup-qr-code"
          icon={<FaQrcode />}
          title={selectedQRCode ? "Editar QR Code" : "Criar QR Code"}
        >
          <form onSubmit={handleSubmit} className="qr-code-form">
            <Input
              id="codigo"
              type="text"
              label="Código (deixe vazio para gerar automaticamente)"
              value={formData.codigo}
              onChange={(e) =>
                setFormData({ ...formData, codigo: e.target.value })
              }
              placeholder="Ex: RESERVA-FESTA-2024"
            />

            <Input
              id="descricao"
              type="text"
              label="Descrição"
              value={formData.descricao}
              onChange={(e) =>
                setFormData({ ...formData, descricao: e.target.value })
              }
              placeholder="Ex: Reserva Festa Junina 2024"
              required
            />

            <div className="form-group">
              <label htmlFor="dias_expiracao">Dias até expiração</label>
              <Input
                id="dias_expiracao"
                type="number"
                value={String(formData.dias_expiracao)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dias_expiracao: Number(e.target.value),
                  })
                }
                min={1}
                required
              />
            </div>

            <div className="form-group">
              <label>Produtos disponíveis para reserva</label>
              <div className="produtos-checklist">
                {produtos
                  .filter((p) => p.disponivel_reserva)
                  .map((produto) => (
                    <div key={produto.id} className="produto-item">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.produtos_ids.includes(produto.id)}
                          onChange={() => toggleProduto(produto.id)}
                        />
                        <span className="produto-info">
                          <strong>{produto.nome}</strong>
                          <span className="produto-details">
                            R$ {produto.preco.toFixed(2)} | Estoque:{" "}
                            {produto.estoque} | Limite:{" "}
                            {produto.limite_reserva || 2} por pessoa
                            {produto.quantidade_reserva_disponivel !==
                              undefined &&
                              produto.quantidade_reserva_disponivel > 0 && (
                                <>
                                  {" "}
                                  | Disponível:{" "}
                                  {produto.quantidade_reserva_disponivel}
                                </>
                              )}
                          </span>
                        </span>
                      </label>
                    </div>
                  ))}
                {produtos.filter((p) => p.disponivel_reserva).length === 0 && (
                  <p className="sem-produtos-disponiveis">
                    Nenhum produto marcado como disponível para reserva. Marque
                    produtos como "Disponível para reserva antecipada" na página
                    de produtos.
                  </p>
                )}
              </div>
            </div>

            <div className="form-actions">
              <Button
                type="button"
                onClick={() => setShowPopup(false)}
                color="var(--color-grey)"
              >
                Cancelar
              </Button>
              <Button type="submit" color="var(--color-green)">
                {selectedQRCode ? "Salvar" : "Criar"}
              </Button>
            </div>
          </form>
        </Popup>
      )}
    </div>
  );
}
