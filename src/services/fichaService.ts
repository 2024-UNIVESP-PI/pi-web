import api from ".";

// TYPE
export type NovaFicha = {
  numero: number;
  saldo: number;
  cpf_reserva?: string;
  caixa_id?: number;
};
export type Ficha = NovaFicha & {
  id: number;
  is_active?: boolean;
  deleted_at?: string;
  deleted_by_caixa_nome?: string;
};

// POST
export const postFicha = async (nF: NovaFicha) =>
  await api.post("movimentacao/fichas/", nF);
export const postRecarga = async (
  id: number,
  recarga: number,
  caixaId?: number,
  produtoId?: number
) =>
  await api.post(`movimentacao/fichas/${id}/recarga/`, {
    valor: recarga,
    caixa_id: caixaId,
    produto_id: produtoId,
  });

// GET
export const getFichas = async () => await api.get("movimentacao/fichas/");
export const getFicha = async (id: number) =>
  await api.get(`movimentacao/fichas/${id}/`);

// PUT PATCH

// DELETE
export const deleteFicha = async (
  id: number,
  senhaAdmin: string,
  caixaId?: number
) =>
  await api.delete(`movimentacao/fichas/${id}/`, {
    data: { senha_admin: senhaAdmin, caixa_id: caixaId },
  });

// GET HISTORICO
export const getFichaHistorico = async (id: number) =>
  await api.get(`movimentacao/fichas/${id}/historico/`);

const fichaService = {
  postFicha,
  postRecarga,
  getFichas,
  getFicha,
  deleteFicha,
  getFichaHistorico,
};
export default fichaService;
