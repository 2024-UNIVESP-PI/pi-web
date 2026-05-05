import api from ".";

// TYPE
export type Caixa = {
  id: number;
  nome: string;
  usuario: string;
};

export type NovoCaixa = {
  nome: string;
  usuario: string;
  senha: string;
};

// POST
export const createCaixa = async (data: NovoCaixa) =>
  await api.post("movimentacao/caixas/", data);

// GET
export const getCaixas = async () => await api.get("movimentacao/caixas/");
export const getCaixa = async (id: number) =>
  await api.get(`movimentacao/caixas/${id}/`);

// PUT PATCH
export const updateCaixa = async (id: number, data: Partial<NovoCaixa>) =>
  await api.patch(`movimentacao/caixas/${id}/`, data);

// DELETE
export const deleteCaixa = async (id: number) =>
  await api.delete(`movimentacao/caixas/${id}/`);

// LOGIN
export type LoginCaixaData = {
  usuario: string;
  senha: string;
};

export const loginCaixa = async (data: LoginCaixaData) =>
  await api.post("movimentacao/caixas/login/", data);

const caixaService = {
  createCaixa,
  getCaixas,
  getCaixa,
  updateCaixa,
  deleteCaixa,
  loginCaixa,
};

export default caixaService;
