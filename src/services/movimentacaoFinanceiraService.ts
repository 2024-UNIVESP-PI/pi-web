import api from ".";

export type MovimentacaoFinanceiraTipo = "recarga" | "venda";
export type MovimentacaoFinanceiraDirecao = "entrada" | "saida";

export type MovimentacaoFinanceira = {
  id: string;
  tipo: MovimentacaoFinanceiraTipo;
  data: string;
  ficha_id: number;
  ficha_numero: number;
  caixa_id: number;
  caixa_nome: string;
  produto_nome?: string | null;
  descricao: string;
  quantidade?: number | null;
  valor: number;
  direcao: MovimentacaoFinanceiraDirecao;
};

export type MovimentacoesFinanceirasSummary = {
  entradas: number;
  saidas: number;
  receita_reconhecida: number;
  saldo_movimentado: number;
  saldo_fichas: number;
  caixa_disponivel: number;
  diferenca_conciliacao: number;
  total_movimentacoes: number;
};

export type MovimentacoesFinanceirasResponse = {
  summary: MovimentacoesFinanceirasSummary;
  movimentacoes: MovimentacaoFinanceira[];
};

export const getMovimentacoesFinanceiras = async () =>
  await api.get<MovimentacoesFinanceirasResponse>(
    "movimentacao/movimentacoes-financeiras/"
  );

const movimentacaoFinanceiraService = {
  getMovimentacoesFinanceiras,
};

export default movimentacaoFinanceiraService;
