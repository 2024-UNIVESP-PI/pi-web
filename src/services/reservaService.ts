import api from ".";
import { Produto } from "./produtoService";

// TYPES
export type QRCodeReserva = {
  id: number;
  codigo: string;
  descricao: string;
  data_expiracao?: string;
  ativo: boolean;
  data_criacao: string;
  produtos_disponiveis?: Produto[];
  produtos_ids?: number[];
  qr_image?: string;
};

export type NovaQRCodeReserva = {
  codigo?: string;
  descricao?: string;
  produtos_ids?: number[];
  dias_expiracao?: number;
};

export type ProdutoReserva = {
  id: number;
  nome: string;
  preco: number;
  limite_reserva: number;
  disponivel: number;
  categoria: string;
};

export type QRCodeProdutosResponse = {
  qr_code: string;
  descricao: string;
  data_expiracao?: string;
  produtos: ProdutoReserva[];
};

export type ItemReserva = {
  produto_id: number;
  quantidade: number;
};

export type NovaReservaPublica = {
  nome_completo: string;
  cpf: string;
  produtos: ItemReserva[];
  qr_code?: string;
};

export type ReservaPublicaItem = {
  id: number;
  produto: string;
  quantidade: number;
  preco_unitario: number;
  preco_total: number;
};

export type ReservaPublicaResponse = {
  reservas: ReservaPublicaItem[];
  total: number;
  nome_completo: string;
  cpf: string;
  data_reserva: string;
};

// GET
export const getQRCodesReserva = async (): Promise<QRCodeReserva[]> => {
  const response = await api.get("movimentacao/qr-codes-reserva/");
  return response.data;
};

export const getQRCodeReserva = async (id: number): Promise<QRCodeReserva> => {
  const response = await api.get(`movimentacao/qr-codes-reserva/${id}/`);
  return response.data;
};

export const getProdutosReserva = async (
  qrCode: string
): Promise<QRCodeProdutosResponse> => {
  const response = await api.get(
    `movimentacao/reservas-publicas/${qrCode}/produtos/`
  );
  return response.data;
};

export type ReservaPorCPF = {
  id: number;
  produto: string;
  quantidade: number;
  preco_total: number;
  status: string;
  data_reserva: string;
};

export const getReservasPorCPF = async (
  cpf: string
): Promise<{ reservas: ReservaPorCPF[]; total: number }> => {
  const response = await api.get("movimentacao/reservas-publicas/por-cpf/", {
    params: { cpf },
  });
  return response.data;
};

// GET RESERVAS PENDENTES POR CPF (para vincular a ficha)
export type ReservaPendente = {
  id: number;
  produto: string;
  produto_id: number;
  quantidade: number;
  preco_unitario: number;
  preco_total: number;
  data_reserva: string;
};

export type ReservasPendentesResponse = {
  nome_completo: string;
  cpf: string;
  itens: ReservaPendente[];
  valor_total: number;
  quantidade_itens: number;
};

export const getReservasPendentesPorCPF = async (
  cpf: string
): Promise<ReservasPendentesResponse> => {
  const response = await api.get("movimentacao/reservas/pendentes_por_cpf/", {
    params: { cpf },
  });
  return response.data;
};

// POST
export const criarQRCodeReserva = async (
  data: NovaQRCodeReserva
): Promise<QRCodeReserva> => {
  const response = await api.post(
    "movimentacao/qr-codes-reserva/criar_qr_code/",
    data
  );
  return response.data;
};

export const criarReservaPublica = async (
  data: NovaReservaPublica
): Promise<ReservaPublicaResponse> => {
  const response = await api.post(
    "movimentacao/reservas-publicas/criar/",
    data
  );
  return response.data;
};

export const gerarPDFQRCode = async (id: number): Promise<Blob> => {
  const response = await api.post(
    `movimentacao/qr-codes-reserva/${id}/gerar_pdf/`,
    {},
    { responseType: "blob" }
  );
  return response.data;
};

// PUT/PATCH
export const atualizarQRCodeReserva = async (
  id: number,
  data: Partial<QRCodeReserva>
): Promise<QRCodeReserva> => {
  const response = await api.patch(
    `movimentacao/qr-codes-reserva/${id}/`,
    data
  );
  return response.data;
};

// GET RESERVAS POR QR CODE
export type ReservaDetalhada = {
  id: number;
  nome_completo: string;
  cpf: string;
  produto: string;
  quantidade: number;
  preco_unitario: number;
  preco_total: number;
  status: string;
  data_reserva: string;
};

export const getReservasPorQRCode = async (
  id: number
): Promise<ReservaDetalhada[]> => {
  const response = await api.get(
    `movimentacao/qr-codes-reserva/${id}/reservas/`
  );
  return response.data;
};

// DELETE
export const deletarQRCodeReserva = async (id: number): Promise<void> => {
  await api.delete(`movimentacao/qr-codes-reserva/${id}/`);
};

const reservaService = {
  getQRCodesReserva,
  getQRCodeReserva,
  getProdutosReserva,
  getReservasPorCPF,
  getReservasPendentesPorCPF,
  getReservasPorQRCode,
  criarQRCodeReserva,
  criarReservaPublica,
  gerarPDFQRCode,
  atualizarQRCodeReserva,
  deletarQRCodeReserva,
};

export default reservaService;
